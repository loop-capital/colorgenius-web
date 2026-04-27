-- =====================================================
-- COLORGENIUS BETA DATABASE SCHEMA
-- Production-ready PostgreSQL schema for 50-stylist beta
-- Target: August 15, 2026
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Fuzzy text search

-- Enable pgvector if available (for future color similarity search)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available, skipping...';
END $$;

-- =====================================================
-- CORE: STYLISTS & SALONS
-- =====================================================

CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,

    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    timezone VARCHAR(50) DEFAULT 'America/New_York',

    phone VARCHAR(50),
    email VARCHAR(255),

    subscription_tier VARCHAR(20) DEFAULT 'beta',
    subscription_seats INT DEFAULT 5,
    subscription_expires_at TIMESTAMP,

    preferred_brands TEXT[], -- e.g., ['Redken', 'Wella']

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salons_subscription ON salons(subscription_tier);

-- =====================================================

CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),

    license_number VARCHAR(50),
    license_state VARCHAR(2),
    years_experience INT DEFAULT 0,

    salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'stylist', -- owner, manager, senior, stylist, assistant

    -- Preferences (JSONB for flexibility)
    preferences JSONB DEFAULT '{
        "default_brand": null,
        "preferred_developer": 20,
        "theme": "light"
    }'::jsonb,

    formulations_count INT DEFAULT 0,
    last_login_at TIMESTAMP,

    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stylists_salon ON stylists(salon_id);
CREATE INDEX idx_stylists_email ON stylists(email);
CREATE INDEX idx_stylists_active ON stylists(is_active);

-- =====================================================
-- CORE: CLIENTS
-- =====================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,

    primary_stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
    salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,

    -- Hair profile (cached from latest analysis)
    hair_texture VARCHAR(20), -- fine, medium, coarse
    hair_density VARCHAR(20), -- thin, medium, thick
    natural_level INT CHECK (natural_level BETWEEN 1 AND 12),
    natural_tone VARCHAR(10),
    porosity VARCHAR(20) DEFAULT 'normal', -- low, normal, high
    scalp_condition VARCHAR(20) DEFAULT 'normal', -- sensitive, normal, dry, oily

    -- Medical / sensitivities (critical for safety)
    allergies JSONB DEFAULT '{
        "ppd": false,
        "ammonia": false,
        "fragrance": false,
        "known_allergens": []
    }'::jsonb,

    has_straightening BOOLEAN DEFAULT false,
    has_permed_hair BOOLEAN DEFAULT false,
    has_metallic_dye BOOLEAN DEFAULT false,
    has_henna BOOLEAN DEFAULT false,
    has_previous_color BOOLEAN DEFAULT false,
    last_color_service_date DATE,

    general_notes TEXT,

    total_visits INT DEFAULT 0,
    last_visit_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_stylist ON clients(primary_stylist_id);
CREATE INDEX idx_clients_salon ON clients(salon_id);
CREATE INDEX idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clients_last_visit ON clients(last_visit_at DESC);

-- Full-text search for client lookup
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

-- =====================================================
-- COLOR LINES: BRANDS, LINES, SHADES, DEVELOPERS
-- =====================================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    origin_country VARCHAR(2) DEFAULT 'US',
    tier VARCHAR(20) CHECK (tier IN ('mass', 'mid', 'premium', 'luxury')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_active ON brands(is_active);

-- =====================================================

CREATE TABLE product_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    slug VARCHAR(100) NOT NULL,

    color_type VARCHAR(50) NOT NULL CHECK (color_type IN (
        'permanent', 'demi-permanent', 'semi-permanent',
        'temporary', 'bleach', 'toner', 'high-lift', 'direct_dye'
    )),

    ammonia_free BOOLEAN DEFAULT false,
    plex_technology VARCHAR(50), -- 'olaplex', 'b3', 'argiplex'
    alkaline_agent VARCHAR(20), -- 'ammonia', 'mea', 'amp', 'oil_based'

    max_gray_coverage INT CHECK (max_gray_coverage BETWEEN 0 AND 100),
    max_lift_levels INT CHECK (max_lift_levels BETWEEN 0 AND 5),

    mixing_ratio VARCHAR(10) NOT NULL, -- '1:1', '1:1.5', '1:2'
    developer_options INT[], -- e.g., {10, 20, 30, 40}

    base_processing_time INT, -- minutes
    max_processing_time INT,
    can_use_heat BOOLEAN DEFAULT true,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(brand_id, name)
);

CREATE INDEX idx_product_lines_brand ON product_lines(brand_id);
CREATE INDEX idx_product_lines_type ON product_lines(color_type);
CREATE INDEX idx_product_lines_active ON product_lines(is_active);

-- =====================================================

CREATE TABLE shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID NOT NULL REFERENCES product_lines(id) ON DELETE CASCADE,

    shade_code VARCHAR(20) NOT NULL, -- e.g., "6N", "6-0", "6/0"
    shade_name VARCHAR(100),

    level INT CHECK (level BETWEEN 1 AND 12),

    primary_tone VARCHAR(10), -- 'N', 'A', 'G', 'V', etc.
    secondary_tone VARCHAR(10),

    is_natural BOOLEAN DEFAULT false,
    is_high_lift BOOLEAN DEFAULT false,
    is_clear BOOLEAN DEFAULT false,

    undertone VARCHAR(50), -- 'warm', 'cool', 'neutral'

    rgb_representation INT[3], -- [R, G, B]
    lab_representation FLOAT[3], -- [L, a, b]

    best_for TEXT[], -- e.g., ['gray_coverage', 'resistant_hair']
    not_recommended_for TEXT[],

    swatch_image_url TEXT,
    result_image_urls TEXT[],

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(product_line_id, shade_code)
);

CREATE INDEX idx_shades_product_line ON shades(product_line_id);
CREATE INDEX idx_shades_level ON shades(level);
CREATE INDEX idx_shades_tone ON shades(primary_tone);
CREATE INDEX idx_shades_natural ON shades(is_natural) WHERE is_natural = true;
CREATE INDEX idx_shades_level_tone ON shades(level, primary_tone) WHERE is_active = true;

-- =====================================================

CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    volume INT NOT NULL CHECK (volume IN (5, 10, 15, 20, 30, 40, 50)),

    h2o2_percentage DECIMAL(4,2),
    viscosity VARCHAR(20), -- 'liquid', 'cream', 'oil'

    special_properties TEXT[], -- ['plex', 'low-odor']

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(brand_id, volume)
);

CREATE INDEX idx_developers_brand ON developers(brand_id);

-- =====================================================
-- FORMULATIONS (The Core)
-- =====================================================

CREATE TABLE formulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    stylist_id UUID NOT NULL REFERENCES stylists(id),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

    -- Input context (denormalized for performance)
    input_data JSONB NOT NULL,
    /* Structure:
    {
        "current_state": {"level": 7, "tone": "N", "is_virgin": false},
        "target": {"level": 9, "tone": "G"},
        "hair_texture": "fine",
        "gray_percentage": 20,
        "allergies": {...},
        "previous_treatments": [...],
        "desired_outcome": "root_touchup"
    }
    */

    -- Result
    action_type VARCHAR(50), -- deposit_only, lift_with_color, lighten_then_tone, corrective

    brand VARCHAR(50),
    product_line VARCHAR(100),

    primary_formula JSONB NOT NULL,
    /* Structure:
    {
        "components": [
            {"shade_id": "...", "shade_code": "9G", "amount_oz": 2.0, "purpose": "primary"}
        ],
        "developer": {"volume": 30, "amount_oz": 3.0},
        "mixing_ratio": "1:1",
        "total_volume_oz": 6.0,
        "bond_builder": false
    }
    */

    toning_formula JSONB, -- Same structure, nullable

    processing_instructions JSONB NOT NULL,
    /* Structure:
    {
        "total_time_minutes": 35,
        "application_sequence": [...],
        "heat_recommended": false,
        "notes": [...]
    }
    */

    -- Warnings and validation
    warnings TEXT[], -- e.g., ['Requires pre-lightening', 'Metallic dye detected']
    confidence_score DECIMAL(4,3), -- 0.000-1.000

    -- Status
    status VARCHAR(20) DEFAULT 'generated', -- generated, adjusted, used, discarded, scored

    -- Scoring (filled after result)
    score_accuracy INT CHECK (score_accuracy BETWEEN 0 AND 100),
    score_condition INT CHECK (score_condition BETWEEN 0 AND 100),
    score_evenness INT CHECK (score_evenness BETWEEN 0 AND 100),
    score_overall INT CHECK (score_overall BETWEEN 0 AND 100),

    stylist_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formulations_stylist ON formulations(stylist_id);
CREATE INDEX idx_formulations_client ON formulations(client_id);
CREATE INDEX idx_formulations_status ON formulations(status);
CREATE INDEX idx_formulations_created ON formulations(created_at DESC);
CREATE INDEX idx_formulations_brand ON formulations(brand);
CREATE INDEX idx_formulations_confidence ON formulations(confidence_score);

-- GIN indexes for JSONB queries
CREATE INDEX idx_formulations_input ON formulations USING gin(input_data);
CREATE INDEX idx_formulations_primary ON formulations USING gin(primary_formula);

-- =====================================================
-- PHOTOS (Before/After, Analysis)
-- =====================================================

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    formulation_id UUID REFERENCES formulations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    stylist_id UUID REFERENCES stylists(id),

    photo_type VARCHAR(20) NOT NULL, -- 'before', 'after', 'texture', 'inspiration'
    photo_label VARCHAR(50), -- e.g., 'roots', 'ends', 'overall'

    -- Storage
    original_url TEXT NOT NULL,
    processed_url TEXT,
    thumbnail_url TEXT,

    -- Metadata
    file_size_bytes INT,
    width INT,
    height INT,
    format VARCHAR(10), -- 'JPEG', 'PNG', 'WebP'

    -- Analysis results (if processed)
    analysis_results JSONB,
    /* Structure:
    {
        "color": {"level": 7, "tone": "N", "confidence": 0.92},
        "texture": {"thickness": "medium"},
        "condition": {"score": 0.85}
    }
    */

    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_formulation ON photos(formulation_id);
CREATE INDEX idx_photos_client ON photos(client_id);
CREATE INDEX idx_photos_type ON photos(photo_type);
CREATE INDEX idx_photos_status ON photos(processing_status);
CREATE INDEX idx_photos_analysis ON photos USING gin(analysis_results);

-- =====================================================
-- CLIENT VISITS (History tracking)
-- =====================================================

CREATE TABLE client_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stylist_id UUID NOT NULL REFERENCES stylists(id),
    formulation_id UUID REFERENCES formulations(id) ON DELETE SET NULL,

    visit_date TIMESTAMP NOT NULL,
    service_type VARCHAR(50), -- 'root_touchup', 'full_color', 'highlights', 'corrective'

    -- Snapshot of hair state at visit
    hair_state JSONB,

    -- Outcome
    client_satisfaction INT CHECK (client_satisfaction BETWEEN 1 AND 5),
    stylist_notes TEXT,

    photos JSONB, -- Array of photo IDs

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_client ON client_visits(client_id);
CREATE INDEX idx_visits_stylist ON client_visits(stylist_id);
CREATE INDEX idx_visits_date ON client_visits(visit_date DESC);
CREATE INDEX idx_visits_formulation ON client_visits(formulation_id);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_type VARCHAR(20), -- 'stylist', 'system', 'api'
    actor_id UUID,

    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,

    details JSONB,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =====================================================
-- MIGRATION HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER salons_updated_at BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER stylists_updated_at BEFORE UPDATE ON stylists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER product_lines_updated_at BEFORE UPDATE ON product_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER shades_updated_at BEFORE UPDATE ON shades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER formulations_updated_at BEFORE UPDATE ON formulations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_visits ENABLE ROW LEVEL SECURITY;

-- Stylists can see their own salon's data
CREATE POLICY stylist_salon_isolation ON stylists
    FOR ALL USING (
        id = current_setting('app.current_user_id')::UUID
        OR salon_id = current_setting('app.current_salon_id')::UUID
    );

CREATE POLICY client_salon_isolation ON clients
    FOR ALL USING (
        salon_id = current_setting('app.current_salon_id')::UUID
        OR primary_stylist_id = current_setting('app.current_user_id')::UUID
    );

CREATE POLICY formulation_stylist_isolation ON formulations
    FOR ALL USING (
        stylist_id = current_setting('app.current_user_id')::UUID
    );

CREATE POLICY photo_stylist_isolation ON photos
    FOR ALL USING (
        stylist_id = current_setting('app.current_user_id')::UUID
    );

CREATE POLICY visits_stylist_isolation ON client_visits
    FOR ALL USING (
        stylist_id = current_setting('app.current_user_id')::UUID
    );

-- =====================================================
-- SEED DATA (Beta Essentials)
-- =====================================================

-- Sample brands
INSERT INTO brands (name, slug, manufacturer, tier) VALUES
('Redken', 'redken', 'L''Oréal Professional', 'premium'),
('Wella Professionals', 'wella-professionals', 'Wella (Coty)', 'premium'),
('Schwarzkopf Professional', 'schwarzkopf-professional', 'Henkel', 'premium'),
('Matrix', 'matrix', 'L''Oréal Professional', 'mid'),
('Joico', 'joico', 'Henkel', 'premium'),
('Goldwell', 'goldwell', 'Kao Salon Division', 'premium'),
('Pravana', 'pravana', 'Pravana', 'premium'),
('Pulp Riot', 'pulp-riot', 'L''Oréal', 'premium'),
('Kenra', 'kenra', 'Henkel', 'mid'),
('Olaplex', 'olaplex', 'Olaplex', 'premium');

-- Sample product lines (core beta lines)
INSERT INTO product_lines (brand_id, name, code, slug, color_type, mixing_ratio, developer_options, base_processing_time, max_processing_time) VALUES
((SELECT id FROM brands WHERE slug = 'redken'), 'Shades EQ', 'RSEQ', 'shades-eq', 'demi-permanent', '1:1', ARRAY[10], 20, 25),
((SELECT id FROM brands WHERE slug = 'redken'), 'Color Gels Lacquers', 'RCGL', 'color-gels-lacquers', 'permanent', '1:1', ARRAY[10,20,30,40], 35, 40),
((SELECT id FROM brands WHERE slug = 'wella-professionals'), 'Koleston Perfect ME+', 'WKPM', 'koleston-perfect', 'permanent', '1:1', ARRAY[6,9,12,18,24,30,40], 30, 40),
((SELECT id FROM brands WHERE slug = 'wella-professionals'), 'Illumina Color', 'WILL', 'illumina-color', 'permanent', '1:1', ARRAY[6,9,12,18,24,30], 30, 40),
((SELECT id FROM brands WHERE slug = 'schwarzkopf-professional'), 'IGORA ROYAL', 'SKIR', 'igora-royal', 'permanent', '1:1', ARRAY[6,9,12,30,40], 30, 40),
((SELECT id FROM brands WHERE slug = 'matrix'), 'SoColor', 'MTSC', 'socolor', 'permanent', '1:1', ARRAY[10,20,30,40], 35, 45),
((SELECT id FROM brands WHERE slug = 'joico'), 'LumiShine', 'JOLS', 'lumishine', 'permanent', '1:1', ARRAY[5,10,20,30,40], 35, 45),
((SELECT id FROM brands WHERE slug = 'goldwell'), 'Topchic', 'GWTC', 'topchic', 'permanent', '1:1', ARRAY[6,10,20,30,40], 30, 40),
((SELECT id FROM brands WHERE slug = 'goldwell'), 'Colorance', 'GWCR', 'colorance', 'demi-permanent', '2:1', ARRAY[10], 15, 20);

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE salons IS 'Salon accounts for multi-stylist management';
COMMENT ON TABLE stylists IS 'Individual stylist accounts with auth and preferences';
COMMENT ON TABLE clients IS 'Client profiles with hair history and allergy tracking';
COMMENT ON TABLE brands IS 'Color product brands (Redken, Wella, etc.)';
COMMENT ON TABLE product_lines IS 'Product lines within brands (e.g., Shades EQ)';
COMMENT ON TABLE shades IS 'Individual color shades with level/tone data';
COMMENT ON TABLE developers IS 'Developer products with volumes and properties';
COMMENT ON TABLE formulations IS 'Generated color formulas with results and scores';
COMMENT ON TABLE photos IS 'Before/after photos with analysis metadata';
COMMENT ON TABLE client_visits IS 'Visit history linking clients to formulations';

-- Schema version
INSERT INTO pg_description (objoid, classoid, objsubid, description)
VALUES (
    'public'::regnamespace::oid,
    0,
    0,
    'ColorGenius Beta Schema v1.0 - 2026-04-25'
);
