// Visitor-facing dynamic routes. Everything else is served from static assets.
import { Hono, type Context } from 'hono';
import type { AppEnv, Env } from '../env';
import { now, sha256 } from '../lib/util';
import { notifyOwner } from '../lib/email';

const pub = new Hono<AppEnv>();
// Timestamps are stored as ISO strings, so compare against ISO strings.
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const PDF_NAME = 'Mohammad_Zaki_Jariwala_Resume.pdf';

export async function notFound(c: Context<AppEnv>) {
  const page = await c.env.ASSETS.fetch(new URL('/404.html', c.req.url));
  return new Response(page.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function logEvent(c: Context<AppEnv>, kind: 'download' | 'view', fileId: string | null, token: string | null) {
  const cf = (c.req.raw as unknown as { cf?: { country?: string } }).cf;
  c.executionCtx.waitUntil(
    c.env.DB.prepare('INSERT INTO resume_events (token, file_id, kind, at, country, ua) VALUES (?,?,?,?,?,?)')
      .bind(token, fileId, kind, now(), cf?.country ?? null, (c.req.header('user-agent') ?? '').slice(0, 200)).run(),
  );
}

async function streamPdf(env: Env, r2Key: string) {
  const obj = await env.BUCKET.get(r2Key);
  if (!obj) return null;
  return new Response(obj.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="${PDF_NAME}"`,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}

// Main résumé. Falls back to the copy shipped with the site until one is uploaded in admin.
pub.get('/resume.pdf', async (c) => {
  const main = await c.env.DB.prepare('SELECT id, r2_key FROM resume_files WHERE is_main = 1').first<{ id: string; r2_key: string }>();
  logEvent(c, 'download', main?.id ?? null, null);
  if (main) {
    const res = await streamPdf(c.env, main.r2_key);
    if (res) return res;
  }
  const fallback = await c.env.ASSETS.fetch(new URL('/resume-fallback.pdf', c.req.url));
  if (!fallback.ok) return notFound(c);
  return new Response(fallback.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${PDF_NAME}"` } });
});

// Tracked résumé link for one application.
pub.get('/r/:token', async (c) => {
  const token = c.req.param('token');
  const link = await c.env.DB.prepare(
    `SELECT l.token, l.recipient, l.revoked_at, f.id AS file_id, f.r2_key, f.label
       FROM resume_links l JOIN resume_files f ON f.id = l.file_id WHERE l.token = ?`,
  ).bind(token).first<{ token: string; recipient: string; revoked_at: string | null; file_id: string; r2_key: string; label: string }>();
  if (!link || link.revoked_at) return notFound(c);

  const recent = await c.env.DB.prepare(
    'SELECT COUNT(*) AS n FROM resume_events WHERE token = ? AND at > ?',
  ).bind(token, ago(86_400_000)).first<{ n: number }>();
  logEvent(c, 'view', link.file_id, token);
  if (!recent?.n) {
    c.executionCtx.waitUntil(notifyOwner(c.env, `Resume opened: ${link.recipient}`,
      `${link.recipient} opened your "${link.label}" résumé link.\n\n${c.env.SITE_URL}/admin/resume`));
  }
  return (await streamPdf(c.env, link.r2_key)) ?? notFound(c);
});

pub.get('/media/:slug/:file', async (c) => {
  const obj = await c.env.BUCKET.get(`media/${c.req.param('slug')}/${c.req.param('file')}`);
  if (!obj) return notFound(c);
  return new Response(obj.body, {
    headers: { 'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' },
  });
});

// `/work/*` in run_worker_first also catches the index; it has no gate, serve it as built.
pub.get('/work/', (c) => c.env.ASSETS.fetch(c.req.raw));

// Visibility gate: a project hidden in admin 404s immediately, before the rebuild lands.
pub.get('/work/:slug/*', gate);
pub.get('/work/:slug', gate);
async function gate(c: Context<AppEnv>) {
  const slug = c.req.param('slug');
  const row = await c.env.DB.prepare('SELECT publish, visible, deep_dive, source_missing FROM projects WHERE slug = ?')
    .bind(slug).first<{ publish: number; visible: number; deep_dive: number; source_missing: number }>();
  if (row && (!row.publish || !row.visible || row.source_missing)) return notFound(c);
  if (row && !row.deep_dive && /\/deep-dive\/?$/.test(new URL(c.req.url).pathname)) return notFound(c);
  const res = await c.env.ASSETS.fetch(c.req.raw);
  return res.status === 404 ? notFound(c) : res;
}

// Contact form. Works without JavaScript: posts, then redirects back with a status.
pub.post('/api/contact', async (c) => {
  const back = (status: string) => c.redirect(`/contact/?status=${status}#form`, 303);
  const form = await c.req.parseBody();
  const field = (k: string) => (typeof form[k] === 'string' ? (form[k] as string).trim() : '');
  const name = field('name');
  const email = field('email');
  const message = field('message');
  if (field('website')) return back('sent'); // honeypot: pretend success
  if (!name || name.length > 100 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length > 200 || message.length < 10 || message.length > 5000) {
    return back('invalid');
  }

  const ip = c.req.header('cf-connecting-ip') ?? '';
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: c.env.TURNSTILE_SECRET ?? '', response: field('cf-turnstile-response'), remoteip: ip }),
  }).then((r) => r.json<{ success: boolean }>()).catch(() => ({ success: false }));
  if (!verify.success) return back('challenge');

  const ipHash = await sha256(`${c.env.IP_SALT ?? ''}:${ip}`);
  const recent = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ? AND at > ?')
    .bind(ipHash, ago(3_600_000)).first<{ n: number }>();
  if ((recent?.n ?? 0) >= 3) return back('limited');

  await c.env.DB.prepare('INSERT INTO messages (name, email, body, at, ip_hash) VALUES (?,?,?,?,?)')
    .bind(name, email, message, now(), ipHash).run();
  c.executionCtx.waitUntil(notifyOwner(c.env, `Portfolio message from ${name}`, `${name} <${email}>\n\n${message}\n\n${c.env.SITE_URL}/admin/inbox`, email));
  return back('sent');
});

export default pub;
