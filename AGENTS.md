# AGENTS.md — resume (zakijariwala.space Portfolio + CoS OS)

## Purpose
Dual-purpose repository:
1. **Portfolio site** — zakijariwala.space, Astro 4 + Tailwind CSS + TypeScript, three-mode identity system (Recruiter / Developer / Curious). Primary asset for Zaki's AI PM job search.
2. **CoS Operating System** — Chief of Staff state layer in `cos-os/`. Dashboard, project files, Telegram bot, Notion sync, stale alerts.

## Ownership
- Owner: Zaki Jariwala (jariwalazaki@gmail.com)
- Portfolio deploy branch: `ai-pm` → Cloudflare Pages (~2 min build)
- CoS OS state branch: `main`
- Active dev branch: `claude/read-handover-docs-7dvoD`
- Live URL: zakijariwala.space

## Local Contracts
**Portfolio:**
- Three-mode identity system is inviolable — Recruiter / Developer / Curious must feel like three different websites; never collapse modes to a content filter
- All site content lives in `src/data/*.json` — single source of truth; Decap CMS config at `public/admin/config.yml` must stay in sync with the data file structure
- Design tokens are CSS custom properties in `src/styles/global.css` — never hardcode hex/rgb values in components
- Every section must open with `<SectionHeader>` — mandatory pattern
- Mode-adaptive visibility classes: `.recruiter-only`, `.dev-only`, `.curious-only`, `.all-modes` — use only these
- No React, Vue, or client-side JS framework — Astro components and vanilla JS only
- Hero stat grid: exactly 4 cards in Recruiter and Developer modes; Curious mode replaces the grid with the "currently" block

**CoS OS:**
- `cos-os/` is fully isolated from the Astro build — the build only processes `src/` and `public/`
- GitHub is always authoritative over memory — if they conflict, GitHub wins
- `cos-os/schema.md` is the binding header contract for all CoS state files
- Telegram bot reads/writes all files via the `cos-os/` path prefix on `zakijariwala/resume`

## Work Guidance
- Portfolio content: edit `src/data/*.json`
- Portfolio components: `src/components/`
- CoS state: edit files in `cos-os/`; commit and push to `main` to make changes authoritative
- `cos-notion-sync.yml` triggers only on `cos-os/` path changes; `deploy.yml` triggers only on Astro source changes

## Verification
- Portfolio: `npm run build` must complete without errors; confirm all three modes render correctly
- CoS schema: `grep "^## " cos-os/projects/*.md | grep -v "^## [A-Z_]*$"` — any output means non-conformant project file headers

## Child DOX Index
- `src/AGENTS.md` — Astro portfolio: components, mode-adaptive patterns, page structure rules
- `src/data/AGENTS.md` — content JSON: schema per file, single source of truth rule, CMS sync
- `cos-os/AGENTS.md` — CoS OS: state schema, The One Rule, Telegram bot path contract
- `misc/AGENTS.md` — scratch area: LinkedIn drafts, PDF tools, resume exports; never deployed
