# Current Projects — Portfolio Reference

This file documents all active repos (excluding the three JJ Consulting client/tool repos)
with portfolio-ready content for each. Each entry maps to the `projects.json` schema used
by zakijariwala.space.

**Status key per project:**
- `IN PORTFOLIO` — entry already exists in `src/data/projects.json`; notes below describe
  what to update
- `NEW` — not yet in portfolio; full entry provided ready to add

---

## 1. Path of Supplication
**Repo:** `zakijariwala/DUASRON`
**Live URL:** https://duas.zakijariwala.space
**Status in portfolio:** IN PORTFOLIO (`id: "path_of_supplication"`) — update GitHub link and
add the Deep Search and multilingual chip detail which is missing from the current entry.

### Meta
```json
{
  "id": "path_of_supplication",
  "name": "Path of Supplication",
  "tagline": "PWA · Offline-first",
  "featured": false,
  "one_line_summary": "Offline-first PWA serving 22,000+ lines of multilingual Islamic liturgical content with sub-10ms full-text search — zero hosting cost, 40+ beta testers.",
  "featured_metric": "Sub-10ms search · 0 dependencies",
  "year": "2025",
  "tech": ["JavaScript", "PWA", "Service Workers", "SQLite", "Python"],
  "live_url": "https://duas.zakijariwala.space",
  "github": "https://github.com/zakijariwala/DUASRON"
}
```

### Bullets

**Recruiter**
- Identified the gap: existing Islamic supplication apps were ad-heavy, required constant connectivity, and lacked multilingual support across Arabic, Urdu, and English.
- Structured 22,000+ liturgical records into an indexed local database achieving sub-10ms full-text search, then shipped as a zero-cost offline-first PWA.
- Ran a structured beta with 40+ testers across iOS, Android, and desktop — triaging feedback and shipping iterative improvements.
- Took product from private beta to public soft-launch with a planned community announcement on r/shia.

**Developer**
- Zero-build architecture: pure HTML/CSS/JS, no framework, no npm. Service worker pre-caches the app shell; 80MB content payload (Arabic/Urdu/English) is lazy-loaded and persisted in Cache API indefinitely.
- SQLite export pipeline (`scripts/export.py`): reads `ron.db` (never committed — 87MB), produces 2,704 JSON files under `docs/data/lines/` plus category, nav, search, and audio index files. Committed JSON only.
- Deep Search: scans all 22,000+ lines across all language columns in a single pass — the content equivalent of `grep -r` across multilingual structured data, implemented in vanilla JS without a query engine.
- Service worker versioned at `v9` — bump `VERSION` constant to force all clients to flush stale cache on next visit.
- Content update flow: `ron.db` edit → `python3 scripts/export.py` → commit changed JSON → merge to master → live in 60 seconds.

**Curious**
- The apps that existed for Islamic duas and ziyarat were slow, plastered with ads, or useless offline. I built one that works on any device, in your language, with no internet after the first load. The hardest part wasn't the code — it was getting the data right across 22,000 lines of multilingual liturgical text.

---

## 2. Content Automation Pipeline
**Repo:** `zakijariwala/medium-workflow`
**Status in portfolio:** IN PORTFOLIO (`id: "content_automation"`) — current portfolio entry describes
the original Tauri/React 19 desktop GUI version. The repo has since been fully rebuilt as a
Python + Gemini + GitHub Actions pipeline with 7-platform output and a GitHub Actions mobile
trigger. Update the entry to reflect the current version.

### Meta
```json
{
  "id": "content_automation",
  "name": "Content Automation Pipeline",
  "tagline": "LLM Orchestration · Multi-platform",
  "featured": false,
  "one_line_summary": "YouTube Short → 7-platform publication-ready content pack in one command — Medium article (2000+ words), Twitter thread, LinkedIn, Facebook, Bluesky, Reddit, Threads.",
  "featured_metric": "85% faster drafts · 7 platforms · ~$0/run",
  "year": "2025–2026",
  "tech": ["Python", "Gemini 1.5 Flash", "yt-dlp", "GitHub Actions", "atproto"],
  "github": "https://github.com/zakijariwala/medium-workflow"
}
```

### Bullets

**Recruiter**
- Identified that content-to-publication time was dominated by mechanical, repeatable steps — designed and shipped a pipeline automating transcript ingestion, LLM transformation, and multi-platform output.
- Reduced time-to-draft by 85%; pipeline runs on a GitHub Actions mobile trigger — open GitHub app, fill two fields, green checkmark in 3 minutes, output committed to repo.
- Expanded output from single-platform (Medium) to 7 platforms in one run: Medium, Twitter/X, LinkedIn, Facebook, Bluesky, Reddit, Threads — each adapted to platform format and character constraints.
- Built a quality gate layer ("Failure First") that detects safe/generic LLM output patterns and forces re-generation until prose passes specificity checks.

**Developer**
- Two-call Gemini architecture: Call 1 generates the full Medium article (2000+ word hard floor enforced by the system prompt); Call 2 derives all 6 social platform variants from the finished article — not the raw transcript — ensuring coherence across outputs.
- Failure First framework: heuristic validators scan for hedging language, filler phrases, and passive-voice saturation; any triggered gate sends the output back for re-generation with escalating specificity constraints.
- GitHub Actions `workflow_dispatch` trigger: mobile-friendly UI in the GitHub app — enter URL and niche, workflow fetches transcript via yt-dlp, runs both Gemini calls, commits all 7 output files, and pushes. CI mode prevents any stdin hang.
- Bluesky auto-posting via `atproto` library — thread built from the generated posts, posted live if credentials are set. Medium auto-posts as draft only (human review before publish).
- yt-dlp transcript extraction with manual-paste fallback for Shorts that lack caption tracks.
- 12 niche-specific prompt files drive content framing — `prompts/ai-productivity.md`, `prompts/geopolitics.md`, etc. — so the same pipeline adapts tone and structure per domain.

**Curious**
- I was writing articles and the process was the same mechanical steps every time: watch the video, pull the transcript, restructure it, add context, post to six places. I automated those steps. The only interesting problem was making the output not sound like a robot — which turned into a whole framework for detecting when AI writing is being safe and forcing it to be specific instead.

---

## 3. run.to — Route Generator
**Repo:** `zakijariwala/run.to`
**Status in portfolio:** IN PORTFOLIO (`id: "run_to"`) — **NOTE: the current portfolio entry
describes a Flutter app (GPS tracking, ghost routes, crowd radar, Supabase PostGIS). The
current repo is a vanilla JS web app (closed-loop route generation via OSRM API). These appear
to be two different versions or a rewrite. Clarify with Zaki before updating the entry —
either update to reflect the web app or keep the Flutter description if that version is
the primary portfolio story.**

If updating to the current repo (vanilla JS web app):

### Meta
```json
{
  "id": "run_to",
  "name": "run.to",
  "tagline": "Vanilla JS · Route Generation",
  "featured": false,
  "one_line_summary": "Zero-build web app that generates precise closed-loop running routes to a target distance — geometric projection + OSRM pedestrian path snapping, GPX export, no dependencies.",
  "featured_metric": "Zero dependencies · Fuzzy distance matching",
  "year": "2025",
  "tech": ["JavaScript", "Leaflet", "OSRM API", "HTML", "CSS"],
  "github": "https://github.com/zakijariwala/run.to"
}
```

### Bullets (web app version)

**Recruiter**
- Identified a real-world problem: existing route planners require manual path drawing; built a generator that produces closed-loop routes automatically to within a few percent of a target distance.
- Shipped a zero-build, zero-dependency web app — works by opening a file in a browser, no installation required.
- Designed a mobile expansion strategy using Capacitor to wrap the existing codebase as a native iOS/Android app without a rewrite.

**Developer**
- Geometric projection algorithm: iterative radius scaling projects waypoints radially from start point, then snaps each to the nearest pedestrian-navigable path via the public OSRM API.
- Fuzzy logic engine: each iteration adjusts radius by a scaling factor based on the ratio of actual distance to target — converges on target within ±5% across varied terrain, with automatic pruning of OSRM detour responses exceeding 3× the expected leg distance.
- Zero-build architecture: pure HTML/CSS/JS, Leaflet for the map layer, OSRM for routing — no npm, no bundler, no server. Works as `file://` or served statically.
- GPX export: serialises waypoints and route geometry to GPX 1.1 format via a Blob download — compatible with Garmin, Strava, and any GPX-capable device.
- Mobile strategy decided: Capacitor wrap (no rewrite) — web assets move to `www/`, Capacitor shell provides native geolocation, status bar matching, and filesystem GPX save.

**Curious**
- I wanted a route that came back to where I started and hit a specific distance. Every app I tried either needed me to draw the route myself, or generated something that didn't close properly. I built one that figures out the geometry on its own. It works by trying, measuring, and adjusting until it gets close — which, it turns out, is exactly how I run.

---

## 4. Zamaan Automation
**Repo:** `zakijariwala/ZamaanAutomation`
**Status in portfolio:** NEW — not in portfolio. Add as a new entry.

**Context:** This is separate from the Zamaan Marine entry already in the portfolio. Zamaan Marine is the family marine parts business; Zamaan Automation is a standalone eBay SEO experiment for second-hand industrial automation parts (PLCs, drives, HMIs, sensors).

### Meta
```json
{
  "id": "zamaan_automation",
  "name": "Zamaan Automation",
  "tagline": "SEO Experiment · eBay Attribution",
  "featured": false,
  "one_line_summary": "Data-driven SEO layer for a second-hand industrial automation parts eBay store — UTM-tracked to test whether a website meaningfully increases eBay revenue. 90-day decision gate built in.",
  "featured_metric": "£0/month · 90-day decision gate",
  "year": "2026",
  "tech": ["Astro", "Tailwind CSS", "eBay Browse API", "GitHub Actions", "Cloudflare Pages", "PostHog"],
  "github": "https://github.com/zakijariwala/ZamaanAutomation"
}
```

### Bullets

**Recruiter**
- Framed a clear product experiment before building: "Does an SEO-driven website meaningfully increase eBay revenue?" — defined a 90-day decision gate (50 UTM-attributed eBay clicks/month = continue; 0 = stop content investment) before writing a line of code.
- Built the entire discovery layer in one session: Astro site, automated eBay listing sync via Browse API, UTM-attributed CTAs, PostHog analytics — total monthly running cost: £0.
- Built explicit success/failure criteria into the architecture so the experiment can be run, evaluated, and either scaled or killed without ambiguity.

**Developer**
- GitHub Actions daily sync workflow: eBay Browse API call → product data normalised and written to Astro content collections → Cloudflare Pages build triggered. Product pages stay current without manual updates.
- UTM parameter strategy: every "Buy on eBay" link includes `utm_source=zamaanautomation`, `utm_medium=website`, `utm_campaign=product` — Seller Hub traffic report is the attribution source, not a custom analytics backend.
- PostHog event schema: `BUY_ON_EBAY_CLICKED`, `CONTACT_FORM_SUBMITTED` — tracking the funnel from organic discovery to eBay conversion without a server.
- Public `_headers` file for Cloudflare Pages covers all 5 commonly-missing security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy).

**Curious**
- The experiment question is simple: does having a website actually help sell more stuff on eBay? I built the whole infrastructure to test it properly — with a real success metric and a real deadline for the decision. It either earns its place or it gets shut down. I built the shutdown criteria before I built the site.

---

## 5. Ian Xiaohei Illustrations
**Repo:** `zakijariwala/ian-xiaohei-illustrations-english-claude-code`
**Status in portfolio:** NEW — not in portfolio. Add as a new entry.

### Meta
```json
{
  "id": "ian_xiaohei",
  "name": "Ian Xiaohei Illustrations",
  "tagline": "Open Source · AI Tooling",
  "featured": false,
  "one_line_summary": "Open-source Claude Code skill for generating hand-drawn article illustrations — 9 culturally-grounded character variants, 4 image generation providers, ported and expanded from a Chinese Codex skill.",
  "featured_metric": "9 characters · 4 providers · 0 dependencies (3 of 4)",
  "year": "2026",
  "tech": ["Python", "Claude Code", "Gemini", "DALL-E", "Stability AI", "Bash"],
  "github": "https://github.com/zakijariwala/ian-xiaohei-illustrations-english-claude-code"
}
```

### Bullets

**Recruiter**
- Identified an open-source gap: the original Chinese-language Codex skill had no actual image generation and a single character. Ported to English, added real generation, and expanded to a 9-character cultural variant system.
- Designed a character system grounded in real art traditions (ukiyo-e, Madhubani block-print, WPA poster, Arabic calligraphy, Adinkra/kente) to avoid cultural caricature — cultural philosophy documented and published.
- Ran two rounds of multi-agent review ("Council of Claude": 4 parallel agents per round with distinct lenses — Newcomer, Engineer, Growth Strategist, Docs Editor) before publishing. All findings resolved.
- Positioned for community discovery: README overhaul with gallery, badges, quick-start; GitHub topics; LinkedIn announcement post written and ready to publish.

**Developer**
- SKILL.md format for Claude Code: the skill reads the active project context via `scan_project.py`, identifies the cognitive structure in the article, selects the most appropriate character, and calls the image generation script.
- Four-provider image generation in `scripts/generate_image.py`: auto-detects which API key is set and calls the corresponding provider (Nano Banana/Gemini, DALL·E, Imagen 3, Stability AI). stdlib Python for 3 of 4 providers — only Stability requires `pip install requests`.
- `install.sh` is idempotent: copies skill files, merges `settings.json` rather than overwriting (preserves user's default character on upgrade).
- Multi-platform agent configs: `agents/openai.yaml` (Codex), `agents/gemini.md` (Gemini CLI), `agents/hermes.yaml`, `agents/antigravity.yaml` — same skill runs on four different AI coding assistants.
- "Council of Claude" review pattern: 2 rounds × 4 parallel agents, each assigned a different review perspective. More effective than single-pass review for catching blind spots.

**Curious**
- I found a Chinese skill for drawing article illustrations, ported it to English, and then kept going — adding real image generation, expanding one character into nine, and grounding each one in a different art tradition so they weren't just stereotypes with different names. The most interesting constraint was figuring out how to make a hand-drawn ink-blob character feel culturally authentic rather than culturally lazy.

---

## 6. GidsTek Website
**Repo:** `zakijariwala/PythonAlgos` (rename pending: `zakijariwala/gidstek-site`)
**Status in portfolio:** NEW — not in portfolio. Consider adding as a consulting/freelance
project entry. Note: the repo name (`PythonAlgos`) does not reflect the content — rename
to `gidstek-site` before making it public or linking from the portfolio.

**Context:** Built as a barter deliverable — a full Astro site replacing an underperforming
WordPress site, traded for a price reduction on a laptop purchase. Good story for Curious
mode; solid technical evidence for Developer mode.

### Meta
```json
{
  "id": "gidstek_site",
  "name": "GidsTek Website",
  "tagline": "Web Dev · Performance Audit",
  "featured": false,
  "one_line_summary": "Full Astro replacement for an IT hardware reseller's WordPress site — 14.54s cold load to sub-1s, CLS from 1.0 to 0, all 5 missing security headers added. Built as a barter deliverable.",
  "featured_metric": "14.54s → <1s · CLS 1.0 → 0",
  "year": "2026",
  "tech": ["Astro 6", "Tailwind CSS v3", "Cloudflare Pages"],
  "github": "https://github.com/zakijariwala/PythonAlgos"
}
```

### Bullets

**Recruiter**
- Ran a full technical audit of an IT hardware reseller's website before quoting — identified 14.54s cold load, CLS score of 1.0 (maximum possible), B-grade SSL, 5 missing security headers, and indexed demo content from the original WordPress theme.
- Scoped and built a complete replacement site in Astro 6 with a hardware catalog, WhatsApp inquiry CTAs, and all technical issues resolved — delivered as a barter against a product purchase rather than a cash invoice.
- Demonstrated agency-equivalent output (Rs 25,000–60,000 Mumbai market rate) at zero marginal cost, using the build as negotiating leverage.

**Developer**
- Astro 6 static site: 6 pages (Home, Hardware, Services, About, Contact, 404), hardware catalog with 9 product entries, WhatsApp deep links with pre-filled context messages on every product.
- CSS-only hamburger navigation — zero JavaScript for the mobile menu toggle.
- `public/_headers` for Cloudflare Pages: adds all 5 commonly-missing headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`) — fixes Snyk "Grade capped at A" finding.
- `_redirects` file covers all legacy WordPress URLs (`/about-us`, `/lets-connect`, etc.) — no broken inbounds after migration.
- LocalBusiness JSON-LD schema with Mumbai address, phone, and service area — local SEO ground floor.
- Build: `npm run build` → `dist/` → Cloudflare Pages deploy. Total monthly cost: £0.

**Curious**
- I was about to buy a laptop from an IT shop and noticed their website was embarrassingly slow. I ran an audit, built a replacement, and offered to trade it for a discount. The entire negotiation ran on technical evidence rather than haggling.

---

## Notes for Portfolio Update

### Priority order for adding new entries:
1. **ZamaanAutomation** — strongest product-thinking story; 90-day experiment gate is a concrete PM demonstration
2. **Ian Xiaohei** — differentiates as open-source contributor and multi-agent tooling builder
3. **GidsTek** — only if repo is renamed before linking; good Curious-mode story

### Existing entries to update:
- `content_automation` — update bullets to reflect 7-platform output and GitHub Actions mobile trigger (current version is significantly different from Tauri/React 19 description)
- `path_of_supplication` — add GitHub and live URL fields (currently blank)
- `run_to` — **clarify with Zaki**: portfolio says Flutter/Dart/Supabase; repo is Vanilla JS/OSRM. Are these different versions of the same product or a full rewrite? Update entry once confirmed.

### Projects cap:
The portfolio shows 1 featured card + up to 5 standard cards. Current entries: 6 (zamaan_marine, content_automation, path_of_supplication, run_to, esp_pocket, remote_dev_server). Adding all 3 new entries would require either removing existing entries or exceeding the cap. Recommendation: replace `esp_pocket` and `remote_dev_server` with `zamaan_automation` and `ian_xiaohei` — those two are more relevant to the AI PM positioning.
