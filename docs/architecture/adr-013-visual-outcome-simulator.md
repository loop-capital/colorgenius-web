# ADR-013: Visual Outcome Simulator

## Status
Proposed

## Context
ColorGenius computes professional hair color formulations from client hair state (current level, tone, condition, chemical history) and produces a `FormulationResult`. The current results page (Step 6 in `dashboard/app/formulate/page.tsx`) renders formula steps, developer volume, processing time, and notes as text. **There is no visual representation of what the colorist or client should expect to see after the service.**

Colorists need a quick, at-a-glance preview to:
1. Validate that the computed result matches their professional intuition before mixing.
2. Show the client a data-driven preview of expected results (building trust and managing expectations).
3. Identify zone-specific risks (root warmth, end damage, banding) before application.

This ADR specifies a set of **pure CSS/React visual components** that render directly from the `FormulationResult` and `FormulationInput` — no 3D rendering, no canvas, no image generation.

---

## Decision

We will add a **Visual Outcome Simulator** section to the results page, composed of six distinct visual components. All colors are computed from existing hex data (`HAIR_LEVELS`, `TONES`, `blendColor()`) and new computed fields added to `FormulationResult`. The simulator is client-side only — no new API calls.

---

## 1. Feature Overview

| Component | Purpose | Data Source |
|---|---|---|
| **Before → After Swatch** | Side-by-side color blocks showing current vs. predicted result | `FormulationInput` + `FormulationResult` |
| **Warmth Exposure Bar** | Horizontal gradient showing warmth progression across root→midshaft→ends | Computed from `underlyingPigment`, porosity, condition |
| **Zone Risk Bars** | Three zone-specific risk indicators with predicted color swatches | `zoneRisk`, `zoneNotes`, computed zone hexes |
| **Fade Preview Swatch** | Predicted faded result in 4–6 weeks | Simple tone-shift model on target |
| **Confidence Ring** | Circular gauge of `adjustedConfidence` with factor tags | `adjustedConfidence`, `confidenceAdjustments` |
| **Multi-Session Plan Visual** | Session progression strip with color swatches per step | `multiSessionPlan` |

---

## 2. Component Specs

### 2.1 Before → Expected After Swatch

**Purpose:** Give the colorist and client an immediate visual comparison.

**Layout:**
- Two square color blocks side-by-side (stack vertically on mobile).
- Left = "Before", Right = "After".
- Each block is 120×120px on desktop, 80×80px on mobile.
- Below each block: label text showing level name + tone name.

**Color Computation:**

```typescript
// Current color (Before)
const beforeHex = blendColor(
  HAIR_LEVELS[input.currentLevel].hex,
  TONES[input.currentTone].hex,
  0.35  // existing blend weight in UI
);

// Predicted result (After)
const afterHex = blendColor(
  HAIR_LEVELS[result.targetLevel ?? input.targetLevel].hex,
  TONES[input.targetTone].hex,
  0.45  // slightly more tone influence on result
);
```

**Underlying Pigment Peek-Through:**

If `result.underlyingPigment.exposed` indicates warmth will show through (i.e., lifting to a level where underlying pigment is exposed and target tone is cool/ash/violet), render the "After" block as a **CSS linear-gradient overlay**:

```typescript
function getPigmentOverlay(underlyingPigment: UnderlyingPigment): string | null {
  const pigmentHexMap: Record<string, string> = {
    'red': '#A03030',
    'red-orange': '#B85A30',
    'orange': '#D47830',
    'yellow': '#D4A35A',
    'yellow-orange': '#C49040',
    'pale yellow': '#E8C99B',
  };
  
  const pigmentHex = pigmentHexMap[underlyingPigment.exposed];
  if (!pigmentHex) return null;
  
  // Return a CSS gradient string: 70% result color, 30% pigment showing through
  return `linear-gradient(135deg, ${afterHex} 60%, ${pigmentHex} 100%)`;
}
```

**Rendering Rule:**
- If `input.targetLevel > input.currentLevel` AND `input.targetTone` is one of `['ash', 'cool', 'violet', 'pearl']`, show the gradient overlay.
- Otherwise, show solid `afterHex`.

**Label Format:**
- Before: `"Level {currentLevel} — {currentToneName}"`
- After: `"Level {targetLevel} — {targetToneName}"`

---

### 2.2 Warmth Exposure Bar

**Purpose:** Show how warmth shifts across the hair shaft — root (natural pigment) to ends (target tone, affected by porosity).

**Layout:**
- Horizontal bar, full width of container (100%), height 32px.
- CSS `border-radius: 16px` (pill shape).
- Three labeled zones below: "Root", "Midshaft", "Ends".

**Color Computation:**

```typescript
interface WarmthExposure {
  root: string;      // hex
  midshaft: string;   // hex
  ends: string;       // hex
}

function computeWarmthExposure(
  input: FormulationInput,
  result: FormulationResult
): WarmthExposure {
  const currentLevelHex = HAIR_LEVELS[input.currentLevel].hex;
  const targetLevelHex = HAIR_LEVELS[input.targetLevel].hex;
  const underlying = result.underlyingPigment;
  
  // Root zone: closer to current color + some warmth from natural pigment
  // If virgin: more uniform. If previously colored: banding risk = warmer root.
  const rootWarmthWeight = input.condition.type === 'virgin' ? 0.15 : 0.30;
  const rootHex = blendColor(currentLevelHex, getPigmentHex(underlying?.exposed), rootWarmthWeight);
  
  // Midshaft: blend of current and target, influenced by previous color
  const midBlendWeight = input.condition.type === 'previously_colored' ? 0.55 : 0.40;
  const midHex = blendColor(currentLevelHex, targetLevelHex, midBlendWeight);
  
  // Ends: closest to target, but shifted by porosity
  // High porosity → more warmth (ends grab warmth, fade cool tones)
  // Low porosity → cooler, more uniform with target
  let endsHex = targetLevelHex;
  if (input.condition.porosity === 'high') {
    // Shift ends slightly toward underlying warmth
    endsHex = blendColor(targetLevelHex, getPigmentHex(underlying?.exposed), 0.20);
  } else if (input.condition.porosity === 'low') {
    // Slightly cooler — more target tone, less warmth
    endsHex = blendColor(targetLevelHex, getPigmentHex(underlying?.exposed), 0.05);
  }
  
  return { root: rootHex, midshaft: midHex, ends: endsHex };
}
```

**Gradient Rendering:**

```css
.warmth-bar {
  background: linear-gradient(
    90deg,
    var(--root-hex) 0%,
    var(--mid-hex) 50%,
    var(--ends-hex) 100%
  );
}
```

**Band Indication (for previously colored hair):**

If `input.condition.type === 'previously_colored'`, add subtle vertical dividers at 33% and 66% with 1px `rgba(255,255,255,0.2)` lines and small labels:
- "New growth" (root zone)
- "Old color" (midshaft zone)
- "Faded" (ends zone)

---

### 2.3 Zone Risk Bars

**Purpose:** Show predicted color + risk level for each processing zone.

**Layout:**
- Three horizontal rows, each with:
  1. Zone label ("Root Zone", "Midshaft Zone", "Ends Zone")
  2. Small color swatch (40×40px) showing predicted zone color
  3. Risk indicator pill (🟢 Low / 🟡 Moderate / 🔴 High)
  4. Brief note text

**Color Computation per Zone:**

```typescript
interface ZoneColors {
  root: string;
  midshaft: string;
  ends: string;
}

function computeZoneColors(
  input: FormulationInput,
  result: FormulationResult
): ZoneColors {
  const exposure = computeWarmthExposure(input, result);
  return {
    root: exposure.root,
    midshaft: exposure.midshaft,
    ends: exposure.ends,
  };
}
```

**Risk Computation:**

```typescript
type RiskLevel = 'low' | 'moderate' | 'high';

interface ZoneRisk {
  root: RiskLevel;
  midshaft: RiskLevel;
  ends: RiskLevel;
}

interface ZoneNotes {
  root: string;
  midshaft: string;
  ends: string;
}

function computeZoneRisk(
  input: FormulationInput,
  result: FormulationResult
): { risk: ZoneRisk; notes: ZoneNotes } {
  const risk: ZoneRisk = { root: 'low', midshaft: 'low', ends: 'low' };
  const notes: ZoneNotes = { root: '', midshaft: '', ends: '' };
  
  const levelsToLift = input.targetLevel - input.currentLevel;
  
  // Root zone risk
  if (input.condition.hotRoots) {
    risk.root = 'high';
    notes.root = 'Hot roots detected — root area may process faster and lighter';
  } else if (levelsToLift > 2 && input.condition.type === 'previously_colored') {
    risk.root = 'moderate';
    notes.root = 'Regrowth zone with 2+ level lift — monitor for warmth';
  } else if (input.condition.type === 'virgin') {
    risk.root = 'low';
    notes.root = 'Virgin root — predictable processing';
  }
  
  // Midshaft risk
  if (input.condition.banding) {
    risk.midshaft = 'high';
    notes.midshaft = 'Banding detected — midshaft may take color unevenly';
  } else if (input.condition.type === 'previously_colored') {
    risk.midshaft = 'moderate';
    notes.midshaft = 'Previous color present — may shift target tone';
  } else if (input.condition.multipleColors) {
    risk.midshaft = 'high';
    notes.midshaft = 'Multiple previous colors — unpredictable absorption';
  }
  
  // Ends risk
  if (input.condition.hollowEnds) {
    risk.ends = 'high';
    notes.ends = 'Hollow ends — may not hold target tone';
  } else if (input.condition.porosity === 'high') {
    risk.ends = 'moderate';
    notes.ends = 'High porosity ends — may process faster and fade quicker';
  } else if (input.condition.type === 'damaged' || input.condition.type === 'highly_damaged') {
    risk.ends = 'moderate';
    notes.ends = 'Damaged ends — monitor for over-processing';
  }
  
  return { risk, notes };
}
```

**Risk Color Mapping:**

| Risk | Pill Background | Pill Text | Icon |
|---|---|---|---|
| Low | `rgba(34, 197, 94, 0.15)` | `#22C55E` | 🟢 |
| Moderate | `rgba(234, 179, 8, 0.15)` | `#EAB308` | 🟡 |
| High | `rgba(239, 68, 68, 0.15)` | `#EF4444` | 🔴 |

---

### 2.4 Fade Preview Swatch

**Purpose:** Set realistic client expectations by showing what the color will likely look like after 4–6 weeks of washing and oxidation.

**Layout:**
- Single color block (same size as After swatch = 120×120px desktop, 80×80px mobile).
- Label below: `"Expected fade: Level {fadeLevel} {fadeToneName} in 4–6 weeks"`.
- Subtitle: `"Based on wash frequency and porosity"` (small, muted text).

**Fade Computation:**

```typescript
interface FadePreview {
  level: number;
  tone: ToneFamily;
  hex: string;
}

// Tone warmth shift map: each tone shifts one step toward warmth when fading
const FADE_TONE_SHIFT: Record<ToneFamily, ToneFamily> = {
  ash: 'neutral',
  cool: 'neutral',
  neutral: 'warm',
  pearl: 'warm',
  beige: 'warm',
  warm: 'golden',
  golden: 'copper',
  copper: 'red',
  red: 'warm',      // red fades to warm/brown
  violet: 'neutral', // violet fades to neutral/ash
  mahogany: 'warm',
  chocolate: 'warm',
};

function computeFadePreview(input: FormulationInput): FadePreview {
  // Level drops by 1 (darkens slightly as tone deposits fade)
  const fadeLevel = Math.max(1, input.targetLevel - 1);
  
  // Tone shifts one step warmer
  const fadeTone = FADE_TONE_SHIFT[input.targetTone] || input.targetTone;
  
  // Compute hex: blend faded level with faded tone
  const fadeHex = blendColor(
    HAIR_LEVELS[fadeLevel].hex,
    TONES[fadeTone]?.hex || HAIR_LEVELS[fadeLevel].hex,
    0.30  // lighter tone influence on faded result
  );
  
  return { level: fadeLevel, tone: fadeTone, hex: fadeHex };
}
```

**Special Cases:**
- If `input.targetLevel === 1` (black), fadeLevel stays 1 (cannot go darker).
- If fade tone maps to a tone not in `TONES`, default to `neutral`.

---

### 2.5 Confidence Ring / Gauge

**Purpose:** Visualize formula reliability at a glance. Helps colorists decide whether to proceed, adjust, or strand-test.

**Layout:**
- Circular SVG gauge, 120px diameter.
- Stroke width: 12px.
- Background ring: `rgba(255,255,255,0.08)`.
- Progress ring: color-coded segment.
- Center text: percentage (e.g., "72%").
- Below ring: horizontal row of factor tags.

**Color Segments:**

| Confidence Range | Color | Label |
|---|---|---|
| 0.80 – 1.00 | `#22C55E` (green) | High |
| 0.60 – 0.79 | `#EAB308` (yellow) | Moderate |
| 0.40 – 0.59 | `#F97316` (orange) | Caution |
| 0.00 – 0.39 | `#EF4444` (red) | Low |

**SVG Implementation:**

```typescript
function ConfidenceRing({ confidence, adjustments }: {
  confidence: number;
  adjustments: ConfidenceAdjustment[];
}) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence * circumference);
  
  const color = confidence >= 0.8 ? '#22C55E' :
                confidence >= 0.6 ? '#EAB308' :
                confidence >= 0.4 ? '#F97316' : '#EF4444';
  
  return (
    <div className="confidence-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)" />
      </svg>
      <div className="confidence-text">
        <span className="confidence-percent">{Math.round(confidence * 100)}%</span>
        <span className="confidence-label">{getConfidenceLabel(confidence)}</span>
      </div>
    </div>
  );
}
```

**Factor Tags:**

Each `ConfidenceAdjustment` renders as a small pill:

```typescript
// Tag format: "Factor: -XX%"
// e.g., "Box dye: -15%", "High porosity: -10%"

function FactorTag({ adjustment }: { adjustment: ConfidenceAdjustment }) {
  return (
    <span className="factor-tag">
      {formatFactorName(adjustment.factor)}: -{Math.round(adjustment.reduction * 100)}%
    </span>
  );
}
```

**Tag Styling:**
- Background: `rgba(255,255,255,0.06)`
- Text: `#A1A1AA`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border-radius: `6px`
- Padding: `4px 8px`
- Font-size: `11px`

---

### 2.6 Multi-Session Plan Visual

**Purpose:** When a formula cannot be achieved in one session, show the client a visual timeline of the journey.

**Layout:**
- Horizontal strip on desktop, vertical stack on mobile.
- Each session = a color swatch + level/tone label + arrow to next session.
- Gap indicators between sessions: `"4+ weeks"` label.

**Data Source:**

```typescript
// Uses result.multiSessionPlan array
// Example: ["Session 1: Level 3 → 5", "Session 2: Level 5 → 7", "Session 3: Level 7 → 9"]
```

**Session Color Computation:**

```typescript
function parseSessionTarget(sessionString: string): { level: number; tone: ToneFamily } {
  // Parse "Session N: Level X → Y" format
  const match = sessionString.match(/Level\s+(\d+)/g);
  if (!match) return { level: 5, tone: 'neutral' };
  
  const levels = match.map(m => parseInt(m.replace('Level ', '')));
  const targetLevel = levels[levels.length - 1];
  
  return { level: targetLevel, tone: input.targetTone };
}

function computeSessionHex(sessionString: string, targetTone: ToneFamily): string {
  const { level } = parseSessionTarget(sessionString);
  return blendColor(HAIR_LEVELS[level]?.hex || '#7D5038', TONES[targetTone]?.hex || '#9C8B7A', 0.40);
}
```

**Rendering:**

```tsx
<div className="multi-session-strip">
  {multiSessionPlan.map((session, idx) => (
    <React.Fragment key={idx}>
      <div className="session-step">
        <div className="session-swatch" style={{ backgroundColor: computeSessionHex(session, input.targetTone) }} />
        <span className="session-label">{session}</span>
      </div>
      {idx < multiSessionPlan.length - 1 && (
        <div className="session-gap">
          <span>→</span>
          <span className="gap-label">4+ weeks</span>
        </div>
      )}
    </React.Fragment>
  ))}
</div>
```

**Conditional Rendering:**
- Only render if `result.multiSessionPlan && result.multiSessionPlan.length > 0`.
- If `result.hardStops.length > 0`, show a lock icon overlay on the final session swatch with tooltip: "Hard stop — professional assessment required."

---

## 3. Color Computation Algorithms

### 3.1 Existing `blendColor()` Function

The UI already implements `blendColor(levelHex, toneHex, toneWeight)` in `dashboard/app/formulate/page.tsx`:

```typescript
function blendColor(levelHex: string, toneHex: string, toneWeight = 0.35): string {
  const parse = (h: string) => {
    const v = parseInt(h.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const [lr, lg, lb] = parse(levelHex);
  const [tr, tg, tb] = parse(toneHex);
  const r = Math.round(lr + (tr - lr) * toneWeight);
  const g = Math.round(lg + (tg - lg) * toneWeight);
  const b = Math.round(lb + (tb - lb) * toneWeight);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
```

**Decision:** Reuse this exact function. Extract to `dashboard/lib/color-utils.ts` so both formulation engine and visual components can import it.

### 3.2 Underlying Pigment Hex Map

```typescript
const PIGMENT_HEX_MAP: Record<string, string> = {
  'red': '#A03030',
  'red-orange': '#B85A30',
  'orange': '#D47830',
  'yellow-orange': '#C49040',
  'yellow': '#D4A35A',
  'pale yellow': '#E8C99B',
};

function getPigmentHex(exposed: string | undefined): string {
  return PIGMENT_HEX_MAP[exposed || ''] || '#D4A35A';
}
```

### 3.3 Warmth Gradient Hex Array

For the warmth bar with 5–7 gradient stops:

```typescript
function computeWarmthGradientHex(
  input: FormulationInput,
  result: FormulationResult
): string[] {
  const exposure = computeWarmthExposure(input, result);
  const stops = 7;
  const gradient: string[] = [];
  
  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);  // 0 to 1
    if (t <= 0.33) {
      // Root zone
      const zoneT = t / 0.33;
      gradient.push(blendColor(exposure.root, exposure.midshaft, zoneT));
    } else if (t <= 0.66) {
      // Midshaft zone
      const zoneT = (t - 0.33) / 0.33;
      gradient.push(blendColor(exposure.midshaft, exposure.ends, zoneT));
    } else {
      // Ends zone
      const zoneT = (t - 0.66) / 0.34;
      gradient.push(blendColor(exposure.ends, exposure.ends, zoneT));  // Solid ends
    }
  }
  
  return gradient;
}
```

**Gradient CSS String:**

```typescript
function gradientToCss(gradientHexes: string[]): string {
  const stops = gradientHexes.map((hex, i) => {
    const pct = Math.round((i / (gradientHexes.length - 1)) * 100);
    return `${hex} ${pct}%`;
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}
```

---

## 4. Data Model Changes

### 4.1 New Fields on `FormulationResult`

```typescript
export interface FormulationResult {
  // ... existing fields ...
  
  // Visual Outcome Simulator fields — ADR-013
  expectedResultHex?: string;           // Predicted result hex (target level + tone blend)
  warmthExposure?: {
    root: string;                       // Hex for root zone
    midshaft: string;                   // Hex for midshaft zone
    ends: string;                        // Hex for ends zone
  };
  zoneRisk?: {
    root: 'low' | 'moderate' | 'high';
    midshaft: 'low' | 'moderate' | 'high';
    ends: 'low' | 'moderate' | 'high';
  };
  zoneNotes?: {
    root: string;
    midshaft: string;
    ends: string;
  };
  fadePreview?: {
    level: number;
    tone: ToneFamily;
    hex: string;
  };
  warmthGradientHex?: string[];        // 5–7 gradient stops for warmth bar
}
```

### 4.2 New Computed Fields in `formulate()`

In `dashboard/lib/formulation.ts`, append these computations at the end of the `formulate()` function before returning the result:

```typescript
// ADR-013: Visual Outcome Simulator computed fields
const visualResult = computeVisualOutcome(input, result);

return {
  ...result,
  ...visualResult,
};
```

**Helper function:**

```typescript
function computeVisualOutcome(
  input: FormulationInput,
  result: FormulationResult
): Pick<FormulationResult, 
  'expectedResultHex' | 'warmthExposure' | 'zoneRisk' | 'zoneNotes' | 'fadePreview' | 'warmthGradientHex'
> {
  const expectedResultHex = blendColor(
    HAIR_LEVELS[input.targetLevel].hex,
    TONES[input.targetTone]?.hex || HAIR_LEVELS[input.targetLevel].hex,
    0.45
  );
  
  const warmthExposure = computeWarmthExposure(input, result);
  const { risk: zoneRisk, notes: zoneNotes } = computeZoneRisk(input, result);
  const fadePreview = computeFadePreview(input);
  const warmthGradientHex = computeWarmthGradientHex(input, result);
  
  return {
    expectedResultHex,
    warmthExposure,
    zoneRisk,
    zoneNotes,
    fadePreview,
    warmthGradientHex,
  };
}
```

---

## 5. Component Tree (React Hierarchy)

```
VisualOutcomeSimulator (container)
├── BeforeAfterSwatch
│   ├── ColorBlock (Before)
│   └── ColorBlock (After) [with optional gradient overlay]
├── WarmthExposureBar
│   └── GradientBar (CSS linear-gradient)
├── ZoneRiskBars
│   ├── ZoneRiskBar (Root)
│   ├── ZoneRiskBar (Midshaft)
│   └── ZoneRiskBar (Ends)
├── FadePreviewSwatch
│   └── ColorBlock (Fade)
├── ConfidenceRing
│   ├── SVG Circle (background)
│   ├── SVG Circle (progress)
│   └── FactorTags (horizontal row)
└── MultiSessionPlan (conditional)
    └── SessionStep[] (with gap indicators)
```

### Component Files

| Component | File Path |
|---|---|
| `VisualOutcomeSimulator` | `dashboard/components/visual-outcome/VisualOutcomeSimulator.tsx` |
| `BeforeAfterSwatch` | `dashboard/components/visual-outcome/BeforeAfterSwatch.tsx` |
| `WarmthExposureBar` | `dashboard/components/visual-outcome/WarmthExposureBar.tsx` |
| `ZoneRiskBars` | `dashboard/components/visual-outcome/ZoneRiskBars.tsx` |
| `FadePreviewSwatch` | `dashboard/components/visual-outcome/FadePreviewSwatch.tsx` |
| `ConfidenceRing` | `dashboard/components/visual-outcome/ConfidenceRing.tsx` |
| `MultiSessionPlan` | `dashboard/components/visual-outcome/MultiSessionPlan.tsx` |
| `ColorBlock` | `dashboard/components/visual-outcome/ColorBlock.tsx` (shared) |
| Color utils | `dashboard/lib/color-utils.ts` (extract `blendColor`, `getPigmentHex`, etc.) |

---

## 6. Mobile Responsiveness Rules

| Breakpoint | Layout |
|---|---|
| **< 640px** (mobile) | All components stack vertically. Swatches full-width. Confidence ring centered. Zone risk bars stack. Multi-session plan vertical. |
| **640–1024px** (tablet) | Before/After swatches side-by-side. Warmth bar full-width. Zone risk bars in 3-column grid. Confidence ring left-aligned with tags wrapping. |
| **> 1024px** (desktop) | Full layout: Before/After + Fade preview in 3-column row. Warmth bar below. Zone risks in 3-column row. Confidence ring + tags side-by-side. |

**Container Styling:**

```css
.visual-outcome-simulator {
  display: grid;
  gap: 24px;
  padding: 24px;
  background: rgba(30, 30, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

/* Desktop: 3-column grid for swatches */
@media (min-width: 1024px) {
  .swatch-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
  }
}

/* Tablet: 2-column for swatches, 3-column for zones */
@media (min-width: 640px) and (max-width: 1023px) {
  .swatch-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .zone-risk-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

/* Mobile: stack everything */
@media (max-width: 639px) {
  .swatch-row,
  .zone-risk-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
```

---

## 7. Implementation Notes

### 7.1 No New Dependencies

All components use:
- React + JSX
- CSS inline styles or Tailwind (project already uses Tailwind)
- SVG (native, no library)
- No canvas, no WebGL, no image generation libraries, no D3, no Chart.js.

### 7.2 Performance

- All computations are O(1) — simple color math on small arrays.
- `computeVisualOutcome()` runs once per formulation, not per render.
- Memoize with `useMemo` in React components if `result` is stable.

### 7.3 Accessibility

- All color blocks include `aria-label` describing the color (e.g., `aria-label="Predicted result: Level 7 Ash"`).
- Risk levels use text + color (not color alone) — "High risk" text always visible.
- Confidence ring includes `role="img"` and `aria-label="Confidence: 72%"`.

### 7.4 Theme Consistency

- Background: `rgba(30, 30, 45, 0.6)` (matches existing cards).
- Border: `1px solid rgba(255, 255, 255, 0.06)` (matches existing cards).
- Accent: `#9333EA` (purple) for active/hover states.
- Text: `#F5F5F7` (primary), `#A1A1AA` (secondary), `#71717A` (muted).

### 7.5 Extraction of Shared Color Utils

Move `blendColor()` from `dashboard/app/formulate/page.tsx` to `dashboard/lib/color-utils.ts`:

```typescript
// dashboard/lib/color-utils.ts
export function blendColor(levelHex: string, toneHex: string, toneWeight = 0.35): string {
  const parse = (h: string) => {
    const v = parseInt(h.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const [lr, lg, lb] = parse(levelHex);
  const [tr, tg, tb] = parse(toneHex);
  const r = Math.round(lr + (tr - lr) * toneWeight);
  const g = Math.round(lg + (tg - lg) * toneWeight);
  const b = Math.round(lb + (tb - lb) * toneWeight);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getPigmentHex(exposed: string | undefined): string {
  const map: Record<string, string> = {
    'red': '#A03030',
    'red-orange': '#B85A30',
    'orange': '#D47830',
    'yellow-orange': '#C49040',
    'yellow': '#D4A35A',
    'pale yellow': '#E8C99B',
  };
  return map[exposed || ''] || '#D4A35A';
}
```

Update `page.tsx` to import `blendColor` from `dashboard/lib/color-utils.ts`.

### 7.6 Formulation Engine Integration

In `dashboard/lib/formulation.ts`:
1. Import color utils from `color-utils.ts`.
2. Add the new `FormulationResult` fields (Section 4.1).
3. Call `computeVisualOutcome()` at the end of `formulate()` before returning.
4. Export `computeWarmthExposure`, `computeZoneRisk`, `computeFadePreview`, `computeWarmthGradientHex` for testing.

### 7.7 Component Integration into Results Page

In `dashboard/app/formulate/page.tsx` (Step 6 / Results section):

```tsx
{result && (
  <>
    {/* Existing formula display */}
    <FormulaSteps steps={result.steps} />
    
    {/* NEW: Visual Outcome Simulator */}
    <VisualOutcomeSimulator 
      input={fd} 
      result={result} 
    />
  </>
)}
```

The `VisualOutcomeSimulator` receives the full `FormulationInput` (from form state) and `FormulationResult` (from API/engine).

---

## 8. Testing Checklist

| Test | Expected |
|---|---|
| Before swatch matches `blendColor(currentLevel, currentTone)` | Hex matches manual calculation |
| After swatch with cool target tone + lift shows gradient overlay | CSS `background` is `linear-gradient` |
| Warmth bar for virgin hair | Smooth gradient, no banding labels |
| Warmth bar for previously colored hair | Banding labels visible at 33%/66% |
| High porosity ends | Ends hex is warmer than target |
| Low porosity ends | Ends hex is closer to target |
| Zone risk "high" with hot roots | Root zone shows red pill + warning text |
| Fade preview for ash tone | Faded tone = neutral |
| Fade preview for golden tone | Faded tone = copper |
| Confidence ring at 0.85 | Green stroke, "85%" text |
| Confidence ring at 0.55 | Orange stroke, "55%" text |
| Multi-session plan with 3 sessions | 3 swatches + 2 gap arrows |
| Hard stop result | All swatches grayed out, lock icon on final session |
| Mobile viewport < 640px | All components stack vertically |

---

## 9. Related Documents

- `dashboard/lib/formulation.ts` — Formulation engine (add computed visual fields)
- `dashboard/lib/products.ts` — `HAIR_LEVELS`, `TONES` data
- `dashboard/lib/color-utils.ts` — New shared color utility (extract from `page.tsx`)
- `dashboard/app/formulate/page.tsx` — Form UI (integrate VisualOutcomeSimulator)
- ADR-012 (Chemical History & Safety) — `adjustedConfidence`, `confidenceAdjustments`, `zoneRisk` data sources
- ADR-004 (Camera Capture) — Client photo context

## Next Steps

1. **Extract `blendColor` to `dashboard/lib/color-utils.ts`** — update imports in `page.tsx`.
2. **Add visual fields to `FormulationResult`** in `dashboard/lib/formulation.ts`.
3. **Implement `computeVisualOutcome()`** and helper functions in `dashboard/lib/formulation.ts`.
4. **Create component files** in `dashboard/components/visual-outcome/`.
5. **Add `VisualOutcomeSimulator` to Step 6** of `dashboard/app/formulate/page.tsx`.
6. **Write unit tests** for all color computation functions.
7. **Test responsive layouts** at mobile, tablet, desktop breakpoints.
