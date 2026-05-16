// Brand Conversion Engine — Data Loader
// Loads normalized shade data, brand specs, and tone family map.
// ADR-015 §4 — Server-only module (not for client components)

import type { NormalizedShade, BrandSpecs, ToneFamilyMap } from './types';

// Static imports — resolved at build time
import schwarzkopfShades from '../../data/brands/schwarzkopf-shades.json';
import moroccanoilShades from '../../data/brands/moroccanoil-shades.json';
import lanzaShades from '../../data/brands/lanza-shades.json';
import davinesShades from '../../data/brands/davines-shades.json';
import avedaShades from '../../data/brands/aveda-shades.json';
import oligoShades from '../../data/brands/oligo-calura-shades.json';
import lorealproDiacolorShades from '../../data/brands/diacolor-shades.json';
import lorealproDialightShades from '../../data/brands/dialight-shades.json';
import lorealproInoaShades from '../../data/brands/inoa-shades.json';
import lorealproMajirelShades from '../../data/brands/majirel-shades.json';
import kevinmurphyShades from '../../data/brands/color-me-shades.json';
import wellaColorTouchShades from '../../data/brands/color-touch-shades.json';
import wellaIlluminaShades from '../../data/brands/illumina-shades.json';
import wellaShinefinityShades from '../../data/brands/shinefinity-shades.json';
import redkenColorGelsShades from '../../data/brands/redken/color-gels-lacquers-shades.json';
import redkenShadesEQShades from '../../data/brands/redken/shades-eq-shades.json';
import joicoLumishinePermanentShades from '../../data/brands/joico/lumishine-permanent-shades.json';
import joicoLumishineDemiLiquidShades from '../../data/brands/joico/lumishine-demi-liquid-shades.json';
import joicoLumishineDimensionalDepositShades from '../../data/brands/joico/lumishine-dimensional-deposit-shades.json';
import matrixSoColorShades from '../../data/brands/matrix-socolor-shades.json';
import matrixSoColorSyncShades from '../../data/brands/matrix-socolor-sync-shades.json';
import matrixSuperSyncShades from '../../data/brands/matrix-super-sync-shades.json';
import matrixTonalControlShades from '../../data/brands/matrix-tonal-control-shades.json';
import pravanaChromaSilkShades from '../../data/brands/pravana/chromasilk-shades.json';
import pravanaVividsShades from '../../data/brands/pravana/vivids-shades.json';
import kenraPermanentShades from '../../data/brands/kenra/kenra-permanent-shades.json';
import kenraDemiPermanentShades from '../../data/brands/kenra/kenra-demi-permanent-shades.json';
import kenraSimplyBlondeShades from '../../data/brands/kenra/simply-blonde.json';
import kenraSpecs from '../../data/brands/kenra/kenra-specs.json';
import schwarzkopfSpecs from '../../data/brands/schwarzkopf-specs.json';
import moroccanoilSpecs from '../../data/brands/moroccanoil-specs.json';
import lanzaSpecs from '../../data/brands/lanza-specs.json';
import davinesSpecs from '../../data/brands/davines-specs.json';
import avedaSpecs from '../../data/brands/aveda-specs.json';
import oligoSpecs from '../../data/brands/oligo-specs.json';
import lorealproSpecs from '../../data/brands/loreal-pro-specs.json';
import kevinmurphySpecs from '../../data/brands/kevin-murphy-specs.json';
import wellaSpecs from '../../data/brands/wella-specs.json';
import redkenColorGelsSpecs from '../../data/brands/redken/color-gels-lacquers-specs.json';
import redkenShadesEQSpecs from '../../data/brands/redken/shades-eq-specs.json';
import joicoLumishinePermanentSpecs from '../../data/brands/joico/lumishine-permanent-specs.json';
import matrixSoColorSpecs from '../../data/brands/matrix-socolor-specs.json';
import pravanaChromaSilkSpecs from '../../data/brands/pravana/chromasilk-specs.json';
import toneFamilyMapData from '../../data/brands/tone-family-map.json';

const shadeData: Record<string, NormalizedShade[]> = {
  schwarzkopf: schwarzkopfShades as unknown as NormalizedShade[],
  moroccanoil: moroccanoilShades as unknown as NormalizedShade[],
  lanza: lanzaShades as unknown as NormalizedShade[],
  davines: davinesShades as unknown as NormalizedShade[],
  aveda: avedaShades as unknown as NormalizedShade[],
  oligo: oligoShades as unknown as NormalizedShade[],
  lorealpro: [
    ...(lorealproDiacolorShades as unknown as NormalizedShade[]),
    ...(lorealproDialightShades as unknown as NormalizedShade[]),
    ...(lorealproInoaShades as unknown as NormalizedShade[]),
    ...(lorealproMajirelShades as unknown as NormalizedShade[]),
  ],
  kevinmurphy: kevinmurphyShades as unknown as NormalizedShade[],
  wella: [
    ...(wellaColorTouchShades as unknown as NormalizedShade[]),
    ...(wellaIlluminaShades as unknown as NormalizedShade[]),
    ...(wellaShinefinityShades as unknown as NormalizedShade[]),
  ],
  redken: [
    ...(redkenColorGelsShades as unknown as NormalizedShade[]),
    ...(redkenShadesEQShades as unknown as NormalizedShade[]),
  ],
  joico: [
    ...(joicoLumishinePermanentShades as unknown as NormalizedShade[]),
    ...(joicoLumishineDemiLiquidShades as unknown as NormalizedShade[]),
    ...(joicoLumishineDimensionalDepositShades as unknown as NormalizedShade[]),
  ],
  matrix: [
    ...(matrixSoColorShades as unknown as NormalizedShade[]),
    ...(matrixSoColorSyncShades as unknown as NormalizedShade[]),
    ...(matrixSuperSyncShades as unknown as NormalizedShade[]),
    ...(matrixTonalControlShades as unknown as NormalizedShade[]),
  ],
  pravana: [
    ...(pravanaChromaSilkShades as unknown as NormalizedShade[]),
    ...(pravanaVividsShades as unknown as NormalizedShade[]),
  ],
  kenra: [
    ...(kenraPermanentShades as unknown as NormalizedShade[]),
    ...(kenraDemiPermanentShades as unknown as NormalizedShade[]),
    ...(kenraSimplyBlondeShades.toners as unknown as NormalizedShade[]),
  ],
};

const specsData: Record<string, BrandSpecs> = {
  schwarzkopf: schwarzkopfSpecs as unknown as BrandSpecs,
  moroccanoil: moroccanoilSpecs as unknown as BrandSpecs,
  lanza: lanzaSpecs as unknown as BrandSpecs,
  davines: davinesSpecs as unknown as BrandSpecs,
  aveda: avedaSpecs as unknown as BrandSpecs,
  oligo: oligoSpecs as unknown as BrandSpecs,
  lorealpro: lorealproSpecs as unknown as BrandSpecs,
  kevinmurphy: kevinmurphySpecs as unknown as BrandSpecs,
  wella: wellaSpecs as unknown as BrandSpecs,
  redken: redkenColorGelsSpecs as unknown as BrandSpecs,
  joico: joicoLumishinePermanentSpecs as unknown as BrandSpecs,
  matrix: matrixSoColorSpecs as unknown as BrandSpecs,
  pravana: pravanaChromaSilkSpecs as unknown as BrandSpecs,
  kenra: kenraSpecs as unknown as BrandSpecs,
};

const BRAND_NAMES: Record<string, string> = {
  schwarzkopf: 'Schwarzkopf Professional',
  moroccanoil: 'MoroccanOil',
  lanza: "L'ANZA",
  davines: 'Davines',
  aveda: 'Aveda',
  oligo: 'Oligo Calura',
  lorealpro: "L'Oréal Professionnel",
  kevinmurphy: 'Kevin Murphy COLOR.ME',
  wella: 'Wella Professionals',
  redken: 'Redken',
  joico: 'Joico',
  matrix: 'Matrix',
  pravana: 'Pravana',
  kenra: 'Kenra Professional',
};

export function loadBrandShades(brand: string): NormalizedShade[] {
  return shadeData[brand] || [];
}

export function loadBrandSpecs(brand: string): BrandSpecs | null {
  return specsData[brand] || null;
}

export function loadToneFamilyMap(): ToneFamilyMap {
  return toneFamilyMapData as unknown as ToneFamilyMap;
}

export function getAllBrands(): string[] {
  return Object.keys(shadeData);
}

export function getBrandDisplayName(brand: string): string {
  return BRAND_NAMES[brand] || brand;
}

export function findShadeByCode(brand: string, shadeCode: string): NormalizedShade | null {
  const shades = loadBrandShades(brand);
  return shades.find(s => s.code === shadeCode || s.code === shadeCode.replace(/-/g, '.')) || null;
}

export function getPreferredLine(brand: string): string {
  const specs = loadBrandSpecs(brand);
  if (!specs || !specs.lines) return '';
  const permanentLines = specs.lines.filter((l: any) => l.type === 'permanent');
  return permanentLines.length > 0 ? permanentLines[0].name : (specs.lines[0]?.name || '');
}
