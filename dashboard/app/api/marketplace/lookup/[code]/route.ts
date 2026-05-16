/**
 * GET /api/marketplace/lookup/[code]
 * Look up a formula by share code (PUBLIC — no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { formulas } from '@/lib/api/mock-data';
import { generateShareCode } from '@/lib/share-code';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalized = code.toUpperCase().replace(/^CG-/, '');
    const fullCode = `CG-${normalized}`;

    // Find formula by matching generated share code
    const formula = formulas.find(f => generateShareCode(f.id) === fullCode);

    if (!formula) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No formula found for code ${fullCode}` },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        share_code: fullCode,
        formula: {
          id: formula.id,
          title: formula.title,
          description: formula.description,
          creator_name: formula.creator_name,
          creator_avatar: formula.creator_avatar,
          category: formula.category,
          tier: formula.tier,
          score: formula.score,
          per_use_cents: formula.per_use_cents,
          rating: formula.rating,
          usage_count: formula.usage_count,
          tags: formula.tags,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lookup failed';
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}
