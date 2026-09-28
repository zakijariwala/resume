// Machine endpoints used by the GitHub Action (scripts/sync.ts). Bearer BUILD_TOKEN.
import { Hono } from 'hono';
import type { AppEnv, Env } from '../env';
import { DEFAULT_SETTINGS, type RepoMeta, type Settings, type Snapshot, type SnapshotProject } from '../../shared/schema';
import { getSetting, now, safeEqual } from '../lib/util';
import { notifyOwner } from '../lib/email';

const STALE_COMMITS = 20;
const internal = new Hono<AppEnv>();

internal.use('*', async (c, next) => {
  const auth = c.req.header('authorization') ?? '';
  if (!c.env.BUILD_TOKEN || !safeEqual(auth, `Bearer ${c.env.BUILD_TOKEN}`)) return c.text('Unauthorized', 401);
  return next();
});

interface IngestProject {
  slug: string; repo: string; repo_meta: RepoMeta; title: string; publish: boolean; size: string;
  project_md: string; deep_dive_md: string | null; media: Record<string, string>; content_hash: string;
  source_commit: string | null; commits_since: number | null; issues: string[];
}
interface IngestBody {
  started_at: string; token_expiry: string | null; repos_scanned: number;
  projects: IngestProject[]; errors: { repo: string; slug: string | null; issues: string[] }[];
}

internal.post('/ingest', async (c) => {
  const env = c.env;
  const body = await c.req.json<IngestBody>();
  const ts = now();
  const existing = new Map(
    (await env.DB.prepare('SELECT slug, repo, content_hash, pinned FROM projects').all<{ slug: string; repo: string; content_hash: string; pinned: number }>())
      .results.map((r) => [r.slug, r]),
  );
  const stmts: D1PreparedStatement[] = [];
  const added: string[] = [];
  const changed: string[] = [];
  const errors = [...body.errors];
  const seen = new Set<string>();

  for (const p of body.projects) {
    const prev = existing.get(p.slug);
    if (prev && prev.repo !== p.repo) {
      errors.push({ repo: p.repo, slug: p.slug, issues: [`slug "${p.slug}" already belongs to ${prev.repo}`] });
      continue;
    }
    seen.add(p.slug);
    const meta = JSON.stringify(p.repo_meta);
    const issues = JSON.stringify(p.issues);
    if (!prev) {
      added.push(p.slug);
      stmts.push(env.DB.prepare(
        `INSERT INTO projects (slug, repo, repo_meta, title, publish, size, project_md, deep_dive_md, media, content_hash,
           source_commit, commits_since, issues, synced_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).bind(p.slug, p.repo, meta, p.title, p.publish ? 1 : 0, p.size, p.project_md, p.deep_dive_md, JSON.stringify(p.media),
        p.content_hash, p.source_commit, p.commits_since, issues, ts));
    } else if (prev.content_hash !== p.content_hash && prev.pinned) {
      // Pinned: keep what is published, hold the new version for review in admin.
      stmts.push(env.DB.prepare(
        `UPDATE projects SET repo_meta=?, pending_md=?, pending_dd_md=?, commits_since=?, issues=?, source_missing=0, synced_at=? WHERE slug=?`,
      ).bind(meta, p.project_md, p.deep_dive_md, p.commits_since, issues, ts, p.slug));
    } else {
      if (prev.content_hash !== p.content_hash) changed.push(p.slug);
      stmts.push(env.DB.prepare(
        `UPDATE projects SET repo_meta=?, title=?, publish=?, size=?, project_md=?, deep_dive_md=?, media=?, content_hash=?,
           source_commit=?, commits_since=?, issues=?, source_missing=0, synced_at=? WHERE slug=?`,
      ).bind(meta, p.title, p.publish ? 1 : 0, p.size, p.project_md, p.deep_dive_md, JSON.stringify(p.media), p.content_hash,
        p.source_commit, p.commits_since, issues, ts, p.slug));
    }
  }

  // Files that failed validation keep their last good version; record why.
  for (const e of errors) {
    if (e.slug && existing.get(e.slug)?.repo === e.repo) {
      seen.add(e.slug);
      stmts.push(env.DB.prepare('UPDATE projects SET issues=?, synced_at=? WHERE slug=?').bind(JSON.stringify(e.issues), ts, e.slug));
    }
  }

  const missing = [...existing.keys()].filter((s) => !seen.has(s));
  for (const slug of missing) stmts.push(env.DB.prepare('UPDATE projects SET source_missing=1 WHERE slug=?').bind(slug));

  const summary = { repos_scanned: body.repos_scanned, added, changed, missing, errors };
  stmts.push(env.DB.prepare('INSERT INTO sync_runs (started_at, finished_at, result, summary, token_expiry) VALUES (?,?,?,?,?)')
    .bind(body.started_at, ts, errors.length ? 'partial' : 'ok', JSON.stringify(summary), body.token_expiry));
  await env.DB.batch(stmts);

  c.executionCtx.waitUntil(sendDigest(env, summary, body.token_expiry));
  return c.json(summary);
});

async function sendDigest(env: Env, s: { repos_scanned: number; added: string[]; changed: string[]; missing: string[]; errors: { repo: string; issues: string[] }[] }, tokenExpiry: string | null) {
  const stale = (await env.DB.prepare('SELECT slug, commits_since FROM projects WHERE commits_since >= ? AND source_missing = 0')
    .bind(STALE_COMMITS).all<{ slug: string; commits_since: number }>()).results;
  const lines = [
    `Weekly sync: ${s.repos_scanned} repos scanned.`,
    `Added: ${s.added.join(', ') || 'none'}`,
    `Changed: ${s.changed.join(', ') || 'none'}`,
    `No longer found: ${s.missing.join(', ') || 'none'}`,
    '',
    ...(s.errors.length ? ['Problems (previous version kept live):', ...s.errors.map((e) => `- ${e.repo}: ${e.issues.join('; ')}`), ''] : []),
    ...(stale.length ? ['Summaries that may need regenerating:', ...stale.map((r) => `- ${r.slug}: ${r.commits_since} commits since last write-up`), ''] : []),
  ];
  if (tokenExpiry) {
    const days = Math.floor((Date.parse(tokenExpiry) - Date.now()) / 86_400_000);
    if (days <= 30) lines.push(`GitHub token expires in ${days} days (${tokenExpiry}). Renew GITHUB_TOKEN in the repo's Actions secrets.`);
  }
  lines.push('', `Admin: ${env.SITE_URL}/admin`);
  await notifyOwner(env, `Portfolio sync: ${s.added.length} added, ${s.changed.length} changed, ${s.errors.length} problems`, lines.join('\n'));
}

internal.get('/snapshot', async (c) => {
  c.header('cache-control', 'no-store');
  return c.json(await buildSnapshot(c.env));
});

export async function buildSnapshot(env: Env): Promise<Snapshot> {
  const stored = await getSetting<Partial<Settings>>(env, 'site', {});
  const settings: Settings = { ...DEFAULT_SETTINGS, ...stored, sections: { ...DEFAULT_SETTINGS.sections, ...(stored.sections ?? {}) } };
  const rows = (await env.DB.prepare(
    `SELECT slug, repo_meta, featured, feature_order, deep_dive, project_md, deep_dive_md, media, title
       FROM projects WHERE publish = 1 AND visible = 1 AND source_missing = 0`,
  ).all<{ slug: string; repo_meta: string; featured: number; feature_order: number; deep_dive: number; project_md: string; deep_dive_md: string | null; media: string; title: string }>()).results;

  const projects: SnapshotProject[] = rows.map((r) => ({
    slug: r.slug,
    repo: JSON.parse(r.repo_meta),
    featured: !!r.featured,
    feature_order: r.feature_order,
    deep_dive: !!r.deep_dive && !!r.deep_dive_md,
    project_md: r.project_md,
    deep_dive_md: r.deep_dive && r.deep_dive_md ? r.deep_dive_md : null,
    media: JSON.parse(r.media),
  }));
  const since = Date.now() - 14 * 86_400_000;
  const activity = rows
    .map((r) => ({ slug: r.slug, title: r.title, pushed_at: (JSON.parse(r.repo_meta) as RepoMeta).pushed_at ?? '' }))
    .filter((a) => a.pushed_at && Date.parse(a.pushed_at) >= since)
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
  return { generated_at: now(), source: 'worker', settings, projects, activity };
}

// Project media, uploaded by the sync from repos (private repos included — only files
// the repo's for_resume/project.md explicitly lists).
const MEDIA_KEY = /^[a-z0-9-]+\/[0-9a-f]{16}\.(png|jpe?g|webp)$/;
internal.on(['HEAD', 'PUT'], '/media/:slug/:file', async (c) => {
  const key = `${c.req.param('slug')}/${c.req.param('file')}`;
  if (!MEDIA_KEY.test(key)) return c.text('bad key', 400);
  if (c.req.method === 'HEAD') {
    return (await c.env.BUCKET.head(`media/${key}`)) ? c.body(null, 200) : c.body(null, 404);
  }
  const type = c.req.header('content-type') ?? '';
  if (!/^image\/(png|jpeg|webp)$/.test(type)) return c.text('bad type', 400);
  const body = await c.req.arrayBuffer();
  if (body.byteLength > 1_000_000) return c.text('too large', 413);
  await c.env.BUCKET.put(`media/${key}`, body, { httpMetadata: { contentType: type } });
  return c.body(null, 201);
});

export default internal;
