ALTER TABLE "phorest_connections" ALTER COLUMN "branch_id" DROP NOT NULL;
ALTER TABLE "phorest_connections" ADD COLUMN "auto_sync_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "phorest_connections" ADD COLUMN "sync_interval_minutes" INTEGER DEFAULT 60;
