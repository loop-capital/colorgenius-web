-- Salon-level card on file for monthly per-use license billing
ALTER TABLE "salons" ADD COLUMN "square_customer_id" VARCHAR(255);
ALTER TABLE "salons" ADD COLUMN "square_card_id" VARCHAR(255);
ALTER TABLE "salons" ADD COLUMN "billing_card_last4" VARCHAR(4);
ALTER TABLE "salons" ADD COLUMN "billing_card_brand" VARCHAR(20);

-- Rescope formula_billing_invoices from stylist_id (wrong id space; had a
-- real FK to stylists.id but was written with users.id everywhere it was
-- used) to salon_id, matching formula_usage_log/formula_purchases scope.
-- Table has zero rows in production as of this migration — safe drop/add.
ALTER TABLE "formula_billing_invoices" DROP CONSTRAINT "formula_billing_invoices_stylist_id_fkey";
DROP INDEX "uniq_formula_billing_invoice_period";
ALTER TABLE "formula_billing_invoices" DROP COLUMN "stylist_id";
ALTER TABLE "formula_billing_invoices" ADD COLUMN "salon_id" UUID NOT NULL;
ALTER TABLE "formula_billing_invoices" ADD COLUMN "failure_reason" TEXT;
ALTER TABLE "formula_billing_invoices" ADD CONSTRAINT "formula_billing_invoices_salon_id_fkey"
  FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE UNIQUE INDEX "uniq_formula_billing_invoice_period" ON "formula_billing_invoices"("salon_id", "billing_period");
