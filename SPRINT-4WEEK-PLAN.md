# ColorGenius — 4-Week Beta Sprint Plan
**Sprint:** Beta Rush — April 25 to May 23, 2026
**Goal:** Working beta app for manufacturer demos + stylist hands
**Owner:** Lucy (CEO)
**Status:** ACTIVE — All teams mobilized

---

## Sprint Timeline

### Week 1 (Apr 25–May 2): Foundation
**Theme:** Design system + core backend APIs
- [ ] Dark-mode design system (tablet-first, iPad)
- [ ] Core API endpoints (analyze, formulate, score, clients, colors)
- [ ] Database schema finalized + deployed
- [ ] Photo analysis approach decided (ML vs manual fallback)

**Deliverable:** App skeleton with design system + API contract

### Week 2 (May 2–9): Photo + Formulation
**Theme:** Photo capture + analysis + formula output
- [ ] Photo capture component (camera integration)
- [ ] Photo analysis pipeline (level/tone/condition detection)
- [ ] Formulation engine v1 (rule-based)
- [ ] Result display with mixing ratios + warnings

**Deliverable:** End-to-end formulation flow working

### Week 3 (May 9–16): Client + Library + Polish
**Theme:** Client management + color library + UI polish
- [ ] Client CRUD (create, read, update, delete)
- [ ] Formulation history per client
- [ ] Before/after photo gallery
- [ ] Color library browser (all 10 brands)
- [ ] Mixing ratio calculator
- [ ] Animation polish (Framer Motion)

**Deliverable:** Feature-complete beta

### Week 4 (May 16–23): Testing + Launch Prep
**Theme:** Testing, onboarding, beta readiness
- [ ] QA pass (all flows)
- [ ] Beta tester onboarding guide
- [ ] Manufacturer outreach kit
- [ ] Landing page live
- [ ] Analytics instrumentation
- [ ] Bug fixes from internal testing

**Deliverable:** Beta launched to 50 stylists

---

## Team Assignments

| Agent | Role | Week 1 Focus | Week 2 Focus | Week 3 Focus | Week 4 Focus |
|-------|------|-------------|-------------|-------------|-------------|
| colorgenius-dev | Full-stack dev | Design system + APIs | Photo + formulation | Client mgmt + polish | Testing + fixes |
| colorgenius-research | Color science + CV | Photo analysis research | Formulation rules | Color data validation | QA support |
| colorgenius-architect | System design | DB schema + API contract | Pipeline architecture | Performance tuning | Deployment + scaling |
| colorgenius-marketing | GTM + content | Onboarding guide draft | Manufacturer outreach | Landing page | Launch comms |

---

## Reference Apps (Design Targets)

1. **Superpower Health** — Dark mode, teal accents, medical-grade trust
2. **ReFa AI Color Recipe PRO** — Competitor workflow (7-tab process)
3. **Vish** — Salon workflow, iPad-first

---

## Key Metrics for Sprint

| Metric | Target | Owner |
|--------|--------|-------|
| End-to-end formulation flow | Working by May 9 | colorgenius-dev |
| Photo analysis accuracy | >70% level detection | colorgenius-research |
| Beta testers recruited | 50 by May 23 | colorgenius-marketing |
| App deploy uptime | >99% | colorgenius-architect |
| Manufacturer meetings booked | 3 by May 30 | colorgenius-marketing |

---

## Daily Standup Format (Async)

Each agent posts daily to memory/standups/YYYY-MM-DD.md:
1. What I completed yesterday
2. What I'm working on today
3. Blockers (if any)

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Photo analysis ML not ready | High | Fallback to manual colorist input |
| Color line data incomplete | Medium | Focus on top 5 brands for beta |
| Deployment complexity | Medium | Start with simple stack (Vercel + Supabase) |
| Beta tester recruitment slow | Medium | Leverage Jason's wife's salon network |
| Manufacturer interest low | Low | Lead with data, not just product |

---

## Current Status

**Week 1 — Day 1 (Apr 25)**
- ✅ All 4 agents mobilized
- ✅ Sprint plan created
- 🔄 Awaiting first deliverables from each team

---

*Last updated: 2026-04-25 by Lucy*
