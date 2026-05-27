-- inventory_items: stores salon inventory (manual + Square-synced)
CREATE TABLE IF NOT EXISTS "inventory_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "source" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "square_catalog_object_id" VARCHAR(255),
    "square_variation_id" VARCHAR(255),
    "brand" VARCHAR(100),
    "product_line" VARCHAR(100),
    "shade_code" VARCHAR(50),
    "shade_name" VARCHAR(100),
    "category" VARCHAR(50),
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_committed" INTEGER NOT NULL DEFAULT 0,
    "unit_of_measure" VARCHAR(20) DEFAULT 'units',
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 3,
    "cost_per_unit" DECIMAL(10,2),
    "retail_price" DECIMAL(10,2),
    "reorder_point" INTEGER,
    "reorder_quantity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_inventory_items_salon" ON "inventory_items"("salon_id");
CREATE INDEX "idx_inventory_items_salon_brand" ON "inventory_items"("salon_id", "brand");
CREATE INDEX "idx_inventory_items_salon_category" ON "inventory_items"("salon_id", "category");
CREATE INDEX "idx_inventory_items_low_stock" ON "inventory_items"("low_stock_threshold");
CREATE INDEX "idx_inventory_items_source" ON "inventory_items"("source");

-- inventory_transactions: audit trail for all inventory changes
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "transaction_type" VARCHAR(20) NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "quantity_before" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "unit_cost" DECIMAL(10,2),
    "total_cost" DECIMAL(10,2),
    "reason" VARCHAR(100),
    "notes" TEXT,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "performed_by" UUID,
    "square_sync_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE,
    CONSTRAINT "inventory_transactions_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_inventory_transactions_salon" ON "inventory_transactions"("salon_id");
CREATE INDEX "idx_inventory_transactions_item" ON "inventory_transactions"("item_id");
CREATE INDEX "idx_inventory_transactions_type" ON "inventory_transactions"("transaction_type");
CREATE INDEX "idx_inventory_transactions_date" ON "inventory_transactions"("created_at" DESC);
CREATE INDEX "idx_inventory_transactions_salon_date" ON "inventory_transactions"("salon_id", "created_at" DESC);

-- square_connections: stores Square OAuth tokens per salon
CREATE TABLE IF NOT EXISTS "square_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "square_merchant_id" VARCHAR(255),
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(6),
    "scopes" TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "sync_error_at" TIMESTAMP(6),
    "square_location_id" VARCHAR(255),
    "square_location_name" VARCHAR(255),
    "auto_sync_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sync_interval_minutes" INTEGER DEFAULT 60,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "square_connections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "square_connections_salon_id_key" UNIQUE ("salon_id"),
    CONSTRAINT "square_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_square_connections_merchant" ON "square_connections"("square_merchant_id");
CREATE INDEX "idx_square_connections_status" ON "square_connections"("status");
