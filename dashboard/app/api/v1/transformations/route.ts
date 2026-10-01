import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveStylist, canRead, canWrite } from '@/lib/transformation-auth';
import {
  serializeTransformation,
  validateConsent,
  PUBLIC_STYLIST_SELECT,
  TRANSFORMATION_STATUSES,
} from '@/lib/transformations';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// POST /api/v1/transformations — create a draft transformation.
export async function POST(req: NextRequest) {
  const stylist = await resolveStylist(req);
  if (!stylist) return unauthorized();
  if (!canWrite(stylist)) {
    return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { formulation_id, source_formula_id, before_photo_ref, shade_story, shades } = body;
  if (!formulation_id || !before_photo_ref) {
    return NextResponse.json(
      { error: 'formulation_id and before_photo_ref are required' },
      { status: 400 }
    );
  }

  // The formulation must exist and belong to this stylist (404 to avoid leaking).
  const formulation = await prisma.formulations.findUnique({ where: { id: formulation_id } });
  if (!formulation || formulation.stylist_id !== stylist.id) {
    return NextResponse.json({ error: 'Formulation not found' }, { status: 404 });
  }

  if (source_formula_id) {
    const listing = await prisma.formula_listings.findUnique({
      where: { id: source_formula_id },
    });
    if (!listing) {
      return NextResponse.json({ error: 'source_formula_id not found' }, { status: 400 });
    }
  }

  try {
    const t = await prisma.transformations.create({
      data: {
        stylist_id: stylist.id,
        status: 'draft',
        formulation_id,
        source_formula_id: source_formula_id ?? null,
        before_photo_ref,
        shade_story: shade_story ?? null,
        shades: shades ?? undefined,
      },
      include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
    });
    return NextResponse.json(await serializeTransformation(t), { status: 201 });
  } catch (e) {
    console.error('POST /api/v1/transformations error:', e);
    return NextResponse.json({ error: 'Failed to create transformation' }, { status: 500 });
  }
}

// GET /api/v1/transformations — list. Visibility: own (any status) + published.
// Filters: ?status=&formula_id=&stylist_id= (source formula), pagination ?page=&limit=
export async function GET(req: NextRequest) {
  const stylist = await resolveStylist(req);
  if (!stylist) return unauthorized();
  if (!canRead(stylist)) {
    return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const formulaId = searchParams.get('formula_id');
  const stylistId = searchParams.get('stylist_id');
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);

  if (status && !(TRANSFORMATION_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${TRANSFORMATION_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const and: any[] = [{ OR: [{ stylist_id: stylist.id }, { status: 'published' }] }];
  if (status) and.push({ status });
  if (formulaId) and.push({ source_formula_id: formulaId });
  if (stylistId) and.push({ stylist_id: stylistId });

  try {
    const [items, total] = await Promise.all([
      prisma.transformations.findMany({
        where: { AND: and },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
      }),
      prisma.transformations.count({ where: { AND: and } }),
    ]);

    const serialized = await Promise.all(
      items.map(async (t) => {
        const s = await serializeTransformation(t);
        if (t.stylist_id !== stylist.id) {
          // Public subset: marketing consent stays private to the owner.
          delete s.client_consent;
        }
        return s;
      })
    );

    return NextResponse.json({
      items: serialized,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (e) {
    console.error('GET /api/v1/transformations error:', e);
    return NextResponse.json({ error: 'Failed to list transformations' }, { status: 500 });
  }
}
