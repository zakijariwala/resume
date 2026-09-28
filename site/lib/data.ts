import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { Project, RepoMeta } from '../../shared/schema.ts';
import { SCAFFOLD_SECTIONS } from '../../shared/schema.ts';
import { loadSnapshot } from './snapshot.ts';

// ---------------------------------------------------------------------------
// Projects

export type ProjectData = Project & {
  repo: RepoMeta;
  featured: boolean;
  feature_order: number;
  has_deep_dive: boolean;
  media_urls: Record<string, string>;
};
export type ProjectEntry = Omit<CollectionEntry<'projects'>, 'data'> & { data: ProjectData };

const STATUS_RANK: Record<string, number> = { active: 0, shipped: 1, maintained: 2, experiment: 3, paused: 4, archived: 5 };

export async function getProjects(): Promise<ProjectEntry[]> {
  const all = (await getCollection('projects')) as unknown as ProjectEntry[];
  return all.sort((a, b) =>
    Number(b.data.featured) - Number(a.data.featured)
    || (a.data.featured ? a.data.feature_order - b.data.feature_order : 0)
    || sizeRank(b) - sizeRank(a)
    || (STATUS_RANK[a.data.status] ?? 9) - (STATUS_RANK[b.data.status] ?? 9)
    || (b.data.started ?? '').localeCompare(a.data.started ?? ''),
  );
}
const SIZE_RANK = { large: 2, medium: 1, small: 0 } as const;
const sizeRank = (p: ProjectEntry) => SIZE_RANK[p.data.size];

export async function getFeatured(max = 3) {
  return (await getProjects()).filter((p) => p.data.featured).slice(0, max);
}

export const CATEGORY_LABEL: Record<string, string> = {
  reliability: 'Reliability', cloud: 'Cloud', infra: 'Infrastructure', product: 'Product', automation: 'Automation',
  ai: 'AI', data: 'Data', web: 'Web', mobile: 'Mobile', embedded: 'Embedded', security: 'Security',
};

export function period(p: { started?: string; ended?: string | null; status?: string }) {
  const fmt = (s: string) => {
    const [y, m] = s.split('-');
    return m ? `${new Date(Number(y), Number(m) - 1).toLocaleString('en-GB', { month: 'short' })} ${y}` : y;
  };
  if (!p.started) return '';
  if (p.ended) return p.ended === p.started ? fmt(p.started) : `${fmt(p.started)} – ${fmt(p.ended)}`;
  return ['archived', 'paused'].includes(p.status ?? '') ? fmt(p.started) : `${fmt(p.started)} – present`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Settings (admin-controlled, via snapshot)

export async function getSettings() {
  const snap = await loadSnapshot();
  return { ...snap.settings, activity: snap.activity, source: snap.source };
}

// ---------------------------------------------------------------------------
// Profile (content/profile.yaml)

const metric = z.object({ value: z.string(), label: z.string() });
const profileSchema = z.object({
  name: z.string(),
  short_name: z.string(),
  location: z.string(),
  relocation: z.string().default(''),
  headline: z.string(),
  lede: z.string(),
  intro: z.string(),
  links: z.object({ email: z.string(), linkedin: z.string().url(), github: z.string().url() }),
  proof: z.array(metric).max(6),
  experience: z.array(z.object({
    id: z.string(),
    title: z.string(),
    org: z.string(),
    client: z.string().nullable(),
    start: z.coerce.string(),
    end: z.coerce.string().nullable(),
    kpis: z.array(metric).default([]),
    outcomes: z.array(z.string()),
    detail: z.array(z.string()).default([]),
  })),
  education: z.array(z.object({ degree: z.string(), institution: z.string(), year: z.coerce.string() })),
  certifications: z.array(z.object({
    name: z.string(), issuer: z.string(), year: z.coerce.string(), status: z.enum(['completed', 'in_progress']),
  })),
  skills: z.array(z.object({
    group: z.string(),
    items: z.array(z.object({ name: z.string(), level: z.enum(['confident', 'familiar', 'learning']) })),
  })),
});
export type Profile = z.infer<typeof profileSchema>;

let profile: Promise<Profile> | undefined;
export function getProfile(): Promise<Profile> {
  return (profile ??= readFile(path.resolve('content/profile.yaml'), 'utf8').then((t) => profileSchema.parse(parseYaml(t))));
}

// ---------------------------------------------------------------------------
// Scaffolded sections (content/sections/*.yaml + admin toggle)

const sectionSchema = z.object({
  title: z.string(),
  intro: z.string().default(''),
  items: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    date: z.coerce.string().optional(),
    event: z.string().optional(),
    note: z.string().optional(),
  })).nullable().transform((v) => v ?? []),
});
export type Section = z.infer<typeof sectionSchema> & { key: string };

/** Sections that are switched on in admin AND have at least one item. */
export async function getLiveSections(): Promise<Section[]> {
  const { sections } = await getSettings();
  const out: Section[] = [];
  for (const key of SCAFFOLD_SECTIONS) {
    if (!sections[key]) continue;
    const raw = await readFile(path.resolve(`content/sections/${key}.yaml`), 'utf8');
    const s = sectionSchema.parse(parseYaml(raw));
    if (s.items.length) out.push({ ...s, key });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Skills evidenced by projects

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();

/** Each project skill/stack item → the projects that demonstrate it (≥1). */
export async function getEvidence() {
  const map = new Map<string, { label: string; projects: { slug: string; title: string }[] }>();
  for (const p of await getProjects()) {
    for (const s of new Set([...p.data.skills, ...p.data.stack])) {
      const key = norm(s);
      if (!key) continue;
      const entry = map.get(key) ?? { label: s, projects: [] };
      if (!entry.projects.some((x) => x.slug === p.id)) entry.projects.push({ slug: p.id, title: p.data.title });
      map.set(key, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.projects.length - a.projects.length || a.label.localeCompare(b.label));
}
