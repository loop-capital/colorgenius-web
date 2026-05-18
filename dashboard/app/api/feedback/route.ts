import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api/auth';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma as any;

// POST /api/feedback
// Accepts FeedbackForm payload; persists to formula_ratings + formula_comments.
// raterId is resolved server-side from session so the client never sends it.
export async function POST(req: NextRequest) {
  try {
    const { formula_id, rating, tags, comment, adjustment } = await req.json();

    if (!formula_id || rating === undefined) {
      return NextResponse.json({ error: 'formula_id and rating are required' }, { status: 400 });
    }

    if (rating !== 1 && rating !== -1) {
      return NextResponse.json({ error: 'rating must be 1 or -1' }, { status: 400 });
    }

    const user = await getCurrentUser(req);
    const raterId = user?.id ?? 'anonymous';

    // Map thumbs rating to 1-5 scale
    const overall = rating === 1 ? 5 : 1;

    await prisma.formula_ratings.upsert({
      where: { formula_id_rater_id: { formula_id, rater_id: raterId } },
      update: { overall, updated_at: new Date() },
      create: { formula_id, rater_id: raterId, overall },
    });

    // Store adjustment text and tags as a comment if provided
    if (adjustment || (tags && tags.length > 0)) {
      const tagLine = tags && tags.length > 0 ? `[${tags.join(', ')}] ` : '';
      const body = `${tagLine}${adjustment || ''}`.trim();
      if (body) {
        await prisma.formula_comments.create({
          data: {
            formula_id,
            author_id: raterId,
            body,
            rating: overall,
          },
        }).catch(() => {
          // formula_comments table may not exist yet — non-fatal
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}

// GET /api/feedback?formulaId=... — aggregate rating summary
export async function GET(req: NextRequest) {
  try {
    const formulaId = new URL(req.url).searchParams.get('formulaId');
    if (!formulaId) {
      return NextResponse.json({ error: 'formulaId required' }, { status: 400 });
    }

    const ratings = await prisma.formula_ratings.findMany({
      where: { formula_id: formulaId },
    });

    if (ratings.length === 0) {
      return NextResponse.json({ totalRatings: 0, averageOverall: null, thumbsUp: 0, thumbsDown: 0 });
    }

    const thumbsUp = ratings.filter((r: { overall: number }) => r.overall >= 4).length;
    const thumbsDown = ratings.filter((r: { overall: number }) => r.overall <= 2).length;
    const avg = ratings.reduce((s: number, r: { overall: number }) => s + r.overall, 0) / ratings.length;

    return NextResponse.json({
      totalRatings: ratings.length,
      averageOverall: Math.round(avg * 10) / 10,
      thumbsUp,
      thumbsDown,
    });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
