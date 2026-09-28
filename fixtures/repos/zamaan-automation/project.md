---
schema: 2
slug: zamaan-automation
title: "Zamaan Automation"
tagline: "SEO Experiment · eBay Attribution"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2026"
ended: null
role: "Owner"
summary: "Data-driven SEO layer for a second-hand industrial automation parts eBay store. Formal experiment with null hypothesis, UTM attribution, and a 90-day decision gate built into the architecture."
problem: "The family marine business already had a digital presence and email automation."
stack: ["Astro 4", "TypeScript", "Tailwind CSS", "eBay Browse API", "Pagefind", "GitHub Actions", "Cloudflare Pages", "PostHog"]
categories: ["product", "data"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "£0/month", label: "· Formal hypothesis · 90-day gate", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Framed a formal experiment before writing a line of code: defined null and alternative hypotheses, a quantitative 90-day success threshold (50+ UTM-attributed eBay clicks/month), and explicit shutdown criteria if the threshold isn't met."
    - "Built the complete SEO discovery layer: Astro 4 static site, automated daily eBay listing sync via Browse API, UTM-attributed CTAs across 6 product categories, Pagefind full-text search, and PostHog analytics. Total monthly cost: £0."
    - "Shipped 5 SEO blog posts at launch (PLC buying guide, OEM vs refurbished cost analysis, VFD guide, HMI panel guide, Siemens S7-1200 guide) to seed organic traffic before the 90-day measurement window opens."
  engineer:
    - "TypeScript eBay Browse API integration (src/lib/ebay.ts): OAuth client_credentials token flow → paginated item search (200/page) with filter=sellers:{id} → category and condition derived programmatically from eBay taxonomy strings → results cached per build."
    - "GitHub Actions daily sync (02:00 UTC): npm ci → astro build && npx pagefind --source dist with eBay env vars injected → Cloudflare Pages deploy via cloudflare/pages-action."
    - "UTM attribution fully typed in src/lib/utm.ts. buildEbayUrl() and buildStoreUrl() enforce utm_source=zamaanautomation, utm_medium=organic, utm_campaign={pageType}, utm_content={category} on every outbound link."
    - "Pagefind: static full-text search index built at compile time, runs in the browser, zero server, zero API cost. PostHog event schema tracks BUY_ON_EBAY_CLICKED and CONTACT_FORM_SUBMITTED for the full funnel from discovery to eBay redirect."
  story: "The experiment question is: does having a website actually help sell more on eBay? I built the infrastructure to test it properly, with a real null hypothesis and a real deadline for the decision. It either reaches 50 clicks a month by Month 3 or the content investment stops."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Data-driven SEO layer for a second-hand industrial automation parts eBay store. Formal experiment with null hypothesis, UTM attribution, and a 90-day decision gate built into the architecture.

## The problem

The family marine business already had a digital presence and email automation. The open question was whether a dedicated SEO site would actually drive eBay sales. I ran it as a formal experiment: null hypothesis, 90-day measurement window, explicit shutdown criteria. The decision to stop would be as evidence-driven as the decision to build. I wrote the shutdown criteria before I wrote the first blog post.

## What I built

- TypeScript eBay Browse API integration (src/lib/ebay.ts): OAuth client_credentials token flow → paginated item search (200/page) with filter=sellers:{id} → category and condition derived programmatically from eBay taxonomy strings → results cached per build.
- GitHub Actions daily sync (02:00 UTC): npm ci → astro build && npx pagefind --source dist with eBay env vars injected → Cloudflare Pages deploy via cloudflare/pages-action.
- UTM attribution fully typed in src/lib/utm.ts. buildEbayUrl() and buildStoreUrl() enforce utm_source=zamaanautomation, utm_medium=organic, utm_campaign={pageType}, utm_content={category} on every outbound link.
- Pagefind: static full-text search index built at compile time, runs in the browser, zero server, zero API cost. PostHog event schema tracks BUY_ON_EBAY_CLICKED and CONTACT_FORM_SUBMITTED for the full funnel from discovery to eBay redirect.
