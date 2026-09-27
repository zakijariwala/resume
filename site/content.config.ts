// Projects and deep-dives come from the snapshot (repos' for_resume/ folders),
// validated against the same schema the sync uses.
import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { projectSchema, deepDiveSchema, splitFrontmatter, formatIssues } from '../shared/schema.ts';
import { loadSnapshot } from './lib/snapshot.ts';
import { sanitizeMarkdown } from './lib/markdown.ts';

function snapshotLoader(kind: 'project' | 'deep-dive'): Loader {
  return {
    name: `snapshot-${kind}`,
    async load({ store, logger, renderMarkdown, generateDigest }) {
      const snap = await loadSnapshot();
      store.clear();
      for (const sp of snap.projects) {
        const raw = kind === 'project' ? sp.project_md : sp.deep_dive_md;
        if (!raw) continue;
        try {
          const { data, body } = splitFrontmatter(raw);
          const parsed = (kind === 'project' ? projectSchema : deepDiveSchema).safeParse(data);
          if (!parsed.success) {
            logger.warn(`${sp.slug} (${kind}) skipped: ${formatIssues(parsed.error).join('; ')}`);
            continue;
          }
          if ('publish' in parsed.data && !parsed.data.publish) continue;
          const clean = sanitizeMarkdown(body);
          store.set({
            id: sp.slug,
            data: {
              ...parsed.data,
              slug: sp.slug,
              repo: sp.repo,
              featured: sp.featured,
              feature_order: sp.feature_order,
              has_deep_dive: sp.deep_dive && !!sp.deep_dive_md,
              media_urls: sp.media,
            },
            body: clean,
            rendered: await renderMarkdown(clean),
            digest: generateDigest(raw),
          });
        } catch (e) {
          logger.warn(`${sp.slug} (${kind}) skipped: ${(e as Error).message}`);
        }
      }
    },
  };
}

export const collections = {
  projects: defineCollection({ loader: snapshotLoader('project') }),
  deepDives: defineCollection({ loader: snapshotLoader('deep-dive') }),
};
