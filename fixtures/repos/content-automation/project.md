---
schema: 2
slug: content-automation
title: "Content Automation Pipeline"
tagline: "LLM Orchestration · Multi-platform"
publish: true
reason: ""
status: active
kind: product
size: medium
started: "2025"
ended: null
role: "Owner"
summary: "YouTube Short to 6-platform publication-ready content pack in under 3 minutes: Medium article (2000+ words) plus Twitter/X, LinkedIn, Bluesky, Reddit, and Threads variants."
problem: "I was writing AWS certification articles for Medium and realised the research-to-draft process was almost entirely mechanical."
stack: ["Python", "Gemini 1.5 Flash", "google-generativeai", "yt-dlp", "GitHub Actions", "atproto"]
categories: ["automation", "ai"]
links: { live: "", docs: "", demo: "" }
metrics:
  - { value: "85%", label: "faster drafts · 6 platforms · ~$0/run", evidence: "legacy portfolio data" }
highlights:
  recruiter:
    - "Identified that content-to-publication time was dominated by mechanical, repeatable steps. Designed and shipped a pipeline automating transcript ingestion, LLM transformation, and multi-platform output across 6 platforms."
    - "Reduced time-to-draft by 85%; pipeline runs on a GitHub Actions workflow_dispatch trigger. Open GitHub app, enter URL and niche, green checkmark in under 3 minutes, output committed to repo."
    - "Built a quality gate layer ('Failure First') that detects safe/generic LLM output and forces re-generation until prose passes specificity checks, addressing the core failure mode of LLM-generated content."
    - "12 niche-specific prompt frameworks adapt tone, structure, and framing per domain without modifying the core pipeline."
  engineer:
    - "Two-call Gemini 1.5 Flash architecture: Call 1 generates the full Medium article (2000+ word hard floor enforced in prompts/system.md); Call 2 derives all 5 social platform variants from the finished article body, not the raw transcript, ensuring coherence across outputs."
    - "Failure First framework: heuristic validators scan for hedging language, filler phrases, and passive-voice saturation; triggered gates resubmit with escalating specificity constraints until output clears all checks."
    - "CI mode: _IS_CI = bool(os.getenv('CI')) — GitHub Actions sets this automatically, eliminating all input() calls that would hang the workflow runner."
    - "Bluesky auto-posting via atproto library. Thread constructed from generated posts, published live if credentials are set. Medium pushes as draft only via markdown2medium. yt-dlp subtitle extraction with manual transcript fallback for Shorts lacking caption tracks."
  story: "I was writing articles and the process was the same mechanical steps every time. I automated those steps. The only interesting problem was making the output not sound like a robot, which became a framework for detecting when AI writing is being safe and forcing it to be specific instead."
skills: []
ai_assisted: false
media: []
todo_owner: []
generated: { at: "2026-09-27", commit: "fixture" }
---

## Overview

YouTube Short to 6-platform publication-ready content pack in under 3 minutes: Medium article (2000+ words) plus Twitter/X, LinkedIn, Bluesky, Reddit, and Threads variants.

## The problem

I was writing AWS certification articles for Medium and realised the research-to-draft process was almost entirely mechanical. I built a pipeline to handle the mechanical part so the human part — judgment, voice, editing — could actually matter. The Failure First framework came from noticing that AI-generated content fails the same way every time: it starts safe and stays safe. I built rules specifically to break that pattern.

## What I built

- Two-call Gemini 1.5 Flash architecture: Call 1 generates the full Medium article (2000+ word hard floor enforced in prompts/system.md); Call 2 derives all 5 social platform variants from the finished article body, not the raw transcript, ensuring coherence across outputs.
- Failure First framework: heuristic validators scan for hedging language, filler phrases, and passive-voice saturation; triggered gates resubmit with escalating specificity constraints until output clears all checks.
- CI mode: _IS_CI = bool(os.getenv('CI')) — GitHub Actions sets this automatically, eliminating all input() calls that would hang the workflow runner.
- Bluesky auto-posting via atproto library. Thread constructed from generated posts, published live if credentials are set. Medium pushes as draft only via markdown2medium. yt-dlp subtitle extraction with manual transcript fallback for Shorts lacking caption tracks.
