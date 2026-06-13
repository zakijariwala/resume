=== VERSION B: AI / GENAI ENGINEER ===

────────────────────────────────────────────────────────────────
Mohammad Zaki Jariwala
Navi Mumbai, India | Open to Relocation — UAE / GCC
+91 9601406034 | Jariwalazaki@gmail.com
linkedin.com/in/zakijariwala | github.com/zakijariwala | zakijariwala.space
────────────────────────────────────────────────────────────────

AI / GENAI ENGINEER | LLM ORCHESTRATION | AGENTIC SYSTEMS

Engineer with shipped production AI systems: a CI/CD-driven LLM content
pipeline (85% draft-time reduction, 6-platform output, ~$0/run), a
Claude-API cold-email agent at 90%+ inbox delivery, and an offline-first
PWA delivering 22,000+ multilingual records to 40+ beta-validated users
at zero hosting cost. Infra background — 3 years at 99.999% uptime on
Tier-1 banking systems — provides the reliability layer that makes AI
products shippable, not just demonstrable. AWS Certified Solutions
Architect (SAA-C03); Google GenAI Leader.

────────────────────────────────────────────────────────────────
CORE SKILLS & TECHNOLOGIES
────────────────────────────────────────────────────────────────
Python (LLM Orchestration / ETL / Pipelines) | Prompt Engineering
Anthropic Claude API | Google Gemini 1.5 Flash | OpenAI gpt-image-1 / DALL-E
AI Agent Design & Deployment | Multi-Agent Orchestration
LLM Output Evaluation / Quality Gates | GitHub Actions | CI/CD
Service Workers | PWA Architecture | Offline-First Systems
SQLite | JavaScript / TypeScript | Cloudflare Workers & Pages
PostHog (Product Analytics) | Brevo (SMTP / Email Automation) | yt-dlp
AWS (EC2, S3, IAM) | GCP | Linux (RHEL / Ubuntu)

────────────────────────────────────────────────────────────────
CERTIFICATIONS
────────────────────────────────────────────────────────────────
Google GenAI Leader
  Google Cloud | 2024

AWS Certified Solutions Architect – Associate (SAA-C03)
  Amazon Web Services | 2024

Google Cloud Professional Cloud Architect (In Progress)
  Google Cloud | Expected mid-2026

────────────────────────────────────────────────────────────────
EXPERIENCE
────────────────────────────────────────────────────────────────

TATA CONSULTANCY SERVICES — Systems Engineer, IDM & Infrastructure
Deployed at State Bank of India (SBI GITC) | 2023 – Present

• Sustained 99.999% platform availability on Tier-1 banking infrastructure
  (30,000+ users, 150+ servers) — the operational rigour that makes
  AI-powered systems production-credible, not just prototype-complete.

• Automated recurring infrastructure toil (patch compliance, certificate
  rotation, capacity reporting) in Python and Bash, eliminating ~8
  hours/week of manual overhead; applied the same automation-first mindset
  to every subsequent AI pipeline built.

• Led on-premise containerisation of legacy IDM workflows within RBI/SEBI
  compliance constraints; evaluated Podman vs Docker, defined container
  topology, and secured stakeholder sign-off.

• Mentored and led a 5-engineer operations team; owned incident triage,
  post-incident RCAs, and Disaster Recovery runbook execution (50% RTO
  reduction).


INDEPENDENT COACHING PRACTICE — Founder & Technical Communication Coach
2025 – 2026 (Concluded)

• Designed repeatable frameworks for translating complex technical systems
  into non-technical narrative for 50+ engineering and management
  professionals — directly applicable to AI product communication and
  stakeholder alignment.

────────────────────────────────────────────────────────────────
PROJECTS
────────────────────────────────────────────────────────────────

Content Automation Pipeline
Python · Gemini 1.5 Flash · google-generativeai · yt-dlp · GitHub Actions · atproto
2025 – 2026 | github.com/zakijariwala/medium-workflow

Architected and shipped an end-to-end LLM pipeline with CI/CD delivery:
YouTube transcript ingestion via yt-dlp (manual fallback for Shorts lacking
caption tracks) → two-call Gemini 1.5 Flash orchestration (Call 1: full
Medium article with 2000-word hard floor enforced in system.md; Call 2:
all 5 social variants derived from the finished article body, not the raw
transcript, ensuring output coherence) → commit to repo in under 3 minutes
via GitHub Actions workflow_dispatch.

Quality gate layer — "Failure First": heuristic validators scan for
hedging language, filler phrases, and passive-voice saturation. Outputs
failing any check are resubmitted with escalating specificity constraints
until all gates pass, addressing the core failure mode of LLM-generated
content. 12 niche-specific prompt frameworks adapt tone and structure per
domain without modifying the pipeline core. Bluesky auto-posting live via
atproto. 85% reduction in draft-to-publish time; ~$0/run on free tier.


Ian Xiaohei Illustrations (Claude Code Skill / Open Source)
Python · Claude API · Gemini 2.5 Flash · gpt-image-1 / DALL-E · Imagen 3 · Stability AI SD3
2026 | github.com/zakijariwala/ian-xiaohei-illustrations-english-claude-code

Built and published an open-source Claude Code skill for 16:9 article
illustration generation. Provider auto-detection logic checks env vars in
order (GEMINI_API_KEY → OPENAI_API_KEY → STABILITY_API_KEY) and routes to
the first available API — supports 4 image generation providers with no
config changes required. DALL-E routing: gpt-image-1 (1536×1024) primary,
with automatic fallback to dall-e-3 (1792×1024).

Pre-publish quality process: two rounds of structured 4-agent parallel
review (Newcomer, Engineer, Growth Strategist, Docs Editor); all findings
resolved before release. 9 culturally-grounded character variants designed
to reflect distinct art traditions (ukiyo-e, Madhubani, WPA poster, Arabic
calligraphy, Adinkra/kente). Idempotent install.sh merges into existing
settings.json without overwriting user configuration. Compatible with Claude
Code, Codex, Gemini CLI, and Hermes agent configs.


Zamaan Marine Digital Ecosystem (AI-Powered B2B Acquisition)
Claude API · Python · Brevo · PostHog · Astro · Cloudflare Pages · GitHub Actions · eBay Browse API
2025

Built an end-to-end AI cold-email agent for B2B outreach: Claude API
prompt templates keyed by industry vertical → Python orchestrator → Brevo
SMTP with sender rotation and bounce handling → delivery-rate tracking.
Achieved 90%+ inbox delivery rate across campaign cycles.

eBay Browse API integration: Python batch pipeline ingests product data,
maps to eBay taxonomy, and pushes listings — reducing per-SKU listing time
by ~60% vs. manual entry. PostHog JS SDK on a fully static Astro/Cloudflare
Pages frontend with custom event schema tracking browse → click → eBay
redirect funnel (session replay configured to exclude contact fields). Total
recurring hosting cost: $0.


Path of Supplication (Production PWA — 22,000+ Records)
JavaScript · Service Workers · Python · SQLite · PWA
2025 | duas.zakijariwala.space | github.com/zakijariwala/DUASRON

Architected and shipped an offline-first PWA delivering 22,000+
multilingual liturgical records across 5 content categories (Qur'an, Namaz,
Dua, Ziyarat, A'maal). Content pipeline: SQLite authoring database → Python
export scripts → 2,704 pre-built JSON files + 4 index files. Zero query
engine: sub-10ms search via a pre-built multilingual full-text index
(Arabic / Urdu / English / Roman Urdu) scanned in a single vanilla JS pass.
80MB offline payload persisted via Cache API; service worker versioned to v9
across iterative deployments. Ran structured beta with 40+ testers across
iOS Safari, Android Chrome, and desktop, triaging feedback into
prioritised releases.

────────────────────────────────────────────────────────────────
EDUCATION
────────────────────────────────────────────────────────────────
Bachelor of Technology (B.Tech) — Electronics & Communication Engineering
Dharmsinh Desai University | 2023


────────────────────────────────────────────────────────────────
KEYWORD COVERAGE — VERSION B
────────────────────────────────────────────────────────────────
Covered:
  LLM Orchestration ✓ | Prompt Engineering ✓ | AI Agent Design ✓
  Multi-Agent Orchestration ✓ | Claude API / Anthropic ✓ | Gemini ✓
  OpenAI / DALL-E / gpt-image-1 ✓ | Imagen 3 / Stability AI ✓
  LLM Evaluation / Quality Gates ✓ | CI/CD / GitHub Actions ✓
  Python ✓ | PWA / Service Workers / Offline Architecture ✓
  SQLite ✓ | JavaScript / TypeScript ✓ | Cloudflare Workers ✓
  Product Analytics / PostHog ✓ | Email Automation / Brevo ✓
  AWS ✓ | GCP ✓ | Linux ✓ | Production AI (real users) ✓

Not covered (truthfully absent):
  RAG / Vector Databases — no project uses retrieval-augmented generation;
    do NOT claim it. If asked, the pre-built search index in Path of
    Supplication is conceptually adjacent but is not RAG.
  LangChain / LangGraph / LangSmith — Merchant Ops Agent (in progress)
    uses LangGraph per your context but no completed project data exists
    yet; add it once shipped.
  Fine-tuning / LoRA — not in data; do NOT add.
  OpenAI Assistants API / threads — not used; do NOT add.
  Embedding models — not explicitly used in any shipped project.
  HuggingFace / open-source LLMs — not in data.
  MCP (Model Context Protocol) — in-progress Merchant Ops Agent; add
    when shipped.

────────────────────────────────────────────────────────────────
NUMBERS TO CONFIRM — VERSION B
────────────────────────────────────────────────────────────────
1. "85% faster drafts" — confirm this is measured against a real baseline
   (e.g., manual research-to-draft time before the pipeline existed). Be
   ready to explain the measurement methodology in interviews.

2. "90%+ inbox delivery rate" — confirm this is from actual campaign data
   in Brevo, not an estimate. Interviewers at AI/growth companies will ask.

3. "~60% faster listing time" — confirm against a manual baseline (time
   to list one SKU manually vs. batch pipeline throughput).

4. "Under 3 minutes" for the pipeline end-to-end — confirm this is the
   observed GitHub Actions wall-clock time, not an estimate.

5. "22,000+ records" — confirm the exact row count from the SQLite DB
   export (or the sum across the 2,704 JSON files). Precision matters here.

6. "40+ beta testers" — confirm this is a real count from your beta
   recruitment (Telegram/WhatsApp group, etc.), not a rough estimate.

7. "4-agent parallel review" — confirm the exact agent configuration
   used in the Ian Xiaohei pre-publish process for interview accuracy.

────────────────────────────────────────────────────────────────
TAILORING NOTES — VERSION B
────────────────────────────────────────────────────────────────
- Best fit: AI Engineer, Applied AI, GenAI Platform Engineer roles at
  AI-native companies, product companies with LLM features, or enterprise
  teams building internal AI tooling. In the Gulf: OSN+, Noon, Careem,
  Bayanat, G42, Presight, ADNOC digital units, and regional fintech/AI
  startups are the natural targets.

- For roles emphasising multi-agent / agentic systems: lead with Ian
  Xiaohei (4-agent parallel review process) and reference the Merchant
  Ops Agent (LangGraph + MCP, in progress) in a "Currently Building"
  line added to the summary. Do not list it as a completed project.

- For roles emphasising evaluation / AI quality: reframe "Failure First"
  as "Built an automated LLM evaluation layer with heuristic validators
  and retry logic — equivalent to a lightweight evals framework." This
  maps directly to the eval-engineering roles proliferating at AI labs.

- For roles at companies using OpenAI: Ian Xiaohei's DALL-E / gpt-image-1
  routing demonstrates familiarity; move that bullet up in the project
  description.

- The coaching practice entry can be dropped for purely technical IC roles.
  Keep it for any role with a "collaborate with PMs / communicate findings
  to stakeholders" requirement — it's the most unusual signal in the resume
  and differentiates from pure-ML candidates.

- Drop the TCS containerisation bullet and replace with a "Currently
  Building: LangGraph + MCP Merchant Operations Agent" line once the
  project reaches a demonstrable milestone.
