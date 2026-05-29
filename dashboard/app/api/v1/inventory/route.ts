import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { inventoryItemSchema, inventoryListQuerySchema } from "@/lib/vish/schemas";

function authError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return authError(401, "Authentication required");
    }
    const salon_id = user.userId;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = inventoryListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { brand, category, lowStock, source, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = { salon_id, is_active: true };
    if (brand) where.brand = brand;
    if (category) where.category = category;
    if (source) where.source = source;
    if (lowStock) {
      where.low_stock_threshold = { not: null };
    }

    const [items, total] = await Promise.all([
      prisma.inventory_items.findMany({ where, skip, take: limit, orderBy: { updated_at: "desc" } }),
      prisma.inventory_items.count({ where }),
    ]);

    const filteredItems = lowStock
      ? items.filter((item) => item.quantity_on_hand <= item.low_stock_threshold)
      : items;

    return NextResponse.json(
      { items: filteredItems, total, page, limit, pages: Math.ceil(total / limit) },
      { status: 200 },
    );
  } catch (e) {
    console.error("GET /api/v1/inventory error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return authError(401, "Authentication required");
    }
    const salon_id = user.userId;

    const body = await req.json();
    const parsed = inventoryItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const data = {
      ...parsed.data,
      salon_id,
      source: "manual" as const,
    };

    const item = await prisma.inventory_items.upsert({
      where: {
        salon_id_brand_shade_code: {
          salon_id: data.salon_id,
          brand: data.brand,
          shade_code: data.shade_code,
        },
      },
      update: {
        shade_name: data.shade_name,
        product_line: data.product_line ?? null,
        category: data.category,
        quantity_on_hand: data.quantity_on_hand,
        unit_of_measure: data.unit_of_measure,
        low_stock_threshold: data.low_stock_threshold,
        cost_per_unit: data.cost_per_unit != null ? data.cost_per_unit : null,
        retail_price: data.retail_price != null ? data.retail_price : null,
        reorder_point: data.reorder_point ?? null,
        reorder_quantity: data.reorder_quantity ?? null,
        updated_at: new Date(),
      },
      create: {
        salon_id: data.salon_id,
        source: data.source,
        brand: data.brand,
        product_line: data.product_line ?? null,
        shade_code: data.shade_code,
        shade_name: data.shade_name,
        category: data.category,
        quantity_on_hand: data.quantity_on_hand,
        unit_of_measure: data.unit_of_measure,
        low_stock_threshold: data.low_stock_threshold,
        cost_per_unit: data.cost_per_unit != null ? data.cost_per_unit : null,
        retail_price: data.retail_price != null ? data.retail_price : null,
        reorder_point: data.reorder_point ?? null,
        reorder_quantity: data.reorder_quantity ?? null,
      },
    });

    // Create an inventory_transaction for the initial add
    if (data.quantity_on_hand > 0) {
      await prisma.inventory_transactions.create({
        data: {
          salon_id: data.salon_id,
          item_id: item.id,
          transaction_type: "add",
          quantity_change: data.quantity_on_hand,
          quantity_before: 0,
          quantity_after: data.quantity_on_hand,
          reason: "manual_entry",
          notes: "Initial inventory entry",
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("POST /api/v1/inventory error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}