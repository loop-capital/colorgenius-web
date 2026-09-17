CREATE TABLE "clover_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "merchant_id" VARCHAR(255),
    "merchant_name" VARCHAR(255),
    "access_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT now(),
    "updated_at" TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT "clover_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "clover_connections_salon_id_key" ON "clover_connections"("salon_id");
CREATE INDEX "idx_clover_connections_status" ON "clover_connections"("status");
ALTER TABLE "clover_connections" ADD CONSTRAINT "clover_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE "vagaro_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "business_id" VARCHAR(255),
    "business_name" VARCHAR(255),
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT now(),
    "updated_at" TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT "vagaro_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vagaro_connections_salon_id_key" ON "vagaro_connections"("salon_id");
CREATE INDEX "idx_vagaro_connections_status" ON "vagaro_connections"("status");
ALTER TABLE "vagaro_connections" ADD CONSTRAINT "vagaro_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE "zenoti_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "center_id" VARCHAR(255),
    "api_key_encrypted" TEXT,
    "business_name" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT now(),
    "updated_at" TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT "zenoti_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "zenoti_connections_salon_id_key" ON "zenoti_connections"("salon_id");
CREATE INDEX "idx_zenoti_connections_status" ON "zenoti_connections"("status");
ALTER TABLE "zenoti_connections" ADD CONSTRAINT "zenoti_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE "mindbody_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "site_id" VARCHAR(255),
    "api_key_encrypted" TEXT,
    "business_name" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT now(),
    "updated_at" TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT "mindbody_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "mindbody_connections_salon_id_key" ON "mindbody_connections"("salon_id");
CREATE INDEX "idx_mindbody_connections_status" ON "mindbody_connections"("status");
ALTER TABLE "mindbody_connections" ADD CONSTRAINT "mindbody_connections_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
