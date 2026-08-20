# Cloudflare platform

Everything the API Worker needs: what exists, how to set it up, how to run it
locally, and how it deploys. Phase 3 of the phased packet — infrastructure
only, no product features on top of it yet.

---

## Why a standalone Worker and not Pages Functions

The static site is served by **Cloudflare Pages** (project `resume`, building
from branch `ai-pm`, custom domain zakijariwala.space). Pages Functions would
have been the smaller change — same deploy, same domain, no routing to reason
about — and it was the first option considered.

It was rejected for one concrete reason: **Pages Functions do not support cron
triggers.** Phase 5 needs a daily 03:00 UTC digest, and Phase 8 needs a
scheduled reindex. Building on Functions now would mean migrating to a Worker
in two phases' time, with the resume-token URLs already in circulation.

So: a standalone Worker, taking two route prefixes off the existing zone.

| | |
|---|---|
| Worker name | `zakijariwala-api` |
| Routes | `zakijariwala.space/api/*`, `zakijariwala.space/r/*` |
| Everything else | still served by the Pages project, untouched |

Cloudflare matches Worker routes ahead of Pages, so the Worker intercepts only
those two prefixes. If the Worker is deleted or fails to deploy, those paths
404 and **the rest of the site is unaffected** — the static fallback the
standing constraints require.

### Why the config is not at the repository root

`worker/wrangler.toml`, not `./wrangler.toml`. Cloudflare Pages inspects a root
`wrangler.toml` during its build and errors when it finds a Worker config
without `pages_build_output_dir`. A root config would break the deploy that
serves the live site.

Consequence: every wrangler command needs `--config worker/wrangler.toml`. The
npm scripts already do.

Unrelated aside: `cos-os/telegram-bot/wrangler.toml` is a separate, older
Worker. It is not touched by any of this. Note its `main` is written relative
to the repo root while wrangler resolves `main` relative to the config file, so
that config is probably broken as committed — out of scope here, but worth
knowing before anyone tries to deploy it.

---

## One-time setup

Run these once, from the repository root. They create resources in your
Cloudflare account and are not idempotent — check the dashboard first if you
are unsure whether they already exist.

### 1. Create the D1 database

```bash
npx wrangler d1 create zakijariwala
```

It prints a `database_id`. Paste it into `worker/wrangler.toml`, replacing
`PLACEHOLDER_RUN_WRANGLER_D1_CREATE`.

**That id is not a secret.** It is an account-scoped identifier, useless
without credentials, and it belongs in version control so CI can deploy.

### 2. Create the R2 bucket

```bash
npx wrangler r2 bucket create zakijariwala-assets
```

The name is already in `worker/wrangler.toml`; nothing to paste back.

### 3. Apply migrations to the remote database

```bash
npm run db:migrate:remote
```

### 4. Deploy the Worker

```bash
npm run worker:deploy
```

First deploy attaches the routes. The zone must already be on Cloudflare — it
is, since the custom domain works.

### 5. Add the CI secrets

There was no existing Cloudflare credential pattern in this repo to reuse: the
Pages deploy runs through Cloudflare's git integration, which needs no token.
The Worker deploy does. In **GitHub → Settings → Secrets and variables →
Actions**, add:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → right sidebar |

Scope the token to the **minimum** that works:

- Account → Workers Scripts → Edit
- Account → D1 → Edit
- Account → Workers R2 Storage → Edit
- Zone → Workers Routes → Edit (zone: zakijariwala.space)

Do not use a Global API Key.

---

## Bindings

Declared in `worker/wrangler.toml`, typed in `worker/src/index.ts` as `Env`.

| Binding | Type | Resource | Used for |
|---|---|---|---|
| `DB` | D1 | `zakijariwala` | Phase 4 resume variants and opens; Phase 5 applications |
| `ASSETS` | R2 | `zakijariwala-assets` | Phase 4 resume variants that never enter the repo |

Add a binding by editing `worker/wrangler.toml` **and** the `Env` interface.
TypeScript will not catch a missing binding at runtime — the health check is
what proves one actually works.

---

## Secrets

None yet. Phase 3 needs none.

- **Local:** `worker/.dev.vars`, gitignored. See `.dev.vars.example`.
- **Production:** `npx wrangler secret put NAME --config worker/wrangler.toml`

Secrets are never committed, never put in `wrangler.toml`, and never printed by
`/api/health`.

---

## Local development

```bash
npm run db:migrate:local   # once, and after adding any migration
npm run dev:all            # Astro on :4321, Worker on :8788
```

`dev:all` backgrounds both and `wait`s, so Ctrl-C stops the pair. To run just
one: `npm run dev` or `npm run dev:worker`.

`wrangler dev --local` emulates D1 and R2 on disk under `worker/.wrangler/`
(gitignored). Nothing touches your real database or bucket, and no Cloudflare
credentials are needed.

Local state is disposable — delete `worker/.wrangler/` and re-run the migration
to start clean.

**The local worker is on a different port from the site.** In production both
are the same origin; locally `/api/*` is on :8788, not :4321. Anything
fetching the API from page JavaScript will need that accounted for when a
later phase adds one.

---

## Migrations

Files live in `worker/migrations/`, applied in filename order, one file per
change, never edited once applied.

```bash
npm run db:migrate:local    # local emulated DB
npm run db:migrate:remote   # the real D1 database
```

`0000_init.sql` deliberately carries no product schema. It creates
`_platform_meta` and writes one row, so `/api/health` can prove the binding
works end to end rather than merely being declared. Phase 4 adds the real
tables.

CI applies migrations **before** deploying the new code: migrations are
additive, so the currently-running Worker tolerates new tables, whereas new
code could fail against an old schema.

---

## Health check

```
GET https://zakijariwala.space/api/health
```

```json
{
  "status": "ok",
  "checked_at": "2026-08-20T11:56:29.975Z",
  "bindings": {
    "DB":     { "ok": true, "detail": "migrations applied (phase-3)" },
    "ASSETS": { "ok": true, "detail": "bucket reachable (0 object(s) sampled)" }
  }
}
```

- `200` when both bindings work, `503` when either fails, so an uptime monitor
  can act on the status code without parsing the body.
- It **exercises** each binding rather than checking it is defined. A binding
  can be present and still fail — wrong id, deleted database, revoked
  permission — and that is precisely what this catches.
- `cache-control: no-store`, so it is never answered from cache.
- Failures return the error message. Nothing else about the environment is
  exposed, and no secret is ever read here.

Cost per call: one D1 row read, one R2 Class A op (`list` with `limit: 1`).

---

## Deployment

`.github/workflows/deploy-worker.yml`, on push to `ai-pm` touching `worker/**`,
plus manual `workflow_dispatch`.

1. `npm ci`
2. `wrangler deploy --dry-run` — validates config and builds the bundle before
   anything touches the database
3. `wrangler d1 migrations apply --remote`
4. `wrangler deploy`
5. Poll `/api/health` up to five times, fail the run if it never returns 200

The static Pages deploy is a completely separate pipeline and is not touched by
this workflow.

---

## Free-tier budget

Current limits and what Phase 3 uses:

| Resource | Free limit | Phase 3 usage |
|---|---|---|
| Workers requests | 100,000/day | Health checks only |
| Workers CPU | 10 ms/request | Two awaits, far under |
| D1 storage | 5 GB | One table, one row |
| D1 rows read | 5,000,000/day | 1 per health check |
| D1 rows written | 100,000/day | 3, once, at migration |
| R2 storage | 10 GB | Empty |
| R2 Class A ops | 1,000,000/month | 1 per health check |

Nothing here approaches a limit. Later phases must re-check: D1 **writes**
(100k/day) and KV writes (1k/day) are the binding constraints, not reads.

---

# Phase 4 — Tracked resume delivery

One link per application, the right variant served, opens counted once.

## How a variant is served

| Variant | Where the file lives | How it is served |
|---|---|---|
| `product` | `public/Mohammad_Zaki_Jariwala_Resume.pdf`, in the repo | Worker streams it through from the site origin |
| `infrastructure` | R2, key `resumes/infrastructure.pdf` | Worker streams it from the `ASSETS` bucket |

`r2_key IS NULL` in `resume_variants` means "served from the repository". Any
non-NULL key lives in R2 and **never enters the repo or `public/`**.

`https://zakijariwala.space/Mohammad_Zaki_Jariwala_Resume.pdf` keeps working
exactly as before. It is untracked, still linked from the site, and the Worker
does not sit in front of it — the Worker only owns `/r/*` and `/api/*`, so
there is no request loop when it fetches that path for the `product` variant.

## Keeping non-product variants undiscoverable

Four things have to hold, and all four are checked:

1. R2 objects are not part of the Astro build. Verified: the only resume files
   in `dist/` are the product PDF and its `.docx`, and no `resumes/` key
   appears anywhere in the built site.
2. `public/robots.txt` disallows `/r/` and `/api/`.
3. Every `/r/:token` response carries `x-robots-tag: noindex, nofollow`, so a
   crawler that ignores robots.txt still gets told.
4. Responses are `cache-control: private, no-store` — a token URL is
   per-application and must never sit in a shared cache.

An unknown token and a malformed token return the **same** 404, so the endpoint
cannot be used to discover which tokens exist.

> **Still public, and separate from this:** `public/Mohammad_Zaki_Jariwala_Resume.docx`
> is the same résumé in Word format at a guessable path. It is the product
> variant, so it does not undermine the guarantee above, but it is worth
> deciding whether it should be there at all.

## Privacy

Non-negotiable, and enforced by the schema rather than by policy:

- **No IP address is stored, read, or forwarded.** There is no column that
  could hold one. Country comes from the Cloudflare request property
  (`request.cf.country`) as a two-letter code and nothing else.
- **No raw user-agent is stored.** `userAgentFamily()` reduces the header to a
  closed list — Chrome, Safari, Firefox, Edge, Opera, Samsung, PDF viewer, Bot,
  Other, Unknown — and only that string is written.

Stored columns on `resume_opens`, in full: `id`, `application_id`, `opened_at`,
`coarse_country`, `user_agent_family`.

### Retention

The `scheduled` handler runs nightly at 04:17 UTC and deletes `resume_opens`
rows older than **180 days**. The cron lives in `worker/wrangler.toml` under
`[triggers]`. To run the sweep by hand:

```bash
npx wrangler d1 execute zakijariwala --config worker/wrangler.toml --remote \
  --command "DELETE FROM resume_opens WHERE opened_at < datetime('now','-180 days')"
```

## Deduplication

Opens are counted once per application per **10 minutes**. A PDF viewer that
re-requests the file with a `Range` header, or a reader flipping back to the
tab, does not inflate the count. The probe is one indexed read before the
insert; the insert is skipped entirely when a recent row exists.

Verified locally: two requests per token (a full GET and a ranged GET) produced
exactly one row each.

## Range requests

Both paths honour `Range`, so the browser's PDF viewer renders inline instead
of downloading:

- R2: the request headers are passed to `ASSETS.get()` as both `range` and
  `onlyIf`, and `Content-Range` is derived from the returned `R2Range`
  (including the `suffix` form).
- Static: `Range`, `If-Range`, `If-None-Match` and `If-Modified-Since` are
  forwarded upstream and the response is streamed back with its status intact.

Measured: `Range: bytes=0-1023` → `206`, `Content-Range: bytes 0-1023/111748`,
1024 bytes returned, on both paths.

## CLI

Defaults to the **local** emulated database. Pass `--remote` to act on
production — the default is deliberate, so a mistaken run touches a throwaway
file on disk rather than the real bucket.

```bash
npm run resume -- upload infrastructure "Infrastructure / Systems" ~/infra-resume.pdf
npm run resume -- link "Globex" "SRE" infrastructure
npm run resume -- opens
```

`upload` refuses the `product` slug: that variant is served from the repo and
has no R2 object.

`link` mints a 128-bit URL-safe token and prints the ready-to-send link. Phase 5
does this automatically when an application is created.

## Budget

Per resume open: 1 D1 read (dedupe probe), at most 1 D1 write, 1 R2 Class B op
(or one subrequest for the product variant). At a hundred opens a day that is
100 writes against a 100,000/day limit. The nightly sweep is one statement.
