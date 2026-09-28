// Single definition of the for_resume/ contract (docs/for-resume-prompt.md, schema 2).
// Used by scripts/sync.ts (validation at fetch time), the Astro loader (build time)
// and the Worker (snapshot shape). Limits here are deliberately a little looser than
// the prompt's guidance so a slightly long sentence does not unpublish a project.
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';

export const CATEGORIES = [
  'reliability', 'cloud', 'infra', 'product', 'automation', 'ai',
  'data', 'web', 'mobile', 'embedded', 'security',
] as const;

// YAML reads an unquoted list item containing ": " as a one-key map
// ("- Three layers: unit, e2e" → { "Three layers": "unit, e2e" }). Turn it back into text.
const unmap = (v: unknown) =>
  v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1
    ? `${Object.keys(v)[0]}: ${String(Object.values(v)[0])}`
    : v;
const textList = (max: number, count: number) =>
  z.preprocess((v) => (Array.isArray(v) ? v.map(unmap) : v), z.array(text(max)).max(count));

const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, 'expected YYYY or YYYY-MM');
const text = (max: number) => z.string().trim().max(max);

export const metricSchema = z.object({
  value: text(24).min(1),
  label: text(100).min(1),
  evidence: text(300).default(''),
});

export const projectSchema = z.object({
  schema: z.literal(2),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  title: text(80).min(1),
  tagline: text(90).default(''),
  publish: z.boolean(),
  reason: z.string().default(''),
  status: z.enum(['active', 'shipped', 'maintained', 'paused', 'archived', 'experiment']).default('active'),
  kind: z.enum(['product', 'tool', 'library', 'infrastructure', 'automation', 'experiment', 'client-work', 'learning']).default('product'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  started: z.coerce.string().pipe(yearMonth).optional(),
  ended: z.coerce.string().pipe(yearMonth).nullable().optional(),
  role: text(120).default(''),
  summary: text(280).default(''),
  problem: text(400).default(''),
  stack: z.array(text(40)).max(12).default([]),
  categories: z.array(z.enum(CATEGORIES)).max(3).default([]),
  links: z.object({
    live: z.string().default(''),
    docs: z.string().default(''),
    demo: z.string().default(''),
  }).partial().default({}),
  metrics: z.array(metricSchema).max(4).default([]),
  highlights: z.object({
    recruiter: textList(400, 5).default([]),
    engineer: textList(500, 6).default([]),
    story: text(700).default(''),
  }).default({}),
  skills: textList(60, 10).default([]),
  ai_assisted: z.boolean().default(false),
  media: z.array(z.object({ path: z.string().min(1), alt: text(200).default('') })).max(3).default([]),
  todo_owner: textList(1000, 50).default([]),
  generated: z.object({ at: z.coerce.string(), commit: z.coerce.string() }).partial().default({}),
}).superRefine((p, ctx) => {
  if (p.publish && !p.summary) ctx.addIssue({ code: 'custom', path: ['summary'], message: 'required when publish is true' });
  for (const [k, v] of Object.entries(p.links)) {
    if (v && !/^https:\/\//.test(v)) ctx.addIssue({ code: 'custom', path: ['links', k], message: 'must be an https URL' });
  }
});

export const deepDiveSchema = z.object({
  schema: z.literal(2),
  slug: z.string(),
  title: text(120).min(1),
  summary: text(280).default(''),
  generated: z.object({ at: z.coerce.string(), commit: z.coerce.string() }).partial().default({}),
});

export type Project = z.infer<typeof projectSchema>;
export type DeepDive = z.infer<typeof deepDiveSchema>;

/** Split `---` YAML frontmatter from a markdown body. */
export function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('missing YAML frontmatter');
  return { data: parseYaml(m[1]), body: m[2] };
}

export function formatIssues(err: z.ZodError): string[] {
  return err.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
}

// ---------------------------------------------------------------------------
// Snapshot: what the Worker hands the build. Produced by /internal/snapshot.

export interface RepoMeta {
  name: string;
  url: string;
  private: boolean;
  pushed_at: string | null;
  stars: number;
  languages: string[];
  topics: string[];
}

export interface SnapshotProject {
  slug: string;
  repo: RepoMeta;
  featured: boolean;
  feature_order: number;
  deep_dive: boolean;
  project_md: string;
  deep_dive_md: string | null;
  /** repo-relative media path -> public URL (/media/...) */
  media: Record<string, string>;
}

export interface Settings {
  availability: string;
  now: string;
  show_ai_note: boolean;
  sections: Record<string, boolean>;
}

export interface Snapshot {
  generated_at: string;
  source: 'worker' | 'fixtures';
  settings: Settings;
  projects: SnapshotProject[];
  activity: { slug: string; title: string; pushed_at: string }[];
}

export const SCAFFOLD_SECTIONS = ['writing', 'talks', 'open-source', 'uses'] as const;

export const DEFAULT_SETTINGS: Settings = {
  availability: 'Open to reliability, cloud and technical leadership roles. Mumbai-based, open to relocation.',
  now: '',
  show_ai_note: true,
  sections: Object.fromEntries(SCAFFOLD_SECTIONS.map((s) => [s, false])),
};
