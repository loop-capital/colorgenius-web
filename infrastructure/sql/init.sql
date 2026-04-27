-- ColorGenius Database Initialization
-- Run on PostgreSQL container first startup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  salon_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─────────────────────────────────────────────
-- Clients
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  preferred_brand VARCHAR(100),
  hair_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- ─────────────────────────────────────────────
-- Appointments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  formulation_id UUID,
  service_type VARCHAR(50) DEFAULT 'color',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 60,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);

-- ─────────────────────────────────────────────
-- Analyses
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID,
  photo_path VARCHAR(500),
  photo_type VARCHAR(20) DEFAULT 'current',
  level INT CHECK (level >= 1 AND level <= 10),
  tone VARCHAR(20),
  undertone VARCHAR(20),
  rgb INT[3],
  lab FLOAT[3],
  confidence FLOAT,
  processing_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- ─────────────────────────────────────────────
-- Formulations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  current_level INT,
  target_level INT,
  target_tone VARCHAR(20),
  porosity VARCHAR(20),
  hair_condition FLOAT,
  gray_percentage INT,
  brand VARCHAR(100),
  product_line VARCHAR(100),
  developer_volume INT,
  developer_time INT,
  action_type VARCHAR(50),
  formula_data JSONB,
  confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formulations_user_id ON formulations(user_id);
CREATE INDEX IF NOT EXISTS idx_formulations_created_at ON formulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_formulations_analysis_id ON formulations(analysis_id);

-- ─────────────────────────────────────────────
-- Color Lines (Brands, Product Lines, Shades)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  tier VARCHAR(20) DEFAULT 'premium',
  origin_country CHAR(2),
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  mixing_ratio VARCHAR(20),
  ammonia_free BOOLEAN DEFAULT false,
  plex_technology BOOLEAN DEFAULT false,
  max_gray_coverage INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  product_line_id UUID REFERENCES product_lines(id) ON DELETE CASCADE,
  shade_code VARCHAR(20) NOT NULL,
  shade_name VARCHAR(100),
  level INT CHECK (level >= 1 AND level <= 12),
  primary_tone CHAR(2),
  secondary_tone CHAR(2),
  tertiary_tone CHAR(2),
  is_natural BOOLEAN DEFAULT false,
  is_high_lift BOOLEAN DEFAULT false,
  is_special_mix BOOLEAN DEFAULT false,
  rgb INT[3],
  lab FLOAT[3],
  undertone VARCHAR(50),
  intensity_score FLOAT,
  description TEXT,
  best_for TEXT[],
  not_recommended_for TEXT[],
  mixing_compatibility TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shades_brand_id ON shades(brand_id);
CREATE INDEX IF NOT EXISTS idx_shades_level ON shades(level);
CREATE INDEX IF NOT EXISTS idx_shades_tone ON shades(primary_tone);
CREATE INDEX IF NOT EXISTS idx_shades_code ON shades(shade_code);

-- ─────────────────────────────────────────────
-- Stylist Feedback & Outcomes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulation_id UUID REFERENCES formulations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID,
  color_accuracy_rating INT CHECK (color_accuracy_rating >= 1 AND color_accuracy_rating <= 5),
  formula_precision_rating INT CHECK (formula_precision_rating >= 1 AND formula_precision_rating <= 5),
  client_satisfaction_rating INT CHECK (client_satisfaction_rating >= 1 AND client_satisfaction_rating <= 5),
  condition_after_rating INT CHECK (condition_after_rating >= 1 AND condition_after_rating <= 5),
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  outcome_level INT,
  outcome_tone VARCHAR(20),
  adjustments_made TEXT,
  client_feedback TEXT,
  would_use_again BOOLEAN,
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_formulation_id ON feedback(formulation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ─────────────────────────────────────────────
-- Seed Data: Brands
-- ─────────────────────────────────────────────
INSERT INTO brands (name, manufacturer, tier, origin_country) VALUES
  ('Redken', 'L''Oréal Professional', 'premium', 'US'),
  ('Wella', 'Wella Company', 'premium', 'DE'),
  ('Schwarzkopf', 'Henkel', 'premium', 'DE'),
  ('L''Oréal Professionnel', 'L''Oréal', 'premium', 'FR'),
  ('Matrix', 'L''Oréal', 'mid', 'US'),
  ('Paul Mitchell', 'John Paul Mitchell Systems', 'premium', 'US'),
  ('Sexy Hair', 'Sexy Hair Concepts', 'mid', 'US'),
  ('Joico', 'Henkel', 'mid', 'US')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed Data: Product Lines
-- ─────────────────────────────────────────────
INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage) 
SELECT b.id, 'Color Gels Lacquers', 'permanent', '1:1', 100
FROM brands b WHERE b.name = 'Redken'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Shades EQ', 'demi-permanent', '1:1', 0
FROM brands b WHERE b.name = 'Redken'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Koleston Perfect ME', 'permanent', '1:1', 100
FROM brands b WHERE b.name = 'Wella'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Color Fresh Create', 'semi-permanent', '1:2', 0
FROM brands b WHERE b.name = 'Wella'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Igora Royal', 'permanent', '1:1', 100
FROM brands b WHERE b.name = 'Schwarzkopf'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'SoColor Cult', 'demi-permanent', '1:1', 0
FROM brands b WHERE b.name = 'Matrix'
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed Data: Shades (sample)
-- ─────────────────────────────────────────────
-- Redken Color Gels Lacquers Level 1-10
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone) 
SELECT b.id, pl.id, '1N', 'Black', 1, 'N', ARRAY[20,15,10], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '3N', 'Dark Brown', 3, 'N', ARRAY[60,42,30], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '5N', 'Light Brown', 5, 'N', ARRAY[120,85,60], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6N', 'Dark Blonde', 6, 'N', ARRAY[150,115,80], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7N', 'Medium Blonde', 7, 'N', ARRAY[175,145,100], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8N', 'Light Blonde', 8, 'N', ARRAY[200,175,130], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9N', 'Very Light Blonde', 9, 'N', ARRAY[220,200,160], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '10N', 'Lightest Blonde', 10, 'N', ARRAY[240,230,200], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

-- Gold tones
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7G', 'Medium Blonde Gold', 7, 'G', ARRAY[170,140,100], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8G', 'Light Blonde Gold', 8, 'G', ARRAY[195,170,125], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9G', 'Very Light Blonde Gold', 9, 'G', ARRAY[215,195,155], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

-- Ash tones
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7A', 'Medium Blonde Ash', 7, 'A', ARRAY[165,140,115], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8A', 'Light Blonde Ash', 8, 'A', ARRAY[190,165,140], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9A', 'Very Light Blonde Ash', 9, 'A', ARRAY[210,185,160], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

-- Red/Copper tones
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6R', 'Dark Blonde Red', 6, 'R', ARRAY[145,90,60], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7K', 'Medium Blonde Copper', 7, 'K', ARRAY[165,115,70], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8K', 'Light Blonde Copper', 8, 'K', ARRAY[185,135,85], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

-- Violet tones
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7V', 'Medium Blonde Violet', 7, 'V', ARRAY[160,130,150], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8V', 'Light Blonde Violet', 8, 'V', ARRAY[185,155,175], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Redken' AND pl.name = 'Color Gels Lacquers'
ON CONFLICT DO NOTHING;

-- Wella Koleston shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '5/0', 'Light Brown Natural', 5, 'N', ARRAY[115,80,55], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6/0', 'Dark Blonde Natural', 6, 'N', ARRAY[145,110,75], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7/0', 'Medium Blonde Natural', 7, 'N', ARRAY[170,140,95], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8/0', 'Light Blonde Natural', 8, 'N', ARRAY[195,170,125], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9/0', 'Very Light Blonde Natural', 9, 'N', ARRAY[215,195,155], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7/3', 'Medium Blonde Gold', 7, 'G', ARRAY[165,135,90], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8/3', 'Light Blonde Gold', 8, 'G', ARRAY[190,160,110], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6/1', 'Dark Blonde Ash', 6, 'A', ARRAY[140,105,85], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7/1', 'Medium Blonde Ash', 7, 'A', ARRAY[160,130,105], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8/1', 'Light Blonde Ash', 8, 'A', ARRAY[185,155,130], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6/4', 'Dark Blonde Copper', 6, 'K', ARRAY[140,85,55], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7/4', 'Medium Blonde Copper', 7, 'K', ARRAY[160,105,65], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Wella' AND pl.name = 'Koleston Perfect ME'
ON CONFLICT DO NOTHING;

-- Schwarzkopf Igora Royal shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '5-0', 'Light Brown Natural', 5, 'N', ARRAY[110,78,52], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6-0', 'Dark Blonde Natural', 6, 'N', ARRAY[142,108,73], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7-0', 'Medium Blonde Natural', 7, 'N', ARRAY[168,138,93], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8-0', 'Light Blonde Natural', 8, 'N', ARRAY[193,168,122], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9-0', 'Very Light Blonde Natural', 9, 'N', ARRAY[213,193,153], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7-6', 'Medium Blonde Violet', 7, 'V', ARRAY[158,128,148], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8-6', 'Light Blonde Violet', 8, 'V', ARRAY[183,153,173], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Schwarzkopf' AND pl.name = 'Igora Royal'
ON CONFLICT DO NOTHING;

-- Matrix SoColor Cult shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6N', 'Dark Blonde', 6, 'N', ARRAY[143,109,74], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7N', 'Medium Blonde', 7, 'N', ARRAY[169,139,94], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8N', 'Light Blonde', 8, 'N', ARRAY[194,169,123], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9N', 'Very Light Blonde', 9, 'N', ARRAY[214,194,154], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7G', 'Medium Blonde Gold', 7, 'G', ARRAY[166,136,88], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8G', 'Light Blonde Gold', 8, 'G', ARRAY[191,161,111], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Matrix' AND pl.name = 'SoColor Cult'
ON CONFLICT DO NOTHING;

-- Paul Mitchell shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, 'N/N', 'Natural', 7, 'N', ARRAY[170,140,95], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Paul Mitchell' AND pl.name = 'The Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, 'N/G', 'Natural Gold', 7, 'G', ARRAY[167,137,88], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Paul Mitchell' AND pl.name = 'The Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, 'N/A', 'Natural Ash', 7, 'A', ARRAY[163,133,108], false, 'cool'
FROM brands b, product_lines pl WHERE b.name = 'Paul Mitchell' AND pl.name = 'The Color'
ON CONFLICT DO NOTHING;

-- Joico shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7N', 'Medium Blonde', 7, 'N', ARRAY[168,138,93], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Joico' AND pl.name = 'K-Pak Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8N', 'Light Blonde', 8, 'N', ARRAY[193,168,122], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Joico' AND pl.name = 'K-Pak Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9N', 'Very Light Blonde', 9, 'N', ARRAY[213,193,153], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Joico' AND pl.name = 'K-Pak Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7G', 'Medium Blonde Gold', 7, 'G', ARRAY[165,135,90], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Joico' AND pl.name = 'K-Pak Color'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8G', 'Light Blonde Gold', 8, 'G', ARRAY[190,160,110], false, 'warm'
FROM brands b, product_lines pl WHERE b.name = 'Joico' AND pl.name = 'K-Pak Color'
ON CONFLICT DO NOTHING;

-- Sexy Hair shades
INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7N', 'Medium Blonde', 7, 'N', ARRAY[168,138,93], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Sexy Hair' AND pl.name = 'Stranger Things'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8N', 'Light Blonde', 8, 'N', ARRAY[193,168,122], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Sexy Hair' AND pl.name = 'Stranger Things'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9N', 'Very Light Blonde', 9, 'N', ARRAY[213,193,153], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'Sexy Hair' AND pl.name = 'Stranger Things'
ON CONFLICT DO NOTHING;

-- L'Oréal Professionnel shades
INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Dialight', 'demi-permanent', '1:1', 0
FROM brands b WHERE b.name = 'L''Oréal Professionnel'
ON CONFLICT DO NOTHING;

INSERT INTO product_lines (brand_id, name, type, mixing_ratio, max_gray_coverage)
SELECT b.id, 'Majirel', 'permanent', '1:1.5', 100
FROM brands b WHERE b.name = 'L''Oréal Professionnel'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '6', 'Dark Blonde', 6, 'N', ARRAY[143,109,74], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Majirel'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7', 'Medium Blonde', 7, 'N', ARRAY[168,138,93], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Majirel'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8', 'Light Blonde', 8, 'N', ARRAY[193,168,122], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Majirel'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9', 'Very Light Blonde', 9, 'N', ARRAY[213,193,153], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Majirel'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '7.0', 'Medium Blonde', 7, 'N', ARRAY[168,138,93], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Dialight'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '8.0', 'Light Blonde', 8, 'N', ARRAY[193,168,122], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Dialight'
ON CONFLICT DO NOTHING;

INSERT INTO shades (brand_id, product_line_id, shade_code, shade_name, level, primary_tone, rgb, is_natural, undertone)
SELECT b.id, pl.id, '9.0', 'Very Light Blonde', 9, 'N', ARRAY[213,193,153], true, 'neutral'
FROM brands b, product_lines pl WHERE b.name = 'L''Oréal Professionnel' AND pl.name = 'Dialight'
ON CONFLICT DO NOTHING;