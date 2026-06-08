# Chief of Staff Handover — Mohammad Zaki Jariwala

**Last updated:** June 2026  
**Prepared for:** Chief of Staff  
**Contact (Zaki):** jariwalazaki@gmail.com · +91 9601406034 · [WhatsApp](https://wa.me/919601406034)

---

## Who You Are Supporting

**Mohammad Zaki Jariwala** — goes by Zaki. Systems Engineer at Tata Consultancy Services, deployed at State Bank of India (SBI GITC), Navi Mumbai. Three years into what is a strong technical career, now actively pivoting into AI Product Management.

He has four shipped products running concurrently alongside a full-time day job, an active job search, and a certification pursuit. The primary challenge is not capability — it is bandwidth and attention allocation.

Your role: reduce context-switching overhead, track what is open, and make sure nothing falls through the cracks.

---

## Primary Goal (Right Now)

**Land an AI PM role.** Everything else is either in service of that or runs in the background.

The portfolio site, the resume PDF, and the GitHub presence are the three assets that do the work. All three need to stay current and consistent.

---

## Active Projects — Status Overview

### 1. Portfolio Site — `zakijariwala.space`
**Status: Live, recently updated**

The most actively maintained asset. Built on Astro 4 + Tailwind CSS, deployed via Cloudflare Pages from the `ai-pm` branch of `github.com/zakijariwala/resume`.

The site has a three-mode identity system (Recruiter / Developer / Curious). Each mode is a distinct presentation of the same person — different content depth, different tone, different visual language. This is intentional and must be preserved in all edits.

**Recent work done (June 2026):**
- Full AI PM repositioning of all content
- Per-audience bullet divergence restored (all three modes now show genuinely different content)
- Hero stat cards changed to product-forward metrics
- Mode switcher now has a red heartbeat indicator and first-session coachmark
- HR feedback from Accenture contact applied: availability line updated, Zamaan Marine removed from Work History (kept as featured project), certs elaborated, Path of Supplication reframed

**Open items — needs Zaki's input:**
- [ ] 1–2 GitHub repos to make public and link from the site (Content Automation Pipeline and/or Zamaan Marine recommended). Zaki needs to make repos public then provide URLs to add to `src/data/projects.json`
- [ ] Formspree contact form endpoint not activated — form on the site is currently non-functional. Register at formspree.io → get endpoint ID → update `ContactSection.astro`
- [ ] Decap CMS (headless editor at `/admin/`) not yet activated — needs a GitHub OAuth app configured (instructions in `CMS-SETUP-GUIDE.md` in the repo)

**How to edit content without code:**  
All site content lives in `src/data/*.json`. The five files are:
- `meta.json` — name, availability line, taglines, hero stats, about text
- `experience.json` — work history entries with per-mode bullets
- `projects.json` — all six projects with per-mode bullets
- `skills.json` — skills by category and confidence level
- `certifications.json` — cert cards and notes

Any change to these files + a push to `ai-pm` → Cloudflare Pages auto-rebuilds in ~2 minutes.

---

### 2. Zamaan Marine Digital Ecosystem
**Status: Ongoing — Zaki is the sole builder**

A zero-budget digital presence for the family marine parts business. Includes a JAMstack storefront (Astro + Cloudflare Pages), AI cold-email agent (Claude API + Python + Brevo), eBay listing automation (eBay Browse API + Python), and PostHog analytics.

Running in parallel with the day job. Zaki is the only person who works on it.

**No immediate blockers.** Runs autonomously — outreach campaigns are periodic, not continuous.

---

### 3. Content Automation Pipeline
**Status: Built, functional — in use**

A Python pipeline that turns YouTube transcripts into publication-ready Medium articles across 12 niches. 85% reduction in time-to-draft. Has a cross-platform desktop GUI (Tauri + React 19) for non-CLI access.

The "Failure First" framework is the core IP — heuristic validators that reject safe/generic LLM output and force re-generation until prose passes quality gates.

**No immediate blockers.** Used as a personal tool and potential demonstration of AI product thinking.

---

### 4. run.to — Flutter Running App
**Status: Private polish phase — not publicly available**

A full-featured Flutter running app: GPS tracking, ghost routes, crowd radar. Clean Architecture + Riverpod, ~8k LOC, PostGIS backend on Supabase. Had 50+ local alpha users before being taken private for polish.

**Current state:** Not actively being built right now. On hold while job search takes priority. Resume to active development after PM role secured or if bandwidth returns.

---

### 5. Path of Supplication — PWA
**Status: Shipped, live**

Offline-first PWA. 22,000-record SQLite database with FTS5 search, sub-10ms queries, 80MB multilingual payload (Arabic, Urdu, English), zero hosting cost. Validated with 40+ beta testers.

**No ongoing work needed.** Running on its own.

---

### 6. GCP Professional Cloud Architect
**Status: Actively studying — expected completion mid-2026**

Third cloud certification in progress. AWS SAA-C03 and Google GenAI Leader are already complete (both 2024).

**Track:** Is Zaki keeping study schedule? This is the one that could slip under pressure from the job search.

---

### 7. Personal Remote Dev Server
**Status: Operational — 18+ months uptime**

Oracle Cloud Free Tier VM. Hosts long-running builds, pipelines, and SSH sessions. Accessed via Zellij + Termius from phone or laptop.

**No action needed.** Runs in the background.

---

## Day Job

**Tata Consultancy Services → State Bank of India (SBI GITC)**  
Systems Engineer, IDM & Infrastructure  
Mumbai | 2023 – Present | Active

Five-engineer team. 99.999% uptime SLA for Tier-1 banking applications, 30,000+ branch users. Leads ops, mentors junior engineers, handles escalations.

**This is full-time and mandatory.** All side projects and the job search happen around it.

---

## Job Search — Current State

Targeting **AI PM roles** where product and engineering genuinely overlap. Not chasing generic PM titles.

Key credentials:
- AWS Certified Solutions Architect (SAA-C03) — 2024
- Google GenAI Leader — 2024
- GCP Professional Cloud Architect — In progress
- 4 shipped products, 3 years enterprise infra

Resume PDF: `Mohammad_Zaki_Jariwala_Resume.pdf` (in `public/` on the repo)

**Active outreach received:**
- Accenture HR contact (Sohail Gheewala) — feedback applied to portfolio in June 2026

---

## Key Access Points

| Asset | Location |
|---|---|
| Portfolio site | zakijariwala.space |
| Site repo | github.com/zakijariwala/resume · branch `ai-pm` |
| Resume PDF | Available via Download button on portfolio; also in repo `public/` |
| LinkedIn | linkedin.com/in/zakijariwala |
| GitHub | github.com/zakijariwala |
| Email | jariwalazaki@gmail.com |
| WhatsApp | wa.me/919601406034 |
| Cloudflare Pages | Deploys automatically on push to `ai-pm` — no manual step |

---

## Decisions Made — Do Not Revisit Without Reason

These were deliberated and confirmed. Do not reverse without a specific, argued case:

- **Full name on site:** "Mohammad Zaki Jariwala" — not "J. Zaki". Consistency with resume.
- **Three-mode system stays:** It is the core differentiator of the portfolio. Do not flatten it.
- **Zamaan Marine in Projects, not Experience:** Unpaid family venture does not belong in Work History alongside TCS. Featured project slot is a stronger position anyway.
- **Path of Supplication stays:** HR suggested removal. Correct decision is to keep it and lead with the technical achievement, not the domain. It is the only shipped product with a real user community.
- **No box-shadow for depth** in the design system — use border contrast instead.
- **No third accent color** — the token system has Recruiter blue / Developer green / Curious amber. Extend the scale, don't add.

---

## Things to Watch

| Item | Watch for |
|---|---|
| GCP cert study | Is Zaki keeping momentum? Mid-2026 deadline is real. |
| Formspree form | Contact form is currently dead. Anyone using the form reaches nobody. |
| GitHub repos going public | Enabling "View repo" links on featured projects strengthens Developer mode significantly. |
| run.to | Good story for PM roles — needs to be resumed or clearly parked. |
| Hero "currently" block (Curious mode) | Should update every 1–2 months as focus shifts. Currently accurate but will age. |
| Portfolio availability line | Must update the day a job is secured. |

---

## What Good Looks Like

Zaki gets a first-round interview for an AI PM role within 60 days. The portfolio, resume, and LinkedIn tell a consistent story: technical PM with shipping receipts, infrastructure depth, AI/GenAI credentials, and 0-to-1 product experience. The job search does not collapse under the weight of the day job.

---

*This document should be updated whenever a project changes state, a decision is reversed, or a new commitment is made. It is a living document, not a one-time snapshot.*
