import { NextRequest, NextResponse } from 'next/server';
// import type { Formulation } from '@/types';
type Formulation = any;
import {
  findShade,
  findShadesByBrand,
  calculateDeveloperVolume,
  calculateProcessingTime,
  getNeutralizerForLift,
  getUndertone,
  estimateShadeCost,
  ALL_SHADES,
  BRANDS,
} from '@/lib/shade-database';

interface FormulateRequest {
  current_level?: number;
  current_tone?: string;
  target_level?: number;
  target_tone?: string;
  service_type?: string;
  gray_percentage?: number;
  preferred_brand?: string;
  is_virgin?: boolean;
  hair_condition?: 'healthy' | 'damaged' | 'porous' | 'resistant';
  questionnaire?: {
    has_metallic_dye?: boolean;
    has_henna?: boolean;
    is_post_chemo?: boolean;
    recent_bleach?: boolean;
  };
}

const PRODUCT_COST_PER_GRAM: Record<string, number> = {
  'Wella Koleston Perfect ME+': 0.10,
  'Redken Color Gels Lacquers': 0.12,
  'Schwarzkopf Igora Royal': 0.09,
  'Matrix SoColor': 0.07,
  'Goldwell Topchic': 0.11,
  'Lanza Healing Color': 0.11,
};

const BRAND_PRODUCT_LINE: Record<string, string> = {
  'Wella Koleston Perfect ME+': 'Koleston Perfect ME+',
  'Redken Color Gels Lacquers': 'Color Gels Lacquers',
  'Schwarzkopf Igora Royal': 'Igora Royal',
  'Matrix SoColor': 'SoColor',
  'Goldwell Topchic': 'Topchic',
  'Lanza Healing Color': 'Healing Color',
};

function normalizeTone(tone: string): string {
  const map: Record<string, string> = {
    'NATURAL': 'N', 'N': 'N',
    'ASH': 'A', 'A': 'A',
    'GOLD': 'G', 'GOLDEN': 'G', 'G': 'G',
    'RED': 'R', 'R': 'R',
    'COPPER': 'K', 'C': 'K', 'K': 'K',
    'BEIGE': 'B', 'B': 'B',
    'VIOLET': 'V', 'V': 'V',
    'PEARL': 'A',
  };
  return map[tone.toUpperCase()] || tone.toUpperCase();
}

function selectBrand(preferred?: string): string {
  if (!preferred) return 'Wella Koleston Perfect ME+';
  const match = BRANDS.find(b =>
    b.name.toLowerCase().includes(preferred.toLowerCase()) ||
    preferred.toLowerCase().includes(b.name.toLowerCase())
  );
  return match?.name || 'Wella Koleston Perfect ME+';
}

function buildFormulaComponents(
  targetLevel: number,
  targetTone: string,
  brand: string,
  liftRequired: number,
  grayPercentage: number,
  totalGrams = 60
) {
  const components: Array<{
    shade: {
      id: string;
      code: string;
      name: string;
      level: number;
      primary_tone: string;
      tone: string;
      is_natural: boolean;
      rgb: [number, number, number];
      undertone: 'warm' | 'neutral' | 'cool';
    };
    amount_oz: number;
    amount_ml: number;
    purpose: 'primary' | 'secondary' | 'gray_coverage' | 'corrector';
  }> = [];

  // Find primary shade
  const primaryShade = findShade(targetLevel, targetTone, brand, grayPercentage > 30);
  if (!primaryShade) {
    // Fallback
    const fallback = findShade(targetLevel, 'N', brand, true);
    if (fallback) {
      components.push({
        shade: {
          id: fallback.shadeCode,
          code: fallback.shadeCode,
          name: fallback.name,
          level: fallback.level,
          primary_tone: fallback.tone,
          tone: fallback.tone,
          is_natural: fallback.isNatural,
          rgb: fallback.rgb,
          undertone: fallback.undertone,
        },
        amount_oz: 2,
        amount_ml: totalGrams,
        purpose: 'primary',
      });
    }
    return components;
  }

  // Determine if we need mixing (gray coverage or tone adjustment)
  const needsGrayCoverage = grayPercentage > 30;
  const needsToneNeutralization = liftRequired > 0 && !['A', 'V'].includes(targetTone);
  const needsMixing = needsGrayCoverage || needsToneNeutralization;

  if (needsMixing && !primaryShade.isNatural && needsGrayCoverage) {
    // For gray coverage > 30%, mix with a natural shade from same level
    const naturalShade = findShade(targetLevel, 'N', brand, true);
    const naturalPct = Math.min(0.5, (grayPercentage / 100) * 0.8);
    const primaryPct = 1 - naturalPct;

    if (naturalShade && naturalShade.shadeCode !== primaryShade.shadeCode) {
      components.push({
        shade: {
          id: primaryShade.shadeCode,
          code: primaryShade.shadeCode,
          name: primaryShade.name,
          level: primaryShade.level,
          primary_tone: primaryShade.tone,
          tone: primaryShade.tone,
          is_natural: primaryShade.isNatural,
          rgb: primaryShade.rgb,
          undertone: primaryShade.undertone,
        },
        amount_oz: parseFloat((primaryPct * 2).toFixed(1)),
        amount_ml: Math.round(primaryPct * totalGrams),
        purpose: 'primary',
      });
      components.push({
        shade: {
          id: naturalShade.shadeCode,
          code: naturalShade.shadeCode,
          name: naturalShade.name,
          level: naturalShade.level,
          primary_tone: naturalShade.tone,
          tone: naturalShade.tone,
          is_natural: naturalShade.isNatural,
          rgb: naturalShade.rgb,
          undertone: naturalShade.undertone,
        },
        amount_oz: parseFloat((naturalPct * 2).toFixed(1)),
        amount_ml: Math.round(naturalPct * totalGrams),
        purpose: 'gray_coverage',
      });
    } else {
      // Just use primary
      components.push({
        shade: {
          id: primaryShade.shadeCode,
          code: primaryShade.shadeCode,
          name: primaryShade.name,
          level: primaryShade.level,
          primary_tone: primaryShade.tone,
          tone: primaryShade.tone,
          is_natural: primaryShade.isNatural,
          rgb: primaryShade.rgb,
          undertone: primaryShade.undertone,
        },
        amount_oz: 2,
        amount_ml: totalGrams,
        purpose: 'primary',
      });
    }
  } else {
    // Single shade
    components.push({
      shade: {
        id: primaryShade.shadeCode,
        code: primaryShade.shadeCode,
        name: primaryShade.name,
        level: primaryShade.level,
        primary_tone: primaryShade.tone,
        tone: primaryShade.tone,
        is_natural: primaryShade.isNatural,
        rgb: primaryShade.rgb,
        undertone: primaryShade.undertone,
      },
      amount_oz: 2,
      amount_ml: totalGrams,
      purpose: 'primary',
    });
  }

  return components;
}

function calculatePricing(
  components: Array<{ shade: { id: string; code: string }; amount_ml: number }>,
  brand: string,
  serviceType: string
): { cost: number; price: number } {
  const costPerGram = PRODUCT_COST_PER_GRAM[brand] || 0.09;
  const cost = components.reduce((sum, c) => sum + (c.amount_ml * costPerGram), 0) + 1.5; // + developer

  // Base service prices
  const basePrice = serviceType === 'corrective' ? 95 :
                    serviceType === 'highlights' ? 85 :
                    serviceType === 'balayage' ? 90 :
                    serviceType === 'root_touchup' ? 55 : 65;

  // Adjust for service complexity
  const price = Math.round(basePrice + cost * 3);

  return { cost: parseFloat(cost.toFixed(2)), price };
}

function getWarnings(req: FormulateRequest): string[] {
  const warnings: string[] = [];
  const { questionnaire, gray_percentage = 0, hair_condition, is_virgin = true, target_level, current_level } = req;

  if (questionnaire?.has_metallic_dye) {
    warnings.push('⚠️ CRITICAL: Metallic dye history detected — Malibu C treatment required before coloring. Do not apply oxidative color without first removing metallic particles.');
  }
  if (questionnaire?.has_henna) {
    warnings.push('⚠️ Henna in hair history — unpredictable results possible. Perform strand test 48 hours before full application.');
  }
  if (questionnaire?.is_post_chemo) {
    warnings.push('⚠️ Post-chemotherapy hair may be fragile — use lowest volume developer (10vol) and add bond builder.');
  }
  if (questionnaire?.recent_bleach) {
    warnings.push('⚠️ Recent bleach service — wait 2+ weeks. Hair may be porous and process unevenly.');
  }
  if (gray_percentage > 75) {
    warnings.push('⚠️ High gray percentage (75%+) — recommend natural-series shades for optimal coverage and blend.');
  }
  if (hair_condition === 'damaged') {
    warnings.push('⚠️ Compromised hair condition — consider adding bond builder (Olaplex No.1) to protect during processing.');
  }
  if (hair_condition === 'porous') {
    warnings.push('⚠️ High porosity detected — use cooler developer (20vol max) and monitor closely to prevent over-processing.');
  }
  if (target_level !== undefined && current_level !== undefined && target_level > current_level + 3) {
    warnings.push('⚠️ Significant lift required (3+ levels) — may need lightener first for predictable results on previously colored hair.');
  }
  if (!is_virgin && (target_level ?? 0) > (current_level ?? 0)) {
    warnings.push('⚠️ Lifting through previous color — results may be less predictable. Consider removing previous color first.');
  }

  return warnings;
}

function getAftercare(serviceType: string, targetTone: string): string[] {
  const base = [
    'Use sulfate-free shampoo and conditioner designed for color-treated hair',
    'Avoid washing hair for 48 hours after coloring to set the color',
    'Apply a weekly deep conditioning mask to maintain moisture balance',
    'Use UV protection spray when spending extended time in sunlight',
  ];

  if (['A', 'V'].includes(targetTone)) {
    base.push('Use purple-toned shampoo 1-2x weekly to maintain cool tone (especially after washing)');
  }
  if (['G', 'K', 'R'].includes(targetTone)) {
    base.push('Use color-depositing shampoos to maintain warmth and prevent fading');
  }
  if (serviceType === 'highlights' || serviceType === 'balayage') {
    base.push('Use a bond-maintaining treatment (Olaplex) weekly to preserve highlight integrity');
  }

  return base;
}

export async function POST(request: NextRequest) {
  try {
    const body: FormulateRequest = await request.json();
    const {
      current_level = 6,
      current_tone = 'N',
      target_level = 7,
      target_tone = 'N',
      service_type = 'full_color',
      gray_percentage = 0,
      preferred_brand,
      is_virgin = true,
      hair_condition,
      questionnaire,
    } = body;

    // Normalize inputs
    const currentToneNorm = normalizeTone(current_tone);
    const targetToneNorm = normalizeTone(target_tone);
    const currentLevelNum = Math.max(1, Math.min(12, current_level));
    const targetLevelNum = Math.max(1, Math.min(12, target_level));
    const liftRequired = targetLevelNum - currentLevelNum;
    const brand = selectBrand(preferred_brand);

    // Validate
    if (currentLevelNum < 1 || currentLevelNum > 12 || targetLevelNum < 1 || targetLevelNum > 12) {
      return NextResponse.json(
        { success: false, error: 'Level must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Build formula components
    const components = buildFormulaComponents(
      targetLevelNum,
      targetToneNorm,
      brand,
      liftRequired,
      gray_percentage
    );

    if (components.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No matching shade found for the requested combination' },
        { status: 404 }
      );
    }

    // Developer selection
    const developerVolume = calculateDeveloperVolume(liftRequired, {
      grayPercentage: gray_percentage,
      isVirgin: is_virgin,
      hasHighPorosity: hair_condition === 'porous',
      hasDamage: hair_condition === 'damaged',
    });

    // Developer amount (same as color amount for 1:1)
    const developerOz = components.reduce((s, c) => s + c.amount_oz, 0);
    const developerMl = components.reduce((s, c) => s + c.amount_ml, 0);

    // Processing time
    const processingMinutes = calculateProcessingTime(developerVolume, {
      grayPercentage: gray_percentage,
      isVirgin: is_virgin,
      liftRequired,
      serviceType: service_type,
    });

    // Warnings
    const warnings = getWarnings(body);

    // Cost & pricing
    const { cost, price } = calculatePricing(components, brand, service_type);

    // Determine action type
    let actionType = 'full_color';
    if (service_type === 'root_touchup') actionType = 'root_touchup';
    else if (liftRequired > 0) actionType = 'lift_and_deposit';
    else if (service_type === 'highlights') actionType = 'highlights';
    else if (service_type === 'balayage') actionType = 'balayage';
    else if (service_type === 'corrective') actionType = 'corrective';

    // Application sequence
    const applicationSequence = service_type === 'root_touchup'
      ? [
          { zone: 'Root', duration: processingMinutes, description: 'Apply to new growth first, starting at scalp' },
          { zone: 'Lengths', duration: 0, description: 'Pull through to mid-lengths for final 5-10 minutes if needed' },
        ]
      : [
          { zone: 'Root', duration: Math.round(processingMinutes * 0.6), description: 'Apply to new growth/roots first' },
          { zone: 'Midlengths', duration: Math.round(processingMinutes * 0.4), description: 'Apply to mid-lengths and ends' },
        ];

    // Confidence score based on data quality
    let confidence = 0.88;
    if (gray_percentage > 30) confidence -= 0.05;
    if (!is_virgin) confidence -= 0.03;
    if (hair_condition === 'damaged') confidence -= 0.04;
    if (liftRequired > 2) confidence -= 0.05;
    confidence = Math.max(0.7, Math.min(0.98, confidence));

    // Main result object
    const result: Formulation = {
      formulation_id: `form-${Date.now()}`,
      created_at: new Date().toISOString(),
      confidence_score: confidence,
      validation: {
        is_valid: warnings.filter(w => w.startsWith('⚠️ CRITICAL')).length === 0,
        warnings,
      },
      primary_formula: {
        action_type: actionType,
        brand,
        product_line: BRAND_PRODUCT_LINE[brand] || brand,
        components,
        developer: {
          volume: developerVolume,
          amount_oz: developerOz,
          amount_ml: developerMl,
        },
        mixing_ratio: '1:1',
        total_volume_oz: developerOz * 2,
        total_volume_ml: developerMl * 2,
      },
      processing_instructions: {
        total_time_minutes: processingMinutes,
        application_sequence: applicationSequence,
        room_temperature_recommended: true,
        heat_optional: hair_condition === 'porous' ? false : true,
        notes: liftRequired > 0
          ? [`Lift ${liftRequired} level(s) — monitor at ${Math.round(processingMinutes * 0.6)} minutes`, 'Use foil or cap for even lift on resistant hair']
          : ['Deposit-only service — process to full time for maximum longevity'],
      },
      cost_estimate: {
        total_product_cost: cost,
        currency: 'USD',
        breakdown: components.map(c => ({
          product: c.shade.name + ` (${c.shade.code})`,
          cost: parseFloat((c.amount_ml * (PRODUCT_COST_PER_GRAM[brand] || 0.09)).toFixed(2)),
        })),
      },
      pricing_suggestion: {
        recommended_price: price,
        price_range: [Math.round(price * 0.85 / 5) * 5, Math.round(price * 1.2 / 5) * 5] as [number, number],
        currency: 'USD',
      },
      recommendations: {
        aftercare: getAftercare(service_type, targetToneNorm),
        maintenance_schedule: gray_percentage > 20 ? '4-5 weeks' : '6-8 weeks',
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
