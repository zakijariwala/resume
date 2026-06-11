#!/usr/bin/env python3
"""
Append a daily metrics snapshot parsed from CoS state files.
Pure parsing — no synthesis. Outputs:
  cos-os/metrics/history.jsonl  (one JSON object per day; same-day rerun replaces the row)
  cos-os/metrics/latest.json    (overwritten each run)

stdlib only — no pip install required.
"""
import json
import os
import re
import glob
from datetime import date, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # cos-os/

DASH_HDRS = [
    "LAST_SYNC", "TOP_PRIORITIES", "CRITICAL_RISKS", "ACTIVE_PROJECTS",
    "WAITING", "DECISIONS_PENDING", "INBOX_COUNT", "INBOX_OVERFLOW_FILES",
]

STATUS_KEYS = {"✅": "on_track", "⚠️": "at_risk", "🔴": "blocked", "⬜": "idle"}


def section_items(text, header):
    """Count non-empty dash items under a dashboard header."""
    term = "|".join(f"^{h}:" for h in DASH_HDRS)
    m = re.search(rf"^{header}:\n(.*?)(?={term}|\Z)", text, re.M | re.S)
    if not m:
        return 0
    return len([l for l in m.group(1).splitlines() if re.match(r"\s*-\s+\S", l)])


def section_int(text, header):
    m = re.search(rf"^{header}:\n\s*(\d+)", text, re.M)
    return int(m.group(1)) if m else 0


def parse_projects(path):
    """Yield (name, status_key, last_updated_str) per project block."""
    text = open(path).read()
    for chunk in re.split(r"^## PROJECT: ", text, flags=re.M)[1:]:
        name = chunk.strip().splitlines()[0].strip()
        status = "idle"
        sm = re.search(r"^## STATUS\s*\n\s*(.+)", chunk, re.M)
        if sm:
            for emoji, key in STATUS_KEYS.items():
                if emoji in sm.group(1):
                    status = key
                    break
        lm = re.search(r"^## LAST_UPDATED\s*\n\s*(.+)", chunk, re.M)
        last = lm.group(1).strip() if lm else "-"
        yield name, status, last


def days_since(s):
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return (date.today() - datetime.strptime(s, fmt).date()).days
        except ValueError:
            continue
    return None  # unparseable / never updated


def main():
    dash = open(os.path.join(BASE, "dashboard.md")).read()
    snap = {
        "date": date.today().isoformat(),
        "inbox_count": section_int(dash, "INBOX_COUNT"),
        "inbox_overflow_files": section_int(dash, "INBOX_OVERFLOW_FILES"),
        "priorities": section_items(dash, "TOP_PRIORITIES"),
        "risks": section_items(dash, "CRITICAL_RISKS"),
        "waiting": section_items(dash, "WAITING"),
        "decisions_pending": section_items(dash, "DECISIONS_PENDING"),
    }

    totals = {"total": 0, "on_track": 0, "at_risk": 0, "blocked": 0, "idle": 0}
    domains = {}
    stale = 0
    for path in sorted(glob.glob(os.path.join(BASE, "projects", "*.md"))):
        domain = os.path.splitext(os.path.basename(path))[0]
        if domain == "AGENTS":
            continue
        d = {"total": 0, "on_track": 0, "at_risk": 0, "blocked": 0, "idle": 0, "stale_7d": 0}
        for _name, status, last in parse_projects(path):
            d["total"] += 1
            d[status] += 1
            totals["total"] += 1
            totals[status] += 1
            ds = days_since(last)
            if ds is None or ds > 7:
                d["stale_7d"] += 1
                stale += 1
        domains[domain] = d

    snap["projects"] = totals
    snap["stale_7d"] = stale
    snap["domains"] = domains

    mdir = os.path.join(BASE, "metrics")
    os.makedirs(mdir, exist_ok=True)

    hist_path = os.path.join(mdir, "history.jsonl")
    rows = []
    if os.path.exists(hist_path):
        with open(hist_path) as f:
            rows = [json.loads(l) for l in f if l.strip()]
        rows = [r for r in rows if r.get("date") != snap["date"]]
    rows.append(snap)
    with open(hist_path, "w") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with open(os.path.join(mdir, "latest.json"), "w") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)

    print(f"Snapshot {snap['date']}: {totals['total']} projects "
          f"({totals['blocked']} blocked, {stale} stale), inbox {snap['inbox_count']}")


if __name__ == "__main__":
    main()
