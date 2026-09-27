// Where the build gets its data.
//   SNAPSHOT_FILE set  → the snapshot the Worker produced (production / preview builds)
//   otherwise          → fixtures/ (local dev and CI), unless REQUIRE_SNAPSHOT=1
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SETTINGS, type RepoMeta, type Snapshot, type SnapshotProject } from '../../shared/schema.ts';

let cached: Promise<Snapshot> | undefined;

export function loadSnapshot(): Promise<Snapshot> {
  return (cached ??= read());
}

async function read(): Promise<Snapshot> {
  const file = process.env.SNAPSHOT_FILE;
  if (file) return JSON.parse(await readFile(file, 'utf8')) as Snapshot;
  if (process.env.REQUIRE_SNAPSHOT === '1') throw new Error('REQUIRE_SNAPSHOT=1 but SNAPSHOT_FILE is not set');
  return fromFixtures();
}

async function fromFixtures(): Promise<Snapshot> {
  const root = path.resolve('fixtures');
  const repos = JSON.parse(await readFile(path.join(root, 'repos.json'), 'utf8')) as Record<string, RepoMeta>;
  const settings = JSON.parse(await readFile(path.join(root, 'settings.json'), 'utf8')) as { featured: string[]; now: string };
  const projects: SnapshotProject[] = [];
  for (const slug of await readdir(path.join(root, 'repos'))) {
    const dir = path.join(root, 'repos', slug);
    const dd = path.join(dir, 'deep-dive.md');
    const order = settings.featured.indexOf(slug);
    projects.push({
      slug,
      repo: repos[slug],
      featured: order >= 0,
      feature_order: order,
      deep_dive: existsSync(dd),
      project_md: await readFile(path.join(dir, 'project.md'), 'utf8'),
      deep_dive_md: existsSync(dd) ? await readFile(dd, 'utf8') : null,
      media: {},
    });
  }
  return {
    generated_at: new Date().toISOString(),
    source: 'fixtures',
    settings: { ...DEFAULT_SETTINGS, now: settings.now },
    projects,
    activity: [],
  };
}
