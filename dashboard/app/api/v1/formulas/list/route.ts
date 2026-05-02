import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formulaListQuerySchema } from "@/lib/vish/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = formulaListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { clientId, stylistId, salonId, brand, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (stylistId) where.stylistId = stylistId;
    if (salonId) where.salonId = salonId;
    if (brand) where.brand = brand;

    const [items, total] = await Promise.all([
      prisma.formula.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.formula.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/formulas/list error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
