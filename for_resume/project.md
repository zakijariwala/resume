---
schema: 2
slug: zakijariwala-space-portfolio
title: zakijariwala.space
tagline: Three-audience portfolio site with a data-driven build
publish: true
reason: ""
status: active
kind: product
size: medium
started: 2026-05
ended: null
role: "Owner — scoped, designed, built, operated"
summary: A static portfolio that presents one set of career data three ways (recruiter, developer, curious reader), built and deployed automatically on every push to main.
problem: A single resume page could not serve recruiters, engineers and general readers at once, and every content change meant editing markup by hand.
stack: [Astro, TypeScript, Tailwind CSS, GitHub Actions, GitHub Pages, Decap CMS, Cloudflare Workers, Python]
categories: [web, product, automation]
links: { live: "https://zakijariwala.space", docs: "", demo: "" }
metrics:
  - value: "3"
    label: "audience modes, each with its own layout, typography and copy"
    evidence: "CLAUDE.md ; src/layouts/Base.astro"
  - value: "5"
    label: "JSON data files that hold all site content"
    evidence: "src/data/"
  - value: "3"
    label: "GitHub Actions workflows (site deploy, Notion sync, daily stale-project alert)"
    evidence: ".github/workflows/"
highlights:
  recruiter:
    - Owned the portfolio end to end, from positioning and content governance to build pipeline and hosting, and moved it from a hand-edited HTML page to a data-driven static site.
    - Separated content from presentation so career data changes in one JSON file and every audience view updates on the next automatic deploy.
    - Ran structured review rounds (design audit, recruiter feedback, mode audit) and shipped each set of fixes as tracked commits.
  engineer:
    - Astro 4 static build with Tailwind CSS 3; all content lives in 5 JSON files under src/data, so layout components never hold copy.
    - Mode and theme are set by a synchronous inline script in the document head that reads localStorage before first paint, which prevents a flash of the wrong mode.
    - Three modes are driven by a data-mode attribute and CSS visibility classes against a semantic token layer, with no client-side framework.
    - GitHub Actions builds with npm ci and deploys to GitHub Pages on every push to main, with a concurrency group so only one deploy runs at a time.
    - A companion workspace adds a Cloudflare Worker Telegram bot with a user allow-list, a Notion sync job and a daily cron that opens a GitHub issue for projects idle 7 days or more.
  story: ""
skills: [Content architecture, Static site delivery, CI/CD pipelines, Design systems, Stakeholder feedback loops, Personal operations automation]
ai_assisted: true
media: []
todo_owner:
  - "Why did you build a three-mode portfolio rather than a single page? A 1–3 sentence first-person story would fill highlights.story."
  - "Is the site now served from GitHub Pages or Cloudflare Pages? CLAUDE.md says GitHub Pages (migrating), HANDOVER.md says Cloudflare Pages."
  - "Has the Decap CMS and the Formspree contact form been activated? Both are listed as pending in HANDOVER.md."
  - "Has the Telegram bot been deployed? cos-os/README.md lists its deployment checklist as unchecked."
  - "Any traffic, recruiter response or interview outcome you are willing to publish?"
generated: { at: 2026-09-27, commit: 2c6334b }
---

## Overview

zakijariwala.space is my professional portfolio. It is a static Astro site that renders the same career data in three distinct modes: Recruiter, Developer and Curious. Each mode changes layout density, typography, section labels and tone, so a visitor who switches modes sees what feels like a different site. The repository also hosts a small personal operations workspace that automates status tracking around my projects.

## The problem

The first version was a hand-edited HTML resume. It had two weaknesses. It spoke to one audience, so a recruiter scanning for credentials and an engineer looking for stack detail got the same page. And every content change meant editing markup, which made the site slow to keep current.

## What I built

- A data layer: 5 JSON files (meta, experience, projects, skills, certifications) that are the single source of truth for all content, each holding per-mode copy where the audiences need different framing.
- A component layer in Astro: hero, experience cards with KPI rows, featured and standard project cards, tabbed skills, certifications and a contact section, all opening with a shared section header component.
- A three-mode identity system. Recruiter mode leads with titles, organisations and a 4-card stat grid. Developer mode leads with stack and metrics in denser layouts. Curious mode replaces the stat grid with a personal "currently" block and uses an editorial layout.
- Design and content governance documents (design system, content governance, CMS setup) that define the token layer and the rules for editing.
- A Decap CMS configuration at /admin that maps collections to the data files, so content can be edited through the GitHub API without touching code.
- A personal operations workspace: a Telegram bot on Cloudflare Workers that reads and writes status files through the GitHub API, a Notion sync job and a daily stale-project alert.

## Architecture

- Content: src/data/*.json, edited directly or through Decap CMS.
- Build: Astro 4 with Tailwind CSS 3 and TypeScript, static output only.
- Client behaviour: inline vanilla JavaScript for mode switching, theme toggle, scroll fade-in, skills tabs and active nav state. An inline head script applies saved mode and theme before first paint.
- Delivery: GitHub Actions on push to main runs npm ci and astro build, uploads dist as a Pages artifact and deploys it.
- Operations workspace: Markdown status files, a Cloudflare Worker webhook for Telegram commands, a Python Notion sync triggered by pushes to the dashboard, and a Python cron job that opens a GitHub issue for stale projects.

## Key decisions

- **Astro static build over vanilla HTML.** The original site was hand-written HTML. Moving to Astro kept the output static and cheap to host while letting components read from JSON, which removed copy from markup. The project rules forbid reverting this.
- **No client-side framework.** React and Vue were ruled out in the project rules. Mode switching, tabs and animations run as small inline scripts, which keeps the page light and avoids a hydration step.
- **Modes as identities, not filters.** A mode audit in May 2026 led to a remediation commit that diverged the per-mode bullets and rebalanced the hero, and the project rules now require each mode to differ in layout, typography and copy, not only in which content is shown.
- **Semantic token layer.** All colours, fonts and sizes resolve through CSS custom properties on :root, with no hardcoded values in components. This let a single accent token change per mode instead of duplicating styles.
- **GitHub as the source of truth for operations.** The Telegram bot and Notion sync both read from the repository, and the workspace README states that the repository wins any conflict with memory.

## Results

- The site builds and deploys automatically from main through GitHub Actions.
- Content is fully separated from presentation across 5 data files and 16 components.
- The site went through a full structural rebuild, a repositioning pass, a recruiter feedback pass and a design audit, each visible as a set of commits between May and June 2026.
- The Decap CMS and the contact form are configured in code but listed as pending activation in the handover notes.

## What's next

- Activate Decap CMS through a GitHub OAuth app.
- Connect the contact form to a Formspree endpoint.
- Finish the hosting move to Cloudflare Pages.
- Deploy the Telegram bot and add the Notion secrets for the operations workspace.
