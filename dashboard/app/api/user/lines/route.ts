import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    if (!brand) {
      return NextResponse.json({ error: "brand is required" }, { status: 400 });
    }

    // Find the brand record
    const brandRecord = await prisma.brands.findFirst({
      where: { name: brand },
      select: { id: true },
    });

    if (!brandRecord) {
      // Brand not in DB — return empty lines (user will see no line dropdown)
      return NextResponse.json({ lines: [], source: "no-brand" });
    }

    // Get all active product lines for this brand
    const productLines = await prisma.product_lines.findMany({
      where: {
        brand_id: brandRecord.id,
        is_active: true,
      },
      select: {
        name: true,
        code: true,
      },
      orderBy: { name: "asc" },
    });

    const lines = productLines.map((pl) => ({
      name: pl.name,
      code: pl.code || pl.name,
    }));

    return NextResponse.json({ lines, source: "catalog" });
  } catch (error) {
    console.error("GET /api/user/lines error:", error);
    return NextResponse.json({ error: "Failed to fetch lines" }, { status: 500 });
  }
}
