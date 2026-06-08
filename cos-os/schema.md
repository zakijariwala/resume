# CoS State Schema v3.4

## DASHBOARD.MD CONTRACT

All headers appear at column zero, UPPERCASE_WITH_UNDERSCORES, colon suffix, no markdown heading prefix.
The eight required headers, in order:

    LAST_SYNC:
    TOP_PRIORITIES:
    CRITICAL_RISKS:
    ACTIVE_PROJECTS:
    WAITING:
    DECISIONS_PENDING:
    INBOX_COUNT:
    INBOX_OVERFLOW_FILES:

Each field body begins on the next line, indented or dash-prefixed.
Keep dashboard.md under 400 tokens total.
Status emoji key: ✅ on track  ⚠️ at risk  🔴 blocked  ⬜ idle

## PROJECT FILE CONTRACT

All section headings are "## UPPERCASE" with no deviation.
The seven required sections, in order:

    ## OBJECTIVE
    ## STATUS
    ## NEXT_ACTIONS
    ## RISKS
    ## DEPENDENCIES
    ## PRIORITY
    ## LAST_UPDATED

## DECISION LOG CONTRACT

Each entry opens with:

    ## DECISION [YYYY-MM-DD]

Followed by free prose. Entries are appended; never edited after creation.

## INBOX ENTRY CONTRACT

Each line in inbox*.md follows:

    - [ISO-8601 timestamp] DOMAIN text

DOMAIN is one of: BUSINESS, CAREER, CONTENT, LEARNING, PERSONAL.
Example: - [2026-06-06T14:30:00] CAREER follow up on Oman visa

## SCHEMA INTEGRITY RULES

1. Dashboard headers must match the exact format above or sed extraction breaks.
2. Prohibited inline pattern: any line beginning WORD: at column zero inside a
   dashboard section body. Indent or dash-prefix instead.
3. Project file section headers must be exactly "## [A-Z_]*" — no lowercase,
   no punctuation.
4. Validation command before committing a project file:
       grep "^## " [file] | grep -v "^## [A-Z_]*$"
   Any output means headers are non-conformant. Fix before committing.
5. inbox*.md files are append-only from the Telegram worker. Claude Code is the
   only process authorised to truncate them (after processing).
