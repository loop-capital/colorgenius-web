-- Add columns written by application code but missing from schema and DB.
-- community_posts: fixes POST /api/community/share (was 422 on every call).
-- formulations: un-degrades GET /api/history (target_level/target_tone were null).
-- Purely additive; safe to apply on a live database.

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE formulations ADD COLUMN IF NOT EXISTS target_level TEXT;
ALTER TABLE formulations ADD COLUMN IF NOT EXISTS target_tone TEXT;
