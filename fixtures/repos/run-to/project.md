---
schema: 2
slug: run-to
title: "run.to"
tagline: "PWA · Route Generation"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2025"
ended: null
role: "Owner"
summary: "Zero-build PWA that generates closed-loop running routes to a precise target distance or time. Hexagonal geometric projection snapped to real pedestrian paths via OSRM, with per-km splits and GPX export."
problem: "I wanted a route that came back to where I started and hit a target distance."
stack: ["JavaScript", "Leaflet", "OSRM API", "Tailwind CSS", "Service Worker"]
categories: ["product", "web"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "Zero", label: "dependencies · Offline-capable · Simulation fallback", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Identified a real gap: existing route planners require manual path drawing. Built a generator that automatically produces closed-loop routes converging on a target distance or time."
    - "Shipped as an installable PWA. Works offline after first load, opens from home screen with no app store required."
    - "Two input modes (distance and time), per-km splits, GPX export for Garmin/Strava compatibility, and a Google Maps deep-link for walkers who want turn-by-turn navigation."
  engineer:
    - "Hexagonal geometric projection engine (routeEngine.js): calculates a 6-sided polygon with a random rotational offset around the start point, then snaps all 6 waypoints to pedestrian routes via OSRM /route/v1/foot/. Random offset generates a different route orientation on every run."
    - "Fuzzy convergence: radiusFactor is adjusted each iteration based on the ratio of OSRM-returned distance to target distance. Loop continues until within tolerance or max iterations reached."
    - "Haversine fallback: when OSRM is unreachable, routeEngine.js computes geometric distance using the Haversine formula and renders the raw polygon as 'Simulation Mode'. App stays usable without the API."
    - "Zero-build stack: Leaflet 1.9.4 + Tailwind CSS + Lucide icons all loaded from CDN. No npm, no bundler. Service worker caches app shell for offline use. Time mode: user input in minutes → converted at 5.5 min/km → same route engine runs."
  story: "I wanted a route that came back to where I started and hit a target distance. Every app I tried needed me to draw it myself. I built one that figures out the geometry: picks a hexagon, measures how far off it is, adjusts until it's close."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Zero-build PWA that generates closed-loop running routes to a precise target distance or time. Hexagonal geometric projection snapped to real pedestrian paths via OSRM, with per-km splits and GPX export.

## The problem

I wanted a route that came back to where I started and hit a target distance. Every app I tried needed me to draw the route myself. I built one that figures out the geometry: it picks a hexagon shape, tries it, measures how far off it is, and adjusts until it's close. That feedback loop is exactly how I run.

## What I built

- Hexagonal geometric projection engine (routeEngine.js): calculates a 6-sided polygon with a random rotational offset around the start point, then snaps all 6 waypoints to pedestrian routes via OSRM /route/v1/foot/. Random offset generates a different route orientation on every run.
- Fuzzy convergence: radiusFactor is adjusted each iteration based on the ratio of OSRM-returned distance to target distance. Loop continues until within tolerance or max iterations reached.
- Haversine fallback: when OSRM is unreachable, routeEngine.js computes geometric distance using the Haversine formula and renders the raw polygon as 'Simulation Mode'. App stays usable without the API.
- Zero-build stack: Leaflet 1.9.4 + Tailwind CSS + Lucide icons all loaded from CDN. No npm, no bundler. Service worker caches app shell for offline use. Time mode: user input in minutes → converted at 5.5 min/km → same route engine runs.
