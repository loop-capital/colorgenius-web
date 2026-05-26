# PROJECT_STATUS — COLORgenius

**Status:** active
**Last Updated:** 2026-05-08T08:35:00Z
**Owner:** Jason Opland
**Repo/Path:** `/home/jason/.openclaw/workspaces/che/docs/colorgenius/`

---

## Goal
AI-powered hair color formulation platform with AR try-on, formula marketplace, and professional salon tools.

## Current Phase
Built Vish-style integration (scale + formulas) AND AR Try-On rendering engine. Testing with Acaia Pearl scale on PC2.

## Progress
- [x] Brand registry created (36 brands, ~1,193 shades)
- [x] Davines shade mapping documented (placeholder)
- [x] Lanza shade mapping documented (placeholder)
- [x] Vish integration specs built (PWA, BLE, API, components)
- [x] AR Try-On rendering engine (WebGL + Marschner BCSDF)
- [x] Hair segmentation (TensorFlow.js BodyPix)
- [x] Before/after split view
- [x] Brand-specific shade database (Davines + Lanza)
- [x] Acaia Pearl scale connection confirmed on PC2
- [x] **AR Try-On shade library** — 52 shades (Davines View/ANC/MaskVibrachrom + Universal)
- [x] **Color engine** — soft-light & overlay blending, root shadow, vertical gradient
- [x] **Hair segmentation** — 7 modes (auto/full/headband/roots/midlengths/ends/highlights)
- [x] **AR camera component** — real-time webcam processing with camera switching
- [x] **Photo try-on** — upload mode with before/after slider
- [x] **Shade picker UI** — tone filtering, search, brand grouping
- [x] **Try-on dashboard page** (`/tryon`) — full Next.js page with all controls
- [x] **Standalone demo page** (`/ar-demo.html`) — zero-dep HTML for Tiche testing
- [x] **AR features documentation** — complete specs for manufacturer presentation
- [ ] Populate exact Davines shade codes (need Tiche pro access)
- [ ] Populate exact Lanza shade codes (need Tiche pro access)
- [ ] Manufacturer outreach
- [ ] Square API integration

## Blockers
| Priority | Blocker | Owner | ETA |
|----------|---------|-------|-----|
| P0 | Tiche needs Davines + Lanza pro portal accounts | Tiche | 2026-05-10 |
| P2 | Square API credentials (need 2FA code from user) | Jason | TBD |

## Next 3 Tasks
1. **[P0]** Test Acaia Pearl BLE connection via demo page — Owner: Jason — ETA: 2026-05-08
2. **[P1]** Populate exact Davines shade codes when Tiche gets pro access — Owner: Tiche — ETA: TBD
3. **[P2]** Build Square API integration for POS connector — Owner: Che — ETA: 2026-05-15

## Team
| Name | Role | Contact |
|------|------|---------|
| Jason Opland | Founder | @jasonopland |
| Tiche | Product/Stylist | Pleij Salon |
| Brooklyn | Deployment | PC3 |
| Che | Developer | PC2 |

## Resources
- Brand Registry: `docs/colorgenius/BRAND-REGISTRY.md`
- Vish Integration: `docs/colorgenius/vish-integration/`
- AR Try-On: `docs/colorgenius/vish-integration/components/ARTryOn.tsx`
- AR Demo: `docs/colorgenius/vish-integration/ar-demo.html`
- Davines Shades: `docs/colorgenius/DAVINES-SHADES.md`
- Lanza Shades: `docs/colorgenius/LANZA-SHADES.md`
- Square Login: hello@pleijsalon.com (2FA enabled)
- Test Page: http://100.64.8.26:8765/test-acaia.html
- AR Demo: http://100.64.8.26:8765/ar-demo.html

## Notes
- Full ecosystem vision: COLORgenius → GetUpLook → Formula Marketplace → ProKyur → ByondEdu
- Square partnership call scheduled (cost-plus pricing negotiated)
- AR Try-On is priority #1 per Jason (May 7)
- Acaia Pearl scale connected to PC2 via Bluetooth (auto-off after 5 min)
