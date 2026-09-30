# BUILD NOTES — Voice Consultation Tier 1

**Branch:** `eiza/voice-consultation-tier1` (from `66d0a16`, main untouched — never merged, never deployed)
**Date:** 2026-09-30 · **Built by:** Eiza build coordinator + 5 worker agents, read-only inspection first
**Design target:** the founder's voice-driven pro consultation vision (photo → detect → auto-populate → voice dictate → formula → iPad at Color Bar)

## Workstream A — Voice-to-field dictation layer (commit `2c7ecee`)
- NEW `dashboard/lib/consultation/field-mapping.ts` (508 lines): FIELD_SCHEMA covering 26 consultation fields keyed to the wizard `fd` state (dotted paths like `condition.grayPercent`); DICTATION_SYSTEM_PROMPT generated from the schema (enum values, spoken aliases, no-guessing rules, current-vs-target disambiguation); DICTATION_JSON_SCHEMA for structured output; validateAndNormalizeUpdates() server-side guard; describeUpdate() for UI chips.
- NEW `dashboard/app/api/consultation/dictate/route.ts`: POST {transcript, currentFields} → gpt-4o-mini structured output (25s timeout, temp 0.2) → {updates, unmatched, billing}. Auth via getUserFromRequest/getSalonIdForUser (same as voice assistant). Empty OPENAI_API_KEY → clean 503 DICTATION_UNAVAILABLE, never a crash. Usage metered into voice_assistant_usage (same monthly Square invoice as the voice assistant).
- NEW `dashboard/components/custom/dictation-widget.tsx`: push-to-talk (Web Speech API, press-and-hold), POSTs transcript, calls onFieldsUpdate(updates) with dotted-key contract, renders green confirmation chips + amber unmapped list. Graceful no-STT fallback.
- Typecheck: clean on all 3 files.
- Left out: mounting into formulate/page.tsx (done by Worker B); feature-flag gating not applied (dictation treated as core Tier-1 flow — needs a decision).

## Workstream B — Handoff fixes + widget mount (commit `ebc1fc2`)
- `dashboard/app/questionnaire/page.tsx`: saveClient() now sends the FULL payload (was silently dropping all hair fields); adds hairProfile/allergies blocks shaped for the clients table.
- `dashboard/app/formulate/page.tsx`: useSearchParams() prefill of fd from URL params (validated against wizard option lists); loadLastConsultation() wired into the client picker (endpoint previously had zero callers); phone photo read-back — fixed generateSessionCode() reading data.code instead of data.data.code (flow was dead), polls GET /api/sessions/{sessionId} for photoUrl and feeds the existing vision-analysis path; DictationWidget mounted in a "Voice dictation" card above the client picker, sharing one applyDottedUpdates() merge helper across dictation/URL/last-consultation.
- Typecheck: clean on both files.
- Left out: POST /api/clients persistence of hairProfile/allergies (done by coordinator, see below).

## Workstream C — Photo persistence + wider auto-population (commit `9c37de5`)
- `dashboard/app/api/vision-analyze/route.ts`: full HairAnalysisResult now written to photo_analyses.results (photo_type 'consultation', client_id linked when clientId in body, data-URI original_url, timing metadata). DB write is try/catch — outage degrades to photoAnalysisId: null, endpoint still 200. Response backward-compatible ({success, analysis} unchanged; autoPopulate + photoAnalysisId additive).
- Auto-population widened from 4 fields: kept currentLevel/currentTone (now mapped to wizard single-letter codes)/grayPercent/porosity (medium→normal), added condition.type (damaged/dry_brittle mappings, omitted when unconfident), condition.hollowEnds (from splitEndDetected), toneFamily passthrough. All field names verified against fd state.
- Typecheck: clean.
- Left out: fd.texture mapping (false semantic bridge — analyzer measures surface, not strand diameter); dryness/shine scores (no fd field; persisted in results JSON); R2 upload (data URI stored instead — one uploadToR2 call could be added later).

## Workstream D — Photo pipeline honesty fixes (commit `e75096e`)
- `dashboard/app/api/sessions/[code]/complete/route.ts`: hardcoded fake stub (level 3, 'warm', 5WR) replaced with explicit 501 Not Implemented + doc comment listing real-implementation steps. No fake values as analysis anywhere.
- `dashboard/prisma/schema.prisma`: doc comments on color_extractions/hair_segmentations/texture_analyses noting zero writers (verified by grep). No tables/migrations touched.
- Typecheck: clean on touched files.
- Left out (not in partition, handled by coordinator): per-section fabrication in photos/[id]/analysis/route.ts; dead colorthief import in lib/photo-analysis.ts.

## Workstream E — Marketplace tiers + storefront (commit `ec8e19f`, 7 files)
- `dashboard/lib/marketplace/creator-tier.ts`: full rewrite to approved spec — trailing-12-full-calendar-month licensed uses as monthly average, ranked by SALES (never likes), thresholds 10/50/150/500, prices 0/2.99/4.99/7.99/9.99, 70/30 split UNCHANGED. Tenure annualization (<12mo → total/months×12). Hysteresis: upgrades immediate, demotions need 2 consecutive sub-threshold months (streak in stylists.preferences.marketplace, idempotent). Anti-gaming: own-use exclusion, 31/mo per-salon cap, refund/chargeback exclusion, 90-day Signature/Elite tenure guardrail. Persisted source of truth: stylists.creator_tier.
- NEW `dashboard/app/api/v1/admin/marketplace/recalc-tiers/route.ts`: admin-gated monthly recalc endpoint (idempotent within calendar month).
- `dashboard/app/api/marketplace/publish/route.ts`: tier computation + GET tiers copy aligned; `dashboard/components/publish-form.tsx`: fixed broken POST body (was sending source_formula_id 'manual' → 404); `dashboard/app/library/page.tsx`: marketplace tab rebuilt with real fields (title, tier badge, per-use price, creator + verified, photo, uses/salons counts), working License/"Add free formula" buttons → POST /api/marketplace/purchase, detail modal, PublishForm mounted in header modal.
- Typecheck: clean on all files.
- Left out: monthly scheduler wiring for the recalc endpoint (needs cron follow-up); Phase 2 percentile model + 2,000-creator trigger + circuit-breakers (Phase 1 is the launch model); refund-status writer (exclusion point live, no writer yet); legacy 80/20 one-time-purchase comment untouched.

## Coordinator fixes (commit `25d8c17`)
- `dashboard/app/api/clients/route.ts`: POST now persists hairProfile→hair_profile and allergies→allergies when present (completes Worker B's questionnaire fix end-to-end).
- `dashboard/app/api/photos/[id]/analysis/route.ts`: per-section roots/mid/ends labeled with estimated:true + honesty comment (fixed multipliers, not sampled regions).
- `dashboard/lib/photo-analysis.ts`: dead colorthief import removed, stale comment corrected.

## Verification
- `npx tsc --noEmit` in dashboard/: **20 errors, all pre-existing in untouched files** (community/share, history, sessions/[code] GET, square sync-cron, user/shades, layout css, .next validator). **0 errors in any workstream file.**
- No migrations run, no services touched, no secrets pasted anywhere. Nothing merged to main, nothing deployed.
- Branch pushed to origin: `eiza/voice-consultation-tier1` (6 commits).

## Deliberately scoped OUT (per plan)
- iPad PWA client (server pairing API exists; no client built)
- Engine unification (TS vs Python — needs founder decision on canonical engine)
- Real per-section hair sampling (labeled as estimated instead)
- Stylist-facing Muse OAuth/skill (Track B — dictation API is the capability it will distribute)
- Production OPENAI_API_KEY (empty as of 2026-09-20 — vision + voice 502 until fixed; blocks any live demo of dictation/vision)
