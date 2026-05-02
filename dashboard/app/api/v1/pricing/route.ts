import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pricingRuleSchema, pricingRuleUpdateSchema, pricingListQuerySchema } from "@/lib/vish/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = pricingListQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
    }
    const { salonId, serviceType, effectiveAfter, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = { salonId };
    if (serviceType) where.serviceType = serviceType;
    if (effectiveAfter) where.effectiveDate = { gte: effectiveAfter };

    const [rules, total] = await Promise.all([
      prisma.pricingRule.findMany({ where, skip, take: limit, orderBy: { effectiveDate: "desc" } }),
      prisma.pricingRule.count({ where }),
    ]);

    return NextResponse.json({ rules, total, page, limit, pages: Math.ceil(total / limit) }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/pricing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = pricingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const rule = await prisma.pricingRule.create({ data: parsed.data });
    return NextResponse.json(rule, { status: 201 });
  } catch (e) {
    console.error("POST /api/v1/pricing error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
