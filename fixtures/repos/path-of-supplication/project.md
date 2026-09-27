---
schema: 2
slug: path-of-supplication
title: "Path of Supplication"
tagline: "PWA · Offline-first"
publish: true
reason: ""
status: active
kind: product
size: large
started: "2025"
ended: null
role: "Owner"
summary: "Offline-first PWA delivering 22,000+ lines of multilingual Islamic liturgical content across 5 categories: sub-10ms search, 80MB offline payload, zero hosting cost."
problem: "The existing apps for Islamic supplications were clunky, ad-heavy, or required a constant internet connection."
stack: ["JavaScript", "PWA", "Service Workers", "Python", "SQLite"]
categories: ["product", "web", "data"]
links: { live: "https://duas.zakijariwala.space", docs: "", demo: "" }
metrics:
  - { value: "22,000+", label: "lines · Sub-10ms search", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Identified a gap in available supplication apps. Existing options were ad-heavy, required constant connectivity, or lacked multilingual support. Validated the problem before building."
    - "Structured 22,000+ liturgical records across 5 content categories (Qur'an, Namaz, Dua, Ziyarat, A'maal) into an indexed export pipeline achieving sub-10ms client-side search."
    - "Shipped as an offline-first PWA with service worker caching, delivering 80MB of multilingual content (Arabic, Urdu, English) at zero hosting cost."
    - "Ran a structured beta with 40+ testers across iOS Safari, Android Chrome, and desktop, triaging feedback and shipping iterative improvements across service worker versions up to v9."
  engineer:
    - "Zero-build architecture: pure HTML/CSS/JS, no framework, no npm. Service worker (sw.js, v9) pre-caches the app shell; 80MB content payload is lazy-loaded and persisted in Cache API indefinitely."
    - "Content pipeline: ron.db (87MB SQLite, authoring tool only, never committed) → scripts/export.py → 2,704 JSON files in docs/data/lines/ + 4 index files (categories.json, nav.json, search.json, audio.json). Browser fetches pre-exported JSON, no SQLite runtime in browser."
    - "Deep Search: search.json is a pre-built multilingual full-text index (Arabic/Urdu/English/Roman Urdu) scanned in a single vanilla JS pass, no query engine, no dependency, sub-10ms on mobile."
    - "Cache invalidation: bump VERSION constant in sw.js to force all clients to flush stale caches. Active design work: Mockups/ directory contains 10+ screen specs used for iterative UI refinement."
  story: "The apps that existed for Islamic duas and ziyarat were slow, plastered with ads, or useless offline. I built one that works on any device, in your language, with no internet after the first load."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Offline-first PWA delivering 22,000+ lines of multilingual Islamic liturgical content across 5 categories: sub-10ms search, 80MB offline payload, zero hosting cost.

## The problem

The existing apps for Islamic supplications were clunky, ad-heavy, or required a constant internet connection. For something as personal as duas and ziyarat, that friction felt wrong. I wanted something that worked offline, in your language, on any device, with no ads and no backend. A big part of the work was understanding the data well enough to build proper search across five content types in three scripts.

## What I built

- Zero-build architecture: pure HTML/CSS/JS, no framework, no npm. Service worker (sw.js, v9) pre-caches the app shell; 80MB content payload is lazy-loaded and persisted in Cache API indefinitely.
- Content pipeline: ron.db (87MB SQLite, authoring tool only, never committed) → scripts/export.py → 2,704 JSON files in docs/data/lines/ + 4 index files (categories.json, nav.json, search.json, audio.json). Browser fetches pre-exported JSON, no SQLite runtime in browser.
- Deep Search: search.json is a pre-built multilingual full-text index (Arabic/Urdu/English/Roman Urdu) scanned in a single vanilla JS pass, no query engine, no dependency, sub-10ms on mobile.
- Cache invalidation: bump VERSION constant in sw.js to force all clients to flush stale caches. Active design work: Mockups/ directory contains 10+ screen specs used for iterative UI refinement.
