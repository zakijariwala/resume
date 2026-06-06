# Project Handover — Portfolio Site (zakijariwala.space)

**Prepared for:** Chief of Staff
**Date:** 2026-06-06
**Owner:** Zaki Jariwala (jariwalazaki@gmail.com)
**Repo:** github.com/zakijariwala/resume
**Active branch:** `ai-pm`

---

## What This Project Is

Professional portfolio site for Zaki's AI PM job search. The primary asset recruiters and hiring managers see after finding him on LinkedIn or GitHub. Three-mode identity system (Recruiter / Developer / Curious) — each mode is a distinct visual and content presentation, not a filter. Must feel like three different websites.

**Live URL:** zakijariwala.space
**Hosting:** Cloudflare Pages (auto-deploys from `ai-pm` branch, ~2 min build)
**Stack:** Astro 4 + Tailwind CSS 3 + TypeScript
**CMS:** Decap CMS at `/admin/` (not yet activated — see Pending Actions)

**Target outcome:** First-round interview for an AI PM role within 60 days of last update.

---

## Current Status

**Live and recently updated (June 2026).** Full AI PM repositioning completed.

**What was done in the last session:**
- Per-audience bullet divergence restored across all three modes
- Hero stat cards changed to product-forward metrics
- Mode switcher: red heartbeat indicator + first-session coachmark added
- HR feedback from Accenture contact (Sohail Gheewala) applied:
  - Availability line updated
  - Zamaan Marine removed from Work History → moved to featured project
  - Certifications elaborated with dedicated section
  - Path of Supplication reframed to lead with technical achievement

---

## Pending Owner Actions

- [ ] Make 1–2 GitHub repos public and provide URLs to add to `src/data/projects.json` (Content Automation Pipeline and/or Zamaan Marine recommended — strengthens Developer mode significantly)
- [ ] Activate Formspree contact form: register at formspree.io → get endpoint ID → update `src/components/ContactSection.astro`. Currently the contact form on the site is non-functional.
- [ ] Activate Decap CMS (optional): follow `CMS-SETUP-GUIDE.md` in repo to configure GitHub OAuth app — enables editing content via browser without code
- [ ] Update Curious mode "currently" block every 1–2 months as focus shifts (currently accurate)
- [ ] Update availability line the day a job is secured

---

## Day-to-Day Operating Procedure

**To edit content (no code):**
All site content lives in `src/data/*.json`:
- `meta.json` — name, availability line, taglines, hero stats, about text
- `experience.json` — work history entries with per-mode bullets
- `projects.json` — all projects with per-mode bullets
- `skills.json` — skills by category and confidence level
- `certifications.json` — cert cards and notes

Edit the relevant JSON file → push to `ai-pm` → Cloudflare Pages rebuilds in ~2 min.

**To edit layout or components:** edit `.astro` files in `src/components/` — then push.

---

## Deployment

```
Push to ai-pm branch → Cloudflare Pages auto-detects → builds in ~2 min → live
```

**Local dev:**
```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # Verify build passes before pushing
```

---

## Repo Structure

```
resume/
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── ExperienceSection.astro / ExperienceCard.astro
│   │   ├── ProjectsSection.astro / ProjectCard.astro / FeaturedProjectCard.astro
│   │   ├── SkillsSection.astro
│   │   ├── CertificationsSection.astro
│   │   ├── ContactSection.astro       ← Update Formspree endpoint here
│   │   ├── Footer.astro
│   │   ├── SectionHeader.astro        ← Reusable label + title (mandatory on every section)
│   │   ├── StatCard.astro
│   │   └── KpiRow.astro
│   ├── layouts/Base.astro
│   ├── pages/index.astro
│   ├── styles/global.css              ← All design tokens in :root — never hardcode hex values
│   └── data/                          ← Edit these JSON files to change content
│       ├── meta.json
│       ├── experience.json
│       ├── projects.json
│       ├── skills.json
│       └── certifications.json
├── public/
│   ├── admin/                         ← Decap CMS (not yet activated)
│   └── ZAKI.J_Resume.pdf
├── CLAUDE.md
├── DESIGN-SYSTEM.md
├── CONTENT-GOVERNANCE.md
└── CMS-SETUP-GUIDE.md
```

---

## Budget & Running Cost

| Service | Plan | Monthly cost | Notes |
|---------|------|-------------|-------|
| Cloudflare Pages | Free | £0 | |
| GitHub | Free | £0 | Public repo |
| Google Fonts | Free | £0 | Fraunces, JetBrains Mono, Inter |
| Formspree | Free tier | £0 | 50 submissions/month free |

**Total: £0/month**

---

## Escalate to Owner If

- Contact form receives an inbound (once Formspree is activated) — potential recruiter or opportunity
- Portfolio availability line needs updating — only Zaki can confirm employment status change
- Three-mode system is proposed to be removed or flattened — this is the core differentiator, Zaki decides
- Any change to the resume PDF — must be consistent with site content

---

## Decisions Made — Do Not Revisit

- **Full name "Mohammad Zaki Jariwala"** — not "J. Zaki." Consistent with resume PDF.
- **Three-mode system stays** — core differentiator. Do not flatten to a single view.
- **Zamaan Marine in Projects, not Work History** — unpaid family venture. Featured project slot is stronger.
- **Path of Supplication stays on CV** — HR suggested removing it. Keep it; lead with technical achievement (offline PWA, 22k-line search, multilingual, 40+ beta testers).
- **No box-shadow for depth** — use border contrast and background contrast instead.
- **No third accent colour** — Recruiter blue / Developer green / Curious amber. Extend the scale, don't add.
- **No `font-weight > 600` on display font** — enforced in design system.

---

## Quick Reference

| Task | Action |
|------|--------|
| Edit content | Update relevant file in `src/data/*.json` → push to `ai-pm` |
| Add a project | Edit `src/data/projects.json` — add per-mode bullets for all 3 modes |
| Update resume PDF | Replace `public/ZAKI.J_Resume.pdf` and push |
| Activate contact form | Get Formspree endpoint ID → update `ContactSection.astro` |
| Run locally | `npm run dev` → http://localhost:4321 |
| Check live site | zakijariwala.space |
