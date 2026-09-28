# CLAUDE.md — zakijariwala.space (v2)

Handoff for any AI assistant working on this repo. Read before changing code or content.
Design rationale: `docs/ARCHITECTURE.md`. One-time setup: `docs/SETUP.md`.

## What this is

Portfolio for Mohammad Zaki Jariwala — systems engineer (TCS at SBI, 99.999% uptime,
team lead) positioning for **reliability, cloud and technical leadership / product roles**.
Lead with ownership and outcomes; engineering depth is the credibility layer, not the headline.
There are no audience "modes" any more: depth is layered — outcome-first cards → case study
→ story → optional deep-dive.

## Layout

```
site/            Astro 5 static site (srcDir). Pages, components, styles, content loader.
worker/          Cloudflare Worker (Hono): admin, contact, résumé, visibility gate, internal API, cron.
shared/          Schema + secret scan used by the site, the Worker and the sync script.
scripts/sync.ts  Runs in GitHub Actions: fetches every repo's for_resume/, posts to the Worker.
content/         profile.yaml (experience, certs, skills…) and sections/*.yaml (scaffolded pages).
fixtures/        Sample for_resume/ data for local dev and CI only. Never published.
docs/            ARCHITECTURE, SETUP, for-resume-prompt (the prompt run in each repo).
```

## How content flows

1. Each repo has `for_resume/project.md` (+ optional `deep-dive.md`) written by the prompt in
   `docs/for-resume-prompt.md`. Schema: `shared/schema.ts` — change both together.
2. Weekly (Worker cron → `repository_dispatch`) or on demand from `/admin`, the *Sync and
   deploy* workflow runs `scripts/sync.ts`: one GraphQL query for all repos, validate, secret-scan,
   copy media to R2, POST to `/internal/ingest`.
3. The Worker stores content in D1. Admin flags (visible / featured / order / deep-dive / pinned)
   live beside it and are never overwritten by sync.
4. The workflow fetches `/internal/snapshot`, builds Astro from it, and deploys the Worker + assets.

## Rules

- **Invent nothing.** No metric, user count, date, employer or outcome that isn't in
  `content/profile.yaml` or a repo's own `for_resume/`. Rewrite copy from facts; never add facts.
- **Never describe how much AI was used to build something.** The only signal is a project's
  `ai_assisted` flag, rendered as one neutral line and switchable in admin. Describing an AI
  *feature of a product* is fine.
- **Static first.** Public pages are prerendered. Only routes in `wrangler.jsonc`
  `assets.run_worker_first` hit the Worker; keep that list short (free-plan request budget).
- **Repo markdown is untrusted.** It is rendered on the same origin as `/admin`, so
  `site/lib/markdown.ts` escapes raw HTML. Don't bypass it.
- **No client-side framework.** Small inline scripts only, and every page must work without JS.
- **Design tokens only.** Colours, fonts and sizes come from `:root` in `site/styles/global.css`,
  with light and dark values. No hex values in components.
- **Dependencies:** astro, hono, zod, yaml (+ dev: wrangler, workers-types, @astrojs/check,
  typescript, @types/node). Ask the owner before adding any other dependency.
- Commits: no AI co-author trailers unless the owner asks for them.

## Commands

```bash
npm run dev        # site from fixtures
npm run check      # astro check + Worker tsc
npm run build      # static build (fixtures unless SNAPSHOT_FILE is set)
npx wrangler dev   # Worker + site locally (needs .dev.vars, see docs/SETUP.md)
```

CI (`.github/workflows/ci.yml`) runs check, build and a Worker dry-run on every push.
