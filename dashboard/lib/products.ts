// Professional Hair Color Product Database
// Maps brand-specific shade codes to universal color levels (1-10) and tones

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

// Universal hair color levels
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

// ─── WELLA PRODUCTS ────────────────────────────────────────────────────────────
const wellaProducts: Product[] = [
  // Koleston Perfect ME+ — Level lines
  { id: 'wella-kol-1', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '1/0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-2', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '2/0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-3', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '3/0', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-4', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '4/0', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'wella-kol-5', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '5/0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '6/0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '7/0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-8', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '8/0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-9', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '9/0', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-10', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '10/0', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  // Wella Golden tones
  { id: 'wella-kol-4g', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '4/73', shadeName: 'Medium Brown Golden', level: 4, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-5g', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '5/73', shadeName: 'Light Brown Golden', level: 5, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6g', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '6/73', shadeName: 'Dark Blonde Golden', level: 6, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7g', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '7/73', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-8g', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '8/73', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Wella Ash tones
  { id: 'wella-kol-4a', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '4/81', shadeName: 'Medium Brown Ash', level: 4, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-5a', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '5/81', shadeName: 'Light Brown Ash', level: 5, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6a', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '6/81', shadeName: 'Dark Blonde Ash', level: 6, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7a', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '7/81', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-8a', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '8/81', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Wella Red/Copper tones
  { id: 'wella-kol-5r', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '5/60', shadeName: 'Light Brown Red', level: 5, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-6r', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '6/60', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7r', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '7/60', shadeName: 'Medium Blonde Red', level: 7, tone: 'red', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'wella-kol-6rc', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '6/65', shadeName: 'Dark Blonde Copper Rose', level: 6, tone: 'copper', secondaryTone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'wella-kol-7rc', brand: 'Wella', line: 'Koleston Perfect ME+', shadeCode: '7/46', shadeName: 'Medium Blonde Copper', level: 7, tone: 'copper', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Wella Color Touch
  { id: 'wella-ct-5', brand: 'Wella', line: 'Color Touch', shadeCode: '5/0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-6', brand: 'Wella', line: 'Color Touch', shadeCode: '6/0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-7', brand: 'Wella', line: 'Color Touch', shadeCode: '7/0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-7g', brand: 'Wella', line: 'Color Touch', shadeCode: '7/73', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
  { id: 'wella-ct-8g', brand: 'Wella', line: 'Color Touch', shadeCode: '8/0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:2', developerRequired: '4.5-13 vol', upt: 50 },
];

// ─── SCHWARZKOFF PRODUCTS ────────────────────────────────────────────────────
const schwarzkopfProducts: Product[] = [
  // Igora Royal
  { id: 'skf-igora-1', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '1-0', shadeName: 'Black', level: 1, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-2', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '2-0', shadeName: 'Darkest Brown', level: 2, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-3', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '3-0', shadeName: 'Dark Brown', level: 3, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-4', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '4-0', shadeName: 'Medium Brown', level: 4, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-40 vol', upt: 100 },
  { id: 'skf-igora-5', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '5-0', shadeName: 'Light Brown', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '6-0', shadeName: 'Dark Blonde', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '7-0', shadeName: 'Medium Blonde', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-8', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '8-0', shadeName: 'Light Blonde', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-9', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '9-0', shadeName: 'Very Light Blonde', level: 9, tone: 'neutral', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-10', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '10-0', shadeName: 'Lightest Blonde', level: 10, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 100 },
  // Igora Golden
  { id: 'skf-igora-4g', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '4-88', shadeName: 'Medium Brown Golden', level: 4, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-5g', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '5-88', shadeName: 'Light Brown Golden', level: 5, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6g', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '6-88', shadeName: 'Dark Blonde Golden', level: 6, tone: 'golden', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7g', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '7-88', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-8g', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '8-88', shadeName: 'Light Blonde Golden', level: 8, tone: 'golden', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Igora Ash
  { id: 'skf-igora-5a', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '5-1', shadeName: 'Light Brown Ash', level: 5, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6a', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '6-1', shadeName: 'Dark Blonde Ash', level: 6, tone: 'ash', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7a', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '7-1', shadeName: 'Medium Blonde Ash', level: 7, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  { id: 'skf-igora-8a', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '8-1', shadeName: 'Light Blonde Ash', level: 8, tone: 'ash', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Igora Red/Copper
  { id: 'skf-igora-5r', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '5-66', shadeName: 'Light Brown Red', level: 5, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6r', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '6-66', shadeName: 'Dark Blonde Red', level: 6, tone: 'red', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-6c', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '6-40', shadeName: 'Dark Blonde Copper', level: 6, tone: 'copper', mixingRatio: '1:1', developerRequired: '20-30 vol', upt: 100 },
  { id: 'skf-igora-7c', brand: 'Schwarzkopf', line: 'Igora Royal', shadeCode: '7-40', shadeName: 'Medium Blonde Copper', level: 7, tone: 'copper', mixingRatio: '1:1', developerRequired: '20 vol', upt: 100 },
  // Schwarzkopf Essensity
  { id: 'skf-ess-5', brand: 'Schwarzkopf', line: 'Essensity', shadeCode: '5N', shadeName: 'Light Brown Natural', level: 5, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 80 },
  { id: 'skf-ess-6', brand: 'Schwarzkopf', line: 'Essensity', shadeCode: '6N', shadeName: 'Dark Blonde Natural', level: 6, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-30 vol', upt: 80 },
  { id: 'skf-ess-7', brand: 'Schwarzkopf', line: 'Essensity', shadeCode: '7N', shadeName: 'Medium Blonde Natural', level: 7, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
  { id: 'skf-ess-8', brand: 'Schwarzkopf', line: 'Essensity', shadeCode: '8N', shadeName: 'Light Blonde Natural', level: 8, tone: 'neutral', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
  { id: 'skf-ess-7g', brand: 'Schwarzkopf', line: 'Essensity', shadeCode: '7G', shadeName: 'Medium Blonde Golden', level: 7, tone: 'golden', mixingRatio: '1:1', developerRequired: '10-20 vol', upt: 80 },
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

// ─── ALL PRODUCTS ─────────────────────────────────────────────────────────────
export const ALL_PRODUCTS: Product[] = [
  ...wellaProducts,
  ...schwarzkopfProducts,
  ...redkenProducts,
  ...matrixProducts,
  ...joicoProducts,
  ...paulMitchellProducts,
  ...pulpRiotProducts,
  ...goldwellProducts,
];

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
