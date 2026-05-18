import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  salonId: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { salonId, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Fetch items with a threshold set, ordered by quantity ascending
    // Then filter in-memory for quantity <= threshold (Prisma cannot do column-to-column comparison)
    const allItems = await prisma.inventoryItem.findMany({
      where: {
        salonId,
        lowStockThreshold: { not: null },
      },
      skip,
      take: limit,
      orderBy: { quantity: "asc" },
    });

    const items = allItems.filter(
      (item) =>
        item.lowStockThreshold !== null &&
        item.quantity <= item.lowStockThreshold
    );

    return NextResponse.json({ items, page, limit }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory/reorder-check error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
