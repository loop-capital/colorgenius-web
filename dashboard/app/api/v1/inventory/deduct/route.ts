import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deductSchema = z.object({
  salon_id: z.string().min(1),
  items: z.array(
    z.object({
      item_id: z.string().min(1),
      quantity_deducted: z.number().int().positive(),
      reason: z.enum(["formula_mix", "adjustment", "waste"]).default("formula_mix"),
      notes: z.string().optional(),
      formula_id: z.string().optional(),
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
        { status: 400 },
      );
    }

    const { salon_id, items } = parsed.data;
    const results: Array<{
      item_id: string;
      brand: string | null;
      shade_code: string | null;
      shade_name: string | null;
      deducted: number;
      remaining: number;
      lowStock: boolean;
    }> = [];

    for (const deduction of items) {
      const existing = await prisma.inventory_items.findUnique({
        where: { id: deduction.item_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: `Inventory item ${deduction.item_id} not found` },
          { status: 404 },
        );
      }

      if (existing.salon_id !== salon_id) {
        return NextResponse.json(
          { error: `Inventory item ${deduction.item_id} does not belong to salon ${salon_id}` },
          { status: 403 },
        );
      }

      const newQty = existing.quantity_on_hand - deduction.quantity_deducted;
      if (newQty < 0) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${existing.shade_name || existing.shade_code}`,
            item_id: existing.id,
            available: existing.quantity_on_hand,
            requested: deduction.quantity_deducted,
          },
          { status: 409 },
        );
      }

      const lowStock =
        existing.low_stock_threshold !== null &&
        existing.low_stock_threshold !== undefined &&
        newQty <= existing.low_stock_threshold;

      // Update inventory item
      const updated = await prisma.inventory_items.update({
        where: { id: existing.id },
        data: {
          quantity_on_hand: newQty,
          updated_at: new Date(),
        },
      });

      // Create inventory transaction record
      await prisma.inventory_transactions.create({
        data: {
          salon_id,
          item_id: existing.id,
          transaction_type: "deduct",
          quantity_change: deduction.quantity_deducted,
          quantity_before: existing.quantity_on_hand,
          quantity_after: newQty,
          reason: deduction.reason,
          notes: deduction.notes,
          formula_id: deduction.formula_id,
        },
      });

      results.push({
        item_id: existing.id,
        brand: existing.brand,
        shade_code: existing.shade_code,
        shade_name: existing.shade_name,
        deducted: deduction.quantity_deducted,
        remaining: newQty,
        lowStock,
      });
    }

    return NextResponse.json(
      { success: true, results, lowStockItems: results.filter((r) => r.lowStock) },
      { status: 200 },
    );
  } catch (e) {
    console.error("POST /api/v1/inventory/deduct error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}