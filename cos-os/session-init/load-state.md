# Session Initialisation — CoS Operating System v3.4

## How to Start a CoS Chat (non-Claude-Code / mobile)

1. Copy the Part D system prompt from the build guide.
2. Paste it at the top of a new Claude chat.
3. Paste the content of the latest `exports/YYYY-MM-DD.md` file
   immediately after the system prompt.
4. Claude will orient from that snapshot. Tell it what you want to work on.
5. Any state changes it proposes will come back as an EXPORT STATE block.
   Apply them later via Claude Code.

## Session Start Checklist (Claude Code)

Run through this at the top of every desk session:

- [ ] Memory active (Claude.ai Settings → Memory enabled)
- [ ] `git pull --rebase origin main` completed cleanly
- [ ] `cat dashboard.md` shown and reviewed
- [ ] Inbox processed: all entries approved and committed,
      all inbox*.md files truncated, INBOX_COUNT reset to 0

## The One Rule

GitHub is always authoritative over memory.
If they conflict, GitHub wins. Always.

## Conflict Resolution Quick Reference

```
# See conflicting files
git diff --name-only --diff-filter=U

# inbox*.md → keep incoming (theirs)
git checkout --theirs inbox*.md
git add inbox*.md

# projects/*.md / dashboard.md → manual merge
# Preserve newest LAST_UPDATED, combine non-duplicate content
git add [file]

git rebase --continue
git push origin main
```

## Export State Format (for mobile sessions)

When Claude Code is unavailable, ask Claude to output changes as:

```
=== EXPORT STATE [YYYY-MM-DD] ===
[full dashboard.md content]
--- projects/[domain].md ---
[full file content]
=== END EXPORT STATE ===
```

Paste this into a Claude Code session with:
`Apply this export state and commit.`
