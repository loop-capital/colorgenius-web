# MEMORY-COLORGENIUS.md — COLORgenius Team Memory

> **Last updated:** 2026-05-27 (08:40 AM)
> **Identity:** I am COLORgenius 🎨 — AI Hair Color Formulation Platform
> **Workspace:** `/home/jason/.openclaw/workspaces/colorgenius/`

---

## Square Inventory Integration — COMPLETE (May 26, 2026)

**Status:** All 4 steps complete, deployed to staging

### What was built:
1. **Prisma Schema** — 3 new tables: `inventory_items`, `inventory_transactions`, `square_connections`
2. **Square Sync API** — `/api/square/sync` now persists products to database (was in-memory)
3. **Inventory CRUD API** — `GET/POST /api/v1/inventory`, `POST /api/v1/inventory/deduct`, `GET /api/v1/inventory/low-stock`, `GET /api/v1/inventory/reorder-check` — all using database tables
4. **Auto-Deduct** — `lib/inventory/auto-deduct.ts` + `app/api/v1/visits/route.ts` — when visit status = "completed", automatically deducts formula products from inventory + creates audit trail in `inventory_transactions`

### Files changed (4 commits):
- `prisma/schema.prisma` — 3 new models
- `lib/square-multi.ts` — DB-backed connections
- `app/api/square/sync/route.ts` — DB persistence
- `app/api/square/oauth/callback/route.ts` — DB storage
- `app/api/v1/inventory/*` — 4 routes updated
- `app/api/v1/visits/route.ts` — NEW, auto-deduct on completion
- `lib/inventory/auto-deduct.ts` — NEW, deduction logic

### Next Steps:
- [x] Code pushed to GitHub (`git push origin main`)
- [ ] Run `npx prisma migrate dev` to create migration for new tables
- [ ] Deploy to Vercel production (`--prod`)
- [ ] Test with live Square OAuth connection
- [ ] Test auto-deduct flow end-to-end (create visit → mark complete → verify inventory deducted)

**Note:** The 8 AM cron check should report "COMPLETE" and focus on deployment/migration status.

---

## 🚨 CRITICAL: Workspace Isolation
**NEVER contaminate other workspaces. Read ONLY this file for COLORgenius context.**

---

## Gallery Photo Upload System — Full Scope (May 25, 2026)

**Jason reminded:** Gallery photos serve TWO masters:
1. **Stylists** — upload Before/After transformations (build content for GetUpLook)
2. **Consumers** — browse, save to "My Collection", share with their stylist

### What EXISTS (backend):
- `POST /api/v1/gallery/photos/upload` — accepts multipart, stores to R2
  - Fields: formulaId, clientId, before/after files, caption, hairType, porosity, levelBefore, levelAfter, toneBefore, toneAfter, developerVol, processingTime, tags
  - Stores `stylist_id` from auth token (JWT)
  - Saves to `formula_photos` table + `formula_photo_tags`
- `GET /api/v1/gallery/photos` — list with sort (score/recent/featured), filter (brand, level, tags)
- `POST /api/v1/gallery/photos/[id]/vote` — upvote/downvote
- `GET /api/v1/gallery/feed` — public feed

### What's MISSING (mobile + consumer):
1. **Mobile Upload Flow** — CameraScreen currently uploads to `photo_analyses` (analysis pipeline). Need separate flow that:
   - Captures Before/After pair
   - Links to a formula_id (from stylist's library)
   - Tags with technical data (already in schema)
   - Auto-generates consumer-friendly tags
   - Submits to `/api/v1/gallery/photos/upload`

2. **Client Profile / "My Collection"** — Consumers need:
   - Save gallery photos to their profile
   - View saved "looks" they want to try
   - Share saved looks with their stylist (send formula_id + photo)
   - See their own hair history/formulas from their stylist

3. **Auto-Translation Layer** — Technical → Consumer-friendly:
   - "Level 6 to Level 9 with 30Vol developer" → "Brunette to Blonde Transformation"
   - "Ash tone, low porosity" → "Cool Blonde on Healthy Hair"
   - "Balayage technique" → "Sun-Kissed Highlights"
   - Tags: `transformation`, `cool-blonde`, `healthy-hair`, `low-maintenance`, etc.

### Database Schema for Client Collections (needs migration):
```
client_photo_collections:
  - id, client_id (users.id), photo_id (formula_photos.id)
  - saved_at, notes ("Want to try this for my wedding"),
  - shared_with_stylist_id, shared_at
  - status: 'saved' | 'booked' | 'completed' | 'archived'
```

### Priority Order:
1. **Build mobile upload flow** (so beta testers can start populating content)
2. **Build client profile + "My Collection"** (consumer value)
3. **Build auto-translation** (enables consumer search)
4. **Feed into GetUpLook** (public gallery with consumer filters)

### Stylist Upload Fields (Technical):
- Service Type (single-process, balayage, foils, corrective, gloss)
- Brand Used (Wella, Davines, etc.)
- Developer Volume (10Vol, 20Vol, 30Vol, 40Vol)
- Processing Time
- Shade(s) Used (formula_id links to this)
- Hair Level Before/After
- Hair Texture, Porosity, Density
- Chemical History / Sensitivities
- Tags (auto-generated + manual)

### Consumer Search Filters (Friendly):
- **Color Trend**: Cool Blonde, Warm Brunette, Vivid Red, Pastel Fantasy, Silver/Grey
- **Starting Point**: Brown to Blonde, Black to Red, Blonde to Silver, Brunette Enhancement
- **Technique**: Balayage, Highlights, All-Over Color, Color Correction, Gloss/Toner
- **Brand**: Wella, Davines, etc.
- **Level Range**: Dark, Medium, Light, Platinum
- **Time Investment**: Quick Session, Half Day, Full Transformation
- **Damage Level**: Minimal Damage, Some Lightening Required, Major Correction
- **Hair Type**: Fine, Medium, Thick, Coarse
- **Seasonal**: Spring/Summer Brights, Fall Rich Tones, Winter Cool Tones

---

## Camera Upload Auth Integration (May 25, 2026)
- **Problem:** Upload endpoint allowed anonymous uploads — no auth required, no `stylist_id` stored.
- **Fix:**
  1. `dashboard/lib/auth.ts` — Added `verifyBearerToken()` helper to decode/validate JWT from `Authorization: Bearer <token>` header using existing `JWT_SECRET_KEY`.
  2. `dashboard/app/api/photos/upload/route.ts` — Now requires valid Bearer token (returns 401 otherwise). Extracts `userId` from JWT payload and stores it as `stylist_id` in `photo_analyses` record for both presigned-URL and direct-upload modes.
  3. `mobile/src/api/client.ts` —
     - Added `loginBeta()` function that POSTs to `/auth/login` with `beta@colorgenius.co` / `colorgenius`, stores token in AsyncStorage.
     - Added `loginWithCredentials(email, password)` for real-user logins.
     - `uploadPhotoMultipart()` now fetches auth token (falling back to `loginBeta()` if none) and sends `Authorization: Bearer <token>` header.
  4. `mobile/src/screens/CameraScreen.tsx` —
     - Added `useEffect` on mount to ensure auth token is present (falls back to beta login).
     - `handleUpload()` checks token before upload; if missing, attempts beta login and alerts user on failure.
- **Verification:**
  - Mobile `npx tsc --noEmit` ✅ (zero errors)
  - Dashboard `npx tsc --noEmit` — same 9 pre-existing errors (globals.css, Bluetooth types) — no new errors introduced ✅
  - Mobile `npx expo-doctor` ✅ (17/18 checks passed; the 1 failure is pre-existing metro.config.js issue)
- **Auth modes supported:**
  - **Real users** (Tiche, Pleij, Apple Sign In) — token from existing login flow, `stylist_id` = their `users.id` from JWT.
  - **Beta testers** — automatic fallback to `beta@colorgenius.co` / `colorgenius` login if no token present.
- **Next:** Deploy dashboard to Vercel so upload endpoint enforces auth in production.

---

## Camera Upload & Analyze Bug Fix (May 25, 2026)
- **Problem:** `/api/photos/upload` endpoint generated a photo ID and uploaded to R2, but **never saved the record to Prisma**. When the mobile app later called `/api/photos/[id]/analyze`, Prisma couldn't find the photo and analysis failed.
- **Root cause:** Missing `prisma.photo_analyses.create()` call after R2 upload in both presigned-URL and direct-upload modes.
- **Fix:**
  1. `app/api/photos/upload/route.ts` — Added `prisma.photo_analyses.create()` after R2 upload with mapped fields:
     - `id` → photo UUID (generated upfront, returned to client)
     - `photo_type` → `angle` ('roots' | 'mid' | 'ends')
     - `photo_label` → `sessionId` (stored here since schema has no `session_id` column)
     - `original_url` → R2 public URL
     - `file_size_bytes` → file size
     - `format` → file extension
     - `processing_status` → `'pending'`
     - `created_at` → `new Date()`
  2. `app/api/photos/[id]/route.ts` — Replaced stub response with real `prisma.photo_analyses.findUnique()` query so GET photo metadata works.
  3. `analyze/route.ts` error handling was already adequate (404, 409, 502, 500 with JSON messages).
- **Verification:** `npx tsc --noEmit` passes with zero new errors (9 pre-existing errors in unrelated files: `app/layout.tsx` CSS import, `lib/scale/acaia.ts` Bluetooth types).
- **TypeScript:** Clean — no new errors introduced.

## Mobile App Button Fixes (May 24, 2026)
- **Screens fixed:** History, Gallery, Library, Questionnaire (Consultation), Certification, Inventory, Pricing, Subscription, Analyze
- **Fix:** All `TouchableOpacity` cards that had **zero** `onPress` handlers now show feedback: `alert('[feature] - coming in next update!')`
- **CameraScreen:** `pickFromGallery` now uses `ImagePicker.MediaTypeOptions.Images` (expo-image-picker v17) + explicit permission gate
- **AnalyzeScreen:** "Upload from Gallery" now directly opens image picker, uploads photo via `uploadPhoto` API, triggers analysis, then routes to `Formulate` — instead of dead navigation to Camera screen
- **TypeScript:** All screens compile with zero errors
- **SettingsScreen (May 24, 2026):** ALL 9 rows/cards now wired with `onPress` handlers. Profile card, Account, Bluetooth, Connected Devices, Default Brand, Shade Database, Privacy, Permissions, Help Center. Previously ALL of them were dead taps with zero handlers.

## Current Status
### iOS Build (May 23, 2026)
- **Status:** BUILD 10 SUBMITTED ✅
- **Version:** 1.0.1 (Build 10)
- **Build ID:** aac9194f-69dd-4432-995b-2c276de03fa9
- **TestFlight:** Available at appstoreconnect.apple.com/apps/6768502681/testflight/ios
- **Bundle ID:** co.colorgenius.mobile
- **Next:** Monitor App Store review status

### Key Features Live
- Apple Sign In ✅
- Bowl weighing with inventory sync ✅
- Round bowl SVG visualization ✅
- Contextual Education component ✅
- Landing page → Beta page → Formspree ✅

### Blockers
- **Google Sign In:** Waiting for Apple approval first
- **App Store Review:** Typical 1-2 days for new apps

---

## ✅ Gallery Upload + Client Collection — COMPLETED (May 26, 2026)
**Commit:** `6a271de` — `"feat(mobile): gallery upload + client collection"` pushed to `main`

### What Was Built
1. **GalleryUploadScreen.tsx** (~1,000 lines) — Full Before/After capture flow:
   - Step 1: Select formula from library dropdown
   - Step 2: Capture Before + After photos with camera preview
   - Step 3: Add caption, tags, hair condition
   - Step 4: Review + submit via multipart FormData to `/api/v1/gallery/photos/upload`
   - Progress bar upload, success/error handling

2. **ClientCollectionScreen.tsx** (~920 lines) — Consumer "My Collection":
   - Grid view of saved photos (2-column layout)
   - Status filter tabs: All | Saved | Booked | Completed
   - Color-coded status badges
   - Unsave (remove) functionality
   - Notes modal (500 char limit)
   - "Share with Stylist" modal
   - Status changer (saved → booked → completed)
   - Detail modal with full before/after images
   - Mock fallback data for offline testing

3. **InventoryScreen.tsx** (~350 lines) — Rebuilt from placeholder:
   - Real data from `/api/v1/inventory`
   - Stats cards: Total Items | Low Stock | Inventory Value
   - Filter tabs: All | Low | Out of Stock
   - Visual status bars (purple/good, yellow/low, red/out)
   - `+`/`-` buttons for 10g adjustments
   - AsyncStorage caching
   - Low stock alert banner

4. **API Endpoints** — New dashboard routes:
   - `POST /api/v1/gallery/photos/[id]/save` — save to collection
   - `DELETE /api/v1/gallery/photos/[id]/save` — remove from collection
   - `POST /api/v1/gallery/photos/[id]/share` — share with stylist
   - `GET /api/v1/clients/[id]/collection` — get saved photos

5. **Prisma Migration** — `client_photo_collections` model added with:
   - `client_id` + `photo_id` composite unique constraint
   - `notes`, `status` (saved/booked/completed/archived)
   - `shared_with_stylist_id`, `shared_at`
   - Relations to `users` and `formula_photos`

### Verification
- ✅ Mobile `npx tsc --noEmit` — passes cleanly (zero errors)
- ✅ Dashboard `npx tsc --noEmit` — no NEW errors (9 pre-existing: globals.css + Bluetooth types)
- ✅ `npx prisma generate` — schema validates, client generates
- ✅ All 5 files committed and pushed to `main`

### Still Needed
- [ ] Run `npx prisma migrate dev --name add_client_photo_collections` to apply schema to DB
- [ ] Deploy dashboard to Vercel: `cd dashboard && npx vercel --prod`
- [ ] Update GetUpLook web app to consume gallery photos from API (feed public gallery)

---

## Consultation Screen Refactor — COMPLETE (May 27, 2026)

**File:** `mobile/src/screens/QuestionnaireScreen.tsx`

### What Changed
- **Before:** 4-step questionnaire (Client Profile → Current Hair State → Desired Result → Review & Submit) that called `submitFormulation()` directly
- **After:** 3-step **CLIENT INTAKE** form that saves client data and navigates to FormulateScreen

### New 3-Step Flow
1. **Step 1: Client Profile** (unchanged) — name, phone, email, salon notes
2. **Step 2: Hair Characteristics** (expanded) — texture, pattern, density, porosity, gray %, condition types, chemical history, sensitivities, last chemical service
3. **Step 3: Review** (replaces old Step 4) — two action buttons:
   - **"Save Client"** — saves via `createClient()` API, navigates to Dashboard
   - **"Save & Formulate"** — saves client, then navigates to `FormulateScreen` with `autoPopulateData` pre-filled

### Auto-Populate Data Sent to FormulateScreen
```typescript
navigation.navigate('Formulate', {
  clientId: savedClientId,
  clientName: formData.clientName,
  autoPopulateData: {
    texture, hairPattern, density,
    conditionType, porosity, grayPercent,
    chemicalHistory, sensitivities, lastChemicalService,
  }
});
```

### FormulateScreen Already Supports autoPopulateData
- `FormulateScreen.tsx` reads `route.params.autoPopulateData` on mount and spreads it into `INITIAL_STATE`
- All fields match: `texture`, `hairPattern`, `density`, `porosity`, `grayPercent`, `chemicalHistory`, `sensitivities`, `lastChemicalService`
- `conditionType` maps to `condition.type` in FormulateScreen's FormState

### Type Imports Used
All imported from `../types`:
- `TEXTURES`, `HAIR_PATTERNS`, `DENSITIES`, `POROSITY`
- `SENSITIVITIES`, `CHEMICAL_HISTORY_ITEMS`, `LAST_SERVICE_OPTIONS`, `CONDITION_TYPES`
- TypeScript types: `TextureType`, `HairPatternType`, `DensityType`, `Porosity`, `ConditionType`, `LastServiceType`

### API Used
- `createClient()` already existed in `client.ts` — no changes needed

### Verification
- `npx tsc --noEmit --skipLibCheck` ✅ — zero errors in QuestionnaireScreen.tsx
- Only pre-existing error: `App.tsx` "focus" navigation event (unrelated)

---

## Next Actions
1. **Deploy dashboard** — `cd dashboard && npx vercel --prod` to push new API endpoints live
2. **Run Prisma migration** — `npx prisma migrate dev --name add_client_photo_collections`
3. **Update GetUpLook** — wire gallery photos to feed public consumer gallery
4. **Monitor TestFlight** for Build 10
5. **Test new Consultation flow** — create client intake → verify autoPopulateData flows to FormulateScreen

## ⏰ URGENT TODO (14-Day Deadline: June 8, 2026)
**Camera Upload Auth Integration**
- **Status:** ✅ COMPLETED (May 25, 2026)
- Upload endpoint now rejects unauthenticated requests (401)
- Upload endpoint extracts `stylist_id` from auth token and stores it in `photo_analyses`
- Mobile client sends auth token with uploads (falls back to beta account)
- Beta account works for testers; real user accounts still work
- **Files modified:**
  - `dashboard/lib/auth.ts`

---

## Previous Memory (Pre-May 25)

### Mobile App Build
- **Bundle ID:** `co.colorgenius.mobile`
- **Version:** 1.0.1 (Build 10)
- **Status:** Submitted to TestFlight
- **Apple Sign In:** Key ID: 28S7T79YGT, Team ID: 9NR7ZYC94R
- **Google Sign In:** Not yet implemented (waiting for Apple approval)

### Database
- **Schema:** Prisma with PostgreSQL
- **Tables:** formulas, formulations, formulation_components, clients, visits, inventory, photo_analyses, formula_photos, formula_photo_tags, formula_photo_votes, formula_photo_comments, stylist_feedback

### API Endpoints
- `/api/v1/gallery/photos` — List gallery photos
- `/api/v1/gallery/photos/upload` — Upload before/after photos
- `/api/v1/gallery/photos/[id]/vote` — Vote on photos
- `/api/v1/gallery/photos/[id]/comments` — Comments on photos
- `/api/v1/formulas` — CRUD formulas
- `/api/v1/clients` — CRUD clients
- `/api/v1/photos/upload` — Upload photos for analysis (separate from gallery)
- `/api/photos/[id]/analyze` — Analyze uploaded photos

### Integrations
- **Square:** Payment processing (NOT Stripe)
- **R2:** Photo storage
- **Apple Sign In:** ✅ Implemented
- **Google Sign In:** ⏳ Pending Apple approval
- **Phorest:** ⏳ On roadmap (bumped up priority)
- **Vagaro:** ⏳ On roadmap

### Ecosystem
- **COLORgenius:** Stylist-facing (formulation, inventory, client management)
- **GetUpLook:** Consumer-facing (color discovery, salon finder, booking)
- **ByondEdu:** Education marketplace
- **AgentSocial:** AI agent social network (separate)

---

## Formula Management System — COMPLETE (May 27, 2026)

**Status:** All 4 requirements implemented, TypeScript clean

### What Was Built

#### 1. Step 5 "Add Formula" Button (Manual Entry)
**File:** `mobile/src/screens/FormulateScreen.tsx`
- Added third nav button "Add Formula" (pink, with FlaskConical icon) on Step 5 alongside "Back" and "Generate Formula"
- When pressed, renders inline `ManualFormulaForm` with fields:
  - Brand (horizontal chip selector)
  - Product/Shade Code
  - Product Name
  - Grams (numeric)
  - Developer Volume (10/20/30/40vol chips)
  - Processing Time
  - Notes (multiline)
- Supports multiple products ("Add Another Product" button)
- Result lands on Step 6 "Your Formula" page — same as AI output
- All downstream features (save, send to iPad) work identically

#### 2. Save to Library (Step 6 Result Card)
**File:** `mobile/src/screens/FormulateScreen.tsx` (ResultCard component)
- Two save buttons added below formula result:
  - **"Save to My Formulas"** — calls `saveFormulation()` with `isPublic: false`
  - **"List on Marketplace"** — calls `saveFormulation()` with `isPublic: true`
- Uses existing `saveFormulation()` in `src/api/client.ts` (POST `/formulations/save`)
- Shows success alert: "Formula saved to your library!" or "Formula listed on Marketplace!"
- Includes loading state (disables buttons while saving)
- Works for both AI-generated and manually-entered formulas

#### 3. Library Floating "Add Formula" Button
**File:** `mobile/src/screens/LibraryScreen.tsx`
- Added floating action button (FAB) in bottom-right corner (purple circle, `Plus` icon)
- Opens `ManualFormulaEntry` component as a full-screen modal
- `ManualFormulaEntry` (separate file, 690 lines) provides:
  - Formula Name (required)
  - Client Name (optional)
  - Multiple product rows (brand, shade code, name, grams, developer, notes)
  - Add/remove product rows
  - Global developer volume, processing time, application method
  - "Save" and "Save & List" buttons
  - Brand picker overlay with all supported brands
- On save success: modal closes and library list refreshes (`fetchFormulas()`)

#### 4. Formula Picker for Reuse
**New File:** `mobile/src/components/FormulaPicker.tsx` (661 lines)
- Shows saved formulas from `/v1/formulas/list` with search/filter
- Features:
  - Search by name, brand, shade code
  - Brand filter chips
  - Grid/list view toggle
  - "Create New" option → navigates to FormulateScreen
  - Select formula → returns data to parent via `onSelect` callback
- Integrated into:
  - **QuestionnaireScreen.tsx** — "Apply Saved Formula" button on Step 3 (Review)
    - Opens FormulaPicker modal
    - Selected formula navigates to FormulateScreen with `autoPopulateData`
  - **NewServiceScreen.tsx** — "Select Saved Formula" button in selected client section
    - Opens FormulaPicker modal
    - Selected formula navigates to FormulateScreen with `autoPopulateData`

### Files Modified
- `mobile/src/screens/FormulateScreen.tsx` — Step 5 Add Formula button, Step 6 save buttons, ResultCard save logic
- `mobile/src/screens/LibraryScreen.tsx` — FAB, ManualFormulaEntry modal, refresh on save
- `mobile/src/screens/QuestionnaireScreen.tsx` — Apply Formula button, FormulaPicker modal
- `mobile/src/screens/NewServiceScreen.tsx` — Select Formula button, FormulaPicker modal

### Files Created
- `mobile/src/components/FormulaPicker.tsx` — Reusable formula picker (661 lines)
- `mobile/src/components/ManualFormulaEntry.tsx` — Reusable manual entry form (690 lines)

### Verification
- `npx tsc --noEmit --skipLibCheck` ✅ — only pre-existing `App.tsx` "focus" error
- `npx expo-doctor` ✅ — same 17/18 checks (pre-existing metro.config.js issue)
- No new npm packages added — uses existing `lucide-react-native`, React Native Modal
- Dark theme maintained throughout (COLORS object pattern)

### Next Steps
- [ ] Deploy dashboard to Vercel (if new API endpoints needed for formula listing)
- [ ] Test "List on Marketplace" flow end-to-end (save → verify appears in marketplace tab)
- [ ] Test formula picker from QuestionnaireScreen with real formula data
- [ ] Test formula picker from NewServiceScreen with real client + formula combo
- [ ] Consider adding formula editing in Library detail modal (future enhancement)
