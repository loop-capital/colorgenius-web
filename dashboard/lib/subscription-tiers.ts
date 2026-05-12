// =====================================================
// SUBSCRIPTION TIER CONFIGURATION
// All pricing in cents. Replace placeholders when
// Tiche finalizes salon rates.
// =====================================================

export const AVAILABLE_BRANDS: Record<string, string[]> = {
  'Aveda': ['Full Spectrum™'],
  'Wella': ['Koleston Perfect ME+', 'Color Touch', 'Illumina Color', 'Color Touch Plus'],
  'Redken': ['Color Gels Lacquers', 'Shades EQ', 'Chromatics', 'Cover Fusion'],
  'Schwarzkopf': ['Igora Royal', 'Igora Vibrance', 'BlondMe', 'IGORA VIBRANCE'],
  'Matrix': ['SoColor', 'Color Sync', 'SoColor Cult', 'Light Master'],
  'Goldwell': ['Topchic', 'Colorance', 'Nectaya', 'Elumen'],
  'Davines': ['View', 'A New Colour', 'Mask with Vibrachrom'],
  'Joico': ['LumiShine', 'Vero K-PAK', 'Color Intensity', 'LumiShine XG'],
  'Paul Mitchell': ['The Color', 'PM Shines', 'XG', 'SynchroLift'],
  'Pulp Riot': ['FACTION8', 'Semi-Permanent', 'Blush', 'Neon'],
  "L'ANZA": ['Healing Color', 'Decolorizer'],
}

export const BRAND_LIST = Object.keys(AVAILABLE_BRANDS)

// Total unique lines across all brands
export const TOTAL_LINES = Object.values(AVAILABLE_BRANDS).reduce((sum, lines) => sum + lines.length, 0)

export interface TierConfig {
  id: string
  label: string
  description: string
  monthlyPriceCents: number
  extraLinePriceCents: number
  maxBrands: number
  maxLines: number
  maxProfessionals: number
  isPlaceholder: boolean
}

export const TIERS: Record<string, TierConfig> = {
  trial: {
    id: 'trial',
    label: 'Free Trial',
    description: '30 days — 1 brand, 1 color line',
    monthlyPriceCents: 0,
    extraLinePriceCents: 0,
    maxBrands: 1,
    maxLines: 1,
    maxProfessionals: 1,
    isPlaceholder: false,
  },
  solo: {
    id: 'solo',
    label: 'Solo Stylist',
    description: '$25/month — 1 brand, up to 3 lines',
    monthlyPriceCents: 2500,
    extraLinePriceCents: 1000,
    maxBrands: 1,
    maxLines: 3,
    maxProfessionals: 1,
    isPlaceholder: false,
  },
  salon_small: {
    id: 'salon_small',
    label: 'Salon (2-3 pros)',
    description: 'Pricing TBD — contact us',
    monthlyPriceCents: 0,  // TODO: Tiche
    extraLinePriceCents: 0, // TODO: Tiche
    maxBrands: 2,
    maxLines: 5,
    maxProfessionals: 3,
    isPlaceholder: true,
  },
  salon_medium: {
    id: 'salon_medium',
    label: 'Salon (4-7 pros)',
    description: 'Pricing TBD — contact us',
    monthlyPriceCents: 0,  // TODO: Tiche
    extraLinePriceCents: 0, // TODO: Tiche
    maxBrands: 3,
    maxLines: 8,
    maxProfessionals: 7,
    isPlaceholder: true,
  },
  salon_large: {
    id: 'salon_large',
    label: 'Salon (8+ pros)',
    description: 'Pricing TBD — contact us',
    monthlyPriceCents: 0,  // TODO: Tiche
    extraLinePriceCents: 0, // TODO: Tiche
    maxBrands: 5,
    maxLines: 12,
    maxProfessionals: 999,
    isPlaceholder: true,
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    description: 'Custom pricing — unlimited',
    monthlyPriceCents: 0,  // TODO: Tiche
    extraLinePriceCents: 0,
    maxBrands: 999,
    maxLines: 999,
    maxProfessionals: 999,
    isPlaceholder: true,
  },
}

export function getTierConfig(tier: string): TierConfig {
  return TIERS[tier] || TIERS.trial
}

export function countLinesInBrands(selectedBrands: Record<string, string[]>): number {
  return Object.values(selectedBrands).reduce((sum, lines) => sum + lines.length, 0)
}

export function validateBrandsSelection(
  selectedBrands: Record<string, string[]>,
  tier: string
): { valid: boolean; error?: string } {
  const config = getTierConfig(tier)
  const brandCount = Object.keys(selectedBrands).length
  const lineCount = countLinesInBrands(selectedBrands)

  if (brandCount > config.maxBrands) {
    return {
      valid: false,
      error: `${config.label} allows up to ${config.maxBrands} brand${config.maxBrands === 1 ? '' : 's'}. You selected ${brandCount}.`,
    }
  }

  if (lineCount > config.maxLines) {
    return {
      valid: false,
      error: `${config.label} allows up to ${config.maxLines} line${config.maxLines === 1 ? '' : 's'}. You selected ${lineCount}.`,
    }
  }

  return { valid: true }
}

// Map professionals count to tier
export function getTierByProfessionals(count: number): string {
  if (count <= 1) return 'solo'
  if (count <= 3) return 'salon_small'
  if (count <= 7) return 'salon_medium'
  return 'salon_large'
}
