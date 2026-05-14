import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    // Step 1: Try to get distinct brands from inventory
    if (salonId) {
      const inventoryBrands = await prisma.inventoryItem.findMany({
        where: { salonId },
        select: { brand: true },
        distinct: ["brand"],
      });

      if (inventoryBrands.length > 0) {
        return NextResponse.json({
          brands: inventoryBrands.map((b) => b.brand),
          source: "inventory",
        });
      }

      // Step 2: Fall back to salon's preferred_brands
      const salon = await prisma.salons.findUnique({
        where: { id: salonId },
        select: { preferred_brands: true },
      });

      if (salon?.preferred_brands && salon.preferred_brands.length > 0) {
        return NextResponse.json({
          brands: salon.preferred_brands,
          source: "salon",
        });
      }
    }

    // Step 3: Default brand list
    const allBrands = [
      "Davines", "Wella", "Schwarzkopf", "Redken", "Matrix",
      "Joico", "Paul Mitchell", "Pulp Riot", "Goldwell",
      "L'Oréal", "Pravana", "Kenra",
    ];

    return NextResponse.json({ brands: allBrands, source: "all" });
  } catch (error) {
    console.error("GET /api/user/brands error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
