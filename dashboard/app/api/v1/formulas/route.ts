import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formulaSchema } from "@/lib/vish/schemas";
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting: allow 10 requests per minute per client for formula creation
  const clientId = getClientIdentifier(req);
  const rateLimitResult = rateLimit(clientId, 60000, 10); // 10 requests per minute
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ 
      error: "Rate limit exceeded. Please try again later.",
      rateLimit: {
        limit: 10,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    });
  }

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
