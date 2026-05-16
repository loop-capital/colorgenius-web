// Brand Conversion Engine — Core Algorithm
// ADR-015 §3: Universal (level, toneFamily) matching with confidence scoring

import type {
  NormalizedShade,
  ConversionRequest,
  ConversionResult,
  MatchType,
  ToneFamily,
} from './types';
import { ADJACENT_TONES, getDeveloperIntent } from './types';
import {
  loadBrandShades,
  loadBrandSpecs,
  findShadeByCode,
  getPreferredLine,
  getAllBrands,
} from './data-loader';
import { getToneFamily } from './tone-family-mappings';
import { getManufacturerConversion } from './manufacturer-conversions';

// ─── Confidence Scoring Constants ────────────────────────────────────────
const CONFIDENCE = {
  EXACT: 1.0,           // Same level + same tone family
  ADJACENT_TONE: 0.9,   // Same level + adjacent tone family
  CLOSEST_LEVEL: 0.8,   // ±1 level + same tone family
  FUZZY: 0.55,          // ±1 level + adjacent tone family
  NO_MATCH: null,       // No match within ±1 level + adjacent tone
} as const;

// Multi-shade penalty factor
const MULTI_SHADE_PENALTY = 0.9;

interface MatchCandidate {
  shade: NormalizedShade;
  confidence: number;
  matchType: MatchType;
  notes?: string;
}

interface ShadeConversionRequest {
  shadeCode: string;
  brand: string;
  line: string;
  grams: number;
}

// ─── Core Conversion: Single Shade ────────────────────────────────────────

/**
 * Convert a single shade with full confidence scoring.
 * ADR-015 §3.1 — 4-tier matching with precise confidence values.
 */
export async function convertShade(
  sourceShade: NormalizedShade,
  targetBrand: string,
  targetLine?: string
): Promise<MatchCandidate | null> {
  // ── Manufacturer-provided mapping (highest priority) ──
  const manufacturerResult = getManufacturerConversion(
    sourceShade.brand,
    targetBrand,
    sourceShade.code
  );
  if (manufacturerResult) {
    const mappedShade = findShadeByCode(targetBrand, manufacturerResult.targetCode);
    if (mappedShade) {
      const chartBrand = sourceShade.brand === 'soho' ? 'SOHO' : sourceShade.brand === 'chi' ? 'CHI' : 'Manufacturer';
      return {
        shade: mappedShade,
        confidence: manufacturerResult.confidence,
        matchType: 'exact',
        notes: `${chartBrand} mapping: ${sourceShade.code} → ${manufacturerResult.targetCode}`,
      };
    }
  }

  const targetShades = loadBrandShades(targetBrand);
  const lineFilter = targetLine || getPreferredLine(targetBrand);

  const candidates: MatchCandidate[] = [];

  // ── Tier 1: Exact match — same level + same tone family ──
  const exactMatches = targetShades.filter(
    (s) =>
      s.level === sourceShade.level &&
      s.toneFamily === sourceShade.toneFamily &&
      (!targetLine || s.line === targetLine)
  );
  if (exactMatches.length > 0) {
    const best = exactMatches.find((s) => s.line === lineFilter) || exactMatches[0];
    candidates.push({
      shade: best,
      confidence: CONFIDENCE.EXACT,
      matchType: 'exact',
      notes: `Exact match: level ${sourceShade.level}, tone ${sourceShade.toneFamily}`,
    });
  }

  // ── Tier 2: Adjacent tone — same level + adjacent tone family ──
  if (candidates.length === 0) {
    const adjacent = ADJACENT_TONES[sourceShade.toneFamily] || [];
    for (const adjTone of adjacent) {
      const closeMatches = targetShades.filter(
        (s) =>
          s.level === sourceShade.level &&
          s.toneFamily === adjTone &&
          (!targetLine || s.line === targetLine)
      );
      if (closeMatches.length > 0) {
        const best = closeMatches.find((s) => s.line === lineFilter) || closeMatches[0];
        candidates.push({
          shade: best,
          confidence: CONFIDENCE.ADJACENT_TONE,
          matchType: 'close',
          notes: `Adjacent tone match: level ${sourceShade.level}, tone ${adjTone} (adjacent to ${sourceShade.toneFamily})`,
        });
        break;
      }
    }
  }

  // ── Tier 3: Closest level — ±1 level + same tone family ──
  if (candidates.length === 0) {
    for (const delta of [-1, 1]) {
      const adjLevel = sourceShade.level + delta;
      if (adjLevel < 1 || adjLevel > 12) continue;
      const levelAdjMatches = targetShades.filter(
        (s) =>
          s.level === adjLevel &&
          s.toneFamily === sourceShade.toneFamily &&
          (!targetLine || s.line === targetLine)
      );
      if (levelAdjMatches.length > 0) {
        const best =
          levelAdjMatches.find((s) => s.line === lineFilter) || levelAdjMatches[0];
        candidates.push({
          shade: best,
          confidence: CONFIDENCE.CLOSEST_LEVEL,
          matchType: 'level-adjusted',
          notes: `Closest level match: level ${adjLevel} (source was ${sourceShade.level}), tone ${sourceShade.toneFamily}`,
        });
        break;
      }
    }
  }

  // ── Tier 4: Fuzzy match — ±1 level + adjacent tone family ──
  if (candidates.length === 0) {
    const adjacent = ADJACENT_TONES[sourceShade.toneFamily] || [];
    for (const delta of [-1, 1]) {
      const adjLevel = sourceShade.level + delta;
      if (adjLevel < 1 || adjLevel > 12) continue;
      for (const adjTone of adjacent) {
        const weakMatches = targetShades.filter(
          (s) =>
            s.level === adjLevel &&
            s.toneFamily === adjTone &&
            (!targetLine || s.line === targetLine)
        );
        if (weakMatches.length > 0) {
          const best =
            weakMatches.find((s) => s.line === lineFilter) || weakMatches[0];
          candidates.push({
            shade: best,
            confidence: CONFIDENCE.FUZZY,
            matchType: 'weak',
            notes: `Fuzzy match: level ${adjLevel} (source was ${sourceShade.level}), tone ${adjTone} (adjacent to ${sourceShade.toneFamily})`,
          });
          break;
        }
      }
      if (candidates.length > 0) break;
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}

// ─── Developer Volume Translation ──────────────────────────────────────────

/**
 * Semantic developer intents and their typical volumes.
 */
const INTENT_TO_VOLUME: Record<string, number> = {
  deposit: 10,
  '1-2lift': 20,
  '2-3lift': 30,
  '3-4lift': 40,
  '4+lift': 40,
};

/**
 * Convert developer volume based on semantic intent.
 * ADR-015 §4.2: Map source developer to closest target developer
 * by semantic intent (deposit, lift, etc.), not numeric equivalence.
 */
export async function convertDeveloper(
  originalVolume: number,
  targetBrand: string
): Promise<{ volume: number; notes?: string } > {
  const specs = loadBrandSpecs(targetBrand);
  const intent = getDeveloperIntent(originalVolume);

  // Collect available volumes from brand specs
  let availableVolumes: number[] = [];

  if (specs?.developerVolumes) {
    availableVolumes = specs.developerVolumes;
  } else if (specs?.developers) {
    // Try to extract volumes from developers object
    const devs = specs.developers as any;
    if (Array.isArray(devs)) {
      availableVolumes = devs.map((d) => d.volume).filter(Boolean);
    } else if (devs?.volumes) {
      availableVolumes = devs.volumes;
    }
  }

  // Fallback: try lines
  if (availableVolumes.length === 0 && specs?.lines) {
    for (const line of specs.lines) {
      if (line.developerVolumes) {
        availableVolumes = [...availableVolumes, ...line.developerVolumes];
      }
    }
    // Deduplicate
    availableVolumes = [...new Set(availableVolumes)];
  }

  if (availableVolumes.length === 0) {
    return {
      volume: originalVolume,
      notes: `Target brand "${targetBrand}" has no developer volume data; using original ${originalVolume}vol`,
    };
  }

  const targetPreferred = INTENT_TO_VOLUME[intent] || originalVolume;

  // Find closest available volume
  const sorted = [...availableVolumes].sort((a, b) => a - b);
  let closest = sorted[0];
  let minDiff = Math.abs(targetPreferred - closest);

  for (const v of sorted) {
    const diff = Math.abs(targetPreferred - v);
    if (diff < minDiff) {
      minDiff = diff;
      closest = v;
    }
  }

  // Build notes
  let notes: string | undefined;
  if (closest !== targetPreferred) {
    notes = `Intent: ${intent}. Target brand does not offer ${targetPreferred}vol; closest available is ${closest}vol.`;
    if (closest < targetPreferred && specs?.formulationGuidelines?.processing_times) {
      notes +=
        ' Consider extending processing time per manufacturer guidelines.';
    }
  }

  return { volume: closest, notes };
}

// ─── Mixing Ratio Adjustment ─────────────────────────────────────────────

/**
 * Extract numeric ratio parts (e.g., "1:1.5" → [1, 1.5]).
 */
function parseRatio(ratio: string): [number, number] | null {
  const match = ratio.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return [parseFloat(match[1]), parseFloat(match[2])];
}

/**
 * Get the mixing ratio for the target brand/line.
 * ADR-015 §4.3: Returns target brand's native ratio.
 */
export async function getMixingRatio(
  targetBrand: string,
  targetLine?: string
): Promise<string> {
  const specs = loadBrandSpecs(targetBrand);

  if (targetLine && specs?.lines) {
    const lineSpec = specs.lines.find((l) => l.name === targetLine);
    if (lineSpec?.mixRatio) return lineSpec.mixRatio;
  }

  if (specs?.mixRatio) return specs.mixRatio;

  return '1:1';
}

/**
 * Calculate adjusted product amounts when converting across brands.
 * ADR-015 §4.3: Different brands use different ratios.
 * We preserve total formula weight but calculate per-component amounts.
 */
export async function calculateMixingAmounts(
  sourceBrand: string,
  targetBrand: string,
  sourceLine?: string,
  targetLine?: string,
  grams: number = 30
): Promise<{
  colorGrams: number;
  developerGrams: number;
  sourceRatio: string;
  targetRatio: string;
  totalGrams: number;
  notes?: string;
}> {
  const sourceRatio = await getMixingRatio(sourceBrand, sourceLine);
  const targetRatio = await getMixingRatio(targetBrand, targetLine);

  const sourceParsed = parseRatio(sourceRatio);
  const targetParsed = parseRatio(targetRatio);

  if (!sourceParsed || !targetParsed) {
    return {
      colorGrams: grams,
      developerGrams: grams,
      sourceRatio,
      targetRatio,
      totalGrams: grams * 2,
      notes: 'Could not parse mixing ratios; defaulting to equal parts.',
    };
  }

  const [sColor, sDev] = sourceParsed;
  const [tColor, tDev] = targetParsed;

  // Source total parts per color part
  const sourceTotalParts = sColor + sDev;
  const targetTotalParts = tColor + tDev;

  // Calculate color amount to maintain same total output
  // Total grams = color * (1 + dev/color)
  const colorGrams = Math.round((grams * sourceTotalParts / sColor) * (tColor / targetTotalParts));
  const developerGrams = Math.round(colorGrams * (tDev / tColor));
  const totalGrams = colorGrams + developerGrams;

  let notes: string | undefined;
  if (sourceRatio !== targetRatio) {
    notes = `Mixing ratio changed from ${sourceRatio} to ${targetRatio}. Total formula: ${totalGrams}g (color ${colorGrams}g + developer ${developerGrams}g).`;
  }

  return {
    colorGrams,
    developerGrams,
    sourceRatio,
    targetRatio,
    totalGrams,
    notes,
  };
}

// ─── Multi-Shade Formula Handling ──────────────────────────────────────────

/**
 * Convert a single shade component (used by multi-shade formulas).
 */
export async function convertShadeComponent(
  shadeReq: ShadeConversionRequest,
  targetBrand: string,
  targetLine?: string
): Promise<{
  converted: ConversionResult['shades'][0] | null;
  hardStop?: string;
  warning?: string;
}> {
  const sourceShade = findShadeByCode(shadeReq.brand, shadeReq.shadeCode);
  if (!sourceShade) {
    return {
      converted: null,
      hardStop: `Source shade "${shadeReq.shadeCode}" not found in ${shadeReq.brand} data.`,
    };
  }

  const match = await convertShade(sourceShade, targetBrand, targetLine);

  if (!match) {
    return {
      converted: null,
      hardStop: `No equivalent shade found for ${shadeReq.shadeCode} (level ${sourceShade.level}, tone ${sourceShade.toneFamily}) in ${targetBrand}. Recommend custom formulation.`,
    };
  }

  const result: ConversionResult['shades'][0] = {
    originalCode: shadeReq.shadeCode,
    originalBrand: shadeReq.brand,
    convertedCode: match.shade.code,
    convertedBrand: match.shade.brand,
    convertedLine: match.shade.line,
    convertedName: match.shade.name,
    convertedHex: match.shade.hex,
    grams: shadeReq.grams,
    confidence: match.confidence,
    matchType: match.matchType,
    notes: match.notes,
  };

  let warning: string | undefined;
  if (match.matchType === 'weak') {
    warning = `Weak match for ${shadeReq.shadeCode} → ${match.shade.code}. Review with senior colorist.`;
  }

  return { converted: result, warning };
}

// ─── Main Conversion Entry Point ───────────────────────────────────────────

/**
 * Convert a formula (single or multi-shade) with full confidence scoring.
 * ADR-015 §3.2: Multi-shade formulas — overall confidence = lowest shade confidence × 0.9
 */
export async function convertFormula(
  request: ConversionRequest
): Promise<ConversionResult> {
  const { shades, targetBrand, targetLine, developerVolume } = request;

  const hardStops: string[] = [];
  const warnings: string[] = [];
  const convertedShades: ConversionResult['shades'] = [];

  // Convert each shade independently
  for (const shadeReq of shades) {
    const { converted, hardStop, warning } = await convertShadeComponent(
      shadeReq,
      targetBrand,
      targetLine
    );

    if (hardStop) {
      hardStops.push(hardStop);
    }
    if (warning) {
      warnings.push(warning);
    }
    if (converted) {
      convertedShades.push(converted);
    }
  }

  // Developer and mixing ratio
  const devConversion = await convertDeveloper(developerVolume, targetBrand);
  const mixingRatio = await getMixingRatio(targetBrand, targetLine);

  // Calculate overall confidence
  let overallConfidence: number;
  const confidences = convertedShades.map((s) => s.confidence);

  if (confidences.length === 0) {
    overallConfidence = 0;
  } else if (confidences.length === 1) {
    overallConfidence = confidences[0];
  } else {
    // Multi-shade: lowest shade confidence × penalty factor
    const minConfidence = Math.min(...confidences);
    overallConfidence = Math.round(minConfidence * MULTI_SHADE_PENALTY * 100) / 100;
  }

  // Warnings for low confidence
  if (overallConfidence < 0.7 && convertedShades.length > 0) {
    warnings.push(
      `Overall confidence (${(overallConfidence * 100).toFixed(0)}%) is low. Manual review recommended.`
    );
  }

  return {
    shades: convertedShades,
    developer: {
      originalVolume: developerVolume,
      convertedVolume: devConversion.volume,
      mixingRatio,
      notes: devConversion.notes,
    },
    overallConfidence: Math.round(overallConfidence * 100) / 100,
    hardStops,
    warnings,
  };
}

// ─── Find Equivalents Across Brands ──────────────────────────────────────

/**
 * Find equivalent shades across all brands for a given level + tone family.
 */
export async function findEquivalents(
  level: number,
  toneFamily: string,
  excludeBrand?: string
): Promise<Record<string, NormalizedShade[]>> {
  const brands = getAllBrands().filter((b) => b !== excludeBrand?.toLowerCase());
  const equivalents: Record<string, NormalizedShade[]> = {};

  for (const brand of brands) {
    const shades = loadBrandShades(brand);
    const matches = shades.filter(
      (s) => s.level === level && s.toneFamily === toneFamily
    );
    if (matches.length > 0) {
      equivalents[brand] = matches;
    }
  }

  return equivalents;
}

// ─── Backward Compatibility Exports ──────────────────────────────────────

export { getToneFamily };
