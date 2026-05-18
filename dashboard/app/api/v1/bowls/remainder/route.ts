import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  salonId: z.string().min(1),
  shadeCode: z.string().optional(),
  brand: z.string().optional(),
});

const createSchema = z.object({
  salonId: z.string().min(1),
  shadeCode: z.string().min(1),
  brand: z.string().min(1),
  shadeName: z.string().optional(),
  remainingGrams: z.number().positive(),
  sourceBowlId: z.string().optional(),
  expiresAt: z.string().optional(), // ISO date string
});

// GET /api/v1/bowls/remainder?salonId=xxx&shadeCode=xxx&brand=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { salonId, shadeCode, brand } = parsed.data;

    const now = new Date();
    const where: any = {
      salonId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };
    if (shadeCode) where.shadeCode = shadeCode;
    if (brand) where.brand = brand;

    const items = await prisma.bowlRemainder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("GET /api/v1/bowls/remainder error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/bowls/remainder
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { salonId, shadeCode, brand, shadeName, remainingGrams, sourceBowlId, expiresAt } =
      parsed.data;

    const item = await prisma.bowlRemainder.upsert({
      where: {
        salonId_brand_shadeCode: {
          salonId,
          brand,
          shadeCode,
        },
      },
      update: {
        remainingGrams,
        shadeName: shadeName || shadeCode,
        sourceBowlId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdAt: new Date(),
      },
      create: {
        salonId,
        shadeCode,
        brand,
        shadeName: shadeName || shadeCode,
        remainingGrams,
        sourceBowlId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (e) {
    console.error("POST /api/v1/bowls/remainder error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
