ALTER TABLE "formula_billing_invoices" ADD COLUMN "voice_assistant_cents" INTEGER DEFAULT 0;

ALTER TABLE "voice_assistant_usage" ADD COLUMN "stylist_id" UUID;
ALTER TABLE "voice_assistant_usage" ADD COLUMN "billing_invoice_id" UUID;

CREATE INDEX "idx_voice_assistant_usage_invoice" ON "voice_assistant_usage"("billing_invoice_id");

ALTER TABLE "voice_assistant_usage" ADD CONSTRAINT "voice_assistant_usage_billing_invoice_id_fkey"
  FOREIGN KEY ("billing_invoice_id") REFERENCES "formula_billing_invoices"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
