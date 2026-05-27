-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "square_catalog_object_id" VARCHAR(255),
    "square_variation_id" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "category" VARCHAR(100),
    "quantity_on_hand" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(10,2),
    "retail_price" DECIMAL(10,2),
    "low_stock_threshold" DECIMAL(10,2) NOT NULL DEFAULT 3,
    "is_tracked" BOOLEAN NOT NULL DEFAULT true,
    "square_updated_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "reference_id" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "square_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "merchant_id" VARCHAR(255),
    "location_id" VARCHAR(255),
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "square_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_salon_id_idx" ON "inventory_items"("salon_id");
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");
CREATE INDEX "inventory_items_sku_idx" ON "inventory_items"("sku");
CREATE UNIQUE INDEX "inventory_items_salon_id_square_variation_id_key" ON "inventory_items"("salon_id", "square_variation_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_salon_id_idx" ON "inventory_transactions"("salon_id");
CREATE INDEX "inventory_transactions_item_id_idx" ON "inventory_transactions"("item_id");
CREATE INDEX "inventory_transactions_type_idx" ON "inventory_transactions"("type");
CREATE INDEX "inventory_transactions_created_at_idx" ON "inventory_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "square_connections_salon_id_key" ON "square_connections"("salon_id");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "square_connections" ADD CONSTRAINT "square_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
