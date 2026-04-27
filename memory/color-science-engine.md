# Color Science Engine - Technical Specification

## Executive Summary

The Color Science Engine is the computational core of Color Genius, encoding 100+ years of professional hair color theory into precise mathematical models. This document covers the chemistry, physics, and formulation logic required to generate accurate color formulas.

---

## Part 1: Hair Biology & Color Fundamentals

### 1.1 Hair Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HAIR STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CROSS-SECTION                    STRAND VIEW                            │
│                                                                          │
│  ┌─────────────────┐              ┌───────────────────────────────┐    │
│  │  \\             │              │  Cuticle (Protective Layer)  │    │
│  │   \\  CORTEX    │              │         ↓                    │    │
│  │    \\________   │              │  Cortex (Color & Strength)  │    │
│  │   //        \\  │              │         ↓                    │    │
│  │  //  MEDULLA  \\ │              │  Medulla (Core)             │    │
│  │ //            \\│              └───────────────────────────────┘    │
│  ├─────────────────┤                                                     │
│  │    CUTICLE     │              COMPOSITION:                          │
│  │   (6-10 layers)│              • Keratin: 65-95%                   │
│  │                │              • Water: 10-13%                       │
│  └─────────────────┘              • Lipids: 3%                         │
│                                    • Melanin: 1-3%                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Melanin Types

Hair color is determined by two melanin pigments in the cortex:

| Melanin Type | Color | Chemical Structure | Distribution |
|--------------|-------|-------------------|--------------|
| **Eumelanin** | Brown to Black | Eumelanin polymer (5,6-dihydroxyindole units) | Dense, tightly packed |
| **Pheomelanin** | Yellow to Red | Benzothiazine units | More dispersed |

**Key Insight:** 
- Black hair: 95%+ eumelanin
- Brown hair: Mixed eumelanin + pheomelanin
- Blonde hair: Reduced melanin overall
- Red hair: High pheomelanin (MC1R gene variant)

### 1.3 Level System (1-10 Scale)

The professional level system quantifies hair lightness based on melanin concentration:

```
LEVEL 1                    LEVEL 5                   LEVEL 10
┌─────────┐               ┌─────────┐               ┌─────────┐
│ ▓▓▓▓▓▓▓ │               │ ▓▓▓▓░░░ │               │ ░░░░░░░ │
│ ▓▓▓▓▓▓▓ │               │ ▓▓▓▓░░░ │               │ ░░░░░░░ │
│ BLACK   │               │ LIGHT   │               │ PLATINUM│
└─────────┘               │ BROWN   │               │ BLONDE  │
   BLACK                  └─────────┘               └─────────┘
   100% melanin              40% melanin                5% melanin
```

**Complete Level Scale:**

| Level | Description | Melanin % | Underlying Pigment | Lift Required |
|-------|-------------|-----------|-------------------|---------------|
| 1 | Black | 95% | Darkest brown/red | Max |
| 2 | Very Dark Brown | 85% | Dark brown/red | 1-2 levels |
| 3 | Dark Brown | 75% | Brown/red | 2-3 levels |
| 4 | Medium Brown | 60% | Red/orange | 3-4 levels |
| 5 | Light Brown | 45% | Red/orange | 4-5 levels |
| 6 | Dark Blonde | 30% | Orange/gold | 5-6 levels |
| 7 | Medium Blonde | 20% | Yellow/gold | 6-7 levels |
| 8 | Light Blonde | 12% | Pale yellow | 7-8 levels |
| 9 | Very Light Blonde | 6% | Palest yellow | 8-9 levels |
| 10 | Lightest Blonde | 2% | Almost white | 9+ levels |

**The Underlying Pigment Phenomenon:**

When lifting hair color, the natural pigment breaks down in stages:
1. Black (Level 1) → Dark Brown (Level 3) → Red undertone emerges
2. Dark Brown → Light Brown (Level 5) → Orange undertone emerges
3. Light Brown → Dark Blonde (Level 6) → Gold/yellow undertone emerges
4. Dark Blonde → Light Blonde (Level 8) → Pale yellow undertone

This is why lifting from black to blonde exposes red/orange stages that must be neutralized.

---

## Part 2: Developer Chemistry

### 2.1 Hydrogen Peroxide Chemistry

Developer (H₂O₂) works through oxidation:

```
REACTION MECHANISM:

Hair Color Alkaline Agent (Ammonia/MEA) + Developer (H₂O₂) + Heat
                              ↓
              Cuticle opens + Melanin oxidizes
                              ↓
              Natural pigment breaks down + New pigment deposited
                              ↓
                  Oxidative Coupling (dye formation)
                              ↓
                         Final Color
```

**Peroxide Concentration by Volume:**

| Volume | % H₂O₂ | Lift Capability | Deposit Capability | Processing Time |
|--------|--------|----------------|-------------------|-----------------|
| 5 Vol | 1.5% | None | Deposits only | 15-20 min |
| 10 Vol | 3% | 0 levels | Deposits + slight lift | 20 min |
| 15 Vol | 4.5% | 0-1 levels | Deposit with minimal lift | 25 min |
| 20 Vol | 6% | 1-2 levels | Balanced lift/deposit | 30-35 min |
| 30 Vol | 9% | 2-3 levels | Maximum safe lift | 30-40 min |
| 40 Vol | 12% | 3-4 levels | High lift (damaging) | 40-50 min |
| 50 Vol | 15% | 4+ levels | Professional use only | Variable |

### 2.2 Developer Selection Algorithm

```python
class DeveloperSelector:
    """
    Intelligent developer volume selection with multi-factor analysis.
    """
    
    def calculate_optimal_developer(
        self,
        current_level: int,
        target_level: int,
        hair_condition: dict,
        previous_color: bool,
        gray_percentage: int,
        target_tone: str,
        color_type: str  # permanent, demi, semi
    ) -> DeveloperRecommendation:
        
        # Base calculation from lift requirement
        levels_needed = target_level - current_level
        base_volume = self._base_volume_for_lift(levels_needed)
        
        # Adjustments
        adjustments = []
        final_volume = base_volume
        
        # Hair condition adjustments
        if hair_condition["porosity"] == "high":
            final_volume = min(final_volume, 20)  # Cap at 20 vol
            adjustments.append("Lowered volume for high porosity")
        
        if hair_condition["elasticity"] < 30:  # Poor elasticity
            final_volume = min(final_volume, 20)
            adjustments.append("Reduced for compromised elasticity")
        
        if hair_condition["damage_score"] > 0.7:
            final_volume = min(final_volume, 15)
            adjustments.append("Gentle processing for damaged hair")
        
        # Previous color adjustments
        if previous_color and levels_needed > 2:
            final_volume = min(final_volume, 30)
            adjustments.append("Limited lift due to color buildup")
        
        # Gray coverage requirements
        if gray_percentage > 50:
            if base_volume < 20:
                final_volume = 20  # Need at least 20 vol for gray
                adjustments.append("Increased for resistant gray coverage")
        
        # Tone-specific adjustments
        if target_tone in ["A", "V", "B"]:  # Cool tones
            processing_time = self._extend_time_for_toning(final_volume)
        else:
            processing_time = self._standard_time(final_volume)
        
        return DeveloperRecommendation(
            volume=final_volume,
            processing_time=processing_time,
            rationale=adjustments,
            warnings=self._generate_warnings(...)
        )
```

### 2.3 Processing Time Calculation

Processing time varies by developer strength and desired result:

```
FORMULA: Processing Time (minutes)

Base Time = Developer Volume Factor × Hair Condition Factor × Goal Factor

Developer Volume Factor:
- 10 vol: 20 min
- 20 vol: 30 min  
- 30 vol: 35 min
- 40 vol: 45 min

Hair Condition Multipliers:
- Virgin hair: 1.0×
- Resistant/gray: 1.15×
- Porous/damaged: 0.85×

Goal Multipliers:
- Deposit only: 0.9×
- 1-2 levels lift: 1.0×
- 3+ levels lift: 1.1×
- Maximum lift: 1.2×

Example: 30 vol on resistant gray hair lifting 2 levels
35 × 1.15 × 1.0 = 40 minutes
```

---

## Part 3: Color Theory & Formulation

### 3.1 The Color Wheel for Hair

Professional hair color uses a modified color wheel accounting for underlying pigments:

```
                    VIOLET (V)
                       ↑
                       │
    RED-VIOLET ←───────┼───────→ BLUE-VIOLET
         (RV)          │            (BV)
                       │
    RED ←──────────────┼──────────────→ BLUE
         (R)           │            (B)
                       │
    ORANGE-RED ←───────┼───────→ BLUE-GREEN
         (RO)          │            (BG)
                       │
                    GREEN (G)
                       │
         ORANGE ←──────┴──────→ YELLOW-GREEN
            (O)            (YG)
                       │
                       ↓
                   YELLOW (Y)
                   / GOLD (G)
```

### 3.2 Tone Families & Codes

| Code | Tone | Description | Best For |
|------|------|-------------|----------|
| **N** | Natural | Neutral, balanced | Gray coverage, subtle results |
| **A** | Ash | Cool, blue-green base | Neutralizing warmth, gray coverage |
| **G** | Gold | Warm yellow | Adding warmth, golden results |
| **B** | Beige | Neutral-warm | Natural-looking warmth |
| **V** | Violet | Purple, cool | Toning yellow, silver results |
| **R** | Red | Pure red | Vibrant red results |
| **C** | Copper | Orange-red | Warm copper tones |
| **K** | Copper | Copper-brown | Rich copper results |
| **M** | Mauve | Purple-pink | Fashion-forward cool tones |
| **O** | Orange | Pure orange | Corrective work |
| **P** | Pearl | Iridescent cool | Toning, silver blonde |
| **S** | Silver | Metallic gray | Gray blending, fashion shades |
| **W** | Warm | Golden warmth | Intensifying warmth |

### 3.3 Neutralization Chart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     UNWANTED TONE → NEUTRALIZER                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Unwanted Tone          Cause                    Neutralizer            │
│  ─────────────          ─────                    ──────────            │
│                                                                          │
│  Orange/Brassy     Lifting dark hair         Blue-Violet (V, A)        │
│  Yellow            Lifting blonde            Violet (V, P)             │
│  Gold/Yellow-Orange Natural blonde           Ash (A), Violet (V)       │
│  Red               Color fading                Green-Ash (A)             │
│  Green (over-toned) Too much ash             Red (R), Copper (C)      │
│  Purple/Grey       Too much violet           Gold (G), Yellow (Y)      │
│  Warm Brassy       Natural warmth              Blue (A, V)             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Formulation Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FORMULATION DECISION TREE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  START: Client consultation + Assessment                                │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ What is the CURRENT level?                              │           │
│  └─────────────────────────────────────────────────────────┘           │
│                              │                                          │
│         ┌──────────────────┼──────────────────┐                         │
│         ▼                  ▼                  ▼                         │
│     Level 1-3          Level 4-6           Level 7-10                    │
│   (Dark/Black)      (Brown Range)       (Blonde Range)                  │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│  │ Previous     │   │ Previous     │   │ Previous     │               │
│  │ color?       │   │ color?       │   │ color?       │               │
│  └──────────────┘   └──────────────┘   └──────────────┘               │
│    Yes    No          Yes    No           Yes    No                    │
│     │      │           │      │            │      │                   │
│     ▼      ▼           ▼      ▼            ▼      ▼                   │
│  Color   Virgin     Color   Virgin      Color   Virgin                 │
│  Buildup  Hair      Buildup  Hair       Buildup  Hair                  │
│     │      │           │      │            │      │                   │
│     ▼      ▼           ▼      ▼            ▼      ▼                   │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ Apply corrective protocol (see section 4)            │           │
│  └─────────────────────────────────────────────────────────┘           │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ What is the TARGET?                                    │           │
│  └─────────────────────────────────────────────────────────┘           │
│                              │                                          │
│         ┌──────────────────┼──────────────────┐                         │
│         ▼                  ▼                  ▼                         │
│    Same/Darker          1-2 Levels        3+ Levels                   │
│     (Deposit)            Lift              Lift                        │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│    10-20 Vol          20-30 Vol          30-40 Vol                     │
│    Deposit only       Gentle lift        Maximum lift                  │
│    (+ possible        (+ neutralize      (+ pre-fill                 │
│     gray cover)        exposed tones)     + neutralize)               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Gray Coverage

### 4.1 Gray Hair Biology

Gray hair lacks melanin and has:
- Tightly packed cuticle layers (resistant to color penetration)
- Sometimes wiry texture
- May have yellow discoloration from environmental factors

### 4.2 Gray Coverage Formulation

**Rules for 100% Gray Coverage:**

1. **Use Natural (N) Series:** Base formula with N-series shade (contains equal parts all three primary colors)
2. **20 Volume Minimum:** Need oxidative power to penetrate resistant cuticle
3. **Extended Processing:** Add 5-10 minutes to standard time
4. **Application Technique:** Apply to grayest areas first

**Gray Coverage Formula Examples:**

```
Scenario: 75% gray, Level 6 natural brown target

Formula:
├── Base: Level 6N (Natural series) - 50%
├── Tone: Level 6G (Gold) - 30% (warmth for blending)
└── Corrector: Level 6A (Ash) - 20% (if yellow tones present)

Mix: 1:1 with 20 Volume Developer
Process: 35-40 minutes
```

**Double-N Series Rule:**
- For resistant gray (over 75%), use "double N" (e.g., 6NN in many color lines)
- These have extra natural pigment for coverage
- Always pair with 20-30 volume developer

---

## Part 5: Lift and Deposit Calculations

### 5.1 Maximum Lift by Level

| Starting Level | Natural Lift (20 vol) | Maximum Lift (40 vol) | Underlying Pigment Exposed |
|---------------|------------------------|----------------------|---------------------------|
| 1 (Black) | To Level 3 | To Level 5 | Red-Orange |
| 2 (Very Dark Brown) | To Level 4 | To Level 6 | Red-Orange |
| 3 (Dark Brown) | To Level 5 | To Level 6-7 | Orange |
| 4 (Medium Brown) | To Level 6 | To Level 7-8 | Orange-Gold |
| 5 (Light Brown) | To Level 7 | To Level 8-9 | Gold-Yellow |
| 6 (Dark Blonde) | To Level 8 | To Level 9 | Yellow |
| 7+ | To Level 9 | To Level 10 | Pale Yellow |

### 5.2 Deposition Rules

**Color Cannot Lift Color:**
- Permanent color on previously colored hair only deposits
- Must use lightener (bleach) to remove artificial pigment
- Exception: High-lift tints can achieve 3-4 levels on virgin hair only

**High-Lift Tint Limitations:**
- Only work on natural (virgin) hair
- Natural base must be Level 5 or lighter
- Will not lift through artificial color
- Typically use 30-40 volume developer

---

## Part 6: Corrective Color

### 6.1 Color Removal

**Methods (in order of gentleness):**

1. **Clarifying Shampoo** - Removes surface buildup
2. **Color Remover (like Color Oops)** - Shrinks dye molecules for removal
3. **Bleach Bath** - Diluted lightener for gentle removal
4. **Full Bleach** - Complete pigment removal (most aggressive)

### 6.2 Filling the Hair

When lightening more than 4 levels OR depositing on bleached hair, you must "fill" missing underlying pigment:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FILL CHART                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Target Level           Fill Color                    Process          │
│  ───────────            ──────────                    ───────          │
│                                                                          │
│  Level 5 (Light Brown)  Level 6 Gold or Orange       10-15 min           │
│  Level 4 (Medium Brown) Level 5 Orange or Red-Orange 10-15 min          │
│  Level 3 (Dark Brown)   Level 4 Red-Orange or Red    10-15 min          │
│  Level 2+               Level 3 Red or Red-Violet    15 min             │
│                                                                          │
│  Rule: Fill ONE level lighter than target, with the undertone of        │
│        the target level.                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Banding Correction

Banding occurs from overlapping color applications:

```
Visual:
    ROOTS         MIDS           ENDS
    [5]   ←────   [6]   ←────   [7]
   Fresh      Overlapped    Most previously colored

Correction Strategy:
1. Apply color to mid-lengths FIRST (most resistant)
2. Wait 10 minutes
3. Apply to ends (porous, need less time)
4. Wait 5 minutes  
5. Apply to roots (fresh growth, develops quickly)
6. Process remaining time
```

---

## Part 7: Mathematical Models

### 7.1 Color Difference (Delta E)

Color Genius uses CIE76 and CIEDE2000 Delta E for color matching:

```python
import numpy as np
from skimage.color import rgb2lab

def delta_e_cie76(lab1, lab2):
    """
    Calculate color difference in CIELAB space.
    """
    return np.sqrt(
        (lab1[0] - lab2[0])**2 +
        (lab1[1] - lab2[1])**2 +
        (lab1[2] - lab2[2])**2
    )

def match_shade_to_target(target_rgb, shade_database):
    """
    Find closest matching shade in database.
    """
    target_lab = rgb2lab(np.array([[target_rgb]]))[0][0]
    
    best_match = None
    min_delta = float('inf')
    
    for shade in shade_database:
        shade_lab = shade['lab_representation']
        delta = delta_e_cie76(target_lab, shade_lab)
        
        if delta < min_delta:
            min_delta = delta
            best_match = shade
    
    return best_match, min_delta

# Interpretation:
# ΔE < 1.0: Imperceptible difference
# ΔE 1.0-2.0: Perceptible through close observation
# ΔE 2.0-3.5: Perceptible at a glance
# ΔE 3.5-5.0: Clearly noticeable difference
# ΔE > 5.0: Major difference
```

### 7.2 Porosity Calculation

```python
def calculate_porosity(hair_metrics: dict) -> PorosityAssessment:
    """
    Calculate porosity from visual indicators.
    
    Factors:
    - Cuticle appearance (smooth = low, rough/raised = high)
    - Shine level (high shine = low porosity)
    - Elasticity (poor = high porosity)
    - Previous chemical processing count
    - Heat damage history
    """
    
    score = 50  # Base: normal porosity
    
    # Cuticle assessment (from photo analysis)
    if hair_metrics["cuticle_roughness"] > 0.7:
        score += 30
    elif hair_metrics["cuticle_roughness"] < 0.3:
        score -= 20
    
    # Shine inversely correlates with porosity
    if hair_metrics["shine_level"] > 0.8:
        score -= 15
    elif hair_metrics["shine_level"] < 0.3:
        score += 20
    
    # Chemical processing
    score += hair_metrics["chemical_processes"] * 10
    
    # Heat damage
    if hair_metrics["heat_damage_indicators"]:
        score += 15
    
    # Categorize
    if score < 35:
        return PorosityAssessment.LOW
    elif score < 65:
        return PorosityAssessment.NORMAL
    else:
        return PorosityAssessment.HIGH
```

### 7.3 Developer Efficiency Model

```python
def calculate_developer_efficiency(
    developer_volume: int,
    hair_porosity: str,
    processing_time: int,
    ambient_temp: float
) -> float:
    """
    Calculate actual lift efficiency considering real-world factors.
    """
    
    # Base efficiency (ideal conditions)
    base_lift = {
        10: 0, 20: 1.5, 30: 2.5, 40: 3.5
    }.get(developer_volume, 0)
    
    # Porosity factor
    porosity_factor = {
        "low": 0.85,      # Resistant, less efficient
        "normal": 1.0,    # Standard
        "high": 1.15      # Penetrates easier
    }.get(hair_porosity, 1.0)
    
    # Time factor (diminishing returns after optimal)
    optimal_time = {10: 20, 20: 30, 30: 35, 40: 45}.get(developer_volume, 30)
    if processing_time <= optimal_time:
        time_factor = processing_time / optimal_time
    else:
        # Diminishing returns after optimal
        excess = processing_time - optimal_time
        time_factor = 1.0 + (excess / optimal_time) * 0.1
    
    # Temperature factor (ideal: 70-75°F)
    if 68 <= ambient_temp <= 78:
        temp_factor = 1.0
    else:
        deviation = abs(ambient_temp - 73)
        temp_factor = max(0.85, 1.0 - (deviation * 0.005))
    
    effective_lift = base_lift * porosity_factor * time_factor * temp_factor
    
    return round(effective_lift, 1)
```

---

## Part 8: Special Formulations

### 8.1 Fashion Colors (Vivids)

Vivids (Pulp Riot, Pravana Vivids, etc.) require pre-lightening:

```
REQUIREMENTS:
├── Pre-lighten to Level 9-10 (pale yellow)
├── Tone to remove yellow (Level 10V or 10P)
├── Apply vivid on damp, towel-dried hair
├── Process 20-30 minutes (no heat)
└── Rinse cool

FORMULA EXAMPLE:
Target: Pulp Riot Fireball (vivid orange)

Step 1: Pre-lighten
  • Formula: Lightener + 30 vol (virgin) or 20 vol (previously lightened)
  • Process to Level 9-10

Step 2: Tone (if needed)
  • Formula: Level 10V + 10 vol
  • Process 10-15 minutes to neutralize yellow

Step 3: Apply Vivid
  • Formula: Pulp Riot Fireball (straight from tube)
  • No developer needed (direct dye)
  • Process 20-30 minutes
```

### 8.2 Balayage Formulation

```
BALAYAGE FORMULA STRUCTURE:

Clay Lightener Mix:
├── Clay-based lightener (e.g., Schwarzkopf BlondMe)
├── Developer: 20-30 vol (depending on lift needed)
└── Consistency: Thick (yogurt-like) for control

Application Zones:
┌─────────────────────────────────────────┐
│  ROOT SHADOW (if desired)              │
│  Level 6-7N + 10 vol                   │
│  1-2 inches from scalp                 │
├─────────────────────────────────────────┤
│  MID-LENGTHS                           │
│  Lightener + 20-30 vol                 │
│  Soft, diffused application            │
│  Process: 25-35 min                   │
├─────────────────────────────────────────┤
│  ENDS                                  │
│  Lightener + 20-30 vol (may refresh) │
│  Heaviest saturation                   │
│  Process: 15-25 min                   │
└─────────────────────────────────────────┘

Toning Options:
• Beige Blonde: Level 8-9B + 9 vol
• Pearl Blonde: Level 9-10P + 9 vol  
• Shadow Root: Level 6-7N + clear
```

### 8.3 Men's Gray Blending

```
GRAY BLENDING (CAMOUFLAGE COLOR):

Target: 50-75% gray coverage, natural appearance

Formula:
├── Base: Level 6-7N (1 part)
├── Target: Level 6-7G or B (1 part)
├── Developer: 5-10 vol (2 parts) - 1:2 ratio
└── Processing: 10-15 minutes only

Key Points:
• Lower developer for subtle, slow deposit
• Shorter processing time
• Matches natural base, blends gray
• Fades naturally (no harsh line)
• Touch up every 3-4 weeks
```

---

## Part 9: Product Chemistry Differences

### 9.1 Ammonia vs. MEA vs. MEA-Free

| Alkaline Agent | pH | Odor | Performance | Consideration |
|----------------|-----|------|-------------|---------------|
| **Ammonia** | 10-11 | Strong | Maximum lift | Classic, effective |
| **MEA** (Ethanolamine) | 9-10 | Mild | Good lift, gentler | Common replacement |
| **AMP** | 9-10 | Low | Moderate lift | Amodimethicone-based |
| **Ammonia-Free** | 8-9 | None | Limited lift | Demi/semi only |

### 9.2 Permanent vs. Demi vs. Semi

| Type | Developer | Lift | Lasts | Best For |
|------|-----------|------|-------|----------|
| **Permanent** | 10-40 vol | Yes | Until regrowth | Gray coverage, major changes |
| **Demi-Permanent** | 5-15 vol | 0 levels | 4-6 weeks | Toning, refreshing, no gray |
| **Semi-Permanent** | None (acidic) | 0 | 4-12 shampoos | Fashion colors, conditioning |

---

## Part 10: Formulation Validation

### 10.1 Quality Checks

Before finalizing any formula, validate:

```python
class FormulaValidator:
    """
    Validates color formulas before presentation to stylist.
    """
    
    REQUIRED_CHECKS = [
        "lift_achievable",
        "developer_appropriate", 
        "porosity_compatibility",
        "previous_color_considered",
        "gray_coverage_adequate",
        "tone_logic_valid",
        "processing_time_safe",
        "product_compatibility"
    ]
    
    def validate(self, formula: ColorFormula) -> ValidationResult:
        issues = []
        warnings = []
        
        # Lift achievable check
        if formula.levels_to_lift > 4 and not formula.uses_lightener:
            issues.append("Color cannot lift more than 4 levels")
        
        if formula.previous_color and formula.levels_to_lift > 2:
            warnings.append("Previous color limits lift to 2 levels")
        
        # Developer check
        if formula.hair_condition == "compromised" and formula.developer > 20:
            issues.append("High developer volume on compromised hair")
        
        # Gray coverage
        if formula.gray_percentage > 50 and not formula.contains_natural_series:
            issues.append("Insufficient gray coverage without natural series")
        
        # Porosity
        if formula.hair_porosity == "high" and formula.developer >= 40:
            issues.append("40 vol on high porosity hair risks damage")
        
        return ValidationResult(
            valid=len(issues) == 0,
            issues=issues,
            warnings=warnings
        )
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)  
**References:** Milady Cosmetology, Redken Color Gels Lacquers Technical Manual, Wella Koleston Perfect Formulation Guide
