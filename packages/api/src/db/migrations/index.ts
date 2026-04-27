import { Pool } from 'pg';
import { config } from '../../config.js';

const migrationSql = `
-- ColorGenius Database Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  client_id UUID,
  photo_path VARCHAR(500),
  photo_type VARCHAR(20),
  level INT,
  tone VARCHAR(20),
  rgb INT[3],
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  analysis_id UUID REFERENCES analyses(id),
  current_level INT,
  target_level INT,
  target_tone VARCHAR(20),
  brand VARCHAR(100),
  developer_volume INT,
  developer_time INT,
  formula_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS color_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100),
  product_line VARCHAR(100),
  shade_code VARCHAR(20),
  shade_name VARCHAR(100),
  level INT,
  tone VARCHAR(10),
  rgb INT[3],
  is_natural BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_formulations_user_id ON formulations(user_id);
CREATE INDEX IF NOT EXISTS idx_color_lines_brand ON color_lines(brand);
CREATE INDEX IF NOT EXISTS idx_color_lines_level ON color_lines(level);
CREATE INDEX IF NOT EXISTS idx_color_lines_tone ON color_lines(tone);

-- Sample color line data (Wella Color Charm, Matrix, Redken)
INSERT INTO color_lines (brand, product_line, shade_code, shade_name, level, tone, rgb, is_natural) VALUES
('Wella Color Charm', 'Color Charm', '1N', 'Natural Black', 1, 'natural', ARRAY[0, 0, 0], true),
('Wella Color Charm', 'Color Charm', '2N', 'Natural Dark Brown', 2, 'natural', ARRAY[30, 15, 0], true),
('Wella Color Charm', 'Color Charm', '3N', 'Natural Medium Brown', 3, 'natural', ARRAY[60, 35, 15], true),
('Wella Color Charm', 'Color Charm', '4N', 'Natural Light Brown', 4, 'natural', ARRAY[90, 60, 30], true),
('Wella Color Charm', 'Color Charm', '5N', 'Natural Dark Blonde', 5, 'natural', ARRAY[130, 90, 50], true),
('Wella Color Charm', 'Color Charm', '6N', 'Natural Medium Blonde', 6, 'natural', ARRAY[165, 120, 70], true),
('Wella Color Charm', 'Color Charm', '7N', 'Natural Light Blonde', 7, 'natural', ARRAY[200, 160, 95], true),
('Wella Color Charm', 'Color Charm', '8N', 'Natural Pale Blonde', 8, 'natural', ARRAY[230, 195, 130], true),
('Wella Color Charm', 'Color Charm', '6A', 'Ashy Brown', 6, 'ash', ARRAY[150, 100, 70], false),
('Wella Color Charm', 'Color Charm', '7A', 'Ashy Blonde', 7, 'ash', ARRAY[185, 140, 100], false),
('Wella Color Charm', 'Color Charm', '8A', 'Pale Ash Blonde', 8, 'ash', ARRAY[215, 170, 125], false),
('Wella Color Charm', 'Color Charm', '5R', 'Reddish Brown', 5, 'red', ARRAY[110, 55, 30], false),
('Wella Color Charm', 'Color Charm', '6R', 'Red Brown', 6, 'red', ARRAY[130, 60, 35], false),
('Wella Color Charm', 'Color Charm', '6G', 'Golden Brown', 6, 'gold', ARRAY[145, 95, 55], false),
('Wella Color Charm', 'Color Charm', '7G', 'Golden Blonde', 7, 'gold', ARRAY[180, 130, 75], false),
('Matrix', 'SoColor', '2N', 'Dark Brown', 2, 'natural', ARRAY[35, 20, 5], true),
('Matrix', 'SoColor', '3N', 'Medium Brown', 3, 'natural', ARRAY[55, 30, 12], true),
('Matrix', 'SoColor', '4N', 'Light Brown', 4, 'natural', ARRAY[85, 55, 25], true),
('Matrix', 'SoColor', '5N', 'Dark Blonde', 5, 'natural', ARRAY[120, 85, 45], true),
('Matrix', 'SoColor', '6N', 'Medium Blonde', 6, 'natural', ARRAY[160, 115, 65], true),
('Matrix', 'SoColor', '7N', 'Light Blonde', 7, 'natural', ARRAY[195, 155, 90], true),
('Matrix', 'SoColor', '8N', 'Pale Blonde', 8, 'natural', ARRAY[225, 190, 125], true),
('Matrix', 'SoColor', '6A', 'Beige Brown', 6, 'ash', ARRAY[145, 105, 80], false),
('Matrix', 'SoColor', '7A', 'Beige Blonde', 7, 'ash', ARRAY[180, 145, 110], false),
('Matrix', 'SoColor', '5W', 'Warm Dark Blonde', 5, 'warm', ARRAY[125, 80, 40], false),
('Matrix', 'SoColor', '6W', 'Warm Medium Brown', 6, 'warm', ARRAY[155, 100, 50], false),
('Matrix', 'SoColor', '7W', 'Warm Light Blonde', 7, 'warm', ARRAY[190, 145, 80], false),
('Redken', 'Color Gels', '2N', 'Natural Black', 2, 'natural', ARRAY[20, 10, 5], true),
('Redken', 'Color Gels', '3N', 'Natural Dark Brown', 3, 'natural', ARRAY[40, 20, 10], true),
('Redken', 'Color Gels', '4N', 'Natural Medium Brown', 4, 'natural', ARRAY[70, 40, 20], true),
('Redken', 'Color Gels', '5N', 'Natural Light Brown', 5, 'natural', ARRAY[100, 65, 35], true),
('Redken', 'Color Gels', '6N', 'Natural Dark Blonde', 6, 'natural', ARRAY[135, 95, 55], true),
('Redken', 'Color Gels', '7N', 'Natural Medium Blonde', 7, 'natural', ARRAY[170, 125, 75], true),
('Redken', 'Color Gels', '8N', 'Natural Light Blonde', 8, 'natural', ARRAY[205, 165, 105], true),
('Redken', 'Color Gels', '9N', 'Natural Pale Blonde', 9, 'natural', ARRAY[235, 205, 150], true),
('Redken', 'Color Gels', '5G', 'Gold Auburn', 5, 'gold', ARRAY[115, 60, 30], false),
('Redken', 'Color Gels', '6G', 'Golden Brown', 6, 'gold', ARRAY[140, 85, 45], false),
('Redken', 'Color Gels', '7G', 'Golden Blonde', 7, 'gold', ARRAY[175, 120, 65], false),
('Redken', 'Color Gels', '5RV', 'Red Violet', 5, 'red', ARRAY[100, 35, 50], false),
('Redken', 'Color Gels', '6RV', 'Burgundy', 6, 'red', ARRAY[120, 40, 60], false)
ON CONFLICT DO NOTHING;
`;

export async function migrate(): Promise<void> {
  const pool = new Pool({
    connectionString: config.database.url,
  });

  try {
    console.log('Running database migrations...');
    await pool.query(migrationSql);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if executed directly
migrate().catch(console.error);