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
    const inventoryBrands = await prisma.inventoryItem.findMany({
      where: { salonId },
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

    // Step 3: Default brand list (free tier)
    const allBrands = [
      "Davines", "Wella", "Schwarzkopf", "Redken", "Matrix",
      "Joico", "Paul Mitchell", "Pulp Riot", "Goldwell",
      "L'Oréal", "Pravana", "Kenra",
    ];

    return NextResponse.json({
      brands: allBrands,
      source: "all",
      tier: "unlimited",
      max_brands: 999,
      used_brands: usedBrands,
      can_add_more: true,
    });
  } catch (error) {
    console.error("GET /api/user/brands error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
