# AGENTS.md — cos-os/metrics/

## Purpose
Machine-generated metrics time-series parsed from CoS state files. The foundation for any dashboard or alerting consumer (Notion, Grafana, static page).

## Ownership
Owned by `cos-os/AGENTS.md`. Written only by `scripts/snapshot_metrics.py` (daily via `cos-metrics-snapshot.yml`, 08:30 UTC, or manual `workflow_dispatch`).

## Local Contracts
- `history.jsonl` — one JSON object per day, append-only; a same-day rerun replaces that day's row; never edit rows manually
- `latest.json` — current snapshot, overwritten each run; treat as read-only derived data
- Schema is defined by `snapshot_metrics.py` output — changing field names is a breaking change for any dashboard consumer; update consumers in the same commit
- Files here are derived from state — never "fix" a metric by editing these files; fix the state file it was parsed from

## Verification
- `python3 cos-os/scripts/snapshot_metrics.py` runs clean from repo root
- `latest.json` domains list exactly: business, career, content, learning, personal
