import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");
    const salonId = searchParams.get("salonId");

    if (!brand) {
      return NextResponse.json({ error: "brand is required" }, { status: 400 });
    }

    // Get inventory items for this brand/salon
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        brand,
        ...(salonId ? { salonId } : {}),
      },
      select: {
        shadeCode: true,
        shadeName: true,
        quantity: true,
        brand: true,
      },
      orderBy: { shadeCode: "asc" },
    });

    if (inventoryItems.length === 0) {
      return NextResponse.json({ shades: [], source: "empty" });
    }

    // Try to resolve line names (graceful fallback if tables don't exist or no match)
    let lineMap: Record<string, string> = {};
    try {
      const shadeCodes = inventoryItems.map((i) => i.shadeCode);

      const brandRecord = await prisma.brands.findFirst({
        where: { name: brand },
        select: { id: true },
      });

      if (brandRecord) {
        const shadeRecords = await prisma.shades.findMany({
          where: {
            shade_code: { in: shadeCodes },
            product_lines: { brand_id: brandRecord.id },
          },
          select: {
            shade_code: true,
            product_lines: { select: { name: true, code: true } },
          },
        });

        for (const sr of shadeRecords) {
          if (sr.product_lines) {
            lineMap[sr.shade_code] = sr.product_lines.code || sr.product_lines.name;
          }
        }
      }
    } catch (lineErr) {
      console.warn("Line resolution failed (non-fatal):", lineErr);
    }

    // Enrich inventory items with line info
    const enriched = inventoryItems.map((item) => ({
      ...item,
      line: lineMap[item.shadeCode] || null,
    }));

    return NextResponse.json({
      shades: enriched,
      source: "inventory",
    });
  } catch (error) {
    console.error("GET /api/user/shades error:", error);
    return NextResponse.json({ error: "Failed to fetch shades" }, { status: 500 });
  }
}
