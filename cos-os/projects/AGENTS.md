# AGENTS.md — cos-os/projects/

## Purpose
Five domain project tracker files. Each file covers multiple sub-projects within its domain.

## Ownership
Owned by `cos-os/AGENTS.md`.

## Local Contracts
- 5 domain files: `business.md`, `career.md`, `content.md`, `learning.md`, `personal.md`
- Each sub-project block uses this exact 7-section schema in order:
  ```
  ## PROJECT: [name]
  ## OBJECTIVE
  ## STATUS
  ## NEXT_ACTIONS
  ## RISKS
  ## DEPENDENCIES
  ## PRIORITY
  ## LAST_UPDATED
  ```
- All section headers must be exactly `## [A-Z_]*` — no lowercase, no punctuation
- Status values: `✅ on track` · `⚠️ at risk` · `🔴 blocked` · `⬜ idle`
- `## LAST_UPDATED` must be an ISO-8601 date (`YYYY-MM-DD`) — stale check script parses this field

## Work Guidance
- Update a project: edit the relevant `## STATUS`, `## NEXT_ACTIONS`, and `## LAST_UPDATED` fields
- Add a project: append a new block following the 7-section schema; add the project name to `dashboard.md` ACTIVE_PROJECTS if it becomes active
- Schema integrity check (run before every commit): `grep "^## " cos-os/projects/*.md | grep -v "^## [A-Z_]*$"` — any output means non-conformant headers; fix before committing
