---
schema: 2
slug: zamaan-marine
title: "Zamaan Marine Digital Ecosystem"
tagline: "JAMstack · B2B Automation"
publish: true
reason: ""
status: active
kind: product
size: large
started: "2025"
ended: null
role: "Owner"
summary: "Full digital ecosystem for a family marine parts business: storefront, cold email automation, and analytics at zero hosting cost."
problem: "My family started a business selling refurbished marine and industrial parts, mostly through eBay."
stack: ["Astro", "Cloudflare Pages", "GitHub Actions", "Python", "Claude API", "Brevo", "PostHog", "eBay Browse API"]
categories: ["product", "automation", "web"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "~60%", label: "faster listing time", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Identified the digital gap through direct conversations with 200+ B2B prospects, validating channels, value proposition, and pricing signals before writing a line of code."
    - "Defined and prioritised a zero-budget digital stack: JAMstack storefront for discoverability, eBay API automation for listings (~60% faster time-to-market), and an AI-powered cold-email funnel for B2B acquisition."
    - "Instrumented product analytics via PostHog, tracking the full funnel from storefront visit to eBay conversion. Used data to reprioritise listing categories and outreach targeting."
    - "Shipped an AI cold-email agent achieving 90%+ inbox delivery across campaign cycles."
  engineer:
    - "Cold-email agent: Claude API prompt templates per industry vertical → Python orchestrator → Brevo SMTP with sender rotation and bounce handling → delivery rate tracking. 90%+ inbox rate across campaign cycles."
    - "eBay Browse API integration: Python ingestion pipeline parses product data, maps to eBay taxonomy, and pushes listings in batch. ~60% reduction in per-SKU listing time vs. manual entry."
    - "PostHog JS SDK on a fully static Astro/Cloudflare Pages frontend: custom event schema tracking browse → click → eBay redirect funnel, session replay configured to exclude contact fields."
    - "Zero-persistent-backend architecture: Astro SSG → Cloudflare Pages CDN, GitHub Actions CI, all serverless. Total recurring cost: $0."
  story: "My family's business had no real digital presence. I built the whole thing — website, automated email campaigns, product listings — in spare time, at zero cost."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Full digital ecosystem for a family marine parts business: storefront, cold email automation, and analytics at zero hosting cost.

## The problem

My family started a business selling refurbished marine and industrial parts, mostly through eBay. The digital side was an afterthought. I stepped in to build it properly, which meant treating a small family operation with the same engineering rigour I'd apply at work. The constraint of zero budget made it more interesting, not less.

## What I built

- Cold-email agent: Claude API prompt templates per industry vertical → Python orchestrator → Brevo SMTP with sender rotation and bounce handling → delivery rate tracking. 90%+ inbox rate across campaign cycles.
- eBay Browse API integration: Python ingestion pipeline parses product data, maps to eBay taxonomy, and pushes listings in batch. ~60% reduction in per-SKU listing time vs. manual entry.
- PostHog JS SDK on a fully static Astro/Cloudflare Pages frontend: custom event schema tracking browse → click → eBay redirect funnel, session replay configured to exclude contact fields.
- Zero-persistent-backend architecture: Astro SSG → Cloudflare Pages CDN, GitHub Actions CI, all serverless. Total recurring cost: $0.
