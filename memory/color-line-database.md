# Color Line Database - Complete Product Schema

## Executive Summary

This document defines the comprehensive database schema and product specifications for 10+ professional color lines supported by Color Genius. Each brand includes complete shade catalogs, mixing ratios, developer compatibility, and special formulation rules.

---

## Database Schema

### Core Tables

```sql
-- =====================================================
-- BRANDS
-- =====================================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    manufacturer VARCHAR(100) NOT NULL,
    origin_country VARCHAR(2) DEFAULT 'US',
    website_url TEXT,
    support_phone VARCHAR(50),
    professional_only BOOLEAN DEFAULT true,
    tier VARCHAR(20) CHECK (tier IN ('premium', 'mid', 'mass')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT LINES
-- =====================================================
CREATE TABLE product_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE, -- Internal code (e.g., "RSEQ")
    
    -- Color properties
    color_type VARCHAR(50) CHECK (color_type IN (
        'permanent', 'demi-permanent', 'semi-permanent', 
        'temporary', 'bleach', 'toner', 'high-lift'
    )),
    
    -- Chemistry
    ammonia_free BOOLEAN DEFAULT false,
    plex_technology VARCHAR(50), -- 'olaplex', 'b3', 'other', null
    alkaline_agent VARCHAR(20), -- 'ammonia', 'mea', 'amp', 'meka'
    
    -- Performance
    max_gray_coverage INT CHECK (max_gray_coverage BETWEEN 0 AND 100),
    max_lift_levels INT CHECK (max_lift_levels BETWEEN 0 AND 5),
    
    -- Mixing
    mixing_ratio VARCHAR(10) NOT NULL, -- '1:1', '1:1.5', '1:2', etc.
    developer_options INT[], -- Array of available volumes: {10,20,30,40}
    
    -- Processing
    base_processing_time INT, -- minutes
    max_processing_time INT, -- minutes
    
    -- Usage
    usage_instructions TEXT,
    contraindications TEXT[],
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    launch_date DATE,
    discontinued_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEVELOPERS
-- =====================================================
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(100) NOT NULL,
    volume INT NOT NULL CHECK (volume IN (5, 10, 15, 20, 30, 40, 50)),
    h2o2_percentage DECIMAL(4,2),
    viscosity VARCHAR(20), -- 'liquid', 'cream', 'oil'
    special_properties TEXT[], -- ['plex', 'low-odor', etc.]
    compatible_lines UUID[], -- Array of product_line_ids
    
    UNIQUE(brand_id, volume)
);

-- =====================================================
-- SHADES
-- =====================================================
CREATE TABLE shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID REFERENCES product_lines(id) ON DELETE CASCADE,
    
    -- Shade identification
    shade_code VARCHAR(20) NOT NULL, -- e.g., "6N", "6-0", "6/0"
    shade_name VARCHAR(100),
    
    -- Level system (1-12 scale)
    level INT CHECK (level BETWEEN 1 AND 12),
    
    -- Tone system (supports multiple formats)
    primary_tone CHAR(2), -- 'N', 'A', 'G', 'V', etc.
    secondary_tone CHAR(2),
    tertiary_tone CHAR(2),
    
    -- Shade properties
    is_natural BOOLEAN DEFAULT false, -- For gray coverage
    is_high_lift BOOLEAN DEFAULT false,
    is_special_mix BOOLEAN DEFAULT false, -- Custom mixing shades
    is_clear BOOLEAN DEFAULT false, -- For dilution
    
    -- Color representation
    rgb_representation INT[3], -- [R, G, B]
    lab_representation FLOAT[3], -- [L, a, b]
    
    -- Descriptive
    undertone VARCHAR(50),
    intensity_score FLOAT CHECK (intensity_score BETWEEN 0 AND 1),
    description TEXT,
    
    -- Usage
    best_for TEXT[], -- ['gray_coverage', 'resistant_hair', etc.]
    not_recommended_for TEXT[],
    
    -- Relationships
    complementary_shades UUID[], -- Array of shade_ids that mix well
    
    UNIQUE(product_line_id, shade_code)
);

-- =====================================================
-- FORMULATION RULES
-- =====================================================
CREATE TABLE formulation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID REFERENCES product_lines(id),
    
    rule_type VARCHAR(50) CHECK (rule_type IN (
        'gray_coverage', 'lift_limitation', 'compatibility',
        'porosity_adjustment', 'previous_color', 'developer_override',
        'timing_adjustment', 'mixing_restriction', 'warning'
    )),
    
    priority INT DEFAULT 100, -- Lower = higher priority
    
    -- Conditions (JSON for flexibility)
    conditions JSONB NOT NULL,
    -- Examples:
    -- {"gray_percentage": ">50", "natural_shade": false}
    -- {"previous_color": true, "current_level": "<6"}
    -- {"porosity": "high", "developer": ">=40"}
    
    -- Actions
    actions JSONB NOT NULL,
    -- Examples:
    -- {"require_natural_series": true, "developer_boost": 10}
    -- {"max_lift": 2, "warning": "Previous color detected"}
    -- {"developer_cap": 20, "rationale": "Porosity too high"}
    
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MIXING GUIDES
-- =====================================================
CREATE TABLE mixing_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID REFERENCES product_lines(id),
    
    scenario VARCHAR(100) NOT NULL, -- e.g., "gray_coverage_50_percent"
    
    -- Formula components
    components JSONB NOT NULL,
    -- Example:
    -- [
    --   {"shade_code": "6N", "percentage": 50},
    --   {"shade_code": "6G", "percentage": 30},
    --   {"shade_code": "6A", "percentage": 20}
    -- ]
    
    developer_recommendation INT,
    processing_time INT,
    special_instructions TEXT,
    
    conditions JSONB -- When to use this guide
);

-- =====================================================
-- PRODUCT EQUIVALENTS (Cross-brand mapping)
-- =====================================================
CREATE TABLE shade_equivalents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_shade_id UUID REFERENCES shades(id),
    target_shade_id UUID REFERENCES shades(id),
    match_quality FLOAT CHECK (match_quality BETWEEN 0 AND 1),
    -- 1.0 = exact, 0.9 = very close, 0.8 = close
    
    notes TEXT -- Differences to note
);

-- Indexes
CREATE INDEX idx_shades_product_line ON shades(product_line_id);
CREATE INDEX idx_shades_level ON shades(level);
CREATE INDEX idx_shades_tone ON shades(primary_tone);
CREATE INDEX idx_formulation_rules_line ON formulation_rules(product_line_id);
```

---

## Brand 1: Redken

### Overview
- **Manufacturer:** L'Oréal Professional
- **Positioning:** Premium professional
- **Signature:** Shades EQ "The haircolor that thinks it's a conditioner"

### Product Lines

#### Shades EQ (Demi-Permanent)

```yaml
ProductLine:
  name: "Shades EQ"
  code: "RSEQ"
  type: "demi-permanent"
  chemistry:
    ammonia_free: true
    plex_technology: "bonding"  # Bonder Inside variants
    alkaline_agent: "MEA"
  performance:
    max_gray_coverage: 75  # Use 000 or 09/010 series for blending
    max_lift: 0  # Deposit only
  mixing:
    ratio: "1:1"
    developer: ["Shades EQ Processing Solution", "Gloss to Gel Developer"]
    developer_options: [10]  # Processing solution is ~7 vol equivalent
  processing:
    base_time: 20
    max_time: 25
    with_heat: false

ShadeRange:
  # Level 000 Series (Clear/Diluters)
  - code: "000"
    name: "Crystal Clear"
    purpose: "Dilute intensity, increase shine"
  - code: "09V"
    name: "Platinum Ice"
    level: 10
    tone: "V"
  - code: "010VV"
    name: "Lavender Ice"
    level: 10
    tone: "V"
  
  # Level 1 (Black)
  - code: "1B"
    name: "Blue Black"
    level: 1
    tone: "B"
    undertone: "blue"
  - code: "1N"
    name: "Black"
    level: 1
    tone: "N"
  
  # Level 5-6 (Light Brown to Dark Blonde)
  - code: "5N"
    name: "Light Brown Natural"
    level: 5
    tone: "N"
    best_for: ["gray_coverage", "natural_look"]
  - code: "5G"
    name: "Light Brown Gold"
    level: 5
    tone: "G"
  - code: "6N"
    name: "Dark Blonde Natural"
    level: 6
    tone: "N"
  - code: "6N"
    name: "Dark Blonde"  # Same level, different tone options
    variants: ["6G", "6A", "6VB", "6T", "6C", "6R", "6RV", "6V", "6NB", "6NW"]
  
  # Level 7-8 (Blondes)
  - code: "7N"
    name: "Medium Blonde Natural"
    level: 7
    variants: ["7G", "7P", "7V", "7GB", "7NB", "7NW", "7C", "7N", "7T"]
  - code: "8N"
    name: "Light Blonde Natural"
    level: 8
    variants: ["8N", "8G", "8C", "8WG", "8V"]
  
  # Level 9-10 (High Lift Blondes)
  - code: "9N"
    name: "Very Light Blonde Natural"
    level: 9
    variants: ["9N", "9G", "9T", "9P", "9V", "9NA", "9NB", "9NW", "9GI"]
  - code: "10N"
    name: "Lightest Blonde Natural"
    level: 10
    variants: ["10N", "10V", "10P", "10GI"]

FormulationRules:
  - rule: "For gray coverage >50%, use 1 part N series + processing solution"
    condition: {gray_percentage: ">50"}
    action: {require_natural_series: true}
  
  - rule: "Use 09 or 010 series for lighter deposit"
    condition: {desired_intensity: "low"}
    action: {suggest_dilution_series: ["09", "010"]}
  
  - rule: "V tones may process longer for silver results"
    condition: {tone: "V", target_level: ">=9"}
    action: {extend_processing: 5, note: "Watch for over-toning"}

PopularFormulas:
  - name: "Mushroom Blonde"
    shades:
      - code: "7N"
        amount: "1 oz"
      - code: "7V"
        amount: "0.5 oz"
      - code: "7P"
        amount: "0.5 oz"
    developer: "Processing Solution"
    processing: 20
  
  - name: "Silver Balayage Toner"
    shades:
      - code: "09V"
        amount: "1 oz"
      - code: "000"
        amount: "1 oz"
    developer: "Processing Solution"
    processing: 15
    note: "Watch closely - processes quickly"
```

#### Color Gels Lacquers (Permanent)

```yaml
ProductLine:
  name: "Color Gels Lacquers"
  code: "RCGL"
  type: "permanent"
  chemistry:
    ammonia_free: false
    plex_technology: null
  performance:
    max_gray_coverage: 100
    max_lift: 2
  mixing:
    ratio: "1:1"
    developer_options: [10, 20, 30, 40]
  processing:
    base_time: 35
    gray_coverage_time: 40

ShadeRange:
  # Organized by level, includes N, G, C, N, NA series
  # Example popular shades:
  - code: "5N"
    name: "Light Brown"
  - code: "6N"
    name: "Dark Blonde"
  - code: "6GN"
    name: "Dark Blonde Green Natural"
  - code: "7N"
    name: "Medium Blonde"
  - code: "8N"
    name: "Light Blonde"
  - code: "10N"
    name: "Lightest Blonde"
    high_lift: true
    requires: "30 or 40 volume"
```

#### Chromatics (Ammonia-Free Permanent)

```yaml
ProductLine:
  name: "Chromatics"
  code: "RCHR"
  type: "permanent"
  chemistry:
    ammonia_free: true
    plex_technology: "protein_extract"
    alkaline_agent: "oil_based"
  mixing:
    ratio: "1:1"
    developer_options: [10, 20, 30, 40]
  
ShadeRange:
  - Uses 3-number system: 7.01 (7 = level, 0 = tone family, 1 = reflect)
  - Tone families:
    - 0 = Natural
    - 1 = Ash
    - 2 = Violet
    - 3 = Gold
    - 4 = Copper
    - 5 = Mahogany
    - 6 = Red
    - 7 = Khaki
    - 8 = Pearl
```

---

## Brand 2: Wella

### Overview
- **Manufacturer:** Wella Professionals (Coty)
- **Positioning:** Premium professional
- **Signature:** "Koleston Perfect Me+" - most advanced permanent color

### Product Lines

#### Koleston Perfect ME+ (Permanent)

```yaml
ProductLine:
  name: "Koleston Perfect ME+"
  code: "WKPM"
  type: "permanent"
  chemistry:
    ammonia_free: false
    plex_technology: "ME+"  # PPD-free technology
    alkaline_agent: "ammonia"
  performance:
    max_gray_coverage: 100
    max_lift: 4
  mixing:
    ratio: "1:1"  # Standard, may vary
    developer: "Welloxon Perfect"
    developer_options: [6, 9, 12, 18, 24, 30, 40]  # Percentages

ShadeCoding:
  # Wella uses / notation: 7/1 = Level 7, Tone 1
  # First number = Level (1-12)
  # After / = Tone family
  # .X = Additional reflect
  
  tone_families:
    /0: "Natural"
    /1: "Ash"
    /2: "Matt"  # Muted neutral
    /3: "Gold"
    /4: "Red"
    /5: "Mahogany"
    /6: "Violet"
    /7: "Brown"
    /71: "Brown Ash"
    /73: "Brown Gold"
    /81: "Pearl Ash"
    /86: "Pearl Violet"
    /96: "Red Violet"

ShadeRange:
  # Level 2 (Darkest)
  - code: "2/0"
    name: "Darkest Brown"
  
  # Level 4-5
  - code: "4/0"  # Medium Brown
  - code: "4/07" # Medium Brown Natural Brown
  - code: "5/0"  # Light Brown
  - code: "5/71" # Light Brown Brown Ash
  
  # Level 6-7
  - code: "6/0"  # Dark Blonde
  - code: "6/1"  # Dark Blonde Ash
  - code: "7/0"  # Medium Blonde
  - code: "7/1"  # Medium Blonde Ash
  - code: "7/3"  # Medium Blonde Gold
  
  # Level 8-10
  - code: "8/0"  # Light Blonde
  - code: "8/1"  # Light Blonde Ash
  - code: "9/0"  # Very Light Blonde
  - code: "9/1"  # Very Light Blonde Ash
  - code: "10/0" # Lightest Blonde
  - code: "10/1"# Lightest Blonde Ash
  
  # Special Blonde Series (High Lift)
  - code: "12/0" # Special Blonde Natural
  - code: "12/1" # Special Blonde Ash
  - code: "12/11"# Special Blonde Intense Ash
  - code: "12/16"# Special Blonde Ash Violet
  - code: "12/61"# Special Blonde Violet Ash
  - code: "12/89"# Special Blonde Pearl Lightest
  
  # Special Mix (Boosters/Correctors)
  - code: "0/11" # Intense Ash
  - code: "0/22" # Intense Matt
  - code: "0/28" # Matt Pearl
  - code: "0/33" # Intense Gold
  - code: "0/43" # Red Gold
  - code: "0/45" # Red Mahogany
  - code: "0/56" # Mahogany Violet
  - code: "0/66" # Intense Violet
  - code: "0/81" # Pearl Ash
  - code: "0/88" # Intense Pearl

MixingRules:
  - rule: "High Lift shades (12/) require 30-40 vol only"
    developer: [30, 40]
    processing: 40
  
  - rule: "Special Mix added at 10-30% of total formula"
    max_percentage: 30
  
  - rule: "For resistant gray, use double zero shades (e.g., 55/0)"
    shade_pattern: "^[0-9]{2}/0$"
    condition: {gray_percentage: ">50"}

PopularFormulas:
  - name: "Classic Ash Blonde"
    formula: "8/1 + 6/1"
    ratio: "1:1"
    developer: 20
  
  - name: "Mushroom Brown"
    formula: "7/1 + 7/2 + 0/81"
    ratio: "1:1:0.5"
    developer: 20
  
  - name: "Icy Platinum"
    formula: "12/61 + 12/81"
    ratio: "1:1"
    developer: 40
    note: "Pre-lighten to level 10"
```

#### Illumina Color (Demi-Permanent)

```yaml
ProductLine:
  name: "Illumina Color"
  code: "WILL"
  type: "permanent"  # Oxidative but gentle
  chemistry:
    ammonia_free: true
    plex_technology: "microlight_technology"
  mixing:
    ratio: "1:1"
    developer: "Welloxon Perfect"
    developer_options: [6, 9, 12, 18, 24, 30]
  
ShadeRange:
  coding: "Level/Tone"
  
  tones:
    - 0: Natural
    - 1: Ash
    - 2: Matt
    - 3: Gold
    - 5: Violet
    - 6: Dark Vibrant
    - 7: Medium Vibrant
    - 8: Light Vibrant
    - 10: Pastel
    - 19: Cool
    - 35: Cool Gold
    - 69: Cool Violet
  
  # Popular shades:
  - "6/1"  # Dark Blonde Ash
  - "6/16" # Dark Blonde Ash Violet
  - "6/19" # Dark Blonde Cool
  - "7/35" # Medium Blonde Cool Gold
  - "8/69" # Light Blonde Violet
  - "10/1" # Lightest Blonde Ash
  - "10/5" # Lightest Blonde Violet
  - "10/69"# Lightest Blonde Cool Violet
```

#### Color Touch (Demi-Permanent)

```yaml
ProductLine:
  name: "Color Touch"
  code: "WCT"
  type: "demi-permanent"
  mixing:
    ratio: "1:2"  # Color to emulsion
    developer: "Color Touch Emulsion"
    developer_options: [1.9, 4, 13]  # %
  processing:
    base_time: 20

ShadeRange:
  # Similar coding to Koleston
  # Great for toning and refreshing
  - "10/6"  # Lightest Blonde Violet
  - "10/81" # Lightest Blonde Pearl Ash
  - "9/16"  # Very Light Blonde Ash Violet
  - "8/81"  # Light Blonde Pearl Ash
```

---

## Brand 3: Schwarzkopf

### Overview
- **Manufacturer:** Henkel
- **Positioning:** Premium professional
- **Signature:** IGORA ROYAL - High Definition Color

### Product Lines

#### IGORA ROYAL (Permanent)

```yaml
ProductLine:
  name: "IGORA ROYAL"
  code: "SKIR"
  type: "permanent"
  chemistry:
    ammonia_free: false
    plex_technology: null
    alkaline_agent: "ammonia"
  performance:
    max_gray_coverage: 100
    max_lift: 3
  mixing:
    ratio: "1:1"  # Standard
    developer: "IGORA ROYAL Oil Developer"
    developer_options: [6, 9, 12, 30, 40]
  processing:
    base_time: 30
    gray_time: 40

ShadeCoding:
  # Schwarzkopf uses X-YZ system
  # X = Level (1-12)
  # - = separator
  # Y = Primary tone
  # Z = Secondary tone
  
  tone_codes:
    0: "Natural"
    1: "Cendre (Ash)"
    3: "Matt"
    4: "Beige"
    5: "Gold"
    6: "Chocolate"
    7: "Copper"
    8: "Red"
    9: "Violet"
    10: "Pearl"
    11: "Sandal"
    19: "Cendre Violet"
    47: "Beige Copper"
    57: "Gold Copper"
    67: "Chocolate Copper"
    68: "Chocolate Red"
    77: "Intense Copper"
    88: "Intense Red"

ShadeRange:
  # Level 1-2
  - "1-0"  # Black
  - "2-0"  # Darkest Brown
  - "3-0"  # Dark Brown
  
  # Level 4-5
  - "4-0"  # Medium Brown
  - "4-6"  # Medium Brown Chocolate
  - "5-0"  # Light Brown Natural
  - "5-4"  # Light Brown Beige
  - "5-5"  # Light Brown Gold
  - "5-7"  # Light Brown Copper
  - "5-68" # Light Brown Chocolate Red
  - "5-99" # Light Brown Intense Violet
  
  # Level 6-7
  - "6-0"  # Dark Blonde Natural
  - "6-1"  # Dark Blonde Cendre
  - "6-4"  # Dark Blonde Beige
  - "6-5"  # Dark Blonde Gold
  - "6-63" # Dark Blonde Chocolate Gold
  - "6-88" # Dark Blonde Intense Red
  - "6-99" # Dark Blonde Intense Violet
  - "6-12" # Dark Blonde Cendre Ash
  
  - "7-0"  # Medium Blonde Natural
  - "7-1"  # Medium Blonde Cendre
  - "7-4"  # Medium Blonde Beige
  - "7-55" # Medium Blonde Intense Gold
  - "7-77" # Medium Blonde Intense Copper
  - "7-88" # Medium Blonde Intense Red
  
  # Level 8-10
  - "8-0"  # Light Blonde Natural
  - "8-1"  # Light Blonde Cendre
  - "8-11" # Light Blonde Cendre Ash
  - "8-19" # Light Blonde Cendre Violet
  - "8-4"  # Light Blonde Beige
  - "8-77" # Light Blonde Intense Copper
  
  - "9-0"  # Very Light Blonde Natural
  - "9-1"  # Very Light Blonde Cendre
  - "9-4"  # Very Light Blonde Beige
  - "9-5"  # Very Light Blonde Gold
  - "9-98" # Very Light Blonde Violet Red
  
  - "10-0" # Lightest Blonde Natural
  - "10-1" # Lightest Blonde Cendre
  - "10-4" # Lightest Blonde Beige
  - "10-5" # Lightest Blonde Gold
  
  # High Lift
  - "12-0" # Special Blonde Natural
  - "12-11"# Special Blonde Cendre Ash
  - "12-19"# Special Blonde Cendre Violet
  - "12-61"# Special Blonde Chocolate Ash
  - "12-81"# Special Blonde Red Ash

  # Special Shades
  - "0-00" # Clear
  - "0-11" # Cendre Concentrate
  - "0-22" # Matt Concentrate
  - "0-33" # Gold Concentrate
  - "0-44" # Beige Concentrate
  - "0-55" # Gold Concentrate
  - "0-66" # Chocolate Concentrate
  - "0-77" # Copper Concentrate
  - "0-88" # Red Concentrate
  - "0-99" # Violet Concentrate

FormulationRules:
  - rule: "High Lift (12-) requires 30 or 40 vol"
    condition: {shade_code: "^12-"}
    developer: [30, 40]
  
  - rule: "For resistant gray, mix 2:1 with 0-00 Natural"
    condition: {gray_percentage: ">70", resistant: true}
    action: {mix_with: "0-00", ratio: "2:1"}

PopularFormulas:
  - name: "Icy Blonde"
    formula: "8-11 + 9-1"
    developer: 20
    ratio: "1:1"
  
  - name: "Rose Gold"
    formula: "9-98 + 10-5"
    developer: 9
    ratio: "2:1"
```

#### IGORA Vibrance (Demi-Permanent)

```yaml
ProductLine:
  name: "IGORA Vibrance"
  code: "SKIV"
  type: "demi-permanent"
  chemistry:
    ammonia_free: true
    alkaline_agent: "MEA"
  mixing:
    ratio: "1:1"  # With Vibrance Activator Gel or Lotion
    developer_options: [6, 13]  # 6% for deposit, 13% for gentle lift
  processing:
    base_time: 20

ShadeRange:
  # Similar coding to IGORA ROYAL
  - "5-0" through "10-0" for naturals
  - "7-55" for intense gold
  - "8-77" for intense copper
  - "9.5-1" for pastel cendre
  - "9.5-4" for pastel beige
  - "9.5-49" for pastel violet
  - "9.5-89" for pastel red
  - "9.5-19" for pastel cendre
```

#### BlondMe (Lightening System)

```yaml
ProductLine:
  name: "BlondMe"
  code: "SKBM"
  type: "bleach"
  chemistry:
    plex_technology: "integrated_blonding_system"
  mixing:
    ratio: "1:1.5 to 1:2"
    developer: "BlondMe Premium Developer"
    developer_options: [6, 9, 12, 20, 30, 40]
  
Variants:
  - "Bleach & Tone Cool"
  - "Bleach & Tone Warm"
  - "Bond Enforcing Premium Lightener 9+"  # 9+ levels lift
  - "Bond Enforcing White Lightening Powder"
  - "Instant Blush"
```

---

## Brand 4: Matrix

### Overview
- **Manufacturer:** L'Oréal Professional
- **Positioning:** Mid-premium professional
- **Signature:** SoColor - reliable, consistent results

### Product Lines

#### SoColor (Permanent)

```yaml
ProductLine:
  name: "SoColor"
  code: "MTSC"
  type: "permanent"
  chemistry:
    ammonia_free: false
    plex_technology: "pre-softening_technology"
  mixing:
    ratio: "1:1"
    developer_options: [10, 20, 30, 40]
  processing:
    base_time: 35

ShadeCoding:
  # Matrix uses WN, C, G, N, NA system
  # Format: Level + Letter Code
  
  tone_codes:
    W: "Warm"
    C: "Copper"
    G: "Gold"
    N: "Neutral"
    NA: "Neutral Ash"
    NW: "Neutral Warm"
    CG: "Copper Gold"
    RB: "Red Brown"
    RV: "Red Violet"
    V: "Violet"
    VM: "Violet Matte"
    WA: "Warm Ash"
    WC: "Warm Copper"

ShadeRange:
  - "1N"  # Black
  - "3N"  # Darkest Brown
  - "4N"  # Dark Brown
  - "5N"  # Light Brown
  - "6N"  # Dark Blonde
  - "7N"  # Medium Blonde
  - "8N"  # Light Blonde
  - "9N"  # Very Light Blonde
  - "10N" # Lightest Blonde
  
  - "5WC" # Light Brown Warm Copper
  - "6CG" # Dark Blonde Copper Gold
  - "7VM" # Medium Blonde Violet Matte
  - "8G"  # Light Blonde Gold
  - "9NA" # Very Light Blonde Neutral Ash
  - "10NA"# Lightest Blonde Neutral Ash
```

#### Color Sync (Demi-Permanent)

```yaml
ProductLine:
  name: "Color Sync"
  code: "MTCS"
  type: "demi-permanent"
  mixing:
    ratio: "1:1"
    developer: "Color Sync Activator"
    developer_options: [10]
  processing:
    base_time: 20

ShadeRange:
  # Level 3-10 available
  # SPV shades for vivids
  - "10V" # Sheer Violet
  - "10P" # Sheer Pastel
  - "10N" # Sheer Natural
  - "SPV" # Pastel Violet
  - "SPNV"# Pastel Neutral Violet
```

---

## Brand 5: Joico

### Overview
- **Manufacturer:** Henkel
- **Positioning:** Premium professional
- **Signature:** K-PAK technology for repair during color

### Product Lines

#### LumiShine (Permanent)

```yaml
ProductLine:
  name: "LumiShine"
  code: "JOLS"
  type: "permanent"
  chemistry:
    plex_technology: "argiplex"
  mixing:
    ratio: "1:1"
    developer: "LumiShine Developer"
    developer_options: [5, 10, 20, 30, 40]

ShadeCoding:
  # Uses number-letter system
  # Level + Tone(s)
  
  - "N" = Natural
  - "NA" = Natural Ash
  - "G" = Gold
  - "GB" = Gold Beige
  - "GN" = Gold Natural
  - "A" = Ash
  - "AB" = Ash Beige
  - "AG" = Ash Gold
  - "V" = Violet
  - "VR" = Violet Red
  - "R" = Red
  - "RC" = Red Copper
  - "RR" = Intense Red

PopularShades:
  - "5NA" # Light Brown Natural Ash
  - "6N"  # Dark Blonde Natural
  - "7G"  # Medium Blonde Gold
  - "8AB" # Light Blonde Ash Beige
  - "9NA" # Very Light Blonde Natural Ash
  - "10N" # Lightest Blonde Natural
```

#### Vero K-PAK Color (Permanent)

```yaml
ProductLine:
  name: "Vero K-PAK Color"
  code: "JOVK"
  type: "permanent"
  chemistry:
    plex_technology: "keratin_pak"
  mixing:
    ratio: "1:1"
    developer: "Vero K-PAK Veroxide"
    developer_options: [10, 20, 30, 40]
```

---

## Brand 6: Pravana

### Overview
- **Manufacturer:** Pravana
- **Positioning:** Premium professional (vivid/fashion focus)
- **Signature:** ChromaSilk + Vivids line

### Product Lines

#### ChromaSilk (Permanent)

```yaml
ProductLine:
  name: "ChromaSilk"
  code: "PVCH"
  type: "permanent"
  mixing:
    ratio: "1:1.5"
    developer_options: [10, 20, 30, 40]

ShadeRange:
  # Standard levels 1-10
  # Tone codes:
  - "N"  # Natural
  - "A"  # Ash
  - "G"  # Gold
  - "GA" # Gold Ash
  - "W"  # Warm
  - "C"  # Copper
  - "V"  # Violet
  - "R"  # Red
  - "B"  # Blue (fashion)
```

#### Vivids (Semi-Permanent)

```yaml
ProductLine:
  name: "Vivids"
  code: "PVVI"
  type: "semi-permanent"
  chemistry:
    keratin_based: true
    amino_acid_fortified: true
  mixing:
    ratio: "ready_to_use"  # Or mix with Clear
  
Colors:
  vivids:
    - "Vivid Violet"
    - "Vivid Blue"
    - "Vivid Green"
    - "Vivid Pink"
    - "Vivid Red"
    - "Vivid Orange"
    - "Vivid Yellow"
    - "Vivid Silver"
    - "Vivid Black"
  
  pastels:
    - "Pastel Violet"
    - "Pastel Blue"
    - "Pastel Pink"
    - "Pastel Mint"
    - "Pastel Blissful Blue"
    - "Pastel Too Cute Coral"
    - "Pastel Luscious Lavender"
    - "Pastel Pretty in Pink"
  
  neons:
    - "Neon Yellow"
    - "Neon Orange"
    - "Neon Pink"
    - "Neon Green"
    - "Neon Blue"
    - "Neon Purple"
```

---

## Brand 7: Pulp Riot

### Overview
- **Manufacturer:** Pulp Riot (L'Oréal)
- **Positioning:** Premium professional (fashion color leader)
- **Signature:** "Never Pastel" - highly pigmented semi-permanent

### Product Lines

#### Semi-Permanent Colors

```yaml
ProductLine:
  name: "Pulp Riot"
  code: "PULP"
  type: "semi-permanent"
  chemistry:
    vegan: true
    cruelty_free: true
    conditioning: true
  mixing:
    ratio: "ready_to_use"
    dilution: "Can mix with Blank Canvas (clear)"

Colors:
  core:
    - "Nightfall"    # Dark blue-purple
    - "Velvet"       # Deep purple
    - "Lilac"        # Light purple
    - "Smoke"        # Grey
    - "Powder"       # Pastel pink
    - "Blush"        # Soft pink
    - "Cupcake"      # Bright pink
    - "Cupid"        # Red-pink
    - "Fireball"     # Orange
    - "Lemon"        # Yellow
    - "Absinthe"     # Neon green
    - "Nuclear"      # Bright green
    - "Aquatic"      # Teal
    - "Barbie"       # Hot pink
    - "Jam"          # Purple
    - "Noir"         # Black
    - "Lava"         # Red
    - "Cinder"       # Charcoal
  
  high_speed_toners:
    - "Icy"          # Platinum toner
    - "Silver"       # Silver toner
    - "Violet"       # Violet toner
    - "Pearl"        # Iridescent toner
    - "Sandalwood"   # Beige toner
    - "Natural"      # Natural toner
    - "Gold"         # Gold toner
    - "Copper"       # Copper toner

FormulationNotes:
  - "Pre-lighten to Level 9-10 for vivid results"
  - "Can be mixed to create custom shades"
  - "Apply to damp, towel-dried hair"
  - "Process 20-30 minutes at room temperature"
  - "No heat required"
  - "Lasts 25-30 shampoos"
```

---

## Brand 8: Olaplex Professional

### Overview
- **Manufacturer:** Olaplex
- **Positioning:** Premium bond-building additive
- **Signature:** Bis-Aminopropyl Diglycol Dimaleate technology

### Products

```yaml
ProductLine:
  name: "Olaplex Professional"
  code: "OLAP"
  type: "treatment_system"
  
Products:
  - name: "Olaplex No.1"
    type: "bond_multiplier"
    usage: "Add to color/bleach formula"
    ratio: "1/16th oz per 1 oz color"
    
  - name: "Olaplex No.2"
    type: "bond_builder"
    usage: "Apply after rinsing color"
    time: "10 minutes"
    
  - name: "Olaplex No.0"
    type: "intensive_bond_builder"
    usage: "Pre-treatment at home"
    
  - name: "Olaplex No.3"
    type: "hair_perfector"
    usage: "Take-home treatment"
    
  - name: "Olaplex No.4-9"
    type: "retail_maintenance"
    usage: "Home care system"
```

---

## Brand 9: Kenra

### Overview
- **Manufacturer:** Kenra Professional
- **Positioning:** Mid-premium professional
- **Signature:** Fast processing times

### Product Lines

#### Kenra Color (Permanent)

```yaml
ProductLine:
  name: "Kenra Color"
  code: "KENC"
  type: "permanent"
  mixing:
    ratio: "1:1"
    developer_options: [10, 20, 30, 40]
  processing:
    base_time: 25  # Fast processing
    max_time: 35

ShadeRange:
  # Level 1-10
  tone_codes:
    N: Natural
    NN: Intense Natural (for gray)
    NA: Neutral Ash
    C: Copper
    G: Gold
    A: Ash
    V: Violet
    VR: Violet Red
    R: Red
    B: Brown
    M: Mahogany
```

#### Kenra Demi (Demi-Permanent)

```yaml
ProductLine:
  name: "Kenra Demi"
  code: "KEND"
  type: "demi-permanent"
  mixing:
    ratio: "1:2"
    developer: "Demi-Permanent Developer"
    developer_options: [9]
```

---

## Brand 10: Goldwell

### Overview
- **Manufacturer:** Kao Salon Division
- **Positioning:** Premium professional
- **Signature:** German engineering, precision color

### Product Lines

#### Topchic (Permanent)

```yaml
ProductLine:
  name: "Topchic"
  code: "GWTC"
  type: "permanent"
  chemistry:
    alkaline_agent: "ammonia"
    plex_technology: "color_link"  # Built-in bond building
  mixing:
    ratio: "1:1"
    developer: "Topchic Developer"
    developer_options: [6, 10, 20, 30, 40]
  processing:
    base_time: 30

ShadeCoding:
  # Goldwell uses letter-tone system
  # Format: Level + Letters
  
  naturals:
    N: "Natural"
    NN: "Intense Natural"
    NA: "Natural Ash"
    NG: "Natural Gold"
    NB: "Natural Beige"
  
  ash:
    A: "Ash"
    NA: "Natural Ash"
    AP: "Ash Pearl"
    AG: "Ash Gold"
    AV: "Ash Violet"
  
  gold:
    G: "Gold"
    NG: "Natural Gold"
    GB: "Gold Beige"
    GK: "Gold Copper"
    GA: "Gold Ash"
  
  copper:
    K: "Copper"
    NK: "Natural Copper"
    KG: "Copper Gold"
    KC: "Copper Beige"
  
  red:
    R: "Red"
    NR: "Natural Red"
    RB: "Red Beige"
    RO: "Red Orange"
    RV: "Red Violet"
  
  violet:
    V: "Violet"
    NV: "Natural Violet"
    VR: "Violet Red"
    VP: "Violet Pearl"
  
  special:
    B: "Brown"
    P: "Pearl"
    BP: "Beige Pearl"
    BS: "Beige Silver"

ShadeRange:
  # Complete 2-10 range
  - "2N" through "10N"
  - "2NN" through "10NN" (for resistant gray)
  - "4A" through "10A"
  - "4G" through "10G"
  - "4R" through "10R"
  - "4V" through "10V"
  - "4K" through "10K"
```

#### Colorance (Demi-Permanent)

```yaml
ProductLine:
  name: "Colorance"
  code: "GWCR"
  type: "demi-permanent"
  chemistry:
    alkaline_agent: "MEA"
    acidic: true  # pH ~6.5
  mixing:
    ratio: "2:1"  # Color to developer
    developer: "Colorance Developer Lotion"
    developer_options: [10]
  processing:
    base_time: 15

ShadeRange:
  # Similar coding to Topchic
  # Plus "@" shades for fashion
  - "10 Champagne"
  - "10 Parchment"
  - "10 Silver"
  - "@Violet"
  - "@Blue"
  - "@Red"
```

#### Elumen (High-Performance Direct Dye)

```yaml
ProductLine:
  name: "Elumen"
  code: "GWEL"
  type: "direct_dye"
  chemistry:
    oxidative: false
    ph: 3.0  # Acidic
    technology: "high_magnetic"
  
Colors:
  - "GN@all" # Green
  - "BG@all" # Blue Green
  - "BL@all" # Blue
  - "PK@all" # Pink
  - "NA@8"   # Natural (various levels)
  - "@all"   # Clear
  - "Silk@all" # Treatment

Usage:
  - "Pre-lighten to Level 9-10 for vivids"
  - "Can be used on Level 6+ for tinting"
  - "Apply to clean, towel-dried hair"
  - "Process 30 minutes under heat"
  - "Seal with Elumen Lock"
```

---

## Cross-Brand Equivalents

### Mapping Common Shades

```sql
-- Example equivalent mappings

-- Level 6 Natural Dark Blonde
INSERT INTO shade_equivalents (source_shade_id, target_shade_id, match_quality, notes)
VALUES
  ((SELECT id FROM shades WHERE shade_code = '6N' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'RSEQ')),
   (SELECT id FROM shades WHERE shade_code = '6/0' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'WKPM')),
   0.95, 'Very close match'),
  
  ((SELECT id FROM shades WHERE shade_code = '6N' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'RSEQ')),
   (SELECT id FROM shades WHERE shade_code = '6-0' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'SKIR')),
   0.95, 'Very close match'),
  
  ((SELECT id FROM shades WHERE shade_code = '6/0' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'WKPM')),
   (SELECT id FROM shades WHERE shade_code = '6-0' AND product_line_id IN (SELECT id FROM product_lines WHERE code = 'SKIR')),
   0.98, 'Nearly identical');
```

### Quick Reference: Shade Equivalents

| Result | Redken | Wella | Schwarzkopf | Matrix | Goldwell |
|--------|--------|-------|-------------|--------|----------|
| 5N Light Brown | 5N | 5/0 | 5-0 | 5N | 5N |
| 6N Dark Blonde | 6N | 6/0 | 6-0 | 6N | 6N |
| 7N Med Blonde | 7N | 7/0 | 7-0 | 7N | 7N |
| 8N Light Blonde | 8N | 8/0 | 8-0 | 8N | 8N |
| 9N Very Light | 9N | 9/0 | 9-0 | 9N | 9N |
| 10N Lightest | 10N | 10/0 | 10-0 | 10N | 10N |
| 7A Ash Blonde | 7A | 7/1 | 7-1 | 7NA | 7A |
| 8A Ash Blonde | 8A | 8/1 | 8-1 | 8NA | 8A |
| 7G Gold | 7G | 7/3 | 7-5 | 7G | 7G |
| 8G Gold | 8G | 8/3 | 8-5 | 8G | 8G |

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)
