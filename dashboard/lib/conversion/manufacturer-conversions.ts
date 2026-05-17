// Manufacturer-provided conversion data (higher confidence than algorithmic)
// When a manufacturer mapping exists, use it instead of algorithmic matching.
// SOHO by MOB — 14 brand conversion charts
// CHI — 11 brand conversion charts

const sohoConversions = require('./soho-manufacturer-conversions.json');
const chiConversions = require('./chi-manufacturer-conversions.json');

export interface ManufacturerMapping {
  sourceBrand: string;
  targetBrand: string;
  sourceCode: string;
  targetCode: string;
  confidence: number; // Manufacturer data gets 0.95 confidence (near-exact, human verified)
}

// Map brand slugs (as used in the engine) to conversion chart keys in the JSON
const SOHO_BRAND_TO_CHART_KEY: Record<string, string | null> = {
  'kenra': 'kenra',
  'wella': 'wella-koleston',
  'wella-koleston': 'wella-koleston',
  'wella-illumina': 'wella-illumina',
  'paul-mitchell': 'paul-mitchell',
  'goldwell': 'goldwell-topchic',
  'goldwell-topchic': 'goldwell-topchic',
  'pravana': 'pravana-chromasilk',
  'pravana-chromasilk': 'pravana-chromasilk',
  'schwarzkopf': 'schwarzkopf-igora',
  'schwarzkopf-igora': 'schwarzkopf-igora',
  'loreal-pro': 'loreal-majirel',
  'loreal-majirel': 'loreal-majirel',
  'matrix': 'matrix-socolor',
  'matrix-socolor': 'matrix-socolor',
  'joico': 'joico-lumishine',
  'joico-lumishine': 'joico-lumishine',
  'kevin-murphy': 'kevin-murphy',
  'keune': 'keune-tinta',
  'keune-tinta': 'keune-tinta',
  'scruples': 'scruples',
  'framesi': 'framesi',
  // Brands with no SOHO chart — algorithmic fallback
  'oligo': null,
  'oligo-calura': null,
  'alfaparf': null,
  'aveda': null,
  'davines': null,
  'lanza': null,
  'moroccanoil': null,
  'pulp-riot': null,
  'redken': null,
  'r-color': null,
  'inoa': null,
  'diacolor': null,
  'dialight': null,
  'color-touch': null,
  'super-sync': null,
  'matrix-socolor-sync': null,
  'matrix-super-sync': null,
  'matrix-tonal-control': null,
  'tonal-control': null,
  'om-cor-color': null,
  'shinefinity': null,
  'chi': null,
};

// CHI brand to chart key mapping
const CHI_BRAND_TO_CHART_KEY: Record<string, string | null> = {
  'biosilk': 'biosilk',
  'redken-shades-eq': 'redken-shades-eq',
  'pm-shines': 'pm-shines',
  'paul-mitchell': 'pm-shines',
  'paul-mitchell-shines': 'pm-shines',
  'wella-charm': 'wella-charm',
  'wella': 'wella-charm',
  'joico': 'joico-lumishine',
  'joico-lumishine': 'joico-lumishine',
  'beth-minardi': 'beth-minardi',
  'miss-clairol': 'miss-clairol',
  'clairol': 'miss-clairol',
  'redken-color-gel': 'redken-color-gel',
  'redken-color-gels-lacquers': 'redken-color-gel',
  'redken-fusion': 'redken-fusion',
  'chi-ionic-shine': 'chi-ionic-shine',
  'chi-ionic-permanent': 'chi-ionic-permanent',
  // Brands with no CHI chart
  'kenra': null,
  'schwarzkopf': null,
  'loreal-pro': null,
  'matrix': null,
  'pravana': null,
  'oligo': null,
  'alfaparf': null,
  'aveda': null,
  'davines': null,
  'lanza': null,
  'moroccanoil': null,
  'pulp-riot': null,
  'r-color': null,
  'soho': null,
  'om-cor-color': null,
  'shinefinity': null,
  'inoa': null,
  'diacolor': null,
  'dialight': null,
  'color-touch': null,
  'super-sync': null,
  'matrix-socolor-sync': null,
  'matrix-super-sync': null,
  'matrix-tonal-control': null,
  'tonal-control': null,
};

/**
 * Look up a manufacturer-provided conversion.
 * Returns the target shade code + confidence if a mapping exists, or null.
 *
 * Priority rules:
 * 1. If sourceBrand === 'soho' → forward lookup in SOHO charts
 * 2. If targetBrand === 'soho' → reverse lookup in SOHO charts
 * 3. If sourceBrand === 'chi' → forward lookup in CHI charts
 * 4. If targetBrand === 'chi' → reverse lookup in CHI charts
 * 5. Otherwise → no manufacturer mapping available
 */
export function getManufacturerConversion(
  sourceBrand: string,
  targetBrand: string,
  sourceCode: string
): { targetCode: string; confidence: number } | null {
  // Guard against undefined brands (e.g. mock objects in tests)
  if (!sourceBrand || !targetBrand) return null;

  // Normalise slugs
  const src = sourceBrand.toLowerCase().trim();
  const tgt = targetBrand.toLowerCase().trim();

  // ── Forward: SOHO → Other brand ──
  if (src === 'soho') {
    const chartKey = SOHO_BRAND_TO_CHART_KEY[tgt];
    if (!chartKey) return null;

    const charts = (sohoConversions as any).charts;
    const chart = charts[chartKey];
    if (!chart) return null;

    const targetCode = chart.mappings[sourceCode];
    if (!targetCode || targetCode === 'X') return null;

    return { targetCode, confidence: 0.95 };
  }

  // ── Reverse: Other brand → SOHO ──
  if (tgt === 'soho') {
    const chartKey = SOHO_BRAND_TO_CHART_KEY[src];
    if (!chartKey) return null;

    const charts = (sohoConversions as any).charts;
    const chart = charts[chartKey];
    if (!chart) return null;

    // Reverse lookup: find SOHO code whose mapping equals the source code
    for (const [sohoCode, mappedCode] of Object.entries(chart.mappings)) {
      if (mappedCode === sourceCode && mappedCode !== 'X') {
        return { targetCode: sohoCode, confidence: 0.95 };
      }
    }
    return null;
  }

  // ── Forward: CHI → Other brand ──
  if (src === 'chi') {
    const chartKey = CHI_BRAND_TO_CHART_KEY[tgt];
    if (!chartKey) return null;

    const charts = (chiConversions as any).charts;
    const chart = charts[chartKey];
    if (!chart) return null;

    const targetCode = chart.mappings[sourceCode];
    if (!targetCode || targetCode === 'X') return null;

    return { targetCode, confidence: 0.95 };
  }

  // ── Reverse: Other brand → CHI ──
  if (tgt === 'chi') {
    const chartKey = CHI_BRAND_TO_CHART_KEY[src];
    if (!chartKey) return null;

    const charts = (chiConversions as any).charts;
    const chart = charts[chartKey];
    if (!chart) return null;

    // Reverse lookup: find CHI code whose mapping equals the source code
    for (const [chiCode, mappedCode] of Object.entries(chart.mappings)) {
      if (mappedCode === sourceCode && mappedCode !== 'X') {
        return { targetCode: chiCode, confidence: 0.95 };
      }
    }
    return null;
  }

  // No manufacturer mapping for non-SOHO/CHI conversions
  return null;
}

/**
 * Check whether a given brand pair is supported by manufacturer charts.
 */
export function hasManufacturerMapping(
  sourceBrand: string,
  targetBrand: string
): boolean {
  const src = sourceBrand.toLowerCase().trim();
  const tgt = targetBrand.toLowerCase().trim();

  if (src === 'soho') {
    return SOHO_BRAND_TO_CHART_KEY[tgt] !== null && SOHO_BRAND_TO_CHART_KEY[tgt] !== undefined;
  }
  if (tgt === 'soho') {
    return SOHO_BRAND_TO_CHART_KEY[src] !== null && SOHO_BRAND_TO_CHART_KEY[src] !== undefined;
  }
  if (src === 'chi') {
    return CHI_BRAND_TO_CHART_KEY[tgt] !== null && CHI_BRAND_TO_CHART_KEY[tgt] !== undefined;
  }
  if (tgt === 'chi') {
    return CHI_BRAND_TO_CHART_KEY[src] !== null && CHI_BRAND_TO_CHART_KEY[src] !== undefined;
  }
  return false;
}

/**
 * List all brand slugs that have a SOHO conversion chart.
 */
export function getSupportedSOHOBrands(): string[] {
  return Object.entries(SOHO_BRAND_TO_CHART_KEY)
    .filter(([_, v]) => v !== null)
    .map(([k]) => k);
}

/**
 * List all brand slugs that have a CHI conversion chart.
 */
export function getSupportedCHIBrands(): string[] {
  return Object.entries(CHI_BRAND_TO_CHART_KEY)
    .filter(([_, v]) => v !== null)
    .map(([k]) => k);
}
