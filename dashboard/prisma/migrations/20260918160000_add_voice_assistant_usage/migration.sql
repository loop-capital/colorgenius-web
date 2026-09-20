CREATE TABLE "voice_assistant_usage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "salon_id" UUID NOT NULL,
  "question" TEXT,
  "cost_cents" DECIMAL(10,4) NOT NULL,
  "est_minutes" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "voice_assistant_usage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_voice_assistant_usage_salon" ON "voice_assistant_usage"("salon_id");
CREATE INDEX "idx_voice_assistant_usage_created" ON "voice_assistant_usage"("created_at");

ALTER TABLE "voice_assistant_usage" ADD CONSTRAINT "voice_assistant_usage_salon_id_fkey"
  FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
