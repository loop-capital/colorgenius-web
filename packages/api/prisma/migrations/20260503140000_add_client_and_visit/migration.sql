-- Migration: Add Client and ClientVisit tables, wire relations
-- Generated for: ColorGenius API

-- ────────────────────────────────────────────────
-- 1. Create new enum: ServiceType
-- ────────────────────────────────────────────────
CREATE TYPE "ServiceType" AS ENUM ('FULL_COLOR', 'RETOUCH', 'HIGHLIGHTS', 'BALAYAGE', 'CORRECTION', 'GLOSS', 'TONER');

-- ────────────────────────────────────────────────
-- 2. Create new table: clients
-- ────────────────────────────────────────────────
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "hair_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");
CREATE INDEX "clients_email_idx" ON "clients"("email");
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- ────────────────────────────────────────────────
-- 3. Create new table: client_visits
-- ────────────────────────────────────────────────
CREATE TABLE "client_visits" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "formula_id" TEXT,
    "price_charged" INTEGER NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "client_visits_client_id_idx" ON "client_visits"("client_id");
CREATE INDEX "client_visits_visit_date_idx" ON "client_visits"("visit_date");
CREATE INDEX "client_visits_formula_id_idx" ON "client_visits"("formula_id");
CREATE INDEX "client_visits_service_type_idx" ON "client_visits"("service_type");

-- ────────────────────────────────────────────────
-- 4. Create new table: service_pricing
-- ────────────────────────────────────────────────
CREATE TABLE "service_pricing" (
    "id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "base_price" INTEGER NOT NULL,
    "price_per_oz" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pricing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_pricing_service_type_key" ON "service_pricing"("service_type");
CREATE INDEX "service_pricing_service_type_idx" ON "service_pricing"("service_type");

-- ────────────────────────────────────────────────
-- 5. Create new table: profit_snapshots (was previously un-wired)
-- ────────────────────────────────────────────────
CREATE TABLE "profit_snapshots" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "revenue" INTEGER NOT NULL,
    "product_cost" INTEGER NOT NULL,
    "labor_cost" INTEGER,
    "profit" INTEGER NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profit_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profit_snapshots_visit_id_key" ON "profit_snapshots"("visit_id");
CREATE INDEX "profit_snapshots_visit_id_idx" ON "profit_snapshots"("visit_id");
CREATE INDEX "profit_snapshots_created_at_idx" ON "profit_snapshots"("created_at");

-- ────────────────────────────────────────────────
-- 6. Add FK: client_visits → clients (cascade delete)
-- ────────────────────────────────────────────────
ALTER TABLE "client_visits"
    ADD CONSTRAINT "client_visits_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────
-- 7. Add FK: client_visits → formulas (nullable, set null on delete)
-- ────────────────────────────────────────────────
ALTER TABLE "client_visits"
    ADD CONSTRAINT "client_visits_formula_id_fkey"
    FOREIGN KEY ("formula_id") REFERENCES "formulas"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────
-- 8. Add FK: client_formula_usages → clients (cascade delete)
--    (column already exists; relation field is new)
-- ────────────────────────────────────────────────
ALTER TABLE "client_formula_usages"
    ADD CONSTRAINT "client_formula_usages_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────
-- 9. Add FK: usage_logs → clients (nullable, set null on delete)
--    (column already exists; relation field is new)
-- ────────────────────────────────────────────────
ALTER TABLE "usage_logs"
    ADD CONSTRAINT "usage_logs_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────
-- 10. Add FK: profit_snapshots → client_visits
-- ────────────────────────────────────────────────
ALTER TABLE "profit_snapshots"
    ADD CONSTRAINT "profit_snapshots_visit_id_fkey"
    FOREIGN KEY ("visit_id") REFERENCES "client_visits"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ────────────────────────────────────────────────
-- 11. Seed default service pricing (matches schema comments)
-- ────────────────────────────────────────────────
INSERT INTO "service_pricing" ("id", "service_type", "base_price", "updated_at")
VALUES
    (gen_random_uuid()::text, 'FULL_COLOR', 8500, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'RETOUCH',    6500, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'HIGHLIGHTS', 15000, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'BALAYAGE',   20000, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'CORRECTION', 25000, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'GLOSS',      4500, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'TONER',      3500, CURRENT_TIMESTAMP);
