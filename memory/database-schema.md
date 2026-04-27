# Color Genius - PostgreSQL Database Schema

## Executive Summary

This document defines the complete PostgreSQL database schema for Color Genius, supporting stylists, clients, formulas, outcomes, products, color lines, and the learning system. Designed for high performance with JSONB flexibility and pgvector for similarity search.

---

## Schema Overview

```
color_genius/
├── core/                      -- Core business entities
│   ├── stylists
│   ├── clients
│   └── salons
├── formulation/               -- Formulas and color science
│   ├── formulations
│   ├── formulation_components
│   ├── formula_history
│   └── processing_logs
├── products/                  -- Color lines and inventory
│   ├── brands
│   ├── product_lines
│   ├── shades
│   ├── developers
│   └── shade_equivalents
├── analysis/                  -- Photo analysis results
│   ├── photo_analyses
│   ├── hair_segmentations
│   ├── color_extractions
│   └── texture_analyses
├── learning/                  -- ML and feedback
│   ├── stylist_feedback
│   ├── formula_outcomes
│   ├── learning_events
│   └── regional_trends
└── system/                    -- Platform management
    ├── subscriptions
    ├── api_keys
    ├── webhooks
    └── audit_logs
```

---

## Core Schema

### stylists

```sql
CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    
    -- Professional credentials
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    license_expiry DATE,
    certifications TEXT[],
    years_experience INT,
    
    -- Salon association
    salon_id UUID REFERENCES salons(id),
    role VARCHAR(50) DEFAULT 'stylist', -- owner, manager, senior, stylist, assistant
    
    -- Preferences (JSONB for flexibility)
    preferences JSONB DEFAULT '{
        "default_brand": null,
        "preferred_developer": 20,
        "notification_settings": {
            "formula_updates": true,
            "new_features": true,
            "client_reminders": true
        },
        "ui_settings": {
            "default_view": "formulation",
            "theme": "light"
        }
    }'::jsonb,
    
    -- Usage statistics
    formulations_generated INT DEFAULT 0,
    formulations_successful INT DEFAULT 0,
    average_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    last_login_at TIMESTAMP,
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'professional',
    subscription_expires_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stylists_salon ON stylists(salon_id);
CREATE INDEX idx_stylists_email ON stylists(email);
CREATE INDEX idx_stylists_subscription ON stylists(subscription_tier);
```

### clients

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Demographics
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Salon/stylist association
    primary_stylist_id UUID REFERENCES stylists(id),
    salon_id UUID REFERENCES salons(id),
    
    -- Physical characteristics (cached from analyses)
    hair_profile JSONB DEFAULT '{
        "texture": null,
        "density": null,
        "natural_level": null,
        "natural_tone": null,
        "porosity": "normal",
        "scalp_condition": "normal"
    }'::jsonb,
    
    -- Medical and sensitivities
    allergies JSONB DEFAULT '{
        "ppd": false,
        "ammonia": false,
        "fragrance": false,
        "other": []
    }'::jsonb,
    
    medications TEXT[], -- e.g., ['thyroid', 'blood_thinner']
    conditions TEXT[], -- e.g., ['sensitive_scalp', 'psoriasis']
    
    -- Preferences
    preferences JSONB DEFAULT '{
        "communication_method": "text",
        "reminders_enabled": true,
        "preferred_brands": [],
        "disliked_tones": [],
        "maintenance_level": "medium",
        "budget_range": null
    }'::jsonb,
    
    -- Statistics
    total_visits INT DEFAULT 0,
    last_visit_at TIMESTAMP,
    next_appointment_at TIMESTAMP,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    
    -- Notes
    general_notes TEXT,
    formula_notes TEXT,
    
    -- GDPR
    marketing_consent BOOLEAN DEFAULT false,
    consent_updated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_stylist ON clients(primary_stylist_id);
CREATE INDEX idx_clients_salon ON clients(salon_id);
CREATE INDEX idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clients_phone ON clients(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_clients_last_visit ON clients(last_visit_at);
```

### salons

```sql
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Location
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Business info
    business_type VARCHAR(50), -- booth_rental, commission, hybrid
    pricing_tier VARCHAR(20), -- budget, mid, premium, luxury
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'salon',
    subscription_seats INT DEFAULT 5,
    subscription_expires_at TIMESTAMP,
    
    -- Features
    features_enabled JSONB DEFAULT '{
        "analytics": true,
        "inventory_management": false,
        "multi_location": false,
        "api_access": false
    }'::jsonb,
    
    -- Brand preferences (affects default recommendations)
    preferred_brands TEXT[],
    
    -- Statistics
    active_stylists INT DEFAULT 0,
    total_clients INT DEFAULT 0,
    monthly_formulations INT DEFAULT 0,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salons_location ON salons USING gist (
    point(longitude, latitude)
);
CREATE INDEX idx_salons_subscription ON salons(subscription_tier);
```

---

## Formulation Schema

### formulations

```sql
CREATE TABLE formulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    stylist_id UUID NOT NULL REFERENCES stylists(id),
    client_id UUID REFERENCES clients(id),
    
    -- Analysis inputs
    current_analysis_id UUID REFERENCES photo_analyses(id),
    target_analysis_id UUID REFERENCES photo_analyses(id),
    
    -- Formulation inputs (denormalized for performance)
    input_data JSONB NOT NULL,
    /* Structure:
    {
        "current_state": {
            "level": 7,
            "tone": "N",
            "is_virgin": false,
            "previous_color": {...}
        },
        "target": {
            "level": 9,
            "tone": "G"
        },
        "hair_profile": {...},
        "client_factors": {...},
        "preferences": {...}
    }
    */
    
    -- Formulation result
    action_type VARCHAR(50), -- deposit_only, lift_with_color, lighten_then_tone, etc.
    
    brand VARCHAR(50),
    product_line VARCHAR(100),
    
    -- Primary formula (JSONB for complex structure)
    primary_formula JSONB NOT NULL,
    /* Structure:
    {
        "components": [
            {"shade_id": "...", "shade_code": "9G", "amount_oz": 2.0, "purpose": "primary"}
        ],
        "developer": {"volume": 30, "amount_oz": 3.0},
        "bond_builder": {...},
        "mixing_ratio": "1:1",
        "total_volume_oz": 6.0
    }
    */
    
    toning_formula JSONB, -- Same structure, nullable
    
    processing_instructions JSONB NOT NULL,
    /* Structure:
    {
        "total_time_minutes": 35,
        "application_sequence": [...],
        "room_temp_recommended": true,
        "heat_optional": false,
        "notes": [...]
    }
    */
    
    -- Validation results
    validation JSONB,
    /* Structure:
    {
        "is_valid": true,
        "issues": [...],
        "warnings": [...],
        "alternatives": [...]
    }
    */
    
    -- Metadata
    confidence_score DECIMAL(4,3), -- 0.000-1.000
    cost_estimate DECIMAL(6,2),
    suggested_price DECIMAL(6,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'generated', -- generated, adjusted, used, discarded
    
    -- Outcome (updated after service)
    outcome_id UUID REFERENCES formula_outcomes(id),
    
    -- Learning
    learning_adjusted BOOLEAN DEFAULT false,
    regional_trend_id UUID REFERENCES regional_trends(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formulations_stylist ON formulations(stylist_id);
CREATE INDEX idx_formulations_client ON formulations(client_id);
CREATE INDEX idx_formulations_created_at ON formulations(created_at);
CREATE INDEX idx_formulations_brand ON formulations(brand);
CREATE INDEX idx_formulations_status ON formulations(status);
CREATE INDEX idx_formulations_confidence ON formulations(confidence_score);

-- GIN index for JSONB queries
CREATE INDEX idx_formulations_input ON formulations USING gin(input_data);
CREATE INDEX idx_formulations_primary ON formulations USING gin(primary_formula);
```

### formulation_components

```sql
-- Normalized component table for detailed querying
CREATE TABLE formulation_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulation_id UUID NOT NULL REFERENCES formulations(id) ON DELETE CASCADE,
    
    component_type VARCHAR(20) NOT NULL, -- primary, secondary, corrector, bond_builder, developer
    
    -- Product reference (nullable for generic entries)
    shade_id UUID REFERENCES shades(id),
    developer_id UUID REFERENCES developers(id),
    
    -- Denormalized for reporting
    brand VARCHAR(50),
    product_line VARCHAR(100),
    shade_code VARCHAR(20),
    developer_volume INT,
    
    -- Amounts
    amount_oz DECIMAL(5,2),
    amount_ml DECIMAL(6,2),
    amount_ratio DECIMAL(3,2), -- For percentage-based mixes
    
    -- Purpose
    purpose VARCHAR(50), -- primary, gray_coverage, neutralization, etc.
    
    sequence_order INT, -- Application order
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formulation_components_formulation ON formulation_components(formulation_id);
CREATE INDEX idx_formulation_components_shade ON formulation_components(shade_id);
CREATE INDEX idx_formulation_components_brand ON formulation_components(brand);
```

### formula_history

```sql
-- Audit trail for formula changes
CREATE TABLE formula_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulation_id UUID NOT NULL REFERENCES formulations(id),
    
    change_type VARCHAR(50) NOT NULL, -- generated, adjusted, used, duplicated
    changed_by UUID REFERENCES stylists(id),
    
    previous_values JSONB,
    new_values JSONB,
    
    change_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formula_history_formulation ON formula_history(formulation_id);
```

---

## Product Schema

### brands

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    manufacturer VARCHAR(100),
    manufacturer_code VARCHAR(20),
    
    origin_country VARCHAR(2),
    website_url TEXT,
    support_phone VARCHAR(50),
    support_email VARCHAR(255),
    
    -- Categorization
    tier VARCHAR(20) CHECK (tier IN ('mass', 'mid', 'premium', 'luxury')),
    professional_only BOOLEAN DEFAULT true,
    
    -- Brand attributes
    features TEXT[], -- e.g., ['ammonia_free', 'plex_technology']
    
    -- Media
    logo_url TEXT,
    brand_colors TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    launch_date DATE,
    discontinued_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_tier ON brands(tier);
CREATE INDEX idx_brands_active ON brands(is_active);
```

### product_lines

```sql
CREATE TABLE product_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE, -- Internal code e.g., "RSEQ"
    slug VARCHAR(100) NOT NULL,
    
    -- Color properties
    color_type VARCHAR(50) NOT NULL CHECK (color_type IN (
        'permanent', 'demi-permanent', 'semi-permanent', 
        'temporary', 'bleach', 'toner', 'high-lift', 'direct_dye'
    )),
    
    -- Chemistry
    ammonia_free BOOLEAN DEFAULT false,
    plex_technology VARCHAR(50), -- 'olaplex', 'b3', 'argiplex', etc.
    alkaline_agent VARCHAR(20), -- 'ammonia', 'mea', 'amp', 'oil_based'
    ph_level DECIMAL(3,1),
    
    -- Performance
    max_gray_coverage INT CHECK (max_gray_coverage BETWEEN 0 AND 100),
    max_lift_levels INT CHECK (max_lift_levels BETWEEN 0 AND 5),
    
    -- Mixing
    mixing_ratio VARCHAR(10) NOT NULL, -- '1:1', '1:1.5', '1:2', '2:1'
    developer_options INT[], -- e.g., {10, 20, 30, 40}
    requires_specific_developer BOOLEAN DEFAULT false,
    
    -- Processing
    base_processing_time INT, -- minutes
    max_processing_time INT,
    can_use_heat BOOLEAN DEFAULT true,
    
    -- Usage
    usage_instructions TEXT,
    contraindications TEXT[],
    
    -- Media
    image_urls JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    launch_date DATE,
    discontinued_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(brand_id, name)
);

CREATE INDEX idx_product_lines_brand ON product_lines(brand_id);
CREATE INDEX idx_product_lines_type ON product_lines(color_type);
CREATE INDEX idx_product_lines_active ON product_lines(is_active);
```

### shades

```sql
CREATE TABLE shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID NOT NULL REFERENCES product_lines(id),
    
    -- Identification
    shade_code VARCHAR(20) NOT NULL, -- e.g., "6N", "6/0", "6-0"
    shade_name VARCHAR(100),
    
    -- Level system
    level INT CHECK (level BETWEEN 1 AND 12),
    
    -- Tone system
    primary_tone CHAR(2), -- 'N', 'A', 'G', 'V', etc.
    secondary_tone CHAR(2),
    tertiary_tone CHAR(2),
    
    -- Properties
    is_natural BOOLEAN DEFAULT false, -- For gray coverage
    is_high_lift BOOLEAN DEFAULT false,
    is_special_mix BOOLEAN DEFAULT false, -- Custom mixing shades
    is_clear BOOLEAN DEFAULT false, -- For dilution
    is_booster BOOLEAN DEFAULT false, -- Intense concentrates
    
    -- Color representation
    rgb_representation INT[3], -- [R, G, B]
    lab_representation FLOAT[3], -- [L, a, b]
    
    -- For vector similarity search
    color_embedding vector(3), -- RGB as vector for pgvector
    
    -- Descriptive
    undertone VARCHAR(50), -- 'warm', 'cool', 'neutral', 'neutral-warm'
    intensity_score DECIMAL(3,2) CHECK (intensity_score BETWEEN 0 AND 1),
    description TEXT,
    
    -- Usage guidance
    best_for TEXT[], -- e.g., ['gray_coverage', 'resistant_hair']
    not_recommended_for TEXT[],
    
    -- Relationships
    complementary_shades UUID[], -- Array of shade_ids
    
    -- Media
    swatch_image_url TEXT,
    result_image_urls TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_line_id, shade_code)
);

CREATE INDEX idx_shades_product_line ON shades(product_line_id);
CREATE INDEX idx_shades_level ON shades(level);
CREATE INDEX idx_shades_tone ON shades(primary_tone);
CREATE INDEX idx_shades_natural ON shades(is_natural) WHERE is_natural = true;

-- Vector index for color similarity
CREATE INDEX idx_shades_embedding ON shades USING ivfflat (color_embedding vector_cosine_ops);
```

### developers

```sql
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    
    name VARCHAR(100) NOT NULL,
    volume INT NOT NULL CHECK (volume IN (5, 10, 15, 20, 30, 40, 50)),
    
    h2o2_percentage DECIMAL(4,2), -- e.g., 6.00 for 20 vol
    viscosity VARCHAR(20), -- 'liquid', 'cream', 'oil'
    
    -- Special properties
    special_properties TEXT[], -- ['plex', 'low-odor', 'conditioning']
    
    -- Compatibility
    compatible_lines UUID[], -- Array of product_line_ids
    
    -- Cost/pricing
    cost_per_oz DECIMAL(5,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(brand_id, volume)
);

CREATE INDEX idx_developers_brand ON developers(brand_id);
```

### shade_equivalents

```sql
CREATE TABLE shade_equivalents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_shade_id UUID NOT NULL REFERENCES shades(id),
    target_shade_id UUID NOT NULL REFERENCES shades(id),
    
    match_quality DECIMAL(3,2) CHECK (match_quality BETWEEN 0 AND 1),
    -- 1.00 = exact, 0.95 = very close, 0.90 = close, <0.90 = approximate
    
    delta_e DECIMAL(5,2), -- Color difference in Lab space
    
    notes TEXT, -- Differences to note
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source_shade_id, target_shade_id)
);

CREATE INDEX idx_shade_equivalents_source ON shade_equivalents(source_shade_id);
CREATE INDEX idx_shade_equivalents_target ON shade_equivalents(target_shade_id);
```

---

## Analysis Schema

### photo_analyses

```sql
CREATE TABLE photo_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    stylist_id UUID REFERENCES stylists(id),
    client_id UUID REFERENCES clients(id),
    
    -- Photo metadata
    photo_type VARCHAR(20) NOT NULL, -- 'current', 'target', 'texture', 'result'
    photo_label VARCHAR(50), -- e.g., 'roots', 'ends', 'inspiration'
    
    -- Storage
    original_url TEXT NOT NULL,
    processed_url TEXT,
    mask_url TEXT,
    
    -- File metadata
    original_size INT[], -- [width, height]
    file_size_bytes INT,
    format VARCHAR(10), -- 'JPEG', 'PNG', 'WebP'
    
    -- Processing
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_time_ms INT,
    
    -- Correction info
    lighting_corrected BOOLEAN DEFAULT false,
    original_color_temp INT,
    corrections_applied TEXT[],
    
    -- Results summary
    results JSONB,
    /* Structure:
    {
        "color": {"level": 7, "tone": "N", "confidence": 0.92},
        "texture": {"thickness": "medium", "curl": "wavy"},
        "damage": {"score": 0.25, "indicators": {...}},
        "confidence": 0.89
    }
    */
    
    -- Error info (if failed)
    error_message TEXT,
    
    -- Model versions used
    model_versions JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photo_analyses_stylist ON photo_analyses(stylist_id);
CREATE INDEX idx_photo_analyses_client ON photo_analyses(client_id);
CREATE INDEX idx_photo_analyses_status ON photo_analyses(processing_status);
CREATE INDEX idx_photo_analyses_type ON photo_analyses(photo_type);
CREATE INDEX idx_photo_analyses_results ON photo_analyses USING gin(results);
```

### hair_segmentations

```sql
CREATE TABLE hair_segmentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES photo_analyses(id),
    
    -- Masks storage (could be S3 URLs or base64 if small)
    full_mask_url TEXT,
    root_mask_url TEXT,
    mid_mask_url TEXT,
    end_mask_url TEXT,
    
    -- Coverage metrics
    coverage_percentage DECIMAL(5,2),
    hair_pixel_count INT,
    
    -- Quality
    confidence DECIMAL(4,3),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hair_segmentations_analysis ON hair_segmentations(analysis_id);
```

### color_extractions

```sql
CREATE TABLE color_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES photo_analyses(id),
    
    -- Level
    level INT,
    level_confidence DECIMAL(4,3),
    level_distribution DECIMAL(4,3)[], -- Probability per level
    
    -- Tone
    primary_tone CHAR(2),
    secondary_tone CHAR(2),
    tone_confidence DECIMAL(4,3),
    
    -- Color values
    rgb INT[3],
    lab FLOAT[3],
    hex VARCHAR(7),
    
    -- Undertone
    undertone VARCHAR(20),
    undertone_confidence DECIMAL(4,3),
    
    -- Source
    extracted_from VARCHAR(20), -- 'roots', 'mids', 'ends', 'overall'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_color_extractions_analysis ON color_extractions(analysis_id);
CREATE INDEX idx_color_extractions_level ON color_extractions(level);
```

---

## Learning Schema

### stylist_feedback

```sql
CREATE TABLE stylist_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    formulation_id UUID NOT NULL REFERENCES formulations(id),
    stylist_id UUID NOT NULL REFERENCES stylists(id),
    client_id UUID REFERENCES clients(id),
    
    -- Ratings (1-5 scale)
    color_accuracy INT CHECK (color_accuracy BETWEEN 1 AND 5),
    formula_precision INT CHECK (formula_precision BETWEEN 1 AND 5),
    client_satisfaction INT CHECK (client_satisfaction BETWEEN 1 AND 5),
    condition_after INT CHECK (condition_after BETWEEN 1 AND 5),
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
    
    -- Detailed outcome
    outcome JSONB NOT NULL,
    /* Structure:
    {
        "actual_level": 9,
        "actual_tone": "G",
        "condition_improved": true,
        "gray_coverage_percent": 95,
        "processing_time_actual": 40,
        "developer_used": 30,
        "photos": {
            "before": "url",
            "after": "url"
        },
        "client_feedback": "Love the warmth!"
    }
    */
    
    -- Adjustments made
    adjustments_made TEXT,
    would_use_again BOOLEAN,
    
    -- Suggestions for improvement
    suggestions TEXT,
    
    -- For ML
    features_used JSONB, -- Which features the stylist used
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stylist_feedback_formulation ON stylist_feedback(formulation_id);
CREATE INDEX idx_stylist_feedback_stylist ON stylist_feedback(stylist_id);
CREATE INDEX idx_stylist_feedback_ratings ON stylist_feedback(overall_rating);
CREATE INDEX idx_stylist_feedback_outcome ON stylist_feedback USING gin(outcome);
```

### formula_outcomes

```sql
CREATE TABLE formula_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    formulation_id UUID NOT NULL REFERENCES formulations(id),
    
    -- Actual results
    actual_level INT,
    actual_tone VARCHAR(10),
    
    -- Match accuracy
    level_match BOOLEAN,
    tone_match BOOLEAN,
    color_match BOOLEAN, -- Overall visual match
    
    -- Delta E (color difference)
    delta_e DECIMAL(5,2),
    
    -- Client metrics
    client_satisfaction INT,
    would_return BOOLEAN,
    
    -- Technical metrics
    gray_coverage_achieved INT, -- percentage
    lift_achieved INT, -- levels
    condition_change VARCHAR(20), -- improved, same, worse
    
    -- Financial
    service_price DECIMAL(6,2),
    product_cost DECIMAL(5,2),
    
    -- Longevity
    longevity_weeks INT, -- How long color lasted
    fading_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formula_outcomes_formulation ON formula_outcomes(formulation_id);
CREATE INDEX idx_formula_outcomes_satisfaction ON formula_outcomes(client_satisfaction);
```

### learning_events

```sql
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_type VARCHAR(50) NOT NULL, -- model_update, trend_detected, recommendation_improved
    
    -- Context
    stylist_id UUID REFERENCES stylists(id),
    salon_id UUID REFERENCES salons(id),
    region VARCHAR(50), -- e.g., 'us_northeast', 'us_west'
    
    -- Event data
    event_data JSONB NOT NULL,
    
    -- Model/training info
    model_version VARCHAR(50),
    training_data_points INT,
    accuracy_before DECIMAL(4,3),
    accuracy_after DECIMAL(4,3),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_events_type ON learning_events(event_type);
CREATE INDEX idx_learning_events_region ON learning_events(region);
```

### regional_trends

```sql
CREATE TABLE regional_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    region VARCHAR(50) NOT NULL, -- 'us_northeast', 'us_west', etc.
    season VARCHAR(10), -- 'spring', 'summer', 'fall', 'winter'
    year INT,
    
    -- Trend data
    trend_type VARCHAR(50), -- 'color', 'technique', 'product'
    trend_name VARCHAR(100), -- 'mushroom_brown', 'buttery_blonde'
    
    -- Metrics
    formulation_count INT,
    average_satisfaction DECIMAL(3,2),
    growth_rate DECIMAL(5,2), -- percentage growth
    
    -- Characteristics
    popular_levels INT[],
    popular_tones TEXT[],
    popular_brands TEXT[],
    
    -- Time range
    trend_start_date DATE,
    trend_peak_date DATE,
    trend_end_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regional_trends_region ON regional_trends(region);
CREATE INDEX idx_regional_trends_active ON regional_trends(is_active);
CREATE INDEX idx_regional_trends_season ON regional_trends(season, year);
```

---

## System Schema

### subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    subscriber_type VARCHAR(20) NOT NULL, -- 'stylist', 'salon'
    subscriber_id UUID NOT NULL,
    
    tier VARCHAR(20) NOT NULL, -- free, professional, salon, enterprise
    
    -- Billing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Pricing
    monthly_price DECIMAL(6,2),
    annual_price DECIMAL(7,2),
    billing_interval VARCHAR(10), -- 'month', 'year'
    
    -- Limits
    monthly_formulation_limit INT,
    storage_gb INT,
    seats INT,
    
    -- Features
    features JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, canceled, past_due
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    
    canceled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_type, subscriber_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### api_keys

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner
    owner_type VARCHAR(20) NOT NULL, -- 'stylist', 'salon', 'integration'
    owner_id UUID NOT NULL,
    
    -- Key
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(8) NOT NULL, -- First 8 chars for display
    
    -- Scopes
    scopes TEXT[], -- Array of permission scopes
    
    -- Usage
    last_used_at TIMESTAMP,
    usage_count INT DEFAULT 0,
    
    -- Rate limits
    rate_limit_per_minute INT DEFAULT 300,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES stylists(id)
);

CREATE INDEX idx_api_keys_owner ON api_keys(owner_type, owner_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

### webhooks

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    owner_type VARCHAR(20) NOT NULL, -- 'stylist', 'salon'
    owner_id UUID NOT NULL,
    
    -- Configuration
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255), -- For HMAC signature
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    failure_count INT DEFAULT 0,
    last_success_at TIMESTAMP,
    last_failure_at TIMESTAMP,
    last_error TEXT,
    
    -- Metadata
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_owner ON webhooks(owner_type, owner_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

### audit_logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    actor_type VARCHAR(20), -- 'stylist', 'system', 'api'
    actor_id UUID,
    
    -- Action
    action VARCHAR(100) NOT NULL, -- 'formulation_created', 'client_updated', etc.
    resource_type VARCHAR(50) NOT NULL, -- 'formulation', 'client', etc.
    resource_id UUID,
    
    -- Details
    details JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2026_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## Indexes Summary

### Critical Performance Indexes

```sql
-- Client lookups
CREATE INDEX idx_clients_stylist_lookup ON clients(primary_stylist_id, last_visit_at DESC);

-- Formulation queries
CREATE INDEX idx_formulations_stylist_date ON formulations(stylist_id, created_at DESC);
CREATE INDEX idx_formulations_client_date ON formulations(client_id, created_at DESC);

-- Color matching
CREATE INDEX idx_shades_level_tone ON shades(level, primary_tone) WHERE is_active = true;

-- Learning queries
CREATE INDEX idx_feedback_stylist_date ON stylist_feedback(stylist_id, created_at DESC);

-- Analytics
CREATE INDEX idx_formulations_salon_brand ON formulations(
    (input_data->>'salon_id'), 
    brand, 
    created_at
);
```

### Full-Text Search

```sql
-- Client search
ALTER TABLE clients ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION update_client_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_search_vector_update
    BEFORE INSERT OR UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_client_search_vector();

CREATE INDEX idx_clients_search ON clients USING gin(search_vector);
```

---

## Data Retention

### Partitioning Strategy

```sql
-- Partition formulations by month
ALTER TABLE formulations PARTITION BY RANGE (created_at);

-- Create partitions dynamically
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, year int, month int)
RETURNS void AS $$
DECLARE
    partition_name text;
    start_date date;
    end_date date;
BEGIN
    partition_name := table_name || '_' || year || '_' || LPAD(month::text, 2, '0');
    start_date := make_date(year, month, 1);
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I 
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### Archival Policy

| Table | Retention | Archive To |
|-------|-----------|------------|
| photo_analyses | 2 years | S3 cold storage |
| formulations | 5 years | Archive DB |
| stylist_feedback | 7 years | Archive DB |
| audit_logs | 1 year | S3 cold storage |
| learning_events | 3 years | Data warehouse |

---

## Migration Scripts

### Initial Migration

```sql
-- Run migrations in order
-- 001_create_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For trigram search

-- Enable pgvector if available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available, skipping...';
END $$;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)