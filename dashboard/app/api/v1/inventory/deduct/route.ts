import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { getSalonIdForUser } from "@/lib/stylist";
import { z } from "zod";

const deductSchema = z.object({
  items: z.array(
    z.object({
      brand: z.string().min(1),
      shadeCode: z.string().min(1),
      grams: z.number().positive(),
      reason: z.enum(["formula_mix", "adjustment", "waste"]).default("formula_mix"),
      notes: z.string().optional(),
      formulaId: z.string().optional(),
    })
  ).min(1),
});

// POST /api/v1/inventory/deduct — deduct product used from stock, matched by
// (brand, shadeCode) the same way the Color Bar session-complete route does.
// Auto-creates the inventory_items row (at 0 on hand) if it's never been
// seen before, so a stylist logging a formula isn't blocked on someone
// having pre-entered every shade in the Inventory/Pricing screen first.
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const salon_id = await getSalonIdForUser(user.userId);
    if (!salon_id) {
      return NextResponse.json({ error: "Your account isn't linked to a salon yet." }, { status: 400 });
    }

    const body = await req.json();
    const parsed = deductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { items } = parsed.data;

    const results: {
      item_id: string;
      brand: string;
      shadeCode: string;
      shade_name: string | null;
      deducted: number;
      remaining: number;
      lowStock: boolean;
    }[] = [];

    // Sequential (not $transaction) — each deduction may need to create its
    // own inventory_items row first, and the set of shades touched per call
    // is small (one formula's worth of steps).
    for (const deduction of items) {
      let item = await prisma.inventory_items.findUnique({
        where: {
          salon_id_brand_shade_code: {
            salon_id,
            brand: deduction.brand,
            shade_code: deduction.shadeCode,
          },
        },
      });

      if (!item) {
        item = await prisma.inventory_items.create({
          data: {
            salon_id,
            brand: deduction.brand,
            shade_code: deduction.shadeCode,
            shade_name: `${deduction.brand} ${deduction.shadeCode}`,
            source: "manual",
            quantity_on_hand: 0,
          },
        });
      }

      const quantityBefore = item.quantity_on_hand;
      const quantityAfter = Math.max(quantityBefore - deduction.grams, 0);

      await prisma.inventory_items.update({
        where: { id: item.id },
        data: { quantity_on_hand: quantityAfter, updated_at: new Date() },
      });

      await prisma.inventory_transactions.create({
        data: {
          salon_id,
          item_id: item.id,
          transaction_type: "deduct",
          quantity_change: -deduction.grams,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          reason: deduction.reason,
          notes: deduction.notes,
          reference_type: deduction.formulaId ? "formula" : undefined,
          reference_id: deduction.formulaId,
          performed_by: user.userId,
        },
      });

      const lowStock = item.low_stock_threshold != null && quantityAfter <= item.low_stock_threshold;

      results.push({
        item_id: item.id,
        brand: item.brand || deduction.brand,
        shadeCode: item.shade_code || deduction.shadeCode,
        shade_name: item.shade_name,
        deducted: quantityBefore - quantityAfter,
        remaining: quantityAfter,
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
