-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'MANAGER', 'COLORIST', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('COLOR', 'DEVELOPER', 'TREATMENT', 'TOOL', 'ACCESSORY', 'RETAIL');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DISCONTINUED', 'PENDING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Porosity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "HairCondition" AS ENUM ('HEALTHY', 'DAMAGED', 'COMPROMISED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE', 'RETURN', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PoStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'COLORIST',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT NOT NULL,
    "line" TEXT,
    "shade_code" TEXT,
    "shade_name" TEXT,
    "size_grams" INTEGER,
    "category" "ProductCategory" NOT NULL DEFAULT 'COLOR',
    "subcategory" TEXT,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock_level" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER NOT NULL DEFAULT 0,
    "reorder_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_cost_cents" INTEGER,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "barcode" TEXT,
    "supplier" TEXT,
    "supplier_sku" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hair_level" INTEGER,
    "hair_porosity" "Porosity",
    "hair_condition" "HairCondition",
    "previous_color" TEXT,
    "target_result" TEXT NOT NULL,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formula_lines" (
    "id" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "amount_grams" INTEGER NOT NULL,
    "developer_vol" TEXT,
    "ratio" TEXT,
    "processing_time_min" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formula_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_formula_usages" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointment_id" TEXT,
    "staff_id" TEXT NOT NULL,
    "outcome_rating" INTEGER,
    "outcome_notes" TEXT,
    "outcome_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_formula_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "amount_grams" INTEGER NOT NULL,
    "formula_id" TEXT,
    "client_id" TEXT,
    "client_name" TEXT,
    "appointment_id" TEXT,
    "client_formula_usage_id" TEXT,
    "unit_cost_cents_at_use" INTEGER,
    "notes" TEXT,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stock_after" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "staff_id" TEXT,
    "unit_cost_cents" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplier_ref" TEXT,
    "status" "PoStatus" NOT NULL DEFAULT 'DRAFT',
    "ordered_at" TIMESTAMP(3),
    "expected_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "subtotal_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "shipping_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "qty_ordered" INTEGER NOT NULL,
    "unit_cost_cents" INTEGER NOT NULL,
    "qty_received" INTEGER NOT NULL DEFAULT 0,
    "received_at" TIMESTAMP(3),
    "line_total_cents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE INDEX "staff_email_idx" ON "staff"("email");

-- CreateIndex
CREATE INDEX "staff_role_idx" ON "staff"("role");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_current_stock_idx" ON "products"("current_stock");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_shade_code_idx" ON "products"("shade_code");

-- CreateIndex
CREATE INDEX "formulas_created_by_id_idx" ON "formulas"("created_by_id");

-- CreateIndex
CREATE INDEX "formulas_created_at_idx" ON "formulas"("created_at");

-- CreateIndex
CREATE INDEX "formula_lines_formula_id_idx" ON "formula_lines"("formula_id");

-- CreateIndex
CREATE INDEX "formula_lines_product_id_idx" ON "formula_lines"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "formula_lines_formula_id_sort_order_key" ON "formula_lines"("formula_id", "sort_order");

-- CreateIndex
CREATE INDEX "client_formula_usages_client_id_idx" ON "client_formula_usages"("client_id");

-- CreateIndex
CREATE INDEX "client_formula_usages_formula_id_idx" ON "client_formula_usages"("formula_id");

-- CreateIndex
CREATE INDEX "client_formula_usages_used_at_idx" ON "client_formula_usages"("used_at");

-- CreateIndex
CREATE INDEX "client_formula_usages_staff_id_idx" ON "client_formula_usages"("staff_id");

-- CreateIndex
CREATE INDEX "usage_logs_staff_id_idx" ON "usage_logs"("staff_id");

-- CreateIndex
CREATE INDEX "usage_logs_product_id_idx" ON "usage_logs"("product_id");

-- CreateIndex
CREATE INDEX "usage_logs_used_at_idx" ON "usage_logs"("used_at");

-- CreateIndex
CREATE INDEX "usage_logs_formula_id_idx" ON "usage_logs"("formula_id");

-- CreateIndex
CREATE INDEX "usage_logs_client_id_idx" ON "usage_logs"("client_id");

-- CreateIndex
CREATE INDEX "usage_logs_client_formula_usage_id_idx" ON "usage_logs"("client_formula_usage_id");

-- CreateIndex
CREATE INDEX "stock_transactions_product_id_idx" ON "stock_transactions"("product_id");

-- CreateIndex
CREATE INDEX "stock_transactions_type_idx" ON "stock_transactions"("type");

-- CreateIndex
CREATE INDEX "stock_transactions_created_at_idx" ON "stock_transactions"("created_at");

-- CreateIndex
CREATE INDEX "stock_transactions_reference_type_reference_id_idx" ON "stock_transactions"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "stock_transactions_staff_id_idx" ON "stock_transactions"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_ordered_at_idx" ON "purchase_orders"("ordered_at");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_idx" ON "purchase_orders"("supplier");

-- CreateIndex
CREATE INDEX "purchase_order_lines_purchase_order_id_idx" ON "purchase_order_lines"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_lines_product_id_idx" ON "purchase_order_lines"("product_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_lines" ADD CONSTRAINT "formula_lines_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_lines" ADD CONSTRAINT "formula_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_formula_usages" ADD CONSTRAINT "client_formula_usages_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_client_formula_usage_id_fkey" FOREIGN KEY ("client_formula_usage_id") REFERENCES "client_formula_usages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
