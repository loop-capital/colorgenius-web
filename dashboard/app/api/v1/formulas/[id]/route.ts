import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { formulaUpdateSchema } from "@/lib/vish/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await params;
    const formula = await prisma.formulas.findUnique({ where: { id } });
    if (!formula) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    // Only allow access to own formulas
    if (formula.stylist_id && formula.stylist_id !== user.userId) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    return NextResponse.json(formula, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.formulas.findUnique({ where: { id } });
    if (!existing || (existing.stylist_id && existing.stylist_id !== user.userId)) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = formulaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const formula = await prisma.formulas.update({ where: { id }, data: parsed.data });
    return NextResponse.json(formula, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    console.error("PUT /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.formulas.findUnique({ where: { id } });
    if (!existing || (existing.stylist_id && existing.stylist_id !== user.userId)) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    await prisma.formulas.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    console.error("DELETE /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
