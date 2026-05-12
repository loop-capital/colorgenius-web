import { NextRequest, NextResponse } from 'next/server';
// import type { Formulation } from '@/types';
type Formulation = any;

// Lookup table for common color transitions
const FORMULA_LOOKUP: Record<string, {
  brand: string;
  product_line: string;
  components: { code: string; amount_g: number; name: string }[];
  developer: { volume: number; amount_oz: number; amount_ml: number };
  mixing_ratio: string;
  total_volume_oz: number;
  total_volume_ml: number;
  processing_minutes: number;
  warnings?: string[];
}> = {
  // Dark to slightly lighter (going lighter needs lift)
  '5N_to_6N': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '6/0', amount_g: 60, name: 'Natural Dark Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 30,
  },
  '6N_to_7N': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '7/0', amount_g: 60, name: 'Natural Medium Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 35,
  },
  // Going lighter (needs lift from darker base)
  '5N_to_7A': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [
      { code: '8/1', amount_g: 40, name: 'Ash Light Blonde' },
      { code: '9/0', amount_g: 20, name: 'Extra Light Blonde' },
    ],
    developer: { volume: 30, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 45,
    warnings: ['Lift required — 2+ levels. Monitor closely.'],
  },
  '6A_to_8G': {
    brand: 'Redken Color Gels',
    product_line: 'Color Gels Lacquers',
    components: [{ code: '8G', amount_g: 60, name: 'Gold Light Blonde' }],
    developer: { volume: 30, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 40,
    warnings: ['Lift required from Level 6 base.'],
  },
  // Same level tone change
  '6N_to_6G': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '6/3', amount_g: 60, name: 'Gold Dark Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 30,
  },
  '6N_to_6A': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '6/1', amount_g: 60, name: 'Ash Dark Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 30,
  },
  // Darker (deposit only)
  '7N_to_5N': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '5/0', amount_g: 60, name: 'Natural Light Brown' }],
    developer: { volume: 10, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 25,
    warnings: ['Darker deposit — no lift required.'],
  },
  '7G_to_6R': {
    brand: 'Redken Color Gels',
    product_line: 'Color Gels Lacquers',
    components: [{ code: '6R', amount_g: 60, name: 'Red Dark Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 35,
  },
  // Ash corrections
  '7G_to_7A': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '7/1', amount_g: 60, name: 'Ash Medium Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 30,
  },
  // Default fallback
  'default': {
    brand: 'Wella Koleston Perfect ME',
    product_line: 'Koleston Perfect ME',
    components: [{ code: '7/0', amount_g: 60, name: 'Natural Medium Blonde' }],
    developer: { volume: 20, amount_oz: 2, amount_ml: 60 },
    mixing_ratio: '1:1',
    total_volume_oz: 4,
    total_volume_ml: 120,
    processing_minutes: 30,
  },
};

function getFormula(currentLevel: number, currentTone: string, targetLevel: number, targetTone: string, brand?: string) {
  const key = `${currentLevel}${currentTone}_to_${targetLevel}${targetTone}`;
  const formula = FORMULA_LOOKUP[key] || FORMULA_LOOKUP['default'];

  // Adjust for gray coverage
  const adjustedComponents = formula.components.map((c) => ({
    ...c,
    amount_g: c.amount_g, // Could increase for high gray %
  }));

  return {
    ...formula,
    components: adjustedComponents,
    brand: brand || formula.brand,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      current_level = 6,
      current_tone = 'N',
      target_level = 7,
      target_tone = 'N',
      service_type = 'full_color',
      gray_percentage = 0,
      preferred_brand,
      is_virgin = true,
      questionnaire,
    } = body;

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const formulaData = getFormula(current_level, current_tone, target_level, target_tone, preferred_brand);

    // Build warnings from questionnaire
    const warnings: string[] = [...(formulaData.warnings || [])];
    if (questionnaire?.has_metallic_dye) {
      warnings.push('CRITICAL: Metallic dye in hair — Malibu C treatment required first');
    }
    if (questionnaire?.has_henna) {
      warnings.push('Henna history may cause unpredictable results — patch test required');
    }
    if (gray_percentage > 50) {
      warnings.push('High gray coverage — consider adding a natural shade modifier for better blend');
    }

    const result: Formulation = {
      formulation_id: `form-${Date.now()}`,
      created_at: new Date().toISOString(),
      confidence_score: 0.91,
      validation: {
        is_valid: true,
        warnings,
      },
      primary_formula: {
        action_type: service_type,
        brand: formulaData.brand,
        product_line: formulaData.product_line,
        components: formulaData.components.map((c) => ({
          shade: { id: c.code, code: c.code, name: c.name, level: target_level, primary_tone: target_tone, tone: target_tone, is_natural: false, rgb: [0, 0, 0] as [number, number, number], undertone: 'neutral' as const },
          amount_oz: 2,
          amount_ml: c.amount_g,
          purpose: 'primary' as const,
        })),
        developer: formulaData.developer,
        mixing_ratio: formulaData.mixing_ratio,
        total_volume_oz: formulaData.total_volume_oz,
        total_volume_ml: formulaData.total_volume_ml,
      },
      processing_instructions: {
        total_time_minutes: formulaData.processing_minutes,
        application_sequence: [
          { zone: 'Root', duration: formulaData.processing_minutes, description: 'Apply to new growth first' },
          { zone: 'Lengths', duration: 0, description: 'Apply to mid-lengths after 10-15 min' },
        ],
        room_temperature_recommended: true,
        heat_optional: false,
      },
      cost_estimate: {
        total_product_cost: formulaData.components.reduce((sum, c) => sum + (c.amount_g * 0.08), 0) + 2.5,
        currency: 'USD',
        breakdown: formulaData.components.map((c) => ({
          product: c.name,
          cost: c.amount_g * 0.08,
        })),
      },
      pricing_suggestion: {
        recommended_price: 65,
        price_range: [55, 85],
        currency: 'USD',
      },
      recommendations: {
        aftercare: [
          'Use sulfate-free shampoo to preserve color longevity',
          'Avoid washing hair for 48 hours after service',
          'Apply color-protecting conditioner daily',
        ],
        maintenance_schedule: gray_percentage > 20 ? '4 weeks' : '6-8 weeks',
        next_appointment: gray_percentage > 20 ? '4 weeks' : '6 weeks',
      },
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('/api/formulate error:', error);
    return NextResponse.json(
      { success: false, error: 'Formulation failed' },
      { status: 500 }
    );
  }
}