# One-time setup

Everything here is on Cloudflare's and GitHub's free plans. Do the steps in order; each
lists what it produces and where that value goes.

> The deploy workflow listens for `repository_dispatch`, which GitHub only delivers to
> workflows on the **default branch**. Merge this branch into `main` before step 9.

## 1. Cloudflare resources

```bash
npx wrangler login
npx wrangler d1 create zakijariwala          # → database_id  → GitHub variable D1_DATABASE_ID
npx wrangler r2 bucket create zakijariwala
```

## 2. Worker secrets

Run from the repo root. `wrangler secret put` creates the Worker if it doesn't exist yet.

| Secret | Value |
|---|---|
| `BUILD_TOKEN` | `openssl rand -hex 32` — also saved as a GitHub secret (step 8) |
| `DISPATCH_TOKEN` | GitHub fine-grained PAT, **only** `zakijariwala/resume`, *Contents: read and write* (needed for `repository_dispatch`) |
| `TURNSTILE_SECRET` | from step 3 |
| `IP_SALT` | `openssl rand -hex 16` (hashes contact-form IPs for rate limiting) |

```bash
npx wrangler secret put BUILD_TOKEN   # repeat for each
```

## 3. Turnstile (contact-form spam check)

Dashboard → Turnstile → Add widget. Hostnames: `zakijariwala.space` and your
`*.workers.dev` hostname. Mode: Managed.
Site key → GitHub variable `TURNSTILE_SITE_KEY`. Secret key → Worker secret `TURNSTILE_SECRET`.
Until this is set, the contact page shows direct links only.

## 4. Email notifications

Dashboard → zakijariwala.space → Email → Email Routing → enable, then add and verify your
inbox as a **destination address**. Put that address in GitHub variable `OWNER_EMAIL`.
Sender is `portfolio@zakijariwala.space` (`SENDER_EMAIL` in `wrangler.jsonc`).
You get: contact messages, résumé-link opens (once per link per day), the weekly sync digest.

## 5. Protect /admin with Cloudflare Access

Zero Trust → Access → Applications → Add → Self-hosted.
- Domains: `zakijariwala.space/admin` and `<worker>.workers.dev/admin`
- Policy: Allow → Emails → your address
- Copy the **Application Audience (AUD) tag** → GitHub variable `ACCESS_AUD`
- Team domain (`https://<team>.cloudflareaccess.com`) → GitHub variable `ACCESS_TEAM_DOMAIN`

The Worker re-verifies the Access token and refuses admin requests if either value is
missing, so a misconfigured policy fails closed.

## 6. GitHub token for reading your repos

Fine-grained PAT → *All repositories* → *Contents: read*, *Metadata: read*. Max expiry
is one year; the dashboard and the weekly email warn 30 days before it runs out.
Save it as GitHub secret `PORTFOLIO_GITHUB_TOKEN`.

## 7. Cloudflare API token for deploys

Dashboard → My Profile → API Tokens → *Edit Cloudflare Workers* template, plus
*Account → D1 → Edit*. Save as GitHub secret `CLOUDFLARE_API_TOKEN`, and your account ID
as `CLOUDFLARE_ACCOUNT_ID`.

## 8. GitHub repository settings

Settings → Secrets and variables → Actions.

| Secrets | Variables |
|---|---|
| `BUILD_TOKEN` | `WORKER_URL` — `https://zakijariwala.<subdomain>.workers.dev` until cutover |
| `PORTFOLIO_GITHUB_TOKEN` | `D1_DATABASE_ID` |
| `CLOUDFLARE_API_TOKEN` | `TURNSTILE_SITE_KEY` |
| `CLOUDFLARE_ACCOUNT_ID` | `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `OWNER_EMAIL` |

## 9. First deploy

Actions → *Sync and deploy* → Run workflow (sync ✓). The first run deploys an empty site,
then fetches every repo's `for_resume/`, builds and deploys again. Check `/admin`.

## 10. Upload your résumé

`/admin/resume` → upload → *Make this the main résumé*. Until then `/resume.pdf` serves
`site/public/resume-fallback.pdf`.

## 11. Cutover to zakijariwala.space

1. Cloudflare Pages → project `resume` → Custom domains → remove `zakijariwala.space`.
2. Workers → `zakijariwala` → Settings → Domains & Routes → add custom domain `zakijariwala.space`.
3. Change GitHub variable `WORKER_URL` to `https://zakijariwala.space`.
4. Optional: Web Analytics → enable for the zone (cookieless; the CSP already allows it).
5. Once happy, delete the Pages project.

---

## Local development

```bash
npm install
npm run dev                          # site only, from fixtures/ — http://localhost:4321
npm run build && npm run db:migrate:local
npx wrangler dev                     # site + Worker with local D1/R2 — http://127.0.0.1:8787
```

Create `.dev.vars` (git-ignored) for `wrangler dev`:

```
BUILD_TOKEN=dev
DEV_ADMIN=true                       # admin without Access, localhost only
IP_SALT=dev
DISPATCH_TOKEN=dev
TURNSTILE_SECRET=1x0000000000000000000000000000000AA   # Cloudflare's always-pass test key
```

To build against the local Worker's data instead of fixtures:
`WORKER_URL=http://127.0.0.1:8787 BUILD_TOKEN=dev npm run sync -- snapshot && SNAPSHOT_FILE=.snapshot.json npm run build`.
