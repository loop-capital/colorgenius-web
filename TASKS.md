# ColorGenius Tasks

## Status Legend
`[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

---

## Phase 1: Foundation

### Architecture
- [x] ADR-001: AI recommendation approach (rules-based v1, ML later)
- [x] ADR-002: Video/storage platform decision (Cloudflare R2)
- [x] ADR-003: Auth provider decision (JWT + Supabase)
- [x] Design color science data model (hair state, formula output, brand library schemas)
- [x] Write OpenAPI spec for formula API
- [x] Database schema (550 lines, PostgreSQL, production-ready)
- [x] Deployment plan (Vercel + Railway + Supabase + R2, ~$70-90/mo)

### Research
- [x] Ingest Redken shade library → `colorgenius/data/brands/redken/shades.json`
- [x] Ingest Wella shade library → `colorgenius/data/brands/wella/shades.json`
- [x] Ingest Goldwell shade library → `colorgenius/data/brands/goldwell/shades.json`
- [x] Ingest Schwarzkopf shade library
- [x] Ingest Matrix shade library
- [x] Ingest Joico shade library
- [x] Ingest Paul Mitchell shade library
- [x] Ingest Pulp Riot shade library
- [x] Document color science fundamentals (lift theory, developer ratios)
- [x] Document correction case studies
- [x] Photo analysis approach (OpenCV + rule-based for beta)
- [x] Formulation engine rules (developer logic, tone mapping, condition adjustments)
- [x] Competitive analysis (Blendsor, SalonScale, Color Coach, ReFa, LG CHI)
- [x] Face shape AI research (MediaPipe Face Mesh)

### Development
- [x] Set up Next.js project (mobile-first)
- [x] Build color level input form (iPad-optimized)
- [x] Build formula output display with confidence indicator
- [x] Build brand library browser
- [x] Build formula history (save/recall by client)
- [x] Integrate shade data from research (166 shades, 8 brands)
- [x] Build dashboard with KPIs
- [x] Build client CRUD + history
- [x] Build community/marketplace API (12 endpoints)
- [x] Build gallery page
- [~] Custom component library (8 of 10+ done)
- [~] Page redesigns (5 of 9 done — Dashboard, Formulate, Gallery, Community, Clients)
- [ ] Redesign: Analyze page
- [ ] Redesign: Library page
- [ ] Redesign: History page
- [ ] Redesign: Questionnaire page
- [ ] Wire /api/formulate to real shade DB algorithm (currently rules-based)
- [ ] Build consultation questionnaire wizard
- [ ] Client detail page with formulation history
- [ ] Tablet-first responsive pass (iPad primary)

### Inventory & Auto-Ordering
- [x] Inventory tracking schema (Products, UsageLogs, StockTransactions, PurchaseOrders)
- [x] Client + ClientVisit models (hairProfile, service history)
- [x] Profit tracking (ServicePricing, ProfitSnapshot)
- [x] Auto-ordering system (Supplier, AutoOrderLog, reorderThreshold)
- [x] Client History API endpoints (3 routes)
- [x] Square API research (integration approach defined)
- [ ] Auto-order email/PDF generation for Monaco Blue
- [ ] Square OAuth2 integration
- [ ] Appointment book integration

### Infrastructure
- [x] Provision PostgreSQL (Supabase)
- [x] Deploy frontend (Vercel)
- [x] Configure Redis helper with fallback
- [x] Prisma schema + migration applied
- [~] Deploy backend API (Vercel serverless functions)
- [ ] Configure UptimeRobot health monitoring
- [ ] Configure Sentry error tracking
- [ ] Photo upload service (S3/R2)

---

## Phase 2: Integrations (Post-Beta)
- [x] UpLook "ColorGenius Certified" badge integration spec
- [ ] ByondEdu course module API surface
- [ ] Pleij Salon workstation integration
- [ ] Che Lace wig coloring recommendations
- [ ] Consumer app: "ColorGenius Discover" (LookGenius rebrand in Month 8-10)

---

## Known Blockers
- [!] Gateway restarts kill agents at ~13 minutes — need Jason/Che investigation
- [!] Subagent LLM timeout with Kimi K2.6 on long prompts — using Qwen for small tasks
