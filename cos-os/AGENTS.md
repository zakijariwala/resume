# AGENTS.md — cos-os/

## Purpose
Chief of Staff Operating System v3.4. Persistent state layer: dashboard, project tracker, Telegram capture, Notion sync, stale alerts. Isolated from the Astro portfolio build — the build only processes `src/` and `public/`.

## Ownership
Owned by root AGENTS.md. Authoritative state lives on the `main` branch of `zakijariwala/resume`.

## Local Contracts
- **The One Rule:** GitHub is always authoritative over memory. If they conflict, GitHub wins. Always.
- `schema.md` is the binding contract for all state file formats — read it before editing any CoS file
- `dashboard.md` must stay under 400 tokens and follow the 8-header schema exactly: `LAST_SYNC:`, `TOP_PRIORITIES:`, `CRITICAL_RISKS:`, `ACTIVE_PROJECTS:`, `WAITING:`, `DECISIONS_PENDING:`, `INBOX_COUNT:`, `INBOX_OVERFLOW_FILES:`
- `inbox.md` is append-only from the Telegram worker — only Claude Code is authorised to truncate it after processing
- `decisions.log.md` is append-only — entries are never edited after creation; use `## DECISION [YYYY-MM-DD]` heading format
- `exports/` holds daily/weekly snapshots — files are write-once; filename format: `[daily|weekly]-[YYYY-MM-DD].md`
- Telegram bot (`telegram-bot/worker.js`) reads and writes all files via the GitHub API with path prefix `cos-os/` on `zakijariwala/resume`

## Work Guidance
- Update project state: edit the relevant `projects/[domain].md` file; run schema integrity check before committing
- Process inbox: read `inbox.md`, action items, truncate file, reset `INBOX_COUNT` in `dashboard.md`
- Schema integrity check: `grep "^## " cos-os/projects/*.md | grep -v "^## [A-Z_]*$"` — any output = non-conformant headers

## Child DOX Index
- `projects/AGENTS.md` — 5 domain project files, 7-section schema, integrity check command
- `telegram-bot/AGENTS.md` — Cloudflare Worker: GitHub API paths, secrets, inbox routing logic
