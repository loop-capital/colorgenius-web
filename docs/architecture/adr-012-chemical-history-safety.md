# ADR-012: Chemical History & Safety Intelligence in the Formulation Engine

## Status
Proposed

## Context
ColorGenius has two formulation engines (TypeScript client-side, Python server-side) and a Fastify API route bridging them. The UI already collects chemical history data in the multi-step form (`dashboard/app/formulate/page.tsx`), but the engines do not yet consume this data. This ADR specifies exactly how chemical history and sensitivity flags flow through the system, what hard stops and warnings are triggered, how confidence is adjusted, and how natural-language assessments are generated.

## Decision

We will integrate `ChemicalHistory` and `SensitivityFlags` into both engines with a unified safety layer. The TypeScript engine (client-side, `dashboard/lib/formulation.ts`) and the Python engine (server-side, `packages/engine/src/colorgenius/engine/formulation/engine.py`) will each implement identical hard-stop and warning logic. The API route (`packages/api/src/routes/formulate.ts`) will forward the new fields to the Python engine and merge the enriched response back to the frontend.

---

## 1. Data Model Changes

### 1.1 TypeScript — `dashboard/lib/formulation.ts`

Add the `ChemicalHistory` interface and extend `FormulationInput`:

```typescript
export type LastServiceOption =
  | 'this_week'
  | '1-2_weeks'
  | '3-4_weeks'
  | '1-3_months'
  | '3-6_months'
  | '6+_months'
  | 'never';

export interface ChemicalHistory {
  boxDye: boolean;                    // Drugstore/home color — #1 hazard
  metallicSalts: boolean;             // Metallic dye or mineral buildup — HARD STOP for lightening
  henna: boolean;                   // Henna color — HARD STOP for lightening (green disaster)
  keratinTreatment: boolean;          // Keratin smoothing in last 6 months
  relaxer: boolean;                   // Chemical relaxer or Japanese straightening
  lastService: LastServiceOption;     // Recency of last chemical service
  hardWater: boolean;                 // Hard water or well water at home
  medicationBuildup: boolean;           // Medications or mineral buildup affecting hair
}

export interface SensitivityFlags {
  ppdAllergy: boolean;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  activeChemo: boolean;
}

// Extend existing FormulationInput
export interface FormulationInput {
  currentLevel: number;
  currentTone: ToneFamily;
  targetLevel: number;
  targetTone: ToneFamily;
  condition: HairCondition;
  brandPreference?: string;
  linePreference?: string;
  serviceType?: 'full_head' | 'retouch' | 'balayage' | 'foils' | 'corrective' | 'gloss_toner';
  texture?: 'fine' | 'medium' | 'coarse';
  hairType?: 'straight' | 'wavy' | 'curly' | 'coily';
  density?: 'thin' | 'medium' | 'thick';
  sensitivityFlags?: SensitivityFlags;
  chemicalHistory?: ChemicalHistory;   // ← NEW
}
```

### 1.2 Python — `packages/engine/src/colorgenius/engine/formulation/models.py`

Add `ChemicalHistory` dataclass and extend `ClientFactors`:

```python
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from enum import Enum

class LastServiceOption(str, Enum):
    THIS_WEEK = "this_week"
    ONE_TO_TWO_WEEKS = "1-2_weeks"
    THREE_TO_FOUR_WEEKS = "3-4_weeks"
    ONE_TO_THREE_MONTHS = "1-3_months"
    THREE_TO_SIX_MONTHS = "3-6_months"
    SIX_PLUS_MONTHS = "6+_months"
    NEVER = "never"

@dataclass
class ChemicalHistory:
    """Chemical treatment history and environmental factors."""
    box_dye: bool = False
    metallic_salts: bool = False
    henna: bool = False
    keratin_treatment: bool = False
    relaxer: bool = False
    last_service: LastServiceOption = LastServiceOption.NEVER
    hard_water: bool = False
    medication_buildup: bool = False

@dataclass
class SensitivityFlags:
    """Client sensitivity and contraindication flags."""
    ppd_allergy: bool = False
    is_pregnant: bool = False
    is_breastfeeding: bool = False
    active_chemo: bool = False

# Extend existing ClientFactors
@dataclass
class ClientFactors:
    """Client-specific considerations — EXPANDED."""
    gray_percentage: int = 0
    gray_texture: str = "normal"
    medications: List[str] = field(default_factory=list)
    nutrient_deficiencies: List[str] = field(default_factory=list)
    scalp_condition: str = "normal"
    has_ppd_allergy: bool = False
    has_ammonia_sensitivity: bool = False
    washing_frequency: str = "every_2_3_days"
    heat_styling_frequency: str = "few_times_week"
    swimming_frequency: str = "rarely"
    sensitivity_flags: SensitivityFlags = field(default_factory=SensitivityFlags)
    chemical_history: ChemicalHistory = field(default_factory=ChemicalHistory)
```

### 1.3 Extend `FormulationResult` / `FormulationResult` (both engines)

#### TypeScript:

```typescript
export interface ConfidenceAdjustment {
  factor: string;       // e.g. "box_dye", "keratin_treatment"
  reduction: number;      // e.g. 0.15
  reason: string;
}

export interface FormulationResult {
  success: boolean;
  steps: FormulationStep[];
  developerVolume: number;
  developerMl: number;
  totalMl: number;
  processingTime: number;
  application: 'root' | 'root_to_end' | 'balayage' | 'foil' | 'all_over';
  coverage: 'full' | 'partial' | 'tonal';
  notes: string[];
  warnings: string[];
  brand: string;
  line: string;
  hardStops?: HardStop[];
  alternatives?: string[];
  multiSessionPlan?: string[];
  underlyingPigment?: UnderlyingPigment;
  quantity?: ProductQuantity;
  // ← NEW FIELDS
  assessment?: string;                         // Natural language paragraph
  strandTestRecommended?: boolean;             // Computed from risk factors
  confidenceAdjustments?: ConfidenceAdjustment[];
  adjustedConfidence?: number;                 // Final confidence after adjustments
}
```

#### Python:

```python
@dataclass
class ConfidenceAdjustment:
    """A single confidence reduction factor."""
    factor: str
    reduction: float
    reason: str

@dataclass
class HardStop:
    """A safety or feasibility block."""
    message: str
    type: str  # "safety" | "feasibility" | "contraindication"

@dataclass
class FormulationResult:
    """Complete formulation result — EXPANDED."""
    primary_formula: 'BaseFormula'
    toning_formula: Optional['ToningFormula'] = None
    processing_instructions: Optional['ProcessingInstructions'] = None
    cost_estimate: Optional['CostEstimate'] = None
    pricing_suggestion: Optional['PricingSuggestion'] = None
    warnings: List[str] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)
    confidence_score: 'ConfidenceScore' = field(
        default_factory=lambda: ConfidenceScore(overall=0.8)
    )
    validation: 'ValidationResult' = field(default_factory='ValidationResult')
    # ← NEW FIELDS
    hard_stops: List[HardStop] = field(default_factory=list)
    assessment: Optional[str] = None
    strand_test_recommended: bool = False
    confidence_adjustments: List[ConfidenceAdjustment] = field(default_factory=list)
    multi_session_plan: List[str] = field(default_factory=list)
```

---

## 2. Hard Stop Rules (BLOCK formula generation entirely)

Hard stops return `success: false` and an array of `HardStop` objects. The formula array is empty. No developer recommendation is made.

| Condition | Message | `type` | Notes |
|---|---|---|---|
| **Metallic salts + any lift > 0** | "Hair contains metallic salts. Lightening cannot be performed safely — risk of chemical reaction and hair dissolution." | `safety` | Absolute. No lightener. |
| **Henna + any lift > 0** | "Henna detected. Lightening over henna produces irreversible green cast. Cannot proceed with lightening." | `safety` | Absolute. No lightener. |
| **Box dye + lift ≥ 4 levels** | "Box dye contains unpredictable metallic pigments. Cannot safely lift 4+ levels. Recommend strand test and maximum 2 levels per session." | `feasibility` | If lift < 4, downgrade to warning. |
| **PPD allergy** | "PPD allergy detected. Use PPD-free alternatives only." | `contraindication` | Already exists in TS engine — keep. |
| **Active chemo** | "Active chemotherapy — coloring not recommended." | `contraindication` | Already exists in TS engine — keep. |
| **Pregnancy + any lift > 0** | "Lightening not recommended during pregnancy." | `safety` | Already exists in TS engine — keep. Deposit-only still allowed. |
| **5+ level lift** | "Cannot lift 5+ levels safely in one session." | `feasibility` | Already exists — keep. |
| **Lift ≥ 4 on previously colored hair** | "Cannot lift 4+ levels through previous color deposit safely in one session." | `feasibility` | Already exists — keep. |
| **Highly damaged + lift > 2** | "Hair too compromised for significant lift." | `safety` | Already exists — keep. |

### Box Dye + Henna Combo Escalation

If **both** `boxDye === true` **AND** `henna === true`, escalate to hard stop **even for deposit-only** (same level or darker):

> "Box dye combined with henna creates unpredictable pigment overlap. Cannot safely formulate without prior color correction."

`type: 'safety'`

---

## 3. Warning Rules (Formula proceeds with caution)

Warnings do not block the formula. They adjust confidence scores, processing time, developer volume, and add notes. Multiple warnings stack (confidence reductions are additive, capped at 0.30 total).

| Condition | Warning Message | Adjustments |
|---|---|---|
| **Box dye** (when not hard stop) | "Box dye detected. Pigment may not lift predictably. Strand test strongly recommended." | `confidence -= 0.15`. `maxLift -= 1` level. |
| **Keratin treatment** | "Keratin treatment may affect processing. Reduce processing time by 15-20%." | `processingTime *= 0.85`. Cap developer at 20 vol. `confidence -= 0.1`. |
| **Relaxer** | "Chemically relaxed hair is structurally compromised. Reduce developer volume." | Reduce dev by one tier (30→20, 20→10). Max 20 vol for any lift. Add "Strand test mandatory." `confidence -= 0.1`. |
| **Hard water** | "Hard water mineral deposits may affect color deposition. Recommend clarifying treatment before service." | `confidence -= 0.05`. Add clarifying note to processing instructions. |
| **Medication/mineral buildup** | "Medications or mineral buildup may affect color absorption." | `confidence -= 0.1`. Add strand test recommendation. |
| **Last service "this week"** | "Very recent chemical service — risk of overlapping." | Warn about overlapping. If lift > 0, reduce developer by one tier. `confidence -= 0.05`. |
| **Last service "1-2 weeks"** | "Recent chemical service." | Minor caution note only. No confidence reduction. |
| **Last service "3-4 weeks"** | "Recent chemical service within the last month." | Minor caution note only. No confidence reduction. |

### Confidence Floor

After all adjustments, if `adjustedConfidence < 0.4`, add a meta-warning:

> "Multiple risk factors present. Professional in-salon assessment strongly recommended before proceeding."

---

## 4. Strand Test Recommendation Logic

Recommend a strand test (`strandTestRecommended: true`) when **ANY 2 or more** of the following are true:

| Risk Factor | Source Field |
|---|---|
| Box dye | `chemicalHistory.boxDye` |
| Keratin treatment | `chemicalHistory.keratinTreatment` |
| Relaxer | `chemicalHistory.relaxer` |
| Hard water | `chemicalHistory.hardWater` |
| Medication/mineral buildup | `chemicalHistory.medicationBuildup` |
| Previous lightener | `condition.previousLightener` |
| Highly damaged hair | `condition.type === 'highly_damaged'` |
| High porosity | `condition.porosity === 'high'` |
| Lift ≥ 3 levels | `targetLevel - currentLevel >= 3` |

Implementation (TypeScript pseudo-code):

```typescript
function shouldRecommendStrandTest(
  input: FormulationInput
): boolean {
  let riskCount = 0;
  const ch = input.chemicalHistory || {};
  if (ch.boxDye) riskCount++;
  if (ch.keratinTreatment) riskCount++;
  if (ch.relaxer) riskCount++;
  if (ch.hardWater) riskCount++;
  if (ch.medicationBuildup) riskCount++;
  if (input.condition.previousLightener) riskCount++;
  if (input.condition.type === 'highly_damaged') riskCount++;
  if (input.condition.porosity === 'high') riskCount++;
  if (input.targetLevel - input.currentLevel >= 3) riskCount++;
  return riskCount >= 2;
}
```

---

## 5. Natural Language Assessment Generator

Generate a single-paragraph assessment string (`assessment`) that summarizes the situation in professional, direct language.

### Rules

1. **Start with current state**: level, condition, and chemical history summary.
2. **State what's achievable vs. not achievable** in one session.
3. **Recommend corrective sequence** if needed.
4. **Always mention strand test** if `strandTestRecommended === true`.
5. **Tone**: Professional, direct, no hedging (e.g., "cannot" not "may not be able to").

### Example

> "Hair contains permanent artificial level 3 pigment with box dye history. Desired result level 9 ash blonde cannot be achieved in one session safely. Recommend: Remove existing color first with color remover or lightener, then lift in 2-3 sessions with 4+ weeks between. Strand test mandatory."

### Template Fragments (composable)

| Scenario | Fragment |
|---|---|
| Virgin, no issues | "Hair is virgin level {currentLevel} with {porosity} porosity." |
| Previously colored | "Hair contains permanent artificial level {currentLevel} pigment." |
| Box dye | "Box dye history introduces unpredictable metallic pigments." |
| Metallic salts | "Metallic salts detected — lightening is contraindicated." |
| Henna | "Henna deposit present — lightening would produce irreversible green cast." |
| Keratin | "Keratin treatment within 6 months affects porosity and processing time." |
| Relaxer | "Chemically relaxed hair is structurally compromised." |
| Target not achievable in 1 session | "Desired result level {targetLevel} {targetTone} cannot be achieved in one session safely." |
| Multi-session recommendation | "Recommend: {sequence}. Wait 4+ weeks between sessions." |
| Strand test | "Strand test mandatory." |
| Deposit-only safe | "Deposit-only service is safe and predictable." |

---

## 6. Engine Modification Map

### 6.1 `dashboard/lib/formulation.ts` (TypeScript Engine)

#### Interface additions
- Add `ChemicalHistory`, `LastServiceOption`, `ConfidenceAdjustment` interfaces.
- Extend `FormulationInput` with `chemicalHistory?: ChemicalHistory`.
- Extend `FormulationResult` with `assessment`, `strandTestRecommended`, `confidenceAdjustments`, `adjustedConfidence`.

#### New functions
```typescript
function validateChemicalHardStops(input: FormulationInput): {
  hardStops: HardStop[];
  alternatives: string[];
  multiSessionPlan: string[];
}

function computeChemicalWarnings(input: FormulationInput): {
  warnings: string[];
  confidenceAdjustments: ConfidenceAdjustment[];
  processingTimeMultiplier: number;
  developerVolumeReduction: number;  // tiers to reduce
  maxDeveloperVolume: number;       // cap
}

function generateAssessment(input: FormulationInput, result: FormulationResult): string;

function shouldRecommendStrandTest(input: FormulationInput): boolean;
```

#### Modified functions
- **`validateHardStops()`**: Add metallic salts, henna, box dye + lift≥4, and box dye + henna combo checks. Keep all existing checks (PPD, chemo, pregnancy, 5+ levels, lift≥4 on colored, highly damaged + lift>2).
- **`formulate()`**: After existing hard-stop check, run `computeChemicalWarnings()`. Apply `processingTimeMultiplier` and `developerVolumeReduction` to the computed developer/processing time. Add warnings to result. Compute `strandTestRecommended`. Generate `assessment`. Apply confidence adjustments and set `adjustedConfidence`.

---

### 6.2 `packages/engine/src/colorgenius/engine/formulation/models.py` (Python Models)

#### Additions
- `LastServiceOption` enum.
- `ChemicalHistory` dataclass.
- `SensitivityFlags` dataclass.
- `ConfidenceAdjustment` dataclass.
- `HardStop` dataclass.

#### Modifications
- Extend `ClientFactors` with `sensitivity_flags: SensitivityFlags` and `chemical_history: ChemicalHistory`.
- Extend `FormulationResult` with `hard_stops`, `assessment`, `strand_test_recommended`, `confidence_adjustments`, `multi_session_plan`.

---

### 6.3 `packages/engine/src/colorgenius/engine/formulation/engine.py` (Python Engine)

#### New methods on `FormulationEngine`
```python
def _validate_chemical_hard_stops(self, input_data: FormulationInput) -> List[HardStop]:
    """Check metallic salts, henna, box dye + henna combo, box dye + lift>=4."""

def _compute_chemical_warnings(self, input_data: FormulationInput) -> Tuple[List[str], List[ConfidenceAdjustment], float, int, int]:
    """Returns (warnings, adjustments, time_multiplier, dev_reduction_tiers, max_dev)."""

def _should_recommend_strand_test(self, input_data: FormulationInput) -> bool:
    """2+ risk factors = true."""

def _generate_assessment(self, input_data: FormulationInput, result: FormulationResult) -> str:
    """Compose natural language assessment paragraph."""
```

#### Modified methods
- **`formulate()`**: After `_validate_formulation()`, call `_validate_chemical_hard_stops()`. If any hard stops, return early with `success=False`. Otherwise continue to `_compute_chemical_warnings()`, apply adjustments to developer and processing time, then generate assessment and strand test recommendation.
- **`_validate_formulation()`**: Add PPD allergy, active chemo, pregnancy + lift checks (mirror TypeScript). Already partially present — expand to match TS exactly.
- **`_calculate_developer()`**: Apply `dev_reduction_tiers` and `max_dev` from chemical warnings.
- **`_calculate_processing()`**: Apply `time_multiplier` from chemical warnings.
- **`_calculate_confidence()`**: Subtract all `confidence_adjustments` reductions from overall score. Floor at 0.25.

---

### 6.4 `packages/api/src/routes/formulate.ts` (API Route)

#### Request body expansion

Add new fields to the Fastify route's body validation and destructuring:

```typescript
interface FormulateRequest {
  current_level: number;
  target_level: number;
  tone: string;
  porosity?: string;
  hair_condition?: string;
  gray_percentage?: number;
  previous_color?: boolean;
  preferred_brand?: string;
  // ← NEW
  chemical_history?: {
    box_dye?: boolean;
    metallic_salts?: boolean;
    henna?: boolean;
    keratin_treatment?: boolean;
    relaxer?: boolean;
    last_service?: 'this_week' | '1-2_weeks' | '3-4_weeks' | '1-3_months' | '3-6_months' | '6+_months' | 'never';
    hard_water?: boolean;
    medication_buildup?: boolean;
  };
  sensitivity_flags?: {
    ppd_allergy?: boolean;
    is_pregnant?: boolean;
    is_breastfeeding?: boolean;
    active_chemo?: boolean;
  };
}
```

#### Implementation changes
1. Accept and forward `chemical_history` and `sensitivity_flags` to the Python bridge (`formulateDeveloper` or equivalent).
2. In the response, include the new fields returned by the Python engine:

```typescript
interface FormulateResponse {
  formula_id: string;
  shades: ShadeRecommendation[];
  developer_volume: number;
  developer_time: number;
  mixing_instructions: string;
  rationale?: string[];
  warnings?: string[];
  action_type?: string;
  // ← NEW
  hard_stops?: Array<{ message: string; type: string }>;
  assessment?: string;
  strand_test_recommended?: boolean;
  confidence_adjustments?: Array<{ factor: string; reduction: number; reason: string }>;
  adjusted_confidence?: number;
  multi_session_plan?: string[];
  alternatives?: string[];
}
```

3. If Python engine returns `hard_stops.length > 0`, set `success: false` and surface hard stops in the response.
4. Store new fields in the database `formula_data` JSONB column.

---

### 6.5 `packages/api/src/types/index.ts` (API Types)

Add the expanded interfaces above (`FormulateRequest`, `FormulateResponse`) to the shared types file so both route handler and frontend can import them.

---

## 7. API Contract

### 7.1 Request Body (POST `/formulate`)

```json
{
  "current_level": 3,
  "target_level": 9,
  "tone": "A",
  "porosity": "normal",
  "hair_condition": "previously_colored",
  "gray_percentage": 10,
  "previous_color": true,
  "preferred_brand": "Wella",
  "chemical_history": {
    "box_dye": true,
    "metallic_salts": false,
    "henna": false,
    "keratin_treatment": false,
    "relaxer": false,
    "last_service": "3-6_months",
    "hard_water": true,
    "medication_buildup": false
  },
  "sensitivity_flags": {
    "ppd_allergy": false,
    "is_pregnant": false,
    "is_breastfeeding": false,
    "active_chemo": false
  }
}
```

### 7.2 Response Body — Success (200)

```json
{
  "success": true,
  "data": {
    "formula_id": "uuid",
    "shades": [...],
    "developer_volume": 30,
    "developer_time": 38,
    "mixing_instructions": "...",
    "warnings": [
      "Box dye detected. Pigment may not lift predictably. Strand test strongly recommended.",
      "Hard water mineral deposits may affect color deposition. Recommend clarifying treatment before service."
    ],
    "hard_stops": [],
    "assessment": "Hair contains permanent artificial level 3 pigment with box dye history. Hard water mineral deposits present. Desired result level 9 ash blonde cannot be achieved in one session safely. Recommend: Remove existing color first, then lift in 2-3 sessions with 4+ weeks between. Strand test mandatory.",
    "strand_test_recommended": true,
    "confidence_adjustments": [
      { "factor": "box_dye", "reduction": 0.15, "reason": "Pigment may not lift predictably" },
      { "factor": "hard_water", "reduction": 0.05, "reason": "Mineral deposits may affect color deposition" }
    ],
    "adjusted_confidence": 0.60,
    "multi_session_plan": [
      "Session 1: Color remover to clear previous deposit",
      "Wait 4+ weeks with bond treatments",
      "Session 2: Lift to Level 6",
      "Wait 4+ weeks",
      "Session 3: Lift to Level 9 ash blonde"
    ],
    "alternatives": ["Break into multiple sessions with 4+ weeks between."]
  }
}
```

### 7.3 Response Body — Hard Stop (200 with `success: false`)

```json
{
  "success": false,
  "data": {
    "formula_id": null,
    "shades": [],
    "developer_volume": 0,
    "developer_time": 0,
    "mixing_instructions": "",
    "warnings": [],
    "hard_stops": [
      {
        "message": "Hair contains metallic salts. Lightening cannot be performed safely — risk of chemical reaction and hair dissolution.",
        "type": "safety"
      }
    ],
    "assessment": "Metallic salts detected in hair. Lightening is contraindicated due to risk of chemical reaction and hair dissolution. Deposit-only services may be considered after professional in-salon assessment.",
    "strand_test_recommended": true,
    "confidence_adjustments": [],
    "adjusted_confidence": 0.0,
    "multi_session_plan": [],
    "alternatives": [
      "Deposit-only color with no lift.",
      "Professional in-salon assessment required."
    ]
  }
}

```

Note: HTTP status remains 200 for hard stops (the request succeeded; the formula is infeasible). Only 400/500 for actual request/ server errors.

---

## 8. Migration Notes

1. **Database**: The `formulations` table already stores `formula_data` as JSONB. The new fields will be stored there automatically — no schema migration needed.
2. **Frontend**: The UI already collects all chemical history fields (see `dashboard/app/formulate/page.tsx`, `chemicalHistory` state). The only change needed is to forward these fields in the POST body and render the new response fields (`assessment`, `strandTestRecommended`, `hardStops`).
3. **Backward compatibility**: Old requests without `chemical_history` or `sensitivity_flags` should default to all-`false` / `'never'` and behave exactly as before.

---

## Related Documents
- `dashboard/lib/formulation.ts` — TypeScript formulation engine
- `packages/engine/src/colorgenius/engine/formulation/engine.py` — Python formulation engine
- `packages/engine/src/colorgenius/engine/formulation/models.py` — Python data models
- `packages/api/src/routes/formulate.ts` — Fastify API route
- `packages/api/src/types/index.ts` — Shared API types
- `dashboard/app/formulate/page.tsx` — Frontend form (already collects chemical history)
- ADR-004 (Camera Capture) — Related data model for photo sessions

## Next Steps
1. Implement TypeScript engine changes (`dashboard/lib/formulation.ts`)
2. Implement Python model changes (`models.py`)
3. Implement Python engine changes (`engine.py`)
4. Update API route and types (`formulate.ts`, `index.ts`)
5. Wire frontend to send new fields and display new response fields
6. Write unit tests for each hard stop and warning rule
7. Integration test: full flow from UI → API → Python → response
