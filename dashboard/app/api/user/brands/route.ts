import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map tiers to max brands allowed
const TIER_LIMITS: Record<string, number> = {
  starter: 1,
  salon: 3,
  pro: 5,
  elite: 999,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json({ error: "Missing salonId" }, { status: 400 });
    }

    // Get salon with tier info
    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: {
        preferred_brands: true,
        subscription_tier: true,
        subscription_expires_at: true,
      },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check subscription validity
    const isExpired = salon.subscription_expires_at
      ? new Date(salon.subscription_expires_at) < new Date()
      : false;

    const tier = isExpired ? "starter" : (salon.subscription_tier || "salon");
    const maxBrands = TIER_LIMITS[tier] || 3;
    const preferredBrands = salon.preferred_brands || [];
    const usedBrands = preferredBrands.length;

    // Step 1: Try to get distinct brands from inventory
    const inventoryBrands = await prisma.inventory_items.findMany({
      where: { salon_id: salonId, is_active: true },
      select: { brand: true },
      distinct: ["brand"],
    });

    if (inventoryBrands.length > 0) {
      return NextResponse.json({
        brands: inventoryBrands.map((b) => b.brand),
        source: "inventory",
        tier,
        max_brands: maxBrands,
        used_brands: usedBrands,
        can_add_more: usedBrands < maxBrands,
      });
    }

    // Step 2: Fall back to salon's preferred_brands
    if (preferredBrands.length > 0) {
      return NextResponse.json({
        brands: preferredBrands,
        source: "salon",
        tier,
        max_brands: maxBrands,
        used_brands: usedBrands,
        can_add_more: usedBrands < maxBrands,
      });
    }

    // Step 3: Use all available brands from product database, limited by tier
    // This is the default for salons that haven't set preferred_brands yet
    const { BRANDS: ALL_BRANDS } = await import('@/lib/products');
    const tierLimitedBrands = ALL_BRANDS.slice(0, maxBrands);

    return NextResponse.json({
      brands: tierLimitedBrands,
      source: "all-tiered",
      tier,
      max_brands: maxBrands,
      used_brands: tierLimitedBrands.length,
      can_add_more: tierLimitedBrands.length < ALL_BRANDS.length,
    });
  } catch (error) {
    console.error("GET /api/user/brands error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
