-- Admin-settable override for a creator's marketplace pricing tier
-- (e.g. "elite" for a hand-picked stylist), independent of the existing
-- creator_tier column which is used for account-type classification
-- (stylist/beta_tester/brand_ambassador), not marketplace pricing.
ALTER TABLE "stylists" ADD COLUMN "marketplace_tier_override" VARCHAR(20);
