# AUDIT.md — Repository Baseline

> ## CORRECTION (2026-08-20): this audit read the wrong branch
>
> Everything below describes **`main`**. `main` is not what serves
> zakijariwala.space.
>
> **Production is Cloudflare Pages project `resume`, building from branch
> `ai-pm`**, with automatic deployments and custom domain zakijariwala.space
> (plus resume-e4n.pages.dev). `ai-pm` is **31 commits ahead of `main`**;
> `main` contains nothing that `ai-pm` does not. `HANDOVER.md` was right and
> §1 below was wrong to treat the deploy target as ambiguous — the `ai-pm`
> branch does exist on the remote, I simply did not fetch it.
>
> **What this invalidates:**
>
> - **§2 "Routes: exactly one" is wrong for production.** `ai-pm` has
>   `src/pages/index.astro`, `dev.astro`, `curious.astro`, and `now.astro`.
>   The `/dev`, `/curious`, and `/now` pages the original brief referred to
>   are real; they exist only on `ai-pm`.
> - **The mode switcher works differently in production.** On `ai-pm` the
>   switcher links to `/dev`, `/curious` and `/now` as separate pages, each
>   with its own layout (`src/layouts/Dev.astro`, `Award.astro`), its own
>   component tree (`src/components/dev/*`, `src/components/award/*`) and its
>   own stylesheet (`src/styles/dev.css`, `award.css`). It is not purely the
>   CSS-visibility mode system described below. That is roughly +3,400 lines
>   this audit never saw.
> - **§9's baseline numbers describe `main`'s build, not production's.**
>
> **What this does NOT invalidate:** the Astro/Tailwind stack, the token
> architecture, the `src/data/*.json` content model, the Decap CMS wiring, the
> Astro selector-scoping trap, and the third-party script inventory all still
> hold — `ai-pm` builds on the same foundation.
>
> **Consequence for work already done:** Phases 1 and 2 and redesign phases
> R1, R2, R3 and R6 were all built on `main`. They are live on **no** site.
> The Cloudflare dashboard shows them as *Preview* deployments only. In
> particular the Phase 1 truth fix has not reached users: `ai-pm` still
> carries `"status": "in_progress"` with the note *"Actively studying —
> expected completion mid-2026"*, and still says *"Studying for GCP
> Professional Cloud Architect"* in the hero Currently block.
>
> `.github/workflows/deploy.yml` (GitHub Pages, triggered on `main`) exists on
> `ai-pm` too and is a second, unrelated deployment path. It does not serve the
> custom domain.


**Date:** 2026-08-19
**Repo:** `zakijariwala/resume`
**Branch audited:** `claude/portfolio-phased-agent-packet-rf1l9o` (from `main` @ `2c6334b`)
**Scope:** Phase 0 of the phased agent packet. Read-only. No source file was modified.

---

## 1. Build stack and deploy pipeline

| Item | Value |
|---|---|
| Astro | `^4.16.1` in `package.json`, `4.16.19` installed |
| Adapter | **None.** `astro.config.mjs` sets `output: 'static'`, `base: '/'` |
| Integrations | `@astrojs/tailwind` `5.1.5` → Tailwind `3.4.19` |
| TypeScript | `tsconfig.json` extends `astro/tsconfigs/strict`, path alias `@/*` → `src/*` |
| Dependencies | 3 total: `astro`, `tailwindcss`, `@astrojs/tailwind`. No wrangler, no test runner, no linter. |
| Scripts | `dev`, `start`, `build`, `preview`, `astro` — all bare Astro CLI |

**Build verified:** `npm ci && npm run build` succeeds in ~1.3s. Output is `dist/` (304 KB): one `index.html` (79.7 KB), `_astro/` chunk dir, `admin/`, and the two resume files copied from `public/`.

**Deploy — and a contradiction to resolve before Phase 3:**

- **In the repo:** `.github/workflows/deploy.yml` — "Deploy to GitHub Pages", triggers on push to `main`, runs `npm ci && npm run build`, uploads `dist/` via `actions/upload-pages-artifact@v3`, deploys with `actions/deploy-pages@v4`. `.nojekyll` present at root. This is the only deploy path that actually exists in version control.
- **`HANDOVER.md` claims:** "Hosting: Cloudflare Pages (auto-deploys from `ai-pm` branch, ~2 min build)".
- **`CLAUDE.md` claims:** "GitHub Pages (migrating to Cloudflare Pages)".
- **Branch `ai-pm` does not exist** on the remote. Remote branches are `main` and the current working branch.

So three documents describe three different deploy targets. If a Cloudflare Pages project is connected to this repo, it is configured entirely in the Cloudflare dashboard with nothing checked in — no `wrangler.toml`, no `_headers`, no `_redirects`, no `functions/` directory for the site.

**Blocking for Phase 3:** which of GitHub Pages and Cloudflare Pages currently serves zakijariwala.space, and which branch it builds from. Phase 3's "reuse the existing Cloudflare credentials pattern already in the repo if one exists" has no answer in the repo — there is no Cloudflare credential pattern for the site.

**Other workflows** (unrelated to the site build):

- `.github/workflows/cos-stale-alert.yml` — daily cron `0 8 * * *`, runs `cos-os/scripts/stale_check.py`, uses `secrets.GITHUB_TOKEN`.
- `.github/workflows/cos-notion-sync.yml` — on push to `main` touching `cos-os/dashboard.md` or `cos-os/exports/**`, runs `cos-os/notion-sync/sync.py`.

---

## 2. Route inventory and the mode switcher

**Routes: exactly one.** `src/pages/index.astro` → `/`. There is no `src/pages/dev`, `curious`, `now`, or any other page file. No dynamic routes, no content collections, no `src/content/`.

**There is no `/dev`, `/curious`, or `/now` page.** The packet's Phase 0 brief assumes those routes exist; they do not. The three perspectives are client-side state on a single page.

**How the mode switcher actually works:**

1. **Pre-paint init** — inline `<script is:inline>` in `src/layouts/Base.astro` (head). Reads `?mode=` from the URL first, else `localStorage.portfolio_mode`, validated against `['recruiter','developer','curious']`, defaulting to `recruiter`. Sets `data-mode` on `<html>`, persists to localStorage, then `history.replaceState` normalises the URL to `?mode=<mode>`. Same pattern for `data-theme` (`light`/`dark`, key `portfolio_theme`).
2. **Body mirror** — a second inline script copies `data-mode`/`data-theme` from `<html>` onto `<body>`.
3. **Switcher UI** — `src/components/Nav.astro`, a `role="radiogroup"` with three `<button data-mode-btn="...">`. Its module script defines `setMode(mode)`: sets both `data-mode` attributes, writes localStorage, `replaceState('?mode=' + mode)`, updates `aria-checked`, fires a toast, and dispatches a `portfolio-mode-change` CustomEvent.
4. **Rendering** — every mode variant is present in the DOM at build time and shown/hidden by CSS on `[data-mode]` via the classes `.recruiter-only`, `.dev-only`, `.curious-only`, `.all-modes` (see `src/styles/global.css`).

**URL pattern: query string `?mode=<name>`, not a path.** Phase 2's "reuse the same URL pattern the other modes use" therefore means `?mode=infrastructure`, not `/infra`. A real `/infra` path would be a new pattern, not the existing one — flagging it because Phase 2's acceptance criterion names `/infra`.

**Consequences for Phase 2 (extending to a 4th mode).** The mode name appears in these places, all of which need the new value:

- `src/layouts/Base.astro` — `validModes` array (pre-paint script)
- `src/components/Nav.astro` — a 4th `<button data-mode-btn>`, the `.audience-btn.active` CSS selector list, the `labels` map in the toast
- `src/styles/global.css` — accent token block per `[data-mode]`, plus a `.infra-only` visibility class
- `src/data/*.json` — every per-mode keyed object (`taglines`, `hero_subline`, `contact_taglines`, `contact_headline`, `about.left_framing`, `about.paragraphs`, and per-mode `bullets` in `experience.json` / `projects.json`)
- `public/admin/config.yml` — the CMS field definitions mirror those per-mode objects field by field and will drift if not updated in the same change

Note also that **per-mode meta/OG tags (Phase 2 item 5) are not achievable with the current architecture.** Mode is resolved client-side after HTML is served; a single static `index.html` carries one `<meta>` block. Social scrapers do not run the mode script. Serving an infrastructure-specific OG preview requires either a real static route (`/infra` with its own head) or a Worker rewriting head tags — a structural decision, not a content edit.

**Page structure** (all inside the single `<main>`, per `src/pages/index.astro`): `Nav`, `Hero`, `About`, `ExperienceSection`, `ProjectsSection`, `SkillsSection`, `CertificationsSection`, `ContactSection`, `Footer`, plus a `FloatingHireCTA` outside `main`. Section ids: `#hero #about #experience #projects #skills #certifications #contact`.

---

## 3. Content data location

All portfolio content is in **typed-by-convention JSON data modules** under `src/data/`, imported directly by components (`import projects from '../data/projects.json'`). There are no TypeScript interfaces over them and no zod schemas — shape is enforced only by `public/admin/config.yml` and by whatever the components read. No content is inline in markup, with the exception of section headings and CTA copy.

| File | Shape | Consumed by |
|---|---|---|
| `src/data/meta.json` | object | `Hero`, `About`, `Nav`, `ContactSection`, `Footer`, `CertificationsSection`, `index.astro` |
| `src/data/experience.json` | array, 2 entries | `ExperienceSection` → `ExperienceCard` |
| `src/data/projects.json` | array, 9 entries | `ProjectsSection` → `FeaturedProjectCard` / `ProjectCard` |
| `src/data/skills.json` | array, 6 category objects (`category`, `tab_label`, `items[]`) | `SkillsSection` |
| `src/data/certifications.json` | array, 3 entries | `CertificationsSection` |

**Certifications** — keys `name`, `issuer`, `status`, `year`, `note`. `status` is `completed` or `in_progress`; the CMS enum at `public/admin/config.yml:174` is `[completed, in_progress]`.

Current third entry:

```json
{
  "name": "Professional Cloud Architect",
  "issuer": "Google Cloud",
  "status": "in_progress",
  "year": "2026",
  "note": "Actively studying — expected completion mid-2026."
}
```

`CertificationsSection.astro` derives `isProgress = cert.status === 'in_progress'` and uses it for **two** things: the badge text (`In Progress` / `Completed`), and the card's visibility class — in-progress certs are given `dev-only curious-only`, completed certs `all-modes`. Because `global.css:242-249` hides all three `*-only` classes by default and re-shows them per `[data-mode]`, a card carrying both classes renders in Developer and Curious modes and is **hidden in Recruiter mode**. **So flipping `status` to `completed` also un-hides the card for recruiters.** That is the right outcome for Phase 1, but it is a visibility change as well as a label change and should be called out as such in the PR.

**Projects** — keys `id`, `name`, `tagline`, `featured` (bool), `priority` (`primary` | `secondary`), `one_line_summary`, `featured_metric`, `why_i_built_it`, `tech[]`, `github`, `live_url`, `year`, `bullets[]`. Order is **array order plus the `featured`/`priority` flags**; there is no numeric `order` field. Current order and flags:

| # | id | featured | priority |
|---|---|---|---|
| 0 | `zamaan_marine` | true | primary |
| 1 | `content_automation` | false | primary |
| 2 | `zamaan_automation` | false | primary |
| 3 | `run_to` | false | primary |
| 4 | `path_of_supplication` | false | primary |
| 5 | `ian_xiaohei` | false | primary |
| 6 | `gidstek_site` | false | secondary |
| 7 | `esp_pocket` | false | secondary |
| 8 | `remote_dev_server` | false | secondary |

Phase 2 wants `remote_dev_server`, `esp_pocket`, and `path_of_supplication` above `content_automation` and the SEO/storefront work in Infrastructure mode. Since ordering is positional, per-mode ordering needs either a new per-mode order field in the data plus a sort in `ProjectsSection`, or CSS `order` on a flex/grid container. Neither exists today.

**Experience** — 2 entries: `Systems Engineer, IDM & Infrastructure` (TCS/SBI) and `Founder & Technical Communication Coach`. Keys include `kpis`, `bullets`, `context_tag`, `curious_intro`, `show_recovery_chart`. The coaching entry is the "coaching practice" Phase 2 wants demoted.

---

## 4. Resume PDF

- **Stored at:** `public/Mohammad_Zaki_Jariwala_Resume.pdf` (111,748 bytes). A `.docx` of the same name sits beside it (40,395 bytes) and is also published.
- **Served as:** a plain static asset copied verbatim into `dist/` by the Astro build → public path `/Mohammad_Zaki_Jariwala_Resume.pdf`.
- **Referenced by:** `src/data/meta.json` → `"pdf_path": "/Mohammad_Zaki_Jariwala_Resume.pdf"`, consumed in `Hero.astro` (destructured as `pdf_path`) and used for the download CTA.
- **Not referenced:** `misc/ZAKI.J_Resume.pdf` and `misc/Mohammad_Zaki_Jariwala_Resume.docx` are stale copies outside `public/` and are not built or served. `CLAUDE.md`'s file map still lists `public/ZAKI.J_Resume.pdf`, which does not exist — the file map is out of date.
- **No `robots.txt` and no `sitemap.xml` exist.** Phase 4's "add `/r/*` to robots.txt as disallowed" means creating that file, not editing one.

---

## 5. Existing Cloudflare configuration

**For the portfolio site: none.** No `wrangler.toml`, no `wrangler.jsonc`, no `functions/`, no `_headers`, no `_worker.js`, no `_redirects`, no D1/R2/KV bindings, no `.dev.vars`. `.gitignore` covers `.env*` but **not** `.dev.vars` — Phase 3 must add it.

**Elsewhere in the repo there is one Worker**, unrelated to the site, which is the closest thing to a prior-art pattern:

`cos-os/telegram-bot/wrangler.toml`
```toml
name = "cos-telegram-bot"
main = "cos-os/telegram-bot/worker.js"
compatibility_date = "2024-01-01"

[vars]
GITHUB_REPO = "zakijariwala/resume"
```

`cos-os/telegram-bot/worker.js` — plain JS (not TypeScript), default `export default { async fetch(request, env) }`, no bindings beyond `[vars]`. Secrets are read off `env` at runtime: `env.TELEGRAM_BOT_TOKEN` and `env.GITHUB_TOKEN`, implying wrangler secrets set out-of-band. Authorisation is a hardcoded `ALLOWED_USER_IDS` array, currently an **empty placeholder** — the bot as committed accepts nobody. There is no deploy workflow for this Worker; it is deployed manually if at all.

This is the "Telegram bot pattern" Phase 5 item 5 refers to. It exists, it is JS not TS, its allowlist is unfilled, and its credentials are not in the repo.

**Note for Phase 3:** adding a root `wrangler.toml` for a site Worker will collide with this one unless the config paths are kept explicit (`--config`), since `cos-os/telegram-bot/wrangler.toml` declares `main` relative to the repo root.

---

## 6. Third-party scripts and network dependencies

Everything the built page pulls from a third party:

| Source | Where | Notes |
|---|---|---|
| Google Fonts CSS | `src/styles/global.css:1` | Plus Jakarta Sans, Inter, JetBrains Mono, `display=swap`. Render-blocking `@import`. |
| Tabler Icons webfont | `src/styles/global.css:2` | `cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest` — **unpinned `@latest`**, a supply-chain and cache-stability risk, and a second render-blocking `@import`. |
| Formspree | `src/components/ContactSection.astro:57` | `action="https://formspree.io/f/YOUR_FORM_ID"` — **unreplaced placeholder. The live contact form does not work.** Confirmed pending in `HANDOVER.md`. |
| Decap CMS | `public/admin/index.html:7` | `unpkg.com/decap-cms` on the `/admin/` page only. `config.yml` still holds `app_id: YOUR_GITHUB_OAUTH_APP_ID` — CMS is not activated. |
| Cloudflare Web Analytics | `src/layouts/Base.astro:29` | **Commented out.** Placeholder token, never enabled. |

**PostHog is not in this site.** Every PostHog hit in the repo is *content about the Zamaan projects* — `src/data/projects.json` (tech chips and bullet copy for `zamaan_marine` and `zamaan_automation`), `src/data/skills.json` (a skill named "PostHog & Product Analytics"), plus the archived `misc/index.html` and `cos-os/current-projects.md`. There is no PostHog script tag, no `posthog-js` dependency, and no event schema in this repo.

**Phase 6 is built on a false premise for this repo.** There is nothing to remove and no existing event schema to "read out of the repo rather than guessing" — the portfolio currently emits **zero** analytics events of any kind. Phase 6 would be a greenfield instrumentation build, not a migration. The PostHog implementation and its `BUY_ON_EBAY_CLICKED` / `CONTACT_FORM_SUBMITTED` funnel live in the Zamaan repos, which are out of scope.

**No client-side framework, no jQuery, no bundled runtime JS beyond the inline scripts** in `Base.astro` and `Nav.astro` (and per-component scripts in `SkillsSection`, `ContactSection`, `FloatingHireCTA`).

---

## 7. Lighthouse

**Not run.** Lighthouse is not installed and `npx lighthouse` requires a network fetch that the sandbox declines (`npx canceled due to missing packages`). No headless-Chrome-driven measurement was taken, so no scores are reported here rather than guessed.

Observations that would affect scores, from static inspection:

- Two render-blocking `@import` calls at the very top of `global.css` (Google Fonts, jsDelivr) — these serialise: CSS must download before the imports are even discovered.
- The icon webfont is pulled at `@latest`, so it cannot be long-cached safely.
- Single 79.7 KB HTML document containing all three modes' content simultaneously — every visitor downloads roughly 3× the copy they will see. A 4th mode (Phase 2) grows this further.
- No `robots.txt`, no `sitemap.xml`, no canonical link tag.
- No `og:image`, no `og:url`, no Twitter card tags — `Base.astro` emits only `og:title`, `og:description`, `og:type`.

---

## 8. Findings that block or reshape later phases

Listed here so they are decided before the phases that depend on them, not discovered mid-build.

1. **Deploy target is genuinely ambiguous** (§1). GitHub Pages is what is in the repo; `HANDOVER.md` says Cloudflare Pages off a branch that does not exist. Phase 3 cannot be designed until this is settled.

2. **`cos-os/projects/portfolio.md` does not exist.** Phase 1 item 3 says to replace the hero "Currently" line with "whatever I have in `cos-os/projects/portfolio.md`", and to flag and stop if that file is stale. `cos-os/projects/` contains only `business.md`, `career.md`, `content.md`, `learning.md`, `personal.md` — and **all five are empty skeletons**: every `PROJECT` block has `OBJECTIVE: -`, `STATUS: ⬜ idle`, `NEXT_ACTIONS: -`, `LAST_UPDATED: -`. `career.md` has a `PROJECT: Certifications` block with nothing in it. **There is no source of truth in cos-os for a replacement "Currently" line.** Per the phase's own instruction, Phase 1 items 1 and 2 can proceed, but item 3's replacement text must come from the owner. The stale sentence to be replaced is in `src/data/meta.json:63`: *"Studying for GCP Professional Cloud Architect."*

3. **Per-mode OG tags are not possible client-side** (§2). Phase 2 item 5 needs an architecture decision first.

4. **Per-mode project ordering has no mechanism** (§3). Phase 2 item 4 requires adding one.

5. **Phase 6 has no PostHog to remove** (§6). It is a new build, not a migration, and its acceptance criterion ("No PostHog in the bundle") is already true today.

6. **Phase 4's static-variant assumption holds**, with one wrinkle: `public/` also ships `Mohammad_Zaki_Jariwala_Resume.docx`. A `.docx` of the same resume sitting at a guessable public path partly defeats the point of gating variants behind tokens, and should be reviewed when Phase 4 lands.

7. **The contact form is dead right now** (§6). Phase 7 replaces it, but Phases 1–6 all ship with a form that silently posts to `YOUR_FORM_ID`. `CONTENT-GOVERNANCE.md:179` already says an unactivated form should be removed rather than shown. Worth fixing before Phase 7's turn.

8. **Documentation drift.** `CLAUDE.md`'s file map lists `public/ZAKI.J_Resume.pdf` (does not exist), omits `FloatingHireCTA.astro` (exists), and describes fonts as Fraunces while `global.css` loads Plus Jakarta Sans. `HANDOVER.md` names a non-existent active branch. None of this is load-bearing for the build, but any agent reading `CLAUDE.md` as ground truth will be wrong about the fonts and the resume path.

---

## 9. Baseline for regression checks

Recorded so later phases can prove "the static site builds and deploys identically".

```
main @ 2c6334b
npm ci && npm run build  →  1 page, ~1.3s, exit 0
dist/  304K total
  index.html                             79,697 bytes
  Mohammad_Zaki_Jariwala_Resume.pdf     111,748 bytes
  Mohammad_Zaki_Jariwala_Resume.docx     40,395 bytes
  _astro/                                (client chunks)
  admin/                                 (Decap CMS entry + config.yml)
```

Routes emitted: `/index.html` only.
