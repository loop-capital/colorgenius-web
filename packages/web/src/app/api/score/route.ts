import { NextRequest, NextResponse } from 'next/server';

// Mock result scoring
// In production: compare before/after photos via ML model

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { before_photo_url, after_photo_url, formulation_id, target_level, target_tone, stylist_notes } = body;

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate realistic scores based on target change
    const baseScore = Math.floor(Math.random() * 10) + 83; // 83-93
    const colorAccuracy = baseScore + Math.floor(Math.random() * 5) - 2;
    const conditionScore = Math.min(98, baseScore + Math.floor(Math.random() * 8));
    const evennessScore = baseScore + Math.floor(Math.random() * 6) - 3;
    const overall = Math.round((colorAccuracy + conditionScore + evennessScore) / 3);

    // Generate feedback based on scores
    const feedbackParts: string[] = [];
    if (colorAccuracy >= 90) {
      feedbackParts.push('Color matches target level and tone precisely.');
    } else if (colorAccuracy >= 85) {
      feedbackParts.push('Color matches target well. Minor tonal variation detected.');
    } else {
      feedbackParts.push('Color undertone differs slightly from target — consider toner.');
    }

    if (conditionScore >= 92) {
      feedbackParts.push('Hair condition excellent — minimal damage from processing.');
    } else if (conditionScore >= 85) {
      feedbackParts.push('Hair condition maintained adequately.');
    } else {
      feedbackParts.push('Some damage detected — recommend deep conditioning treatment.');
    }

    if (evennessScore >= 88) {
      feedbackParts.push('Application was even throughout.');
    } else {
      feedbackParts.push('Slight unevenness in mid-lengths — technique adjustment recommended.');
    }

    const result = {
      score_id: `score-${Date.now()}`,
      formulation_id,
      scores: {
        color_accuracy: Math.min(99, colorAccuracy),
        condition_score: Math.min(99, conditionScore),
        evenness_score: Math.min(99, Math.max(75, evennessScore)),
      },
      overall: Math.min(95, overall),
      feedback: feedbackParts.join(' '),
      comparison: {
        target_level,
        target_tone,
        achieved_level: target_level + (overall > 88 ? 0 : -1),
        achieved_tone: target_tone,
        level_match: overall > 88,
        tone_match: overall > 85,
      },
      recommendations: overall < 85 ? [
        'Consider adjusting developer volume for next service',
        'Review application timing for more even coverage',
      ] : [],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('/api/score error:', error);
    return NextResponse.json(
      { success: false, error: 'Scoring failed' },
      { status: 500 }
    );
  }
}