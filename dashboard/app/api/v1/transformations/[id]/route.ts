import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveStylist, canRead, canWrite } from '@/lib/transformation-auth';
import {
  serializeTransformation,
  validateConsent,
  PUBLIC_STYLIST_SELECT,
} from '@/lib/transformations';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function findOwned(id: string, stylistId: string) {
  return prisma.transformations.findFirst({
    where: { id, stylist_id: stylistId },
    include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
  });
}

// GET /api/v1/transformations/:id — read. Owner sees everything (incl. consent
// and signed photo URLs); anyone else only sees published records, consent stripped.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const stylist = await resolveStylist(req);
  if (!stylist) return unauthorized();
  if (!canRead(stylist)) {
    return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
  }

  const t = await prisma.transformations.findUnique({
    where: { id: params.id },
    include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
  });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = t.stylist_id === stylist.id;
  if (!isOwner && t.status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const s = await serializeTransformation(t);
  if (!isOwner) delete s.client_consent;
  return NextResponse.json(s);
}

// PATCH /api/v1/transformations/:id — enrich a draft/enriched transformation.
// Accepts: after_photo_ref, shade_story, shades, source_formula_id,
// client_consent, published_post_ref. draft -> enriched when after_photo_ref
// is present. On published records only published_post_ref may change
// (seam §3.2: lets the agent attach the post ref after a late social publish).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const stylist = await resolveStylist(req);
  if (!stylist) return unauthorized();
  if (!canWrite(stylist)) {
    return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
  }

  const t = await findOwned(params.id, stylist.id);
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (t.status === 'published') {
    const allowed = ['published_post_ref'];
    const attempted = Object.keys(body).filter((k) => body[k] !== undefined);
    const bad = attempted.filter((k) => !allowed.includes(k));
    if (bad.length > 0) {
      return NextResponse.json(
        { error: 'IMMUTABLE_AFTER_PUBLISH', fields: bad },
        { status: 422 }
      );
    }
    const updated = await prisma.transformations.update({
      where: { id: t.id },
      data: { published_post_ref: body.published_post_ref ?? t.published_post_ref },
      include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
    });
    return NextResponse.json(await serializeTransformation(updated));
  }

  const data: any = {};
  if (body.after_photo_ref !== undefined) data.after_photo_ref = body.after_photo_ref || null;
  if (body.shade_story !== undefined) data.shade_story = body.shade_story ?? null;
  if (body.shades !== undefined) data.shades = body.shades ?? undefined;
  if (body.published_post_ref !== undefined) data.published_post_ref = body.published_post_ref ?? null;

  if (body.source_formula_id !== undefined) {
    if (body.source_formula_id) {
      const listing = await prisma.formula_listings.findUnique({
        where: { id: body.source_formula_id },
      });
      if (!listing) {
        return NextResponse.json({ error: 'source_formula_id not found' }, { status: 400 });
      }
      data.source_formula_id = body.source_formula_id;
    } else {
      data.source_formula_id = null;
    }
  }

  if (body.client_consent !== undefined) {
    const v = validateConsent(body.client_consent, stylist.id);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    data.client_consent = v.consent;
  }

  const afterPhoto = data.after_photo_ref ?? t.after_photo_ref;
  if (t.status === 'draft' && afterPhoto) {
    data.status = 'enriched';
    data.enriched_at = new Date();
  }

  try {
    const updated = await prisma.transformations.update({
      where: { id: t.id },
      data,
      include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
    });
    return NextResponse.json(await serializeTransformation(updated));
  } catch (e) {
    console.error('PATCH /api/v1/transformations/:id error:', e);
    return NextResponse.json({ error: 'Failed to update transformation' }, { status: 500 });
  }
}
