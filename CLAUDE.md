# CLAUDE.md — AI Context for zakijariwala.space Portfolio

This file is the handoff document for any AI assistant working on this project.
Read this before touching any code or content.

---

## Project Identity

**Owner:** J. Zaki — Systems Engineer, Mumbai. TCS deployed at SBI GITC.
**Site:** zakijariwala.space
**Purpose:** Professional portfolio targeting infrastructure, SRE, and platform engineering roles.
**Hosting:** GitHub Pages (migrating to Cloudflare Pages). Astro static build, deployed via GitHub Actions.
**CMS:** Decap CMS at `/admin/` — edits data files via GitHub API, triggers rebuild on save.

---

## Current Stack

```
Astro 4 + Tailwind CSS 3 + TypeScript
GitHub Actions: push to main → npm run build → deploy to GitHub Pages
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

## Three-Mode Identity System — Core Principle

The portfolio has three audience modes: **Recruiter**, **Developer**, **Curious**.

This is not a content filter. Each mode is a distinct visual identity. A user switching between modes must feel they have encountered three different websites — different layout density, different typographic emphasis, different surface language, different section labeling, different tone. Content differences reinforce these identities but do not create them alone.

Depth and authenticity over cleverness. Technical richness in Developer mode comes from information density and genuine stack/metric detail — not from simulated interfaces. Curiosity in Curious mode comes from editorial layout and personal voice — not from decorative flourishes.

### Recruiter Mode

- **Voice:** Formal, credential-first, metric-heavy, scannable in 60 seconds
- **Layout:** Spacious, structured hierarchy, clear visual separation between roles
- **Typography:** Fraunces display at prominent sizes; neutral body weight throughout
- **Color:** Blue accent (`--accent-recruiter`), clean neutral surfaces
- **Section labels:** Uppercase mono with gold horizontal-rule prefix — e.g., `WORK HISTORY`
- **Hero right column:** 2×2 stat card grid (exactly 4 KPIs: uptime, users, servers, RTO)
- **Emphasis:** Titles, organisation names, numbers, availability status, certifications

### Developer Mode

- **Voice:** Peer-to-peer, technical, shows-the-work, no hand-holding
- **Layout:** Denser information per viewport, stack chips and metrics prominent
- **Typography:** JetBrains Mono features more prominently in UI chrome and labels; body text tighter
- **Color:** Green accent (`--accent-developer`), slightly cooler/darker surfaces
- **Section labels:** Code-comment style prefix — e.g., `// work_history`
- **Hero right column:** Same 4 stat cards, framed with a technical-context strip below
- **Emphasis:** Stack, architecture decisions, GitHub links, build context, metrics with precision
- **Rule:** No simulated or fake interactive elements. Technical credibility comes from real data, not theatre.

### Curious Mode

- **Voice:** Personal, narrative, first-person allowed, editorial, quiet dry wit acceptable
- **Layout:** Editorial — more whitespace, wider prose columns, pull-quote treatments, "why I built it" always visible
- **Typography:** Fraunces used more expressively; larger display at hero; more italic use; slightly looser line height
- **Color:** Amber accent (`--accent-curious`), warmer surface tone in light mode
- **Section labels:** Sentence-case plain text, no prefix — e.g., `What I've built`
- **Hero right column:** Replaced entirely with a personal "currently" block — what's being built, explored, or thought about. No stat cards.
- **Emphasis:** The reasoning behind decisions, the human context, the projects that matter personally

---

## Design System (summary — full detail in DESIGN-SYSTEM.md)

All design decisions reference semantic CSS custom properties. Never hardcode colors, sizes, or font names inside component styles. The token layer in `:root` is the single source of truth.

**Color tokens:**
- `--bg`, `--surface`, `--surface-raised`, `--border`, `--border-strong`
- `--text`, `--text-muted`, `--text-disabled`
- `--accent`, `--accent-subtle`, `--accent-border`, `--accent-text` (mode-reactive)
- `--accent2`, `--accent2-subtle`, `--accent2-border` (fixed gold — structural use only)
- `--status-active`, `--status-done`, `--status-pending`, `--status-dim`

**Font roles:**
- `--font-display` (Fraunces) → hero name, section titles, experience titles, project names, cert names, stat numbers, contact headline
- `--font-mono` (JetBrains Mono) → section labels, metric chips, stack chips, timestamps, periods, form labels
- `--font-body` (Inter) → all other text

**Do not:**
- Add a third accent color — extend the existing scale instead
- Use `box-shadow` for depth — use border contrast and background contrast
- Hardcode any hex/rgb value outside `:root`
- Use `font-weight > 600` on the display font
- Add more than 4 stat cards to the hero stat grid
- Use `!important`

---

## Page Structure (in order)

1. `<nav>` — fixed, blur backdrop, logo left + nav links center + mode switcher + theme toggle right
2. `#hero` — two-column desktop (text+CTAs left, mode-adaptive right), single column mobile
3. `#about` — sticky left col (2–3 sentences + callout) + right col (prose)
4. `#experience` — sidebar period/badge left + bullets + KPI row per role
5. `#projects` — featured full-width card + standard card grid (up to 5)
6. `#skills` — tabbed, six categories
7. `#certifications` — three-column card grid
8. `#contact` — two-column (links left + Formspree form right)
9. `<footer>` — single line

Every section opens with `.section-label` then `h2.section-title`. Both are mode-adaptive in text content.
This pattern is mandatory — do not open a section without it.

---

## JS (all inline, no external dependencies)

- **Mode switching:** data-mode on html/body, CSS visibility classes (.recruiter-only, .dev-only, .curious-only, .all-modes)
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
    StatCard.astro                  (hero stat card)
    KpiRow.astro                    (experience KPI row)
  layouts/
    Base.astro
  pages/
    index.astro
  styles/
    global.css
  data/
    meta.json
    experience.json
    projects.json
    skills.json
    certifications.json
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
