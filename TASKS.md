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

### Beta Sprint — 3 Workstreams ✅ VERIFIED (2026-05-17)

#### 1. Normalization Pipeline ✅
- [x] Master file: `data/brands/all-shades-normalized.json` (2,991 shades, 19 brands)
- [x] R+COLOR (brand #18) added: 192 shades across 6 lines (omnipresent, stellar, starsign, hypermatic, half-truth, super-palette)
- [x] SOHO by MOB (brand #19) added: 60 shades
- [x] Zero null toneFamily or level entries
- [x] Cross-brand comparison chart validated (7 entries)
- [x] `normalization-summary.json` updated with 19-brand data

#### 2. Conversion Engine ✅
- [x] Engine: `dashboard/lib/conversion/engine.ts` (15.8KB)
- [x] Data loader: `dashboard/lib/conversion/data-loader.ts` (9.4KB)
- [x] Tone mappings: `dashboard/lib/conversion/tone-family-mappings.ts` (13.8KB)
- [x] Manufacturer conversions: SOHO (14 brands) + CHI (11 brands)
- [x] Types: `dashboard/lib/conversion/types.ts` (3.8KB)
- [x] API route: `/api/formulate/convert`
- [x] UI: `ConversionPanel.tsx` integrated into formulate page
- [x] **Tests: 34/34 passing** (conversion.test.ts + parity.test.ts)
- [x] Fixed: duplicate keys in tone-family-mappings.ts (r-color, soho, omcorcolor .65)
- [x] Fixed: import attributes `with { type: 'json'' }` → `require()` in manufacturer-conversions.ts
- [x] Fixed: jest.config.js missing → created with ts-jest + tsconfig.test.json
- [x] Fixed: ts-jest test dependencies installed (jest, ts-jest, @types/jest, @jest/globals, typescript)
- [x] Next.js build: passes clean

#### 3. Expo/iOS Build Pipeline ✅
- [x] `packages/mobile/app.json` + `eas.json` configured
- [x] CI/CD: `.github/workflows/eas-build.yml` ready (EAS Build → TestFlight)
- [x] Camera/photo permissions set
- [x] Expo SDK 54, React Native 0.81.5

### Remaining (Blocked on External Dependencies)
- Expert validation (Jason's wife reviews tone mappings)
- TestFlight submission (needs Apple Developer account + EAS secrets)
- End-to-end test with live data

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

### Brand Database
- [x] 19 brands, ~2,991 shades across all lines
- [x] Manufacturer-verified conversion data: SOHO (14 brand pairs) + CHI (11 brand pairs)

---

## Backlog

### High Priority
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

**2026-05-17:** Beta sprint verification complete. All 3 workstreams verified. Test infrastructure fixed (jest config, ts-jest, duplicate keys, import attributes). Normalization pipeline expanded from 17→19 brands (R+COLOR + SOHO added). 34/34 tests passing, Next.js build clean. Expo pipeline ready but blocked on Apple Developer account.
