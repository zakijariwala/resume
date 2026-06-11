# AGENTS.md — misc/

## Purpose
Scratch area for non-deployed materials: resume export tools, LinkedIn content drafts, and offline planning documents. Nothing here is part of the portfolio build.

## Ownership
Owned by root AGENTS.md.

## Local Contracts
- Files here are never deployed or served by the portfolio site — the Astro build does not touch this directory
- `generate_ai_pm_resume.py` and `render_pdf.py` are PDF generation scripts — outputs go to `public/` when ready to publish
- `linkedin_plan/` — 30-day LinkedIn posting plan (day_01.md through day_30.md); treat as operational notes, not portfolio content
- `linkedin_week1_drafts.md`, `linkedin_week2_drafts.md` — draft posts; do not copy to `src/data/` without review
- `master_resume.md` — source-of-truth resume in markdown; feeds the PDF generation scripts

## Work Guidance
- Generate PDF: run `python3 misc/render_pdf.py`; review output; copy to `public/` if approved
- Update resume: edit `misc/master_resume.md` first, then regenerate PDF
