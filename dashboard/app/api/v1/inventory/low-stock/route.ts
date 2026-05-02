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
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { salonId, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const items = await prisma.$queryRaw`
      SELECT * FROM "InventoryItem"
      WHERE "salonId" = ${salonId}
        AND "lowStockThreshold" IS NOT NULL
        AND quantity <= "lowStockThreshold"
      ORDER BY quantity ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    return NextResponse.json({ items, page, limit }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/inventory/low-stock error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
