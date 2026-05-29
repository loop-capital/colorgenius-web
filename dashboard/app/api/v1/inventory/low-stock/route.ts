import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const salon_id = user.userId;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { page, limit } = parsed.data;
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

    const total = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM inventory_items
      WHERE salon_id = ${salon_id} AND is_active = true AND quantity_on_hand <= low_stock_threshold
    `;
    const totalCount = Number(total[0]?.count ?? 0);

    return NextResponse.json({ items, page, limit, total: totalCount }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory/low-stock error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}