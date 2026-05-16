# ADR-014: Client Profile Integration

## Status
Proposed

## Context

ColorGenius collects rich hair state data during every formulation — texture, density, porosity, hair pattern, chemical history, sensitivities, and condition observations. Currently this data exists only as transient `FormulationInput` values that are discarded after the formula is generated. When a returning client arrives for their next appointment, the colorist must re-enter everything from scratch: "Is she the one with the henna? The fine hair with low porosity? The PPD allergy?"

The `clients` table already has a `hair_profile` JSON field with a minimal default structure, but it only stores `density`, `texture`, `porosity`, `natural_tone`, `natural_level`, and `scalp_condition`. It does not capture the full hair state needed for formulation auto-fill, nor does the app have a mechanism to write formulation-derived observations back into the profile.

The client-facing portal (`/c/[token]/page.tsx`) displays a color history gallery and maintenance tips, but provides no visual preview of how the current color will fade over the next 4–6 weeks. ADR-013 defined the `FadePreviewSwatch` component for the colorist-facing results page; this ADR extends that concept to the client portal as a trust-building feature.

This ADR specifies:
1. The expanded `hairProfile` JSON schema for persistent client hair state.
2. The auto-fill mechanism that populates the formulate form from a stored profile.
3. The write-back mechanism that saves new observations from each formulation into the profile.
4. The client card display in the client detail view.
5. The fade preview integration in the client-facing portal.

---

## Decision

We will expand the `hair_profile` JSON schema to a full `HairProfile` type that covers all formulation inputs. We will implement an auto-fill system on the formulate page: when a colorist selects a returning client, the form pre-populates from the stored profile. After a successful formulation, new fields from the chemical history step (step 3) and condition step (step 5) will be merged back into the profile. The client detail view will render the profile as a structured card. The client portal will display a fade preview swatch using the same computation model as ADR-013.

---

## 1. Data Model

### 1.1 Expanded `hairProfile` JSON Schema

The Prisma `hair_profile` column remains `Json?`. The default value in the schema migration will be updated to include the new fields with `null` defaults.

```typescript
// dashboard/lib/client-profile.ts

export type HairTexture = 'fine' | 'medium' | 'coarse';
export type HairPattern = 'straight' | 'wavy' | 'curly' | 'coily';
export type HairDensity = 'thin' | 'medium' | 'thick';
export type HairPorosity = 'low' | 'normal' | 'high';
export type LastServiceOption =
  | 'this_week'
  | '1-2_weeks'
  | '3-4_weeks'
  | '1-3_months'
  | '3-6_months'
  | '6+_months'
  | 'never';

export interface ChemicalHistorySnapshot {
  boxDye: boolean;
  metallicSalts: boolean;
  henna: boolean;
  keratinTreatment: boolean;
  relaxer: boolean;
  lastService: LastServiceOption;
  hardWater: boolean;
  medicationBuildup: boolean;
  lastServiceType?: string;        // e.g. "full_head", "retouch", "balayage"
  lastServiceDate?: string;        // ISO date string
}

export interface SensitivitySnapshot {
  ppdAllergy: boolean;
  ammoniaSensitivity: boolean;
  fragranceSensitivity: boolean;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  activeChemo: boolean;
  other: string[];                 // Free-form tags e.g. ["gluten", "nut allergy"]
}

export interface HairProfile {
  // Physical characteristics
  texture: HairTexture | null;
  hairPattern: HairPattern | null;
  density: HairDensity | null;
  porosity: HairPorosity | null;
  naturalLevel: number | null;     // 1–10
  naturalTone: string | null;
  scalpCondition: 'normal' | 'dry' | 'oily' | 'sensitive' | 'irritated' | null;

  // Chemical & service history
  chemicalHistory: ChemicalHistorySnapshot | null;

  // Sensitivities & contraindications
  sensitivities: SensitivitySnapshot | null;

  // Formulation-derived observations (auto-populated from last visit)
  lastObservedLevel: number | null;
  lastObservedTone: string | null;
  lastObservedCondition: string | null;   // e.g. "previously_colored", "damaged"
  lastServiceDate: string | null;         // ISO date of last ColorGenius formulation
  lastFormulaId: string | null;          // UUID of last formula for deep-linking

  // Colorist notes
  notes: string;

  // Metadata
  updatedAt: string;                     // ISO timestamp
  updatedBy: string | null;              // stylist ID or "auto"
}
```

**Migration default:**

```prisma
// dashboard/prisma/schema.prisma (relevant line only)
  hair_profile        Json?                    @default("{\"texture\": null, \"hairPattern\": null, \"density\": null, \"porosity\": \"normal\", \"naturalLevel\": null, \"naturalTone\": null, \"scalpCondition\": \"normal\", \"chemicalHistory\": null, \"sensitivities\": null, \"lastObservedLevel\": null, \"lastObservedTone\": null, \"lastObservedCondition\": null, \"lastServiceDate\": null, \"lastFormulaId\": null, \"notes\": \"\", \"updatedAt\": \"\", \"updatedBy\": null}")
```

> Note: A proper Prisma migration will apply the new default. Existing rows with the old default will be lazily upgraded when first written back to.

### 1.2 Validation & Defaults

```typescript
// dashboard/lib/client-profile.ts

export function normalizeHairProfile(raw: unknown): HairProfile {
  const defaults: HairProfile = {
    texture: null,
    hairPattern: null,
    density: null,
    porosity: 'normal',
    naturalLevel: null,
    naturalTone: null,
    scalpCondition: 'normal',
    chemicalHistory: null,
    sensitivities: null,
    lastObservedLevel: null,
    lastObservedTone: null,
    lastObservedCondition: null,
    lastServiceDate: null,
    lastFormulaId: null,
    notes: '',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  };

  if (!raw || typeof raw !== 'object') return defaults;
  const r = raw as Record<string, unknown>;

  return {
    texture: isTexture(r.texture) ? r.texture : defaults.texture,
    hairPattern: isPattern(r.hairPattern) ? r.hairPattern : defaults.hairPattern,
    density: isDensity(r.density) ? r.density : defaults.density,
    porosity: isPorosity(r.porosity) ? r.porosity : defaults.porosity,
    naturalLevel: typeof r.naturalLevel === 'number' ? clampLevel(r.naturalLevel) : defaults.naturalLevel,
    naturalTone: typeof r.naturalTone === 'string' ? r.naturalTone : defaults.naturalTone,
    scalpCondition: isScalp(r.scalpCondition) ? r.scalpCondition : defaults.scalpCondition,
    chemicalHistory: isChemicalHistory(r.chemicalHistory) ? r.chemicalHistory : defaults.chemicalHistory,
    sensitivities: isSensitivities(r.sensitivities) ? r.sensitivities : defaults.sensitivities,
    lastObservedLevel: typeof r.lastObservedLevel === 'number' ? clampLevel(r.lastObservedLevel) : defaults.lastObservedLevel,
    lastObservedTone: typeof r.lastObservedTone === 'string' ? r.lastObservedTone : defaults.lastObservedTone,
    lastObservedCondition: typeof r.lastObservedCondition === 'string' ? r.lastObservedCondition : defaults.lastObservedCondition,
    lastServiceDate: typeof r.lastServiceDate === 'string' ? r.lastServiceDate : defaults.lastServiceDate,
    lastFormulaId: typeof r.lastFormulaId === 'string' ? r.lastFormulaId : defaults.lastFormulaId,
    notes: typeof r.notes === 'string' ? r.notes : defaults.notes,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : defaults.updatedAt,
    updatedBy: typeof r.updatedBy === 'string' ? r.updatedBy : defaults.updatedBy,
  };
}

// Type guards (abbreviated)
function isTexture(v: unknown): v is HairTexture {
  return v === 'fine' || v === 'medium' || v === 'coarse';
}
function isPattern(v: unknown): v is HairPattern {
  return v === 'straight' || v === 'wavy' || v === 'curly' || v === 'coily';
}
function isDensity(v: unknown): v is HairDensity {
  return v === 'thin' || v === 'medium' || v === 'thick';
}
function isPorosity(v: unknown): v is HairPorosity {
  return v === 'low' || v === 'normal' || v === 'high';
}
function isScalp(v: unknown): v is HairProfile['scalpCondition'] {
  return v === 'normal' || v === 'dry' || v === 'oily' || v === 'sensitive' || v === 'irritated' || v === null;
}
function clampLevel(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}
function isChemicalHistory(v: unknown): v is ChemicalHistorySnapshot {
  return v !== null && typeof v === 'object' && typeof (v as any).boxDye === 'boolean';
}
function isSensitivities(v: unknown): v is SensitivitySnapshot {
  return v !== null && typeof v === 'object' && typeof (v as any).ppdAllergy === 'boolean';
}
```

---

## 2. Auto-Fill Mechanism

### 2.1 Client Selector on Formulate Page

The formulate page (`dashboard/app/formulate/page.tsx`) will add a client selector at the top of the form (Step 1, before hair state entry). When a client is selected:

1. Fetch the full client record via `/api/clients?id=<clientId>`.
2. Call `normalizeHairProfile(client.hair_profile)`.
3. Map `HairProfile` fields into the form state object.

```typescript
// dashboard/lib/client-profile.ts

export interface FormState {
  clientId?: string;
  texture: HairTexture | '';
  hairPattern: HairPattern | '';
  density: HairDensity | '';
  porosity: HairPorosity | '';
  currentLevel: number;
  currentTone: string;
  targetLevel: number;
  targetTone: string;
  condition: HairCondition;
  chemicalHistory: ChemicalHistory | null;
  sensitivityFlags: SensitivityFlags | null;
  serviceType: string;
  brandPreference: string;
  linePreference: string;
}

export function profileToFormState(profile: HairProfile): Partial<FormState> {
  const state: Partial<FormState> = {};

  if (profile.texture) state.texture = profile.texture;
  if (profile.hairPattern) state.hairPattern = profile.hairPattern;
  if (profile.density) state.density = profile.density;
  if (profile.porosity) {
    // Map profile porosity to condition.porosity
    state.porosity = profile.porosity;
  }
  if (profile.naturalLevel) state.currentLevel = profile.naturalLevel;
  if (profile.naturalTone) state.currentTone = profile.naturalTone;

  if (profile.chemicalHistory) {
    state.chemicalHistory = {
      boxDye: profile.chemicalHistory.boxDye,
      metallicSalts: profile.chemicalHistory.metallicSalts,
      henna: profile.chemicalHistory.henna,
      keratinTreatment: profile.chemicalHistory.keratinTreatment,
      relaxer: profile.chemicalHistory.relaxer,
      lastService: profile.chemicalHistory.lastService,
      hardWater: profile.chemicalHistory.hardWater,
      medicationBuildup: profile.chemicalHistory.medicationBuildup,
    };
  }

  if (profile.sensitivities) {
    state.sensitivityFlags = {
      ppdAllergy: profile.sensitivities.ppdAllergy,
      isPregnant: profile.sensitivities.isPregnant,
      isBreastfeeding: profile.sensitivities.isBreastfeeding,
      activeChemo: profile.sensitivities.activeChemo,
    };
  }

  return state;
}
```

### 2.2 UI Behavior

**Client selector component:**
- A searchable combobox (reuse existing `ProductSearch` pattern) that queries `/api/clients?search=<query>`.
- Shows client name + last visit date + profile completeness badge.
- "New client" option clears all form fields and bypasses auto-fill.

**Profile completeness indicator:**
- After auto-fill, a small pill shows `"Profile 7/12 fields filled"`.
- Missing fields are visually flagged with a subtle yellow dot on the step indicator.

**Override warning:**
- If the colorist changes any auto-filled field, a toast appears: `"Profile will be updated with new observations on save."`
- The changed fields are tracked in a `Set<string>` of dirty keys.

### 2.3 API Route for Client Search

```typescript
// dashboard/app/api/clients/search/route.ts (new file)
// GET /api/clients/search?q=<query>&limit=10
// Returns: { clients: Array<{ id, name, lastVisit, profileCompleteness }> }
```

---

## 3. Write-Back Mechanism

### 3.1 When to Write Back

After a formulation is submitted and a `FormulationResult` is returned (Step 6 / Results), the app automatically merges new observations into the client's `hair_profile`. This happens **only** when:
1. A client was selected (not "new client").
2. The formulation succeeded (no hard stops, or user explicitly overrides).
3. The user clicks `"Save Formula & Update Profile"` (dual-action button on results page).

### 3.2 Merge Strategy

```typescript
// dashboard/lib/client-profile.ts

export function mergeProfileFromFormulation(
  existing: HairProfile,
  input: FormulationInput,
  result: FormulationResult,
  stylistId: string
): HairProfile {
  const now = new Date().toISOString();

  return {
    ...existing,
    // Physical characteristics — only update if explicitly provided in this session
    texture: input.texture ?? existing.texture,
    hairPattern: input.hairType ?? existing.hairPattern,
    density: input.density ?? existing.density,
    porosity: input.condition.porosity ?? existing.porosity,

    // Chemical history — always overwrite with latest reported values
    chemicalHistory: input.chemicalHistory
      ? {
          boxDye: input.chemicalHistory.boxDye,
          metallicSalts: input.chemicalHistory.metallicSalts,
          henna: input.chemicalHistory.henna,
          keratinTreatment: input.chemicalHistory.keratinTreatment,
          relaxer: input.chemicalHistory.relaxer,
          lastService: input.chemicalHistory.lastService,
          hardWater: input.chemicalHistory.hardWater,
          medicationBuildup: input.chemicalHistory.medicationBuildup,
          lastServiceType: input.serviceType ?? existing.chemicalHistory?.lastServiceType,
          lastServiceDate: now,
        }
      : existing.chemicalHistory,

    // Sensitivities — merge, never remove existing flags
    sensitivities: existing.sensitivities || input.sensitivityFlags
      ? {
          ppdAllergy: existing.sensitivities?.ppdAllergy || input.sensitivityFlags?.ppdAllergy || false,
          ammoniaSensitivity: existing.sensitivities?.ammoniaSensitivity || false,
          fragranceSensitivity: existing.sensitivities?.fragranceSensitivity || false,
          isPregnant: input.sensitivityFlags?.isPregnant ?? existing.sensitivities?.isPregnant ?? false,
          isBreastfeeding: input.sensitivityFlags?.isBreastfeeding ?? existing.sensitivities?.isBreastfeeding ?? false,
          activeChemo: existing.sensitivities?.activeChemo || input.sensitivityFlags?.activeChemo || false,
          other: existing.sensitivities?.other || [],
        }
      : null,

    // Observations from this formulation
    lastObservedLevel: input.currentLevel,
    lastObservedTone: input.currentTone,
    lastObservedCondition: input.condition.type,
    lastServiceDate: now,
    lastFormulaId: result.formulaId ?? null,   // if result carries formulaId

    // Metadata
    updatedAt: now,
    updatedBy: stylistId,
  };
}
```

### 3.3 API Endpoint

```typescript
// dashboard/app/api/clients/[id]/profile/route.ts (new file)
// PATCH /api/clients/<id>/profile
// Body: { hairProfile: HairProfile }
// Auth: Requires stylist or admin role for the client's salon.
```

---

## 4. Client Card Display

### 4.1 Client Detail View (`/clients/[id]`)

A new card section on the client detail page renders the structured hair profile. Inserted below the client header, above the formula history.

```tsx
// dashboard/components/client/HairProfileCard.tsx (new)

interface HairProfileCardProps {
  profile: HairProfile;
  onEdit?: () => void;
}

export function HairProfileCard({ profile, onEdit }: HairProfileCardProps) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(30,30,45,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Heart size={14} className="text-[#EC4899]" />
          Hair Profile
        </h3>
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-[#9333EA] hover:text-[#A855F7] transition-colors">
            Edit
          </button>
        )}
      </div>

      {/* Hair Characteristics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <ProfileField label="Texture" value={profile.texture} />
        <ProfileField label="Pattern" value={profile.hairPattern} />
        <ProfileField label="Density" value={profile.density} />
        <ProfileField label="Porosity" value={profile.porosity} />
        <ProfileField label="Natural Level" value={profile.naturalLevel ? `Level ${profile.naturalLevel}` : null} />
        <ProfileField label="Natural Tone" value={profile.naturalTone} />
        <ProfileField label="Scalp" value={profile.scalpCondition} span={2} />
      </div>

      {/* Chemical History */}
      {profile.chemicalHistory && (
        <div className="mb-4">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">Chemical History</h4>
          <div className="flex flex-wrap gap-2">
            {profile.chemicalHistory.boxDye && <HistoryBadge label="Box Dye" danger />}
            {profile.chemicalHistory.metallicSalts && <HistoryBadge label="Metallic Salts" danger />}
            {profile.chemicalHistory.henna && <HistoryBadge label="Henna" danger />}
            {profile.chemicalHistory.keratinTreatment && <HistoryBadge label="Keratin" warning />}
            {profile.chemicalHistory.relaxer && <HistoryBadge label="Relaxer" warning />}
            {profile.chemicalHistory.hardWater && <HistoryBadge label="Hard Water" neutral />}
            {profile.chemicalHistory.medicationBuildup && <HistoryBadge label="Med Buildup" neutral />}
            <HistoryBadge label={`Last: ${formatLastService(profile.chemicalHistory.lastService)}`} neutral />
          </div>
        </div>
      )}

      {/* Sensitivities */}
      {profile.sensitivities && hasAnySensitivity(profile.sensitivities) && (
        <div className="mb-4">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">Sensitivities</h4>
          <div className="flex flex-wrap gap-2">
            {profile.sensitivities.ppdAllergy && <SensitivityBadge label="PPD Allergy" />}
            {profile.sensitivities.ammoniaSensitivity && <SensitivityBadge label="Ammonia" />}
            {profile.sensitivities.fragranceSensitivity && <SensitivityBadge label="Fragrance" />}
            {profile.sensitivities.isPregnant && <SensitivityBadge label="Pregnant" />}
            {profile.sensitivities.isBreastfeeding && <SensitivityBadge label="Breastfeeding" />}
            {profile.sensitivities.activeChemo && <SensitivityBadge label="Active Chemo" danger />}
            {profile.sensitivities.other?.map(o => <SensitivityBadge key={o} label={o} />)}
          </div>
        </div>
      )}

      {/* Last Observed */}
      {(profile.lastObservedLevel || profile.lastObservedTone) && (
        <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[11px] text-white/30">
            Last formulated: {profile.lastServiceDate ? new Date(profile.lastServiceDate).toLocaleDateString() : 'Unknown'}
            {profile.lastObservedLevel && ` · Level ${profile.lastObservedLevel}`}
            {profile.lastObservedTone && ` ${profile.lastObservedTone}`}
          </p>
        </div>
      )}

      {profile.notes && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 italic">"{profile.notes}"</p>
        </div>
      )}
    </div>
  );
}

// Sub-components
function ProfileField({ label, value, span = 1 }: { label: string; value: string | number | null; span?: number }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={span > 1 ? `col-span-${span}` : ''}>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">{label}</p>
      <p className="text-sm text-white/80 capitalize">{value}</p>
    </div>
  );
}

function HistoryBadge({ label, danger, warning, neutral }: { label: string; danger?: boolean; warning?: boolean; neutral?: boolean }) {
  const colors = danger
    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
    : warning
    ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20'
    : 'bg-white/5 text-white/50 border-white/10';
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors}`}>{label}</span>;
}

function SensitivityBadge({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${danger ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/20'}`}>
      {label}
    </span>
  );
}

function formatLastService(s: LastServiceOption | undefined): string {
  if (!s) return 'Unknown';
  return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function hasAnySensitivity(s: SensitivitySnapshot): boolean {
  return s.ppdAllergy || s.ammoniaSensitivity || s.fragranceSensitivity || s.isPregnant || s.isBreastfeeding || s.activeChemo || (s.other?.length > 0);
}
```

### 4.2 Inline Edit Mode

When the colorist clicks "Edit" on the HairProfileCard, a modal form opens with the same fields as the formulate form's steps 1–3. Changes are saved via the PATCH endpoint. This allows updating the profile without running a full formulation.

---

## 5. Fade Preview Integration (Client Portal)

### 5.1 Data Flow

The client portal (`dashboard/app/c/[token]/page.tsx`) already fetches `PortalData` from `/api/v1/portal/<token>`. We extend the API response to include the fade preview computed from the **most recent formula**.

```typescript
// Extended PortalData interface
interface PortalData {
  // ... existing fields ...
  fadePreview: {
    level: number;
    tone: string;
    hex: string;
    message: string;
  } | null;
}
```

### 5.2 Server-Side Computation

The API route computes the fade preview using the same logic as ADR-013's `computeFadePreview()`:

```typescript
// Server-side pseudo-code in the portal API route
function computeFadePreviewForPortal(lastFormula: FormulaEntry) {
  const input = lastFormula.formulation;
  const fadeLevel = Math.max(1, (input.targetLevel ?? input.currentLevel) - 1);
  const fadeTone = FADE_TONE_SHIFT[input.targetTone] || input.targetTone;
  const fadeHex = blendColor(
    HAIR_LEVELS[fadeLevel]?.hex || '#7D5038',
    TONES[fadeTone]?.hex || HAIR_LEVELS[fadeLevel]?.hex || '#9C8B7A',
    0.30
  );

  return {
    level: fadeLevel,
    tone: fadeTone,
    hex: fadeHex,
    message: `In 4–6 weeks, your color will likely settle to a ${getLevelName(fadeLevel)} ${fadeTone} tone.`,
  };
}
```

### 5.3 Client Portal UI

Insert the fade preview swatch into the portal's color history section, directly below the latest "After" photo card.

```tsx
// Inside ClientPortalPage, below the latest photo card

{data.fadePreview && (
  <motion.div
    className="rounded-2xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
  >
    <div className="p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Palette size={12} className="text-[#F59E0B]" />
        <h2 className="text-xs uppercase tracking-wider font-semibold text-white/30">Expected Fade</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Fade swatch */}
        <div
          className="w-20 h-20 rounded-2xl flex-shrink-0"
          style={{ backgroundColor: data.fadePreview.hex }}
          aria-label={`Fade preview: Level ${data.fadePreview.level} ${data.fadePreview.tone}`}
        />

        <div>
          <p className="text-sm font-medium text-white mb-1">
            Level {data.fadePreview.level} — {data.fadePreview.tone.charAt(0).toUpperCase() + data.fadePreview.tone.slice(1)}
          </p>
          <p className="text-xs text-white/50">{data.fadePreview.message}</p>
          <p className="text-[10px] text-white/30 mt-1">Based on your last service · {new Date(data.photos[0]?.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

### 5.4 Styling Rules

- Swatch size: 80×80px on mobile, 120×120px on tablet+.
- Same dark theme as the rest of the portal: `background: 'rgba(30,30,45,0.6)'`, border `rgba(255,255,255,0.06)`.
- Text hierarchy: level/tone in `text-white` (primary), message in `text-white/50` (secondary), date in `text-white/30` (muted).

---

## 6. File Paths

| Purpose | Path |
|---|---|
| HairProfile types & helpers | `dashboard/lib/client-profile.ts` (new) |
| Prisma schema | `dashboard/prisma/schema.prisma` (update `hair_profile` default) |
| Client search API | `dashboard/app/api/clients/search/route.ts` (new) |
| Profile update API | `dashboard/app/api/clients/[id]/profile/route.ts` (new) |
| Hair profile card | `dashboard/components/client/HairProfileCard.tsx` (new) |
| Client detail page | `dashboard/app/clients/[id]/page.tsx` (integrate card) |
| Formulate page | `dashboard/app/formulate/page.tsx` (add client selector + auto-fill) |
| Client portal page | `dashboard/app/c/[token]/page.tsx` (add fade preview) |
| Portal API route | `packages/api/src/routes/portal.ts` (extend response with fadePreview) |

---

## 7. Testing Checklist

| Test | Expected |
|---|---|
| Select returning client with full profile | Form auto-fills all 7 profile fields |
| Select returning client with partial profile | Only available fields fill; missing fields show yellow dot |
| Change auto-filled field | Dirty tracking triggers override toast |
| Save formula with client selected | PATCH `/api/clients/<id>/profile` called with merged data |
| Client detail page renders card | HairProfileCard visible with all sections |
| Chemical history badges | Danger/warning/neutral colors match severity |
| Sensitivity badges | PPD shows purple badge, active chemo shows red |
| Edit profile inline | Modal opens, saves via PATCH, card re-renders |
| Portal with no formulas | Fade preview section hidden |
| Portal with recent formula | Fade preview swatch renders with correct hex |
| Fade level for target 8 | Shows level 7 |
| Fade tone for ash | Shifts to neutral |
| Mobile viewport | Profile card stacks 2-col → 1-col; swatch shrinks to 80px |
| Invalid JSON in `hair_profile` | `normalizeHairProfile` returns safe defaults, no crash |

---

## 8. Related Documents

- ADR-012: Chemical History & Safety Intelligence — `chemicalHistory` and `sensitivityFlags` data model
- ADR-013: Visual Outcome Simulator — `computeFadePreview`, `blendColor`, `FADE_TONE_SHIFT`
- `dashboard/lib/formulation.ts` — `FormulationInput`, `FormulationResult`, `HairCondition`
- `dashboard/prisma/schema.prisma` — `clients` table definition
- `dashboard/app/clients/[id]/page.tsx` — Client detail view
- `dashboard/app/c/[token]/page.tsx` — Client-facing portal

## Next Steps

1. **Create `dashboard/lib/client-profile.ts`** with types, validation, and merge logic.
2. **Update Prisma schema** with new `hair_profile` default and run migration.
3. **Add `/api/clients/search` route** for typeahead client selector.
4. **Add `/api/clients/[id]/profile` PATCH route** for profile updates.
5. **Build `HairProfileCard` component** and integrate into client detail page.
6. **Add client selector to formulate page** (Step 1) with auto-fill wiring.
7. **Implement write-back** on "Save Formula & Update Profile" button in results.
8. **Extend portal API** to compute and return `fadePreview`.
9. **Add fade preview UI** to client portal page.
10. **Write unit tests** for `normalizeHairProfile`, `mergeProfileFromFormulation`, and `profileToFormState`.
