import type { Env } from './env';
import { json } from './lib/http';
import { coarseCountry, userAgentFamily } from './lib/ua';

/** Repeat opens inside this window count once. A PDF viewer re-requesting the
 *  file, or a reader flipping back to the tab, must not inflate the count. */
const DEDUPE_MINUTES = 10;

const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;

interface Resolved {
  application_id: number;
  slug: string;
  label: string;
  r2_key: string | null;
}

/** One row to write, at most, and never anything derived from an IP. */
async function recordOpen(env: Env, request: Request, applicationId: number): Promise<void> {
  const recent = await env.DB.prepare(
    `SELECT 1 FROM resume_opens
      WHERE application_id = ?1
        AND opened_at > datetime('now', ?2)
      LIMIT 1`,
  )
    .bind(applicationId, `-${DEDUPE_MINUTES} minutes`)
    .first();

  if (recent) return;

  await env.DB.prepare(
    `INSERT INTO resume_opens (application_id, coarse_country, user_agent_family)
     VALUES (?1, ?2, ?3)`,
  )
    .bind(
      applicationId,
      coarseCountry(request),
      userAgentFamily(request.headers.get('user-agent')),
    )
    .run();
}

function baseHeaders(filename: string): Headers {
  const h = new Headers();
  h.set('content-type', 'application/pdf');
  // `inline` so the browser's PDF viewer renders it instead of downloading.
  h.set('content-disposition', `inline; filename="${filename}"`);
  h.set('accept-ranges', 'bytes');
  // A token URL is per-application. Never let a shared cache hold it.
  h.set('cache-control', 'private, no-store');
  h.set('x-robots-tag', 'noindex, nofollow');
  return h;
}

/** Streams the repo-served variant straight through, Range header included. */
async function serveStatic(env: Env, request: Request, filename: string): Promise<Response> {
  const url = new URL(env.STATIC_RESUME_PATH, env.SITE_ORIGIN).href;
  const forwarded = new Headers();
  for (const k of ['range', 'if-range', 'if-none-match', 'if-modified-since']) {
    const v = request.headers.get(k);
    if (v) forwarded.set(k, v);
  }

  const upstream = await fetch(url, { headers: forwarded, method: request.method });
  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 304) {
    return json({ error: 'resume unavailable' }, 502);
  }

  const headers = baseHeaders(filename);
  for (const k of ['content-length', 'content-range', 'etag', 'last-modified']) {
    const v = upstream.headers.get(k);
    if (v) headers.set(k, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

/** Streams an R2-hosted variant, honouring Range and conditional requests. */
async function serveR2(env: Env, request: Request, key: string, filename: string): Promise<Response> {
  const object = await env.ASSETS.get(key, {
    range: request.headers,
    onlyIf: request.headers,
  });

  if (object === null) {
    // Registered in D1 but the file was never uploaded, or the key is wrong.
    return json({ error: 'resume file not found for this variant' }, 404);
  }

  const headers = baseHeaders(filename);
  object.writeHttpMetadata(headers);
  headers.set('content-type', 'application/pdf');
  headers.set('content-disposition', `inline; filename="${filename}"`);
  headers.set('etag', object.httpEtag);

  const body = (object as R2ObjectBody).body ?? null;
  if (body === null) {
    // onlyIf matched: the client already has it.
    return new Response(null, { status: 304, headers });
  }

  const range = object.range;
  if (range && request.headers.has('range')) {
    const size = object.size;
    // R2Range is a union of {offset,length?}, {offset?,length} and {suffix}.
    let start: number;
    let length: number;
    if ('suffix' in range) {
      length = Math.min(range.suffix, size);
      start = size - length;
    } else {
      start = range.offset ?? 0;
      length = range.length ?? size - start;
    }
    headers.set('content-range', `bytes ${start}-${start + length - 1}/${size}`);
    headers.set('content-length', String(length));
    return new Response(body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response(body, { status: 200, headers });
}

export async function handleResume(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  token: string,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'method not allowed' }, 405);
  }
  // Reject malformed tokens before touching the database.
  if (!TOKEN_RE.test(token)) return json({ error: 'not found' }, 404);

  const row = await env.DB.prepare(
    `SELECT a.id AS application_id, v.slug, v.label, v.r2_key
       FROM applications a
       JOIN resume_variants v ON v.id = a.variant_id
      WHERE a.token = ?1`,
  )
    .bind(token)
    .first<Resolved>();

  // Same response for an unknown token as for a malformed one: a token URL
  // should not confirm which tokens exist.
  if (!row) return json({ error: 'not found' }, 404);

  const filename = `Mohammad_Zaki_Jariwala_Resume_${row.slug}.pdf`;

  const response = row.r2_key
    ? await serveR2(env, request, row.r2_key, filename)
    : await serveStatic(env, request, filename);

  // Log only a real delivery, and never make the reader wait for the write.
  if (response.status === 200 || response.status === 206) {
    ctx.waitUntil(
      recordOpen(env, request, row.application_id).catch(() => {
        // A logging failure must never break resume delivery.
      }),
    );
  }

  return response;
}
