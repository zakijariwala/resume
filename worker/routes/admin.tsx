/** @jsxImportSource hono/jsx */
// Owner-only admin. Protected by Cloudflare Access at the edge and re-verified in
// requireAccess. Plain server-rendered forms; every change that affects the static
// site triggers a rebuild via the GitHub Action.
import { Hono, type Context } from 'hono';
import { csrf } from 'hono/csrf';
import type { Child, FC, PropsWithChildren } from 'hono/jsx';
import type { AppEnv } from '../env';
import { requireAccess } from '../lib/access';
import { getSetting, now, randomId, requestBuild, setSetting } from '../lib/util';
import { DEFAULT_SETTINGS, SCAFFOLD_SECTIONS, type RepoMeta, type Settings } from '../../shared/schema';

const admin = new Hono<AppEnv>();
admin.use('*', requireAccess);
admin.use('*', csrf());
admin.use('*', async (c, next) => {
  await next();
  c.header('cache-control', 'no-store');
  c.header('x-robots-tag', 'noindex');
  c.header('content-security-policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'");
});

const STALE_COMMITS = 20;
const fmt = (iso: string | null | undefined) => (iso ? iso.replace('T', ' ').slice(0, 16) + ' UTC' : '—');
const back = (c: Context<AppEnv>, path: string, msg: string) => c.redirect(`${path}?msg=${encodeURIComponent(msg)}`, 303);

// ---------------------------------------------------------------------------
// Layout

const NAV = [
  ['/admin', 'Dashboard'], ['/admin/projects', 'Projects'], ['/admin/resume', 'Résumé'],
  ['/admin/profile', 'Profile & sections'], ['/admin/inbox', 'Inbox'], ['/admin/site', 'Sync & deploys'],
] as const;

const CSS = `
:root{--bg:#f7f7f5;--fg:#1b1d1f;--muted:#5f6368;--line:#dcdcd7;--card:#fff;--accent:#0f5f63;--warn:#9a5b00;--bad:#a4262c;--ok:#1d6b3a}
@media (prefers-color-scheme:dark){:root{--bg:#121416;--fg:#e8e8e6;--muted:#9aa0a6;--line:#2c3035;--card:#1a1d20;--accent:#5fc3bd;--warn:#e0a84a;--bad:#f07178;--ok:#7bd88f}}
*{box-sizing:border-box}main a{color:var(--accent)}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--fg)}
header{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;padding:.75rem 1rem;border-bottom:1px solid var(--line);background:var(--card)}
header strong{margin-right:1rem}header a{color:var(--muted);text-decoration:none}header a[aria-current]{color:var(--fg);font-weight:600}
main{max-width:1100px;margin:0 auto;padding:1.25rem 1rem 4rem}h1{font-size:1.4rem;margin:.5rem 0 1rem}h2{font-size:1.05rem;margin:1.75rem 0 .5rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:1rem;margin-bottom:1rem}
.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.stat b{display:block;font-size:1.5rem}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden}
th,td{padding:.5rem .6rem;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{font-size:.8rem;color:var(--muted);font-weight:600}
.wrap{overflow-x:auto}.muted{color:var(--muted)}.small{font-size:.85rem}.warn{color:var(--warn)}.bad{color:var(--bad)}.ok{color:var(--ok)}
.pill{display:inline-block;font-size:.75rem;padding:0 .45rem;border-radius:99px;border:1px solid var(--line);color:var(--muted)}
button,.btn{font:inherit;background:var(--accent);color:#fff;border:0;border-radius:6px;padding:.45rem .9rem;cursor:pointer;text-decoration:none;display:inline-block}
button.ghost{background:transparent;color:var(--fg);border:1px solid var(--line)}button.danger{background:var(--bad)}
input[type=text],input[type=number],input[type=email],textarea,select{font:inherit;padding:.4rem .5rem;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg);width:100%}
input[type=number]{width:4.5rem}textarea{min-height:5rem}label{display:block;margin:.6rem 0 .25rem;font-weight:600;font-size:.9rem}
.inline{display:inline}.row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}.flash{background:var(--card);border-left:3px solid var(--accent);padding:.6rem .8rem;margin-bottom:1rem}
pre{white-space:pre-wrap;background:var(--card);border:1px solid var(--line);padding:1rem;border-radius:8px;font-size:.85rem;max-height:32rem;overflow:auto}
`;

const Layout: FC<PropsWithChildren<{ title: string; path: string; msg?: string }>> = ({ title, path, msg, children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex" />
      <title>{title} · Admin</title>
      <style>{CSS}</style>
    </head>
    <body>
      <header>
        <strong>Portfolio admin</strong>
        {NAV.map(([href, label]) => (
          <a href={href} aria-current={path === href ? 'page' : undefined}>{label}</a>
        ))}
        <a href="/" style="margin-left:auto">View site ↗</a>
      </header>
      <main>
        {msg && <div class="flash" role="status">{msg}</div>}
        <h1>{title}</h1>
        {children}
      </main>
    </body>
  </html>
);

const page = (c: Context<AppEnv>, title: string, path: string, body: Child) =>
  c.html(<Layout title={title} path={path} msg={c.req.query('msg')}>{body}</Layout>);

// ---------------------------------------------------------------------------
// Dashboard

admin.get('/', async (c) => {
  const db = c.env.DB;
  const [run, counts, unread, deploys, flagged] = await Promise.all([
    db.prepare('SELECT * FROM sync_runs ORDER BY id DESC LIMIT 1').first<{ started_at: string; finished_at: string; result: string; summary: string; token_expiry: string | null }>(),
    db.prepare(`SELECT COUNT(*) AS total, SUM(publish = 1 AND visible = 1 AND source_missing = 0) AS live, SUM(featured) AS featured FROM projects`).first<{ total: number; live: number; featured: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM messages WHERE read_at IS NULL').first<{ n: number }>(),
    db.prepare('SELECT * FROM deploys ORDER BY id DESC LIMIT 5').all<{ requested_at: string; reason: string; ok: number; detail: string }>(),
    db.prepare(`SELECT slug, title, issues, commits_since, source_missing FROM projects
                WHERE issues != '[]' OR commits_since >= ? OR source_missing = 1 ORDER BY slug`).bind(STALE_COMMITS)
      .all<{ slug: string; title: string; issues: string; commits_since: number | null; source_missing: number }>(),
  ]);
  const summary = run ? JSON.parse(run.summary) : null;
  const tokenDays = run?.token_expiry ? Math.floor((Date.parse(run.token_expiry) - Date.now()) / 86_400_000) : null;
  const resumeMain = await db.prepare('SELECT label FROM resume_files WHERE is_main = 1').first<{ label: string }>();

  return page(c, 'Dashboard', '/admin', (
    <>
      <div class="grid">
        <div class="card stat"><span class="muted small">Live projects</span><b>{counts?.live ?? 0} / {counts?.total ?? 0}</b><span class="small muted">{counts?.featured ?? 0} featured</span></div>
        <div class="card stat"><span class="muted small">Last sync</span><b class={run?.result === 'ok' ? 'ok' : run ? 'warn' : ''}>{run?.result ?? 'never'}</b><span class="small muted">{fmt(run?.finished_at)}</span></div>
        <div class="card stat"><span class="muted small">Unread messages</span><b>{unread?.n ?? 0}</b><a class="small" href="/admin/inbox">Open inbox</a></div>
        <div class="card stat"><span class="muted small">GitHub token</span><b class={tokenDays !== null && tokenDays <= 30 ? 'bad' : ''}>{tokenDays === null ? 'unknown' : `${tokenDays} days`}</b><span class="small muted">until expiry</span></div>
      </div>
      {!resumeMain && <p class="warn">No main résumé uploaded. The download button serves the fallback copy. <a href="/admin/resume">Upload one</a>.</p>}
      {summary && (
        <div class="card small">
          <strong>Last sync</strong> — {summary.repos_scanned} repos scanned · added: {summary.added.join(', ') || 'none'} · changed: {summary.changed.join(', ') || 'none'} · not found: {summary.missing.join(', ') || 'none'}
          {summary.errors.length > 0 && <ul>{summary.errors.map((e: { repo: string; issues: string[] }) => <li class="bad">{e.repo}: {e.issues.join('; ')}</li>)}</ul>}
        </div>
      )}
      <h2>Needs attention</h2>
      {flagged.results.length === 0 ? <p class="muted">Nothing.</p> : (
        <div class="wrap"><table>
          <tr><th>Project</th><th>Issue</th></tr>
          {flagged.results.map((p) => (
            <tr>
              <td><a href={`/admin/projects/${p.slug}`}>{p.title}</a></td>
              <td class="small">
                {p.source_missing ? <div class="bad">for_resume/project.md no longer found — hidden from site</div> : null}
                {(p.commits_since ?? 0) >= STALE_COMMITS ? <div class="warn">{p.commits_since} commits since the write-up — re-run the prompt</div> : null}
                {(JSON.parse(p.issues) as string[]).map((i) => <div>{i}</div>)}
              </td>
            </tr>
          ))}
        </table></div>
      )}
      <h2>Recent deploy requests</h2>
      <DeployTable rows={deploys.results} />
    </>
  ));
});

const DeployTable: FC<{ rows: { requested_at: string; reason: string; ok: number; detail: string }[] }> = ({ rows }) =>
  rows.length === 0 ? <p class="muted">None yet.</p> : (
    <div class="wrap"><table>
      <tr><th>When</th><th>Reason</th><th>Dispatch</th></tr>
      {rows.map((d) => <tr><td class="small">{fmt(d.requested_at)}</td><td>{d.reason}</td><td class={d.ok ? 'ok small' : 'bad small'}>{d.ok ? 'sent' : d.detail}</td></tr>)}
    </table></div>
  );

// ---------------------------------------------------------------------------
// Projects

interface ProjectRow {
  slug: string; repo: string; repo_meta: string; title: string; publish: number; size: string; visible: number; featured: number;
  feature_order: number; deep_dive: number; pinned: number; deep_dive_md: string | null; issues: string; commits_since: number | null;
  source_missing: number; synced_at: string; pending_md: string | null; project_md: string;
}

admin.get('/projects', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT * FROM projects ORDER BY featured DESC, feature_order, title').all<ProjectRow>()).results;
  return page(c, 'Projects', '/admin/projects', (
    <>
      <p class="muted small">
        Hiding a project removes its pages immediately and removes it from every listing after the rebuild (about 2 minutes).
        Nothing else on the site changes. "From repo: no" means the repo's own file sets <code>publish: false</code>.
      </p>
      {rows.length === 0 ? <p>No projects yet. Run a sync from <a href="/admin/site">Sync &amp; deploys</a>.</p> : (
        <form method="post" action="/admin/projects">
          <div class="wrap"><table>
            <tr><th>Project</th><th>Visible</th><th>Featured</th><th>Order</th><th>Deep-dive</th><th>Pin</th><th>State</th></tr>
            {rows.map((p) => {
              const meta = JSON.parse(p.repo_meta) as RepoMeta;
              const issues = JSON.parse(p.issues) as string[];
              return (
                <tr>
                  <td>
                    <a href={`/admin/projects/${p.slug}`}><strong>{p.title}</strong></a><br />
                    <span class="small muted">{p.repo}</span> {meta.private && <span class="pill">private</span>} <span class="pill">{p.size}</span>
                    <input type="hidden" name="slugs" value={p.slug} />
                  </td>
                  <td><input type="checkbox" name={`visible:${p.slug}`} checked={!!p.visible} aria-label={`Visible: ${p.title}`} /></td>
                  <td><input type="checkbox" name={`featured:${p.slug}`} checked={!!p.featured} aria-label={`Featured: ${p.title}`} /></td>
                  <td><input type="number" min="0" max="99" name={`order:${p.slug}`} value={String(p.feature_order)} aria-label={`Order: ${p.title}`} /></td>
                  <td>{p.deep_dive_md
                    ? <input type="checkbox" name={`deep:${p.slug}`} checked={!!p.deep_dive} aria-label={`Deep-dive: ${p.title}`} />
                    : <span class="small muted">none</span>}</td>
                  <td><input type="checkbox" name={`pinned:${p.slug}`} checked={!!p.pinned} aria-label={`Pin content: ${p.title}`} /></td>
                  <td class="small">
                    {!p.publish && <div class="muted">From repo: no</div>}
                    {p.publish && !p.visible ? <div class="muted">hidden</div> : null}
                    {p.source_missing ? <div class="bad">source missing</div> : null}
                    {issues.length > 0 && <div class="warn">{issues.length} issue(s)</div>}
                    {p.pending_md && <div class="warn">update held (pinned)</div>}
                    {(p.commits_since ?? 0) >= STALE_COMMITS && <div class="warn">stale ({p.commits_since})</div>}
                    {p.publish && p.visible && !p.source_missing ? <div class="ok">live</div> : null}
                  </td>
                </tr>
              );
            })}
          </table></div>
          <p class="small muted">Featured: up to 3 are shown on the homepage, lowest order first.</p>
          <button type="submit">Save and rebuild</button>
        </form>
      )}
    </>
  ));
});

admin.post('/projects', async (c) => {
  const form = await c.req.parseBody({ all: true });
  const slugs = ([] as unknown[]).concat(form.slugs ?? []).map(String);
  const on = (k: string) => form[k] === 'on';
  const stmts = slugs.map((slug) => {
    const order = Math.max(0, Math.min(99, parseInt(String(form[`order:${slug}`] ?? '0'), 10) || 0));
    return c.env.DB.prepare('UPDATE projects SET visible=?, featured=?, feature_order=?, deep_dive=?, pinned=? WHERE slug=?')
      .bind(on(`visible:${slug}`) ? 1 : 0, on(`featured:${slug}`) ? 1 : 0, order, on(`deep:${slug}`) ? 1 : 0, on(`pinned:${slug}`) ? 1 : 0, slug);
  });
  if (stmts.length) await c.env.DB.batch(stmts);
  const sent = await requestBuild(c.env, 'rebuild', 'project settings changed');
  return back(c, '/admin/projects', sent ? 'Saved. Pages for hidden projects are already offline; listings update after the rebuild.' : 'Saved, but the rebuild request failed — see Sync & deploys.');
});

admin.get('/projects/:slug', async (c) => {
  const p = await c.env.DB.prepare('SELECT * FROM projects WHERE slug = ?').bind(c.req.param('slug')).first<ProjectRow>();
  if (!p) return c.notFound();
  const meta = JSON.parse(p.repo_meta) as RepoMeta;
  const issues = JSON.parse(p.issues) as string[];
  return page(c, p.title, '/admin/projects', (
    <>
      <p class="small">
        <a href={meta.url} rel="noopener">{p.repo}</a> {meta.private && <span class="pill">private</span>} · synced {fmt(p.synced_at)} ·
        last push {fmt(meta.pushed_at)} · {p.commits_since ?? '?'} commits since write-up ·{' '}
        <a href={`/work/${p.slug}/`}>public page ↗</a>
      </p>
      {issues.length > 0 && <div class="card"><strong class="warn">Issues from last sync</strong><ul>{issues.map((i) => <li class="small">{i}</li>)}</ul></div>}
      {p.pending_md && (
        <div class="card">
          <strong class="warn">A newer version is held because this project is pinned.</strong>
          <form method="post" action={`/admin/projects/${p.slug}/publish-pending`} class="row" style="margin-top:.5rem">
            <button type="submit">Publish held version</button>
          </form>
          <details><summary class="small">Show held version</summary><pre>{p.pending_md}</pre></details>
        </div>
      )}
      <h2>project.md (published)</h2>
      <pre>{p.project_md}</pre>
      {p.deep_dive_md && <><h2>deep-dive.md</h2><pre>{p.deep_dive_md}</pre></>}
    </>
  ));
});

admin.post('/projects/:slug/publish-pending', async (c) => {
  const slug = c.req.param('slug');
  await c.env.DB.prepare(
    `UPDATE projects SET project_md = pending_md, deep_dive_md = pending_dd_md, content_hash = 'manual-' || ?, pending_md = NULL, pending_dd_md = NULL
       WHERE slug = ? AND pending_md IS NOT NULL`,
  ).bind(now(), slug).run();
  await requestBuild(c.env, 'rebuild', `published held version of ${slug}`);
  return back(c, `/admin/projects/${slug}`, 'Held version published; rebuild requested.');
});

// ---------------------------------------------------------------------------
// Résumé

interface ResumeFile { id: string; label: string; r2_key: string; size: number; is_main: number; uploaded_at: string }

admin.get('/resume', async (c) => {
  const db = c.env.DB;
  const files = (await db.prepare(
    `SELECT f.*, (SELECT COUNT(*) FROM resume_events e WHERE e.file_id = f.id AND e.kind = 'download') AS downloads
       FROM resume_files f ORDER BY is_main DESC, uploaded_at DESC`,
  ).all<ResumeFile & { downloads: number }>()).results;
  const links = (await db.prepare(
    `SELECT l.*, f.label, (SELECT COUNT(*) FROM resume_events e WHERE e.token = l.token) AS views,
            (SELECT MAX(at) FROM resume_events e WHERE e.token = l.token) AS last_view
       FROM resume_links l JOIN resume_files f ON f.id = l.file_id ORDER BY l.created_at DESC`,
  ).all<{ token: string; recipient: string; note: string; created_at: string; revoked_at: string | null; label: string; views: number; last_view: string | null }>()).results;
  const fallbackDownloads = await db.prepare("SELECT COUNT(*) AS n FROM resume_events WHERE kind = 'download' AND file_id IS NULL").first<{ n: number }>();
  const origin = new URL(c.req.url).origin;

  return page(c, 'Résumé', '/admin/resume', (
    <>
      <p class="muted small">The site's download button always serves the file marked <em>main</em> at <code>/resume.pdf</code>. Variants are private until you create a tracked link for them.</p>
      <div class="wrap"><table>
        <tr><th>Label</th><th>Size</th><th>Uploaded</th><th>Downloads</th><th></th></tr>
        {files.map((f) => (
          <tr>
            <td><strong>{f.label}</strong> {f.is_main ? <span class="pill">main</span> : null}</td>
            <td class="small">{(f.size / 1024).toFixed(0)} KB</td>
            <td class="small">{fmt(f.uploaded_at)}</td>
            <td>{f.downloads}</td>
            <td class="row">
              {!f.is_main && <form method="post" action={`/admin/resume/${f.id}/main`} class="inline"><button class="ghost" type="submit">Make main</button></form>}
              <form method="post" action={`/admin/resume/${f.id}/delete`} class="inline"><button class="danger" type="submit">Delete</button></form>
            </td>
          </tr>
        ))}
        {files.length === 0 && <tr><td colspan={5} class="muted">No uploads yet — serving the fallback copy ({fallbackDownloads?.n ?? 0} downloads).</td></tr>}
      </table></div>

      <h2>Upload</h2>
      <form class="card" method="post" action="/admin/resume/upload" enctype="multipart/form-data">
        <label for="label">Label</label>
        <input id="label" type="text" name="label" required maxlength={80} placeholder="e.g. Main — Sept 2026, or SRE — Gulf" />
        <label for="file">PDF (max 10 MB)</label>
        <input id="file" type="file" name="file" accept="application/pdf" required />
        <label class="row"><input type="checkbox" name="main" /> Make this the main résumé</label>
        <button type="submit">Upload</button>
      </form>

      <h2>Tracked links</h2>
      {files.length > 0 && (
        <form class="card" method="post" action="/admin/resume/links">
          <div class="grid">
            <div><label for="file_id">Version</label>
              <select id="file_id" name="file_id">{files.map((f) => <option value={f.id}>{f.label}</option>)}</select></div>
            <div><label for="recipient">Recipient</label><input id="recipient" type="text" name="recipient" required maxlength={120} placeholder="Company — role" /></div>
            <div><label for="note">Note</label><input id="note" type="text" name="note" maxlength={200} /></div>
          </div>
          <p><button type="submit">Create link</button></p>
        </form>
      )}
      <div class="wrap"><table>
        <tr><th>Recipient</th><th>Version</th><th>Link</th><th>Opens</th><th>Last opened</th><th></th></tr>
        {links.map((l) => (
          <tr>
            <td>{l.recipient}<br /><span class="small muted">{l.note}</span></td>
            <td class="small">{l.label}</td>
            <td class="small"><code>{origin}/r/{l.token}</code></td>
            <td>{l.views}</td>
            <td class="small">{fmt(l.last_view)}</td>
            <td>{l.revoked_at ? <span class="muted small">revoked</span> : (
              <form method="post" action={`/admin/resume/links/${l.token}/revoke`}><button class="ghost" type="submit">Revoke</button></form>
            )}</td>
          </tr>
        ))}
        {links.length === 0 && <tr><td colspan={6} class="muted">No tracked links.</td></tr>}
      </table></div>
    </>
  ));
});

admin.post('/resume/upload', async (c) => {
  const form = await c.req.parseBody();
  const file = form.file;
  const label = String(form.label ?? '').trim().slice(0, 80);
  if (!(file instanceof File) || !label) return back(c, '/admin/resume', 'Label and PDF are required.');
  if (file.size > 10 * 1024 * 1024) return back(c, '/admin/resume', 'File is over 10 MB.');
  const buf = await file.arrayBuffer();
  if (new TextDecoder().decode(buf.slice(0, 5)) !== '%PDF-') return back(c, '/admin/resume', 'That file is not a PDF.');
  const id = randomId(10);
  const key = `resume/${id}.pdf`;
  await c.env.BUCKET.put(key, buf, { httpMetadata: { contentType: 'application/pdf' } });
  const makeMain = form.main === 'on' || !(await c.env.DB.prepare('SELECT 1 FROM resume_files WHERE is_main = 1').first());
  const stmts = [c.env.DB.prepare('INSERT INTO resume_files (id, label, r2_key, size, is_main, uploaded_at) VALUES (?,?,?,?,0,?)').bind(id, label, key, file.size, now())];
  if (makeMain) stmts.push(...mainStatements(c, id));
  await c.env.DB.batch(stmts);
  return back(c, '/admin/resume', makeMain ? `Uploaded "${label}" and set it as main. The download button serves it now.` : `Uploaded "${label}".`);
});

const mainStatements = (c: Context<AppEnv>, id: string) => [
  c.env.DB.prepare('UPDATE resume_files SET is_main = 0 WHERE is_main = 1'),
  c.env.DB.prepare('UPDATE resume_files SET is_main = 1 WHERE id = ?').bind(id),
];

admin.post('/resume/:id/main', async (c) => {
  await c.env.DB.batch(mainStatements(c, c.req.param('id')));
  return back(c, '/admin/resume', 'Main résumé updated.');
});

admin.post('/resume/:id/delete', async (c) => {
  const f = await c.env.DB.prepare('SELECT * FROM resume_files WHERE id = ?').bind(c.req.param('id')).first<ResumeFile>();
  if (!f) return back(c, '/admin/resume', 'Not found.');
  await c.env.BUCKET.delete(f.r2_key);
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM resume_links WHERE file_id = ?').bind(f.id),
    c.env.DB.prepare('DELETE FROM resume_files WHERE id = ?').bind(f.id),
  ]);
  return back(c, '/admin/resume', f.is_main ? `Deleted "${f.label}". No main résumé is set — the fallback copy is served.` : `Deleted "${f.label}".`);
});

admin.post('/resume/links', async (c) => {
  const form = await c.req.parseBody();
  const recipient = String(form.recipient ?? '').trim().slice(0, 120);
  const fileId = String(form.file_id ?? '');
  if (!recipient || !(await c.env.DB.prepare('SELECT 1 FROM resume_files WHERE id = ?').bind(fileId).first())) {
    return back(c, '/admin/resume', 'Pick a version and a recipient.');
  }
  const token = randomId(10);
  await c.env.DB.prepare('INSERT INTO resume_links (token, file_id, recipient, note, created_at) VALUES (?,?,?,?,?)')
    .bind(token, fileId, recipient, String(form.note ?? '').trim().slice(0, 200), now()).run();
  return back(c, '/admin/resume', `Link for ${recipient}: ${new URL(c.req.url).origin}/r/${token}`);
});

admin.post('/resume/links/:token/revoke', async (c) => {
  await c.env.DB.prepare('UPDATE resume_links SET revoked_at = ? WHERE token = ?').bind(now(), c.req.param('token')).run();
  return back(c, '/admin/resume', 'Link revoked.');
});

// ---------------------------------------------------------------------------
// Profile & sections

const SECTION_LABELS: Record<(typeof SCAFFOLD_SECTIONS)[number], string> = {
  writing: 'Writing', talks: 'Talks', 'open-source': 'Open source', uses: 'Uses',
};

admin.get('/profile', async (c) => {
  const stored = await getSetting<Partial<Settings>>(c.env, 'site', {});
  const s: Settings = { ...DEFAULT_SETTINGS, ...stored, sections: { ...DEFAULT_SETTINGS.sections, ...(stored.sections ?? {}) } };
  return page(c, 'Profile & sections', '/admin/profile', (
    <form method="post" action="/admin/profile" class="card">
      <label for="availability">Availability line (homepage and contact page)</label>
      <input id="availability" type="text" name="availability" maxlength={200} value={s.availability} />
      <label for="now">"Now" note (homepage and /now). Leave empty to hide.</label>
      <textarea id="now" name="now" maxlength={1200}>{s.now}</textarea>
      <label class="row"><input type="checkbox" name="show_ai_note" checked={s.show_ai_note} /> Show "Built with AI-assisted tooling" on projects whose repo sets <code>ai_assisted: true</code></label>
      <h2>Extra sections</h2>
      <p class="small muted">Scaffolded pages. Content lives in <code>content/sections/*.yaml</code> in the site repo; a section with no entries stays hidden even when switched on.</p>
      {SCAFFOLD_SECTIONS.map((k) => (
        <label class="row"><input type="checkbox" name={`section:${k}`} checked={!!s.sections[k]} /> {SECTION_LABELS[k]}</label>
      ))}
      <p><button type="submit">Save and rebuild</button></p>
    </form>
  ));
});

admin.post('/profile', async (c) => {
  const form = await c.req.parseBody();
  const value: Settings = {
    availability: String(form.availability ?? '').trim().slice(0, 200),
    now: String(form.now ?? '').trim().slice(0, 1200),
    show_ai_note: form.show_ai_note === 'on',
    sections: Object.fromEntries(SCAFFOLD_SECTIONS.map((k) => [k, form[`section:${k}`] === 'on'])),
  };
  await setSetting(c.env, 'site', value);
  const sent = await requestBuild(c.env, 'rebuild', 'profile settings changed');
  return back(c, '/admin/profile', sent ? 'Saved. Live in about 2 minutes.' : 'Saved, but the rebuild request failed — see Sync & deploys.');
});

// ---------------------------------------------------------------------------
// Inbox

admin.get('/inbox', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT * FROM messages ORDER BY at DESC LIMIT 200')
    .all<{ id: number; name: string; email: string; body: string; at: string; read_at: string | null }>()).results;
  return page(c, 'Inbox', '/admin/inbox', rows.length === 0 ? <p class="muted">No messages.</p> : (
    <>{rows.map((m) => (
      <div class="card" style={m.read_at ? 'opacity:.7' : ''}>
        <div class="row"><strong>{m.name}</strong> <a href={`mailto:${m.email}`}>{m.email}</a> <span class="small muted">{fmt(m.at)}</span></div>
        <p style="white-space:pre-wrap">{m.body}</p>
        <div class="row">
          {!m.read_at && <form method="post" action={`/admin/inbox/${m.id}/read`} class="inline"><button class="ghost" type="submit">Mark read</button></form>}
          <form method="post" action={`/admin/inbox/${m.id}/delete`} class="inline"><button class="danger" type="submit">Delete</button></form>
        </div>
      </div>
    ))}</>
  ));
});

admin.post('/inbox/:id/read', async (c) => {
  await c.env.DB.prepare('UPDATE messages SET read_at = ? WHERE id = ?').bind(now(), c.req.param('id')).run();
  return back(c, '/admin/inbox', 'Marked read.');
});
admin.post('/inbox/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(c.req.param('id')).run();
  return back(c, '/admin/inbox', 'Deleted.');
});

// ---------------------------------------------------------------------------
// Sync & deploys

admin.get('/site', async (c) => {
  const [runs, deploys] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM sync_runs ORDER BY id DESC LIMIT 10').all<{ id: number; finished_at: string; result: string; summary: string }>(),
    c.env.DB.prepare('SELECT * FROM deploys ORDER BY id DESC LIMIT 20').all<{ requested_at: string; reason: string; ok: number; detail: string }>(),
  ]);
  return page(c, 'Sync & deploys', '/admin/site', (
    <>
      <div class="row">
        <form method="post" action="/admin/site/sync"><button type="submit">Sync repos now</button></form>
        <form method="post" action="/admin/site/rebuild"><button class="ghost" type="submit">Rebuild site only</button></form>
      </div>
      <p class="small muted">Both run in GitHub Actions and take about 2 minutes. The weekly sync runs every Monday at 03:00 UTC.</p>
      <h2>Sync runs</h2>
      <div class="wrap"><table>
        <tr><th>Finished</th><th>Result</th><th>Summary</th></tr>
        {runs.results.map((r) => {
          const s = JSON.parse(r.summary);
          return <tr><td class="small">{fmt(r.finished_at)}</td><td class={r.result === 'ok' ? 'ok' : 'warn'}>{r.result}</td>
            <td class="small">{s.repos_scanned} scanned · +{s.added.length} · ~{s.changed.length} · missing {s.missing.length} · errors {s.errors.length}</td></tr>;
        })}
        {runs.results.length === 0 && <tr><td colspan={3} class="muted">No syncs yet.</td></tr>}
      </table></div>
      <h2>Deploy requests</h2>
      <DeployTable rows={deploys.results} />
    </>
  ));
});

admin.post('/site/sync', async (c) => {
  const ok = await requestBuild(c.env, 'sync', 'manual sync from admin');
  return back(c, '/admin/site', ok ? 'Sync requested.' : 'Dispatch failed — check DISPATCH_TOKEN.');
});
admin.post('/site/rebuild', async (c) => {
  const ok = await requestBuild(c.env, 'rebuild', 'manual rebuild from admin');
  return back(c, '/admin/site', ok ? 'Rebuild requested.' : 'Dispatch failed — check DISPATCH_TOKEN.');
});

export default admin;
