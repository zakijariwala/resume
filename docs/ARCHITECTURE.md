# zakijariwala.space — v2 architecture (proposal, pre-build)

Status: **P1–P4 built on `claude/architecture-revamp-prep-1hbfze`; P5 (cutover) and P6 (cleanup)
pending.** Replaces the three-mode Astro 4 site. Setup: `docs/SETUP.md`.

### Changes from the original plan

- **The sync runs in GitHub Actions, not in the Worker.** Parsing and validating ~30 markdown
  files can exceed the free plan's ~10 ms CPU per Worker invocation, and GitHub Actions has no
  such limit. The Worker cron still owns the schedule: it fires `repository_dispatch`, which avoids
  GitHub disabling scheduled workflows after 60 days of repo inactivity. The Worker stores state,
  serves the snapshot and handles everything at runtime.
- **Content is stored in D1, not R2.** Rows are small; R2 holds media and PDFs only.
- **Astro 5.18**, the version approved. Astro 7 is current and can be adopted later.
- **Headline:** option (c) as the H1 and option (b) as the lede underneath it.

---

## 1. Decisions locked

| Topic | Decision |
|---|---|
| Positioning | Reliability / cloud engineer moving into technical leadership and product ownership. Lead with ownership and outcomes; engineering depth is the credibility layer, not the headline. |
| Audience modes | **Removed.** One site. Audiences served by depth: outcome-first cards (recruiters) → case study (engineers) → `story` field (personal voice) → optional deep-dive (hiring managers). |
| Project source | `for_resume/` in every owned repo, public and private, fetched weekly. Schema: `docs/for-resume-prompt.md`. |
| Publishing | Automatic on sync. Admin toggles override. |
| AI disclosure | Never described in content. Only `ai_assisted: true` → one neutral line, globally switchable in admin. |
| Résumé | One main PDF with download button; variants managed in admin. |
| Hosting | Cloudflare only, free plan. |
| Cleanup | Old branches, old Pages project, stale docs removed after cutover (§9). |
| Extra sections | Scaffolded, hidden until content exists (§6). |

---

## 2. Framework evaluation

Requirements: static public pages (speed, SEO, resilience), markdown with schema
validation, a server-rendered admin, a cron job, all inside one free Worker (3 MB bundle,
~10 ms CPU per request).

| Option | Public site | Admin + API + cron | Verdict |
|---|---|---|---|
| **Astro 5 (static) + Hono Worker** | Zero JS by default; content layer + zod validation built for exactly this; markdown native | Hono: ~15 KB, Cloudflare-native, server-rendered JSX for admin, `scheduled` handler for cron | **Recommended** |
| Astro 5 with Cloudflare adapter (SSR routes) | Same | Admin as on-demand Astro routes; cron needs a custom worker entry around the adapter | Workable, but couples the admin to the site build and fights the adapter for cron |
| SvelteKit + adapter-cloudflare | Prerendered pages fine | Excellent form actions for admin | Ships a client runtime; weaker markdown/content validation story; second paradigm to learn |
| Next.js via OpenNext | Heavy | Heavy | Worker bundle size limit on free plan is a real risk. Reject |
| Eleventy / Hugo | Excellent static output | None — admin still needs a separate Worker | No typed content validation; gains nothing over Astro |
| React Router v7 / Remix | SSR-first | Good | React runtime for a mostly static site. Reject |

**Recommendation: Astro 5 for the public site, Hono for the Worker.** They share one zod
schema package so the Worker validates at sync time and the site validates at build time
against the same definition. No client-side framework anywhere; the admin is plain
server-rendered HTML forms with a few lines of inline JS.

**Dependencies to add (needs owner OK):** `astro@5`, `hono`, `zod`, `yaml`, `wrangler` (dev),
`@cloudflare/workers-types` (dev). Tailwind dropped in favour of CSS custom properties.

---

## 3. System overview

```
 repos/*/for_resume/{project.md, deep-dive.md, media}
            ▲ 1 GraphQL call (all repos + metadata + file text), media via REST
 GitHub Action "Sync and deploy": scripts/sync.ts → validate (zod) → secret-scan
            │ POST /internal/ingest, PUT /internal/media/*
            ▼
 ┌──────────────────── Worker "zakijariwala" (Hono) ─────────────────────┐
 │ scheduled: Mon 03:00 UTC → repository_dispatch "sync"                 │
 │ /internal/*      ingest, snapshot, media upload (Bearer BUILD_TOKEN)  │
 │ /api/contact     Turnstile → D1 → email notify                        │
 │ /r/:token        tracked résumé variant link → log view → stream PDF  │
 │ /resume.pdf      streams current main PDF from R2 (counts downloads)  │
 │ /media/*         project images copied from repos into R2             │
 │ /work/:slug*     visibility gate (404 instantly when hidden)          │
 │ /admin/*         behind Cloudflare Access                             │
 │ everything else  static assets (Astro build output)                   │
 └───────┬───────────────────┬─────────────────────┬─────────────────────┘
         │                   │                     │
   R2: media, PDFs      D1: content, flags,   Email Routing: notify owner
                        runs, messages,       (contact, résumé opens,
                        links, settings        weekly digest)
         │
 admin change → repository_dispatch "rebuild"
         ▼
 GitHub Action: fetch snapshot → astro build → wrangler deploy  (~2 min)
```

Why the build and sync run in GitHub Actions and not in the Worker: they need Node and more
CPU than a free Worker invocation allows. The Worker only decides *when* they run.

Failure behaviour: an invalid or secret-flagged file is skipped and the previous version stays
live; the problem is listed in admin and the digest. If the Worker is down, static pages keep
serving. If GitHub is down, the sync retries next run.

---

## 4. Visibility model

Per project, stored in D1 and never overwritten by sync:

| Flag | Effect |
|---|---|
| `visible` | Off → removed from every page, listing, sitemap, skills links and JSON outputs |
| `featured` + `feature_order` | Shown on the homepage in that order (max 3) |
| `deep_dive` | Only offered if `deep-dive.md` exists and is valid; off → page not built |
| `pinned_content` | Freeze the current synced version; later syncs are stored but not published |

**Toggle behaviour.** Flipping a flag (1) makes the Worker 404 `/work/<slug>` and
`/work/<slug>/deep-dive` instantly, then (2) triggers a rebuild that removes the project
from the homepage and listings within ~2 min. All layouts are generated from the visible
list: grids reflow, featured shows 1–3 cards with no empty slots, and a section with zero
items is omitted entirely. Nothing else on the page changes.

Default for newly discovered projects: `visible` follows `publish` from the file,
`featured` off, `deep_dive` on if the file exists.

**Deep-dive pages — assessment.** Worth it for 2–3 flagship projects: decision logs and
"what went wrong" sections are exactly the evidence of judgement a leadership/product move
needs, and they give interviewers something concrete to ask about. Not worth it as a
default: long AI-drafted text reads generic fast and few visitors read it. So: generated
only for `size: large`, individually toggled, and linked from the case study rather than
the homepage.

---

## 5. Admin panel (`/admin`, Cloudflare Access, owner only)

- **Dashboard** — last/next sync, result, changes, errors, repos with stale summaries
  (commits since `generated.commit`), GitHub token expiry, last deploy, inbox count.
- **Projects** — table: title, repo, public/private, status, synced version, validation
  and secret-scan result, toggles from §4, drag order for featured, "resync this repo",
  view raw file, preview.
- **Résumé** — upload PDF; mark one as main (drives the download button); variants with
  labels (e.g. "SRE — Gulf"); create tracked links per variant + recipient; views log;
  revoke link; download counts.
- **Profile** — availability line, "now" note, headline choice, contact details shown.
- **Sections** — on/off for each scaffolded section (§6) and the AI-assisted note.
- **Inbox** — contact messages; mark read; delete.
- **Site** — trigger sync, trigger rebuild, deploy history.

Fast-changing text (availability, now) lives in D1 via admin. Slow-changing structured
history (experience, certifications, education, skills taxonomy) lives in git under
`content/profile/`, seeded from the current `src/data/*.json`, so it has version history.

---

## 6. Pages

| Route | Content | Source |
|---|---|---|
| `/` | Headline, proof strip (evidenced metrics only), featured projects, experience summary, now, contact CTA, résumé download | profile + repos + admin |
| `/work` | All visible projects, filter by category | sync |
| `/work/[slug]` | Case study + live repo facts (last push, languages, private badge, staleness) | sync |
| `/work/[slug]/deep-dive` | Long-form page | sync, toggle |
| `/experience` | Web résumé: roles, KPIs, certifications, education; PDF button | `content/profile/` |
| `/skills` | Skills grouped (Reliability · Cloud · Leadership & delivery · Product · Engineering), each linked to projects that evidence it | derived from project `skills`/`stack` + profile |
| `/now` | Admin note + auto "pushed this week" | admin + sync |
| `/contact` | Form (Turnstile) + direct links | Worker |
| `/r/:token` | Tracked résumé variant | Worker |
| Machine-readable | `/resume.json` (JSON Resume), `/llms.txt`, JSON-LD `Person`, `sitemap.xml`, `robots.txt` | build |

**Scaffolded, hidden until content exists:** `/writing` (articles, links out),
`/talks`, `/open-source` (contributions to others' repos — can be auto-filled from the
GitHub GraphQL contributions data in the same sync call), `/uses`, testimonials block
(stays empty until real ones exist — nothing invented).

---

## 7. Data model (D1)

```
projects(slug PK, repo, is_private, visible, featured, feature_order, deep_dive,
         pinned_content, content_hash, source_commit, commits_since, synced_at, issues_json)
sync_runs(id PK, started_at, finished_at, result, changed_json, errors_json)
resume_files(id PK, label, r2_key, is_main, uploaded_at)
resume_links(token PK, file_id, recipient, note, created_at, revoked_at)
resume_events(id PK, token NULL, kind, at, country, ua)     -- view | download
messages(id PK, name, email, body, at, read_at)
settings(key PK, value)                                      -- availability, now, sections, ai_note...
```

Content (`project_md`, `deep_dive_md`) lives in the `projects` table; the exact schema is
`worker/migrations/0001_init.sql`. R2 holds `media/<slug>/<hash>.<ext>` and `resume/<id>.pdf`.
The build consumes `/internal/snapshot`: visible projects + flags + admin settings.

---

## 8. Free-tier fit (verify limits at build time)

| Constraint | Plan |
|---|---|
| ~50 outbound requests per Worker run | Not an issue: fetching runs in GitHub Actions |
| ~10 ms CPU per request | Worker never parses markdown; validation is in the Action, rendering at build |
| 100k Worker requests/day | Static assets don't count; only `/api`, `/r`, `/admin`, `/work` gate, `/resume.pdf` do |
| Cron trigger slots | One (weekly sync); digest runs inside it |
| Access seats | 1 needed |
| GitHub token | Fine-grained PAT, read-only contents + metadata on all repos; expiry shown in admin, digest warns 30 days out |

---

## 9. Phases

| Phase | Scope | Exit check |
|---|---|---|
| P0 | Owner runs the prompt across repos; answers OPEN items | ≥ 3 repos have valid `for_resume/` |
| P1 | New skeleton on this branch: Astro 5 + Hono Worker + shared schema; deploy to `*.workers.dev` preview | Preview serves a page; build green |
| P2 | Sync: GraphQL, R2/D1, validation, secret scan, dispatch → build → deploy | Changing a repo's file updates preview after resync |
| P3 | Public pages + design system | All §6 routes render with real content, 320–1280 px, both themes |
| P4 | Admin, Access, visibility toggles, résumé upload/variants/links, contact, email | Toggle hides a project with no other change |
| P5 | Machine-readable outputs, analytics, SEO, domain cutover | zakijariwala.space served by the Worker |
| P6 | Cleanup: delete old branches, close PR #5, retire Pages project + GitHub Pages workflow, remove stale docs, rewrite `CLAUDE.md` | Repo contains only v2 |

---

## 10. OPEN

1. **Deletion blocked:** removing `cos-os/`, `misc/`, the old `src/`, `public/`, `tailwind.config.mjs`,
   `DESIGN*.md`, `CONTENT-GOVERNANCE.md`, `CMS-SETUP-GUIDE.md`, `HANDOVER.md`, `.agents/`,
   `skills-lock.json` and the two `cos-*` workflows needs owner approval in the session.
2. ~~**GCP Professional Cloud Architect** completed (2026)~~ — confirmed by owner 2026-09-28.
3. **Skills dropped:** "Anthropic Claude API & Prompt Engineering", "AI Agent Design &
   Deployment" and "Private AI Security Harnesses". Restore any you want in `content/profile.yaml`.
