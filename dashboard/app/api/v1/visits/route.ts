import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { autoDeductInventory } from "@/lib/inventory/auto-deduct";

// ─── Schemas ────────────────────────────────────────────────────────────────

const createVisitSchema = z.object({
  client_id: z.string().uuid().optional(),
  formula_id: z.string().uuid().optional(),
  salon_id: z.string().uuid(),
  stylist_id: z.string().uuid().optional(),
  service_type: z.string().max(50).optional(),
  notes: z.string().optional(),
  grams_used: z.number().int().positive().default(30),
  // For marking a visit as completed on creation
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
});

const updateVisitSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  service_type: z.string().max(50).optional(),
  notes: z.string().optional(),
  formula_id: z.string().uuid().optional(),
  grams_used: z.number().int().positive().default(30),
});

// ─── POST /api/v1/visits — Create a visit ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createVisitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { client_id, formula_id, salon_id, stylist_id, service_type, notes, grams_used, status } =
      parsed.data;

    // Create the visit
    const visit = await prisma.client_visits.create({
      data: {
        client_id: client_id || "",
        visit_date: new Date(),
        service_type: service_type || null,
        formula_id: formula_id || null,
        notes: notes || null,
      },
    });

    // If visit is created as completed with a formula, auto-deduct inventory
    let deductionResult = null;
    if (status === "completed" && formula_id) {
      deductionResult = await autoDeductInventory(formula_id, salon_id, grams_used);
    }

    // Update client visit count if client_id provided
    if (client_id) {
      await prisma.clients.update({
        where: { id: client_id },
        data: {
          last_visit_at: new Date(),
          total_visits: { increment: 1 },
        },
      }).catch((err) => {
        console.warn("[visits] Failed to update client visit count:", err.message);
      });
    }

    return NextResponse.json(
      {
        visit: {
          id: visit.id,
          client_id: visit.client_id,
          formula_id: visit.formula_id,
          visit_date: visit.visit_date,
          service_type: visit.service_type,
          notes: visit.notes,
        },
        deduction: deductionResult,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("POST /api/v1/visits error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── GET /api/v1/visits — List visits ────────────────────────────────────────

const listQuerySchema = z.object({
  client_id: z.string().uuid().optional(),
  salon_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = listQuerySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { client_id, salon_id, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (client_id) {
      where.client_id = client_id;
    }

    // If salon_id provided, filter by clients belonging to that salon
    if (salon_id) {
      where.clients = { salon_id };
    }

    const [visits, total] = await Promise.all([
      prisma.client_visits.findMany({
        where,
        orderBy: { visit_date: "desc" },
        skip,
        take: limit,
        include: {
          formulas: {
            select: {
              id: true,
              name: true,
              product_brand: true,
              product_line: true,
              product_shade: true,
            },
          },
          clients: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      prisma.client_visits.count({ where }),
    ]);

    return NextResponse.json({ visits, page, limit, total }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/visits error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/v1/visits — Update visit status (e.g., mark completed) ───────

const patchSchema = z.object({
  visit_id: z.string().uuid(),
  salon_id: z.string().uuid(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  service_type: z.string().max(50).optional(),
  notes: z.string().optional(),
  formula_id: z.string().uuid().optional(),
  grams_used: z.number().int().positive().default(30),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { visit_id, salon_id, status, service_type, notes, formula_id, grams_used } =
      parsed.data;

    // Find the existing visit
    const existingVisit = await prisma.client_visits.findUnique({
      where: { id: visit_id },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { error: "Visit not found" },
        { status: 404 },
      );
    }

    // Update the visit
    const updateData: Record<string, unknown> = {};
    if (service_type) updateData.service_type = service_type;
    if (notes) updateData.notes = notes;
    if (formula_id) updateData.formula_id = formula_id;

    const updatedVisit = await prisma.client_visits.update({
      where: { id: visit_id },
      data: updateData,
    });

    // Auto-deduct inventory when visit is marked as completed with a formula
    let deductionResult = null;
    if (status === "completed") {
      const visitFormulaId = formula_id || existingVisit.formula_id;
      if (visitFormulaId) {
        deductionResult = await autoDeductInventory(
          visitFormulaId,
          salon_id,
          grams_used,
        );
      }
    }

    return NextResponse.json(
      {
        visit: {
          id: updatedVisit.id,
          client_id: updatedVisit.client_id,
          formula_id: updatedVisit.formula_id,
          visit_date: updatedVisit.visit_date,
          service_type: updatedVisit.service_type,
          notes: updatedVisit.notes,
        },
        status,
        deduction: deductionResult,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("PATCH /api/v1/visits error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}