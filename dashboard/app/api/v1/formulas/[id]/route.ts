import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formulaUpdateSchema } from "@/lib/vish/schemas";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formula = await prisma.formulation.findUnique({ where: { id } });
    if (!formula) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    return NextResponse.json(formula, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = formulaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const formula = await prisma.formula.update({ where: { id }, data: parsed.data });
    return NextResponse.json(formula, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    console.error("PUT /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.formula.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }
    console.error("DELETE /api/v1/formulas/:id error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
