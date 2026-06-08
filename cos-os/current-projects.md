# Current Projects — Portfolio Reference

This file documents all active repos (excluding the three JJ Consulting client/tool repos)
with portfolio-ready content for each. Each entry maps to the `projects.json` schema used
by zakijariwala.space. All descriptions are verified against actual repo code.

**Status key:**
- `IN PORTFOLIO` — entry exists in `src/data/projects.json`; update notes below
- `NEW` — not yet in portfolio; full entry ready to add

---

## 1. Path of Supplication
**Repo:** `zakijariwala/DUASRON`
**Live URL:** https://duas.zakijariwala.space
**Status:** IN PORTFOLIO (`id: "path_of_supplication"`) — add GitHub + live URL links (both blank in current entry); expand content scope to reflect all 5 categories.

### Meta
```json
{
  "id": "path_of_supplication",
  "name": "Path of Supplication",
  "tagline": "PWA · Offline-first",
  "featured": false,
  "one_line_summary": "Offline-first PWA delivering 22,000+ lines of multilingual Islamic liturgical content across 5 categories — sub-10ms search, 80MB offline payload, zero hosting cost.",
  "featured_metric": "22,000+ lines · Sub-10ms search · SW v9",
  "year": "2025",
  "tech": ["JavaScript", "PWA", "Service Workers", "Python", "SQLite"],
  "live_url": "https://duas.zakijariwala.space",
  "github": "https://github.com/zakijariwala/DUASRON"
}
```

### What the app actually contains (from `docs/data/categories.json`)
Five content categories: **Qur'an**, **Namaz** (prayers), **Dua** (supplications), **Ziyarat**, **A'maal**. Within these: full Qur'an (Arabic/English/Roman Urdu/Urdu/transliteration), all Namaz prayers, major duas (Kumayl, Nudbah, Tawassul, Simaat, Mashlool, and others), all major Ziyarat (Ashura, Arbaeen, Ameenullah, etc.), Taaqeebat, Path to Supplication shortcut. 2,704 individual content files under `docs/data/lines/`.

### How the data model actually works
`ron.db` (87MB SQLite, never committed) → `scripts/export.py` → 2,704 JSON files in `docs/data/lines/` + `categories.json`, `nav.json`, `search.json`, `audio.json`. The browser loads pre-exported JSON. There is no SQLite runtime in the browser — the database is a local authoring tool only. Deep Search (`search.json`) is a pre-built full-text index scanned client-side in vanilla JS.

### Bullets

**Recruiter**
- Identified the gap: existing Islamic supplication apps were ad-heavy, required constant connectivity, and lacked multilingual support across Arabic, Urdu, and English.
- Structured 22,000+ liturgical records across 5 content categories into an indexed export pipeline achieving sub-10ms client-side search, then shipped as a zero-cost offline-first PWA.
- Ran a structured beta with 40+ testers across iOS Safari, Android Chrome, and desktop — triaging feedback and shipping iterative improvements across service worker versions up to v9.
- Took product from private beta to public soft-launch; community announcement on r/shia planned.

**Developer**
- Zero-build architecture: pure HTML/CSS/JS, no framework, no npm. Service worker (`sw.js`, currently `v9`) pre-caches the app shell; 80MB content payload is lazy-loaded and persisted in Cache API indefinitely.
- Content pipeline: `ron.db` (87MB SQLite, never committed) → `scripts/export.py` → 2,704 JSON files in `docs/data/lines/` + 4 index files (`categories.json`, `nav.json`, `search.json`, `audio.json`). The browser fetches pre-exported JSON — no SQLite runtime in the browser.
- Deep Search: `search.json` is a pre-built multilingual full-text index (Arabic/Urdu/English/Roman Urdu) scanned in a single vanilla JS pass — no query engine, no dependency.
- Cache invalidation: bump `VERSION` constant in `sw.js` to force all clients to flush stale caches. Currently at `v9`.
- Active design work: `Mockups/` directory contains 10+ screen specs and design files used for iterative UI refinement.

**Curious**
- The apps that existed for Islamic duas and ziyarat were slow, plastered with ads, or useless offline. I built one that works on any device, in your language, with no internet after the first load. The hardest part wasn't the code — it was structuring 22,000 lines of multilingual text across five content types so search actually worked across all of them.

---

## 2. Content Automation Pipeline
**Repo:** `zakijariwala/medium-workflow`
**Status:** IN PORTFOLIO (`id: "content_automation"`) — current entry describes the old Tauri/React 19 desktop GUI version. The repo is now a Python + Gemini 1.5 Flash pipeline with 7-platform output and a GitHub Actions mobile trigger. Update the entry entirely.

### Meta
```json
{
  "id": "content_automation",
  "name": "Content Automation Pipeline",
  "tagline": "LLM Orchestration · Multi-platform",
  "featured": false,
  "one_line_summary": "YouTube Short → 7-platform publication-ready content pack in under 3 minutes — Medium article (2000+ words) plus Twitter/X, LinkedIn, Facebook, Bluesky, Reddit, and Threads variants.",
  "featured_metric": "85% faster drafts · 7 platforms · ~$0/run",
  "year": "2025–2026",
  "tech": ["Python", "Gemini 1.5 Flash", "google-generativeai", "yt-dlp", "GitHub Actions", "atproto"],
  "github": "https://github.com/zakijariwala/medium-workflow"
}
```

### Actual platform output (from `pipeline.py`)
**7 platforms:** Medium, Twitter/X, LinkedIn, Facebook, Bluesky, Reddit, Threads. Facebook is in the pipeline with a dedicated `_fmt_facebook()` function and confirmed example output (`examples/ai-productivity/facebook.md`).

Output files per run committed to `output/[niche]/[niche]_[YYYY-MM-DD_HH-MM].md`. Four actual output sets already in the repo: ai-productivity, consumer-tech, personal-finance, self-improvement.

### Stack specifics (from `requirements.txt`)
`yt-dlp>=2024.1.0`, `google-generativeai>=0.8.0`, `python-dotenv>=1.0.0`, `markdown2medium>=1.0.0`, `atproto>=0.0.54`. Default model: `gemini-1.5-flash` (overridable via `GEMINI_MODEL` env var). Max tokens per call: 8192.

### Bullets

**Recruiter**
- Identified that content-to-publication time was dominated by mechanical, repeatable steps — designed and shipped a pipeline automating transcript ingestion, LLM transformation, and multi-platform output across 6 platforms.
- Reduced time-to-draft by 85%; pipeline runs on a GitHub Actions `workflow_dispatch` trigger — open GitHub app, enter URL and niche, green checkmark in under 3 minutes, output committed to repo.
- Built a quality gate layer ("Failure First") that detects safe/generic LLM output and forces re-generation until prose passes specificity checks — addresses the core failure mode of LLM-generated content.
- 12 niche-specific prompt frameworks adapt tone, structure, and framing per domain across 7 platforms (Medium article + Twitter/X, LinkedIn, Facebook, Bluesky, Reddit, Threads) without modifying the core pipeline.

**Developer**
- Two-call Gemini 1.5 Flash architecture: Call 1 generates the full Medium article (2000+ word hard floor enforced in `prompts/system.md`); Call 2 derives all 6 social platform variants (Twitter/X, LinkedIn, Facebook, Bluesky, Reddit, Threads) from the finished article body — not the raw transcript — ensuring coherence across outputs.
- Failure First framework: heuristic validators scan for hedging language, filler phrases, and passive-voice saturation; triggered gates resubmit with escalating specificity constraints until output clears all checks.
- CI mode: `_IS_CI = bool(os.getenv("CI"))` — GitHub Actions sets this automatically, eliminating all `input()` calls that would hang the workflow runner.
- Bluesky auto-posting via `atproto` library — thread constructed from generated posts, published live if `BLUESKY_HANDLE` + `BLUESKY_APP_PASSWORD` are set. Medium pushes as draft only via `markdown2medium`.
- yt-dlp subtitle extraction with `_manual_transcript()` fallback for Shorts that lack caption tracks.
- 12 niche prompt files (`prompts/ai-productivity.md` through `prompts/tech-career.md`) — same pipeline adapts framing per domain.

**Curious**
- I was writing articles and the process was the same mechanical steps every time. I automated those steps. The only interesting problem was making the output not sound like a robot — which became a framework for detecting when AI writing is being safe and forcing it to be specific instead.

---

## 3. run.to
**Repo:** `zakijariwala/run.to`
**Status:** IN PORTFOLIO (`id: "run_to"`) — **the portfolio entry describes a Flutter app with GPS tracking, ghost routes, crowd radar, and a Supabase PostGIS backend. The current repo is a completely different implementation: a vanilla JS PWA with a geometric route generation engine.** These are not the same product. Update the entry to reflect the current repo, or clarify with Zaki whether a Flutter version exists separately and which one to feature.

### Meta (current repo)
```json
{
  "id": "run_to",
  "name": "run.to",
  "tagline": "PWA · Route Generation",
  "featured": false,
  "one_line_summary": "Zero-build PWA that generates closed-loop running routes to a precise target distance or time — hexagonal geometric projection snapped to real pedestrian paths via OSRM, with per-km splits, GPX export, and a 5-channel social share panel.",
  "featured_metric": "Zero dependencies · Offline-capable · Web Share API",
  "year": "2025",
  "tech": ["JavaScript", "Leaflet", "OSRM API", "Tailwind CSS CDN", "Service Worker"],
  "github": "https://github.com/zakijariwala/run.to"
}
```

### What the app actually does (from `js/routeEngine.js` and `js/app.js`)
Two input modes: **distance** (km) and **time** (converted to km at 5.5 min/km running pace). Route generator: hexagonal geometric loop (6 sides, random rotational offset per generation) → OSRM `/route/v1/foot/` API for pedestrian path snapping → fuzzy iteration adjusts radius until actual route distance converges on target. Haversine fallback ("Simulation Mode") activates when OSRM is unreachable. Output: Leaflet map with polyline overlay, per-km splits via `RouteEngine.calculateSplits()`, result distance + estimated time, GPX export, Google Maps deep-link for turn-by-turn.

**Social share panel (5 channels):** Instagram Story (Web Share API — generates PNG file attachment), WhatsApp Status (Web Share API — image + route text), Twitter (intent URL), Facebook (`facebook.com/sharer/sharer.php`), Copy Link. Skeleton loading states (`skeleton`, `skeleton-splits` CSS classes) shown during OSRM fetch. Routing start location bug fixed (OSRM now receives actual device coordinates, not the default fallback). Full UX redesign shipped across 9 phases (8 prioritised improvements: skeleton states, pace splits, share panel, routing fix, etc.).

### Stack specifics (from `index.html`)
PWA with `manifest.json` (display: standalone, theme: #0f172a) and `sw.js`. Leaflet 1.9.4, Tailwind CSS, and Lucide icons all loaded via CDN — no npm, no build step. Two JS files: `js/app.js` (UI, geolocation, map, export, share panel) and `js/routeEngine.js` (geometric loop + OSRM fetch + `calculateSplits()` + Haversine fallback). Default location: London (51.505, -0.09) if geolocation is denied. `_headers` file added for Cloudflare Pages security headers. Alternative aesthetic explored on `caveman-rebrand` branch.

### Bullets

**Recruiter**
- Identified a real gap: existing route planners require manual path drawing; built a generator that automatically produces closed-loop routes converging on a target distance or time.
- Shipped as an installable PWA — works offline after first load, opens from home screen with no app store required.
- Two input modes (distance and time), per-km splits, GPX export for Garmin/Strava compatibility, a Google Maps deep-link for turn-by-turn navigation, and a 5-channel social share panel (Instagram Story, WhatsApp Status, Twitter, Facebook, Copy Link) using Web Share API for native file sharing on mobile.

**Developer**
- Hexagonal geometric projection engine (`routeEngine.js`): calculates a 6-sided polygon with a random rotational offset around the start point, then snaps all 6 waypoints to pedestrian routes via OSRM `/route/v1/foot/`. The random offset generates a different route orientation on every run.
- Fuzzy convergence: `radiusFactor` is adjusted each iteration based on the ratio of OSRM-returned distance to target distance. Loop continues until within tolerance or max iterations reached.
- Haversine fallback: when OSRM is unreachable, `routeEngine.js` computes geometric distance using the Haversine formula and renders the raw polygon as "Simulation Mode" — app stays usable without the API.
- Zero-build stack: Leaflet 1.9.4 + Tailwind CSS + Lucide icons all loaded from CDN. No npm, no bundler. Service worker caches app shell for offline use.
- Time mode: user input in minutes → converted to target distance at 5.5 min/km → same route engine runs. Per-km splits calculated via `RouteEngine.calculateSplits()` and rendered as an estimated pace list.
- Social share: Instagram Story and WhatsApp Status both use Web Share API with a generated PNG canvas snapshot as a file attachment — native share sheet on iOS and Android. Twitter and Facebook fall back to intent/sharer URLs. Copy Link uses `navigator.clipboard`.
- Skeleton loaders (`.skeleton`, `.skeleton-splits` CSS classes) mask the OSRM latency — UI never shows blank boxes during fetch.
- Routing start location bug fixed: OSRM now receives the device's actual GPS coordinates as the route origin, not the default London fallback.

**Curious**
- I wanted a route that came back to where I started and hit a target distance. Every app I tried needed me to draw the route myself. I built one that figures out the geometry — it picks a hexagon shape, tries it, measures how far off it is, and adjusts until it's close. That feedback loop is exactly how I run.

---

## 4. Zamaan Automation
**Repo:** `zakijariwala/ZamaanAutomation`
**Status:** NEW — not in portfolio. Separate from the `zamaan_marine` entry already there. Add as a new entry.

### Meta
```json
{
  "id": "zamaan_automation",
  "name": "Zamaan Automation",
  "tagline": "SEO Experiment · eBay Attribution",
  "featured": false,
  "one_line_summary": "Data-driven SEO layer for a second-hand industrial automation parts eBay store — formal experiment with null hypothesis, UTM attribution, and a 90-day decision gate built into the architecture.",
  "featured_metric": "£0/month · Formal hypothesis · 90-day gate",
  "year": "2026",
  "tech": ["Astro 4", "TypeScript", "Tailwind CSS", "eBay Browse API", "Pagefind", "GitHub Actions", "Cloudflare Pages", "PostHog"],
  "github": "https://github.com/zakijariwala/ZamaanAutomation"
}
```

### What is actually built (from repo inspection)
Astro 4.16 + Tailwind CSS v3 + TypeScript site for second-hand industrial automation parts (PLCs, VFDs, HMI panels, servo drives, sensors). 6 product categories derived from eBay listing data. Pagefind full-text search built into the static site (`npm run build` runs `astro build && npx pagefind --source dist`). 5 blog posts already published (`draft: false`): PLC buying guide, OEM vs refurbished cost, VFD guide, HMI panel guide, Siemens S7-1200 guide.

### eBay integration specifics (from `src/lib/ebay.ts`)
OAuth client_credentials flow to get Bearer token. Paginated `browse/v1/item_summary/search` with `filter=sellers:{EBAY_SELLER_ID}`, 200 listings/page. Category derived from eBay taxonomy (`plc`, `vfd`, `hmi`, `servo`, `sensor`, `general`). Condition badge mapped from eBay condition string (`Tested`, `Inspected`, `Refurbished`, `As-Is`). Results cached in module-level variable per build.

### UTM convention (from `src/lib/utm.ts` and `TRACKING.md`)
`utm_source=zamaanautomation` · `utm_medium=organic` · `utm_campaign={pageType}` (e.g. `category`, `parts-listing`, `blog-post`) · `utm_content={category}` (e.g. `plc`, `vfd`).

### Experiment parameters (from `TRACKING.md`)
- **H₀ (null):** UTM-attributed eBay referral clicks ≤ 5% of total eBay sales volume after 90 days
- **H₁ (alternative):** UTM clicks exceed 5% of total sales AND reach ≥ 50 clicks/month by Month 3
- **Minimum success threshold:** 50 UTM-attributed eBay referral clicks/month by end of Month 3

### Bullets

**Recruiter**
- Framed a formal experiment before writing a line of code: defined null and alternative hypotheses, a quantitative 90-day success threshold (≥50 UTM-attributed eBay clicks/month), and explicit shutdown criteria if the threshold isn't met.
- Built the complete SEO discovery layer: Astro 4 static site, automated daily eBay listing sync via Browse API, UTM-attributed CTAs across 6 product categories, Pagefind full-text search, and PostHog analytics — total monthly cost: £0.
- Shipped 5 SEO blog posts at launch (PLC buying guide, OEM vs refurbished cost analysis, VFD guide, HMI panel guide, Siemens S7-1200 guide) to seed organic traffic before the 90-day measurement window opens.

**Developer**
- TypeScript eBay Browse API integration (`src/lib/ebay.ts`): OAuth client_credentials token flow → paginated item search (200/page) with `filter=sellers:{id}` → category and condition derived programmatically from eBay taxonomy strings → results cached per build.
- GitHub Actions daily sync (`sync.yml`, 02:00 UTC): `npm ci` → `astro build && npx pagefind --source dist` with eBay env vars injected → Cloudflare Pages deploy via `cloudflare/pages-action`. Build log grep confirms listing count synced.
- UTM attribution fully typed in `src/lib/utm.ts` — `buildEbayUrl()` and `buildStoreUrl()` enforce `utm_source=zamaanautomation`, `utm_medium=organic`, `utm_campaign={pageType}`, `utm_content={category}` on every outbound link.
- Pagefind: static full-text search index built at compile time (`npx pagefind --source dist`) — runs in the browser, zero server, zero API cost.
- PostHog event schema: `BUY_ON_EBAY_CLICKED`, `CONTACT_FORM_SUBMITTED` — full funnel from discovery to eBay redirect tracked without a backend.

**Curious**
- The experiment question is: does having a website actually help sell more on eBay? I built the infrastructure to test it properly — with a real null hypothesis and a real deadline for the decision. It either reaches 50 clicks a month by Month 3 or the content investment stops. I wrote the shutdown criteria before I wrote the first blog post.

---

## 5. Ian Xiaohei Illustrations
**Repo:** `zakijariwala/ian-xiaohei-illustrations-english-claude-code`
**Status:** NEW — not in portfolio. Add as a new entry.

### Meta
```json
{
  "id": "ian_xiaohei",
  "name": "Ian Xiaohei Illustrations",
  "tagline": "Open Source · AI Tooling",
  "featured": false,
  "one_line_summary": "Open-source Claude Code skill for generating 16:9 hand-drawn article illustrations — 9 culturally-grounded character variants, 4 image generation providers with auto-detection, ported and expanded from a Chinese Codex skill.",
  "featured_metric": "9 characters · 4 providers · stdlib-only (3 of 4)",
  "year": "2026",
  "tech": ["Python", "Claude Code SKILL.md", "Gemini 2.5 Flash", "gpt-image-1", "Imagen 3", "Stability AI SD3"],
  "github": "https://github.com/zakijariwala/ian-xiaohei-illustrations-english-claude-code"
}
```

### What is actually built (from repo inspection)
`ian-xiaohei-illustrations/` is the installable skill directory. `SKILL.md` defines the Claude Code skill entrypoint. `scripts/generate_image.py` handles image generation across 4 providers. `install.sh` is idempotent (merges `settings.json`). `references/characters/` has 9 character definition files. `ian-xiaohei-illustrations/assets/examples/` contains **14** example illustrations. `examples/prompts/` has 9 ready-to-paste prompts (one per character). Multi-platform agent configs: `agents/openai.yaml`, `agents/gemini.md`, `agents/hermes.yaml`, `agents/antigravity.yaml`.

### Provider specifics (from `scripts/generate_image.py`)
Auto-detection order: `nanobanana` (Gemini 2.5 Flash Image, key: `GEMINI_API_KEY` or `GOOGLE_API_KEY`) → `dalle` (OpenAI `gpt-image-1` at 1536×1024, fallback to `dall-e-3` at 1792×1024, key: `OPENAI_API_KEY`) → `imagen` (Imagen 3 via Gemini API) → `stability` (Stability AI SD3, key: `STABILITY_API_KEY`). All output is 16:9. stdlib Python for nanobanana, dalle, imagen — only Stability requires `pip install requests`.

### Bullets

**Recruiter**
- Identified an open-source gap: the original Chinese-language Codex skill produced no actual images and had a single character. Ported to English, added real multi-provider image generation, and expanded to a 9-character cultural variant system.
- Designed a character system grounded in distinct art traditions (ukiyo-e, Madhubani, WPA poster, Arabic calligraphy, Adinkra/kente) to avoid cultural caricature — philosophy documented and published alongside the code.
- Ran two rounds of structured multi-agent review ("Council of Claude": 4 parallel agents per round with distinct review lenses — Newcomer, Engineer, Growth Strategist, Docs Editor) before publishing. All findings resolved.
- Published 14 example illustrations in the repo demonstrating the style across varied cognitive structures.

**Developer**
- SKILL.md entrypoint for Claude Code: reads `settings.json` for default character, scans project context if no article is provided, identifies the cognitive structure, selects character, and calls `scripts/generate_image.py`.
- Provider auto-detection in `generate_image.py`: checks env vars in order (GEMINI_API_KEY → OPENAI_API_KEY → STABILITY_API_KEY), selects first available provider, generates a 16:9 PNG. Provider aliases handled (`gemini` → `nanobanana`, `openai` → `dalle`, `sd` → `stability`).
- DALL-E routing: uses `gpt-image-1` (1536×1024) as primary; falls back to `dall-e-3` (1792×1024) automatically.
- `install.sh` is idempotent: copies skill files to `~/.claude/skills/`, reads existing `settings.json` and merges rather than overwriting — user's default character survives upgrades.
- Multi-platform agent configs: same skill operates across Claude Code (SKILL.md), Codex (openai.yaml), Gemini CLI (gemini.md), Hermes (hermes.yaml), Antigravity (antigravity.yaml).
- Character override via CLI: `python3 scripts/generate_image.py --character the-smudge` — overrides `settings.json` for that invocation only.

**Curious**
- I found a Chinese skill for drawing article illustrations, ported it to English, and kept going — adding real image generation and expanding one character into nine. Each of the nine is grounded in a different art tradition so they're not just ink-blob stereotypes with different names. The interesting constraint was figuring out how to make each character feel like it belongs to its cultural heritage rather than just borrowing the aesthetic.

---

## 6. GidsTek Website
**Repo:** `zakijariwala/PythonAlgos`
**Package name (already set):** `gidstek-site`
**Status:** NEW — not in portfolio. Repo rename from `PythonAlgos` to `gidstek-site` still needed at the GitHub level before linking publicly.

### Meta
```json
{
  "id": "gidstek_site",
  "name": "GidsTek Website",
  "tagline": "Web Dev · Performance Turnaround",
  "featured": false,
  "one_line_summary": "Full Astro 6 replacement for an IT hardware reseller's WordPress site — 14.54s cold load to sub-1s, CLS 1.0 to 0, all 5 missing security headers added. Delivered as a barter against a hardware purchase.",
  "featured_metric": "14.54s → <1s · CLS 1.0 → 0",
  "year": "2026",
  "tech": ["Astro 6", "TypeScript", "Tailwind CSS v3", "@fontsource/inter", "Cloudflare Pages"],
  "github": "https://github.com/zakijariwala/PythonAlgos"
}
```

### What is actually built (from repo inspection)
Astro 6.4.4 + Tailwind CSS v3 + TypeScript site. Node ≥22.12.0 required. 6 hardware categories: laptops, servers, networking, firewall, ups, cctv. Products confirmed in `src/data/hardware.ts`: ThinkPad E14 Gen 7, ThinkPad E16 Gen 3, HP EliteBook 840 G11, Dell PowerEdge T150, HP ProLiant ML110 Gen 11 + more. All products `priceOnRequest: true` — no cart, no checkout. Components: `BrandBadges`, `HardwareCatalog`, `HardwareCard`, `WhatsAppCTA`, `ServicesGrid`, `WhyChooseUs`. `public/_headers` (security) + `public/_redirects` (legacy WordPress URL mapping). `@astrojs/sitemap` included. No JavaScript for the hamburger nav.

### Bullets

**Recruiter**
- Ran a full technical audit before quoting: 14.54s cold load, CLS of 1.0 (maximum possible), B-grade SSL, 5 missing security headers, and indexed WordPress demo pages (Vacation, Elements) still in Google's index.
- Scoped and delivered a complete replacement site in Astro 6 — hardware catalog across 6 categories, WhatsApp inquiry CTAs, all performance and security issues resolved — as a barter against a product purchase rather than a cash invoice.
- Agency equivalent in Mumbai: Rs 25,000–60,000. Delivered as leverage in a price negotiation, not as a paid engagement.

**Developer**
- Astro 6.4.4 static site with TypeScript throughout: `src/data/hardware.ts` and `src/data/services.ts` define typed catalog data; `src/data/site.ts` holds site config (GSTIN placeholder for post-deal update).
- `public/_headers`: adds all 5 security headers missing from the original site (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`) — fixes Snyk "Grade capped at A" finding.
- `public/_redirects`: maps all legacy WordPress URLs (`/about-us`, `/lets-connect`, `/our-story`, etc.) to current equivalents — preserves any inbound links after migration.
- CSS-only hamburger nav — no JavaScript toggle, no event listeners.
- WhatsApp deep links with pre-filled context messages per product category via `WhatsAppCTA.astro`.
- `@astrojs/sitemap` generates sitemap automatically on build.
- Build: `npm run build` → `dist/` → Cloudflare Pages. `npm run dev` requires Node ≥22.12.0.

**Curious**
- I was about to buy a laptop from an IT shop and noticed their website was embarrassingly slow. I ran an audit, built a replacement, and offered to trade it for a discount. The whole negotiation ran on technical evidence — a Lighthouse report, a Snyk security scan, and a Cloudflare cold-load comparison.

---

## 7. The Sentinel Visualizer
**Repo:** `zakijariwala/PythonAlgos` — **`main` branch** (separate project from GidsTek on `master`)
**Status:** NEW — not in portfolio. Distinct from the GidsTek entry (which lives on `master`). Add as a separate entry; note the repo rename is needed at GitHub level.

### Meta
```json
{
  "id": "sentinel_visualizer",
  "name": "The Sentinel Visualizer",
  "tagline": "WASM · ML Education",
  "featured": false,
  "one_line_summary": "Browser-native Transformer/Attention mechanism explainer — SvelteKit static site running TensorFlow.js WASM and Three.js for in-browser training, vector space rendering, and formula display without any server.",
  "featured_metric": "In-browser training · WASM backend · Zero server",
  "year": "2026",
  "tech": ["SvelteKit", "Svelte 5", "TypeScript", "Vite", "TensorFlow.js WASM", "Three.js", "KaTeX"],
  "github": "https://github.com/zakijariwala/PythonAlgos/tree/main"
}
```

### What is actually built (from `main` branch inspection)
SvelteKit with static adapter, Svelte 5, TypeScript, Vite. Package name: `algos-vis`. Three main visualisation components: `CanvasHeatmap.svelte` (attention matrix heatmap), `Formula.svelte` (KaTeX-rendered equations), `VectorSpacePlot.svelte` (Three.js 3D vector space). Web Worker: `worker-transformer.ts` runs transformer training off the main thread using TensorFlow.js WASM backend — UI stays responsive during training. `@types/katex` and `@types/three` confirm static typing throughout. Deployed as a static site — no server, no backend.

### Bullets

**Recruiter**
- Identified that Transformer/Attention explanations online describe the maths but never let you watch it happen — built a browser tool that trains a minimal Transformer in the browser and renders attention patterns live as a heatmap.
- Zero server architecture: training runs in a Web Worker (off-thread) with TensorFlow.js WASM backend — the entire ML computation runs in the browser, no GPU instance, no backend API.
- Published as a static SvelteKit site — instant deploy to any CDN, no infrastructure management.

**Developer**
- TensorFlow.js WASM backend selected over WebGL for deterministic cross-device behavior — WASM runs on any browser without GPU dependency.
- Web Worker isolation (`worker-transformer.ts`): training loop runs entirely off the main thread via `postMessage` — heatmap updates arrive as structured data; the UI thread only renders.
- Three.js (`VectorSpacePlot.svelte`): token/embedding vectors rendered as navigable 3D point cloud — illustrates high-dimensional space collapsing to 3D for intuition-building.
- KaTeX (`Formula.svelte`): inline mathematical formula rendering without MathJax overhead — all equations rendered client-side from LaTeX strings.
- `CanvasHeatmap.svelte`: Canvas 2D API rendering of the attention weight matrix — updates on each training step to show attention patterns forming in real time.

**Curious**
- Attention mechanisms are described in every ML course, but the description is always static diagrams. I wanted to watch the weights change while the model trains — so I built something that does exactly that, in a browser tab, with no server. The interesting constraint was keeping the UI responsive while training: that's why it runs in a Worker.

---

## Notes for Portfolio Update

### Priority order for new entries:
1. **ZamaanAutomation** — strongest PM story: formal hypothesis, quantitative gate, experiment-driven build
2. **Ian Xiaohei** — open-source AI tooling differentiator; multi-agent review pattern is notable
3. **GidsTek** — after GitHub repo is renamed at the account level; strong Curious-mode story
4. **The Sentinel Visualizer** — `PythonAlgos/main`; SvelteKit + TensorFlow.js WASM ML explainer; add only after deciding whether to feature GidsTek (`master`) separately or roll both under a single repo mention

**Note on PythonAlgos:** The repo has two unrelated projects on different branches — GidsTek (`master`, Astro 6 hardware site) and The Sentinel Visualizer (`main`, SvelteKit ML explainer). Portfolio should treat them as distinct entries. The repo rename to `gidstek-site` at GitHub level would break the `main` branch link; decide whether to fork/split before renaming.

### Existing entries requiring correction:
- `content_automation` — update entirely: remove Tauri/React 19 reference, correct to 7 platforms (Medium + Twitter/X + LinkedIn + Facebook + Bluesky + Reddit + Threads), update stack to `google-generativeai` + `yt-dlp` + `atproto`
- `path_of_supplication` — add `github` and `live_url` fields; expand content scope to mention all 5 categories (currently only says "duas and ziyarat")
- `run_to` — **decision needed**: portfolio says Flutter/Dart/Supabase; repo is Vanilla JS PWA/OSRM. These are different products. Either confirm the Flutter version exists separately and keep that entry, or replace with the current Vanilla JS version using the bullets above.

### Projects cap note:
Portfolio supports 1 featured card + up to 5 standard cards. Current: 6 entries (`zamaan_marine`, `content_automation`, `path_of_supplication`, `run_to`, `esp_pocket`, `remote_dev_server`). Recommendation to sharpen AI PM positioning: replace `esp_pocket` and `remote_dev_server` with `zamaan_automation` and `ian_xiaohei`. Both replacements are more directly relevant to the product/AI narrative than a hardware prototype and a cloud VM.
