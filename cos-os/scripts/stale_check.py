#!/usr/bin/env python3
"""
Parse LAST_UPDATED from all cos-os/projects/*.md.
Open a GitHub issue listing any project not updated in 7+ days.
Pure date comparison — no synthesis.
"""
import os
import re
import glob
import json
import requests
from datetime import date, datetime, timedelta

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_REPO  = os.environ["GITHUB_REPO"]
STALE_DAYS   = 7

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}


def extract_projects(path):
    """Return list of (project_name, last_updated_str) from a project file."""
    text = open(path).read()
    results = []
    chunks = re.split(r"^## PROJECT: ", text, flags=re.MULTILINE)
    for chunk in chunks[1:]:
        lines = chunk.strip().splitlines()
        name = lines[0].strip() if lines else path
        m = re.search(r"^## LAST_UPDATED\s*\n\s*(.+)", chunk, re.MULTILINE)
        last = m.group(1).strip() if m else "-"
        results.append((name, last))
    return results


def parse_date(s):
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def open_issue(stale):
    today = date.today().isoformat()
    title = f"Stale projects alert — {today}"
    lines = [f"- **{name}** — last updated: `{last}` ({domain})"
             for domain, name, last in stale]
    body = (
        f"The following projects have not been updated in {STALE_DAYS}+ days "
        f"(checked {today}):\n\n" + "\n".join(lines) +
        "\n\nRun `STATUS` in a CoS session to review."
    )
    r = requests.post(
        f"https://api.github.com/repos/{GITHUB_REPO}/issues",
        headers=HEADERS,
        data=json.dumps({"title": title, "body": body, "labels": ["stale"]})
    )
    r.raise_for_status()
    print(f"Issue opened: {r.json()['html_url']}")


def main():
    threshold = date.today() - timedelta(days=STALE_DAYS)
    stale = []

    for path in sorted(glob.glob("cos-os/projects/*.md")):
        domain = os.path.splitext(os.path.basename(path))[0]
        for name, last in extract_projects(path):
            d = parse_date(last)
            if d is None or d < threshold:
                stale.append((domain, name, last))

    if not stale:
        print("No stale projects.")
        return

    print(f"{len(stale)} stale project(s) found.")
    open_issue(stale)


if __name__ == "__main__":
    main()
