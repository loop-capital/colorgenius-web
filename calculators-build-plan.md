# ColorGenius Calculator Tools — Build Plan

**Date:** 2026-09-17
**Owner:** Iris (colorgenius-ceo)
**Build Team:** colorgenius-dev, colorgenius-dev-qwen
**Review:** Claude Code (before integration)

---

## Objective
Build 5 standalone calculator tools to compete with Blendsor's tool suite. Each tool consists of:
- API route for calculations
- Interactive UI component
- Integration hook for existing pages

---

## Tools to Build

### 1. Developer Mix Calculator
**Purpose:** Calculate exact developer-to-color ratio based on hair variables.
**Inputs:**
- Starting level (1-12)
- Target level (1-12)
- Gray percentage (0-100%)
- Desired coverage (full/partial)
**Outputs:**
- Developer volume (10/20/30/40 vol)
- Mix ratio (1:1, 1:1.5, 1:2)
- Processing time estimate
**Files:**
- `app/api/tools/developer-mix/route.ts`
- `components/tools/DeveloperMixCalculator.tsx`
- `app/tools/developer-mix/page.tsx`

### 2. Salon Pricing Calculator
**Purpose:** Calculate service pricing based on costs and margins.
**Inputs:**
- Product cost per service
- Chair time (minutes)
- Stylist hourly rate
- Salon overhead percentage
- Desired profit margin
**Outputs:**
- Recommended service price
- Cost breakdown
- Profit per service
**Files:**
- `app/api/tools/salon-pricing/route.ts`
- `components/tools/SalonPricingCalculator.tsx`
- `app/tools/salon-pricing/page.tsx`

### 3. Hair Porosity Test
**Purpose:** Interactive assessment to determine hair porosity.
**Inputs:**
- 5-question quiz (water test, product absorption, drying time, etc.)
**Outputs:**
- Porosity level (low/medium/high)
- Product recommendations
- Care routine tips
**Files:**
- `app/api/tools/porosity-test/route.ts`
- `components/tools/PorosityTest.tsx`
- `app/tools/porosity-test/page.tsx`

### 4. Bleach Level Predictor
**Purpose:** Predict lift level from bleach application.
**Inputs:**
- Starting level (1-10)
- Developer volume (10/20/30/40 vol)
- Processing time (minutes)
- Hair condition (healthy/damaged/processed)
**Outputs:**
- Predicted lift level
- Risk assessment
- Recommended technique
**Files:**
- `app/api/tools/bleach-predictor/route.ts`
- `components/tools/BleachPredictor.tsx`
- `app/tools/bleach-predictor/page.tsx`

### 5. Color Correction Calculator
**Purpose:** Determine corrector and technique for unwanted tones.
**Inputs:**
- Unwanted tone (orange/brass/yellow/red)
- Current level
- Target tone
**Outputs:**
- Corrector shade
- Technique (tone-on-tone/pre-pigment/cancel)
- Developer recommendation
**Files:**
- `app/api/tools/color-correction/route.ts`
- `components/tools/ColorCorrectionCalculator.tsx`
- `app/tools/color-correction/page.tsx`

---

## Architecture

### API Routes
All routes live under `app/api/tools/[tool-name]/route.ts`
- Input validation with Zod
- Calculation logic (pure functions, no DB reads for v1)
- JSON response with results

### UI Components
All components live under `components/tools/`
- React functional components
- Form inputs with validation
- Real-time calculation (client-side + API fallback)
- Mobile-responsive design

### Pages
All pages live under `app/tools/[tool-name]/page.tsx`
- SEO-friendly URLs
- Tool description and usage guide
- Shareable links

---

## Implementation Order

1. **Developer Mix Calculator** — Core formulation tool, highest value
2. **Hair Porosity Test** — Client-facing, drives engagement
3. **Color Correction Calculator** — Natural extension of formula engine
4. **Bleach Level Predictor** — High-value for blonding services
5. **Salon Pricing Calculator** — Business tool, complements Square integration

---

## Success Criteria
- All 5 tools functional and tested
- API routes return correct calculations
- UI is mobile-responsive
- Tools are shareable (SEO-friendly URLs)
- Code passes tsc with zero errors

---

## Notes
- Keep calculation logic pure (no external dependencies)
- Use existing design system (colors, typography, spacing)
- Tools should be embeddable in other pages (dashboard, client profile)
- Consider adding to `/tools` index page for discovery
