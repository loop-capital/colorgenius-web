import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryItemSchema, inventoryListQuerySchema } from "@/lib/vish/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = inventoryListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { salonId, brand, lowStock, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = { salonId };
    if (brand) where.brand = brand;
    if (lowStock) where.OR = [
      { lowStockThreshold: { equals: null } },
      { quantity: { lte: { lowStockThreshold: true } } },
    ];

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({ where, skip, take: limit, orderBy: { lastUpdated: "desc" } }),
      prisma.inventoryItem.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inventoryItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const { salonId, brand, shadeCode, shadeName, quantity, unit, lowStockThreshold } = parsed.data;
    const item = await prisma.inventoryItem.upsert({
      where: { salonId_brand_shadeCode: { salonId, brand, shadeCode } },
      update: { shadeName, quantity, unit, lowStockThreshold },
      create: parsed.data,
    });
    return NextResponse.json(item, { status: 200 });
  } catch (e) {
    console.error("POST /api/v1/inventory error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
