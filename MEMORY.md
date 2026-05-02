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
