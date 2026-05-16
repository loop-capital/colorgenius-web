// Brand Conversion Engine — Shared Types
// ADR-015: Brand Conversion System

export type ToneFamily =
  | 'natural'
  | 'ash'
  | 'blue-ash'
  | 'green-ash'
  | 'gold'
  | 'copper'
  | 'red'
  | 'violet'
  | 'pearl'
  | 'beige'
  | 'mahogany'
  | 'chocolate'
  | 'warm'
  | 'matte'
  | 'rose'
  | 'cool'
  | 'specialty';

export interface NormalizedShade {
  code: string;
  brand: string;
  line: string;
  level: number;
  toneFamily: ToneFamily;
  toneCode: string;
  name: string;
  hex: string;
  isHighLift: boolean;
  isDemi: boolean;
  grayCoverage: string | null;
}

export interface BrandSpecs {
  brand: string;
  productLine?: string;
  type?: string;
  mixRatio?: string;
  processingTime?: string;
  grayProcessingTime?: string;
  developers?: Array<{
    volume: number;
    percentage?: string;
    use: string;
  }>;
  developerVolumes?: number[];
  volumeSemantics?: Record<string, string>;
  lines?: Array<{
    name: string;
    type?: string;
    mixRatio?: string;
    developerVolumes?: number[];
    processingTime?: string;
  }>;
  formulationGuidelines?: {
    lift_guidelines?: Record<string, string>;
    gray_coverage?: Record<string, string>;
    mixing_ratios?: Record<string, string>;
    processing_times?: Record<string, string>;
    tonal_direction?: Record<string, string[]>;
  };
  grayCoverage?: {
    requiresNN?: boolean;
    recommendedVolume?: number;
    processingTimeAdd?: number;
  };
}

export interface ToneFamilyMap {
  universalFamilies: string[];
  [brand: string]: string[] | Record<string, string>;
}

export interface ConversionRequest {
  shades: Array<{
    shadeCode: string;
    brand: string;
    line: string;
    grams: number;
  }>;
  targetBrand: string;
  targetLine?: string;
  developerVolume: number;
}

export type MatchType = 'exact' | 'close' | 'level-adjusted' | 'weak';

export interface ConversionResult {
  shades: Array<{
    originalCode: string;
    originalBrand: string;
    convertedCode: string;
    convertedBrand: string;
    convertedLine: string;
    convertedName: string;
    convertedHex: string;
    grams: number;
    confidence: number;
    matchType: MatchType;
    notes?: string;
  }>;
  developer: {
    originalVolume: number;
    convertedVolume: number;
    mixingRatio: string;
    notes?: string;
  };
  overallConfidence: number;
  hardStops: string[];
  warnings: string[];
}

// Adjacent tone families per ADR-015 §3.3
export const ADJACENT_TONES: Record<ToneFamily, ToneFamily[]> = {
  natural: ['warm', 'beige'],
  ash: ['blue-ash', 'matte', 'pearl'],
  'blue-ash': ['ash', 'violet'],
  'green-ash': ['ash', 'matte'],
  gold: ['warm', 'copper', 'beige'],
  copper: ['gold', 'red', 'mahogany'],
  red: ['copper', 'mahogany', 'rose'],
  violet: ['blue-ash', 'pearl', 'rose'],
  pearl: ['ash', 'violet', 'beige'],
  beige: ['natural', 'gold', 'pearl'],
  mahogany: ['copper', 'red', 'chocolate'],
  chocolate: ['mahogany', 'warm'],
  warm: ['natural', 'gold', 'chocolate'],
  matte: ['ash'],
  rose: ['red', 'violet'],
  cool: ['ash', 'blue-ash'],
  specialty: [],
};

// Developer intent mapping by volume
export const DEVELOPER_INTENT: Record<number, string> = {
  5: 'deposit',
  10: 'deposit',
  13: 'deposit',
  15: 'deposit',
  20: '1-2lift',
  25: '1-2lift',
  30: '2-3lift',
  40: '3-4lift',
  50: '4+lift',
};

// Convert any developer volume to semantic intent
export function getDeveloperIntent(volume: number): string {
  // Exact match
  if (DEVELOPER_INTENT[volume]) return DEVELOPER_INTENT[volume];
  // Find closest
  const volumes = Object.keys(DEVELOPER_INTENT).map(Number).sort((a, b) => a - b);
  for (const v of volumes) {
    if (v >= volume) return DEVELOPER_INTENT[v];
  }
  return DEVELOPER_INTENT[volumes[volumes.length - 1]] || 'deposit';
}
