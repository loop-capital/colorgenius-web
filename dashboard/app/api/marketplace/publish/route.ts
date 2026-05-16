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
import { formulas, generateId } from '@/lib/api/mock-data';
import { generateShareCode } from '@/lib/share-code';
import { Formula, FormulaTier, getTierForScore } from '@/lib/api/types';
import { z } from 'zod';

const publishSchema = z.object({
  source_formula_id: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10).default([]),
  photo_url: z.string().url().optional(),
  creator_id: z.string().min(1),
  creator_name: z.string().min(1),
  creator_avatar: z.string().url().optional(),
});

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

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

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = publishSchema.parse(body);

    // Check if formula with same title already exists from this creator
    const duplicate = formulas.find(
      f => f.creator_id === data.creator_id && f.title.toLowerCase() === data.title.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: { code: 'DUPLICATE', message: 'You already have a formula with this title' },
      }, { status: 400 });
    }

    // Score the formula
    const score = scoreFormula(data);
    const tier = getTierForScore(score);

    // Get tier pricing
    const tierPricing: Record<FormulaTier, number> = {
      community: 0,
      professional: 299,
      master: 499,
      signature: 799,
    };

    const newFormula: Formula = {
      id: `fm-${generateId().slice(0, 8)}`,
      creator_id: data.creator_id,
      creator_name: data.creator_name,
      creator_avatar: data.creator_avatar,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags,
      score,
      tier,
      per_use_cents: tierPricing[tier],
      usage_count: 0,
      share_code: '', // Will be generated below
      rating: 0,
      review_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Generate share code
    newFormula.share_code = generateShareCode(newFormula.id);

    // Add to marketplace
    formulas.push(newFormula);

    return NextResponse.json({
      success: true,
      data: {
        formula: newFormula,
        message: `Published! Your formula scored ${score}/100 and earned the "${tier}" tier.`,
        tier_info: {
          tier,
          score,
          per_use_cents: tierPricing[tier],
          per_use_display: tierPricing[tier] === 0 ? 'Free' : `$${(tierPricing[tier] / 100).toFixed(2)}/use`,
          creator_earnings: tierPricing[tier] === 0 ? '$0' : `$${((tierPricing[tier] * 0.7) / 100).toFixed(2)}/use`,
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message },
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
