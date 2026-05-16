# COLORGENIUS — APP BUILD BRIEF

**From:** Che (CEO, ClawStudio)
**To:** ColorGenius (CEO) + colorgenius-dev
**Date:** April 16, 2026
**Priority:** HIGH — Start immediately, parallel with color line research

---

## Objective
Build the ColorGenius web application — a professional hair color formulation tool for stylists. Photo → AI analysis → formula recommendation → result scoring.

## App Workflow (User Journey)

```
1. STYLIST opens app → Dashboard
2. Clicks "New Formulation"
3. CLIENT QUESTIONNAIRE — Treatment history, hair type, sensitivities
4. Takes photo of client's current hair (or uploads)
5. Selects desired color (from color line database)
6. AI analyzes questionnaire + photo → detects current color, condition, treatment risk
7. AI recommends formulation: color + developer + ratio + processing time + warnings
8. Stylist applies color on client
9. Takes photo of finished result
10. AI scores the result (accuracy, condition, evenness)
11. Result saved to client history
```

### Client Questionnaire (Input from salon expert)
**Questions to include (Jason's wife to finalize):**
- Has any hair straightening, perm, or acid treatment been applied? (When?)
- Is there any metallic dye or henna on the hair?
- Any known allergies to hair color products?
- Hair texture type (fine, medium, coarse)
- Scalp condition (sensitive, normal, conditions)
- Previous color services (when? what brand?)
- Desired outcome (root touch-up, full color, highlights, corrective)
- Any hair loss or thinning concerns?

*Note: Questionnaire responses significantly alter formulation logic. Treatments, metallic dye, and allergies are CRITICAL flags.*

## Pages to Build (Updated with ReFa Reference)

### ReFa Workflow (for reference)
ReFa uses 7 tabbed steps: Client → Pre-Treatment → Hair Analysis → Desired Color → Color Prescription → Color Result → Color Diagnosis. Each step is a separate screen with arrow navigation.

### 1. Dashboard (`/`)
- Recent formulations
- Quick stats (total formulations, avg score)
- "New Formulation" CTA button
- Client list

### 2. Client Questionnaire (`/questionnaire`)
- Treatment history form (straightening, perm, acid, metallic dye, henna)
- Allergy check
- Hair texture selection
- Previous color history
- Desired outcome
- Smart defaults (remembers returning clients)

### 3. New Formulation (`/formulate`)
- Step 1: Questionnaire summary (from previous step)
- Step 2: Photo capture (camera integration)
- Step 2: Select color line (dropdown)
- Step 3: Select desired shade
- Step 4: AI analysis loading state
- Step 5: Formulation result card:
  - Recommended color mix (shades + ratios)
  - Developer volume
  - Processing time
  - Expected result
  - Warnings (e.g., "requires pre-lightening")

### 3. Result Scoring (`/score/:id`)
- Upload "after" photo
- AI compares before/after
- Score display (3 categories):
  - Color accuracy (% match to target)
  - Hair condition (damage assessment)
  - Evenness (application quality)
- Notes field for stylist

### 4. Client History (`/clients/:id`)
- Client profile
- Formulation history
- Before/after photo gallery
- Notes per session

### 5. Color Library (`/colors`)
- Browse color lines (Davines, Wella, Redken, etc.)
- Shade charts
- Mixing guides
- Search by color/tone/level

### 6. Dashboard Analytics (`/analytics`)
- Formulations per week
- Average scores over time
- Most used color lines
- Revenue impact (if connected to POS)

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Animations:** Framer Motion (for smooth transitions)
- **Components:** 21st.dev Magic for UI components
- **Photo handling:** react-camera-pro or expo-camera
- **Charts:** Recharts (for analytics)
- **State:** Zustand or React Query

## API Endpoints Needed

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/questionnaire` | Save client questionnaire responses |
| POST | `/api/analyze` | Upload hair photo + questionnaire → returns color analysis |
| POST | `/api/formulate` | Current color + desired color → returns formula |
| POST | `/api/score` | Upload before/after photos → returns score |
| GET | `/api/colors` | List all color lines and shades |
| GET | `/api/colors/:line` | Shades for specific color line |
| GET | `/api/clients` | List clients |
| GET | `/api/clients/:id/history` | Client formulation history |
| POST | `/api/formulations` | Save new formulation |
| POST | `/api/community/share` | Share before/after + formula to community |
| GET | `/api/community/feed` | Browse community formulas |
| POST | `/api/community/vote` | Rank/like community formulas |
| POST | `/api/marketplace/purchase` | Purchase AI-adapted template |
| POST | `/api/marketplace/adapt` | AI adapt purchased template to client |
| GET | `/api/marketplace/trending` | Trending/seasonal formula feeds |
| GET | `/api/marketplace/creator/dashboard` | Creator earnings + analytics |
| POST | `/api/marketplace/payout` | Request revenue split payout |

## For MVP — Mock First
- `/api/analyze` → Return mock color data (level 6, warm undertone)
- `/api/formulate` → Return mock formula (hardcoded for 5-6 common scenarios)
- `/api/score` → Return mock score (85% accuracy)
- `/api/community/*` → Mock community feed with 10 sample formulas
- `/api/marketplace/*` → Mock marketplace with 5 sample templates

## Design Direction
- **Audience:** Professional colorists (not consumers)
- **Vibe:** Clean, precise, tool-like (think Figma, not Instagram)
- **Colors:** Neutral palette — white/dark gray with accent color
- **Typography:** Clean sans-serif (Inter or Space Grotesk)
- **Photos:** Large, high-contrast, easy to compare before/after

## Reference Apps (Design Inspiration)
- **ReFa AI Color Recipe PRO** — competitor (workflow reference)
- **StyleSeat** — booking/client management for stylists
- **GlossGenius** — salon business platform
- **Figma** — tool-like UX, clean interface
- **Pinterest** — community discovery, grid layouts

## Deliverables
- [ ] Next.js app shell with routing
- [ ] All 6 pages scaffolded with mock data
- [ ] Photo capture component
- [ ] Mock API endpoints (hardcoded responses)
- [ ] Responsive design (tablet-first — salons use tablets)
- [ ] Deploy to Vercel (staging)

## Phase 2+: Formula Marketplace Pages (Post-MVP)
- **Community Feed** (`/community`) — Browse before/after formulas
- **Stylist Profile** (`/stylist/:id`) — Public portfolio + shared formulas
- **Formula Detail** (`/formula/:id`) — Before/after, products, technique, adapt CTA
- **Marketplace Browse** (`/marketplace`) — Trending, seasonal, search templates
- **Creator Dashboard** (`/creator`) — Earnings, analytics, template management
- **Purchase Flow** (`/marketplace/checkout`) — Square Marketplace purchase + adaptation

## Timeline
- **Week 1 (April 16-23):** App shell, Dashboard, Formulation page (mock data)
- **Week 2 (April 23-30):** Result scoring, Client history, Color library
- **Week 3 (April 30 - May 7):** Analytics, polish, real API integration begins
- **Phase 2 (Months 5-8):** Community features, ranking system
- **Phase 3 (Months 9-14):** Marketplace launch, AI adaptation engine
- **Phase 4.5 (Months 20-28):** Scale marketplace, ByondEdu integration

---

**Start building.** Color line data feeds in as research completes — no blocking dependency.
**Marketplace architecture should be designed for from Phase 2 onward.**
