---
schema: 2
slug: path-of-supplication
title: "Path of Supplication: shipping 22,000 lines offline"
summary: "How the content pipeline, search index and service worker fit together — and what the cache strategy costs."
generated: { at: "2026-09-27", commit: "fixture" }
---

<!-- Fixture for local builds. Facts taken from the existing portfolio notes only. -->

## Context

Existing apps for Islamic duas and ziyarat were ad-heavy, needed a constant connection, or lacked multilingual support. The goal was one app that works on any device, in Arabic, Urdu and English, with no internet after the first load, at zero hosting cost.

## Architecture in depth

- **Authoring:** a local SQLite database (`ron.db`, 87 MB) is the source of truth. It is never committed.
- **Export:** `scripts/export.py` writes 2,704 JSON content files plus four index files — `categories.json`, `nav.json`, `search.json` and `audio.json`.
- **Client:** plain HTML, CSS and JavaScript. No framework, no build step, no npm.
- **Offline:** a service worker pre-caches the app shell; the 80 MB content payload is lazy-loaded and kept in the Cache API.
- **Search:** `search.json` is a pre-built multilingual index scanned in a single pass — no query engine and no dependency.

## Decision log

- **Pre-exported JSON instead of SQLite in the browser.** Shipping a database runtime to phones would have cost payload and startup time; exporting once at authoring time keeps the client trivial.
- **Version-bump cache invalidation.** Changing the `VERSION` constant in `sw.js` forces every client to flush stale caches. Simple and predictable; the cost is that every content change needs a deliberate release.

## Operating it

The service worker is on its ninth version. A structured beta ran with 40+ testers across iOS Safari, Android Chrome and desktop, with feedback triaged into those releases.

## Roadmap

Public soft launch, followed by a community announcement.
