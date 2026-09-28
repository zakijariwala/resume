// JSON Resume (https://jsonresume.org/schema) built from the same data as the site.
import type { APIRoute } from 'astro';
import { getProfile, getProjects } from '../lib/data';

export const GET: APIRoute = async ({ site }) => {
  const profile = await getProfile();
  const projects = await getProjects();
  const url = (p: string) => new URL(p, site).toString();
  const body = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: profile.name,
      label: profile.headline,
      email: profile.links.email,
      url: url('/'),
      summary: profile.intro,
      location: { city: profile.location },
      profiles: [
        { network: 'LinkedIn', url: profile.links.linkedin },
        { network: 'GitHub', url: profile.links.github },
      ],
    },
    work: profile.experience.map((e) => ({
      name: e.org,
      position: e.title,
      startDate: e.start,
      ...(e.end ? { endDate: e.end } : {}),
      summary: e.client ? `Deployed at ${e.client}` : undefined,
      highlights: e.outcomes,
    })),
    education: profile.education.map((e) => ({ institution: e.institution, studyType: e.degree, endDate: e.year })),
    certificates: profile.certifications.filter((c) => c.status === 'completed').map((c) => ({ name: c.name, issuer: c.issuer, date: c.year })),
    skills: profile.skills.map((g) => ({ name: g.group, keywords: g.items.map((i) => i.name) })),
    projects: projects.map((p) => ({
      name: p.data.title,
      description: p.data.summary,
      highlights: p.data.highlights.recruiter,
      keywords: p.data.stack,
      url: url(`/work/${p.id}/`),
      ...(p.data.started ? { startDate: p.data.started } : {}),
      ...(p.data.ended ? { endDate: p.data.ended } : {}),
    })),
    meta: { canonical: url('/resume.json'), lastModified: new Date().toISOString() },
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
