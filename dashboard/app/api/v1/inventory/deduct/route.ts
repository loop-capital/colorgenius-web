import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const deductSchema = z.object({
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
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const salon_id = user.userId;

    const body = await req.json();
    const parsed = deductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { items } = parsed.data;

    // Pre-validate all items before touching the database
    const existingItems = await prisma.inventory_items.findMany({
      where: { id: { in: items.map((i) => i.item_id) } },
    });
    const itemMap = new Map(existingItems.map((e) => [e.id, e]));

    for (const deduction of items) {
      const existing = itemMap.get(deduction.item_id);
      if (!existing) {
        return NextResponse.json(
          { error: `Inventory item ${deduction.item_id} not found` },
          { status: 404 },
        );
      }
      if (existing.salon_id !== salon_id) {
        return NextResponse.json(
          { error: `Inventory item ${deduction.item_id} does not belong to your salon` },
          { status: 403 },
        );
      }
      if (existing.quantity_on_hand - deduction.quantity_deducted < 0) {
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
    }

    // All valid — apply atomically
    const results = await prisma.$transaction(
      items.map((deduction) => {
        const existing = itemMap.get(deduction.item_id)!;
        const newQty = existing.quantity_on_hand - deduction.quantity_deducted;
        return prisma.inventory_items.update({
          where: { id: existing.id },
          data: { quantity_on_hand: newQty, updated_at: new Date() },
        });
      })
    );

    // Record transactions (outside atomic block — audit log, non-fatal)
    await prisma.inventory_transactions.createMany({
      data: items.map((deduction) => {
        const existing = itemMap.get(deduction.item_id)!;
        const newQty = existing.quantity_on_hand - deduction.quantity_deducted;
        return {
          salon_id,
          item_id: existing.id,
          transaction_type: "deduct" as const,
          quantity_change: deduction.quantity_deducted,
          quantity_before: existing.quantity_on_hand,
          quantity_after: newQty,
          reason: deduction.reason,
          notes: deduction.notes,
          formula_id: deduction.formula_id,
        };
      }),
    });

    const summary = results.map((updated) => {
      const original = itemMap.get(updated.id)!;
      const lowStock =
        updated.low_stock_threshold !== null &&
        updated.quantity_on_hand <= updated.low_stock_threshold;
      return {
        item_id: updated.id,
        brand: updated.brand,
        shade_code: updated.shade_code,
        shade_name: updated.shade_name,
        deducted: original.quantity_on_hand - updated.quantity_on_hand,
        remaining: updated.quantity_on_hand,
        lowStock,
      };
    });

    return NextResponse.json(
      { success: true, results: summary, lowStockItems: summary.filter((r) => r.lowStock) },
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