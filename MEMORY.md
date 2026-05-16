# MEMORY.md — ColorGenius Knowledge Base

## 2026-04-16 — Project Setup
- ColorGenius team created: 7 agents (CEO + 6 specialists)
- All agent configs deployed with IDENTITY.md + SOUL.md
- Workspace: `/home/jason/.openclaw/workspace/colorgenius`
- CEO: ColorGenius (Nemotron) — orchestrates the team
- Delegates to: colorgenius-dev, -research, -architect, -devops, -marketing, -syntax

## Strategic Context
- **Competitor:** ReFa AI Color Recipe PRO (Japan, CES 2026, 4,500+ recipes)
- **Our edge:** US market, hardware integration potential, expert formulation data
- **Key partner:** Jason's wife (20+ year professional colorist, salon owner)
- **Color lines:** Davines, Wella, Redken, Schwarzkopf, Matrix + more

## Active Work
- Color line database build (10 lines, due April 23)
- Build validation (API ✅, shared ✅, web ❌ TypeScript error)
- Hair testing tools research (spectrophotometer Phase 2)
- Competitor analysis (ReFa)

## Key Decisions
- Build platform ourselves (not partner with ReFa)
- Photo-based MVP (no hardware initially)
- Spectrophotometer device as Phase 2 differentiator
- Expert formulation data as competitive moat

---

## 2026-04-25 — Week 1 Sprint Complete
**Sprint:** 4-Week Beta Rush | **Status:** All 4 agents delivered on Day 1
- Design system: Dark-mode-first (teal primary, dark blue-slate background)
- API endpoints: 6 live (analyze, formulate, score, colors, clients, client history)
- Deploy: https://web-red-two-64936kmucq.vercel.app
- Stack: Vercel + Next.js 14 + Supabase + Cloudflare R2

## 2026-04-26–27 — Week 2 Sprint Complete
### Formulation Engine
- Bug fixed: `NEUTRALIZERS.red = 'green'` → `'ash'`
- 166 shades across 8 brands (expanded from ~100)
- 5 formulation tests passed (virgin lift, gray coverage, copper, auto-select, high-lift warning)
- New lines: Matrix ColorCraft, Joico K-PAK, Paul Mitchell, demi-permanent lines

### Custom Components (8 Built)
TreatmentCard, GlassCard, StatCard, ConfidenceBreakdown, BeforeAfterSlider, HairSegmentationOverlay, ColorSpectrumBar, ColorWheel3D, StepTransition

### Pages Redesigned (5 of 9)
Dashboard ✅, Formulate ✅, Gallery ✅, Community ✅, Clients ✅
Remaining: Analyze, Library, History, Questionnaire

### Infrastructure
- 12 Prisma community/marketplace models merged
- Migration applied successfully
- Redis helper with in-memory fallback
- Vercel issues resolved (framework preset, deployment protection)

### Strategic Decisions
1. **Single brand, dual experience**: ColorGenius (pro) + ColorGenius Discover (consumer)
2. **Design bar**: Must match ReFa quality — custom components required
3. **Parallel agents**: Full team deployed simultaneously
4. **New agent**: `colorgenius-dev-qwen` (Qwen 2.5 Coder 32B for fast edits)

### Live URLs
- **Dashboard**: https://dashboard-tau-five-16.vercel.app
- **Staging**: https://web-red-two-64936kmucq.vercel.app

### Known Issues
- Subagent LLM timeout with Kimi K2.6 on long prompts
- Gateway restarts kill agents at ~13 minutes (under investigation)
- 4 pages still need redesign
- `sharp` module resolution error (pre-existing, not blocking)

---

## 2026-05-03 — Major Progress: Davines Integration + Vish Feature Foundations

### Accomplishments:
- ✅ **Davines Color Line Complete**: Added all 3 lines (View, A New Colour, Mask with Vibrachrom) to `/home/jason/.openclaw/workspaces/colorgenius/data/brands/davines/` with full formulation guidelines
- ✅ **Vish Feature Foundations Laid**:
  - **Bluetooth Scale Research**: Discovered Vish salons use Acaia Luna/Pearl scales (not proprietary hardware) → Recommended Acaia Pearl for ColorGenius (0.1g, open API, 30hr battery)
  - **Inventory Tracking System**: Created complete Prisma schema (`/home/jason/.openclaw/workspaces/colorgenius/packages/api/prisma/schema.prisma`) with 7 tables for exact product usage tracking
- 🔑 **Key Strategic Insight**: Vish uses rebranded Acaia scales → Ensuring Acaia compatibility = zero hardware switching cost for Vish clients

### Decisions Made Today:
1. **Hardware Strategy**: Target Acaia Luna/Pearl compatibility (what Vish salons actually own) rather than trying to work with proprietary Vish scale
   - Enables seamless transition for current Vish clients (keep existing hardware)
   - Leverages Acaia's open API for more flexibility than Vish's closed ecosystem
   - Better value: one-time $220 Acaia vs Vish's $195 + $150/mo subscription

2. **Development Approach**: 
   - Start with Client Formula History System (builds directly on completed inventory work)
   - Break all features into small, bounded tasks (15-30 minute chunks)
   - Use explicit delegation via sessions_spawn with clear objectives
   - Wait for completion signals between batches to prevent agent context overload

3. **Memory Discipline**: 
   - Update daily memory log immediately after work completion
   - Curate key decisions to MEMORY.md periodically
   - Prevent recurrence of context overload/lapse issues

### Key Distributors (US Salon Supply)
- **Monaco Blue** — Pleij Salon's exclusive distributor (PRIORITY for beta)
  - No API — orders via email (customerservice@monacoblue.com)
  - Auto-ordering = PDF PO generation → auto-email
  - Jason reaching out to discuss partnership
- **Coolbeauty** — major salon supply distributor
- **Salon Centric** — L'Oréal-owned, major US distributor
- **CosmoProf** — Sally Beauty Holdings-owned, major US distributor
- Auto-ordering system must target these as suppliers

### Competitive Intel:
- **Vish is NOT Square-compatible** — Square integration is a ColorGenius differentiator
- **The specific gap**: Vish offers auto-ordering for inventory replenishment, but this feature doesn't work with Square
- **Our play**: Build auto-ordering that WORKS with Square's ecosystem — best of both worlds
- Vish compatible with some other booking platforms (not yet specified)
- Square = priority #1 for appointment book integration

### Next Steps:
- Begin Client Formula History System (database → API → UI)
- Follow with Profit Tracking & Pricing Optimization  
- Then Appointment Book Integration and Team Performance Metrics
- Maintain small task sizes and strict delegation protocol throughout

### Files Created Today:
- `/home/jason/.openclaw/workspaces/colorgenius/data/brands/davines/shades.json` - Davines color data
- `/home/jason/.openclaw/workspaces/colorgenius/data/brands/davines/index.js` - Davines module export
- `/home/jason/.openclaw/workspaces/colorgenius/memory/2026-05-03.md` - Daily work log
- `/home/jason/.openclaw/workspaces/colorgenius/packages/api/prisma/schema.prisma` - Inventory tracking system (subagent completed)
## 2026-05-16 — Brand Database Expansion + Salon Config

### Brands Added Today (21 total)
- **R+COLOR (brand #18):** 193 shades (64 permanent, 31 HyperMatic demi, 43 Stellar demi, 33 Star Sign demi, 17 Half Truth semi, 4 Super Palette additives) + 4 lighteners. Full 56-page brand book parsed.
- **SOHO by MOB (brand #19):** 60 shades + NOVA lightener + 14 manufacturer conversion charts (Kenra, Wella KP, Wella Illumina, Paul Mitchell, Goldwell, Pravana, Schwarzkopf, L'Oréal, Matrix, Joico, Kevin Murphy, Keune, Scruples, Framesi)
- **O&M CØR.color (brand #20):** 102 shades, ammonia/PPD/resorcinol-free, ICCC numbering
- **CHI Ionic (brand #21):** 180 shades (96 permanent + 84 demi) + 864 manufacturer conversion mappings to 11 brands

### Formulation Engine Status
- 21 brands, ~3,300+ shades across all lines
- Manufacturer-verified conversion data: SOHO (14 brand pairs) + CHI (11 brand pairs) = 1,000+ verified mappings
- All brands integrated into conversion engine (data-loader, tone mappings, engine.ts)
- 34/34 tests passing, Next.js build clean

### Website Updates
- Hero updated: "3,000+ professional shades · 21 color brands · 90%+ formulation accuracy"
- Generate Formula button: LoaderCircle spinner (gold/orange) replaces Sparkles
- Pushed to main branch, Vercel auto-deploying

### Salon Brand Configuration (deployed by Che)
- **Pricing tiers:** Starter (1 brand, $29/mo), Salon (3 brands, $49/mo), Pro (5 brands, $79/mo), Elite (unlimited, $119/mo)
- **Add-on:** $7.50/mo per extra brand
- **Pleij Salon (Tiche):** Created in DB, Salon tier, brands: Davines, L'ANZA, Schwarzkopf
- **API:** GET /api/user/brands
- **Docs:** docs/SALON-BRAND-CONFIG.md
