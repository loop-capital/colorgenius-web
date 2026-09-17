CREATE TABLE "creator_payouts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "creator_id" UUID NOT NULL,
  "billing_period" VARCHAR(7) NOT NULL,
  "total_cents" INTEGER NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "paid_at" TIMESTAMP(3),
  "payout_method" VARCHAR(50),
  "payout_reference" VARCHAR(255),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creator_payouts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uniq_creator_payout_period" ON "creator_payouts"("creator_id", "billing_period");
CREATE INDEX "idx_creator_payouts_status" ON "creator_payouts"("status");

ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_creator_id_fkey"
  FOREIGN KEY ("creator_id") REFERENCES "stylists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
