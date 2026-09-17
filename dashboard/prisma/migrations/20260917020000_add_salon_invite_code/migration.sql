-- Supports the new salon creation/join flow (POST /api/v1/salons,
-- POST /api/v1/salons/join). Nullable/additive, no existing rows affected.
ALTER TABLE "salons" ADD COLUMN "invite_code" VARCHAR(12);
CREATE UNIQUE INDEX "salons_invite_code_key" ON "salons"("invite_code");
