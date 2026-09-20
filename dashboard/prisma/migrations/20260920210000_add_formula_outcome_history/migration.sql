CREATE TABLE "formula_outcome_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "client_id" UUID NOT NULL,
  "brand" VARCHAR(100) NOT NULL,
  "shade_code" VARCHAR(50) NOT NULL,
  "target_grams" DECIMAL(10,2) NOT NULL,
  "actual_grams" DECIMAL(10,2) NOT NULL,
  "source" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "formula_outcome_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_formula_outcome_history_lookup" ON "formula_outcome_history"("client_id", "brand", "shade_code");
