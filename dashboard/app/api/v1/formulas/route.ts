import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formulaSchema } from "@/lib/vish/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = formulaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const formula = await prisma.formulation.create({ data: parsed.data });
    return NextResponse.json(formula, { status: 201 });
  } catch (e) {
    console.error("POST /api/v1/formulas error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
