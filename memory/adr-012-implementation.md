# ADR-012 Implementation Summary

## Date: 2026-05-15

## Changes Made

### 1. TypeScript Formulation Engine (`dashboard/lib/formulation.ts`)

**New Types & Interfaces:**
- `LastServiceOption` — 7 recency options (`this_week` through `never`)
- `ChemicalHistory` — 8 fields (boxDye, metallicSalts, henna, keratinTreatment, relaxer, lastService, hardWater, medicationBuildup)
- `ConfidenceAdjustment` — factor, reduction, reason

**Extended Interfaces:**
- `FormulationInput` — Added `chemicalHistory?: ChemicalHistory`
- `FormulationResult` — Added `assessment?`, `strandTestRecommended?`, `confidenceAdjustments?`, `adjustedConfidence?`

**New Functions:**
- `validateChemicalHardStops()` — Checks metallic salts + lift, henna + lift, box dye + lift ≥4, box dye + henna combo
- `computeChemicalWarnings()` — Applies confidence reductions and processing adjustments per chemical history
- `shouldRecommendStrandTest()` — Returns true when ≥2 risk factors present
- `generateAssessment()` — Composes natural language assessment from template fragments

**Updated Functions:**
- `validateHardStops()` — Now calls `validateChemicalHardStops()` and merges results
- `formulate()` — Applies chemical warnings, sets strand test recommendation, generates assessment, computes adjusted confidence

### 2. Dashboard UI (`dashboard/app/formulate/formulate-content.tsx`)

**Wizard Steps Updated (5 → 6):**
1. Photo
2. Hair Assessment
3. **Chemical History** (NEW)
4. Target Look
5. Condition
6. Results

**New Form State:**
- `fd.chemicalHistory` — All 8 chemical history fields with defaults
- `fd.sensitivity` — All 4 sensitivity flags with defaults

**Chemical History UI (Step 3):**
- Toggle checkboxes for 7 chemical history items with contextual warning text
- Last service recency selector (7 options)
- Sensitivity flags section (PPD allergy, pregnancy, breastfeeding, chemo)
- Live hard-stop preview that blocks progression to Step 4
- Import and use `validateChemicalHardStops` from formulation engine

**Results UI (Step 6) — Now Consumes API Response:**
- `result.hardStops` — Safety blocks (red banners)
- `result.assessment` — Professional assessment (purple card)
- `result.strandTestRecommended` — Recommendation banner (yellow)
- `result.adjustedConfidence` — Confidence percentage with color-coded bar

**API Payload:**
- `handleSubmit` now sends `sensitivity` (snake_case) and `chemical_history` (snake_case) to API

### 3. API Route (`packages/api/src/routes/formulate.ts`)

**Request Handling:**
- Accepts `chemical_history` and `sensitivity` from request body
- Passes `chemical_history` to Python bridge's `formulateDeveloper()`

**Response Enrichment (ADR-012 Fields):**
- `hard_stops` — Array of safety blocks (computed server-side)
- `assessment` — Natural language assessment generated from chemical history + level change
- `strand_test_recommended` — Boolean based on risk factor count + lift level
- `adjusted_confidence` — Computed from confidence adjustments (floor 0)
- `confidence_adjustments` — Array of factor/reduction/reason objects

**Database Persistence:**
- All ADR-012 fields stored in `formula_data` JSONB column

### 4. API Types (`packages/api/src/types/index.ts`)

**Extended `FormulateResponse`:**
- `hard_stops` — Safety/feasibility/contraindication blocks
- `assessment` — Natural language text
- `strand_test_recommended` — Boolean
- `adjusted_confidence` — Number 0-1
- `confidence_adjustments` — Array of adjustments

## Verification

- TypeScript compilation passes cleanly for formulation.ts and formulate-content.tsx
- Existing errors in other files (marketplace, portal, capture, library) are pre-existing and unrelated
- API route validates chemical history fields and forwards to Python engine
- Client-side hard stops computed before API call to prevent invalid formulations

## Next Steps (When Python Engine Ready)

1. Python bridge already forwards `chemical_history` to `/formulate/developer`
2. When Python engine implements ADR-012, it will receive:
   - `chemical_history.box_dye`, `metallic_salts`, `henna`, etc.
   - Can apply same logic as TypeScript engine for consistency
3. Dashboard Results UI already consumes all new API response fields
