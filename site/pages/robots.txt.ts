import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *
Disallow: /admin
Disallow: /r/
Disallow: /api/
Disallow: /internal/

Sitemap: ${new URL('/sitemap.xml', site)}
`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
