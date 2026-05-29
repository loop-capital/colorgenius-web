import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { formulaListQuerySchema } from "@/lib/vish/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const salonId = user.userId;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = formulaListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { clientId, stylistId, brand, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (clientId) where.client_id = clientId;
    if (stylistId) where.stylist_id = stylistId;
    if (brand) where.brand = brand;

    const [items, total] = await Promise.all([
      prisma.formulas.findMany({ where, skip, take: limit, orderBy: { created_at: "desc" } }),
      prisma.formulas.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/formulas/list error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
