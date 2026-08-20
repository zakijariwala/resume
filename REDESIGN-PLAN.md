# REDESIGN-PLAN.md — Visual & UX Refinement, Phased

Companion to the Cloudflare phase packet. Same rules: one phase, one branch,
one reviewable commit. Feed one phase at a time.

**Source brief:** "needs more colors" (HR feedback), interpreted as a restrained
semantic colour system that improves hierarchy — not decoration.

**Standing content rule:** invent nothing. No companies, users, revenue, product
results, PM experience, skills, awards, testimonials, or metrics that are not
already in this repository. Copy may be rewritten from existing facts; facts may
not be added.

---

## Conflicts this plan resolves

The brief was written before Phase 2 shipped and before `CLAUDE.md` was last
updated. Three collisions, resolved here rather than discovered mid-build.

**1. Three perspectives vs. four.** The brief describes Recruiter / Developer /
Curious. Phase 2 added **Infrastructure**. The four-mode system stands; the
brief's per-mode accent assignments are applied to the first three and
Infrastructure keeps its steel accent.

**2. Mode accents vs. semantic category colours.** These are two different axes
and the brief partly conflates them:

| Axis | Purpose | Tokens |
|---|---|---|
| **Mode accent** | Which perspective is active. One at a time, site-wide. | Recruiter indigo · Developer green · Curious purple · Infrastructure steel |
| **Category colour** | What a *thing* is: an AI project, a product outcome, infra work. Several visible at once. | AI purple · Product amber · Infra green · Primary indigo |

They overlap by design (Curious purple = AI purple). That is fine: they never
occupy the same UI role. Mode accent drives nav, links, buttons, section-label
prefixes. Category colour drives project badges, metric accents, skill groups.

**3. `CLAUDE.md` and `DESIGN-SYSTEM.md` forbid parts of this brief.** Current
rules say "do not add a third accent color" and "do not use box-shadow for
depth." The brief supersedes both. R1 updates those documents in the same
commit that changes the tokens — the design docs must never describe a system
the CSS no longer implements.

**Also note:** Curious mode's accent changes amber → purple, and amber is
reassigned to the Product category. This is a visible change to an existing
mode. It is intentional and called out here so it is not read as a regression.

---

## R0: Audit — DONE

`AUDIT.md` at repo root already covers framework, routing, components, data
locations, third-party scripts, and the mode mechanism. No re-audit needed.
Two findings from it that this plan depends on:

- Mode-conditional CSS keyed on `[data-mode]` **must** live in a
  `<style is:global>` block. Astro appends the component scope id to every part
  of a selector, including `[data-mode]`, which sits on `<html>` — scoped rules
  silently never match. Several rules in the repo are already dead this way.
- A class that sets its own `display` outranks the `.recruiter-only` /
  `.dev-only` / `.curious-only` / `.infra-only` visibility classes and needs an
  explicit per-mode rule.

---

## R1: Design tokens and the semantic colour system

**Objective.** Establish the colour system. Change no layout.

- Add category primitives and semantic tokens to `:root` in `global.css`:
  `--color-ai`, `--color-product`, `--color-infra`, plus subtle/border variants
  for each, following the existing `--accent-subtle` / `--accent-border` shape.
- Recruiter accent moves blue → indigo. Curious accent moves amber → purple.
  Developer keeps green. Infrastructure keeps steel.
- Every value defined for light **and** dark theme. Verify contrast ≥ 4.5:1 for
  text uses, ≥ 3:1 for borders and large text, in both themes.
- Add a `.category-badge` primitive that takes a category and renders a dot plus
  a label — colour is never the only signal, per the accessibility rule.
- Update `CLAUDE.md` and `DESIGN-SYSTEM.md` to describe the new system.

**Acceptance.** No visual change beyond hue. All four modes still render. Build
green. Contrast verified in a browser, both themes.

---

## R2: Hero and metrics

**Objective.** First viewport answers who / what / why different / where next.

- Hero communicates **AI × PRODUCT × ENGINEERING** as an eyebrow, name stays
  prominent, statement line beneath, then two CTAs: *View my work* and
  *Résumé*. Keep the hero short — no taller than the current one.
- Metrics become a first-class proof strip, each with number, short descriptor,
  and a category accent: 99.999% availability, 30,000+ users, 150+ servers,
  50% RTO reduction, 85% faster drafting. All five already exist in the repo
  (`meta.json` stats, `experience.json` kpis, and the ISIM bullet for 150+).
- Per-mode hero copy is preserved; only presentation changes.
- Mobile: metrics scannable, no horizontal overflow, touch targets ≥ 44px.

**Acceptance.** Five-second test passes at 1280px and 390px. Hero height does
not increase. Screenshots in the PR.

---

## R3: Project cards — outcome first

**Objective.** Recruiter sees the outcome; the interviewer can still reach depth.

- Card surface layer: name, category badge, one-line problem statement, key
  outcome, tech tags, and a disclosure control.
- Implementation bullets move behind a native `<details>` disclosure. No new
  dependency, keyboard-accessible by default, works with JS disabled.
- Category accent per project as a left border or badge, never a filled card:
  Content Automation → AI, Zamaan Marine → Product, Path of Supplication →
  Product, infrastructure work → Infra.
- Preserve the existing per-mode bullet filtering and the Phase 2 `infra_order`
  reordering.

**Acceptance.** Every existing bullet is still reachable. No project data lost.
All four modes verified.

---

## R4: Mode distinction

**Objective.** Make the four perspectives visually meaningful, not just recoloured.

- Sharpen per-mode emphasis using the accents from R1 across nav, section-label
  prefixes, active states, and badges.
- Fix the three pre-existing visibility leaks found in Phase 2: the `ZJ` photo
  placeholder renders in all four modes, and `View repo` / `Private repo` /
  `Learning` chrome renders in Recruiter and Curious. Same root cause as above.

**Acceptance.** Leak probe reports zero genuine leaks in all four modes.

---

## R5: About compression

**Objective.** Cut the homepage About to three short paragraphs plus proof points.

- Narrative: infrastructure at scale → builds AI products and automation
  outside the day job → moving toward product ownership.
- Three proof points drawn from existing data only.
- The long-form paragraphs are not deleted, they move behind a disclosure or to
  a detail view — the Curious mode narrative is an asset, not filler.

**Acceptance.** Visible homepage About ≤ 3 paragraphs per mode. No content lost.

---

## R6: How I Think

**Objective.** Make the product positioning credible rather than asserted.

- New section: Problem → Hypothesis → Build → Measure → Decide.
- Each step links to a project in the repo that actually demonstrates it. The
  Zamaan Automation entry already contains a formal null hypothesis and a
  90-day decision gate; the Content Automation entry contains the Failure First
  quality gate. Use real evidence or drop the step — no invented principles.
- Rendered as an inline SVG or CSS flow, not an animation library.

**Acceptance.** Every step cites a real project. Section works at 390px.

---

## R7: Experience, Skills, Now

- Experience: outcomes first, job-description prose secondary. Must not become
  visually heavier than Projects.
- Skills: regroup semantically (Product/AI · Engineering · Infrastructure) and
  move lower in the hierarchy. Existing skills only.
- Currently/Now block: keep, tighten. It answers building / learning / exploring.
  Note the "Studying for GCP PCA" line was removed in Phase 1 and the block is
  currently two sentences — it needs a third beat from the owner.

**Acceptance.** No skill or role removed. Section order re-checked against the
mobile priority list.

---

## R8: Responsive, accessibility, performance, consistency

Run as one pass, because they trade against each other.

- Responsive: hero, metrics, cards, nav, touch targets, no horizontal overflow
  at 320 / 390 / 768 / 1280.
- Accessibility: heading hierarchy, visible focus states, keyboard path through
  the mode switcher and disclosures, contrast in both themes,
  `prefers-reduced-motion` respected, colour never the sole signal.
- Performance: the page already ships four modes of content in one document and
  `/infra` duplicates it. Measure before and after; do not let the redesign grow
  it further without cause. Two render-blocking `@import`s at the top of
  `global.css` (Google Fonts, jsDelivr `@latest`) are the cheapest win here.
- Final consistency sweep at desktop and mobile.

**Acceptance.** Lighthouse run and reported. No accessibility regression against
a pre-redesign baseline. No dependency added.

---

## Sequencing against the Cloudflare packet

R1–R3 are the ones that change the hiring outcome and should land first —
they act on live HR feedback. Cloudflare Phase 3 is blocked on the deploy-target
question in `AUDIT.md` §1 and cannot start until that is answered, so it does
not compete for the slot. R4–R8 follow. Cloudflare Phases 4–5 resume once the
deploy target is settled.
