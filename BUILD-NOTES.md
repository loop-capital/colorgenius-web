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

## Tier-recalc cron wiring (monthly) — Worker 2, 2026-09-30

- **Endpoint:** `GET`/`POST /api/v1/admin/marketplace/recalc-tiers`
  (`dashboard/app/api/v1/admin/marketplace/recalc-tiers/route.ts`).
- **Scheduling (production):** Vercel Cron via `dashboard/vercel.json`:
  `{ "path": "/api/v1/admin/marketplace/recalc-tiers", "schedule": "0 0 1 * *" }`
  (00:00 UTC on the 1st). `GET` was added because Vercel Cron can only issue
  GET requests; `POST` is retained for admin manual runs.
- **Auth:** platform-admin JWT (`requireAdmin`) **or** `Authorization: Bearer
  <CRON_SECRET>` compared with `crypto.timingSafeEqual` (constant time).
  Documented in `dashboard/.env.example` — generate with `openssl rand
  -base64 32` and set the same value in the Vercel env dashboard (Production).
  If `CRON_SECRET` is empty, only admin JWTs are accepted (fail closed).
  Existing cron routes use plain `!==` comparison for the same secret
  (`formula-billing`, `square/clients/sync-cron`) — drive-by hardening of those
  was left alone, consider aligning in a follow-up.
- **Idempotency:** the trailing window is the 12 full calendar months BEFORE the
  current month, so any re-run within the same calendar month computes identical
  tiers for every creator; the demotion streak is guarded by
  `stylists.preferences.marketplace.last_eval_month` — re-running cannot
  double-count the streak or compound a demotion. The endpoint also no-ops
  unless the UTC day-of-month is 1 (`?force=1` overrides for admin/cron callers).
- **Logging:** console lines (`[tier-recalc] start/skip/…/done`, per-change lines
  only for upgrades/demotions/pending) — captured in Vercel function logs —
  plus full per-creator detail in the JSON response body. No DB log row: there
  is no `cron_runs`/`admin_audit` model in the prisma schema; adding one needs a
  migration (left for migration workstream W3, which owns schema changes).
- **Local fallback — systemd timer on the office box (DOCUMENTED ONLY, NOT
  ENABLED; no persistent state was created on the box):** curls the production
  Vercel URL (the endpoint runs where the DB connection lives). Secrets live in
  a mode-600 curl config file, never in the unit.
  - `/etc/systemd/system/colorgenius-tier-recalc.service`:
    ```
    [Unit]
    Description=COLORgenius monthly creator-tier recalculation (Vercel Cron fallback)
    After=network-online.target
    Wants=network-online.target

    [Service]
    Type=oneshot
    # /etc/colorgenius/tier-recalc.curl (mode 600) contains:
    #   header = "Authorization: Bearer <CRON_SECRET>"
    #   url = "https://<prod-app-url>/api/v1/admin/marketplace/recalc-tiers"
    ExecStart=/usr/bin/curl -fsS --max-time 120 -K /etc/colorgenius/tier-recalc.curl
    ```
  - `/etc/systemd/system/colorgenius-tier-recalc.timer`:
    ```
    [Unit]
    Description=Run COLORgenius tier recalc on the 1st of each month

    [Timer]
    OnCalendar=monthly
    Persistent=true
    Unit=colorgenius-tier-recalc.service

    [Install]
    WantedBy=timers.target
    ```
  - Enablement commands (run once on the box when the fallback is wanted):
    ```
    sudo install -m 600 /dev/null /etc/colorgenius/tier-recalc.curl
    # edit /etc/colorgenius/tier-recalc.curl to set the header and url lines above
    sudo cp colorgenius-tier-recalc.service colorgenius-tier-recalc.timer /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now colorgenius-tier-recalc.timer
    systemctl list-timers | grep tier-recalc
    ```
- Typecheck after changes: `npx tsc --noEmit` in dashboard/ → 20 errors, all
  pre-existing in untouched files (same list as before this work); 0 errors in
  any file touched here.

---

# BUILD NOTES — Transformations Endpoint (AgentSocial × COLORgenius, Direction A)

**Branch:** `eiza/transformations-endpoint` (from `ed3e6b0` main — NEVER merge to main)
**Date:** 2026-09-30 · **Built by:** Eiza
**Specs:** `~/workspace/product/transformations-endpoint-spec.md` (endpoint) +
`~/workspace/user/files/agentsocial-colorgenius-integration-spec.md` (seam, Sienna)

## What was built

- **Prisma model `transformations`** (dashboard/prisma/schema.prisma): id uuid PK,
  stylist_id → stylists, status ('draft'|'enriched'|'published', validated in code),
  source_formula_id → formula_listings (nullable), formulation_id → formulations,
  before_photo_ref (required), after_photo_ref (nullable), shade_story (text),
  shades (Json), client_consent (Json, shape per spec), published_post_ref,
  created_at/enriched_at/published_at. Back-relations added to stylists,
  formulations, formula_listings.
- **Migration `20260930_add_transformations`** — hand-written SQL (CREATE TABLE IF
  NOT EXISTS + 4 indexes), applied via genuine `prisma migrate deploy` against
  live Supabase through a CONNECT tunnel (office box can't reach Supabase IPv6
  directly; ran from a localhost forward). Verified in information_schema +
  `_prisma_migrations`. Pre-existing state confirmed first:
  `20260930_add_missing_columns` was the last common migration.
- **API routes** (dashboard/app/api/v1/transformations/):
  - `POST /` — create draft (formulation_id + before_photo_ref required; formulation
    must belong to the stylist; source_formula_id validated when given).
  - `GET /` — list with ?status=&formula_id=&stylist_id= + pagination. Visibility:
    own (any status) + published. Non-owners never see client_consent.
  - `GET /:id` — read; **returns short-lived (15 min) signed R2 URLs**
    (before_photo_url/after_photo_url) per seam §3.1.
  - `PATCH /:id` — enrich (after_photo_ref, shade_story, shades, source_formula_id,
    client_consent, published_post_ref); draft→enriched when after photo present.
    On published records only published_post_ref may change (seam §3.2).
  - `POST /:id/publish` — **hard 422 CONSENT_REQUIRED without a marketing consent
    record** (the bright line, in code); 422 AFTER_PHOTO_REQUIRED without after
    photo; **idempotent** — republish returns the record, updates post ref, never
    409/duplicate (founder note + seam §3.2).
- **Auth** (dashboard/lib/transformation-auth.ts): session/JWT (existing
  getUserFromRequest + getOrCreateStylistForUser) OR per-stylist API token
  (`Authorization: Bearer`). Tokens reuse the existing **`api_keys`** table
  (owner_type='stylist', sha256 key_hash, scopes) — no new table needed.
  `POST/GET /api/v1/auth/tokens` (issue — session only, no privilege escalation;
  plaintext returned ONCE), `DELETE /api/v1/auth/tokens/:id` (revoke). Scopes:
  `transformations:write` (read+write) / `transformations:read`; write routes
  require the write scope. OAuth `transformations:write` (Track B) plugs into the
  same check later.
- **Draft auto-creation**: `POST /api/formulations/save` now creates a
  transformation draft (best-effort, never breaks the save; skips when no photoUrl;
  idempotent per formulation; prefers the formulation's own stylist_id when it
  resolves).
- **lib/r2.ts**: added `getPresignedDownloadUrl` (GetObject signed URLs) +
  `extractR2Key` (normalizes full-URL or bare-key refs).

## Verification
- `npx prisma validate` OK · `npx tsc --noEmit` 0 errors · `npm run build` passes.
- Full E2E on :3101 with throwaway stylist identities (minted JWT): **34/34 PASS** —
  create/enrich/publish loop, 422 consent + after-photo gates, idempotent republish,
  IMMUTABLE_AFTER_PUBLISH, post-ref patch on published, token issue/use/revoke,
  draft auto-create via formulations/save. **Zero residue** (all throwaway rows deleted).

## Deviations / notes
- Reused existing `api_keys` table instead of a new `api_tokens` table (it was
  schema-only, zero writers — built the first issuance/verification around it;
  scopes column already supports the Track B model).
- `api_keys` has no `name` column — token list shows key_prefix/scopes/usage instead.
  Add a name column in a later migration if wanted.
- Consent `attested_by`/`attested_at` default to the calling stylist / now when omitted.
- Pre-existing: `JWT_SECRET` is not set in dashboard/.env (auth falls back to the
  hardcoded dev secret — worth setting a real one before beta).
- Pre-existing drift (untouched): DB has migration `20260514040000_add_formula_gallery`
  not present in local prisma/migrations history.
