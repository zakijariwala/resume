# Design System — zakijariwala.space Portfolio

## Philosophy

This portfolio represents a senior engineer who builds real things. The design language communicates:

- **Precision** — every spacing, size, and weight decision is intentional
- **Credibility** — nothing decorative that does not earn its place
- **Personality** — three distinct identities, not three skins over one template

The three-mode system is the defining feature of this design. Recruiter, Developer, and Curious modes are not content filters — they are distinct visual identities. The same person, presented three different ways to three different readers, each presentation optimised for what that reader is actually looking for.

Design decisions are made by referencing tokens, never by hardcoding values. If a value is not in the token system, update the token system — do not patch the component.

---

## Token Layers

Tokens are defined in three layers. Each layer references the one above it — never skip layers.

```
Primitives → Semantics → Component tokens
```

### Layer 1 — Primitives (raw values, never used directly in components)

```css
--prim-*    Color primitives
--space-*   Spacing primitives (4px increments)
--radius-*  Radius primitives
```

### Layer 2 — Semantic tokens (what components reference)

```css
--bg                  Page background
--surface             Elevated surface (cards, panels)
--surface-raised      Further elevated (tooltips, dropdowns)
--border              Default border
--border-strong       Emphasized border (hover states)
--text                Primary text
--text-muted          Secondary / supporting text
--text-disabled       Inactive text

--accent              Primary brand accent (mode-reactive: blue / green / amber)
--accent-subtle       Low-opacity accent for backgrounds
--accent-border       Border-weight accent
--accent-text         Text-weight accent (may differ for contrast)

--accent2             Fixed gold — structural use only (section label prefix, callout borders)
--accent2-subtle      Low-opacity gold
--accent2-border      Gold border weight
--accent2-text        Gold text weight

--status-active       Green — currently employed / live
--status-done         Muted green — completed
--status-pending      Amber — in-progress / ongoing
--status-dim          Gray — concluded / inactive

--status-active-text
--status-done-text
--status-pending-text
--status-dim-text
```

### Mode-reactive token overrides

The accent tokens shift per mode. All other semantic tokens remain constant except Curious mode which also shifts surface warmth.

```css
[data-mode="recruiter"] {
  --accent:        var(--prim-blue);
  --accent-subtle: rgba(26, 107, 255, 0.08);
  --accent-border: rgba(26, 107, 255, 0.25);
  --accent-text:   var(--prim-blue);
}

[data-mode="developer"] {
  --accent:        var(--prim-green);
  --accent-subtle: rgba(26, 138, 90, 0.08);
  --accent-border: rgba(26, 138, 90, 0.25);
  --accent-text:   var(--prim-green);
}

[data-mode="curious"] {
  --accent:        var(--prim-amber);
  --accent-subtle: rgba(184, 122, 0, 0.08);
  --accent-border: rgba(184, 122, 0, 0.25);
  --accent-text:   var(--prim-amber);
  /* Warm surface shift for editorial feel */
  --bg:            var(--prim-warm-bg);
  --surface:       var(--prim-warm-surface);
}
```

### Layer 3 — Component tokens (only when 3+ unique values not covered by semantics)

```css
--nav-height      56px
--card-padding    var(--space-5)
--card-radius     var(--radius-md)
--layout-max      900px
--layout-gutter   var(--space-5)   (responsive — larger on desktop)
--section-padding var(--space-28)  (responsive — --space-20 on mobile)
```

---

## Typography System

### Font roles

```css
--font-display   'Fraunces', Georgia, serif         (variable, optical sizing enabled)
--font-body      'Inter', system-ui, sans-serif
--font-mono      'JetBrains Mono', monospace
```

**Never hardcode font names in components — reference these custom properties only.**

### Font role assignments

| Token | Used for |
|---|---|
| `--font-display` | Hero name (h1), section titles (h2), experience company names (h3), project names (h3), cert names, stat numbers (.kpi-val), contact headline |
| `--font-mono` | Section labels (.section-label), metric chips (.project-metric), stack chips (.stack-chip), timestamps, date periods, form labels, footer attribution |
| `--font-body` | All other text — bullets, paragraphs, nav links, descriptions, subtitles, badge text, button labels |

### Mode-specific font expression

**Recruiter:** Fraunces 400 weight at standard display sizes. Clean, authoritative. Mono used only where specified above.

**Developer:** Same base rules, but mono font extends to more UI chrome — section label prefixes are code-comment style (`// label`), body line-height tighter for information density.

**Curious:** Fraunces used more expressively — larger hero size with optical sizing (`font-optical-sizing: auto`), italic Fraunces on callouts and "why I built it" blocks. Body line-height slightly looser for editorial feel.

### Type scale

All sizes defined as semantic roles referenced via custom properties.

```css
--text-xs      11px   Badges, chips, micro labels
--text-sm      13px   Secondary body, bullets, metadata
--text-base    15px   Primary body copy
--text-lg      17px   Emphasized body, card descriptions
--text-xl      20px   Sub-headings
--text-2xl     26px   Section titles (mobile)
--text-3xl     32px   Section titles (desktop)
--text-hero    clamp(40px, 5vw, 60px)   Hero display (fluid)
```

### Type rules

- Display font: 400 weight standard. 500 permitted sparingly. 600 is the hard ceiling — never exceed.
- Italic on display: deliberate accent only — hero name in Curious mode, highlighted callouts, "why I built it" blocks
- No weight variation on display for hierarchy — use size instead
- Line heights: display 1.1–1.2 / body 1.65–1.75 / mono 1.4
- Letter spacing: display −0.02em / mono labels 0.08–0.14em / body default (0)

---

## Spacing System

8px base grid. All values multiples of 4px minimum, 8px preferred.

```css
--space-1    4px
--space-2    8px
--space-3    12px
--space-4    16px
--space-5    20px
--space-6    24px
--space-8    32px
--space-10   40px
--space-12   48px
--space-16   64px
--space-20   80px
--space-24   96px
--space-28   112px
```

Section vertical padding: `--section-padding` (112px desktop → 80px mobile).

---

## Layout Rules

### Grid

- Max content width: `--layout-max` (~900px), centered with `--layout-gutter` padding
- Never hardcode max-width or padding values in individual sections
- Responsive breakpoint: 768px (below = mobile single column)

### Column patterns per section

| Section | Desktop | Mobile |
|---|---|---|
| Hero | 1fr 1fr | 1fr (right column below) |
| About | 240px 1fr | 1fr |
| Experience | 200px 1fr | 1fr |
| Skills | tab nav + content panel | 1fr |
| Projects | 1fr 1fr (featured spans full width) | 1fr |
| Certifications | 1fr 1fr 1fr | 1fr |
| Contact | 1fr 1fr | 1fr |

### Sticky left columns

About and Experience use a sticky left column pattern — left column stays fixed while the right scrolls. This is an intentional navigation anchor. Maintain it in any new sections that follow this pattern.

### Hero right column — mode-specific

| Mode | Right column content |
|---|---|
| Recruiter | 2×2 stat card grid (exactly 4 KPIs) |
| Developer | Same 4 stat cards + one technical-context strip below the grid |
| Curious | Personal "currently" block — no stat cards. Full-width prose in this slot. |

---

## Three-Mode Visual Identity — Implementation Details

### Section label prefixes

The `.section-label` element changes its visual prefix via CSS `::before` per mode:

```css
/* Recruiter: gold horizontal rule */
[data-mode="recruiter"] .section-label::before {
  content: '';
  display: inline-block;
  width: 2rem;
  height: 1px;
  background: var(--accent2);
  vertical-align: middle;
  margin-right: var(--space-3);
}

/* Developer: code-comment prefix in mono */
[data-mode="developer"] .section-label::before {
  content: '// ';
  font-family: var(--font-mono);
  color: var(--accent);
  letter-spacing: 0;
}

/* Curious: no prefix, sentence-case label text */
[data-mode="curious"] .section-label::before {
  content: none;
}
```

Section label text content is also mode-adaptive — different copy per mode rendered via CSS visibility classes.

### Surface and density

- **Recruiter:** standard `--surface` and `--bg`. Standard `--space-*` body line-height (1.7).
- **Developer:** same surfaces. Body line-height tightened slightly (1.6) for density. Stack chips always visible regardless of card expansion state.
- **Curious:** `--bg` and `--surface` shift to warm variants (via mode token override). Body line-height loosened (1.8) for editorial feel. Section vertical spacing slightly increased.

### Information architecture

- Recruiter: credentials first, then context. Numbers are the headline.
- Developer: technical specifics first. Omit what a peer already knows.
- Curious: the person first, the work second. The "why" is always visible, never hidden behind a toggle.

### Authenticity rule

Developer mode technical richness comes from real data — precise metrics, stack detail, architecture context. It does not come from decorative code-adjacent styling or simulated interfaces. If an element does not contain real information from the data files, it does not belong in developer mode.

---

## Motion & Animation

### Principles

- Motion reveals, not decorates
- Entrance: staggered fade-up on `.fade-in` elements, triggered by IntersectionObserver
- Hover: 0.2s maximum — color, border, opacity, lift only
- No bounce, elastic, or overshoot easing on functional UI
- The availability status pulse is the only looping animation permitted

### Timing tokens

```css
--motion-fast      0.15s ease
--motion-base      0.25s ease
--motion-reveal    0.65s ease      (scroll fade-in duration)
--motion-delay-sm  0.10s
--motion-delay-md  0.15s
--motion-delay-lg  0.25s
```

### Animation budget

Each element gets one moment: either a scroll reveal entrance OR a hover interaction state — not both on the same element.

---

## Component Patterns

### Section header (mandatory on every section)

Every section opens with this pattern, no exceptions:

```html
<SectionHeader label="WORK HISTORY" title="Experience" />
```

Renders as:
- `.section-label` — mono font, `--text-xs`, letter-spacing 0.1em, mode-adaptive prefix via `::before`
- `h2.section-title` — display font, `--text-3xl` desktop / `--text-2xl` mobile, 400 weight

### Card

```
background:  --surface
border:      1px solid --border (default) → --border-strong on hover
radius:      --card-radius
padding:     --card-padding
shadow:      none — depth is expressed through border contrast only
```

### KPI / stat number

Number in display font, label in mono font directly below. Always paired. Never use a significant number in body copy if it's a proof point — use this treatment.

```html
<div class="kpi">
  <span class="kpi-val">99.999%</span>
  <span class="kpi-label">Uptime SLA</span>
</div>
```

### Metric chip

```html
<span class="project-metric">85% faster drafts</span>
```
Mono font, `--text-xs`, `--accent-subtle` background, `--accent-border` border, `--accent-text` color.

### Stack chip

```html
<span class="stack-chip">Python</span>
```
Mono font, `--text-xs`, `--surface` background, `--border` border, `--text-muted` color.

### Status badge

Four states only — no improvising:
- `badge-active` — `--status-active` / `--status-active-text` — current role
- `badge-ongoing` — `--status-pending` / `--status-pending-text` — active side venture
- `badge-done` — `--status-done` / `--status-done-text` — completed certification
- `badge-dim` — `--status-dim` / `--status-dim-text` — concluded / inactive

### Button hierarchy

- **Primary:** `--accent` background, `--bg` text, opacity 0.87 on hover, `translateY(-1px)` lift
- **Ghost:** transparent background, `--border-strong` border, `--accent` border on hover, `translateY(-1px)` lift
- **Link-style:** no border, no background, directional arrow glyph

Never more than 2 buttons in one cluster. Only Primary + Ghost pairing is permitted.

### Form inputs

```
background:  --bg  (recessed from the surrounding --surface panel)
border:      1px solid --border (default) → --accent on focus
radius:      --radius-sm
padding:     --space-3 --space-4
```
No shadow on focus — border color change only.
Labels: `--font-mono`, small caps, `--text-xs`, `--text-muted`.

---

## Do Not

- Do not use `box-shadow` for depth — use background contrast and border contrast only
- Do not mix font roles — no mono for body copy, no display font for UI labels or nav
- Do not add a third accent color — extend the existing accent scale instead
- Do not use `!important`
- Do not hardcode hex or rgb values outside the `:root` primitive definitions
- Do not animate elements the user has not interacted with, except entrance reveals
- Do not use `font-weight > 600` on the display font (Fraunces)
- Do not add more than 4 KPI stat cards to the hero grid in any mode
- Do not use gradients as section backgrounds — gradients permitted only for decorative accents and progress indicators
- Do not add simulated or fake interactive elements. Technical depth is expressed through real data density, precise metrics, and genuine stack information — not through decorative code-adjacent styling

---

## Checklist for any new component

- [ ] All colors reference semantic tokens (`--surface`, `--accent`, etc.) — no raw hex values
- [ ] All spacing uses the `--space-*` scale
- [ ] Font roles respected (display / body / mono)
- [ ] Mode-adaptive text where audience differs per mode
- [ ] Mode-adaptive visual treatment where it reinforces mode identity
- [ ] Mobile layout handled
- [ ] Hover state defined
- [ ] Entrance animation uses `.fade-in` pattern
- [ ] No new CSS patterns introduced without updating this document
