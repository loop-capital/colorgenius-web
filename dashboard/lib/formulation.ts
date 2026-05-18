// Hair Color Formulation Engine
// Rules-based algorithm for professional color formulation

import { Product, ALL_PRODUCTS, HAIR_LEVELS, ToneFamily } from './products';
import { getManufacturerConversion } from './conversion/manufacturer-conversions';
import { getBrandDisplayName } from './conversion/data-loader';

export interface HairCondition {
  type: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged';
  porosity: 'low' | 'normal' | 'high';
  grayPercent: number; // 0-100
  highlights: boolean;
  highlightedPercent?: number; // 0-100
  // Problem indicators
  banding?: boolean;
  hotRoots?: boolean;
  previousLightener?: boolean;
  multipleColors?: boolean;
  greenCast?: boolean;
  muddyToner?: boolean;
  overAshy?: boolean;
  colorGrab?: boolean;
  hollowEnds?: boolean;
}

export interface FormulationInput {
  currentLevel: number;
  currentTone: ToneFamily;
  targetLevel: number;
  targetTone: ToneFamily;
  condition: HairCondition;
  brandPreference?: string;
  linePreference?: string;
  // Extended form fields
  texture?: string;
  hairType?: string;
  density?: string;
  serviceType?: string;
  chemicalHistory?: {
    boxDye?: boolean;
    metallicSalts?: boolean;
    henna?: boolean;
    keratinTreatment?: boolean;
    relaxer?: boolean;
    lastService?: string;
    hardWater?: boolean;
    medicationBuildup?: boolean;
  } | null;
  sensitivityFlags?: {
    ppdAllergy?: boolean;
    isPregnant?: boolean;
    isBreastfeeding?: boolean;
    activeChemo?: boolean;
  } | null;
}

export interface FormulationStep {
  product: Product;
  grams: number;
  role: 'primary' | 'secondary' | 'additive' | 'corrective';
  notes?: string;
}

export interface ConfidenceAdjustment {
  factor: string;
  reduction: number; // 0-1
}

export interface FormulationResult {
  success: boolean;
  steps: FormulationStep[];
  developerVolume: number;
  developerMl: number;
  totalMl: number;
  processingTime: number; // minutes
  application: 'root' | 'root_to_end' | 'balayage' | 'foil' | 'all_over';
  coverage: 'full' | 'partial' | 'tonal';
  notes: string[];
  warnings: string[];
  brand: string;
  line: string;
  assessment?: string;
  underlyingPigment?: { description: string; exposed?: string };
  quantity?: { description: string };
  confidence?: number; // 0-100
  adjustedConfidence?: number; // 0-1, for UI
  confidenceAdjustments?: ConfidenceAdjustment[];
  strandTestRecommended?: boolean;
  hardStops?: { type: string; message: string }[];
  alternatives?: string[];
  multiSessionPlan?: string[];
}

// ─── Lifting Chart ─────────────────────────────────────────────────────────────
// How many levels to lift per developer volume
const LIFT_CHART: Record<number, number> = {
  10: 0,
  20: 1,
  30: 2,
  40: 3,
  50: 4,
};

// ─── Per-Shade Developer Constraint ──────────────────────────────────────────
// Parse "10-20 vol" / "20-40 vol" / "30 vol" → allowed volume list
function parseDevVolumes(developerRequired: string): number[] {
  const nums = (developerRequired.match(/\d+/g) ?? []).map(Number);
  if (nums.length >= 2) {
    const lo = Math.min(...nums);
    const hi = Math.max(...nums);
    return [10, 20, 30, 40].filter(v => v >= lo && v <= hi);
  }
  if (nums.length === 1) return [nums[0]];
  return [10, 20, 30, 40]; // unknown — allow all
}

// ─── Per-Line Processing Time ─────────────────────────────────────────────────
function getLineProcessingTime(line: string): { base: number; min: number; max: number } {
  const l = line.toLowerCase();
  if (/high.?lift|high lift/.test(l)) return { base: 50, min: 40, max: 60 };
  if (/color touch|colour touch|shades eq|majirel glow|dialight|shinefinity|super sync|socolor sync|vibrance|chromatics overlay/.test(l))
    return { base: 25, min: 20, max: 30 }; // demi-permanent
  if (/toner|semi.?perm|gloss|direct dye|pastel|neon|vivid|acidic/.test(l))
    return { base: 15, min: 10, max: 20 }; // semi/toner
  return { base: 35, min: 25, max: 45 }; // standard permanent
}

// ─── Brand Display Name → Conversion Slug ────────────────────────────────────
// Maps Product.brand display names back to the keys used in the conversion engine
const BRAND_TO_SLUG: Record<string, string> = {
  'Schwarzkopf Professional': 'schwarzkopf',
  'MoroccanOil': 'moroccanoil',
  "L'ANZA": 'lanza',
  'Davines': 'davines',
  'Aveda': 'aveda',
  'Oligo Calura': 'oligo',
  "L'Oréal Professionnel": 'lorealpro',
  'Kevin Murphy COLOR.ME': 'kevinmurphy',
  'Wella Professionals': 'wella',
  'Redken': 'redken',
  'Joico': 'joico',
  'Matrix': 'matrix',
  'Pravana': 'pravana',
  'Kenra Professional': 'kenra',
  'Alfaparf': 'alfaparf',
  'Paul Mitchell': 'paulmitchell',
  'Pulp Riot': 'pulpriot',
  'R+Color': 'rcolor',
  'SOHO': 'soho',
  'CHI': 'chi',
};

// Neutralizing color theory — ash contains green/blue base that counteracts red
const NEUTRALIZERS: Record<ToneFamily, ToneFamily> = {
  warm: 'cool',
  golden: 'ash',
  copper: 'violet',
  red: 'ash', // Ash (green/blue base) counteracts red
  violet: 'golden',
  ash: 'warm',
  cool: 'warm',
  neutral: 'neutral',
  pearl: 'golden',
  beige: 'violet',
  mahogany: 'ash',
  chocolate: 'cool',
};

// ─── Core Formulation Logic ───────────────────────────────────────────────────

function determineDeveloperVolume(input: FormulationInput): { volume: number; lift: number } {
  const levelDiff = input.targetLevel - input.currentLevel;
  
  // Lifting required takes priority — gray coverage boost only when depositing
  if (levelDiff > 0) {
    // Need to lift
    const requiredLift = levelDiff;
    // Find smallest volume that achieves required lift
    const volumes = [20, 30, 40];
    for (const vol of volumes) {
      if (LIFT_CHART[vol] >= requiredLift) {
        return { volume: vol, lift: LIFT_CHART[vol] };
      }
    }
    return { volume: 40, lift: 3 };
  }

  // Deposit only (same level or darker) — boost to 20vol for high gray coverage
  if (input.condition.grayPercent > 25) {
    return { volume: 20, lift: 0 };
  }
  return { volume: 10, lift: 0 };
}

function findPrimaryColor(
  level: number,
  tone: ToneFamily,
  brand?: string,
  line?: string
): Product | null {
  // Try exact match
  let candidates = ALL_PRODUCTS.filter(p => {
    const levelMatch = p.level === level;
    const toneMatch = p.tone === tone || p.secondaryTone === tone;
    const brandMatch = !brand || p.brand.toLowerCase() === brand.toLowerCase();
    const lineMatch = !line || p.line.toLowerCase() === line.toLowerCase();
    return levelMatch && toneMatch && brandMatch && lineMatch;
  });

  if (candidates.length > 0) {
    // Prefer demi-permanent for same-level, permanent for lift
    return candidates[0];
  }

  // Try primary tone match only
  candidates = ALL_PRODUCTS.filter(p => {
    const levelMatch = p.level === level;
    const toneMatch = p.tone === tone;
    const brandMatch = !brand || p.brand.toLowerCase() === brand.toLowerCase();
    return levelMatch && toneMatch && brandMatch;
  });

  if (candidates.length > 0) return candidates[0];

  // Try same level, neutral
  candidates = ALL_PRODUCTS.filter(p => {
    const levelMatch = p.level === level;
    const toneMatch = p.tone === 'neutral';
    const brandMatch = !brand || p.brand.toLowerCase() === brand.toLowerCase();
    return levelMatch && toneMatch && brandMatch;
  });

  return candidates[0] || null;
}

function findSecondaryColor(
  input: FormulationInput,
  primary: Product
): { product: Product; grams: number; reason: string } | null {
  const { targetLevel, targetTone, condition } = input;
  const { brand, line } = primary;

  const inLine = (p: Product) =>
    p.brand === brand && p.line === line && p.id !== primary.id;

  // 1. Problem-condition corrections take priority
  if (condition.overAshy) {
    const warm = ALL_PRODUCTS.find(p =>
      p.level === targetLevel && inLine(p) &&
      (p.tone === 'warm' || p.tone === 'golden')
    );
    if (warm) return { product: warm, grams: 10, reason: 'Warm secondary to counteract over-ashy tendency' };
  }

  if (condition.greenCast) {
    const red = ALL_PRODUCTS.find(p =>
      p.level === targetLevel && inLine(p) &&
      (p.tone === 'red' || p.tone === 'copper' || p.secondaryTone === 'red')
    );
    if (red) return { product: red, grams: 5, reason: 'Red/copper secondary to counteract green cast' };
  }

  // 2. High gray (≥50%): blend in neutral secondary for anchor base
  if (condition.grayPercent >= 50 && targetTone !== 'neutral') {
    const neutral = ALL_PRODUCTS.find(p =>
      p.level === targetLevel && inLine(p) && p.tone === 'neutral'
    );
    if (neutral) {
      const grams = Math.min(30, Math.max(10, Math.round(60 * (condition.grayPercent / 100) * 0.4)));
      return { product: neutral, grams, reason: `Neutral anchor blend for ${condition.grayPercent}% gray coverage` };
    }
  }

  // 3. Ash/cool on warm base (levels ≤6): small warm soften to prevent flat result
  if ((targetTone === 'ash' || targetTone === 'cool') && input.currentLevel <= 6 && !condition.overAshy) {
    const golden = ALL_PRODUCTS.find(p =>
      p.level === targetLevel && inLine(p) &&
      (p.tone === 'golden' || p.tone === 'warm')
    );
    if (golden) return { product: golden, grams: 5, reason: 'Small golden addition prevents flat/green ash on warm base' };
  }

  // 4. Warm/golden: copper depth boost
  if (targetTone === 'warm' || targetTone === 'golden') {
    const copper = ALL_PRODUCTS.find(p =>
      p.level === targetLevel && inLine(p) &&
      (p.tone === 'copper' || p.secondaryTone === 'copper')
    );
    if (copper) return { product: copper, grams: 10, reason: 'Copper secondary for warm depth' };
  }

  return null;
}

function addCorrectiveAdditives(
  input: FormulationInput,
  primary: Product
): Array<{ product: Product; grams: number; reason: string }> {
  const additives: Array<{ product: Product; grams: number; reason: string }> = [];

  // High porosity: add protein or bond builder
  if (input.condition.porosity === 'high' || input.condition.type === 'damaged') {
    // Note: in real products this would be a specific additive
    // For now, note it as a recommendation
  }

  // Gray coverage: UPT-aware neutral additive
  if (input.condition.grayPercent > 25) {
    const primaryUPT = primary.upt ?? 100;
    // Prefer a high-coverage neutral from the same brand
    const neutral = ALL_PRODUCTS.find(p =>
      p.level === input.targetLevel &&
      p.tone === 'neutral' &&
      p.brand === primary.brand &&
      p.id !== primary.id &&
      (p.upt ?? 100) >= 75
    ) ?? ALL_PRODUCTS.find(p =>
      p.level === input.targetLevel &&
      p.tone === 'neutral' &&
      p.brand === primary.brand &&
      p.id !== primary.id
    );

    if (neutral) {
      // Scale neutral amount: at UPT 100 add a small boost; at UPT 50 (demi) double it
      const uptFactor = Math.min(2.0, 100 / Math.max(primaryUPT, 50));
      const neutralGrams = Math.max(5, Math.min(20, Math.round(10 * (input.condition.grayPercent / 100) * uptFactor)));
      additives.push({
        product: neutral,
        grams: neutralGrams,
        reason: `Neutral base for ${input.condition.grayPercent}% gray (primary UPT ${primaryUPT})`,
      });
    }
  }

  // Counteract underlying warmth when lifting
  if (input.targetLevel > input.currentLevel) {
    const undertoneNeeded = NEUTRALIZERS[input.currentTone];
    if (undertoneNeeded && undertoneNeeded !== 'neutral') {
      const ashProduct = ALL_PRODUCTS.find(p =>
        p.level >= input.targetLevel - 1 &&
        p.level <= input.targetLevel + 1 &&
        (p.tone === 'ash' || p.secondaryTone === 'ash') &&
        p.brand === primary.brand
      );
      if (ashProduct && ashProduct.id !== primary.id) {
        additives.push({
          product: ashProduct,
          grams: 5,
          reason: `Counteract warm undertone (${input.currentTone}) during lift`,
        });
      }
    }
  }

  // Pre-pigmentation for highly porous/damaged
  if (input.condition.porosity === 'high' && input.targetLevel > input.currentLevel) {
    // Note: recommend pre-pigmentation step
  }

  return additives;
}

// ─── Hard Stop Rules ──────────────────────────────────────────────────────────

function buildHardStops(
  input: FormulationInput,
  primary: Product
): { type: string; message: string }[] {
  const stops: { type: string; message: string }[] = [];

  // Carmilane shades are oil-based and must not be mixed
  if (primary.line.toLowerCase().includes('carmilane')) {
    stops.push({
      type: 'carmilane_no_mix',
      message: 'Carmilane shades are oil-based intermediary pigments and cannot be mixed with other products. Use as a standalone treatment only.',
    });
  }

  // Cannot lift more than 4 levels from very dark in one session
  const levelDiff = input.targetLevel - input.currentLevel;
  if (levelDiff > 4 && input.currentLevel <= 4) {
    stops.push({
      type: 'excessive_lift_dark_base',
      message: `Lifting ${levelDiff} levels from a level ${input.currentLevel} base in one session risks severe damage and unpredictable results. A multi-session plan is required.`,
    });
  }

  // Cannot go lighter than level 10
  if (input.targetLevel > 10) {
    stops.push({
      type: 'level_out_of_range',
      message: 'Target level exceeds the maximum achievable level (10). Adjust your target.',
    });
  }

  // Highly damaged hair cannot safely undergo high-lift
  if (input.condition.type === 'highly_damaged' && levelDiff > 2) {
    stops.push({
      type: 'damaged_hair_high_lift',
      message: 'Highly damaged hair cannot safely undergo more than 2 levels of lift. A bond treatment and conditioning program must be completed first.',
    });
  }

  return stops;
}

// ─── Main Formulation Function ─────────────────────────────────────────────────

export function formulate(input: FormulationInput): FormulationResult {
  const notes: string[] = [];
  const warnings: string[] = [];

  // Determine developer
  const { volume, lift } = determineDeveloperVolume(input);

  // Check if lift is achievable
  const achievableLift = Math.min(lift, input.targetLevel - 1);
  if (input.targetLevel > input.currentLevel + achievableLift) {
    warnings.push(
      `Target level requires ${input.targetLevel - input.currentLevel} levels of lift, ` +
      `but only ${achievableLift} achievable in one session. Consider a two-step process.`
    );
  }

  // Warn if primary shade's UPT can't cover the gray percentage
  if (input.condition.grayPercent > 25) {
    const primaryForUPTCheck = findPrimaryColor(
      Math.min(input.targetLevel, 10),
      input.targetTone,
      input.brandPreference,
      input.linePreference
    );
    const uptCapacity = primaryForUPTCheck?.upt ?? 100;
    if (uptCapacity < input.condition.grayPercent) {
      warnings.push(
        `Selected color line has limited gray coverage capacity (${uptCapacity}% UPT). ` +
        `For ${input.condition.grayPercent}% gray, consider switching to a permanent color line for full coverage.`
      );
    }
  }

  // Find primary color
  let primary = findPrimaryColor(
    Math.min(input.targetLevel, 10),
    input.targetTone,
    input.brandPreference,
    input.linePreference
  );

  if (!primary) {
    return {
      success: false,
      steps: [],
      developerVolume: volume,
      developerMl: 0,
      totalMl: 0,
      processingTime: 0,
      application: 'all_over',
      coverage: 'full',
      notes: [],
      warnings: ['No matching color found. Try adjusting target level or tone.'],
      brand: input.brandPreference || 'Wella',
      line: input.linePreference || 'Koleston Perfect ME+',
    };
  }

  // ── Brand-to-brand conversion routing ──────────────────────────────────────
  // If the user has a brand preference and the algorithmic match is a different
  // brand, attempt a manufacturer-chart conversion to the preferred brand.
  if (input.brandPreference) {
    const preferredSlug = BRAND_TO_SLUG[input.brandPreference] ?? input.brandPreference.toLowerCase().replace(/\s+/g, '');
    const primarySlug = BRAND_TO_SLUG[primary.brand] ?? primary.brand.toLowerCase().replace(/\s+/g, '');
    if (primarySlug !== preferredSlug) {
      const conv = getManufacturerConversion(primarySlug, preferredSlug, primary.shadeCode);
      if (conv) {
        const converted = ALL_PRODUCTS.find(p =>
          p.shadeCode === conv.targetCode &&
          (BRAND_TO_SLUG[p.brand] ?? p.brand.toLowerCase().replace(/\s+/g, '')) === preferredSlug
        );
        if (converted) {
          notes.push(`Routed via manufacturer chart: ${primary.brand} ${primary.shadeCode} → ${converted.brand} ${converted.shadeCode} (confidence ${Math.round(conv.confidence * 100)}%)`);
          primary = converted;
        }
      }
    }
  }

  // ── Clamp developer volume to shade's allowed range ────────────────────────
  const allowedVolumes = parseDevVolumes(primary.developerRequired);
  let constrainedVolume = volume;
  if (allowedVolumes.length > 0 && !allowedVolumes.includes(volume)) {
    // Snap to nearest allowed volume
    constrainedVolume = allowedVolumes.reduce((prev, curr) =>
      Math.abs(curr - volume) < Math.abs(prev - volume) ? curr : prev
    );
    if (constrainedVolume !== volume) {
      warnings.push(`${primary.line} requires ${primary.developerRequired} — adjusted from ${volume} vol to ${constrainedVolume} vol`);
    }
  }
  const finalVolume = constrainedVolume;

  const steps: FormulationStep[] = [
    { product: primary, grams: 60, role: 'primary' },
  ];

  // Find secondary color
  const secondary = findSecondaryColor(input, primary);
  if (secondary) {
    steps.push({ product: secondary.product, grams: secondary.grams, role: 'secondary', notes: secondary.reason });
    notes.push(`Secondary ${secondary.product.shadeName}: ${secondary.reason}`);
  }

  // Add correctives/additives
  const additives = addCorrectiveAdditives(input, primary);
  for (const add of additives) {
    steps.push({ product: add.product, grams: add.grams, role: 'additive', notes: add.reason });
  }

  // Calculate totals
  const totalColorGrams = steps.reduce((sum, s) => sum + s.grams, 0);
  const mixingRatio = primary.mixingRatio || '1:1';
  const [colorPart, devPart] = mixingRatio.split(':').map(Number);
  const totalMl = Math.round(totalColorGrams * (devPart / colorPart));
  const developerMl = totalMl;

  // Processing time — line-aware base, then volume and condition adjustments
  const lineTiming = getLineProcessingTime(primary.line);
  let processingTime = lineTiming.base;
  if (finalVolume >= 40) processingTime += 10;
  else if (finalVolume >= 30) processingTime += 5;
  else if (finalVolume <= 10) processingTime -= 10;
  if (input.condition.type === 'damaged') processingTime -= 5;
  if (input.condition.type === 'highly_damaged') processingTime -= 5;
  processingTime = Math.max(lineTiming.min, Math.min(lineTiming.max, processingTime));

  // Application type
  let application: FormulationResult['application'] = 'all_over';
  if (input.condition.highlights) {
    application = input.condition.highlightedPercent && input.condition.highlightedPercent > 50
      ? 'foil'
      : 'balayage';
  }

  // Coverage
  let coverage: FormulationResult['coverage'] = 'full';
  if (input.condition.type === 'previously_colored' && input.condition.highlights) {
    coverage = 'partial';
  }

  // Notes
  if (input.condition.type === 'virgin') {
    notes.push('Virgin application: apply to midlengths and ends first, then roots');
  } else if (input.condition.type === 'previously_colored') {
    notes.push('Retouch application: apply to roots first, midlengths and ends for last 10 min');
  }
  if (input.condition.grayPercent > 25) {
    notes.push(`Gray coverage: ensure saturation of all gray areas, do not overlap previously colored sections`);
  }
  if (input.condition.porosity === 'high') {
    notes.push('High porosity: consider a bond builder additive and reduce processing time by 5 min');
  }
  notes.push(`${primary.brand} ${primary.line}: mix ${primary.mixingRatio} with ${finalVolume} vol developer`);
  notes.push(`Processing time: ${processingTime} minutes at room temperature`);

  // Assessment
  const liftAmount = input.targetLevel - input.currentLevel
  let assessment = `Hair has ${input.condition.type === 'virgin' ? 'virgin' : 'permanent'} level ${input.currentLevel} pigment. `
  if (liftAmount > 0) {
    assessment += `Level ${input.targetLevel} ${input.targetTone} result is ${liftAmount <= 3 ? 'achievable in one session' : 'ambitious and may require multiple sessions'}. `
  } else if (liftAmount === 0) {
    assessment += `Same-level ${input.targetTone} deposit — straightforward tonal shift. `
  } else {
    assessment += `Deposing ${Math.abs(liftAmount)} levels darker — straightforward deposit. `
  }
  if (input.condition.porosity === 'high') assessment += 'High porosity may cause faster fading and uneven absorption. '
  if (input.condition.grayPercent > 50) assessment += 'High gray percentage requires full coverage approach with lower-level anchor shade. '
  if (input.condition.highlights) assessment += 'Existing highlights create multi-zone porosity — consider zone-by-zone application. '

  // Build confidence adjustments for UI
  const confidenceAdjustments: ConfidenceAdjustment[] = []
  if (liftAmount > 3) confidenceAdjustments.push({ factor: 'high_lift', reduction: 0.25 })
  if (input.condition.porosity === 'high') confidenceAdjustments.push({ factor: 'high_porosity', reduction: 0.15 })
  if (input.condition.grayPercent > 50) confidenceAdjustments.push({ factor: 'high_gray', reduction: 0.10 })
  if (input.condition.highlights) confidenceAdjustments.push({ factor: 'existing_highlights', reduction: 0.10 })
  if (warnings.length > 0) confidenceAdjustments.push({ factor: 'warnings', reduction: Math.min(0.3, warnings.length * 0.08) })
  
  const baseConfidence = warnings.length === 0 ? 0.95 : Math.max(0.5, 0.90 - warnings.length * 0.08)
  const totalReduction = confidenceAdjustments.reduce((sum, a) => sum + a.reduction, 0)
  const adjustedConfidence = Math.max(0.3, baseConfidence - totalReduction)

  // Multi-session plan for ambitious lifts
  const multiSessionPlan: string[] = []
  if (liftAmount > 4) {
    multiSessionPlan.push(`Session 1: Pre-lighten to level ${input.currentLevel + 3} with bond builder`)
    multiSessionPlan.push(`Session 2: Lift to level ${input.targetLevel - 1} and tone`)
    multiSessionPlan.push(`Session 3: Final lift to ${input.targetLevel} ${input.targetTone} with gloss`)
  } else if (liftAmount > 3) {
    multiSessionPlan.push(`Session 1: Lift to level ${input.targetLevel - 1}`)
    multiSessionPlan.push(`Session 2: Final lift and tone to ${input.targetLevel} ${input.targetTone}`)
  }

  return {
    success: true,
    steps,
    developerVolume: finalVolume,
    developerMl,
    totalMl,
    processingTime,
    application,
    coverage,
    notes,
    warnings,
    brand: primary.brand,
    line: primary.line,
    assessment,
    underlyingPigment: { description: `Level ${input.targetLevel} will have ${input.targetLevel <= 5 ? 'red-orange to orange' : input.targetLevel <= 7 ? 'orange to yellow-orange' : 'yellow to pale yellow'} undertone` },
    quantity: { description: `${Math.ceil(totalColorGrams / 60)} color tube${Math.ceil(totalColorGrams / 60) > 1 ? 's' : ''} (2oz) + ${developerMl}oz developer` },
    confidence: Math.round(adjustedConfidence * 100),
    adjustedConfidence,
    confidenceAdjustments,
    strandTestRecommended: input.condition.porosity === 'high' || liftAmount > 3,
    hardStops: buildHardStops(input, primary),
    alternatives: [],
    multiSessionPlan: multiSessionPlan.length > 0 ? multiSessionPlan : undefined,
  };
}

// ─── Tone Mapping Helper ───────────────────────────────────────────────────────

export function getToneLabel(tone: ToneFamily): string {
  const labels: Record<ToneFamily, string> = {
    warm: 'Warm (W)',
    cool: 'Cool (C)',
    neutral: 'Natural/Neutral (N)',
    ash: 'Ash (A)',
    golden: 'Golden (G)',
    copper: 'Copper (C)',
    red: 'Red (R)',
    violet: 'Violet (V)',
    pearl: 'Pearl (P)',
    beige: 'Beige (B)',
    mahogany: 'Mahogany (M)',
    chocolate: 'Chocolate (Ch)',
  };
  return labels[tone] || tone;
}

export function getAllTones(): ToneFamily[] {
  return ['neutral', 'warm', 'cool', 'ash', 'golden', 'copper', 'red', 'violet', 'pearl', 'beige', 'mahogany', 'chocolate'];
}

export function getAllLevels(): Array<{ value: number; label: string }> {
  return Object.entries(HAIR_LEVELS).map(([value, info]) => ({
    value: Number(value),
    label: `${value} — ${info.name}`,
  }));
}
