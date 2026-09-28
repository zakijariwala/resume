---
schema: 2
slug: esp-pocket
title: "ESP-Pocket Reader"
tagline: "Embedded · Hardware"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2025"
ended: null
role: "Owner"
summary: "A pocket e-ink reading device built on ESP32-S3: custom firmware, SQLite content storage, and a Python EPUB ingestion pipeline."
problem: "Reading on a phone destroys your eyes and your battery life."
stack: ["Embedded C++", "ESP32-S3", "ESP-IDF", "PlatformIO", "Python", "SQLite"]
categories: ["embedded"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "Functional", label: "prototype", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Designed and built a working hardware product end-to-end: from EPUB ingestion pipeline to custom embedded firmware with stable e-ink display rendering."
  engineer:
    - "Architected a custom pocket-sized e-ink reading device using an ESP32-S3 microcontroller and a 3.7-inch E-Paper display, achieving a functional firmware prototype with stable display rendering."
    - "Developed embedded C++ firmware (ESP-IDF/PlatformIO) integrating SD card storage and SQLite for robust content management, storing and paginating 50+ EPUB-converted documents in testing."
    - "Engineered a Python EPUB-to-SQLite conversion pipeline, reducing per-book ingestion time to under 30 seconds for titles up to 500 pages."
  story: "Reading on a phone is miserable. I built my own pocket e-ink reader from scratch. Designing every layer yourself, from the EPUB parser to the display driver, turns out to be more satisfying than buying one."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

A pocket e-ink reading device built on ESP32-S3: custom firmware, SQLite content storage, and a Python EPUB ingestion pipeline.

## The problem

Reading on a phone destroys your eyes and your battery life. E-readers exist but they're expensive, locked down, and designed around ecosystems I don't want to be in. I wanted a device that did exactly one thing: display text clearly, at almost nothing to run. Building the firmware myself meant understanding every layer of the stack, from EPUB parsing down to the display driver.

## What I built

- Architected a custom pocket-sized e-ink reading device using an ESP32-S3 microcontroller and a 3.7-inch E-Paper display, achieving a functional firmware prototype with stable display rendering.
- Developed embedded C++ firmware (ESP-IDF/PlatformIO) integrating SD card storage and SQLite for robust content management, storing and paginating 50+ EPUB-converted documents in testing.
- Engineered a Python EPUB-to-SQLite conversion pipeline, reducing per-book ingestion time to under 30 seconds for titles up to 500 pages.
