-- Salon-editable "how many grams is one container of this product" so the
-- Receive Stock flow can prefill a per-product default instead of always
-- falling back to the generic per-category default.
ALTER TABLE "inventory_items" ADD COLUMN "typical_container_grams" INTEGER;
