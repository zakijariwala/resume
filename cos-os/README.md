# CoS Operating System v3.4

Chief of Staff workspace inside the `zakijariwala/resume` repo.
All CoS state, automation, and reference files live here.
The Astro portfolio build (`src/`, `public/`) does not touch this directory.

## Structure

```
cos-os/
  dashboard.md              — live status (400-token budget, 8 fields)
  schema.md                 — canonical field/header contract
  decisions.log.md          — append-only decision record
  inbox.md                  — Telegram /log capture queue
  current-projects.md       — portfolio-ready project reference (all repos)
  projects/
    business.md
    career.md
    content.md
    learning.md
    personal.md
  exports/                  — daily/weekly/snapshot exports (.gitkeep placeholder)
  telegram-bot/
    worker.js               — Cloudflare Worker (reads/writes cos-os/* via GitHub API)
    wrangler.toml           — points to zakijariwala/resume, main = cos-os/telegram-bot/worker.js
  notion-sync/
    sync.py                 — pushes dashboard + latest weekly to Notion
    requirements.txt
  scripts/
    stale_check.py          — opens GitHub issue for projects not updated in 7+ days
  session-init/
    load-state.md           — session start checklist, conflict protocol, export format
```

GitHub Actions workflows live at repo root (required by GitHub):
```
.github/workflows/
  deploy.yml              — Astro build → GitHub Pages (portfolio, untouched)
  cos-notion-sync.yml     — triggers on push to cos-os/dashboard.md or exports/
  cos-stale-alert.yml     — daily 08:00 UTC cron
```

## Deployment Checklist

- [ ] Fill `ALLOWED_USER_IDS` in `telegram-bot/worker.js` (your Telegram numeric user ID)
- [ ] `wrangler secret put TELEGRAM_BOT_TOKEN`
- [ ] `wrangler secret put GITHUB_TOKEN`  (fine-grained PAT: contents r/w on `zakijariwala/resume`)
- [ ] `wrangler deploy` from repo root: `wrangler deploy --config cos-os/telegram-bot/wrangler.toml`
- [ ] Register Telegram webhook: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>"`
- [ ] Add `NOTION_TOKEN` + `NOTION_PAGE_ID` to repo Settings → Secrets → Actions (optional)

## The One Rule

GitHub (`zakijariwala/resume`, branch `main`) is always authoritative over memory.
If they conflict, GitHub wins. Always.
