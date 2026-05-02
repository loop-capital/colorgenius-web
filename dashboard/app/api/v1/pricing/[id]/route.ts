import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pricingRuleUpdateSchema } from "@/lib/vish/schemas";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = pricingRuleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const rule = await prisma.pricingRule.update({ where: { id }, data: parsed.data });
    return NextResponse.json(rule, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }
    console.error("PUT /api/v1/pricing/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.pricingRule.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }
    console.error("DELETE /api/v1/pricing/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
