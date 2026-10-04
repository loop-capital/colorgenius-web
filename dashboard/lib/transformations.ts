import { prisma } from '@/lib/prisma';
import { getPresignedDownloadUrl, extractR2Key } from '@/lib/r2';

export const TRANSFORMATION_STATUSES = ['draft', 'enriched', 'published'] as const;
export type TransformationStatus = (typeof TRANSFORMATION_STATUSES)[number];

export const CONSENT_METHODS = ['verbal', 'signed', 'digital'] as const;

export interface ConsentRecord {
  attested_by: string;
  attested_at: string;
  method: (typeof CONSENT_METHODS)[number];
  client_ref: string | null;
  note: string | null;
}

/** Fields of the stylist safe to expose alongside a transformation. */
export const PUBLIC_STYLIST_SELECT = {
  id: true,
  display_name: true,
  first_name: true,
  last_name: true,
  handle: true,
  instagram_handle: true,
  tiktok_handle: true,
  avatar_url: true,
  creator_tier: true,
  is_verified: true,
} as const;

/**
 * Validate + normalize a marketing consent record (spec §consent, seam §3.4).
 * The marketing consent is SEPARATE from the service relationship that covers
 * the assessment photos — the publish endpoint enforces its presence.
 */
export function validateConsent(
  input: any,
  stylistId: string
): { ok: true; consent: ConsentRecord } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'client_consent is required' };
  }
  if (!CONSENT_METHODS.includes(input.method)) {
    return {
      ok: false,
      error: `client_consent.method must be one of: ${CONSENT_METHODS.join(', ')}`,
    };
  }
  const attestedAt = input.attested_at || new Date().toISOString();
  if (typeof attestedAt !== 'string' || Number.isNaN(Date.parse(attestedAt))) {
    return { ok: false, error: 'client_consent.attested_at must be an ISO8601 timestamp' };
  }
  return {
    ok: true,
    consent: {
      attested_by: typeof input.attested_by === 'string' ? input.attested_by : stylistId,
      attested_at: new Date(attestedAt).toISOString(),
      method: input.method,
      client_ref:
        typeof input.client_ref === 'string' && input.client_ref ? input.client_ref : null,
      note: typeof input.note === 'string' && input.note ? input.note : null,
    },
  };
}

/**
 * Serialize a transformation for API output, attaching short-lived signed
 * fetchable URLs for the photos (seam §3.1 — the AgentSocial agent pulls
 * media from these). client_consent is included; routes strip it for
 * non-owner viewers of published records.
 */
export async function serializeTransformation(t: any): Promise<any> {
  const out: any = {
    id: t.id,
    stylist_id: t.stylist_id,
    status: t.status,
    source_formula_id: t.source_formula_id,
    formulation_id: t.formulation_id,
    before_photo_ref: t.before_photo_ref,
    after_photo_ref: t.after_photo_ref,
    shade_story: t.shade_story,
    shades: t.shades,
    client_consent: t.client_consent ?? null,
    published_post_ref: t.published_post_ref,
    created_at: t.created_at,
    enriched_at: t.enriched_at,
    published_at: t.published_at,
  };
  if (t.stylist) {
    out.stylist = t.stylist;
  }
  try {
    out.before_photo_url = await getPresignedDownloadUrl(extractR2Key(t.before_photo_ref), 900);
    if (t.after_photo_ref) {
      out.after_photo_url = await getPresignedDownloadUrl(extractR2Key(t.after_photo_ref), 900);
    }
  } catch {
    // Signing is best-effort; the raw refs are still returned.
  }
  return out;
}

/**
 * Create a draft transformation. Idempotent per formulation: if a draft already
 * exists for the formulation, it is returned instead of duplicating.
 */
export async function createTransformationDraft(opts: {
  stylistId: string;
  formulationId: string;
  beforePhotoRef: string;
  sourceFormulaId?: string | null;
}): Promise<any> {
  const existing = await prisma.transformations.findFirst({
    where: { formulation_id: opts.formulationId },
  });
  if (existing) return existing;
  return prisma.transformations.create({
    data: {
      stylist_id: opts.stylistId,
      status: 'draft',
      formulation_id: opts.formulationId,
      source_formula_id: opts.sourceFormulaId ?? null,
      before_photo_ref: opts.beforePhotoRef,
    },
  });
}
