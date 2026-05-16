# ColorGenius Task Tracker

## Active Tasks

### ADR-012: Chemical History & Safety Intelligence ✅ COMPLETE
- [x] TypeScript formulation engine updated (`dashboard/lib/formulation.ts`)
- [x] Dashboard wizard UI updated with Chemical History step (`formulate-content.tsx`)
- [x] API route updated to accept and forward chemical history (`packages/api/src/routes/formulate.ts`)
- [x] API types extended with ADR-012 response fields (`packages/api/src/types/index.ts`)
- [x] Results UI updated to consume new safety fields (hard stops, assessment, strand test, confidence)
- [x] Implementation summary written to `memory/adr-012-implementation.md`

**Status:** All changes complete. Waiting for Python engine ADR-012 implementation (separate workstream).

---

## Completed Tasks (Recently)

### Dashboard Enhancements
- [x] Multi-step formulation wizard (6 steps)
- [x] Chemical History step with live hard-stop validation
- [x] Sensitivity flags (PPD allergy, pregnancy, breastfeeding, chemo)
- [x] Confidence scoring with visual indicator
- [x] Professional assessment generation
- [x] Strand test recommendation system

### API Enhancements
- [x] Formulate endpoint accepts chemical_history and sensitivity
- [x] Response includes hard_stops, assessment, strand_test_recommended, adjusted_confidence
- [x] All safety fields persisted to database

---

## Backlog

### High Priority
- [x] Brand #14 — Kenra Professional shade data ingestion
  - [x] 108 permanent shades (levels 1–12, +RT Rapid Toners)
  - [x] 69 demi-permanent shades
  - [x] 10 Simply Blonde shades (ultra-lifts + toners)
  - [x] 17 Studio Stylist Express shades
  - [x] 13 Kenra Creatives semi-permanent shades
  - [x] `tone-family-map.json` updated with Kenra tone codes
  - [x] `data-loader.ts` imports + shade/specs maps wired
  - [x] `ConversionPanel.tsx` `BRAND_DISPLAY_NAMES` includes kenra
- [ ] Python formulation engine ADR-012 implementation
- [ ] Salon inventory integration (stock check on formulas)
- [ ] Client management (search, save, history)
- [ ] Formula saving to library

### Medium Priority
- [ ] Photo analysis integration (auto-detect current level)
- [ ] Color line management (brand/shade database)
- [ ] Scale widget integration (Bluetooth scale)
- [ ] Formula sharing marketplace

### Low Priority
- [ ] Mobile app companion
- [ ] AI chat assistant
- [ ] Educational content (ByondEdu integration)
- [ ] UpLook profile badge integration

---

## Notes

**2026-05-15:** ADR-012 fully implemented across TypeScript engine, dashboard UI, and API route. The feature is production-ready from the TypeScript/dashboard side. The Python engine will consume the same `chemical_history` payload when its ADR-012 implementation is complete.
