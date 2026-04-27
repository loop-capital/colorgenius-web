# Manual Photo Analysis Fallback — Data Schemas

## Overview
Database schemas and TypeScript interfaces for the manual photo analysis fallback system.

---

## 1. Manual Analysis Input Schema

### TypeScript Interface

```typescript
// types/manual-analysis.ts

export interface ManualAnalysisInput {
  /** Unique analysis ID */
  analysis_id: string;
  
  /** User who performed the analysis */
  user_id: string;
  
  /** Client being analyzed */
  client_id?: string;
  
  /** Timestamp */
  created_at: string;
  
  /** Photo metadata (if photo was uploaded) */
  photo?: {
    url: string;
    size_bytes: number;
    width: number;
    height: number;
    format: 'jpg' | 'png' | 'webp';
    ai_analysis_failed: boolean;
    ai_error?: string;
  };
  
  /** Manual inputs from stylist */
  manual_inputs: {
    /** Current hair color level (1-10) */
    current_level: number;
    
    /** Desired hair color level (1-10) */
    desired_level: number;
    
    /** Hair condition assessment */
    hair_condition: 'healthy' | 'damaged' | 'processed' | 'resistant' | 'porous';
    
    /** Hair undertone */
    undertone: 'warm' | 'cool' | 'neutral';
    
    /** Percentage of gray hair (0-100) */
    gray_percentage: number;
    
    /** Whether hair is virgin (never colored) */
    is_virgin: boolean;
    
    /** Texture type (affects developer selection) */
    hair_texture?: 'fine' | 'medium' | 'coarse';
    
    /** Previous color treatments */
    previous_treatments?: string[];
    
    /** Any known allergies or sensitivities */
    allergies?: string[];
    
    /** Preferred brand (optional) */
    preferred_brand?: string;
    
    /** Additional notes from stylist */
    stylist_notes?: string;
  };
  
  /** Computed values */
  computed: {
    /** Levels of lift required (can be negative for deposit) */
    lift_required: number;
    
    /** Whether pre-lightening is needed */
    requires_pre_lightening: boolean;
    
    /** Confidence score of manual analysis */
    confidence: number;
    
    /** Risk flags */
    risk_flags: string[];
  };
  
  /** Analysis result */
  result?: {
    /** Recommended shades */
    recommended_shades: RecommendedShade[];
    
    /** Selected shade (if chosen) */
    selected_shade?: RecommendedShade;
    
    /** Generated formulation (if formula generated) */
    formulation?: Formulation;
    
    /** Warnings */
    warnings: string[];
    
    /** Processing recommendations */
    processing_recommendations: {
      developer_volume: number;
      processing_time_minutes: number;
      use_bond_builder: boolean;
      use_heat: boolean;
    };
  };
  
  /** Whether this was an AI fallback */
  is_fallback: boolean;
  
  /** Source of analysis */
  source: 'manual' | 'ai_fallback' | 'ai_success';
}

export interface RecommendedShade {
  /** Shade ID from database */
  shade_id: string;
  
  /** Display code */
  shade_code: string;
  
  /** Shade name */
  name: string;
  
  /** Brand */
  brand: string;
  
  /** Product line */
  product_line: string;
  
  /** Color level */
  level: number;
  
  /** Primary tone */
  primary_tone: string;
  
  /** RGB representation */
  rgb: [number, number, number];
  
  /** Hex color */
  hex: string;
  
  /** Match score (0-1) */
  match_score: number;
  
  /** Why this shade was recommended */
  recommendation_reason: string;
  
  /** Rank in recommendations (1 = best) */
  rank: number;
}
```

---

## 2. Database Schema (PostgreSQL)

### Table: manual_analyses

```sql
CREATE TABLE manual_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    
    -- Photo metadata
    photo_url TEXT,
    photo_width INT,
    photo_height INT,
    photo_format VARCHAR(10),
    ai_analysis_failed BOOLEAN DEFAULT false,
    ai_error TEXT,
    
    -- Manual inputs
    current_level INT NOT NULL CHECK (current_level BETWEEN 1 AND 12),
    desired_level INT NOT NULL CHECK (desired_level BETWEEN 1 AND 12),
    hair_condition VARCHAR(20) NOT NULL CHECK (hair_condition IN ('healthy', 'damaged', 'processed', 'resistant', 'porous')),
    undertone VARCHAR(10) NOT NULL CHECK (undertone IN ('warm', 'cool', 'neutral')),
    gray_percentage INT NOT NULL DEFAULT 0 CHECK (gray_percentage BETWEEN 0 AND 100),
    is_virgin BOOLEAN DEFAULT true,
    hair_texture VARCHAR(10) CHECK (hair_texture IN ('fine', 'medium', 'coarse')),
    preferred_brand VARCHAR(100),
    stylist_notes TEXT,
    
    -- Computed values
    lift_required INT,
    requires_pre_lightening BOOLEAN DEFAULT false,
    confidence DECIMAL(3,2),
    risk_flags TEXT[],
    
    -- Result
    selected_shade_id UUID REFERENCES shades(id),
    formulation_id UUID REFERENCES formulations(id),
    warnings TEXT[],
    
    -- Metadata
    is_fallback BOOLEAN DEFAULT false,
    source VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_manual_analyses_user ON manual_analyses(user_id);
CREATE INDEX idx_manual_analyses_client ON manual_analyses(client_id);
CREATE INDEX idx_manual_analyses_created ON manual_analyses(created_at DESC);
CREATE INDEX idx_manual_analyses_fallback ON manual_analyses(is_fallback) WHERE is_fallback = true;
```

### Table: manual_analysis_recommended_shades

```sql
CREATE TABLE manual_analysis_recommended_shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_analysis_id UUID NOT NULL REFERENCES manual_analyses(id) ON DELETE CASCADE,
    shade_id UUID NOT NULL REFERENCES shades(id),
    match_score DECIMAL(3,2) NOT NULL CHECK (match_score BETWEEN 0 AND 1),
    recommendation_reason TEXT NOT NULL,
    rank INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(manual_analysis_id, shade_id)
);

CREATE INDEX idx_recommended_shades_analysis ON manual_analysis_recommended_shades(manual_analysis_id);
```

---

## 3. Shade Recommendation Engine Schema

### Recommendation Logic

```typescript
// lib/manual-analysis-engine.ts

interface RecommendationParams {
  currentLevel: number;
  desiredLevel: number;
  undertone: 'warm' | 'cool' | 'neutral';
  hairCondition: 'healthy' | 'damaged' | 'processed' | 'resistant' | 'porous';
  grayPercentage: number;
  isVirgin: boolean;
  preferredBrand?: string;
}

interface RecommendationResult {
  recommendedShades: RecommendedShade[];
  liftRequired: number;
  requiresPreLightening: boolean;
  confidence: number;
  warnings: string[];
  developerRecommendation: DeveloperRecommendation;
  processingRecommendation: ProcessingRecommendation;
}

interface DeveloperRecommendation {
  volume: number; // 10, 20, 30, 40
  reason: string;
  alternatives: number[];
}

interface ProcessingRecommendation {
  baseTimeMinutes: number;
  maxTimeMinutes: number;
  useHeat: boolean;
  useBondBuilder: boolean;
  notes: string[];
}
```

### Recommendation Algorithm

```
Input: ManualAnalysisInput
Output: RecommendationResult

1. Calculate lift_required = desired_level - current_level

2. Determine if pre-lightening is needed:
   - If lift_required > 3 AND not virgin → requires_pre_lightening = true
   - If lift_required > 4 → requires_pre_lightening = true
   - If previous_color AND lift_required > 0 → requires_pre_lightening = true

3. Filter shades by:
   - Brand preference (if specified)
   - Level = desired_level (or nearest available)
   - Tone compatibility with undertone:
     * Warm undertone → suggest N, G, R, C tones
     * Cool undertone → suggest N, A, V tones
     * Neutral → all tones acceptable

4. Adjust for hair condition:
   - Damaged → cap developer at 20vol, suggest bond builder
   - Porous → cap developer at 20vol, reduce processing time
   - Resistant → suggest 30-40vol, extend time
   - Processed → require filler for level changes

5. Adjust for gray coverage:
   - gray > 30% → prioritize natural (N) series
   - gray > 50% → require natural series
   - gray > 75% → suggest specialized gray coverage shades

6. Calculate confidence:
   - Base confidence: 0.85
   - -0.05 if hair_condition is damaged/processed
   - -0.05 if lift_required > 2
   - -0.03 if not virgin
   - -0.05 if gray > 50%
   - +0.05 if undertone is neutral (easier to match)

7. Generate warnings based on risk factors

8. Return top 5 recommended shades sorted by match_score
```

---

## 4. Validation Rules

```typescript
// lib/manual-analysis-validation.ts

export const validationRules = {
  currentLevel: {
    required: true,
    min: 1,
    max: 12,
    message: 'Current level must be between 1 and 12',
  },
  desiredLevel: {
    required: true,
    min: 1,
    max: 12,
    message: 'Desired level must be between 1 and 12',
  },
  hairCondition: {
    required: true,
    allowed: ['healthy', 'damaged', 'processed', 'resistant', 'porous'],
    message: 'Please select a hair condition',
  },
  undertone: {
    required: true,
    allowed: ['warm', 'cool', 'neutral'],
    message: 'Please select an undertone',
  },
  grayPercentage: {
    required: true,
    min: 0,
    max: 100,
    message: 'Gray percentage must be between 0 and 100',
  },
};

export function validateManualInput(input: Partial<ManualAnalysisInput['manual_inputs']>): string[] {
  const errors: string[] = [];
  
  if (!input.current_level || input.current_level < 1 || input.current_level > 12) {
    errors.push(validationRules.currentLevel.message);
  }
  
  if (!input.desired_level || input.desired_level < 1 || input.desired_level > 12) {
    errors.push(validationRules.desiredLevel.message);
  }
  
  if (!input.hair_condition) {
    errors.push(validationRules.hairCondition.message);
  }
  
  if (!input.undertone) {
    errors.push(validationRules.undertone.message);
  }
  
  if (input.gray_percentage === undefined || input.gray_percentage < 0 || input.gray_percentage > 100) {
    errors.push(validationRules.grayPercentage.message);
  }
  
  // Business logic validations
  if (input.desired_level && input.current_level && input.desired_level > input.current_level + 4) {
    errors.push('Warning: Lift of more than 4 levels may require multiple sessions');
  }
  
  if (input.desired_level && input.current_level && input.desired_level < input.current_level - 2) {
    errors.push('Warning: Deposit of more than 2 levels is unusual — verify desired level');
  }
  
  return errors;
}
```

---

## 5. Mock Data for Development

```typescript
// mocks/manual-analysis-mocks.ts

export const mockManualAnalysisResult: ManualAnalysisResult = {
  analysis_id: 'manual-123456',
  user_id: 'user-789',
  client_id: 'client-abc',
  created_at: new Date().toISOString(),
  
  manual_inputs: {
    current_level: 6,
    desired_level: 8,
    hair_condition: 'healthy',
    undertone: 'warm',
    gray_percentage: 0,
    is_virgin: true,
    hair_texture: 'medium',
    preferred_brand: 'Wella Koleston Perfect ME+',
  },
  
  computed: {
    lift_required: 2,
    requires_pre_lightening: false,
    confidence: 0.90,
    risk_flags: [],
  },
  
  result: {
    recommended_shades: [
      {
        shade_id: 'shade-1',
        shade_code: '8/3',
        name: 'Light Blonde Gold',
        brand: 'Wella Koleston Perfect ME+',
        product_line: 'Koleston Perfect ME+',
        level: 8,
        primary_tone: 'G',
        rgb: [200, 160, 96],
        hex: '#c8a060',
        match_score: 0.95,
        recommendation_reason: 'Perfect match for warm undertone, 2-level lift on healthy virgin hair',
        rank: 1,
      },
      {
        shade_id: 'shade-2',
        shade_code: '8/0',
        name: 'Light Blonde Natural',
        brand: 'Wella Koleston Perfect ME+',
        product_line: 'Koleston Perfect ME+',
        level: 8,
        primary_tone: 'N',
        rgb: [184, 144, 80],
        hex: '#b89050',
        match_score: 0.88,
        recommendation_reason: 'Safe natural base for golden blonde results',
        rank: 2,
      },
      {
        shade_id: 'shade-3',
        shade_code: '8/38',
        name: 'Light Blonde Beige Gold',
        brand: 'Wella Koleston Perfect ME+',
        product_line: 'Koleston Perfect ME+',
        level: 8,
        primary_tone: 'G',
        rgb: [220, 190, 130],
        hex: '#dcbe82',
        match_score: 0.82,
        recommendation_reason: 'Beige-gold for dimensional warmth',
        rank: 3,
      },
    ],
    warnings: [],
    processing_recommendations: {
      developer_volume: 30,
      processing_time_minutes: 35,
      use_bond_builder: false,
      use_heat: false,
    },
  },
  is_fallback: true,
  source: 'ai_fallback',
};
```

---

*Document Version: 1.0*
*For: ColorGenius Beta — August 2026*
