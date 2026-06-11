# AGENTS.md — src/

## Purpose
Astro 4 portfolio site source. Mode-adaptive components, page structure, and styles for the three-mode identity system (Recruiter / Developer / Curious).

## Ownership
Owned by root AGENTS.md.

## Local Contracts
- Every section must open with `<SectionHeader label="..." title="..." />` — this pattern is mandatory; it renders `.section-label` (mode-adaptive prefix) + `h2.section-title`
- Mode-adaptive visibility: `.recruiter-only`, `.dev-only`, `.curious-only`, `.all-modes` — use only these classes; do not invent new visibility mechanisms
- Component responsibilities:
  - `Hero.astro` — hero section with mode-adaptive right column (stat grid vs "currently" block)
  - `ExperienceCard.astro` — single role; `ExperienceSection.astro` — full work history
  - `ProjectCard.astro` — standard grid card; `FeaturedProjectCard.astro` — full-width featured card
  - `StatCard.astro` — hero stat card (max 4 in Recruiter/Developer modes)
  - `KpiRow.astro` — per-role KPI row in experience section
  - `FloatingHireCTA.astro` — floating WhatsApp CTA; do not add a second floating element
  - `SectionHeader.astro` — mandatory section opener
- `layouts/Base.astro` is the only layout — all pages use it
- `pages/index.astro` is the only page — single-page site
- Scroll fade-in: add `class="fade-in"` to elements; JS in `Base.astro` handles IntersectionObserver

## Work Guidance
- Content changes: edit `src/data/*.json`, not components
- New section: add component, add `<SectionHeader>`, add to `pages/index.astro`, add nav link
- Style changes: edit `src/styles/global.css` tokens only

## Child DOX Index
- `data/AGENTS.md` — content JSON schema and single source of truth rules
