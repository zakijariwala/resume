# LinkedIn Post Drafts: Week 2 (Deep Dives & Projects)

## Day 8: The "50% RTO" Win (SRE/Ops Pillar)
**Hook:** We cut our Recovery Time Objective (RTO) by 50% for Tier-1 banking applications. Here’s the one change that made the difference.

In a mission-critical environment supporting 30,000 users, every minute of downtime is a significant risk. When I joined the operations team, our Disaster Recovery (DR) drills were manual and took hours.

The shift wasn't a "magic tool." It was **Runbook Automation.**

We moved from static PDF docs to interactive, scripted runbooks that:
1. Automated the validation of database sync states.
2. Scripted the re-routing of traffic at the networking layer.
3. Provided real-time health checks post-failover.

**The result:** A 50% reduction in RTO and a massive boost in team confidence during drills.

**CTA:** Do you rely on manual runbooks or are you moving toward "executable documentation"?

---

## Day 9: Data Extraction as a Service (AI/Automation Pillar)
**Hook:** Can you extract 22,000 rows of relational data from a locked Android APK?

I needed to build an offline-first PWA for a community project (**Raaz-o-Neyaz**), but the data was trapped inside a legacy SQLite database within an APK.

So, I built a Python reverse-engineering pipeline to:
1. Decompile the APK and locate the core `.db` file.
2. Clean and normalize relational structures that hadn't been touched in years.
3. Convert the data into optimized JSON and CSV for modern web delivery.

Engineering isn't always about building from scratch; sometimes, it’s about "rescuing" data from legacy silos.

**CTA:** What’s the weirdest data source you’ve ever had to work with?

---

## Day 10: The "On-Premise Docker" Battle (Cloud/Platform Pillar)
**Hook:** "Why can't we just use ECS/EKS?" Because banking compliance says no.

In a Tier-1 financial institution, security isn't just a department—it’s the foundation. Implementing Docker-based workflows on-premise comes with unique challenges:
- No managed control plane.
- Strict firewall and air-gapped constraints.
- Integrating with legacy access governance.

But the payoff—consistent deployment environments and faster recovery times—is worth the battle. We aren't just moving containers; we’re moving the culture of "It works on my machine" to "It works everywhere."

**CTA:** Are you running containers on-premise or strictly in the Cloud? What’s your biggest hurdle?

---

## Day 11: Mentorship Minute (Growth Pillar)
**Hook:** I’ve coached 50+ engineers in technical interview readiness. The #1 mistake they make?

During production incidents or technical interviews, engineers often rush to the "How" before they understand the "What."

If a system goes down, don't just start restarting services. 
1. **Observe:** What exactly is the error?
2. **Orient:** Which layer (DB, App, Network) is affected?
3. **Decide:** What is the safest path to restoration?
4. **Act.**

In my coaching sessions, I focus on this **OODA loop** for technical incidents. Mastering the mindset is more important than mastering the command line.

**CTA:** What is your "First Principle" when a system starts failing?

---

## Day 12: The Zero-Budget Tech Stack (Dev Pillar)
**Hook:** You don’t need a massive budget to build a professional digital presence.

For a recent project in the industrial/marine equipment niche, I built a high-performance storefront with:
- **Astro JAMstack:** For lightning-fast static delivery.
- **Cloudflare:** For global edge hosting and security.
- **Claude API:** For automating product descriptions and SEO metadata.
- **Brevo:** For zero-budget cold email lead generation.

The result? A modern, scalable ecosystem with near-zero monthly overhead. 

**CTA:** What’s in your favorite "Zero-Budget" tech stack?

---

## Day 13: The Runbook Lie (SRE/Ops Pillar)
**Hook:** Most runbooks are just "shelfware"—they look good in an audit but fail in a crisis.

At a national bank, we treat a runbook like code. If it isn't "compiled" (tested) via a Disaster Recovery drill every month, it’s deprecated.

A great runbook must:
1. Have zero "tribal knowledge" requirements.
2. Include specific rollback steps for every action.
3. Be accessible even when the primary network is down.

If you haven't run your DR plan in 6 months, you don't have a DR plan. You have a wish.

**CTA:** When was the last time you actually tested your Disaster Recovery plan?

---

## Day 14: Sunday Hardware (Personal Pillar)
**Hook:** Why did I build my own E-Ink reader instead of buying a Kindle?

Because as an engineer, "building it yourself" is the best way to understand the hardware-software bridge. 

My **ESP-Pocket Reader** setup:
- **The Brain:** ESP32-S3 microcontroller.
- **The Display:** 3.7-inch E-Paper (zero eye strain, low power).
- **The Backend:** A Python EPUB-to-SQLite pipeline I built to manage content.
- **The Challenge:** Managing deep-sleep power states to make it last weeks on a tiny battery.

Sunday is for projects that remind us why we fell in love with tech in the first place.

**CTA:** Hardware or Software? Which one was your "first love"?
