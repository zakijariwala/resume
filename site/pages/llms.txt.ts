// Plain-text summary for AI assistants and recruiter tools (https://llmstxt.org).
import type { APIRoute } from 'astro';
import { getProfile, getProjects } from '../lib/data';

export const GET: APIRoute = async ({ site }) => {
  const profile = await getProfile();
  const projects = await getProjects();
  const url = (p: string) => new URL(p, site).toString();
  const lines = [
    `# ${profile.name}`,
    '',
    `> ${profile.headline} ${profile.lede}`,
    '',
    profile.intro,
    '',
    '## Profile',
    `- [Experience and certifications](${url('/experience/')})`,
    `- [Skills](${url('/skills/')})`,
    `- [Résumé (PDF)](${url('/resume.pdf')})`,
    `- [Résumé (JSON Resume)](${url('/resume.json')})`,
    `- [Contact](${url('/contact/')})`,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.data.title}](${url(`/work/${p.id}/`)}): ${p.data.summary}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
