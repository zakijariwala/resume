---
schema: 2
slug: ian-xiaohei
title: "Ian Xiaohei Illustrations"
tagline: "Open Source · AI Tooling"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2026"
ended: null
role: "Owner"
summary: "Open-source Claude Code skill for generating 16:9 hand-drawn article illustrations: 9 culturally-grounded character variants, 4 image generation providers with auto-detection, ported and expanded from a Chinese Codex skill."
problem: "I found a Chinese-language Codex skill for illustrating articles and wanted to use it, but it didn't generate actual images and only had one character."
stack: ["Python", "Claude Code", "Gemini 2.5 Flash", "gpt-image-1", "Imagen 3", "Stability AI SD3"]
categories: ["ai", "automation"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "9", label: "characters · 4 providers · stdlib-only", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Identified an open-source gap: the original Chinese-language Codex skill produced no actual images and had a single character. Ported to English, added real multi-provider image generation, and expanded to a 9-character cultural variant system."
    - "Designed a character system grounded in distinct art traditions (ukiyo-e, Madhubani, WPA poster, Arabic calligraphy, Adinkra/kente) to avoid cultural caricature. Philosophy documented and published alongside the code."
    - "Ran two rounds of structured multi-agent review (4 parallel agents per round: Newcomer, Engineer, Growth Strategist, Docs Editor) before publishing. All findings resolved."
    - "Published 14 example illustrations in the repo demonstrating the style across varied cognitive structures."
  engineer:
    - "SKILL.md entrypoint for Claude Code: reads settings.json for default character, scans project context if no article is provided, identifies cognitive structure, selects character, calls scripts/generate_image.py."
    - "Provider auto-detection in generate_image.py: checks env vars in order (GEMINI_API_KEY → OPENAI_API_KEY → STABILITY_API_KEY), selects first available provider, generates a 16:9 PNG. Provider aliases handled (gemini → nanobanana, openai → dalle, sd → stability)."
    - "DALL-E routing: uses gpt-image-1 (1536x1024) as primary; falls back to dall-e-3 (1792x1024) automatically. stdlib Python for Gemini, DALL-E, and Imagen paths, only Stability AI requires pip install requests."
    - "install.sh is idempotent: copies skill files to ~/.claude/skills/, reads existing settings.json and merges rather than overwriting. User's default character survives upgrades. Multi-platform: Claude Code (SKILL.md), Codex, Gemini CLI, Hermes, Antigravity agent configs all included."
  story: "I found a Chinese skill for drawing article illustrations, ported it to English, and kept going, adding real image generation and expanding one character into nine. The interesting constraint was figuring out how to make each character feel like it belongs to its cultural heritage rather than just borrowing the aesthetic."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

Open-source Claude Code skill for generating 16:9 hand-drawn article illustrations: 9 culturally-grounded character variants, 4 image generation providers with auto-detection, ported and expanded from a Chinese Codex skill.

## The problem

I found a Chinese-language Codex skill for illustrating articles and wanted to use it, but it didn't generate actual images and only had one character. I ported it to English, added real multi-provider image generation, and expanded one character into nine. The interesting constraint was making each character feel genuinely grounded in its cultural heritage — ukiyo-e, Madhubani, WPA posters, Arabic calligraphy, Adinkra — rather than just borrowing the aesthetic.

## What I built

- SKILL.md entrypoint for Claude Code: reads settings.json for default character, scans project context if no article is provided, identifies cognitive structure, selects character, calls scripts/generate_image.py.
- Provider auto-detection in generate_image.py: checks env vars in order (GEMINI_API_KEY → OPENAI_API_KEY → STABILITY_API_KEY), selects first available provider, generates a 16:9 PNG. Provider aliases handled (gemini → nanobanana, openai → dalle, sd → stability).
- DALL-E routing: uses gpt-image-1 (1536x1024) as primary; falls back to dall-e-3 (1792x1024) automatically. stdlib Python for Gemini, DALL-E, and Imagen paths, only Stability AI requires pip install requests.
- install.sh is idempotent: copies skill files to ~/.claude/skills/, reads existing settings.json and merges rather than overwriting. User's default character survives upgrades. Multi-platform: Claude Code (SKILL.md), Codex, Gemini CLI, Hermes, Antigravity agent configs all included.
