/**
 * POST /api/marketplace/publish
 * Publish a personal formula to the marketplace
 * 
 * Flow:
 * 1. Stylist selects a formula from their library
 * 2. Uploads result photo (optional but recommended)
 * 3. Sets a title and description for the marketplace listing
 * 4. App scores the formula and assigns a tier
 * 5. Formula goes live on marketplace
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';
import { generateShareCode } from '@/lib/share-code';
import { FormulaTier, getTierForScore } from '@/lib/api/types';
import { z } from 'zod';

// creator_id/creator_name/creator_avatar removed from input — the creator is
// always the authenticated caller, never client-supplied (previously anyone
// could publish a listing attributed to any other user's id).
const publishSchema = z.object({
  source_formula_id: z.string().min(1).optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10).default([]),
  photo_url: z.string().url().optional(),
});

/**
 * Score a formula based on analysis criteria
 * In production, this would call the COLORgenius algorithm
 */
function scoreFormula(data: z.infer<typeof publishSchema>): number {
  let score = 50; // Base score

  // Description quality
  if (data.description.length > 100) score += 5;
  if (data.description.length > 200) score += 5;

  // Tags indicate specificity
  score += Math.min(data.tags.length * 3, 15);

  // Photo adds credibility
  if (data.photo_url) score += 10;

  // Category-specific bonuses
  if (['Balayage', 'Color Correction'].includes(data.category)) score += 5;

  return Math.min(score, 100);
}

const TIER_PER_USE_CENTS: Record<FormulaTier, number> = {
  community: 0,
  professional: 299,
  master: 499,
  signature: 799,
};

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No creator profile for this account' },
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = publishSchema.parse(body);

    // Check if a listing with the same title already exists from this creator
    const duplicate = await prisma.formula_listings.findFirst({
      where: { creator_id: stylist.id, title: { equals: data.title, mode: 'insensitive' } },
    });
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: { code: 'DUPLICATE', message: 'You already have a formula with this title' },
      }, { status: 400 });
    }

    // If publishing from an existing formula, verify the caller actually owns it
    if (data.source_formula_id) {
      const source = await prisma.formulas.findUnique({ where: { id: data.source_formula_id } });
      if (!source || source.stylist_id !== authUser.userId) {
        return NextResponse.json({
          success: false,
          error: { code: 'FORMULA_NOT_FOUND', message: 'Formula not found' },
        }, { status: 404 });
      }
    }

    // Score the formula
    const score = scoreFormula(data);
    const tier = getTierForScore(score);
    const perUseCents = TIER_PER_USE_CENTS[tier];

    const listing = await prisma.formula_listings.create({
      data: {
        creator_id: stylist.id,
        source_formula_id: data.source_formula_id,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        photo_url: data.photo_url,
        score,
        tier,
        price_cents: perUseCents,
        per_use_cents: perUseCents,
      },
    });

    const shareCode = generateShareCode(listing.id);
    await prisma.formula_listings.update({ where: { id: listing.id }, data: { share_code: shareCode } });

    return NextResponse.json({
      success: true,
      data: {
        formula: { ...listing, share_code: shareCode },
        message: `Published! Your formula scored ${score}/100 and earned the "${tier}" tier.`,
        tier_info: {
          tier,
          score,
          per_use_cents: perUseCents,
          per_use_display: perUseCents === 0 ? 'Free' : `$${(perUseCents / 100).toFixed(2)}/use`,
          creator_earnings: perUseCents === 0 ? '$0' : `$${((perUseCents * 0.7) / 100).toFixed(2)}/use`,
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message },
      }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to publish formula';
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}

/**
 * GET /api/marketplace/publish
 * Get publishing info (tiers, pricing, requirements)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      tiers: [
        { tier: 'community', score_range: '0-49', per_use: 'Free', description: 'Basic formula, limited testing' },
        { tier: 'professional', score_range: '50-69', per_use: '$2.99/use', description: 'Verified results, good chemistry' },
        { tier: 'master', score_range: '70-84', per_use: '$4.99/use', description: 'High-scoring, multiple client validations' },
        { tier: 'signature', score_range: '85-100', per_use: '$7.99/use', description: 'Top-tier, exceptional results' },
      ],
      revenue_split: { creator: '70%', platform: '30%' },
      billing: 'Monthly in arrears — stylists pay at end of month for actual usage',
      requirements: [
        'Result photo recommended (increases score)',
        'Detailed description of technique',
        'Relevant tags for discoverability',
      ],
    },
  });
}
