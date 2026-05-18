import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deductSchema = z.object({
  salonId: z.string().min(1),
  items: z.array(
    z.object({
      shadeCode: z.string().min(1),
      brand: z.string().min(1),
      shadeName: z.string().optional(),
      grams: z.number().positive(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = deductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { salonId, items } = parsed.data;
    const results: Array<{
      shadeCode: string;
      brand: string;
      deducted: number;
      remaining: number;
      lowStock: boolean;
    }> = [];

    for (const item of items) {
      const existing = await prisma.inventoryItem.findUnique({
        where: {
          salonId_brand_shadeCode: {
            salonId,
            brand: item.brand,
            shadeCode: item.shadeCode,
          },
        },
      });

      if (!existing) {
        // Create a new inventory item at 0 (negative not allowed)
        await prisma.inventoryItem.create({
          data: {
            salonId,
            brand: item.brand,
            shadeCode: item.shadeCode,
            shadeName: item.shadeName || item.shadeCode,
            quantity: 0,
            unit: "g",
          },
        });
        results.push({
          shadeCode: item.shadeCode,
          brand: item.brand,
          deducted: 0,
          remaining: 0,
          lowStock: true,
        });
        continue;
      }

      const newQty = Math.max(0, existing.quantity - Math.round(item.grams));
      const deducted = existing.quantity - newQty;
      const lowStock =
        existing.lowStockThreshold !== null &&
        existing.lowStockThreshold !== undefined &&
        newQty <= existing.lowStockThreshold;

      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          lastUpdated: new Date(),
        },
      });

      results.push({
        shadeCode: item.shadeCode,
        brand: item.brand,
        deducted,
        remaining: newQty,
        lowStock,
      });
    }

    return NextResponse.json(
      { success: true, results, lowStockItems: results.filter((r) => r.lowStock) },
      { status: 200 }
    );
  } catch (e) {
    console.error("POST /api/v1/inventory/deduct error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
