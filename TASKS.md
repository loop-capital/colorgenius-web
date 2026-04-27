# ColorGenius Tasks

## Status Legend
`[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

---

## Phase 1: Foundation

### Architecture
- [ ] ADR-001: AI recommendation approach (fine-tuned vs RAG vs rule-based)
- [ ] ADR-002: Video/storage platform decision
- [ ] ADR-003: Auth provider decision
- [ ] Design color science data model (hair state, formula output, brand library schemas)
- [ ] Write OpenAPI spec for formula API

### Research
- [ ] Ingest Redken shade library → `colorgenius/data/brands/redken/shades.json`
- [ ] Ingest Wella shade library → `colorgenius/data/brands/wella/shades.json`
- [ ] Ingest Goldwell shade library → `colorgenius/data/brands/goldwell/shades.json`
- [ ] Document color science fundamentals (lift theory, developer ratios)
- [ ] Document correction case studies

### Development
- [ ] Set up Next.js project (mobile-first)
- [ ] Build color level input form (iPad-optimized)
- [ ] Build formula output display with confidence indicator
- [ ] Build brand library browser
- [ ] Build formula history (save/recall by client)
- [ ] Integrate shade data from research

### Infrastructure
- [ ] Provision PostgreSQL (Neon)
- [ ] Deploy backend API (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configure UptimeRobot health monitoring
- [ ] Configure Sentry error tracking

---

## Phase 2: Integrations (Post-Beta)
- [ ] UpLook "ColorGenius Certified" badge integration
- [ ] ByondEdu course module API surface
- [ ] Pleij Salon workstation integration
- [ ] Che Lace wig coloring recommendations
