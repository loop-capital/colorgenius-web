# ADR-015: Brand Conversion System

## Status
**Proposed** — Phase 1 Blocker

## Context

ColorGenius is a multi-brand formulation platform. A formula generated for a Schwarzkopf salon is useless to an Aveda salon unless the system can convert shades, developer volumes, and mixing ratios across brands. The Formula Marketplace (ADR-XXX) and Pleij Salon beta both depend on this capability.

We currently hold verified shade data for five brands (670 shades total):

| Brand | Shades | Verified | Source |
|-------|--------|----------|--------|
| Schwarzkopf Professional | ~291 | 2026-05-11 | IGORA ROYAL Paper Chart |
| Moroccanoil Color | 159 | 2026-05-11 | Moroccanoil Color Chart |
| Lanza Healing Color | 109 | 2026-05-11 | Official Shade Swatch |
| Davines | 56 | 2026-05-11 | Official Shade Book |
| Aveda Full Spectrum | 55 | 2026-05-11 | Aveda Color Chart |

Brands we **do not yet have data for** (extensibility target):
Wella Koleston Perfect, Wella Color Touch, Redken Color Gels, Redken Shades EQ, Matrix SoColor, Matrix Color Sync, Joico Color Intensity, Joico Vero K-PAK, Paul Mitchell The Color.

The conversion system must:
1. Map every shade to a universal `(level, toneFamily)` tuple.
2. Find the closest equivalent in the target brand with a confidence score.
3. Adjust developer volume and mixing ratio for the target brand.
4. Handle multi-shade formulas (2–3 shades mixed).
5. Be extensible: adding a new brand requires only data ingestion and tone mapping, **no code changes**.
6. Run identically in the TypeScript dashboard engine and the Python server engine.

---

## Decision

We will build a **Brand Conversion Engine** that normalizes all shade data to a common `NormalizedShade` schema, maps brand-specific tone codes to universal tone families, and converts formulas by matching on `(level, toneFamily)` with configurable confidence scoring. The engine will be implemented in both TypeScript (`dashboard/lib/conversion.ts`) and Python (`packages/engine/src/colorgenius/engine/conversion/engine.py`) with bit-for-bit identical logic.

---

## 1. Normalized Shade Schema

Before conversion can work, every shade in `data/brands/{brand}/shades.json` must be normalized to the following schema. Normalization is a one-time data migration step performed at ingest time.

```typescript
// packages/shared/src/types/conversion.ts

export interface NormalizedShade {
  /** Brand-specific shade code */
  code: string; // e.g., "7-0", "7N", "7.0", "7N"

  /** Machine-readable brand slug */
  brand: string; // e.g., "schwarzkopf", "aveda"

  /** Product line within the brand */
  line: string; // e.g., "IGORA ROYAL", "Full Spectrum"

  /** Numeric level 1–12 */
  level: number;

  /** Universal tone family */
  toneFamily: ToneFamily;

  /** Original brand-specific tone code */
  toneCode: string; // e.g., "0", "N", ".0", "A"

  /** Human-readable name */
  name: string;

  /** Approximate hair color hex for visual swatches */
  hex: string;

  /** True for high-lift or special blonde shades */
  isHighLift: boolean;

  /** True for demi-permanent / tone-on-tone */
  isDemi: boolean;

  /** Gray coverage guidance */
  grayCoverage: "none" | "0-50%" | "50-100%" | "100%" | null;
}

export type ToneFamily =
  | "natural"
  | "ash"
  | "blue-ash"
  | "green-ash"
  | "gold"
  | "copper"
  | "red"
  | "violet"
  | "pearl"
  | "beige"
  | "mahogany"
  | "chocolate"
  | "warm"
  | "matte"
  | "rose"
  | "specialty";
```

### 1.1 Normalization Rules by Brand

| Brand | Level Extraction | Tone Extraction | Notes |
|-------|------------------|-----------------|-------|
| **Schwarzkopf** | Digit before dash (`7-0` → `7`) | Digit(s) after dash (`7-0` → `0`) | Cendré (`1`) = blue-ash; Ash (`2`) = green-ash |
| **Aveda** | Leading digit (`7N` → `7`) | Letter suffix (`7N` → `N`) | Single-letter tones; `NN` = double natural |
| **Lanza** | Leading digit (`7N` → `7`) | Letter suffix (`7N` → `N`) | `AX` = extra ash; `RRC` = red-red copper |
| **Davines** | Digit before comma/dot (`7,0`/`7.0` → `7`) | After comma/dot (`7,0` → `0`) | European comma separator |
| **Moroccanoil** | Leading digit (`7N` → `7`) | Letter suffix (`7N` → `N`) | Multiple lines; some alphanumeric like `8RG` |

### 1.2 Migration Path

1. Run a normalization script (`scripts/normalize-shades.ts`) over each brand's `shades.json`.
2. Write normalized output to `data/brands/{brand}/shades.normalized.json`.
3. Manual review by expert colorist (Jason's wife) before promotion to `shades.json`.
4. CI blocks on un-reviewed normalized files.

---

## 2. Tone Family Mapping

Each brand uses its own tone naming conventions. We map them to universal `ToneFamily` values.

### 2.1 Universal Tone Family Table

| Universal Family | Description | Schwarzkopf | Aveda | Lanza | Davines | Moroccanoil |
|------------------|-------------|-------------|-------|-------|---------|-------------|
| `natural` | No dominant tone | `0`, `00` | `N`, `NN` | `N`, `NN` | `0` | `N`, `NN` |
| `ash` | Green-based ash | `2` | `A` | `A` | `1`, `11` | `A` |
| `blue-ash` | Blue-based ash (cooler) | `1` | — | `AX` (extra ash) | — | `BA` |
| `gold` | Warm yellow | `3`, `5` | `G` | `G`, `CG` | `3`, `33` | `G`, `GG` |
| `copper` | Orange-red | `4`, `44` | `C` | `C`, `BC` | `4`, `44` | `C`, `CC` |
| `red` | Pure red | `6`, `66` | `R` | `R`, `RR`, `RRC` | `6`, `66` | `R`, `RR` |
| `violet` | Purple | `7` | `V` | `V`, `RV` | `7`, `77` | `V`, `VV` |
| `pearl` | Iridescent | — | `P` | `P` | — | `P` |
| `beige` | Neutral-warm | — | `B` | `B` | — | `B`, `BB` |
| `mahogany` | Red-brown | `5` | — | — | `5`, `55` | `M` |
| `chocolate` | Brown warmth | — | — | — | — | `CH`, `COCOA` |
| `warm` | General warmth | — | `W` | `W` | — | `W` |
| `matte` | Green-muted | — | — | — | `2`, `22` | — |
| `rose` | Pink | — | — | — | — | `RO` |
| `specialty` | Correctors/mixers | `Mixton`, `0-` | `HLA`, `P` | `KICKER`, `SPECIALTY` | `Mix` | `Mix`, `Booster` |

### 2.2 Tone Family Map File

`data/brands/tone-family-map.json` (new) — machine-readable mapping:

```json
{
  "schwarzkopf": {
    "0": "natural",
    "00": "natural",
    "1": "blue-ash",
    "2": "ash",
    "3": "gold",
    "4": "beige",
    "5": "gold",
    "6": "red",
    "7": "violet",
    "44": "copper",
    "66": "red",
    "77": "violet",
    "Mixton": "specialty"
  },
  "aveda": {
    "N": "natural",
    "NN": "natural",
    "A": "ash",
    "V": "violet",
    "B": "beige",
    "C": "copper",
    "R": "red",
    "G": "gold",
    "HLA": "specialty",
    "P": "pearl"
  },
  "lanza": {
    "N": "natural",
    "NN": "natural",
    "NA": "natural",
    "A": "ash",
    "AX": "blue-ash",
    "NV": "natural-violet",
    "P": "pearl",
    "B": "beige",
    "BC": "beige-copper",
    "C": "copper",
    "CG": "copper-gold",
    "R": "red",
    "RR": "red",
    "RRC": "red",
    "RV": "red-violet",
    "V": "violet",
    "G": "gold",
    "T": "specialty",
    "SPECIALTY": "specialty",
    "KICKER": "specialty"
  },
  "davines": {
    "0": "natural",
    "1": "ash",
    "2": "matte",
    "3": "gold",
    "4": "copper",
    "5": "mahogany",
    "6": "red",
    "7": "violet",
    "11": "ash",
    "22": "matte",
    "33": "gold",
    "44": "copper",
    "55": "mahogany",
    "66": "red",
    "77": "violet",
    "Mix": "specialty"
  },
  "moroccanoil": {
    "N": "natural",
    "NN": "natural",
    "A": "ash",
    "BA": "blue-ash",
    "B": "beige",
    "BB": "beige",
    "BV": "beige-violet",
    "BG": "beige-gold",
    "C": "copper",
    "CC": "copper",
    "CH": "chocolate",
    "COCOA": "chocolate",
    "G": "gold",
    "GG": "gold",
    "M": "mahogany",
    "P": "pearl",
    "R": "red",
    "RR": "red",
    "RG": "red-gold",
    "RO": "rose",
    "V": "violet",
    "VV": "violet",
    "W": "warm",
    "Mix": "specialty",
    "Booster": "specialty"
  }
}
```

> **Note:** Multi-tone codes like `7-77` (Schwarzkopf) or `RRC` (Lanza) map to the *dominant* tone family. Secondary tones are preserved in the `toneCode` field but do not participate in conversion matching.

---

## 3. Core Conversion Algorithm

### 3.1 Single-Shade Conversion

Given a source shade `(sourceBrand, sourceCode)` and a `targetBrand`:

1. **Lookup source shade** in `NormalizedShade[]` for `sourceBrand`.
2. **Extract** `(level, toneFamily)`.
3. **Search target brand** for shades where:
   - `level === sourceLevel` AND `toneFamily === sourceToneFamily` → **Exact match** (confidence 1.0)
   - `level === sourceLevel` AND `toneFamily` is adjacent (see §3.3) → **Close match** (0.85)
   - `level` is ±1 AND `toneFamily === sourceToneFamily` → **Level-adjusted match** (0.70)
   - `level` is ±1 AND `toneFamily` is adjacent → **Weak match** (0.50)
   - No match within ±1 level AND adjacent tone → **No match** (null, hard stop)
4. **Return** the highest-confidence match, or `null` if none found.

### 3.2 Multi-Shade Formula Conversion

A formula is an array of `{shadeCode, brand, line, grams}`.

```typescript
export interface FormulaComponent {
  shadeCode: string;
  brand: string;
  line: string;
  grams: number;
}

export interface ConvertedFormulaComponent extends FormulaComponent {
  convertedShadeCode: string | null;
  convertedBrand: string;
  convertedLine: string;
  confidence: number;
  warning?: string;
}
```

Conversion rules:
1. Each component converts independently using single-shade logic.
2. **Total formula weight is preserved**: `grams` stays the same.
3. If any component returns `null` (no safe equivalent), the entire formula conversion fails with a hard stop.
4. Gray coverage modifiers (e.g., `NN` series for extra coverage) map to the target brand's equivalent modifier series.
5. Double-processing flags (e.g., resistant gray) are passed through unchanged.

### 3.3 Adjacent Tone Families

For confidence scoring, the following tone families are considered "adjacent":

| Tone Family | Adjacent To |
|-------------|-------------|
| `natural` | `warm`, `beige` |
| `ash` | `blue-ash`, `matte`, `pearl` |
| `blue-ash` | `ash`, `violet` |
| `gold` | `warm`, `copper`, `beige` |
| `copper` | `gold`, `red`, `mahogany` |
| `red` | `copper`, `mahogany`, `rose` |
| `violet` | `blue-ash`, `pearl` |
| `pearl` | `ash`, `violet`, `beige` |
| `beige` | `natural`, `gold`, `pearl` |
| `mahogany` | `copper`, `red`, `chocolate` |
| `chocolate` | `mahogany`, `warm` |
| `warm` | `natural`, `gold`, `chocolate` |
| `matte` | `ash` |
| `rose` | `red`, `violet` |

### 3.4 Confidence Scoring Summary

| Condition | Confidence | Action |
|-----------|-----------|--------|
| Same level + same tone family | 1.0 | Auto-approve |
| Same level + adjacent tone family | 0.85 | Auto-approve |
| ±1 level + same tone family | 0.70 | Flag for review |
| ±1 level + adjacent tone family | 0.50 | Flag for review |
| No match within ±1 + adjacent | `null` | **Hard stop** — recommend custom formulation |

---

## 4. Developer & Mixing Adjustments

Each brand has its own developer system. When converting, the engine must translate developer volume and mixing ratio.

### 4.1 Brand Specs

`data/brands/{brand}/specs.json` (new) — per-brand developer and mixing specs:

```json
// data/brands/schwarzkopf/specs.json
{
  "brand": "schwarzkopf",
  "developerSystem": "IGORA ROYAL Oil Developer",
  "mixRatio": "1:1",
  "developerVolumes": [10, 20, 30, 40],
  "volumeSemantics": {
    "10": "deposit only / tone-on-tone",
    "20": "1 level lift / same-level deposit",
    "30": "2 levels lift",
    "40": "3+ levels lift / high-lift"
  },
  "grayCoverage": {
    "requiresNN": true,
    "recommendedVolume": 20,
    "processingTimeAdd": 10
  }
}
```

```json
// data/brands/aveda/specs.json
{
  "brand": "aveda",
  "developerSystem": "Full Spectrum Deposit-Only / Permanent Developer",
  "mixRatio": "1:1",
  "developerVolumes": [5, 10, 20, 30],
  "volumeSemantics": {
    "5": "demi-permanent deposit",
    "10": "gentle deposit / minimal lift",
    "20": "1 level lift / same-level deposit",
    "30": "2 levels lift"
  },
  "grayCoverage": {
    "requiresNN": true,
    "recommendedVolume": 20,
    "processingTimeAdd": 10
  }
}
```

```json
// data/brands/lanza/specs.json
{
  "brand": "lanza",
  "developerSystem": "Healing Color Cream Developer",
  "mixRatio": "1:1.5",
  "developerVolumes": [10, 20, 30, 40],
  "volumeSemantics": {
    "10": "deposit only",
    "20": "1 level lift",
    "30": "2 levels lift",
    "40": "3 levels lift"
  },
  "grayCoverage": {
    "requiresNN": true,
    "recommendedVolume": 20,
    "processingTimeAdd": 10
  }
}
```

```json
// data/brands/davines/specs.json
{
  "brand": "davines",
  "lines": {
    "View": {
      "mixRatio": "1:1",
      "developerVolumes": [10, 20, 30, 40]
    },
    "A New Colour": {
      "mixRatio": "cream:mecha (see line docs)",
      "developerVolumes": [10, 20, 30]
    },
    "Mask with Vibrachrom": {
      "mixRatio": "1:1.5",
      "developerVolumes": [10, 20, 30, 40]
    }
  },
  "volumeSemantics": {
    "10": "deposit only / tone-on-tone",
    "20": "1 level lift",
    "30": "2 levels lift",
    "40": "3 levels lift"
  },
  "grayCoverage": {
    "requiresNN": false,
    "recommendedVolume": 20,
    "processingTimeAdd": 10
  }
}
```

### 4.2 Developer Volume Translation

The engine translates developer volume by **semantic intent**, not numeric equivalence:

| Intent | Schwarzkopf | Aveda | Lanza | Davines |
|--------|-------------|-------|-------|---------|
| Deposit only / tone-on-tone | 10 vol | 5–10 vol | 10 vol | 10 vol |
| Same level / 1 level lift | 20 vol | 20 vol | 20 vol | 20 vol |
| 2 levels lift | 30 vol | 30 vol | 30 vol | 30 vol |
| 3+ levels lift / high-lift | 40 vol | — (not available) | 40 vol | 40 vol |

If the target brand does not support the required intent (e.g., Aveda cannot do 3-level lift), the conversion returns `null` with a hard-stop message: *"Target brand does not support 3+ level lift. Consider lightener + tone."*

### 4.3 Mixing Ratio Adjustment

The mixing ratio is **not** translated numerically. The converted formula states the target brand's native ratio. The colorist is responsible for weighing out the correct total amount using the target brand's ratio. The engine preserves total `grams` per component.

---

## 5. API Contract

### 5.1 Convert Formula

```
POST /api/formulate/convert
```

**Request:**

```json
{
  "formula": [
    {
      "shadeCode": "7-0",
      "brand": "schwarzkopf",
      "line": "IGORA ROYAL",
      "grams": 30
    },
    {
      "shadeCode": "7-1",
      "brand": "schwarzkopf",
      "line": "IGORA ROYAL",
      "grams": 15
    }
  ],
  "targetBrand": "aveda",
  "targetLine": "Full Spectrum",
  "clientHairLevel": 6,
  "developerVolume": 20,
  "grayCoverage": "50-100%"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "convertedFormula": [
    {
      "originalShadeCode": "7-0",
      "originalBrand": "schwarzkopf",
      "convertedShadeCode": "7N",
      "convertedBrand": "aveda",
      "convertedLine": "Full Spectrum",
      "grams": 30,
      "confidence": 1.0,
      "levelMatch": true,
      "toneMatch": true
    },
    {
      "originalShadeCode": "7-1",
      "originalBrand": "schwarzkopf",
      "convertedShadeCode": "7A",
      "convertedBrand": "aveda",
      "convertedLine": "Full Spectrum",
      "grams": 15,
      "confidence": 0.85,
      "levelMatch": true,
      "toneMatch": false,
      "toneNote": "Cendré (blue-ash) mapped to Aveda Ash; subtle warmth difference"
    }
  ],
  "overallConfidence": 0.92,
  "targetBrandDeveloper": {
    "recommendedVolume": 20,
    "availableVolumes": [5, 10, 20, 30],
    "mixRatio": "1:1",
    "developerSystem": "Full Spectrum Deposit-Only / Permanent Developer"
  },
  "warnings": [],
  "requiresReview": false
}
```

**Response (422 Unprocessable):**

```json
{
  "success": false,
  "error": "CONVERSION_BLOCKED",
  "message": "No safe equivalent found for shade 12-0 (Special Blonde) in Aveda. Target brand does not support high-lift blonde.",
  "failedComponent": {
    "shadeCode": "12-0",
    "brand": "schwarzkopf",
    "line": "IGORA ROYAL"
  }
}
```

### 5.2 List Brand Shades

```
GET /api/brands/:brand/shades
```

Returns all normalized shades for a brand with level, tone, family, hex.

### 5.3 Find Equivalents

```
GET /api/brands/:brand/equivalents?level=7&tone=ash&includeConfidence=true
```

Returns equivalent shades across all other brands for the given level and tone family.

---

## 6. Extensibility Design

Adding a new brand (e.g., Wella) requires **only** the following steps — **no code changes**:

1. **Ingest shade data** JSON to `data/brands/wella/shades.json` using the existing brand schema.
2. **Run normalization script** to produce `shades.normalized.json`.
3. **Add tone mapping** to `data/brands/tone-family-map.json` under the `wella` key.
4. **Add brand specs** to `data/brands/wella/specs.json` (developer volumes, mix ratio, gray coverage rules).
5. **Expert review** of normalized data and tone mappings.
6. **Promote** normalized file to `shades.json`.

The conversion engine reads all brand directories at startup and builds an in-memory index of `(brand, level, toneFamily) → Shade[]`. New brands are automatically discoverable.

---

## 7. Implementation Plan

### 7.1 File Layout

```
packages/
  engine/
    src/colorgenius/engine/conversion/
      __init__.py
      engine.py          # Python conversion engine
      types.py             # NormalizedShade, ToneFamily, etc.
      index.py             # In-memory shade index builder
      confidence.py        # Confidence scoring logic
      developer.py         # Developer volume translation
      tests/
        test_conversion.py
        test_confidence.py
        test_developer.py

dashboard/
  lib/
    conversion/
      index.ts             # Shade index builder
      engine.ts            # TS conversion engine
      types.ts             # Shared types
      confidence.ts        # Confidence scoring
      developer.ts         # Developer volume translation
      tests/
        conversion.test.ts

data/
  brands/
    {brand}/
      shades.json          # Normalized shade data (migrated)
      specs.json           # Brand developer/mixing specs (new)
    tone-family-map.json   # Universal tone mapping (new)
```

### 7.2 Implementation Order

1. **Week 1:** Normalize existing 5 brands to `NormalizedShade` schema.
2. **Week 1:** Create `tone-family-map.json` and `specs.json` for all 5 brands.
3. **Week 2:** Implement Python conversion engine (`engine.py`, `index.py`, `confidence.py`, `developer.py`).
4. **Week 2:** Implement TypeScript conversion engine (`engine.ts`, `index.ts`, `confidence.ts`, `developer.ts`).
5. **Week 3:** Build API routes (`/api/formulate/convert`, `/api/brands/:brand/shades`, `/api/brands/:brand/equivalents`).
6. **Week 3:** Add UI components for conversion results (confidence badges, color swatches, warnings).
7. **Week 4:** Expert validation of all 670 shade mappings; adjust tone-family-map as needed.
8. **Week 4:** Write comprehensive tests for both engines (parity tests).

---

## 8. Validation & Safety

### 8.1 Expert Review Gate

- All AI-generated tone mappings and shade equivalencies are **suggestions only**.
- Jason's wife (20+ year colorist) validates every mapping before production use.
- Any conversion with confidence < 0.85 requires manual review flag in the UI.

### 8.2 Hard Stops

The engine must **never** produce a conversion that could damage hair or produce unpredictable results:

| Condition | Result |
|-----------|--------|
| No equivalent within ±1 level + adjacent tone | `null`, hard stop |
| Source developer intent unsupported by target brand | `null`, hard stop |
| Source is high-lift, target has no high-lift line | `null`, hard stop |
| Multi-shade formula, any component fails | Entire formula blocked |

### 8.3 Safety Log

Every conversion (successful or blocked) is logged:

```typescript
interface ConversionLog {
  id: string;
  timestamp: string;
  sourceFormula: FormulaComponent[];
  targetBrand: string;
  result: "success" | "blocked" | "review_required";
  overallConfidence: number | null;
  coloristId: string;
  salonId: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}
```

---

## 9. UI Integration

### 9.1 Conversion Result Card

When a formula is converted, the UI displays:
- **Color swatches** for each component (source → target side by side).
- **Confidence badges**: green (1.0), yellow (0.85), orange (0.70), red (0.50 or blocked).
- **Developer adjustment**: "Schwarzkopf 1:1 20 vol → Aveda 1:1 20 vol".
- **Warning banners** for review-required conversions.
- **Hard-stop modal** with explanation and suggestion (e.g., "Use lightener + toner instead").

### 9.2 Formula Marketplace Integration

- When a salon purchases a formula created with Brand X, the marketplace auto-converts to the buyer's default brand.
- Conversion confidence is displayed on the purchase preview.
- Buyer can opt to receive the original formula + conversion side by side.

---

## 10. Consequences

### Positive

- **Multi-brand support** unlocks the Formula Marketplace and Pleij beta cross-brand scenarios.
- **Extensibility** means Wella, Redken, Matrix, etc. can be added without code changes.
- **Confidence scoring** gives colorists transparency and control.
- **Dual-engine parity** ensures consistent behavior between dashboard and API.

### Negative / Risks

- **Expert validation bottleneck**: 670 shades × 5 brands = 3,350 potential equivalencies to validate. We will prioritize the most common 200 shades first.
- **Tone family simplification loses nuance**: Schwarzkopf Cendré (blue-ash) is not the same as Aveda Ash (green-ash). The 0.85 confidence score captures this, but colorists must understand the difference.
- **Developer semantics vary**: "20 vol" in Schwarzkopf is not chemically identical to "20 vol" in Aveda. The semantic mapping is approximate.

### Mitigations

- Hard stops prevent dangerous conversions.
- Confidence < 0.85 always flags for review.
- Safety logs enable post-hoc analysis of conversion quality.
- Regular expert audits of top 100 converted formulas.

---

## References

- ADR-012: Chemical History & Safety Intelligence
- ADR-013: Visual Outcome Simulator
- ADR-014: Client Profile Integration
- `data/brands/{brand}/shades.json` — source shade data
- `data/brands/{brand}/specs.json` — brand developer specs (new)
- `data/brands/tone-family-map.json` — universal tone mapping (new)
- `packages/engine/src/colorgenius/engine/conversion/` — Python engine (new)
- `dashboard/lib/conversion/` — TypeScript engine (new)
