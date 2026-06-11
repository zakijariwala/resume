# AGENTS.md — cos-os/telegram-bot/

## Purpose
Cloudflare Worker that provides a Telegram bot interface to the CoS state files. Reads dashboard and exports; writes to inbox.

## Ownership
Owned by `cos-os/AGENTS.md`.

## Local Contracts
- `worker.js` reads and writes all files via the GitHub API using `const BASE = "cos-os"` as the path prefix on `zakijariwala/resume` — all GitHub API paths are `cos-os/[filename]`
- Secrets are injected by Cloudflare Workers at runtime via `env.*`; never hardcode in the file:
  - `env.TELEGRAM_BOT_TOKEN` — bot token from @BotFather
  - `env.GITHUB_TOKEN` — fine-grained PAT with contents read/write on `zakijariwala/resume`
  - `env.GITHUB_REPO` is set in `wrangler.toml` as a `[vars]` value (not a secret): `"zakijariwala/resume"`
- `ALLOWED_USER_IDS` array at top of `worker.js` must contain Zaki's Telegram numeric user ID — silent HTTP 200 drop on unauthorized user
- `SIZE_THRESHOLD = 2048` bytes — when the current inbox file exceeds this, the worker creates `inbox_overflow_N.md` in `cos-os/`
- Write conflict: on HTTP 409, worker waits 500ms, re-fetches SHA, retries once; double-409 throws `WRITE_FAILED`
- `wrangler.toml` `main` field points to `cos-os/telegram-bot/worker.js` — deploy from repo root: `wrangler deploy --config cos-os/telegram-bot/wrangler.toml`

## Work Guidance
- Fill user ID: edit `ALLOWED_USER_IDS` in `worker.js` before deploying
- Deploy: `wrangler deploy --config cos-os/telegram-bot/wrangler.toml`
- Set secrets: `wrangler secret put TELEGRAM_BOT_TOKEN` and `wrangler secret put GITHUB_TOKEN`
- Register webhook: `curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url={WORKER_URL}"`
