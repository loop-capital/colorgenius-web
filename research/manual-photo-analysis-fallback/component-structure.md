# Manual Photo Analysis Fallback — Component Structure

## Overview
When AI photo analysis is unavailable (offline mode, model failure, or user preference), the system falls back to a manual input workflow where stylists directly specify hair parameters.

---

## File Structure

```
packages/web/src/app/manual-analysis/
├── page.tsx                          # Main page orchestrator
├── layout.tsx                        # Optional: manual analysis layout
├── components/
│   ├── ManualAnalysisForm.tsx        # Main form container
│   ├── PhotoUploadWithPreview.tsx    # Reuses PhotoUploader + adds preview
│   ├── HairLevelSelector.tsx         # Visual level 1-10 selector
│   ├── HairConditionSelector.tsx     # Healthy/damaged/processed toggles
│   ├── UndertoneSelector.tsx         # Warm/cool/neutral visual picker
│   ├── ShadeRecommendationEngine.tsx # Results + formula preview
│   └── VisualReferenceGuide.tsx      # Level 1-10 swatch chart
packages/web/src/lib/
├── manual-analysis-engine.ts         # Formulation logic for manual inputs
└── shade-recommender.ts              # Shade matching algorithm
packages/web/src/types/
└── manual-analysis.ts                 # TypeScript interfaces
```

---

## Component Specifications

### 1. ManualAnalysisForm.tsx
**Purpose:** Main form container, manages state and step progression

```typescript
interface ManualAnalysisFormProps {
  clientId?: string;
  onComplete?: (result: ManualAnalysisResult) => void;
  photoUrl?: string; // Optional: if photo was uploaded but AI failed
}

interface ManualAnalysisState {
  step: 'photo' | 'current-level' | 'desired-level' | 'condition' | 'undertone' | 'recommendation';
  photoFile?: File;
  photoPreview?: string;
  currentLevel?: number;
  desiredLevel?: number;
  hairCondition?: 'healthy' | 'damaged' | 'processed' | 'resistant' | 'porous';
  undertone?: 'warm' | 'cool' | 'neutral';
  grayPercentage?: number;
  isVirgin?: boolean;
  brandPreference?: string;
}
```

**Features:**
- Step indicator (progress bar or numbered steps)
- Back/next navigation
- Skip photo option (if no photo available)
- Validation per step
- Auto-save draft to localStorage

---

### 2. PhotoUploadWithPreview.tsx
**Purpose:** Enhanced photo upload with preview and optional AI retry

```typescript
interface PhotoUploadWithPreviewProps {
  photoPreview?: string;
  onPhotoChange: (file: File | null, preview: string | null) => void;
  onRetryAI?: () => void; // Optional: retry AI analysis
  aiFailed?: boolean;
}
```

**Features:**
- Reuses existing PhotoUploader component
- Shows "AI Analysis Unavailable — Manual Entry Required" banner if AI failed
- Allows skipping photo (for walk-ins without photo)
- Photo guidelines tooltip

---

### 3. HairLevelSelector.tsx
**Purpose:** Visual selector for hair color levels 1-10

```typescript
interface HairLevelSelectorProps {
  value?: number;
  onChange: (level: number) => void;
  label: string; // "Current Level" or "Desired Level"
  showReference?: boolean;
}
```

**Features:**
- Horizontal bar of 10 color swatches (levels 1-10)
- Each swatch shows:
  - Color sample (hex from level guide)
  - Level number
  - Level name ("Black", "Dark Brown", etc.)
- Selected state: border highlight + checkmark
- Hover: tooltip with level description
- Optional: "Help me choose" button opens VisualReferenceGuide modal

**Level Colors (Hex):**
```typescript
const LEVEL_COLORS: Record<number, { hex: string; name: string; description: string }> = {
  1: { hex: '#0a0a0a', name: 'Black', description: 'Darkest black, no visible lightness' },
  2: { hex: '#1a1a1a', name: 'Darkest Brown', description: 'Near-black with slight warmth' },
  3: { hex: '#2d1f10', name: 'Dark Brown', description: 'Deep brown, minimal reflection' },
  4: { hex: '#3d2a1a', name: 'Dark Chestnut', description: 'Rich brown with subtle warmth' },
  5: { hex: '#5c3d2a', name: 'Chestnut Brown', description: 'Medium brown, natural warmth' },
  6: { hex: '#7a5240', name: 'Medium Brown', description: 'Dark blonde/light brown boundary' },
  7: { hex: '#9c7054', name: 'Dark Blonde', description: 'Bronze/dark golden tones' },
  8: { hex: '#c4a882', name: 'Medium Blonde', description: 'Golden/medium blonde' },
  9: { hex: '#e0c8a8', name: 'Light Blonde', description: 'Pale golden blonde' },
  10: { hex: '#f5ead8', name: 'Lightest Blonde', description: 'Platinum/palest blonde' },
};
```

---

### 4. HairConditionSelector.tsx
**Purpose:** Select hair condition with visual indicators

```typescript
interface HairConditionSelectorProps {
  value?: 'healthy' | 'damaged' | 'processed' | 'resistant' | 'porous';
  onChange: (condition: string) => void;
}
```

**Options:**
| Option | Icon | Description | Developer Impact |
|--------|------|-------------|------------------|
| Healthy | Shield | Virgin or minimally treated | Standard developer |
| Damaged | AlertTriangle | Breakage, split ends, over-processed | Lower volume + bond builder |
| Processed | Layers | Previous color, highlights, perms | Adjust timing, may need filler |
| Resistant | Lock | Gray, coarse, color-resistant | Higher volume + extended time |
| Porous | Droplets | Absorbs color quickly, fades fast | Lower volume, monitor closely |

---

### 5. UndertoneSelector.tsx
**Purpose:** Visual picker for hair undertone

```typescript
interface UndertoneSelectorProps {
  value?: 'warm' | 'cool' | 'neutral';
  onChange: (undertone: string) => void;
  showHelp?: boolean;
}
```

**Options:**
| Option | Color Swatch | Description | Formulation Impact |
|--------|-------------|-------------|-------------------|
| Warm | 🟨 Golden/yellow | Yellow, gold, orange undertones | May need ash to neutralize |
| Cool | 🟦 Ashy/violet | Blue, violet, green undertones | May need gold to warm up |
| Neutral | ⬜ Balanced | Mix of warm and cool | Most flexible |

**Help Text:**
> "Look at your client's hair in natural light. If you see yellow/golden = Warm. If you see blue/violet = Cool. If neither stands out = Neutral."

---

### 6. ShadeRecommendationEngine.tsx
**Purpose:** Display recommended shades and formulation preview

```typescript
interface ShadeRecommendationProps {
  manualResult: ManualAnalysisResult;
  onSelectShade: (shade: Shade) => void;
  onGenerateFormula: () => void;
  onEditInputs: () => void;
}

interface ManualAnalysisResult {
  currentLevel: number;
  desiredLevel: number;
  hairCondition: string;
  undertone: string;
  grayPercentage?: number;
  recommendedShades: Shade[];
  liftRequired: number;
  warnings: string[];
  confidence: number;
}
```

**Features:**
- Summary card of inputs
- Recommended shades list (top 3-5 matches)
  - Shade swatch (RGB from database)
  - Shade code + name
  - Match confidence %
  - "Select" button
- Formula preview (if shade selected)
  - Developer recommendation
  - Processing time
  - Warnings
- "Edit Inputs" button to go back

---

### 7. VisualReferenceGuide.tsx
**Purpose:** Modal/chart showing all 10 levels for reference

**Features:**
- Full-screen modal or sidebar panel
- 10 large swatches with:
  - Level number
  - Name
  - Description
  - Example photo (stock image of hair at that level)
  - Common undertones at that level
- "How to Determine Level" instructional text
- Printable version

---

## Data Flow

```
User Uploads Photo
    ↓
[AI Analysis Attempt] → Success → Show AI Results → Done
    ↓
  Failure / Offline
    ↓
ManualAnalysisForm (step: photo)
    ↓
User selects/skips photo → Next
    ↓
HairLevelSelector (step: current-level)
    ↓
User selects current level → Next
    ↓
HairLevelSelector (step: desired-level)
    ↓
User selects desired level → Next
    ↓
HairConditionSelector (step: condition)
    ↓
User selects condition → Next
    ↓
UndertoneSelector (step: undertone)
    ↓
User selects undertone → Next
    ↓
ShadeRecommendationEngine (step: recommendation)
    ↓
User selects shade → Generate Formula → Show FormulaCard
```

---

## API Endpoints

```typescript
// POST /api/manual-analysis
// Generates recommendations from manual inputs

interface ManualAnalysisRequest {
  current_level: number;
  desired_level: number;
  hair_condition: 'healthy' | 'damaged' | 'processed' | 'resistant' | 'porous';
  undertone: 'warm' | 'cool' | 'neutral';
  gray_percentage?: number;
  is_virgin?: boolean;
  preferred_brand?: string;
  photo_url?: string;
}

interface ManualAnalysisResponse {
  success: boolean;
  data: {
    analysis_id: string;
    recommended_shades: Shade[];
    lift_required: number;
    warnings: string[];
    confidence: number;
    // Can be passed to /api/formulate to generate full formula
    formulation_ready: boolean;
  };
}
```

---

## Integration Points

| Existing Component | Integration |
|---------------------|-------------|
| PhotoUploader.tsx | Reused in PhotoUploadWithPreview |
| FormulaCard.tsx | Reused in ShadeRecommendationEngine |
| ColorSwatch.tsx | Reused in HairLevelSelector |
| LoadingSpinner.tsx | Used during recommendation generation |
| /api/formulate/route.ts | Called after shade selection |
| /api/analyze/route.ts | Falls back to manual on failure |

---

## State Management

```typescript
// Zustand store (recommended)
interface ManualAnalysisStore {
  draft: Partial<ManualAnalysisState>;
  setDraft: (draft: Partial<ManualAnalysisState>) => void;
  clearDraft: () => void;
  submitManualAnalysis: () => Promise<ManualAnalysisResult>;
}
```

---

## Responsive Design

- **Mobile (< 640px):** Single column, stacked steps, full-width selectors
- **Tablet (640-1024px):** Two-column layout (form left, preview right)
- **Desktop (> 1024px):** Three-column (nav steps | form | live preview)

---

*Document Version: 1.0*
*For: ColorGenius Beta — August 2026*
