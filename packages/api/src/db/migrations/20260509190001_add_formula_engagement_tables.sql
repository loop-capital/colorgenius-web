-- =====================================================
-- MARKETPLACE FORMULA ENGAGEMENT TABLES
-- Adds likes, saves, and views for trending algorithm
-- =====================================================

-- ─── Formula Likes ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "formula_likes" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "marketplace_formula_id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE,
    FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE CASCADE,

    UNIQUE("marketplace_formula_id", "stylist_id")
);

CREATE INDEX IF NOT EXISTS "fl_marketplace_formula_id_idx" ON "formula_likes"("marketplace_formula_id");
CREATE INDEX IF NOT EXISTS "fl_stylist_id_idx" ON "formula_likes"("stylist_id");
CREATE INDEX IF NOT EXISTS "fl_created_at_idx" ON "formula_likes"("created_at");

-- ─── Formula Saves ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "formula_saves" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "marketplace_formula_id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE,
    FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE CASCADE,

    UNIQUE("marketplace_formula_id", "stylist_id")
);

CREATE INDEX IF NOT EXISTS "fsv_marketplace_formula_id_idx" ON "formula_saves"("marketplace_formula_id");
CREATE INDEX IF NOT EXISTS "fsv_stylist_id_idx" ON "formula_saves"("stylist_id");
CREATE INDEX IF NOT EXISTS "fsv_created_at_idx" ON "formula_saves"("created_at");

-- ─── Formula Views (for trending algorithm) ──────────
CREATE TABLE IF NOT EXISTS "formula_views" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "marketplace_formula_id" TEXT NOT NULL,
    "stylist_id" TEXT, -- NULL for anonymous views
    "viewer_fingerprint" TEXT, -- browser fingerprint for anonymous dedup
    "session_id" TEXT,
    "source" TEXT DEFAULT 'browse', -- browse | search | trending | direct | share
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE,
    FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "fv_marketplace_formula_id_idx" ON "formula_views"("marketplace_formula_id");
CREATE INDEX IF NOT EXISTS "fv_stylist_id_idx" ON "formula_views"("stylist_id");
CREATE INDEX IF NOT EXISTS "fv_viewer_fingerprint_idx" ON "formula_views"("viewer_fingerprint");
CREATE INDEX IF NOT EXISTS "fv_created_at_idx" ON "formula_views"("created_at");
CREATE INDEX IF NOT EXISTS "fv_formula_created_idx" ON "formula_views"("marketplace_formula_id", "created_at");

-- ─── Formula Search Index (materialized-like helper) ──
-- Full-text search support for SQLite (using FTS5 if available, fallback to regular index)
CREATE TABLE IF NOT EXISTS "formula_search_index" (
    "marketplace_formula_id" TEXT NOT NULL PRIMARY KEY,
    "search_text" TEXT NOT NULL, -- concatenated title, description, tags, brand, technique
    "dominant_colors" TEXT, -- JSON array of hex colors extracted from images
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("marketplace_formula_id") REFERENCES "marketplace_formulas"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "fsi_search_text_idx" ON "formula_search_index"("search_text");

-- ─── Trigger: Update marketplace_formulas engagement counters ──
CREATE TRIGGER IF NOT EXISTS "trg_formula_likes_count"
AFTER INSERT ON "formula_likes"
BEGIN
    UPDATE "marketplace_formulas"
    SET "likes_count" = (SELECT COUNT(*) FROM "formula_likes" WHERE "marketplace_formula_id" = NEW."marketplace_formula_id")
    WHERE "id" = NEW."marketplace_formula_id";
END;

CREATE TRIGGER IF NOT EXISTS "trg_formula_likes_count_delete"
AFTER DELETE ON "formula_likes"
BEGIN
    UPDATE "marketplace_formulas"
    SET "likes_count" = (SELECT COUNT(*) FROM "formula_likes" WHERE "marketplace_formula_id" = OLD."marketplace_formula_id")
    WHERE "id" = OLD."marketplace_formula_id";
END;

CREATE TRIGGER IF NOT EXISTS "trg_formula_saves_count"
AFTER INSERT ON "formula_saves"
BEGIN
    UPDATE "marketplace_formulas"
    SET "saves_count" = (SELECT COUNT(*) FROM "formula_saves" WHERE "marketplace_formula_id" = NEW."marketplace_formula_id")
    WHERE "id" = NEW."marketplace_formula_id";
END;

CREATE TRIGGER IF NOT EXISTS "trg_formula_saves_count_delete"
AFTER DELETE ON "formula_saves"
BEGIN
    UPDATE "marketplace_formulas"
    SET "saves_count" = (SELECT COUNT(*) FROM "formula_saves" WHERE "marketplace_formula_id" = OLD."marketplace_formula_id")
    WHERE "id" = OLD."marketplace_formula_id";
END;

CREATE TRIGGER IF NOT EXISTS "trg_formula_views_count"
AFTER INSERT ON "formula_views"
BEGIN
    UPDATE "marketplace_formulas"
    SET "views_count" = (SELECT COUNT(*) FROM "formula_views" WHERE "marketplace_formula_id" = NEW."marketplace_formula_id")
    WHERE "id" = NEW."marketplace_formula_id";
END;
