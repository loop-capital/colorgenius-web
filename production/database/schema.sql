-- ColorGenius Production Database Schema
-- For Supabase (PostgreSQL)

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Color Lines
CREATE TABLE color_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT, -- permanent, demi, semi, toner
  technology TEXT,
  description TEXT,
  mixing_ratio TEXT,
  processing_time TEXT,
  lift_capability TEXT,
  gray_coverage TEXT,
  heat_reduction TEXT,
  application TEXT,
  virgin_application TEXT,
  developers JSONB, -- [5, 10, 20, 30, 40]
  activators JSONB, -- { "5_vol": { "percent": "1.5%", "use": "..." } }
  underlying_pigments JSONB, -- { "1": "Blue/Red", ... }
  tone_system JSONB, -- { "/0": "Natural", ... }
  regrowth_fading JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Shades
CREATE TABLE shades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id UUID REFERENCES color_lines(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER,
  tone TEXT,
  hex TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(line_id, code)
);

-- Indexes for fast filtering
CREATE INDEX idx_shades_line ON shades(line_id);
CREATE INDEX idx_shades_level ON shades(level);
CREATE INDEX idx_shades_tone ON shades(tone);
CREATE INDEX idx_shades_code ON shades(code);

-- Stylists (users)
CREATE TABLE stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  salon TEXT,
  square_merchant_id TEXT,
  square_access_token TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, salon
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulas
CREATE TABLE formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  shade_id UUID REFERENCES shades(id),
  name TEXT,
  developer_vol INTEGER,
  mixing_ratio TEXT,
  processing_time TEXT,
  notes TEXT,
  qr_code TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formula Components (for multi-shade formulas)
CREATE TABLE formula_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
  shade_id UUID REFERENCES shades(id),
  grams DECIMAL(5,1),
  display_order INTEGER DEFAULT 0
);

-- Services (completed color services)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  formula_id UUID REFERENCES formulas(id),
  shade_id UUID REFERENCES shades(id),
  developer_vol INTEGER,
  grams_used DECIMAL(5,1),
  price DECIMAL(10,2),
  square_payment_id TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Stylists can view own data" ON stylists FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Stylists can update own data" ON stylists FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Stylists can manage own clients" ON clients FOR ALL USING (auth.uid() = stylist_id);
CREATE POLICY "Stylists can manage own formulas" ON formulas FOR ALL USING (auth.uid() = stylist_id);
CREATE POLICY "Stylists can manage own services" ON services FOR ALL USING (auth.uid() = stylist_id);

-- Public shade data (read-only for everyone)
CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Anyone can view color lines" ON color_lines FOR SELECT USING (true);
CREATE POLICY "Anyone can view shades" ON shades FOR SELECT USING (true);
CREATE POLICY "Anyone can view public formulas" ON formulas FOR SELECT USING (is_public = true);
