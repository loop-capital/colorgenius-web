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
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { salon_id, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Prisma cannot do column-to-column comparison, so use raw SQL for reorder_point check
    const items = await prisma.$queryRaw`
      SELECT id, salon_id, source, brand, product_line, shade_code, shade_name, category,
             quantity_on_hand, quantity_committed, unit_of_measure, low_stock_threshold,
             cost_per_unit, retail_price, reorder_point, reorder_quantity, is_active,
             last_synced_at, created_at, updated_at
      FROM inventory_items
      WHERE salon_id = ${salon_id}
        AND is_active = true
        AND reorder_point IS NOT NULL
        AND quantity_on_hand <= reorder_point
      ORDER BY quantity_on_hand ASC
      LIMIT ${limit} OFFSET ${skip}
    ` as Array<{
      id: string;
      salon_id: string;
      source: string;
      brand: string | null;
      product_line: string | null;
      shade_code: string | null;
      shade_name: string | null;
      category: string | null;
      quantity_on_hand: number;
      quantity_committed: number;
      unit_of_measure: string | null;
      low_stock_threshold: number;
      cost_per_unit: number | null;
      retail_price: number | null;
      reorder_point: number | null;
      reorder_quantity: number | null;
      is_active: boolean;
      last_synced_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>;

    // Calculate suggested reorder quantities
    const reorderItems = items.map((item) => ({
      ...item,
      suggested_order_qty: item.reorder_quantity ?? Math.max(0, (item.low_stock_threshold ?? 3) - item.quantity_on_hand),
      deficit: Math.max(0, (item.reorder_point ?? 0) - item.quantity_on_hand),
    }));

    return NextResponse.json({ items: reorderItems, page, limit }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory/reorder-check error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}