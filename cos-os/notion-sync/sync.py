#!/usr/bin/env python3
"""
Push dashboard.md and latest weekly export to Notion.
Pure file-to-API transfer. No synthesis.
"""
import os
import glob
import requests

NOTION_TOKEN   = os.environ["NOTION_TOKEN"]
NOTION_PAGE_ID = os.environ["NOTION_PAGE_ID"]

HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}


def read_file(path):
    with open(path) as f:
        return f.read()


def text_block(content):
    """Split content into Notion paragraph blocks (2000-char limit each)."""
    blocks = []
    for chunk in [content[i:i+2000] for i in range(0, len(content), 2000)]:
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": chunk}}]
            }
        })
    return blocks


def clear_page_blocks(page_id):
    """Delete all existing blocks on the page."""
    url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    while True:
        r = requests.get(url, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        for block in data.get("results", []):
            requests.delete(
                f"https://api.notion.com/v1/blocks/{block['id']}",
                headers=HEADERS
            )
        if not data.get("has_more"):
            break


def append_blocks(page_id, blocks):
    url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    for i in range(0, len(blocks), 100):
        r = requests.patch(url, headers=HEADERS, json={"children": blocks[i:i+100]})
        r.raise_for_status()


def heading_block(text, level=2):
    key = f"heading_{level}"
    return {
        "object": "block",
        "type": key,
        key: {"rich_text": [{"type": "text", "text": {"content": text}}]}
    }


def main():
    blocks = []

    # Dashboard
    blocks.append(heading_block("Dashboard", 1))
    dashboard = read_file("cos-os/dashboard.md")
    blocks.extend(text_block(dashboard))

    # Latest weekly export
    weeklies = sorted(glob.glob("cos-os/exports/weekly-*.md"), reverse=True)
    if weeklies:
        blocks.append(heading_block(f"Latest Weekly — {weeklies[0]}", 1))
        blocks.extend(text_block(read_file(weeklies[0])))

    print(f"Syncing {len(blocks)} blocks to Notion page {NOTION_PAGE_ID}...")
    clear_page_blocks(NOTION_PAGE_ID)
    append_blocks(NOTION_PAGE_ID, blocks)
    print("Done.")


if __name__ == "__main__":
    main()
