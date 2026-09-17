CREATE TABLE "colorbar_pairing_codes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(8) NOT NULL,
  "salon_id" UUID NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'waiting',
  "claimed_by" UUID,
  "session_id" UUID,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "expires_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "colorbar_pairing_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "colorbar_pairing_codes_code_key" ON "colorbar_pairing_codes"("code");
CREATE INDEX "idx_colorbar_pairing_codes_salon" ON "colorbar_pairing_codes"("salon_id");
CREATE INDEX "idx_colorbar_pairing_codes_code" ON "colorbar_pairing_codes"("code");

ALTER TABLE "colorbar_pairing_codes" ADD CONSTRAINT "colorbar_pairing_codes_salon_id_fkey"
  FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
