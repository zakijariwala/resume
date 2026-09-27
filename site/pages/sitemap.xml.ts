import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getLiveSections, getProjects } from '../lib/data';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getProjects();
  const dives = new Set((await getCollection('deepDives')).map((d) => d.id));
  const paths = [
    '/', '/work/', '/experience/', '/skills/', '/now/', '/contact/',
    ...(await getLiveSections()).map((s) => `/${s.key}/`),
    ...projects.map((p) => `/work/${p.id}/`),
    ...projects.filter((p) => p.data.has_deep_dive && dives.has(p.id)).map((p) => `/work/${p.id}/deep-dive/`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
