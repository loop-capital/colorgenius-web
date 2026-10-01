import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveStylist, canWrite } from '@/lib/transformation-auth';
import {
  serializeTransformation,
  validateConsent,
  PUBLIC_STYLIST_SELECT,
} from '@/lib/transformations';

// POST /api/v1/transformations/:id/publish — flip to published.
//
// Hard requirements (spec + seam §3.2):
// - without a marketing consent record -> 422 CONSENT_REQUIRED
// - without the after photo        -> 422 AFTER_PHOTO_REQUIRED
// - idempotent: an already-published record is returned as-is (with an
//   updated published_post_ref when one is supplied) — never 409, never a
//   duplicate. Agents retry; the seam's failure modes depend on this.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = await resolveStylist(req);
  if (!stylist) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canWrite(stylist)) {
    return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
  }

  const t = await prisma.transformations.findFirst({
    where: { id: id, stylist_id: stylist.id },
    include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
  });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — consent may already be on the record
  }

  // Idempotent republish: return the published record, updating the post ref
  // when a new one is supplied (seam §3.2 failure mode 2).
  if (t.status === 'published') {
    const data: any = {};
    if (body.published_post_ref && body.published_post_ref !== t.published_post_ref) {
      data.published_post_ref = body.published_post_ref;
    }
    const record =
      Object.keys(data).length > 0
        ? await prisma.transformations.update({
            where: { id: t.id },
            data,
            include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
          })
        : t;
    return NextResponse.json(await serializeTransformation(record));
  }

  if (!t.after_photo_ref) {
    return NextResponse.json(
      {
        error: 'AFTER_PHOTO_REQUIRED',
        message: 'Attach the after photo (PATCH) before publishing.',
      },
      { status: 422 }
    );
  }

  // The bright line: the draft's existence never implies posting permission.
  // Marketing consent is a separate record from the service relationship.
  const consentInput = body.client_consent !== undefined ? body.client_consent : t.client_consent;
  const v = validateConsent(consentInput, stylist.id);
  if (!v.ok) {
    return NextResponse.json(
      {
        error: 'CONSENT_REQUIRED',
        message:
          'A marketing consent record is required to publish. ' +
          'The service relationship covering the assessment photos does not imply posting permission. ' +
          v.error,
      },
      { status: 422 }
    );
  }

  const now = new Date();
  const updated = await prisma.transformations.update({
    where: { id: t.id },
    data: {
      status: 'published',
      client_consent: v.consent as any,
      published_post_ref: body.published_post_ref ?? t.published_post_ref ?? null,
      enriched_at: t.enriched_at ?? now,
      published_at: now,
    },
    include: { stylist: { select: PUBLIC_STYLIST_SELECT } },
  });

  return NextResponse.json(await serializeTransformation(updated));
}
