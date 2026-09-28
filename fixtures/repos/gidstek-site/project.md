---
schema: 2
slug: gidstek-site
title: "GidsTek Website"
tagline: "Web Dev · Performance Turnaround"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2026"
ended: null
role: "Owner"
summary: "Full Astro 6 replacement for an IT hardware reseller's WordPress site: 14.54s cold load to sub-1s, CLS 1.0 to 0, all 5 missing security headers added. Delivered as a barter against a hardware purchase."
problem: "I was buying a laptop from an IT hardware shop and noticed their website was embarrassingly slow."
stack: ["Astro 6", "TypeScript", "Tailwind CSS", "Cloudflare Pages", "@fontsource/inter"]
categories: ["web"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "14.54s", label: "→ <1s · CLS 1.0 → 0", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Ran a full technical audit before quoting: 14.54s cold load, CLS of 1.0 (maximum possible), B-grade SSL, 5 missing security headers, and indexed WordPress demo pages still in Google's index."
    - "Scoped and delivered a complete replacement site in Astro 6: hardware catalog across 6 categories, WhatsApp inquiry CTAs, all performance and security issues resolved, as a barter against a product purchase."
    - "Agency equivalent in Mumbai: Rs 25,000–60,000. Delivered as leverage in a price negotiation, not as a paid engagement."
  engineer:
    - "Astro 6.4.4 static site with TypeScript throughout: src/data/hardware.ts and src/data/services.ts define typed catalog data across 6 hardware categories (laptops, servers, networking, firewall, UPS, CCTV)."
    - "public/_headers: adds all 5 security headers missing from the original site (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy), fixing the Snyk 'Grade capped at A' finding."
    - "public/_redirects: maps all legacy WordPress URLs to current equivalents, preserving any inbound links after migration. CSS-only hamburger nav, no JavaScript toggle, no event listeners."
  story: "I was about to buy a laptop and noticed the shop's website was unusably slow. I ran an audit, built a replacement, and offered to trade it for a discount. The whole negotiation ran on technical evidence: a Lighthouse report, a Snyk scan, and a cold-load comparison."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Full Astro 6 replacement for an IT hardware reseller's WordPress site: 14.54s cold load to sub-1s, CLS 1.0 to 0, all 5 missing security headers added. Delivered as a barter against a hardware purchase.

## The problem

I was buying a laptop from an IT hardware shop and noticed their website was embarrassingly slow. I ran a full technical audit and built a complete replacement in Astro 6. Then used the audit as a negotiating tool: trade the site rebuild for a discount on the hardware. The whole negotiation ran on technical evidence.

## What I built

- Astro 6.4.4 static site with TypeScript throughout: src/data/hardware.ts and src/data/services.ts define typed catalog data across 6 hardware categories (laptops, servers, networking, firewall, UPS, CCTV).
- public/_headers: adds all 5 security headers missing from the original site (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy), fixing the Snyk 'Grade capped at A' finding.
- public/_redirects: maps all legacy WordPress URLs to current equivalents, preserving any inbound links after migration. CSS-only hamburger nav, no JavaScript toggle, no event listeners.
