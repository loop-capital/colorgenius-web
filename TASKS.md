# ColorGenius Task Tracker

## Identity Recovery Note (2026-09-16)
This file was rebuilt after a git revert incident wiped months of task history. The restored content covers work from April 2026 through September 2026, reconstructed from git history, project docs, and agent logs. Some daily task breadcrumbs may be missing.

---

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

## Completed Tasks (2026-05 to 2026-09)

### May 2026

#### Brand Database Expansion
- [x] R+COLOR (brand #18): 193 shades + 4 lighteners
- [x] SOHO by MOB (brand #19): 60 shades + 14 manufacturer conversion charts
- [x] O&M CØR.color (brand #20): 102 shades
- [x] CHI Ionic (brand #21): 180 shades + 864 conversion mappings
- [x] 21 brands total, 3,273+ normalized shades
- [x] 34/34 tests passing

#### Salon Brand Configuration
- [x] Pricing tiers: Starter ($29), Salon ($49), Pro ($79), Elite ($119)
- [x] Add-on: $7.50/mo per extra brand
- [x] Pleij Salon created in DB (Salon tier: Davines, L'ANZA, Schwarzkopf)
- [x] API: GET /api/user/brands

#### iOS EAS Build Fix
- [x] `newArchEnabled: false` for react-native-ble-plx compatibility
- [x] Lazy BLE module loading
- [x] Bluetooth permissions in app.json
- [x] Formula pricing with dynamic totalWeight (capped at 500g)
- [x] parseInt radix fix (base 10)

### June 2026

#### Supabase Migration (3 Phases)
- [x] Phase 1: Simple routes (auth: register, login, me)
- [x] Phase 2: Medium routes (formula with client associations)
- [x] Phase 3: Complex routes (color bar session + create-official)
- [x] Final cleanup: Apple/Google OAuth callbacks migrated
- [x] Zero Supabase dependency in app/
- [x] Custom JWT auth (jose) with cookie + Bearer token

#### Mobile App Features
- [x] 4-step consultation workflow (web synced)
- [x] Gallery system (photo feed, upload, retry)
- [x] Library screen (formula history, client formulas)
- [x] New Service flow (client selection, auto-populate)
- [x] Last consultation endpoint

### July 2026

#### Square Integration Phase 1
- [x] Inventory tables added to database
- [x] Square sync persists to database
- [x] Full inventory CRUD with low stock alerts
- [x] Auto-deduct on service completion

#### Square Integration Phase 2: Color Bar
- [x] Square order integration in Color Bar
- [x] Real-time inventory tracking
- [x] Formula pricing with dynamic weights
- [x] Acaia BLE capture workflow
- [x] iOS build fixes (New Architecture disabled)

### August 2026

#### Phorest Salon Software Integration
- [x] Phorest API client (3,327 lines, 10 modules)
- [x] Client sync between Phorest and ColorGenius
- [x] Appointment sync
- [x] Service mapping

#### Auth Hardening
- [x] Cookie + Bearer dual auth
- [x] Formula routes enforce auth + ownership
- [x] Google callback email-based lookup
- [x] Apple/Google password_hash placeholder

#### Security Cleanup
- [x] Stopped tracking committed secrets (Supabase key, DB URLs)
- [x] Removed from git history

### September 2026

#### EAS Build Prep
- [x] metro.config.js added
- [x] Dependencies updated for EAS build
- [x] .easignore patterns anchored to root
- [x] Logo replaced palette emoji with CG logo

#### Mobile Token Auth
- [x] JWT token returned in login response body
- [x] localStorage + Bearer header pattern
- [x] Sidebar fetch includes credentials

#### Identity File Recovery
- [x] SOUL.md restored (12KB, 187 lines)
- [x] AGENTS.md restored (884 bytes, 19 lines)
- [x] MEMORY.md rebuilt from git history
- [x] TASKS.md rebuilt from commit history

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

## Blockers

| Priority | Blocker | Owner | Status |
|----------|---------|-------|--------|
| P0 | Apple Developer account for TestFlight | Jason | **NEEDS ACTION** |
| P1 | BLE scale physical testing | Jason | After iOS build |
| P2 | Davines pro portal access | Tiche | Outreach in progress |
| P2 | Lanza pro portal access | Tiche | Outreach in progress |
| P3 | Manufacturer outreach (partnerships) | Tiche/Jason | Ongoing |

---

## Notes

**2026-05-17:** Beta sprint verification complete. All 3 workstreams verified. Test infrastructure fixed (jest config, ts-jest, duplicate keys, import attributes). Normalization pipeline expanded from 17→19 brands (R+COLOR + SOHO added). 34/34 tests passing, Next.js build clean. Expo pipeline ready but blocked on Apple Developer account.

**2026-09-16:** Identity files recovered after git revert incident. MEMORY.md and TASKS.md rebuilt from git history + project docs. SOUL.md and AGENTS.md preserved (Claude restored from working tree). Added protection to prevent recurrence.

---

_This file was last rebuilt on 2026-09-16. Keep it updated after every completed task._
