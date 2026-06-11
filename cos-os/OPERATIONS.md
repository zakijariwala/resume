# CoS Operating System — Operations & Architecture

How the system works as a whole, the rituals that keep it alive, and the
observability layer. `schema.md` defines file formats; this file defines behaviour.

---

## Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│ 5 · OBSERVE     metrics/history.jsonl + latest.json          │
│                 (daily snapshot → trends, dashboards, alerts)│
├─────────────────────────────────────────────────────────────┤
│ 4 · SYNC        Notion (read-only mirror of dashboard +      │
│                 latest weekly) — for humans who live in Notion│
├─────────────────────────────────────────────────────────────┤
│ 3 · AUTOMATE    GitHub Actions: notion-sync (on push),       │
│                 stale-alert (08:00 UTC), metrics-snapshot    │
│                 (08:30 UTC)                                  │
├─────────────────────────────────────────────────────────────┤
│ 2 · CAPTURE     Telegram bot (Cloudflare Worker) —           │
│                 /log writes inbox, /status reads dashboard   │
├─────────────────────────────────────────────────────────────┤
│ 1 · STATE       git on main: dashboard.md, projects/*.md,    │
│                 inbox.md, decisions.log.md, exports/         │
│                 ── GitHub is always authoritative ──         │
└─────────────────────────────────────────────────────────────┘
```

Data flows up: state changes on `main` trigger automation, automation feeds
sync and observe. Nothing flows down — Notion and metrics are derived views,
never edited directly.

---

## Rituals

### Daily (5 min, desk or phone)
1. `/status` on Telegram or `cat cos-os/dashboard.md` at desk
2. Process inbox: action or file each entry, truncate `inbox.md`, reset `INBOX_COUNT`
3. Update `LAST_SYNC` in dashboard

### Weekly (30 min, desk — Claude Code session)
1. `git pull --rebase origin main`
2. Walk all 5 `projects/*.md` files — update STATUS, NEXT_ACTIONS, LAST_UPDATED
   for anything that moved
3. Rewrite dashboard TOP_PRIORITIES for the coming week
4. Write `exports/weekly-YYYY-MM-DD.md` — what moved, what stalled, decisions made
5. Commit + push → Notion sync fires automatically

### Monthly (15 min)
1. Read the last 4 weekly exports back to back
2. Append any durable decisions to `decisions.log.md`
3. Check `metrics/history.jsonl` trend: is stale_7d shrinking or growing?
   Is anything permanently 🔴 blocked? Kill or unblock it.

### Triggered (no schedule)
- **Stale alert issue opens** → review the named projects in the next daily pass
- **Decision made anywhere** (chat, call, Telegram) → `/log` it, then append to
  `decisions.log.md` at next desk session

---

## Observability Layer

### What gets measured (cos-os/metrics/)

`scripts/snapshot_metrics.py` runs daily at 08:30 UTC (and on demand via
`workflow_dispatch`). Pure parsing of state files, no synthesis. Emits:

- `metrics/latest.json` — current snapshot, pretty-printed (dashboard-friendly)
- `metrics/history.jsonl` — one row per day, append-only (same-day rerun
  replaces that day's row)

Per snapshot: inbox depth, counts of priorities / risks / waiting /
decisions-pending, project totals by status (✅⚠️🔴⬜), stale count (7+ days),
and the same breakdown per domain.

### What the numbers mean

| Signal | Healthy | Investigate |
|--------|---------|-------------|
| `inbox_count` | 0–3 | >5 for 3+ days — capture is outrunning processing |
| `stale_7d` | falling | rising week over week — weekly ritual is being skipped |
| `projects.blocked` | 0 | any value for >2 weeks — escalate or kill |
| `decisions_pending` | 0–2 | >3 — decision debt is accumulating |
| `inbox_overflow_files` | 0 | ≥1 — inbox not truncated after processing |

---

## Dashboarding Options

The metrics layer is consumer-agnostic. Ranked by fit:

### Option A — Notion (already built) · default
The existing sync mirrors dashboard + latest weekly. Zero additional setup.
Covers the "where do I stand" question. No trends, no alerting.

### Option B — Grafana Cloud free tier + Infinity datasource
Yes, Grafana works, and without self-hosting anything:

1. Create a free Grafana Cloud account (3 users, 14-day retention on the free
   stack — irrelevant here because the JSONL is the retention)
2. Install the **Infinity** datasource plugin (official, free)
3. Point it at the raw GitHub URL of `metrics/history.jsonl` (public repo) or
   add an `Authorization: token <PAT>` header (private repo)
4. Panels: stale_7d trend line, status distribution pie, inbox depth bar,
   per-domain table from `latest.json`
5. Alerting: Grafana alert rule on `blocked > 0` or `stale_7d` rising →
   email/Telegram webhook

Cost £0. Setup ~30 min. No infrastructure — Grafana pulls the files over HTTPS.

**Honest fit check:** CoS state is mostly qualitative. The chartable signal is
counts and staleness — useful for trend discipline and alerting, thin for
exploration. Grafana pays off if the alert rules replace manual checking;
it is decoration if the Telegram `/status` habit already works.

### Option C — Self-hosted Grafana + Prometheus
Don't. Requires a running server, contradicts the £0/no-infrastructure
constraint, and the data volume (one row per day) is absurdly below what that
stack is for.

### Recommended path
Run with A (Notion) + the metrics files for a month. If during monthly review
you find yourself wanting trend lines or missing blocked-project alerts, do B —
the JSONL is already in the exact shape Infinity consumes; nothing needs rework.

---

## Privacy Note

`zakijariwala/resume` deploys to GitHub Pages, which means the repository is
public — and so is everything in `cos-os/`: priorities, risks, personal project
state, business pipeline. The original v3.4 design called for a **private**
`cos-state` repo for exactly this reason.

Options, in order of preference:
1. Keep portfolio public, move `cos-os/` back to a private `cos-state` repo
   (the standalone scaffold still exists; the Worker's `GITHUB_REPO` var and
   `BASE` constant are the only things to change)
2. Accept public state and keep entries deliberately terse/abstract
3. Make the repo private and move Pages hosting fully to Cloudflare Pages
   (which supports private repos on the free plan)

Decision pending — owner call. Until decided, avoid logging anything sensitive
(names, amounts, employer specifics) via `/log`.
