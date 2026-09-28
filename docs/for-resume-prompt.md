# `for_resume/` generation prompt — schema v2

Paste everything below the line into Claude Code (or any coding agent) at the root of
each repository. Review the result as a PR in that repo before merging. The portfolio
fetches `for_resume/` from every repo you own (public and private) once a week and
publishes it automatically.

---

# Task: write this repository's portfolio entry

Create or update the `for_resume/` folder at the repository root. Its contents are fetched
weekly by zakijariwala.space and published automatically: frontmatter drives project
cards, the body becomes the case study page, and an optional deep-dive becomes a long-form
page. Touch nothing outside `for_resume/`.

## Who this is for

The owner is a systems engineer (enterprise banking infrastructure, 99.999% availability,
team lead) moving toward **reliability, cloud, and technical leadership / product roles**,
and away from being seen as a hands-on coder only. Frame the work by **ownership, decisions,
trade-offs, reliability, cost, delivery, and outcomes**. Keep technical detail fully
accurate, but put it in the engineer bullets and the body — the recruiter layer leads with
what was owned and what changed because of it. Do not undersell the engineering either:
the depth is the credibility.

## Non-negotiable rules

1. **Evidence only.** Every claim must be verifiable from this repo: code, config, docs,
   commit history, issues, READMEs. Never invent users, metrics, dates, clients, outcomes,
   team size, or adoption. If a fact is not in the repo, do not guess — add a question to
   `todo_owner`. Every metric needs an `evidence` value (file path or commit sha, or
   `owner-supplied` only if the owner already states it in repo docs). Evidence is kept for
   audit and is not shown publicly.
2. **AI-use disclosure.** Never describe how much AI was used to build this project. Do not
   write "AI-generated", "built with Claude/ChatGPT/Copilot", "vibe-coded", "prompted",
   "AI pair-programmed", or any similar phrase anywhere in the files. The only permitted
   signal is the frontmatter flag `ai_assisted: true`, which the site may render as one
   neutral line ("Built with AI-assisted tooling"). Set it to `true` if the repo shows AI
   contribution (co-author trailers, agent config files, docs saying so), else `false`.
   Never claim or imply the project was built without AI either.
   **Exception:** if the *product itself* uses AI (it calls an LLM, runs a model, etc.), that
   is a product feature and must be described accurately — e.g. "classifies inbound email
   with Gemini 1.5 Flash" is correct and required. The rule is about how the project was
   *built*, not what it *does*.
3. **Confidentiality.** Never include secrets, keys, tokens, env var values, internal
   hostnames/IPs/URLs, private customer or employer data, or other people's personal data.
   If the repo is **private**, include no code snippets and no internal paths in the body;
   describe architecture at component level. If it is client or employer work, describe it at
   a publicly shareable level and list what you withheld in the final report.
4. **Voice.** British English. Plain, specific, active voice; past tense for finished work.
   No hype words (leveraged, cutting-edge, seamless, robust, revolutionary, passionate,
   spearheaded, synergy, world-class, game-changing). No emojis. Numbers as digits.
5. **Updating.** If `for_resume/` exists: keep `slug` unchanged, keep anything between
   `<!-- keep -->` and `<!-- /keep -->` verbatim, keep a non-empty `highlights.story` and any
   non-empty `links` exactly as they are (the owner writes those), use the owner's answers to
   earlier `todo_owner` questions, and refresh everything else against the current code.
6. **Not portfolio-worthy?** (fork, tutorial, dotfiles, abandoned stub, config dump) Still
   write `project.md` with `publish: false` and a one-line `reason`. Skip the body and
   do not write a deep-dive.
7. **Media.** Do not generate images. If the repo already contains a real screenshot or
   diagram, reference its repo-relative path in `media` (max 3, PNG/JPG/WebP, under 1 MB each).

## Files

| File | Required | Purpose |
|---|---|---|
| `for_resume/project.md` | yes | Card data (frontmatter) + case study (body, 300–900 words) |
| `for_resume/deep-dive.md` | only if `size: large` | Long-form page, 1,500–4,000 words |

Write `deep-dive.md` only when the project is genuinely large: several subsystems, a real
decision history visible in commits/docs, or months of sustained work. Most repos should
not have one. If unsure, don't write it and say so in the report.

## `project.md` frontmatter (YAML, exactly these keys)

```yaml
schema: 2
slug: kebab-case-stable-id
title: Project name
tagline: ≤ 60 chars, what it is
publish: true                 # false + reason if not portfolio-worthy
reason: ""
status: shipped               # active | shipped | maintained | paused | archived | experiment
kind: product                 # product | tool | library | infrastructure | automation | experiment | client-work | learning
size: medium                  # small | medium | large  (large ⇒ deep-dive.md expected)
started: 2025-03              # YYYY-MM from first meaningful commit
ended: null                   # YYYY-MM or null
role: "Owner — scoped, designed, built, operated"
summary: One sentence, outcome first, ≤ 200 chars.
problem: One sentence — what was wrong or missing before this existed.
stack: [Python, Cloudflare Workers]   # real, from manifests/imports; most important first; ≤ 10
categories: [cloud, reliability]      # ≤ 3 of: reliability, cloud, infra, product, automation, ai, data, web, mobile, embedded, security
links: { live: "", docs: "", demo: "" }   # public URLs only; the site adds the repo link itself
metrics:                              # 0–4; evidenced numbers only
  - value: "2,704"
    label: "content files produced by the export pipeline"
    evidence: "docs/data/lines/ ; scripts/export.py"
highlights:
  recruiter:    # exactly 3 bullets, ≤ 30 words each: what was owned → what changed. No jargon without payoff.
    - ...
  engineer:     # 3–5 bullets: architecture, constraints, decisions, failure handling, numbers
    - ...
  story: >      # 1–3 sentences, first person, why I built it. Only if evidenced (README, docs, commits); else "" + a todo_owner question
    ...
skills: [Incident runbooks, Cost-constrained architecture]   # capabilities demonstrated, ≤ 8; favour ownership/reliability/cloud/delivery skills where evidenced
ai_assisted: false            # see rule 2
media: []                     # [{ path: docs/screenshot.png, alt: "..." }]
todo_owner: []                # questions only the owner can answer (missing metrics, users, outcomes, motivation)
generated: { at: YYYY-MM-DD, commit: <short sha of HEAD> }
```

## `project.md` body

Markdown, 300–900 words, these H2s in this order. Omit a section only if nothing is evidenced.

```
## Overview
## The problem
## What I built
## Architecture        (components and data flow as a short list — no diagram code)
## Key decisions       (each: decision → alternatives considered → why; only where the repo shows it)
## Results             (evidenced only; otherwise state status plainly)
## What's next         (from TODOs, open issues, roadmap docs — not invented)
```

## `deep-dive.md` (large projects only)

Frontmatter: `schema: 2`, `slug` (same as project.md), `title`, `summary` (≤ 200 chars),
`generated: { at, commit }`. Body, 1,500–4,000 words, these H2s:

```
## Context             (situation, constraints, what success meant)
## Timeline            (phases with YYYY-MM, from commit history)
## Architecture in depth
## Decision log        (dated decisions: options, choice, reasoning, what it cost)
## What went wrong     (bugs, incidents, reversals visible in history — and how they were handled)
## Operating it        (deploys, monitoring, cost, maintenance)
## Results and lessons
## Roadmap
```

Same rules apply. This is where judgement and ownership show — write it like a design
review, not a tutorial.

## When done

1. Check the YAML parses and every key above is present with an allowed value. Wrap every
   list item and every string containing a colon in double quotes — an unquoted
   `- Three layers: unit, e2e` is read as a map, not text.
2. Search your output for the banned phrases in rules 2 and 4 and for anything resembling a
   secret; fix any hits.
3. Print a short report: files written, `size` chosen and why, `todo_owner` items, anything
   withheld for confidentiality, and any claim you were unsure about.
4. Commit only `for_resume/` with message `docs(for_resume): update portfolio entry`. Do not add
   AI co-author trailers to the commit.
