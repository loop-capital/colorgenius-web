// Professional Hair Color Product Database
// Maps brand-specific shade codes to universal color levels (1-10) and tones
// Now bridged with conversion DB for 21 brands + hand-curated overrides for 10 brands

import type { NormalizedShade } from './conversion/types';
import {
  getAllBrands,
  loadBrandShades,
  loadBrandSpecs,
  getBrandDisplayName,
} from './conversion/data-loader';

export type ToneFamily =
  | 'warm' | 'cool' | 'neutral' | 'ash'
  | 'golden' | 'copper' | 'red' | 'violet'
  | 'pearl' | 'beige' | 'mahogany' | 'chocolate';

export type LevelRange = { min: number; max: number };

export interface Product {
  id: string;
  brand: string;
  line: string;
  shadeCode: string;
  shadeName: string;
  level: number;          // 1 (black) to 10 (lightest blonde)
  tone: ToneFamily;
  secondaryTone?: ToneFamily;
  mixingRatio: string;    // e.g. "1:1", "1:2"
  developerRequired: string;
  upt?: number;           // units of per thousand (gray coverage)
  volumeNote?: string;
}

// ─── TONE FAMILY MAPPING ─────────────────────────────────────────────────────
// Maps conversion DB ToneFamily values to Product ToneFamily values

const TONE_MAP: Record<string, ToneFamily> = {
  'natural': 'neutral',
  'ash': 'ash',
  'blue-ash': 'ash',
  'green-ash': 'ash',
  'gold': 'golden',
  'copper': 'copper',
  'red': 'red',
  'violet': 'violet',
  'pearl': 'pearl',
  'beige': 'beige',
  'mahogany': 'mahogany',
  'chocolate': 'chocolate',
  'warm': 'warm',
  'matte': 'ash',
  'rose': 'red',
  'cool': 'cool',
  'specialty': 'neutral',
};

function mapToneFamily(tf: string): ToneFamily {
  return TONE_MAP[tf] || 'neutral';
}

// ─── DEVELOPER FORMATTER ─────────────────────────────────────────────────────
// Converts developer arrays from BrandSpecs to a human-readable string

function formatDeveloper(specs: any): string {
  if (!specs || !specs.developers) return '20 vol';
  const devs = specs.developers;
  if (Array.isArray(devs)) {
    const volumes = devs.map((d: any) => d.volume).filter((v: any) => typeof v === 'number');
    if (volumes.length === 0) return '20 vol';
    const min = Math.min(...volumes);
    const max = Math.max(...volumes);
    return min === max ? `${min} vol` : `${min}-${max} vol`;
  }
  // Some brands nest under an object like { volume: number, ... }
  if (typeof devs === 'object' && devs !== null) {
    const nested = devs.developerVolumes || devs.volumes;
    if (Array.isArray(nested)) {
      const min = Math.min(...nested);
      const max = Math.max(...nested);
      return min === max ? `${min} vol` : `${min}-${max} vol`;
    }
  }
  return '20 vol';
}

// ─── LINE UPT LOOKUP ─────────────────────────────────────────────────────────
// Maps known product line keywords to gray-coverage UPT (0-100).
// Permanent color = 100, demi-permanent = 50, semi/toner/gloss = 0.
const LINE_UPT_MAP: Array<{ pattern: RegExp; upt: number }> = [
  // Demi-permanents (developer activates but no lift, limited gray coverage)
  { pattern: /color touch|shades eq|colorync|majirel glow|vibrancy|dialight|acidic color gloss|shinefinity|color balance|ilumina/i, upt: 50 },
  // Semi-permanent / toners / glosses (zero gray coverage)
  { pattern: /gloss|toner|semi.?permanent|direct dye|pastel|neon|vivid|chromatics overlay/i, upt: 0 },
  // Everything else assumed permanent
];

function getLineUPT(lineName: string, grayCoverage?: boolean): number {
  for (const { pattern, upt } of LINE_UPT_MAP) {
    if (pattern.test(lineName)) return upt;
  }
  return grayCoverage === false ? 0 : 100;
}

// ─── SLUGIFY ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── BRIDGE: NormalizedShade → Product ───────────────────────────────────────

function shadeToProduct(shade: NormalizedShade, brandKey: string, specs: any): Product {
  const displayName = getBrandDisplayName(brandKey);
  const id = `${slugify(displayName)}-${slugify(shade.line)}-${slugify(shade.code)}`;

  // Mixing ratio from specs
  let mixRatio = specs?.mixRatio || specs?.lines?.find((l: any) => l.name === shade.line)?.mixRatio || '1:1';

  // Developer from specs
  let developer = formatDeveloper(specs);

  // UPT: line-aware gray coverage capacity (permanent=100, demi=50, semi/toner=0)
  const grayCoverageFlag = shade.grayCoverage !== null ? shade.grayCoverage !== 'none' : undefined;
  const upt = getLineUPT(shade.line, grayCoverageFlag);

  return {
    id,
    brand: displayName,
    line: shade.line,
    shadeCode: shade.code,
    shadeName: shade.name,
    level: shade.level,
    tone: mapToneFamily(shade.toneFamily),
    secondaryTone: undefined,
    mixingRatio: mixRatio,
    developerRequired: developer,
    upt,
    volumeNote: null as any,
  };
}

// ─── UNIVERSAL HAIR COLOR LEVELS ──────────────────────────────────────────────

export const HAIR_LEVELS: Record<number, { name: string; hex: string }> = {
  1:  { name: 'Black',       hex: '#09080D' },
  2:  { name: 'Darkest Brown', hex: '#1C1008' },
  3:  { name: 'Dark Brown',   hex: '#3B2320' },
  4:  { name: 'Medium Brown', hex: '#5C3A28' },
  5:  { name: 'Light Brown',  hex: '#7D5038' },
  6:  { name: 'Dark Blonde',  hex: '#9C6B40' },
  7:  { name: 'Medium Blonde', hex: '#C08C5A' },
  8:  { name: 'Light Blonde',  hex: '#D4AA7D' },
  9:  { name: 'Very Light Blonde', hex: '#E8C99B' },
  10: { name: 'Lightest Blonde',  hex: '#F5E6D3' },
};

// Universal tone descriptors
export const TONE_DESCRIPTORS: Record<ToneFamily, string> = {
  warm:    'Golden, warm, sunny',
  cool:    'Cool, smoky, sophisticated',
  neutral: 'Balanced, natural, clear',
  ash:     'Muted, cool grey-brown',
  golden:  'Rich gold, honey, amber',
  copper:  'Vibrant copper, auburn',
  red:     'Deep red, burgundy, cherry',
  violet:  'Cool violet, iris, plum',
  pearl:   'Iridescent, pastel, silvery',
  beige:   'Warm beige, nude, sand',
  mahogany:'Deep brown-red, chocolate',
  chocolate:'Rich brown, espresso',
};

// ─── HAND-CURATED PRODUCTS (10 brands — take priority over auto-generated) ───

// ─── WELLA PRODUCTS ────────────────────────────────────────────────────────────
const wellaProducts: Product[] = [
  // Koleston Perfect ME+ — Level lines
  { id: 'wella-kol-1', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '1/0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-2', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '2/0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-3', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '3/0', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-4', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '4/0', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-5', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '5/0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '6/0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '7/0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-8', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '8/0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-9', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '9/0', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-10', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '10/0', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '10-20 vol', upt: 100 },
  // Wella Golden tones
  { id: 'wella-kol-4g', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '4/73', shadeName: 'Medium Brown Golden', level: 4, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-5g', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '5/73', shadeName: 'Light Brown Golden', level: 5, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6g', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '6/73', shadeName: 'Dark Blonde Golden', level: 6, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7g', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '7/73', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-8g', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '8/73', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  // Wella Ash tones
  { id: 'wella-kol-4a', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '4/81', shadeName: 'Medium Brown Ash', level: 4, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-5a', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '5/81', shadeName: 'Light Brown Ash', level: 5, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6a', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '6/81', shadeName: 'Dark Blonde Ash', level: 6, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7a', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '7/81', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-8a', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '8/81', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  // Wella Red/Copper tones
  { id: 'wella-kol-5r', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '5/60', shadeName: 'Light Brown Red', level: 5, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6r', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '6/60', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7r', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '7/60', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-6rc', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '6/65', shadeName: 'Dark Blonde Copper Rose', level: 6, tone: 'copper', secondaryTone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7rc', brand: 'Wella Professionals', line: 'Koleston Perfect ME+', shadeCode: '7/46', shadeName: 'Medium Blonde Copper', level: 7, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  // Wella Color Touch
  { id: 'wella-ct-5', brand: 'Wella Professionals', line: 'Color Touch', shadeCode: '5/0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-6', brand: 'Wella Professionals', line: 'Color Touch', shadeCode: '6/0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-7', brand: 'Wella Professionals', line: 'Color Touch', shadeCode: '7/0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-7g', brand: 'Wella Professionals', line: 'Color Touch', shadeCode: '7/73', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-8g', brand: 'Wella Professionals', line: 'Color Touch', shadeCode: '8/0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
];

// ─── DAVINES PRODUCTS ─────────────────────────────────────────────────────────
const davinesProducts: Product[] = [
  // Davines A New Colour (Ammonia-free permanent) — 1:1.5 ratio
  { id: 'davines-anc-1', brand: 'Davines', line: 'A New Colour', shadeCode: '1.0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-2', brand: 'Davines', line: 'A New Colour', shadeCode: '2.0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-3', brand: 'Davines', line: 'A New Colour', shadeCode: '3.0', shadeName: 'Very Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-4', brand: 'Davines', line: 'A New Colour', shadeCode: '4.0', shadeName: 'Dark Brown', level: 4, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-5', brand: 'Davines', line: 'A New Colour', shadeCode: '5.0', shadeName: 'Brown', level: 5, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-6', brand: 'Davines', line: 'A New Colour', shadeCode: '6.0', shadeName: 'Dark Brown', level: 6, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-7', brand: 'Davines', line: 'A New Colour', shadeCode: '7.0', shadeName: 'Light Brown', level: 7, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-8', brand: 'Davines', line: 'A New Colour', shadeCode: '8.0', shadeName: 'Dark Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-9', brand: 'Davines', line: 'A New Colour', shadeCode: '9.0', shadeName: 'Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-10', brand: 'Davines', line: 'A New Colour', shadeCode: '10.0', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-7a', brand: 'Davines', line: 'A New Colour', shadeCode: '7.1', shadeName: 'Light Ash Brown', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-9a', brand: 'Davines', line: 'A New Colour', shadeCode: '9.1', shadeName: 'Light Ash Blonde', level: 9, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-10a', brand: 'Davines', line: 'A New Colour', shadeCode: '10.1', shadeName: 'Lightest Ash Blonde', level: 10, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-6g', brand: 'Davines', line: 'A New Colour', shadeCode: '6.3', shadeName: 'Dark Golden Brown', level: 6, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-10g', brand: 'Davines', line: 'A New Colour', shadeCode: '10.3', shadeName: 'Lightest Golden Blonde', level: 10, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-5c', brand: 'Davines', line: 'A New Colour', shadeCode: '5.4', shadeName: 'Light Copper Brown', level: 5, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-4m', brand: 'Davines', line: 'A New Colour', shadeCode: '4.5', shadeName: 'Mahogany Brown', level: 4, tone: 'mahogany', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-3r', brand: 'Davines', line: 'A New Colour', shadeCode: '3.6', shadeName: 'Dark Red Brown', level: 3, tone: 'red', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-anc-8i', brand: 'Davines', line: 'A New Colour', shadeCode: '8.2', shadeName: 'Iridescent Blonde', level: 8, tone: 'cool', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },

  // Davines Mask with Vibrachrom (Permanent cream) — 1:1.5 ratio
  { id: 'davines-mv-6a', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '6.1', shadeName: 'Dark Ash Brown', level: 6, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-7a', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '7.1', shadeName: 'Ash Brown', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-5a', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '5.1', shadeName: 'Light Ash Brown', level: 5, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-7g', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '7.3', shadeName: 'Golden Brown', level: 7, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-6g', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '6.3', shadeName: 'Light Golden Brown', level: 6, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-5g', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '5.3', shadeName: 'Light Brown', level: 5, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-4g', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '4.3', shadeName: 'Light Brown', level: 4, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-6c', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '6.4', shadeName: 'Intense Copper', level: 6, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-5m', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '5.5', shadeName: 'Mahogany', level: 5, tone: 'mahogany', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-4r', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '4.6', shadeName: 'Intense Red', level: 4, tone: 'red', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },
  { id: 'davines-mv-3r', brand: 'Davines', line: 'Mask with Vibrachrom', shadeCode: '3.6', shadeName: 'Dark Red', level: 3, tone: 'red', mixingRatio: '1:1.5', developerRequired: '5-40 vol', upt: 100 },

  // Davines View (Tone-on-tone, acidic pH) — 1:1 ratio, 10 vol only
  { id: 'davines-vw-1', brand: 'Davines', line: 'View', shadeCode: '1,0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-2', brand: 'Davines', line: 'View', shadeCode: '2,0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-3', brand: 'Davines', line: 'View', shadeCode: '3,0', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-4', brand: 'Davines', line: 'View', shadeCode: '4,0', shadeName: 'Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-5', brand: 'Davines', line: 'View', shadeCode: '5,0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-6', brand: 'Davines', line: 'View', shadeCode: '6,0', shadeName: 'Dark Brown', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-7', brand: 'Davines', line: 'View', shadeCode: '7,0', shadeName: 'Light Brown', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-8', brand: 'Davines', line: 'View', shadeCode: '8,0', shadeName: 'Dark Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-9', brand: 'Davines', line: 'View', shadeCode: '9,0', shadeName: 'Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-10', brand: 'Davines', line: 'View', shadeCode: '10,0', shadeName: 'Buttercream Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-10a', brand: 'Davines', line: 'View', shadeCode: '10,1', shadeName: 'Pearl Blonde', level: 10, tone: 'ash', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-9g', brand: 'Davines', line: 'View', shadeCode: '9,3', shadeName: 'Golden Blonde', level: 9, tone: 'golden', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-8g', brand: 'Davines', line: 'View', shadeCode: '8,3', shadeName: 'Honey Blonde', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-7c', brand: 'Davines', line: 'View', shadeCode: '7,4', shadeName: 'Copper Brown', level: 7, tone: 'copper', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
  { id: 'davines-vw-6r', brand: 'Davines', line: 'View', shadeCode: '6,6', shadeName: 'Red Brown', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '10 vol', upt: 50 },
];

// ─── SCHWARZKOPF PRODUCTS ─────────────────────────────────────────────────────
const schwarzkopfProducts: Product[] = [
  // Igora Royal
  { id: 'skf-igora-1', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '1-0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-2', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '2-0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-3', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '3-0', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-4', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '4-0', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-5', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '5-0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '6-0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '7-0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-8', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '8-0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-9', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '9-0', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-10', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '10-0', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  // Igora Golden
  { id: 'skf-igora-4g', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '4-88', shadeName: 'Medium Brown Golden', level: 4, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-5g', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '5-88', shadeName: 'Light Brown Golden', level: 5, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6g', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '6-88', shadeName: 'Dark Blonde Golden', level: 6, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7g', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '7-88', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-8g', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '8-88', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Igora Ash
  { id: 'skf-igora-5a', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '5-1', shadeName: 'Light Brown Ash', level: 5, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6a', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '6-1', shadeName: 'Dark Blonde Ash', level: 6, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7a', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '7-1', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-8a', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '8-1', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Igora Red/Copper
  { id: 'skf-igora-5r', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '5-66', shadeName: 'Light Brown Red', level: 5, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6r', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '6-66', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6c', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '6-40', shadeName: 'Dark Blonde Copper', level: 6, tone: 'copper', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7c', brand: 'Schwarzkopf Professional', line: 'Igora Royal', shadeCode: '7-40', shadeName: 'Medium Blonde Copper', level: 7, tone: 'copper', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Schwarzkopf Essensity
  { id: 'skf-ess-5', brand: 'Schwarzkopf Professional', line: 'Essensity', shadeCode: '5N', shadeName: 'Light Brown Natural', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 80 },
  { id: 'skf-ess-6', brand: 'Schwarzkopf Professional', line: 'Essensity', shadeCode: '6N', shadeName: 'Dark Blonde Natural', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 80 },
  { id: 'skf-ess-7', brand: 'Schwarzkopf Professional', line: 'Essensity', shadeCode: '7N', shadeName: 'Medium Blonde Natural', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
  { id: 'skf-ess-8', brand: 'Schwarzkopf Professional', line: 'Essensity', shadeCode: '8N', shadeName: 'Light Blonde Natural', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
  { id: 'skf-ess-7g', brand: 'Schwarzkopf Professional', line: 'Essensity', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
];

// ─── REDKEN PRODUCTS ──────────────────────────────────────────────────────────
const redkenProducts: Product[] = [
  // Redken Color Gels
  { id: 'redken-cg-1', brand: 'Redken', line: 'Color Gel', shadeCode: '1N', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'redken-cg-2', brand: 'Redken', line: 'Color Gel', shadeCode: '2N', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'redken-cg-3', brand: 'Redken', line: 'Color Gel', shadeCode: '3N', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'redken-cg-4', brand: 'Redken', line: 'Color Gel', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'redken-cg-5', brand: 'Redken', line: 'Color Gel', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'redken-cg-6', brand: 'Redken', line: 'Color Gel', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'redken-cg-7', brand: 'Redken', line: 'Color Gel', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'redken-cg-8', brand: 'Redken', line: 'Color Gel', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'redken-cg-9', brand: 'Redken', line: 'Color Gel', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 100 },
  { id: 'redken-cg-10', brand: 'Redken', line: 'Color Gel', shadeCode: '10N', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 100 },
  // Redken Shades EQ
  { id: 'redken-seq-5', brand: 'Redken', line: 'Shades EQ', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-6', brand: 'Redken', line: 'Shades EQ', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-7', brand: 'Redken', line: 'Shades EQ', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-8', brand: 'Redken', line: 'Shades EQ', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-8g', brand: 'Redken', line: 'Shades EQ', shadeCode: '8G', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-9', brand: 'Redken', line: 'Shades EQ', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-9g', brand: 'Redken', line: 'Shades EQ', shadeCode: '9G', shadeName: 'Very Light Blonde Golden', level: 9, tone: 'golden', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  { id: 'redken-seq-9a', brand: 'Redken', line: 'Shades EQ', shadeCode: '9A', shadeName: 'Very Light Blonde Ash', level: 9, tone: 'ash', mixingRatio: '1:1', developerRequired: '4.5-13 vol', upt: 0 },
  // Redken Chromatics
  { id: 'redken-chr-4', brand: 'Redken', line: 'Chromatics', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'redken-chr-5', brand: 'Redken', line: 'Chromatics', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'redken-chr-6', brand: 'Redken', line: 'Chromatics', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'redken-chr-7', brand: 'Redken', line: 'Chromatics', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'redken-chr-6r', brand: 'Redken', line: 'Chromatics', shadeCode: '6R', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'redken-chr-7r', brand: 'Redken', line: 'Chromatics', shadeCode: '7R', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'redken-chr-7g', brand: 'Redken', line: 'Chromatics', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
];

// ─── MATRIX PRODUCTS ───────────────────────────────────────────────────────────
const matrixProducts: Product[] = [
  // Matrix SOCOLOR
  { id: 'matrix-sc-1', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '1A', shadeName: 'Black Ash', level: 1, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'matrix-sc-2', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '2N', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'matrix-sc-3', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '3N', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'matrix-sc-4', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'matrix-sc-5', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-sc-6', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-sc-7', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-sc-8', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'matrix-sc-9', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'matrix-sc-10', brand: 'Matrix', line: 'SOCOLOR', shadeCode: '10N', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  // Matrix Color Sync (demi-perm)
  { id: 'matrix-cs-5', brand: 'Matrix', line: 'Color Sync', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  { id: 'matrix-cs-6', brand: 'Matrix', line: 'Color Sync', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  { id: 'matrix-cs-7', brand: 'Matrix', line: 'Color Sync', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  { id: 'matrix-cs-8', brand: 'Matrix', line: 'Color Sync', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  { id: 'matrix-cs-7g', brand: 'Matrix', line: 'Color Sync', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  { id: 'matrix-cs-6r', brand: 'Matrix', line: 'Color Sync', shadeCode: '6R', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '5-13 vol', upt: 0 },
  // Matrix Bond Ultra
  { id: 'matrix-bu-4', brand: 'Matrix', line: 'Bond Ultra', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-bu-5', brand: 'Matrix', line: 'Bond Ultra', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-bu-6', brand: 'Matrix', line: 'Bond Ultra', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'matrix-bu-7', brand: 'Matrix', line: 'Bond Ultra', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
];

// ─── JOICO PRODUCTS ───────────────────────────────────────────────────────────
const joicoProducts: Product[] = [
  { id: 'joico-kp-2', brand: 'Joico', line: 'K-PAK Color', shadeCode: '2N', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'joico-kp-3', brand: 'Joico', line: 'K-PAK Color', shadeCode: '3N', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'joico-kp-4', brand: 'Joico', line: 'K-PAK Color', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'joico-kp-5', brand: 'Joico', line: 'K-PAK Color', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'joico-kp-6', brand: 'Joico', line: 'K-PAK Color', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'joico-kp-7', brand: 'Joico', line: 'K-PAK Color', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'joico-kp-8', brand: 'Joico', line: 'K-PAK Color', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'joico-kp-9', brand: 'Joico', line: 'K-PAK Color', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'joico-kp-10', brand: 'Joico', line: 'K-PAK Color', shadeCode: '10N', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'joico-kp-7g', brand: 'Joico', line: 'K-PAK Color', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'joico-kp-8g', brand: 'Joico', line: 'K-PAK Color', shadeCode: '8G', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'joico-kp-7r', brand: 'Joico', line: 'K-PAK Color', shadeCode: '7R', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Joico Color Intensity
  { id: 'joico-ci-r', brand: 'Joico', line: 'Color Intensity', shadeCode: 'R', shadeName: 'Vivid Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'joico-ci-v', brand: 'Joico', line: 'Color Intensity', shadeCode: 'V', shadeName: 'Violet', level: 6, tone: 'violet', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'joico-ci-b', brand: 'Joico', line: 'Color Intensity', shadeCode: 'B', shadeName: 'Blue', level: 4, tone: 'cool', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
];

// ─── PAUL MITCHELL PRODUCTS ───────────────────────────────────────────────────
const paulMitchellProducts: Product[] = [
  { id: 'pm-xg-2', brand: 'Paul Mitchell', line: 'XG Color', shadeCode: '2N', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'pm-xg-3', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '3N', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'pm-xg-4', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'pm-xg-5', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'pm-xg-6', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'pm-xg-7', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'pm-xg-8', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-9', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-10', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '10N', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pm-xg-7g', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-8g', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '8G', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-7a', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '7A', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-8a', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '8A', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'pm-xg-6r', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '6R', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'pm-xg-7r', brand: 'Paul Mitchell', line: 'XGG Color', shadeCode: '7R', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
];

// ─── PULP RIOT PRODUCTS ───────────────────────────────────────────────────────
const pulpRiotProducts: Product[] = [
  { id: 'pr-quad-4', brand: 'Pulp Riot', line: 'Quad', shadeCode: '4', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'pr-quad-5', brand: 'Pulp Riot', line: 'Quad', shadeCode: '5', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'pr-quad-6', brand: 'Pulp Riot', line: 'Quad', shadeCode: '6', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  { id: 'pr-quad-7', brand: 'Pulp Riot', line: 'Quad', shadeCode: '7', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-8', brand: 'Pulp Riot', line: 'Quad', shadeCode: '8', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-9', brand: 'Pulp Riot', line: 'Quad', shadeCode: '9', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 100 },
  { id: 'pr-quad-10', brand: 'Pulp Riot', line: 'Quad', shadeCode: '10', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10 vol', upt: 100 },
  { id: 'pr-quad-7g', brand: 'Pulp Riot', line: 'Quad', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-8g', brand: 'Pulp Riot', line: 'Quad', shadeCode: '8G', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-7a', brand: 'Pulp Riot', line: 'Quad', shadeCode: '7A', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-8a', brand: 'Pulp Riot', line: 'Quad', shadeCode: '8A', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'pr-quad-6r', brand: 'Pulp Riot', line: 'Quad', shadeCode: '6R', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 100 },
  // Pulp Riot Faction
  { id: 'pr-fc-r', brand: 'Pulp Riot', line: 'Faction', shadeCode: 'R', shadeName: 'Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'pr-fc-v', brand: 'Pulp Riot', line: 'Faction', shadeCode: 'V', shadeName: 'Violet', level: 7, tone: 'violet', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'pr-fc-b', brand: 'Pulp Riot', line: 'Faction', shadeCode: 'B', shadeName: 'Blue', level: 4, tone: 'cool', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
];

// ─── GOLDWELL PRODUCTS ────────────────────────────────────────────────────────
const goldwellProducts: Product[] = [
  { id: 'gw-duo-2', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '2N', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'gw-duo-3', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '3N', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'gw-duo-4', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '4N', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-40 vol', upt: 100 },
  { id: 'gw-duo-5', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '5N', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-6', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '6N', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-7', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '7N', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-8', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '8N', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-9', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '9N', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-10', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '10N', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  { id: 'gw-duo-6g', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '6G', shadeName: 'Dark Blonde Golden', level: 6, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-7g', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-8g', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '8G', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-6a', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '6A', shadeName: 'Dark Blonde Ash', level: 6, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-7a', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '7A', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-8a', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '8A', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'gw-duo-6r', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '6R', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'gw-duo-7r', brand: 'Goldwell', line: 'DualSenses Color', shadeCode: '7R', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
];

// ─── L'ANZA PRODUCTS ────────────────────────────────────────────────────────
const lanzaProducts: Product[] = [
  // L'ANZA Healing Color — Natural Series (N)
  { id: 'lanza-n-1', brand: "L'ANZA", line: 'Healing Color', shadeCode: '1N', shadeName: 'Natural Black', level: 1, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'lanza-n-2', brand: "L'ANZA", line: 'Healing Color', shadeCode: '2N', shadeName: 'Natural Brown Black', level: 2, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'lanza-n-3', brand: "L'ANZA", line: 'Healing Color', shadeCode: '3N', shadeName: 'Dark Natural Brown', level: 3, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'lanza-n-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4N', shadeName: 'Medium Natural Brown', level: 4, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5N', shadeName: 'Light Natural Brown', level: 5, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6N', shadeName: 'Dark Natural Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7N', shadeName: 'Medium Natural Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8N', shadeName: 'Light Natural Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9N', shadeName: 'Very Light Natural Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-n-10', brand: "L'ANZA", line: 'Healing Color', shadeCode: '10N', shadeName: 'Lightest Natural Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Double Natural (NN) — Extra Gray Coverage
  { id: 'lanza-nn-3', brand: "L'ANZA", line: 'Healing Color', shadeCode: '3NN', shadeName: 'Ultra Natural Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'lanza-nn-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4NN', shadeName: 'Ultra Natural Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5NN', shadeName: 'Ultra Natural Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6NN', shadeName: 'Ultra Natural Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7NN', shadeName: 'Ultra Natural Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8NN', shadeName: 'Ultra Natural Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9NN', shadeName: 'Ultra Natural Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nn-10', brand: "L'ANZA", line: 'Healing Color', shadeCode: '10NN', shadeName: 'Ultra Natural Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Natural Ash (NA)
  { id: 'lanza-na-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4NA', shadeName: 'Natural Ash Brown', level: 4, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-na-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5NA', shadeName: 'Natural Ash Brown', level: 5, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-na-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6NA', shadeName: 'Natural Ash Blonde', level: 6, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-na-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7NA', shadeName: 'Natural Ash Blonde', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-na-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8NA', shadeName: 'Natural Ash Blonde', level: 8, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-na-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9NA', shadeName: 'Natural Ash Blonde', level: 9, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Ash (A)
  { id: 'lanza-a-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4A', shadeName: 'Dark Ash Brown', level: 4, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5A', shadeName: 'Medium Ash Brown', level: 5, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6A', shadeName: 'Light Ash Brown', level: 6, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7A', shadeName: 'Dark Ash Blonde', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8A', shadeName: 'Medium Ash Blonde', level: 8, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9A', shadeName: 'Light Ash Blonde', level: 9, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-10', brand: "L'ANZA", line: 'Healing Color', shadeCode: '10A', shadeName: 'Very Light Ash Blonde', level: 10, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-a-100', brand: "L'ANZA", line: 'Healing Color', shadeCode: '100A', shadeName: 'Ultra Light Ash Blonde', level: 10, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 100 },
  { id: 'lanza-a-200', brand: "L'ANZA", line: 'Healing Color', shadeCode: '200A', shadeName: 'Super Lift Ash Blonde', level: 10, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '40 vol', upt: 100 },
  // L'ANZA Extra Ash (AX)
  { id: 'lanza-ax-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4AX', shadeName: 'Dark Extra Ash Brown', level: 4, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-ax-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5AX', shadeName: 'Medium Extra Ash Brown', level: 5, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-ax-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6AX', shadeName: 'Light Extra Ash Brown', level: 6, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-ax-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7AX', shadeName: 'Dark Extra Ash Blonde', level: 7, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-ax-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8AX', shadeName: 'Medium Extra Ash Blonde', level: 8, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Natural Violet (NV)
  { id: 'lanza-nv-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4NV', shadeName: 'Natural Violet Brown', level: 4, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nv-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5NV', shadeName: 'Natural Violet Brown', level: 5, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nv-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6NV', shadeName: 'Natural Violet Blonde', level: 6, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nv-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7NV', shadeName: 'Natural Violet Blonde', level: 7, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nv-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8NV', shadeName: 'Natural Violet Blonde', level: 8, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-nv-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9NV', shadeName: 'Natural Violet Blonde', level: 9, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Pearl (P)
  { id: 'lanza-p-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6P', shadeName: 'Dark Pearl Blonde', level: 6, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-p-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7P', shadeName: 'Medium Pearl Blonde', level: 7, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-p-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8P', shadeName: 'Light Pearl Blonde', level: 8, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-p-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9P', shadeName: 'Very Light Pearl Blonde', level: 9, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-p-10', brand: "L'ANZA", line: 'Healing Color', shadeCode: '10P', shadeName: 'Lightest Pearl Blonde', level: 10, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-p-100', brand: "L'ANZA", line: 'Healing Color', shadeCode: '100P', shadeName: 'Ultra Pearl Blonde', level: 10, tone: 'pearl', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 100 },
  // L'ANZA Beige (B)
  { id: 'lanza-b-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6B', shadeName: 'Light Beige Brown', level: 6, tone: 'beige', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-b-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7B', shadeName: 'Dark Beige Blonde', level: 7, tone: 'beige', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-b-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8B', shadeName: 'Medium Beige Blonde', level: 8, tone: 'beige', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-b-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9B', shadeName: 'Light Beige Blonde', level: 9, tone: 'beige', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-b-100', brand: "L'ANZA", line: 'Healing Color', shadeCode: '100B', shadeName: 'Ultra Beige Blonde', level: 10, tone: 'beige', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 100 },
  // L'ANZA Beige Copper (BC)
  { id: 'lanza-bc-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4BC', shadeName: 'Dark Beige Copper Brown', level: 4, tone: 'beige', secondaryTone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-bc-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6BC', shadeName: 'Light Beige Copper Brown', level: 6, tone: 'beige', secondaryTone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Copper (C)
  { id: 'lanza-c-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4C', shadeName: 'Dark Copper Brown', level: 4, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-c-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5C', shadeName: 'Medium Copper Brown', level: 5, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-c-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6C', shadeName: 'Light Copper Brown', level: 6, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-c-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7C', shadeName: 'Dark Copper Blonde', level: 7, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-c-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8C', shadeName: 'Medium Copper Blonde', level: 8, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-c-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9C', shadeName: 'Light Copper Blonde', level: 9, tone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Copper Gold (CG)
  { id: 'lanza-cg-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4CG', shadeName: 'Dark Copper Gold Brown', level: 4, tone: 'copper', secondaryTone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-cg-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5CG', shadeName: 'Medium Copper Gold Brown', level: 5, tone: 'copper', secondaryTone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-cg-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6CG', shadeName: 'Light Copper Gold Brown', level: 6, tone: 'copper', secondaryTone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-cg-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7CG', shadeName: 'Dark Copper Gold Blonde', level: 7, tone: 'copper', secondaryTone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Red (R)
  { id: 'lanza-r-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4R', shadeName: 'Dark Red Brown', level: 4, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-r-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5R', shadeName: 'Medium Red Brown', level: 5, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-r-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6R', shadeName: 'Light Red Brown', level: 6, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-r-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7R', shadeName: 'Medium Red Blonde', level: 7, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Ultra Red (RR)
  { id: 'lanza-rr-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5RR', shadeName: 'Medium Ultra Red Brown', level: 5, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rr-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6RR', shadeName: 'Dark Ultra Red Blonde', level: 6, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rr-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7RR', shadeName: 'Medium Ultra Red Blonde', level: 7, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rr-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8RR', shadeName: 'Light Ultra Red Blonde', level: 8, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rr-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9RR', shadeName: 'Very Light Ultra Red Blonde', level: 9, tone: 'red', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Red Copper (RRC)
  { id: 'lanza-rrc-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4RRC', shadeName: 'Dark Red Copper Brown', level: 4, tone: 'red', secondaryTone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rrc-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5RRC', shadeName: 'Medium Red Copper Brown', level: 5, tone: 'red', secondaryTone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rrc-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6RRC', shadeName: 'Light Red Copper Brown', level: 6, tone: 'red', secondaryTone: 'copper', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Red Violet (RV)
  { id: 'lanza-rv-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4RV', shadeName: 'Dark Red Violet Brown', level: 4, tone: 'red', secondaryTone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-rv-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5RV', shadeName: 'Medium Red Violet Brown', level: 5, tone: 'red', secondaryTone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Violet (V)
  { id: 'lanza-v-3', brand: "L'ANZA", line: 'Healing Color', shadeCode: '3V', shadeName: 'Dark Violet Brown', level: 3, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20 vol', upt: 100 },
  { id: 'lanza-v-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4V', shadeName: 'Medium Violet Brown', level: 4, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5V', shadeName: 'Light Violet Brown', level: 5, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6V', shadeName: 'Dark Violet Blonde', level: 6, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7V', shadeName: 'Medium Violet Blonde', level: 7, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8V', shadeName: 'Light Violet Blonde', level: 8, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9V', shadeName: 'Very Light Violet Blonde', level: 9, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-v-100', brand: "L'ANZA", line: 'Healing Color', shadeCode: '100V', shadeName: 'Ultra Violet Blonde', level: 10, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 100 },
  // L'ANZA Gold (G)
  { id: 'lanza-g-4', brand: "L'ANZA", line: 'Healing Color', shadeCode: '4G', shadeName: 'Dark Golden Brown', level: 4, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-g-5', brand: "L'ANZA", line: 'Healing Color', shadeCode: '5G', shadeName: 'Medium Golden Brown', level: 5, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-g-6', brand: "L'ANZA", line: 'Healing Color', shadeCode: '6G', shadeName: 'Light Golden Brown', level: 6, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-g-7', brand: "L'ANZA", line: 'Healing Color', shadeCode: '7G', shadeName: 'Medium Golden Blonde', level: 7, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-g-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8G', shadeName: 'Light Golden Blonde', level: 8, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  { id: 'lanza-g-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9G', shadeName: 'Very Light Golden Blonde', level: 9, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '20-30 vol', upt: 100 },
  // L'ANZA Titanium (T)
  { id: 'lanza-t-8', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8T', shadeName: 'Silver', level: 8, tone: 'cool', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-t-9', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9T', shadeName: 'Chrome', level: 9, tone: 'cool', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  // L'ANZA Specialty Shades
  { id: 'lanza-spec-8gn', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8Gn', shadeName: 'Ivy', level: 8, tone: 'cool', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-8v', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8V', shadeName: 'Iridescent Quartz', level: 8, tone: 'violet', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-8wg', brand: "L'ANZA", line: 'Healing Color', shadeCode: '8Wg', shadeName: 'Golden Apricot', level: 8, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-9aa', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9Aa', shadeName: 'Papaya', level: 9, tone: 'ash', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-9gi', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9GI', shadeName: 'Hamptons', level: 9, tone: 'golden', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-9nw', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9NW', shadeName: 'Cream Soda', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-9nb', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9Nb', shadeName: 'Irish Creme', level: 9, tone: 'neutral', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
  { id: 'lanza-spec-9rb', brand: "L'ANZA", line: 'Healing Color', shadeCode: '9Rb', shadeName: 'Blush', level: 9, tone: 'red', mixingRatio: '1:1.5', developerRequired: '30-40 vol', upt: 0 },
];

// ─── BRAND SETS WITH HAND-CURATED DATA ────────────────────────────────────────
// These brands take priority over auto-generated data from the conversion DB

const HAND_CURATED_BRANDS = new Set([
  'Wella',
  'Davines',
  'Schwarzkopf',
  'Redken',
  'Matrix',
  'Joico',
  'Paul Mitchell',
  'Pulp Riot',
  'Goldwell',
  "L'ANZA",
]);

const HAND_CURATED_PRODUCTS: Product[] = [
  ...wellaProducts,
  ...davinesProducts,
  ...schwarzkopfProducts,
  ...redkenProducts,
  ...matrixProducts,
  ...joicoProducts,
  ...paulMitchellProducts,
  ...pulpRiotProducts,
  ...goldwellProducts,
  ...lanzaProducts,
];

// ─── AUTO-GENERATE PRODUCTS FROM CONVERSION DB ────────────────────────────────
// For brands NOT in HAND_CURATED_BRANDS, generate Product entries from NormalizedShade data

function generateBridgedProducts(): Product[] {
  const bridged: Product[] = [];
  const allBrandKeys = getAllBrands();

  for (const brandKey of allBrandKeys) {
    const displayName = getBrandDisplayName(brandKey);

    // ALWAYS generate from conversion DB — no more hand-curated overrides
    // Hand-curated data was incomplete (only 315 products vs 3,019 shades)

    const shades = loadBrandShades(brandKey);
    const specs = loadBrandSpecs(brandKey);

    for (const shade of shades) {
      try {
        const product = shadeToProduct(shade, brandKey, specs);
        bridged.push(product);
      } catch (e) {
        // Skip invalid shades
      }
    }
  }

  return bridged;
}

// ─── ALL PRODUCTS ─────────────────────────────────────────────────────────────
// ALL products now come from conversion DB (3,019 shades)
// Hand-curated data was kept as reference but auto-generated data is more complete

export const ALL_PRODUCTS: Product[] = generateBridgedProducts();

export const BRANDS = [...new Set(ALL_PRODUCTS.map(p => p.brand))];
export const LINES_BY_BRAND = BRANDS.reduce((acc, brand) => {
  acc[brand] = [...new Set(ALL_PRODUCTS.filter(p => p.brand === brand).map(p => p.line))];
  return acc;
}, {} as Record<string, string[]>);

// Find products by level and tone
export function findProductsByLevelAndTone(level: number, tone: ToneFamily, brand?: string): Product[] {
  return ALL_PRODUCTS.filter(p => {
    const levelMatch = p.level === level;
    const toneMatch = p.tone === tone || p.secondaryTone === tone;
    const brandMatch = !brand || p.brand === brand;
    return levelMatch && toneMatch && brandMatch;
  });
}

// Find closest level match
export function findClosestLevel(targetLevel: number, direction: 'up' | 'down' = 'up'): number {
  if (direction === 'up') {
    return Math.min(targetLevel, 10);
  }
  return Math.max(targetLevel, 1);
}
