# Content Governance — zakijariwala.space Portfolio

## Purpose

Defines what content belongs on the portfolio, how it should be written, and the rules for updating it. Applies to all edits — human, CMS-assisted, or AI-assisted.

---

## Audience Model — Three Modes

The portfolio serves three audiences, each with a dedicated mode. Each mode is a distinct presentation of the same person.

**Recruiter / Hiring Manager** (Recruiter mode)
Scans in under 60 seconds. Needs: current role, years of experience, key skills, proof of impact via numbers. Does not read prose on first pass. Org names, titles, and metrics must be immediately visible. Write to be skimmed first, read second.

**Technical Peer / Collaborator** (Developer mode)
Reads project descriptions and stack choices. Assesses whether the knowledge is genuine, whether the problems were real, whether the thinking is sound. Sensitive to vague language and inflated claims. Wants to see the real stack and real architecture decisions. Does not need context explained — writes at peer level.

**Curious Visitor / Potential Collaborator** (Curious mode)
Wants to understand the person behind the CV. Interested in why decisions were made, what's being built now, what the engineering philosophy is. Responds to honesty, specificity, and quiet personality in the writing. This is the mode where the "why I built it" content carries the most weight.

Write for all three. Lead with what the recruiter needs, add depth for the technical peer, show the person to the curious reader.

---

## Voice & Tone

### Core voice attributes

- **Direct** — says the thing without preamble. "Built a Python cold email agent" not "I had the opportunity to build…"
- **Specific** — exact numbers, exact stack names, exact outcomes. Vague language signals weak work.
- **Confident without arrogance** — states what was done and what it achieved. Does not hedge, does not overclaim.
- **Dry and honest** — personality comes through in project descriptions and the About section. Quiet wit is acceptable. Forced personality is not.

### Do not

- "passionate about" anywhere on the site
- "leverage" as a verb
- "I had the opportunity to"
- "various" — name the things
- Open a bullet with "Responsible for"
- "etc." — finish the list or cut it
- Third person in the About section
- Explain what TCS or SBI is — assume the reader knows or will look it up

### Tone calibration by mode

The same quality rules apply in all modes. Voice calibrates to the audience:

| Mode | Voice calibration |
|---|---|
| Recruiter | Formal, credential-first, metric-led. No prose preambles. Lead with the number. |
| Developer | Peer-to-peer, technical, direct. Omit what a peer already knows. Name the tradeoffs. |
| Curious | Personal, first-person permitted. The "why" behind the "what" is always welcome here. |

### Tone by section

| Section | Tone |
|---|---|
| Hero tagline | Punchy. One idea per sentence. |
| About | Personal, honest. First-person is fine. |
| Experience bullets | Third-person implied. Present tense for current role, past for prior. |
| Project descriptions (short) | Technical but readable. Outcome first. |
| Project descriptions (long / Curious mode) | Reasoning and tradeoffs welcome. The "why I built it" is the point. |
| Contact | Warm, direct, specific about what you're looking for. |

---

## Section-by-Section Content Rules

### Hero

- **Name:** displayed exactly as branded — J. Zaki
- **Role line:** current role + org only. Format: `Role · Org`
- **Tagline:** max 2 sentences. Must include one number and one outcome.
- **Stat cards (Recruiter + Developer modes):** exactly 4. Each has a number and a label. Numbers must be verifiable and current. Do not add a 5th — remove the weakest before adding another.
- **"Currently" block (Curious mode only):** replaces stat cards entirely. 3–5 sentences. What's being built, explored, or thought about right now. Not a biography — a status update. Update when focus shifts.
- **Availability line:** must be accurate at all times. Update when job status changes.
- **CTAs:** exactly 2. Primary = resume download. Secondary = preferred contact method.

### About

- **Left column (sticky):** 2–3 sentences maximum. Professional framing only — one clear identity statement.
- **Right column:** 3–4 paragraphs.
  - P1 — Professional identity (what you do, where, at what scale)
  - P2 — Side projects (human angle — what you build when no one's asking you to)
  - P3 — Other roles (coaching, ventures, anything concurrent)
  - P4 — Current focus / interests. Updated every 3–6 months.
- **Callout block:** the highlighted gold-border pull paragraph. Should reference the project with the most human or personal significance — not necessarily the most technically impressive.
- In Curious mode, P4 carries the most weight. It should be the most personal, most current paragraph on the entire page.

### Experience

**What qualifies:**
- Paid or formally titled roles only
- Minimum 3 months duration
- At least 2 specific measurable outcomes to list

**Bullet rules:**
- Maximum 5 bullets per role
- Each bullet: action verb + specific thing + result or scale indicator
- At least 2 of the 5 must contain a number
- Cut any bullet that reads as a job description rather than an achievement

**KPI row rules:**
- 2–4 KPIs per role
- Each KPI must be a number defensible in an interview
- Display font number, mono font label below — always paired
- Do not distort by rounding: "~150" is accurate. "100+" when the real number is 150 is not.

**Ordering:** reverse chronological. Current role first.

**Status badges:**
- Current — currently employed / active
- Ongoing — active side venture, running concurrently
- Concluded — deliberately wound down
- Do not use "Past" — it is ambiguous

### Projects

**What qualifies:**
- Something you built, not something you used at work
- Deployed, functional, or a working prototype — not just planned or conceived
- At least one specific metric or measurable outcome
- Employer-owned work does not qualify unless substantially self-directed and cleared for public mention

**Featured project slot:**
- One project only, full-width card
- Should be the project with the most diverse technical scope — not necessarily the most impressive domain
- Currently: Zamaan Marine Digital Ecosystem
- Update when a more representative project ships

**Standard project card content:**
- Tag line: domain + type (e.g. "PWA · Offline-first", "CLI · Automation")
- Name: what you call it — not a description
- Metric chip: one number, outcome-focused. Not a vanity metric.
- Description: 2–3 sentences. Lead with the problem, close with the most technically interesting part.
- Stack: only technologies you did meaningful work in. Do not list dependencies you just imported.
- Link: GitHub if public, "Private" if not. Do not link a placeholder or non-functional repo.

**"Why I built it" (Curious mode):**
- Always visible in Curious mode — never behind a toggle
- 2–4 sentences. The real motivation. What made this problem worth solving personally.
- First-person. Specific. Not a pitch.

**Maximum projects:** 6. If a 7th qualifies, evaluate the weakest current project for removal.

### Skills

**Confident:** Used in a professional or shipped-project context. Would interview on it at depth. Solved a real, non-tutorial problem with it.

**Familiar:** Used meaningfully but not deeply. Comfortable in conversation, not a technical interview.

**Learning:** Actively studying now — not just aware of. Remove from this list if no active work in the past 3 months.

**Culling rule:** If a technology has not been touched in 12 months and does not appear in any listed project or role, remove it.

**Categories:** Do not create a new category unless there are at least 5 skills that genuinely do not fit existing ones.

### Certifications

**What qualifies:**
- Issued by a recognised technical authority
- Verifiable — has a credential ID or public badge
- Relevant to the roles currently being targeted

**Status:**
- Completed — passed and credentialed
- In Progress — actively studying, with a realistic expected date
- Do not list certifications planned but not yet actively studied

**Maximum:** 5. If a certification expires and is not renewed, remove it.

### Contact

- **Headline:** update to reflect current job-search target. "Let's talk infrastructure" → "Let's talk SRE" if focus has shifted.
- **Availability paragraph:** under 3 sentences. Location, relocation openness, preferred contact mode.
- **Links shown:** only channels you actively monitor. Remove any you will not respond to within 48 hours.
- **Formspree form:** if the endpoint has not been activated, remove the form panel rather than show a non-functional form. A placeholder form is worse than no form.

---

## Update Cadence

| Content | Trigger for update |
|---|---|
| Availability line | Job status changes |
| Hero "currently" block (Curious mode) | Every 1–2 months or when focus shifts |
| Hero stat cards | Quarterly, or on a significant milestone |
| Current role bullets | Annually or after a major project / initiative |
| Projects | When a new project ships and qualifies |
| Skills — Learning tier | Every 3 months |
| Skills — Confident / Familiar | When a technology is dropped or deepened |
| Certifications | When earned or when expired |
| About P4 (current focus) | Every 3–6 months |
| Contact headline | When job-search focus shifts |

---

## What This Portfolio Is Not For

- Blog posts or opinions — build a separate space for those
- Testimonials or client quotes
- A full CV — depth lives in the resume PDF, not here
- Listing every technology ever touched
- Decorative interactive elements that do not contain real information
- Explaining common industry names and acronyms (TCS, SBI, RHEL, SRE) — the reader knows or will look it up
