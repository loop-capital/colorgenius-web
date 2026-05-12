import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// ─── Validation Schema ───────────────────────────────────────────────────────

const clientFormulaHistorySchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  formulaId: z.string().min(1, 'Formula ID is required'),
  usageDate: z.string().datetime({ message: 'usageDate must be a valid ISO 8601 datetime string' }),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
});

const getQuerySchema = z.object({
  clientId: z.string().min(1, 'clientId query parameter is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── GET: Retrieve formula usage history for a client ──────────────────────────

export async function GET(request: NextRequest) {
  // Rate limiting: 30 requests per minute per client
  const clientIdentifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientIdentifier, 60000, 30);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: {
          limit: 30,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsedQuery = getQuerySchema.safeParse(rawParams);

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: parsedQuery.error.issues },
        { status: 400 }
      );
    }

    const { clientId, page, limit } = parsedQuery.data;
    const skip = (page - 1) * limit;

    // Verify the client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!clientExists) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch formula history via ClientVisit (tracks formula usage over time)
    // Also include the formulation details
    const [history, totalCount] = await Promise.all([
      prisma.clientVisit.findMany({
        where: { client_id: clientId },
        orderBy: { visit_date: 'desc' },
        skip,
        take: limit,
        include: {
          formulation: {
            select: {
              id: true,
              brand: true,
              product_line: true,
              primary_formula: true,
              processing_instructions: true,
              created_at: true,
            },
          },
          stylist: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              display_name: true,
            },
          },
        },
      }),
      prisma.clientVisit.count({
        where: { client_id: clientId },
      }),
    ]);

    // Map to a cleaner response format
    const mappedHistory = history.map((visit) => ({
      id: visit.id,
      clientId: visit.client_id,
      formulaId: visit.formulation_id,
      usageDate: visit.visit_date.toISOString(),
      notes: visit.stylist_notes,
      serviceType: visit.service_type,
      hairState: visit.hair_state,
      clientSatisfaction: visit.client_satisfaction,
      createdAt: visit.created_at.toISOString(),
      formula: visit.formulation
        ? {
            id: visit.formulation.id,
            brand: visit.formulation.brand,
            productLine: visit.formulation.product_line,
            primaryFormula: visit.formulation.primary_formula,
            processingInstructions: visit.formulation.processing_instructions,
            createdAt: visit.formulation.created_at?.toISOString(),
          }
        : null,
      stylist: visit.stylist
        ? {
            id: visit.stylist.id,
            name:
              visit.stylist.display_name ||
              `${visit.stylist.first_name} ${visit.stylist.last_name}`.trim(),
          }
        : null,
    }));

    return NextResponse.json({
      history: mappedHistory,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('GET /api/client-formula-history error:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve formula history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST: Add a new formula usage record for a client ───────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute per client
  const clientIdentifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientIdentifier, 60000, 10);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: {
          limit: 10,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = clientFormulaHistorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { clientId, formulaId, usageDate, notes } = parsed.data;

    // Verify the client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, primary_stylist_id: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify the formula exists
    const formula = await prisma.formulation.findUnique({
      where: { id: formulaId },
      select: { id: true, stylist_id: true },
    });

    if (!formula) {
      return NextResponse.json(
        { error: 'Formula not found' },
        { status: 404 }
      );
    }

    // Create a new ClientVisit record to track this formula usage
    const visit = await prisma.clientVisit.create({
      data: {
        client_id: clientId,
        stylist_id: formula.stylist_id || client.primary_stylist_id || '',
        formulation_id: formulaId,
        visit_date: new Date(usageDate),
        stylist_notes: notes,
        service_type: 'color_service',
      },
      include: {
        formulation: {
          select: {
            id: true,
            brand: true,
            product_line: true,
            primary_formula: true,
            processing_instructions: true,
            created_at: true,
          },
        },
        stylist: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            display_name: true,
          },
        },
      },
    });

    // Update client's last visit and total visits
    await prisma.client.update({
      where: { id: clientId },
      data: {
        last_visit_at: new Date(usageDate),
        total_visits: { increment: 1 },
      },
    });

    const responseRecord = {
      id: visit.id,
      clientId: visit.client_id,
      formulaId: visit.formulation_id,
      usageDate: visit.visit_date.toISOString(),
      notes: visit.stylist_notes,
      serviceType: visit.service_type,
      createdAt: visit.created_at.toISOString(),
      formula: visit.formulation
        ? {
            id: visit.formulation.id,
            brand: visit.formulation.brand,
            productLine: visit.formulation.product_line,
            primaryFormula: visit.formulation.primary_formula,
            processingInstructions: visit.formulation.processing_instructions,
            createdAt: visit.formulation.created_at?.toISOString(),
          }
        : null,
      stylist: visit.stylist
        ? {
            id: visit.stylist.id,
            name:
              visit.stylist.display_name ||
              `${visit.stylist.first_name} ${visit.stylist.last_name}`.trim(),
          }
        : null,
    };

    return NextResponse.json(
      { record: responseRecord, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/client-formula-history error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create formula history record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
