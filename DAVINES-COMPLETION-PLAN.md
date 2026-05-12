# Davines Database Completion Plan

## Phase 1: Shade Code Completion (Research Agent)
- [ ] Re-analyze A New Colour Technical Map PDF for all ~70 shades
- [ ] Re-analyze Mask with Vibrachrom Technical Map for all ~120 shades  
- [ ] Find complete Finest Pigments shade listing (need per-tone codes)
- [ ] Verify The Present Time shades against source

## Phase 2: Technical Data Per Shade (Research + Architect)
- [ ] Processing times per shade family (varies by tone)
- [ ] Underlying pigment data per level (needed for neutralization math)
- [ ] Developer volume recommendations per shade/service
- [ ] Gray coverage guidelines (which shades cover best, mixing for resistant gray)
- [ ] Special mix instructions (e.g., "add .2 to neutralize warmth")

## Phase 3: Physical Review (Jason's Wife / Pleij Colorist)
- [ ] Review database against Davines physical shade books at Pleij
- [ ] Correct any misidentified shade codes or names
- [ ] Confirm processing times and developer recs match real-world use
- [ ] Add any Pleij-specific formulation notes

## Phase 4: Integration (Dev Agent)
- [ ] Update shades.json with complete data
- [ ] Add technical fields to schema
- [ ] Wire into formulation engine
- [ ] Build shade browser UI

## Current Status (2026-05-09)
- Phase 1: ~90% done — Finest Pigments now verified from Ingredient List PDF
  - A New Colour: 61 shades (Technical Map had ~70 visible, may have missed multi-tone combos)
  - Mask with Vibrachrom: 113 shades (comprehensive from Technical Map PNG)
  - The Present Time: 60 shades (complete from Color Chart)
  - Finest Pigments: 15 shades (VERIFIED — 64000-64014 from Ingredient List PDF)
  - Century of Light: 3 bleaching products (no color shades)
- Phase 2: Not started — needs underlying pigments, processing times, developer recs per shade
- Phase 3: Needs Eiza/physical shade books at Pleij for final verification
- Phase 4: Blocked on Phase 2-3

### What's Verified vs. Needs Review
- ✅ Finest Pigments codes verified against Ingredient List PDF
- ✅ The Present Time codes verified against Color Chart image
- ⚠️ A New Colour codes from Technical Map image analysis (AI-read, may have errors)
- ⚠️ Mask with Vibrachrom codes from Technical Map image analysis (AI-read, may have errors)
- ❌ Processing times, underlying pigments, developer recs per shade (not in source PDFs)
