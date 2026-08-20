# CLAUDE.md — AI Context for zakijariwala.space Portfolio

This file is the handoff document for any AI assistant working on this project.
Read this before touching any code or content.

---

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project Identity

**Owner:** J. Zaki — Systems Engineer, Mumbai. TCS deployed at SBI GITC.
**Site:** zakijariwala.space
**Purpose:** Professional portfolio targeting infrastructure, SRE, and platform engineering roles.
**Hosting:** Cloudflare Pages, project `resume`, building from branch **`ai-pm`**
with automatic deployments. Custom domain zakijariwala.space, plus
resume-e4n.pages.dev. Other branches deploy as Cloudflare *Preview* builds.

`main` is NOT production and trails `ai-pm`. The GitHub Pages workflow that
deployed `main` has been removed — there is one deployment path now.
**CMS:** Decap CMS at `/admin/` — edits data files via GitHub API, triggers rebuild on save.

---

## Current Stack

```
Astro 4 + Tailwind CSS 3 + TypeScript
Cloudflare Pages: push to ai-pm → npm run build → deploy to zakijariwala.space
src/data/*.json — single source of truth for all portfolio content
Decap CMS — /public/admin/index.html + /public/admin/config.yml
```

**Do not:**
- Remove the Astro build step or revert to vanilla HTML
- Move content out of src/data/ without updating the CMS config accordingly
- Introduce React, Vue, or any client-side JS framework
- Add runtime server-side code — this is a static site
- Add npm dependencies without explicit instruction from the owner

---

## Four-Mode Identity System — Core Principle

The portfolio has four audience modes: **Recruiter**, **Developer**, **Curious**, **Infrastructure**.

This is not a content filter. Each mode is a distinct visual identity. A user switching between modes must feel they have encountered three different websites — different layout density, different typographic emphasis, different surface language, different section labeling, different tone. Content differences reinforce these identities but do not create them alone.

Depth and authenticity over cleverness. Technical richness in Developer mode comes from information density and genuine stack/metric detail — not from simulated interfaces. Curiosity in Curious mode comes from editorial layout and personal voice — not from decorative flourishes.

### Architecture

Recruiter and Developer modes live at `/` — instant CSS toggle via `data-mode` on `<html>`. No page navigation.

Curious mode lives at `/curious` — a fully separate Astro page (`src/pages/curious.astro`) using the Award layout. The Curious button in the mode switcher is a `<a href="/curious">` link, not a toggle.

Developer mode will eventually live at `/dev` — same pattern as Curious. The mode switcher accepts a `currentMode` prop so it can route (Curious/Dev) vs. toggle (Recruiter/Developer on `/`).

The `/curious` page has:
- The Award redesign in warm light mode (`~#f7f4ef` background, coral `#ff5e3a` accent)
- A mode switcher in the nav (links back to `/?mode=recruiter`, `/?mode=developer`, `/dev` when built)
- A floating "← Back to main portfolio" button
- Astro View Transitions (`<ClientRouter />`) for smooth cross-page navigation

All three pages share `src/data/*.json` as single source of truth. `meta.json` has `photo_recruiter`, `photo_developer`, `photo_curious` fields. Each page's Hero uses only its own.

### Recruiter Mode

- **Voice:** Formal, credential-first, metric-heavy, scannable in 60 seconds
- **Layout:** Spacious, structured hierarchy, clear visual separation between roles
- **Typography:** Fraunces display at prominent sizes; neutral body weight throughout
- **Color:** Indigo accent (`--color-primary`), clean neutral surfaces
- **Section labels:** Uppercase mono with gold horizontal-rule prefix — e.g., `WORK HISTORY`
- **Hero right column:** none — the hero is a single column. Numbers live in the proof strip below it.
- **Emphasis:** Titles, organisation names, numbers, availability status, certifications

### Developer Mode

- **Voice:** Peer-to-peer, technical, shows-the-work, no hand-holding
- **Layout:** Denser information per viewport, stack chips and metrics prominent
- **Typography:** JetBrains Mono features more prominently in UI chrome and labels; body text tighter
- **Color:** Green accent (`--color-infra`), slightly cooler/darker surfaces
- **Section labels:** Code-comment style prefix — e.g., `// work_history`
- **Hero right column:** none — see the proof strip below the hero
- **Emphasis:** Stack, architecture decisions, GitHub links, build context, metrics with precision
- **Rule:** No simulated or fake interactive elements. Technical credibility comes from real data, not theatre.

### Infrastructure Mode

- **Voice:** Operations-first, credential-led, plain about scale and reliability
- **Layout:** Recruiter-like spacing with developer-level technical detail retained
- **Typography:** Mono used for labels and chrome, as in Developer mode
- **Color:** Steel accent (`--prim-steel`), cooler than both blue and green
- **Section labels:** Uppercase mono with a steel vertical rule prefix — e.g., `OPERATIONS HISTORY`
- **Hero right column:** none — the operating figures appear in the proof strip below the hero
- **Emphasis:** RHEL and Linux fleet operations, IBM Security Identity Manager, high availability and the 99.999% SLA, DR runbooks and the 50% RTO reduction, on-premise containerisation, Python and Bash automation, GCP PCA and AWS SAA
- **Demoted:** Product-management framing. The coaching entry is withheld entirely via `hide_in_modes` in `experience.json`.
- **Rule:** Reframes and reorders existing content only. No claim appears in this mode that is not already in the repo.

### Curious Mode

- **Voice:** Personal, narrative, first-person allowed, editorial, quiet dry wit acceptable
- **Layout:** Editorial — more whitespace, wider prose columns, pull-quote treatments, "why I built it" always visible
- **Typography:** Fraunces used more expressively; larger display at hero; more italic use; slightly looser line height
- **Color:** Purple accent (`--color-ai`), warmer surface tone in light mode
- **Section labels:** Sentence-case plain text, no prefix — e.g., `What I've built`
- **Hero right column:** Replaced entirely with a personal "currently" block — what's being built, explored, or thought about. No stat cards.
- **Emphasis:** The reasoning behind decisions, the human context, the projects that matter personally

---

## Design System (summary — full detail in DESIGN-SYSTEM.md)

All design decisions reference semantic CSS custom properties. Never hardcode colors, sizes, or font names inside component styles. The token layer in `:root` is the single source of truth.

**Two colour axes. Do not conflate them.**

- **Mode accent** — which perspective is active. One at a time, site-wide.
  Drives nav, links, buttons, active states, section-label prefixes.
  Recruiter indigo · Developer green · Curious purple · Infrastructure steel.
- **Category colour** — what a *thing* is. Several visible at once. Drives
  project badges, metric accents, skill groups.
  `--color-primary` · `--color-ai` · `--color-product` · `--color-infra`,
  each with `-subtle` and `-border` variants, defined for light and dark.

The two overlap on purpose (Curious purple is AI purple) because they never
occupy the same UI role.

Every category value is verified ≥ 4.5:1 against `--bg` in both themes. If you
change one, re-measure — do not eyeball a replacement.

**Color tokens:**
- `--bg`, `--surface`, `--surface-raised`, `--border`, `--border-strong`
- `--text`, `--text-muted`, `--text-disabled`
- `--accent`, `--accent-subtle`, `--accent-border`, `--accent-text` (mode-reactive)
- `--accent2`, `--accent2-subtle`, `--accent2-border` (fixed gold — structural use only)
- `--color-{primary,ai,product,infra}` + `-subtle` / `-border` (category, theme-reactive)
- `--status-active`, `--status-done`, `--status-pending`, `--status-dim`

**Font roles:**
- `--font-display` (Fraunces) → hero name, section titles, experience titles, project names, cert names, stat numbers, contact headline
- `--font-mono` (JetBrains Mono) → section labels, metric chips, stack chips, timestamps, periods, form labels
- `--font-body` (Inter) → all other text

**Do not:**
- Add a colour outside the category scale — extend `--color-*` instead
- Reference a `--prim-*` primitive directly from a component
- Use `box-shadow` as the *primary* depth cue — border and background contrast
  come first; a shadow may reinforce a hover or elevation state, not replace them
- Hardcode any hex/rgb value outside `:root`
- Use `font-weight > 600` on the display font
- Restate a metric in both the hero and the proof strip — each number appears once
- Use `!important`

---

## Routes

- `/` — the portfolio. Mode comes from `?mode=` or `localStorage`, resolved client-side.
- `/infra` — the same page pinned to Infrastructure mode via the `forceMode` prop on `Base.astro`.
  It exists because mode is resolved in the browser, so a shared `/?mode=infrastructure`
  link cannot preview as infrastructure work — social scrapers do not run the mode script.
  This route carries its own `<title>`, description, canonical, and OG tags.

## Page Structure (in order)

1. `<nav>` — fixed, blur backdrop, logo left + nav links center + mode switcher + theme toggle right
2. `#hero` — single column (eyebrow triad, name, role line, positioning statement,
   supporting line, two CTAs). Curious mode is two-column, with its "currently" block on the right.
3. `#proof` — full-width proof strip: six metrics from `meta.json` `proof_metrics`,
   each with a category-coloured left rule. Every number is stated here and nowhere else.
3. `#about` — sticky left col (2–3 sentences + callout) + right col (prose)
4. `#experience` — sidebar period/badge left + bullets + KPI row per role
5. `#projects` — featured full-width card + standard card grid. Each card is
   outcome-first: category badge, name, one-line problem, key outcome, tech
   chips, then implementation bullets behind a native `<details>` disclosure.
   Developer and Infrastructure modes open the disclosures automatically.
6. `#thinking` — "How I think": five ordered steps (Problem → Hypothesis →
   Build → Measure → Decide), each citing a real project as evidence.
6. `#skills` — tabbed, six categories
7. `#certifications` — three-column card grid
8. `#contact` — two-column (links left + Formspree form right)
9. `<footer>` — single line

Every section opens with `.section-label` then `h2.section-title`. Both are mode-adaptive in text content.
This pattern is mandatory — do not open a section without it.

---

## JS (all inline, no external dependencies)

- **Mode switching:** data-mode on html/body, CSS visibility classes (.recruiter-only, .dev-only, .curious-only, .infra-only, .all-modes)
- **Mode-gating caveat:** Astro appends the component scope id to *every* part of a selector,
  including `[data-mode="..."]`, which lives on `<html>`. Any rule keyed on `[data-mode]` must
  therefore go in a `<style is:global>` block or it silently never matches. Also, a class that
  sets its own `display` (`.stat-grid`, `.availability-line`) outranks the visibility classes
  and needs an explicit per-mode rule.
- **FOUC prevention:** synchronous inline script in <head> reads localStorage before first paint
- **Mode toast:** brief notification on mode change
- **Scroll fade-in:** IntersectionObserver on `.fade-in` → adds `.visible`
- **Mobile menu:** hamburger toggle on #mobile-menu
- **Skills tabs:** data-group on .skill-nav-btn → swaps .active on .skill-group divs
- **Active nav link:** IntersectionObserver updates .active on nav links
- **Theme toggle:** toggles data-theme="dark" on html/body

No jQuery. No frameworks. No external JS except Google Fonts.

---

## CMS (Decap CMS)

Lives at `/public/admin/index.html` and `/public/admin/config.yml`.

- **Backend:** github — repo zakijariwala/resume, branch main
- **Auth:** GitHub OAuth app (see CMS-SETUP-GUIDE.md for activation steps)
- **Collections:** maps to src/data/ file structure
- **On save:** commits to main → GitHub Actions triggers → site rebuilds in ~2 minutes

The CMS is a static HTML page. No server required.

---

## Contact Form (Formspree)

Contact form action: `https://formspree.io/f/YOUR_FORM_ID`
To activate: register at formspree.io, get endpoint ID, replace placeholder in ContactSection.astro.

---

## Patterns

**Section header (mandatory on every section):**
```html
<SectionHeader label="Label text" title="Section title" />
```
Renders .section-label (mode-adaptive prefix style) + h2.section-title.

**Fade-in entrance:**
```html
<div class="fade-in">...</div>
```
With optional `style="transition-delay: 0.15s"` for staggered siblings.

**KPI:**
```html
<div class="kpi">
  <span class="kpi-val">99.999%</span>
  <span class="kpi-label">Uptime SLA</span>
</div>
```

**Metric chip:** `<span class="project-metric">Sub-10ms queries</span>`
**Stack chip:** `<span class="stack-chip">Python</span>`

---

## File Map

```
src/
  components/
    Nav.astro
    Hero.astro
    About.astro
    ExperienceCard.astro
    ExperienceSection.astro
    ProjectCard.astro               (standard grid card)
    FeaturedProjectCard.astro       (full-width featured card)
    ProjectsSection.astro
    SkillsSection.astro
    CertificationsSection.astro
    ContactSection.astro
    Footer.astro
    SectionHeader.astro             (reusable label + title)
    ProofStrip.astro                (metrics band under the hero)
    ThinkingSection.astro           (How I think)
    StatCard.astro                  (unreferenced since the hero stat grid moved
                                     to ProofStrip — kept, not yet deleted)
    KpiRow.astro                    (experience KPI row)
  layouts/
    Base.astro
  pages/
    index.astro                     (Recruiter mode — mode system + proof strip)
    dev.astro                       (Developer mode — Dev layout, separate page)
    curious.astro                   (Curious mode — Award layout, separate page)
    now.astro                       (Now / currently — markdown-driven)
    infra.astro                     (Infrastructure mode, mode-pinned route)
  styles/
    global.css
  data/
    meta.json
    experience.json
    projects.json
    skills.json
    certifications.json
    thinking.json
public/
  admin/
    index.html                      (Decap CMS entry)
    config.yml                      (Decap CMS config)
  ZAKI.J_Resume.pdf
CLAUDE.md
DESIGN-SYSTEM.md
CONTENT-GOVERNANCE.md
CMS-SETUP-GUIDE.md
```
