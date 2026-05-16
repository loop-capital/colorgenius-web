// Brand Conversion Engine — Barrel Export (Server-Only)
// Client components should NOT import from here directly.
// Use API routes instead.

export * from './types';
export type {
  NormalizedShade,
  BrandSpecs,
  ToneFamilyMap,
  ConversionRequest,
  ConversionResult,
  MatchType,
} from './types';

export {
  convertShade,
  convertDeveloper,
  getMixingRatio,
  calculateMixingAmounts,
  convertShadeComponent,
  convertFormula,
  findEquivalents,
} from './engine';

export {
  getToneFamily,
  getBrandToneCodes,
  hasToneMapping,
  getMappedBrands,
  getCodesForFamily,
} from './tone-family-mappings';
