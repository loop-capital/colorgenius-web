// Hair Color Formulation Engine
// Rules-based algorithm for professional color formulation

import { Product, ALL_PRODUCTS, HAIR_LEVELS, ToneFamily } from './products';

export interface HairCondition {
  type: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged';
  porosity: 'low' | 'normal' | 'high';
  grayPercent: number; // 0-100
  highlights: boolean;
  highlightedPercent?: number; // 0-100
}

export interface FormulationInput {
  currentLevel: number;
  currentTone: ToneFamily;
  targetLevel: number;
  targetTone: ToneFamily;
  condition: HairCondition;
  brandPreference?: string;
  linePreference?: string;
}

export interface FormulationStep {
  product: Product;
  grams: number;
  role: 'primary' | 'secondary' | 'additive' | 'corrective';
  notes?: string;
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
  
  // Gray coverage boost
  if (input.condition.grayPercent > 25) {
    return { volume: 20, lift: 1 };
  }

  // Lifting required
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

  // Deposit only (same level or darker)
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
    const brandMatch = !brand || p.brand === brand;
    const lineMatch = !line || p.line === line;
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
    const brandMatch = !brand || p.brand === brand;
    return levelMatch && toneMatch && brandMatch;
  });

  if (candidates.length > 0) return candidates[0];

  // Try same level, neutral
  candidates = ALL_PRODUCTS.filter(p => {
    const levelMatch = p.level === level;
    const toneMatch = p.tone === 'neutral';
    const brandMatch = !brand || p.brand === brand;
    return levelMatch && toneMatch && brandMatch;
  });

  return candidates[0] || null;
}

function findSecondaryColor(
  targetLevel: number,
  targetTone: ToneFamily,
  primaryTone: ToneFamily,
  brand: string,
  line: string
): Product | null {
  // Find complementary or enhancing shade
  // E.g., for golden at level 7, a secondary could be copper or a different golden

  const neutralizer = NEUTRALIZERS[targetTone];
  
  // If primary is warm, secondary can add depth
  if (targetTone === 'warm' || targetTone === 'golden') {
    const copper = ALL_PRODUCTS.find(p => 
      p.level === targetLevel && 
      (p.tone === 'copper' || p.secondaryTone === 'copper') &&
      p.brand === brand && p.line === line
    );
    if (copper) return copper;
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

  // Gray coverage: add N+ (neutral) for natural coverage
  if (input.condition.grayPercent > 25) {
    const neutral = ALL_PRODUCTS.find(p =>
      p.level === input.targetLevel &&
      p.tone === 'neutral' &&
      p.brand === primary.brand
    );
    if (neutral && neutral.id !== primary.id) {
      // Add ~20% neutral for gray blending
      additives.push({
        product: neutral,
        grams: Math.round(10 * (input.condition.grayPercent / 100)),
        reason: `Neutral base for gray coverage (${input.condition.grayPercent}% gray)`,
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

  // Find primary color
  const primary = findPrimaryColor(
    Math.min(input.targetLevel, 10),
    input.targetTone,
    input.brandPreference
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

  const steps: FormulationStep[] = [
    { product: primary, grams: 60, role: 'primary' },
  ];

  // Find secondary color
  const secondary = findSecondaryColor(
    input.targetLevel,
    input.targetTone,
    primary.tone,
    primary.brand,
    primary.line
  );
  if (secondary) {
    steps.push({ product: secondary, grams: 10, role: 'secondary' });
    notes.push(`Secondary ${secondary.shadeName} added for depth`);
  }

  // Add correctives/additives
  const additives = addCorrectiveAdditives(input, primary);
  for (const add of additives) {
    steps.push({ product: add.product, grams: add.grams, role: 'additive', notes: add.reason });
  }

  // Calculate totals
  const totalColorGrams = steps.reduce((sum, s) => sum + s.grams, 0);
  const mixingRatio = primary.mixingRatio || '1:1';
  const [colorPart] = mixingRatio.split(':').map(Number);
  const [devPart] = mixingRatio.split(':').map(Number);
  const totalMl = Math.round(totalColorGrams * (devPart / colorPart));
  const developerMl = totalMl;

  // Processing time
  let processingTime = 35;
  if (volume >= 30) processingTime = 45;
  if (volume <= 10) processingTime = 20;
  if (input.condition.type === 'damaged') processingTime = Math.max(20, processingTime - 5);

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
  notes.push(`${primary.brand} ${primary.line}: mix ${primary.mixingRatio} with ${volume} vol developer`);
  notes.push(`Processing time: ${processingTime} minutes at room temperature`);

  return {
    success: true,
    steps,
    developerVolume: volume,
    developerMl,
    totalMl,
    processingTime,
    application,
    coverage,
    notes,
    warnings,
    brand: primary.brand,
    line: primary.line,
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
