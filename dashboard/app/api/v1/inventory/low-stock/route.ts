import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  salon_id: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { salon_id, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Prisma cannot do column-to-column comparison, so we use raw SQL
    const items = await prisma.$queryRaw`
      SELECT id, salon_id, source, brand, product_line, shade_code, shade_name, category,
             quantity_on_hand, quantity_committed, unit_of_measure, low_stock_threshold,
             cost_per_unit, retail_price, reorder_point, reorder_quantity, is_active,
             last_synced_at, created_at, updated_at
      FROM inventory_items
      WHERE salon_id = ${salon_id}
        AND is_active = true
        AND quantity_on_hand <= low_stock_threshold
      ORDER BY quantity_on_hand ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const total = await prisma.inventory_items.count({
      where: {
        salon_id,
        is_active: true,
      },
    });

    return NextResponse.json({ items, page, limit, total }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory/low-stock error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}