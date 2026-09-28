// Weekly content sync. Runs in GitHub Actions (no CPU or subrequest limits),
// triggered by the Worker's cron via repository_dispatch, or from admin.
//
//   node --experimental-strip-types scripts/sync.ts            fetch repos → ingest → write snapshot
//   node --experimental-strip-types scripts/sync.ts snapshot   write snapshot only (rebuild after a toggle)
//   node --experimental-strip-types scripts/sync.ts bootstrap  write an empty snapshot (first deploy, Worker not live yet)
//
// Env: GITHUB_TOKEN (fine-grained PAT, read-only Contents + Metadata on all repos),
//      WORKER_URL (e.g. https://zakijariwala.space), BUILD_TOKEN (shared secret with the Worker),
//      SNAPSHOT_FILE (default .snapshot.json)
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { projectSchema, deepDiveSchema, splitFrontmatter, formatIssues, DEFAULT_SETTINGS, type RepoMeta, type Snapshot } from '../shared/schema.ts';
import { scanForSecrets } from '../shared/secrets.ts';

const env = (k: string, fallback?: string) => {
  const v = process.env[k] ?? fallback;
  if (v === undefined) throw new Error(`${k} is not set`);
  return v;
};
const WORKER_URL = env('WORKER_URL', '').replace(/\/$/, '');
const BUILD_TOKEN = env('BUILD_TOKEN', '');
const SNAPSHOT_FILE = env('SNAPSHOT_FILE', '.snapshot.json');

const MEDIA_EXT: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
const MEDIA_MAX_BYTES = 1_000_000;

async function worker(path: string, init: RequestInit = {}) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${BUILD_TOKEN}`, ...(init.headers ?? {}) },
  });
  if (!res.ok && res.status !== 404) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  return res;
}

async function writeSnapshot() {
  const res = await worker('/internal/snapshot');
  const body = await res.text();
  JSON.parse(body); // fail loudly on a bad payload rather than building from it
  await writeFile(SNAPSHOT_FILE, body);
  console.log(`snapshot written to ${SNAPSHOT_FILE}`);
}

// ---------------------------------------------------------------------------
// GitHub

const MODE = process.argv[2] ?? 'sync';
if (!['sync', 'snapshot', 'bootstrap'].includes(MODE)) throw new Error(`unknown mode "${MODE}"`);
if (MODE !== 'bootstrap' && (!WORKER_URL || !BUILD_TOKEN)) throw new Error('WORKER_URL and BUILD_TOKEN must be set');
const GITHUB_TOKEN = MODE === 'sync' ? env('GITHUB_TOKEN') : '';
let tokenExpiry: string | null = null;

async function gh(path: string, accept = 'application/vnd.github+json') {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { authorization: `Bearer ${GITHUB_TOKEN}`, accept, 'x-github-api-version': '2022-11-28', 'user-agent': 'zakijariwala-sync' },
  });
  tokenExpiry ??= res.headers.get('github-authentication-token-expiration');
  return res;
}

const REPO_QUERY = `
query($after: String) {
  viewer {
    repositories(first: 50, after: $after, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name nameWithOwner url isPrivate pushedAt stargazerCount
        languages(first: 6, orderBy: {field: SIZE, direction: DESC}) { nodes { name } }
        repositoryTopics(first: 10) { nodes { topic { name } } }
        defaultBranchRef { target { oid } }
        project: object(expression: "HEAD:for_resume/project.md") { ... on Blob { text } }
        deepDive: object(expression: "HEAD:for_resume/deep-dive.md") { ... on Blob { text } }
      }
    }
  }
}`;

interface RepoNode {
  name: string; nameWithOwner: string; url: string; isPrivate: boolean; pushedAt: string | null; stargazerCount: number;
  languages: { nodes: { name: string }[] }; repositoryTopics: { nodes: { topic: { name: string } }[] };
  defaultBranchRef: { target: { oid: string } } | null;
  project: { text: string | null } | null; deepDive: { text: string | null } | null;
}

async function listRepos(): Promise<RepoNode[]> {
  const out: RepoNode[] = [];
  let after: string | null = null;
  do {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `Bearer ${GITHUB_TOKEN}`, 'content-type': 'application/json', 'user-agent': 'zakijariwala-sync' },
      body: JSON.stringify({ query: REPO_QUERY, variables: { after } }),
    });
    tokenExpiry ??= res.headers.get('github-authentication-token-expiration');
    const json = await res.json() as any;
    if (!res.ok || json.errors) throw new Error(`GitHub GraphQL: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
    const page = json.data.viewer.repositories;
    out.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return out;
}

async function commitsSince(repo: string, sha: string | undefined): Promise<number | null> {
  if (!sha || !/^[0-9a-f]{7,40}$/i.test(sha)) return null;
  const res = await gh(`/repos/${repo}/compare/${sha}...HEAD`);
  if (!res.ok) return null;
  return ((await res.json()) as any).ahead_by ?? null;
}

async function syncMedia(repo: string, slug: string, media: { path: string }[], issues: string[]) {
  const map: Record<string, string> = {};
  for (const { path } of media) {
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    if (!MEDIA_EXT[ext] || path.includes('..')) { issues.push(`media ${path}: unsupported type or path`); continue; }
    const res = await gh(`/repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, 'application/vnd.github.raw');
    if (!res.ok) { issues.push(`media ${path}: ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MEDIA_MAX_BYTES) { issues.push(`media ${path}: over 1 MB`); continue; }
    const key = `${slug}/${createHash('sha256').update(buf).digest('hex').slice(0, 16)}.${ext}`;
    const head = await worker(`/internal/media/${key}`, { method: 'HEAD' });
    if (head.status === 404) {
      await worker(`/internal/media/${key}`, { method: 'PUT', body: buf, headers: { 'content-type': MEDIA_EXT[ext] } });
    }
    map[path] = `/media/${key}`;
  }
  return map;
}

// ---------------------------------------------------------------------------

async function sync() {
  const started_at = new Date().toISOString();
  const repos = await listRepos();
  const projects: unknown[] = [];
  const errors: { repo: string; slug: string | null; issues: string[] }[] = [];
  const seen = new Map<string, string>();

  for (const r of repos) {
    const raw = r.project?.text;
    if (!raw) continue;
    const issues: string[] = [];
    let slug: string | null = null;
    try {
      const { data, body } = splitFrontmatter(raw);
      slug = typeof (data as any)?.slug === 'string' ? (data as any).slug : null;
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) { errors.push({ repo: r.nameWithOwner, slug, issues: formatIssues(parsed.error) }); continue; }
      const p = parsed.data;
      if (seen.has(p.slug)) { errors.push({ repo: r.nameWithOwner, slug, issues: [`slug "${p.slug}" already used by ${seen.get(p.slug)}`] }); continue; }
      seen.set(p.slug, r.nameWithOwner);
      if (!body.trim() && p.publish) issues.push('body is empty');

      let deepDive = r.deepDive?.text ?? null;
      if (deepDive) {
        try {
          const dd = deepDiveSchema.safeParse(splitFrontmatter(deepDive).data);
          if (!dd.success) { issues.push(...formatIssues(dd.error).map((i) => `deep-dive ${i}`)); deepDive = null; }
        } catch (e) { issues.push(`deep-dive: ${(e as Error).message}`); deepDive = null; }
      }

      const secretHits = scanForSecrets(raw + '\n' + (deepDive ?? ''));
      if (secretHits.length) { errors.push({ repo: r.nameWithOwner, slug, issues: secretHits.map((h) => `possible secret: ${h}`) }); continue; }

      const meta: RepoMeta = {
        name: r.name, url: r.url, private: r.isPrivate, pushed_at: r.pushedAt, stars: r.stargazerCount,
        languages: r.languages.nodes.map((n) => n.name), topics: r.repositoryTopics.nodes.map((n) => n.topic.name),
      };
      const media = p.publish ? await syncMedia(r.nameWithOwner, p.slug, p.media, issues) : {};
      const content_hash = createHash('sha256').update(raw).update(deepDive ?? '').update(JSON.stringify(media)).digest('hex');

      projects.push({
        slug: p.slug, repo: r.nameWithOwner, repo_meta: meta, title: p.title, publish: p.publish, size: p.size,
        project_md: raw, deep_dive_md: deepDive, media, content_hash,
        source_commit: r.defaultBranchRef?.target.oid ?? null,
        commits_since: await commitsSince(r.nameWithOwner, p.generated.commit),
        issues,
      });
    } catch (e) {
      errors.push({ repo: r.nameWithOwner, slug, issues: [(e as Error).message] });
    }
  }

  const res = await worker('/internal/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ started_at, token_expiry: tokenExpiry, repos_scanned: repos.length, projects, errors }),
  });
  console.log('ingest:', await res.text());
  for (const e of errors) console.warn(`✗ ${e.repo}: ${e.issues.join('; ')}`);
}

if (MODE === 'bootstrap') {
  const empty: Snapshot = { generated_at: new Date().toISOString(), source: 'worker', settings: DEFAULT_SETTINGS, projects: [], activity: [] };
  await writeFile(SNAPSHOT_FILE, JSON.stringify(empty));
  console.log('empty bootstrap snapshot written');
} else {
  if (MODE === 'sync') await sync();
  await writeSnapshot();
}
