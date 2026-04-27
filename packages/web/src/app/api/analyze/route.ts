import { NextRequest, NextResponse } from 'next/server';

// Mock color analysis based on photo
// In production, this would call an ML model (TensorFlow.js / Python service)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo_url, client_id, questionnaire } = body;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock analysis result
    const result: {
      analysis_id: string;
      status: string;
      detected_color: {
        level: number;
        tone: string;
        level_name: string;
        tone_name: string;
        confidence: number;
        rgb: number[];
        color_hex: string;
      };
      condition: {
        porosity: string;
        damage_score: number;
        elasticity: string;
        elasticity_percent: number;
        flagged_concerns: string[];
      };
      hair_type: {
        texture: string;
        density: string;
        is_virgin: boolean;
      };
      warnings: { type: string; code: string; message: string }[];
      recommendations: {
        pre_treatment: string | null;
        developer_recommendation: string;
        processing_notes: string;
      };
    } = {
      analysis_id: `ana-${Date.now()}`,
      status: 'completed',
      detected_color: {
        level: 6,
        tone: 'N',
        level_name: 'Dark Blonde',
        tone_name: 'Natural',
        confidence: 0.93,
        rgb: [122, 104, 78],
        color_hex: '#7a684e',
      },
      condition: {
        porosity: 'normal',
        damage_score: 0.15,
        elasticity: 'good',
        elasticity_percent: 88,
        flagged_concerns: [],
      },
      hair_type: {
        texture: questionnaire?.texture || 'medium',
        density: 'medium',
        is_virgin: questionnaire?.is_virgin ?? true,
      },
      warnings: [],
      recommendations: {
        pre_treatment: questionnaire?.has_metallic_dye || questionnaire?.has_henna
          ? 'Corrective treatment required before coloring'
          : null,
        developer_recommendation: '20 volume for standard processing',
        processing_notes: 'Standard application recommended',
      },
    };

    // Add warnings based on questionnaire flags
    if (questionnaire?.has_metallic_dye) {
      result.warnings.push({
        type: 'critical',
        code: 'METALLIC_DYE',
        message: 'Metallic dye detected in hair history. Color cannot be applied until metallic buildup is removed. Recommend Malibu C treatment.',
      });
    }
    if (questionnaire?.has_henna) {
      result.warnings.push({
        type: 'warning',
        code: 'HENNA',
        message: 'Henna dye history may cause unpredictable results. Patch test recommended.',
      });
    }
    if (questionnaire?.has_straightening) {
      result.recommendations.processing_notes = 'Previous chemical treatment detected. Use lower volume developer and monitor processing.';
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('/api/analyze error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}