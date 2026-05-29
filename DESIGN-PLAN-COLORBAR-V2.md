# DESIGN PLAN: Color Bar v2 + Account Types + Feedback System

> **Status:** DRAFT — Ready for Team Review
> **Date:** 2026-05-29
> **Project:** COLORgenius
> **Lead:** Che (Master Orchestrator)

---

## 1. OVERVIEW

We just completed a Supabase schema migration that adds:
- **Account types** on `stylists`: `stylist`, `beta_tester`, `brand_ambassador`, `brand_account`
- **Formula ownership fields**: `brand_id`, `is_official`, `created_by`, `owned_by`, `visibility`, `tier`
- **Color Bar feedback columns**: `feedback_submitted`, `feedback_rating`, `feedback_notes`, `feedback_converted_to_brand`, `feedback_used_for_training`
- **New tables**: `formula_versions`, `training_data_exports`

**This design plan defines the mobile app + web dashboard changes needed to actually USE these new schema features.**

---

## 2. GOALS

### Primary
1. Enable **post-session feedback** in Color Bar (1-5 star rating, notes, conversion)
2. Support **account-type-specific features** (beta tester tools, ambassador conversion)
3. Enable **brand formula ownership** workflow (personal → official)
4. Support **training data export** for ML pipeline

### Non-Goals
- NOT building the ML pipeline itself (just data collection)
- NOT building full brand analytics dashboard (phase 2)
- NOT changing signup flow (account types set manually by admin)

---

## 3. MOBILE APP CHANGES (Color Bar Screen)

### 3.1 Post-Session Feedback Flow

After stylist taps "Complete Mixing", instead of just showing receipt:

```
[Session Complete Screen]
├── Receipt Card (existing)
├── "How accurate was this formula?" 
│   ├── ⭐ ⭐ ⭐ ⭐ ⭐ (1-5 rating)
│   └── [Any notes?] (text input)
├── [Convert to Brand Formula] (brand_ambassador only)
│   └── Confirmation: "This will create an official [Brand] formula"
├── [Send to Training Data] (beta_tester only)
│   └── Toggle: "Include in ML training dataset"
└── [Done] button
```

**New API Call:**
```
POST /api/v1/color-bar/session/:id/feedback
Body: {
  rating: number (1-5),
  notes: string,
  convertedToBrand: boolean,
  sentToTraining: boolean
}
```

### 3.2 Account Type Awareness

On app load, fetch user's account type and store in context:

```typescript
// New hook: useAccountType()
interface AccountTypeContext {
  type: 'stylist' | 'beta_tester' | 'brand_ambassador' | 'brand_account';
  brandId?: string;        // if brand_ambassador or brand_account
  permissions: {
    canConvertToBrand: boolean;     // brand_ambassador
    canSendToTraining: boolean;      // beta_tester
    canManageAmbassadors: boolean;   // brand_account
    canExportTrainingData: boolean;  // brand_account + beta_tester
  }
}
```

**UI Changes by Type:**
- `stylist` — Standard Color Bar (no special buttons)
- `beta_tester` — Shows "Send to Training Data" toggle on feedback
- `brand_ambassador` — Shows "Convert to Brand Formula" button
- `brand_account` — Not using Color Bar (uses web dashboard)

### 3.3 Formula Selection Screen

When browsing formulas for a client:

```
[Formula Selection]
├── [My Formulas] (tab)
│   └── List of stylist's personal formulas
├── [Official [Brand] Formulas] (tab, brand_ambassador only)
│   └── List of brand's official formulas (owned by brand)
└── Search bar
```

**Logic:** If `formula.owned_by === stylist.brand_id`, show "Official" badge.

---

## 4. WEB DASHBOARD CHANGES (Next.js API + Pages)

### 4.1 New API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/color-bar/session/:id/feedback` | POST | Submit post-session feedback | Bearer |
| `/api/v1/color-bar/formula/convert` | POST | Convert personal → brand formula | brand_ambassador |
| `/api/v1/training/export` | POST | Export session data for ML | beta_tester + brand_account |
| `/api/v1/brand/ambassadors` | GET | List brand ambassadors | brand_account |
| `/api/v1/brand/ambassadors` | POST | Invite ambassador | brand_account |
| `/api/v1/brand/analytics` | GET | Usage analytics | brand_account |
| `/api/v1/stylists/me` | GET | Get current stylist (with account_type) | Bearer |

### 4.2 Database Logic

**Feedback Submission:**
```typescript
// In feedback endpoint
await supabaseAdmin
  .from('color_bar_sessions')
  .update({
    feedback_submitted: true,
    feedback_rating: body.rating,
    feedback_notes: body.notes,
    feedback_converted_to_brand: body.convertedToBrand,
    feedback_used_for_training: body.sentToTraining
  })
  .eq('id', sessionId);
```

**Formula Conversion (Brand Ambassador):**
```typescript
// 1. Get original formula
const { data: original } = await supabaseAdmin
  .from('formulas')
  .select('*')
  .eq('id', formulaId)
  .single();

// 2. Create new formula (brand-owned)
const { data: brandFormula } = await supabaseAdmin
  .from('formulas')
  .insert({
    ...original,
    id: undefined, // new UUID
    is_official: true,
    brand_id: ambassador.brand_id,
    owned_by: ambassador.brand_id, // brand owns it
    created_by: stylistId, // ambassador created it
    visibility: 'public',
    tier: 'verified'
  })
  .select()
  .single();

// 3. Log in formula_versions
await supabaseAdmin
  .from('formula_versions')
  .insert({
    original_formula_id: original.id,
    converted_formula_id: brandFormula.id,
    converted_by: stylistId,
    converted_to_brand_id: ambassador.brand_id,
    conversion_confidence: body.confidence || null,
    stylist_notes: body.notes
  });
```

**Training Data Export:**
```typescript
// Collect all feedback_sessions with feedback_used_for_training = true
const { data: sessions } = await supabaseAdmin
  .from('color_bar_sessions')
  .select('*, formulas(*)')
  .eq('feedback_used_for_training', true)
  .eq('status', 'completed');

// Insert into training_data_exports
for (const session of sessions) {
  await supabaseAdmin
    .from('training_data_exports')
    .insert({
      formula_id: session.formula_id,
      color_bar_session_id: session.id,
      brand_id: session.salon_id, // or from formula
      data_type: 'usage_feedback',
      payload: {
        formula: session.formulas,
        steps: session.steps,
        adjustments: session.adjustments,
        rating: session.feedback_rating,
        notes: session.feedback_notes
      },
      batch_id: batchId,
      exported_by: userId
    });
}
```

### 4.3 New Web Pages

| Page | Path | Who | Purpose |
|------|------|-----|---------|
| Brand Dashboard | `/brand/dashboard` | brand_account | Overview of brand formulas, ambassadors, analytics |
| Ambassador Management | `/brand/ambassadors` | brand_account | Invite/remove ambassadors, view their conversions |
| Training Data Export | `/admin/training` | brand_account + beta_tester | Export data batches for ML training |
| Formula Versions | `/formulas/versions` | brand_ambassador | View conversion history |

---

## 5. ACCOUNT TYPE MANAGEMENT

### 5.1 Setting Account Types

**Admin-only** (not self-service):
```typescript
// Admin dashboard or direct SQL
UPDATE stylists SET account_type = 'brand_ambassador', brand_id = '...' WHERE id = '...';
```

### 5.2 Displaying Account Type

- **Mobile app**: Show badge on profile ("Beta Tester", "Brand Ambassador")
- **Web dashboard**: Show in stylist table, filterable

### 5.3 brand_account Users

**brand_account users CAN use Color Bar** — both mobile app and web. They have the same mixing workflow as stylists, plus:
- Access to brand analytics dashboard (web)
- Ability to manage ambassadors (web)
- View all official brand formulas in Color Bar (mobile + web)

**Permissions:**
- `canUseColorBar`: true (all account types)
- `canManageAmbassadors`: brand_account only
- `canViewBrandAnalytics`: brand_account + brand_ambassador (read-only)
- `canExportTrainingData`: brand_account + beta_tester

---

## 6. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Feedback submitted within 5 min of session | 80% of sessions |
| Beta tester data in training exports | 100+ sessions/month |
| Brand ambassador conversions | 10+ official formulas/month |
| Web dashboard page load | <2s |

---

## 7. PHASED IMPLEMENTATION

### Phase 1 (Week 1): Core Feedback
- [ ] Mobile: Post-session feedback UI
- [ ] API: `/feedback` endpoint
- [ ] Verify: feedback saves to Supabase

### Phase 2 (Week 2): Account Types
- [ ] API: `/stylists/me` returns account_type
- [ ] Mobile: Show/hide buttons based on type
- [ ] Admin: Simple page to set account types

### Phase 3 (Week 3): Brand Ambassador Flow
- [ ] Mobile: "Convert to Brand Formula" button
- [ ] API: `/formula/convert` endpoint
- [ ] Web: Brand dashboard v1

### Phase 4 (Week 4): Training Data
- [ ] API: `/training/export` endpoint
- [ ] Web: Training export UI
- [ ] Test: Export batch creates training_data_exports rows

---

## 8. ACCEPTANCE CRITERIA

### Must Have (P0)
- [ ] Stylist can submit 1-5 star rating after Color Bar session
- [ ] Rating saves to `color_bar_sessions.feedback_rating`
- [ ] API returns 200 on feedback submission
- [ ] Mobile shows different buttons based on account_type

### Should Have (P1)
- [ ] Brand ambassador can convert personal formula to official
- [ ] Conversion creates `formula_versions` entry
- [ ] Training data export creates `training_data_exports` rows

### Nice to Have (P2)
- [ ] Brand analytics dashboard with charts
- [ ] Ambassador performance metrics
- [ ] Bulk training data export with CSV download

---

## 9. TRAINING DATA EXPORT DESIGN

### What is training data?

Sessions where stylists opted in (`feedback_used_for_training = true`). Each row contains:
- Formula details (products, shades, ratios)
- Actual measured weights (from Color Bar scale)
- Any adjustments made (from `adjustments` JSONB)
- Outcome rating (from `feedback_rating`)
- Stylist notes (from `feedback_notes`)
- Before/after photos (URLs from `result_photo_url`)

### Where does it go?

**Option A: Export to S3/Cloudflare R2** (recommended)
- Batch export creates structured JSON files
- ML team pulls from cloud storage
- Versioned batches with `batch_id`

**Option B: Direct API to ML pipeline**
- Push to internal ML service endpoint
- Requires ML service to exist (future)

### How does it work?

**Manual export** (Phase 1):
1. Admin/beta_tester goes to `/admin/training` page
2. Selects date range and filters (brand, rating, etc.)
3. Clicks "Export Batch"
4. System creates `training_data_exports` rows with `batch_id`
5. JSON file generated and uploaded to R2
6. Download link provided

**Future: Automated export** (Phase 2):
- Weekly cron job exports new approved sessions
- Automatic upload to ML training pipeline

### Data format

```json
{
  "batch_id": "batch_2025_06_01",
  "exported_at": "2025-06-01T00:00:00Z",
  "sessions": [
    {
      "session_id": "...",
      "formula": {
        "name": "6N + 20vol",
        "steps": [...],
        "adjustments": [...]
      },
      "outcome": {
        "rating": 5,
        "notes": "Perfect match",
        "photo_url": "https://..."
      },
      "stylist": {
        "id": "...",
        "account_type": "beta_tester"
      }
    }
  ]
}
```

---

## 10. OPEN QUESTIONS (ANSWERED)

| Question | Answer | Status |
|----------|--------|--------|
| Should brand_account users see Color Bar? | Yes — all account types can use Color Bar (mobile + web). brand_account gets additional analytics dashboard access. | ✅ Answered |
| Auto-approve or review brand formula conversions? | **Not applicable** — Brand formulas are not "converted". They are created from scratch by brand_ambassadors or brand_accounts as official formulas. Personal formulas remain personal. | ✅ Answered |
| Manual or automatic training data exports? | **Manual first** (Phase 1): Admin/beta_tester clicks export, system generates JSON batch and uploads to R2. **Automatic later** (Phase 2): Weekly cron job. | ✅ Answered |
| Where does training data go? | Cloudflare R2 storage as structured JSON. ML team pulls from there. Each export gets a `batch_id` for versioning. | ✅ Answered |
| Beta tester incentive? | TBD — could be community points, early feature access, or recognition badge. Not blocking Phase 1. | ⏳ Deferred |

---

## 11. FILES TO CREATE / MODIFY

### Mobile App
- `mobile/src/screens/ColorBarScreen.tsx` — ADD feedback UI (post-session)
- `mobile/src/hooks/useAccountType.ts` — NEW (fetch + cache account type)
- `mobile/src/context/AccountTypeContext.tsx` — NEW (global provider)
- `mobile/src/screens/ColorBarScreen.tsx` — MODIFY (add account-type-aware buttons)

### Web Dashboard
- `dashboard/app/api/v1/color-bar/session/[id]/feedback/route.ts` — NEW
- `dashboard/app/api/v1/color-bar/formula/convert/route.ts` — NEW (RENAME: this creates NEW official brand formulas, not conversions)
- `dashboard/app/api/v1/training/export/route.ts` — NEW
- `dashboard/app/api/v1/stylists/me/route.ts` — NEW
- `dashboard/app/api/v1/brand/ambassadors/route.ts` — NEW (GET + POST)
- `dashboard/app/api/v1/brand/analytics/route.ts` — NEW
- `dashboard/app/brand/dashboard/page.tsx` — NEW
- `dashboard/app/brand/ambassadors/page.tsx` — NEW
- `dashboard/app/admin/training/page.tsx` — NEW
- `dashboard/app/admin/account-types/page.tsx` — NEW (admin panel to set account types)

---

### Clarification: Brand Formula Creation (NOT Conversion)

The original spec mentioned "formula conversion" — this is **incorrect terminology**. Here's the actual flow:

**Personal Formula** (owned by stylist) → **remains personal**
**Official Brand Formula** (owned by brand) → **created fresh** by brand_ambassador or brand_account

The `formula_versions` table tracks the *relationship* between a personal formula and an official brand formula that was *inspired by* it, but they are separate records.

**Example:**
- Stylist Sarah creates "Warm Brunette V1" (personal, owned_by = Sarah's ID)
- Brand Ambassador sees it, creates "[Davines] Warm Brunette" (official, owned_by = Davines brand ID)
- `formula_versions` entry links them: original_formula_id = Sarah's V1, converted_formula_id = Davines official

**This is NOT a conversion. It's inspiration + official creation.**

---

## 12. REVISION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-29 | Initial draft |
| 1.1 | 2026-05-29 | Answered open questions, clarified brand formula creation vs conversion, added training data export design |

---

**Ready for review. Please comment, approve, or request changes.**
