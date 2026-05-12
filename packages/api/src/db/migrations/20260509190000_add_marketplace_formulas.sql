-- =====================================================
-- MARKETPLACE FORMULAS SCHEMA
-- Adds formula marketplace tables to the ColorGenius database
-- =====================================================

-- ─── Stylists table (if not exists) ──────────────────
CREATE TABLE IF NOT EXISTS "Stylist" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT,
    "salon_id" TEXT,
    "role" TEXT DEFAULT 'stylist',
    "uplook_profile_url" TEXT,
    "instagram" TEXT,
    "city" TEXT,
    "state" TEXT,
    "profile_photo_url" TEXT,
    "is_active" INTEGER DEFAULT 1,
    "is_educator" INTEGER DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Stylist_email_idx" ON "Stylist"("email");
CREATE INDEX IF NOT EXISTS "Stylist_is_active_idx" ON "Stylist"("is_active");
CREATE INDEX IF NOT EXISTS "Stylist_salon_id_idx" ON "Stylist"("salon_id");

-- ─── Salons table (if not exists) ────────────────────
CREATE TABLE IF NOT EXISTS "Salon" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE,
    "city" TEXT,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Marketplace Formulas ────────────────────────────
CREATE TABLE IF NOT EXISTS "marketplace_formulas" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Ownership
    "stylist_id" TEXT NOT NULL,
    "salon_id" TEXT,

    -- Formula ID for sharing (e.g. "CG-73921")
    "formula_id" TEXT UNIQUE NOT NULL DEFAULT ('CG-' || substr(abs(random()), 1, 5)),

    -- Formula listing content
    "title" TEXT NOT NULL,
    "description" TEXT,

    -- Formula details
    "brand" TEXT,
    "product_line" TEXT,
    "developer_volume" INTEGER DEFAULT 20,
    "mixing_ratio" TEXT DEFAULT '1:1',
    "processing_time" INTEGER DEFAULT 30,
    "application_method" TEXT,

    -- Starting conditions
    "natural_level" INTEGER,
    "previous_color" TEXT,
    "grey_percentage" INTEGER DEFAULT 0,
    "porosity" TEXT DEFAULT 'normal',
    "hair_condition" TEXT DEFAULT 'healthy',
    "hair_texture" TEXT,
    "hair_density" TEXT,

    -- Search / discovery attributes
    "technique" TEXT,               -- e.g. "balayage", "full color", "highlights"
    "hair_type" TEXT,               -- fine, medium, coarse
    "hair_length" TEXT,             -- short, medium, long
    "result_level" INTEGER,
    "result_tone" TEXT,
    "tags" TEXT,                    -- comma-separated for SQLite
    "season" TEXT,                  -- spring, summer, fall, winter

    -- Engagement counters
    "views_count" INTEGER DEFAULT 0,
    "saves_count" INTEGER DEFAULT 0,
    "likes_count" INTEGER DEFAULT 0,

    -- Moderation / status
    "status" TEXT DEFAULT 'pending_review', -- pending_review | approved | rejected | paused
    "rejection_reason" TEXT,

    -- Created from existing formula (optional)
    "original_formula_id" TEXT,

    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE CASCADE,
    FOREIGN KEY ("salon_id") REFERENCES "Salon"("id") ON DELETE SET NULL,
    FOREIGN KEY ("original_formula_id") REFERENCES "Formula"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "mpf_stylist_id_idx" ON "marketplace_formulas"("stylist_id");
CREATE INDEX IF NOT EXISTS "mpf_status_idx" ON "marketplace_formulas"("status");
CREATE INDEX IF NOT EXISTS "mpf_technique_idx" ON "marketplace_formulas"("technique");
CREATE INDEX IF NOT EXISTS "mpf_hair_type_idx" ON "marketplace_formulas"("hair_type");
CREATE INDEX IF NOT EXISTS "mpf_hair_length_idx" ON "marketplace_formulas"("hair_length");
CREATE INDEX IF NOT EXISTS "mpf_result_level_idx" ON "marketplace_formulas"("result_level");
CREATE INDEX IF NOT EXISTS "mpf_result_tone_idx" ON "marketplace_formulas"("result_tone");
CREATE INDEX IF NOT EXISTS "mpf_season_idx" ON "marketplace_formulas"("season");
CREATE INDEX IF NOT EXISTS "mpf_brand_idx" ON "marketplace_formulas"("brand");
CREATE INDEX IF NOT EXISTS "mpf_created_at_idx" ON "marketplace_formulas"("created_at");
CREATE INDEX IF NOT EXISTS "mpf_formula_id_idx" ON "marketplace_formulas"("formula_id");
CREATE INDEX IF NOT EXISTS "mpf_status_created_at_idx" ON "marketplace_formulas"("status", "created_at");

-- ─── Formula Images ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "formula_images" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "marketplace_formula_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "alt_text" TEXT,
    "image_type" TEXT NOT NULL DEFAULT 'secondary', -- hero | additional | before | after
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "fi_marketplace_formula_id_idx" ON "formula_images"("marketplace_formula_id");
CREATE INDEX IF NOT EXISTS "fi_image_type_idx" ON "formula_images"("image_type");

-- ─── Formula Shades (join table for multi-shade formulas) ──
CREATE TABLE IF NOT EXISTS "formula_shades" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "marketplace_formula_id" TEXT NOT NULL,
    "shade_id" TEXT,                -- FK to Shade table if available
    "shade_code" TEXT NOT NULL,
    "shade_name" TEXT,
    "brand" TEXT,
    "product_line" TEXT,
    "amount_g" INTEGER DEFAULT 0,
    "amount_ml" INTEGER DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE,
    FOREIGN KEY ("shade_id") REFERENCES "Shade"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "fs_marketplace_formula_id_idx" ON "formula_shades"("marketplace_formula_id");
CREATE INDEX IF NOT EXISTS "fs_shade_id_idx" ON "formula_shades"("shade_id");
