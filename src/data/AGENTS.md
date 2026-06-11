# AGENTS.md — src/data/

## Purpose
Single source of truth for all portfolio content. Five JSON files feed every component. Decap CMS reads and writes these files via the GitHub API.

## Ownership
Owned by `src/AGENTS.md`.

## Local Contracts
- `meta.json` — name, availability line, hero taglines (3 per mode), hero stat cards (exactly 4), about text (3 per mode), "currently" block for Curious mode
- `experience.json` — work history; each role has `bullets` with `recruiter`, `developer`, `curious` arrays; bullets must diverge meaningfully across modes — they are not the same text reformatted
- `projects.json` — up to 6 projects (1 featured + up to 5 standard); each has `bullets` per mode; `featured: true` on exactly one entry
- `skills.json` — skills by category; exactly 6 categories to match the tabbed UI
- `certifications.json` — cert cards; no hard limit but grid is 3-column
- Decap CMS `public/admin/config.yml` must stay in sync with this data structure — if a field is added here, add it to the CMS config too
- Do not remove fields that the CMS config references — CMS edits will fail silently

## Work Guidance
- Add project: add to `projects.json`; if replacing an existing project, remove the old entry
- Update availability: edit `meta.json` availability line
- Add experience bullet: edit the relevant role in `experience.json`; update all three mode arrays
