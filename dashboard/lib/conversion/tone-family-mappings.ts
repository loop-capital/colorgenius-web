/**
 * Brand-Specific Tone Family Mapping Table
 * Built from data/brands/tone-family-map.json
 * 
 * Provides a lookup table: brand → toneCode → ToneFamily
 * Used by the normalization pipeline and conversion engine.
 * 
 * Generated: 2026-05-15
 */

import type { ToneFamily } from './types';

// Raw mapping from tone-family-map.json (auto-generated, do not edit manually)
const RAW_MAPPINGS: Record<string, Record<string, string>> = {
  schwarzkopf: {
    '0': 'natural', '00': 'natural', '01': 'natural',
    '1': 'blue-ash', '2': 'ash', '3': 'ash', '4': 'beige', '5': 'gold',
    '6': 'chocolate', '7': 'copper', '8': 'red', '9': 'violet',
    '10': 'blue-ash', '11': 'blue-ash', '12': 'ash', '13': 'ash',
    '14': 'ash', '16': 'ash', '19': 'blue-ash', '21': 'ash', '22': 'ash',
    '24': 'ash', '33': 'ash', '40': 'natural', '42': 'beige', '44': 'beige',
    '46': 'beige', '48': 'beige', '49': 'beige', '50': 'gold', '55': 'gold',
    '57': 'gold', '60': 'chocolate', '63': 'chocolate', '65': 'chocolate',
    '66': 'chocolate', '68': 'chocolate', '70': 'copper', '77': 'copper',
    '80': 'red', '88': 'red', '89': 'red', '98': 'violet', '99': 'violet',
    '140': 'natural', '450': 'beige', '460': 'beige', '470': 'beige',
    '560': 'gold', '710': 'blue-ash',
  },
  moroccanoil: {
    '.0': 'natural', '.00': 'natural', '.1': 'ash', '.12': 'ash',
    '.13': 'beige', '.17': 'blue-ash', '.2': 'violet', '.21': 'violet',
    '.24': 'violet', '.3': 'gold', '.34': 'gold', '.4': 'copper',
    '.43': 'copper', '.46': 'copper', '.5': 'mahogany', '.6': 'red',
    '.64': 'red', '.65': 'red', '.7': 'cool', '.8': 'cool', '.9': 'chocolate',
    '.91': 'chocolate', '.99': 'chocolate',
  },
  lanza: {
    'N': 'natural', 'NN': 'natural', 'NA': 'ash', 'A': 'ash', 'AX': 'ash',
    'NV': 'violet', 'P': 'pearl', 'B': 'beige', 'BC': 'beige', 'C': 'copper',
    'CG': 'gold', 'R': 'red', 'RR': 'red', 'RRC': 'copper', 'RV': 'mahogany',
    'V': 'violet', 'G': 'gold', 'T': 'cool', 'SPECIALTY': 'warm',
  },
  davines: {
    '.0': 'natural', ',0': 'natural', '.1': 'blue-ash', ',1': 'blue-ash',
    '.2': 'ash', ',2': 'ash', '.3': 'gold', ',3': 'gold', '.4': 'copper',
    ',4': 'copper', '.5': 'mahogany', ',5': 'mahogany', '.6': 'red',
    ',6': 'red', '.7': 'ash', ',7': 'ash', '.8': 'chocolate', ',8': 'chocolate',
    '.9': 'pearl', ',9': 'pearl', '.27': 'ash', ',27': 'ash',
  },
  aveda: {
    'N': 'natural', 'NN': 'natural', 'A': 'ash', 'V': 'violet', 'B': 'beige',
    'C': 'copper', 'R': 'red', 'G': 'gold', 'HLA': 'natural', 'P': 'specialty',
  },
  oligo: {
    '0': 'natural', '1': 'ash', '2': 'specialty', '3': 'gold', '4': 'copper',
    '5': 'red', '6': 'violet', '7': 'mahogany', '8': 'natural', '11': 'ash',
    '12': 'ash', '13': 'ash', '16': 'ash', '18': 'ash', '31': 'beige',
    '32': 'beige', '34': 'copper', '36': 'beige', '43': 'copper', '44': 'copper',
    '54': 'copper', '55': 'red', '56': 'red', '66': 'violet', '82': 'beige',
    '318': 'beige', '444': 'copper', '556': 'red', '51': 'red', '45': 'copper',
  },
  lorealpro: {
    'N': 'natural', '.1': 'ash', '.11': 'blue-ash', '.12': 'ash', '.13': 'beige',
    '.15': 'ash', '.18': 'ash', '.01': 'blue-ash', '.02': 'blue-ash',
    '.03': 'gold', '.07': 'cool', '.2': 'violet', '.20': 'violet',
    '.21': 'violet', '.22': 'violet', '.23': 'violet', '.24': 'violet',
    '.3': 'gold', '.31': 'beige', '.32': 'beige', '.34': 'gold', '.35': 'warm',
    '.4': 'copper', '.40': 'copper', '.43': 'copper', '.44': 'copper',
    '.45': 'copper', '.46': 'copper', '.5': 'red', '.6': 'red', '.60': 'red',
    '.62': 'red', '.64': 'red', '.66': 'red', '.7': 'cool', '.71': 'cool',
    '.8': 'chocolate', '.82': 'chocolate', '.84': 'chocolate',
  },
  kevinmurphy: {
    '.0': 'natural', '.00': 'natural', '.1': 'ash', '.13': 'ash', '.16': 'ash',
    '.18': 'violet', '.21': 'gold', '.3': 'gold', '.34': 'copper', '.38': 'gold',
    '.4': 'red', '.43': 'red', '.5': 'mahogany', '.6': 'red', '.65': 'red',
    '.7': 'chocolate', '.73': 'chocolate', '.75': 'mahogany', '.77': 'beige',
    '.8': 'violet', '.81': 'violet', '.86': 'gold', '.9': 'ash',
  },
  wella: {
    '/0': 'natural', '/1': 'ash', '/2': 'ash', '/3': 'gold', '/4': 'copper',
    '/5': 'red', '/6': 'violet', '/7': 'chocolate', '/8': 'ash', '/9': 'pearl',
    '/01': 'ash', '/02': 'ash', '/03': 'gold', '/05': 'natural',
    '/16': 'ash', '/34': 'copper', '/35': 'gold', '/36': 'gold',
    '/37': 'gold', '/38': 'gold', '/41': 'copper', '/43': 'copper',
    '/45': 'red', '/47': 'copper', '/54': 'red', '/56': 'violet',
    '/57': 'red', '/65': 'violet', '/66': 'violet', '/68': 'ash',
    '/71': 'chocolate', '/73': 'chocolate', '/75': 'chocolate',
    '/81': 'ash', '/86': 'violet', '/89': 'ash', '/96': 'pearl',
    '/97': 'pearl', '/07': 'natural',
  },
  'wella-illumina': {
    '/0': 'natural', '/1': 'ash', '/2': 'ash', '/3': 'gold', '/4': 'copper',
    '/5': 'red', '/6': 'violet', '/7': 'chocolate', '/8': 'ash', '/9': 'pearl',
    '/01': 'ash', '/02': 'ash', '/03': 'gold', '/05': 'natural',
    '/16': 'ash', '/34': 'copper', '/35': 'gold', '/36': 'gold',
    '/37': 'gold', '/38': 'gold', '/41': 'copper', '/43': 'copper',
    '/45': 'red', '/47': 'copper', '/54': 'red', '/56': 'violet',
    '/57': 'red', '/65': 'violet', '/66': 'violet', '/68': 'ash',
    '/71': 'chocolate', '/73': 'chocolate', '/75': 'chocolate',
    '/81': 'ash', '/86': 'violet', '/89': 'ash', '/96': 'pearl',
    '/97': 'pearl',
  },
  'wella-shinefinity': {
    '/0': 'natural', '/1': 'ash', '/2': 'ash', '/3': 'gold', '/4': 'copper',
    '/5': 'red', '/6': 'violet', '/7': 'chocolate', '/8': 'ash', '/9': 'pearl',
    '/01': 'ash', '/02': 'ash', '/03': 'gold', '/05': 'natural',
    '/16': 'ash', '/34': 'copper', '/35': 'gold', '/36': 'gold',
    '/37': 'gold', '/38': 'gold', '/41': 'copper', '/43': 'copper',
    '/45': 'copper', '/47': 'copper', '/54': 'red', '/56': 'violet',
    '/57': 'violet', '/66': 'violet', '/68': 'violet', '/71': 'chocolate',
    '/73': 'chocolate', '/75': 'chocolate', '/81': 'ash', '/86': 'violet',
    '/88': 'ash', '/89': 'pearl', '/96': 'pearl', '/97': 'pearl',
  },
  'redken-color-gels-lacquers': {
    'NN': 'natural', 'NA': 'ash', 'N': 'natural', 'NW': 'warm', 'WG': 'gold',
    'GB': 'gold', 'CB': 'copper', 'ABn': 'ash', 'RR': 'red', 'RV': 'violet',
    'NB': 'natural',
  },
  'redken-shades-eq': {
    'N': 'natural', 'NN': 'natural', 'NA': 'ash', 'NW': 'warm', 'NB': 'natural',
    'A': 'ash', 'T': 'ash', 'V': 'violet', 'B': 'blue-ash', 'G': 'gold',
    'C': 'copper', 'R': 'red', 'W': 'warm', 'P': 'pearl',
  },
  'joico-lumishine': {
    'N': 'natural', 'NN': 'natural', 'NNA': 'ash', 'NNG': 'gold', 'NA': 'ash',
    'AA': 'ash', 'NWB': 'beige', 'NW': 'warm', 'NG': 'gold', 'INCG': 'copper',
    'INRR': 'red',
  },
  'matrix-socolor': {
    'N': 'natural', 'NN': 'natural', 'NA': 'ash', 'NJ': 'gold', 'NV': 'violet',
    'NW': 'warm', 'A': 'ash', 'AA': 'ash', 'AV': 'ash', 'D': 'cool',
    'M': 'chocolate', 'W': 'warm', 'O': 'copper', 'BR': 'mahogany',
    'RB': 'mahogany', 'BC': 'copper', 'CO': 'copper', 'RV': 'mahogany',
    'RR': 'red', 'RC': 'copper', 'VR': 'mahogany', 'V': 'violet', 'G': 'gold',
    'C': 'copper', 'R': 'red', 'HD-RV': 'mahogany', 'HD-RR': 'red',
    'SR-HV': 'violet', 'SR-R': 'red', 'BLUE': 'cool', 'RED': 'red',
  },
  'matrix-socolor-sync': {
    'N': 'natural', 'NA': 'ash', 'A': 'ash', 'AV': 'ash', 'M': 'chocolate',
    'W': 'warm', 'G': 'gold', 'C': 'copper', 'RV': 'mahogany', 'RR': 'red',
    'RC': 'copper', 'VR': 'mahogany', 'BR': 'mahogany', 'RB': 'mahogany',
    'V': 'violet', 'R': 'red',
  },
  'matrix-super-sync': {
    'N': 'natural', 'NN': 'natural', 'NA': 'ash', 'NJ': 'gold', 'NV': 'violet',
    'NW': 'warm', 'WN': 'warm', 'A': 'ash', 'AA': 'ash', 'AV': 'ash',
    'D': 'cool', 'M': 'chocolate', 'MM': 'chocolate', 'W': 'warm',
    'BR': 'mahogany', 'RB': 'mahogany', 'BC': 'copper', 'CG': 'copper',
    'CG+': 'copper', 'CC+': 'copper', 'RV': 'mahogany', 'RV+': 'mahogany',
    'RR': 'red', 'RR+': 'red', 'RC': 'copper', 'RC+': 'copper',
    'VR': 'mahogany', 'V': 'violet', 'VA': 'violet', 'G': 'gold',
    'GV': 'gold', 'GM': 'chocolate', 'P': 'pearl', 'PR': 'pearl',
    'PV': 'pearl', 'PA': 'pearl', 'T': 'cool', 'R': 'red', 'RG': 'red',
    'NGA': 'gold', 'J': 'cool', 'HD-RR': 'red', 'HD-RV': 'mahogany',
    'SP-N': 'natural', 'SP-A': 'ash', 'SP-P': 'pearl', 'SP-V': 'violet',
    'SP-M': 'chocolate', 'Clear': 'natural', 'RED': 'red', 'BLUE': 'cool',
  },
  'matrix-tonal-control': {
    'N': 'natural', 'NA': 'ash', 'A': 'ash', 'AA': 'ash', 'NV': 'violet',
    'NW': 'warm', 'AG': 'ash', 'GB': 'gold', 'P': 'pearl', 'PA': 'pearl',
    'PR': 'pearl', 'PV': 'pearl', 'T': 'cool', 'VA': 'violet', 'G': 'gold',
    'GV': 'ash', 'NCV': 'gold', 'NGA': 'gold', 'RG': 'red', 'V': 'violet',
    'C': 'copper', 'CR': 'copper', 'GM': 'chocolate', 'VG': 'beige',
    'VR': 'mahogany', 'R': 'red', 'NJ': 'gold', 'J': 'cool',
    'Clear': 'natural',
  },
  'pravana-chromasilk': {
    'N': 'natural', '0': 'specialty', '1': 'ash', '2': 'beige', '20': 'beige',
    '22': 'beige', '23': 'beige', '3': 'gold', '03': 'gold', '30': 'gold',
    '31': 'gold', '34': 'gold', '35': 'gold', '36': 'gold', '37': 'gold',
    '38': 'gold', '3L': 'gold', '4': 'copper', '40': 'copper', '43': 'copper',
    '44': 'copper', '45': 'copper', '46': 'copper', '47': 'copper',
    '4L': 'copper', '5': 'mahogany', '50': 'mahogany', '51': 'mahogany',
    '52': 'mahogany', '55': 'mahogany', '56': 'mahogany', '57': 'mahogany',
    '6': 'red', '60': 'red', '62': 'red', '64': 'red', '66': 'red',
    '7': 'violet', '07': 'violet', '70': 'violet', '72': 'violet',
    '73': 'violet', '75': 'violet', '76': 'violet', '77': 'violet',
    'NtL': 'natural', 'BOOSTER': 'natural',
  },
  kenra: {
    'N': 'natural', 'NN': 'natural', 'NA': 'ash', 'NUA': 'ash', 'NB': 'beige',
    'NG': 'gold', 'NW': 'warm', 'A': 'ash', 'AA': 'ash', 'UA': 'ash',
    'G': 'gold', 'GG': 'gold', 'GB': 'gold', 'C': 'copper', 'CC': 'copper',
    'CN': 'copper', 'R': 'red', 'RR': 'red', 'RC': 'copper', 'RB': 'mahogany',
    'RV': 'mahogany', 'V': 'violet', 'VV': 'violet', 'VR': 'violet',
    'PV': 'pearl', 'VM': 'violet', 'SM': 'cool', 'RoM': 'rose',
    'M': 'chocolate', 'MB': 'chocolate', 'B': 'beige', 'BV': 'violet',
    'BRV': 'mahogany', 'GV': 'gold', 'Bl': 'cool', 'P': 'pearl',
    'S': 'cool', 'DF': 'cool', '+': 'natural', 'N+': 'natural',
    'NW+': 'warm', 'B+': 'beige', 'MB+': 'chocolate', 'BV+': 'violet',
    'BRV+': 'mahogany', 'GV+': 'gold', 'Bl+': 'cool',
    'AU': 'ash', 'CU': 'copper', 'VU': 'violet',
    'RT-SA': 'ash', 'RT-SV': 'violet', 'RT-VP': 'pearl',
    'RT-GrBl': 'cool', 'RT-B': 'cool', 'RT-GV': 'violet',
    'RT-RoV': 'violet', 'Clear': 'natural',
  },
  'r-color': {
    '0': 'natural', '00': 'natural',
    '1': 'ash', '11': 'ash',
    '3': 'gold', '34': 'gold', '03': 'natural',
    '4': 'copper', '43': 'copper',
    '5': 'red', '55': 'red', '56': 'red',
    '6': 'violet', '63': 'violet', '65': 'violet', '66': 'violet',
    '80': 'pearl', '81': 'pearl',
  },
  'soho': {
    '0': 'natural', '00': 'natural',
    '1': 'ash',
    '2': 'matte',
    '3': 'gold', '03': 'gold', '63': 'gold',
    '4': 'copper',
    '5': 'red',
    '56': 'red',
    '6': 'violet', '66': 'violet',
    '80': 'pearl',
  },
  'pravana-vivids': {
    'Silver': 'cool', 'Yellow': 'gold', 'Orange': 'copper', 'Red': 'red',
    'Pink': 'rose', 'Magenta': 'violet', 'Violet': 'violet', 'Green': 'specialty',
    'Blue': 'cool', 'WildOrchid': 'violet', 'NeonPink': 'rose',
    'NeonOrange': 'copper', 'NeonYellow': 'gold', 'NeonGreen': 'specialty',
    'NeonBlue': 'cool', 'PastelPink': 'rose', 'PastelLavender': 'violet',
    'PastelBlue': 'cool', 'PastelCoral': 'copper', 'PastelMint': 'specialty',
    'LockedRed': 'red', 'LockedYellow': 'gold', 'LockedBlue': 'cool',
    'LockedTeal': 'specialty', 'LockedPurple': 'violet', 'LockedPink': 'rose',
    'Clear': 'natural', 'Black': 'natural',
  },
  'pulp-riot-faction8': {
    '0': 'natural', '00': 'natural', '01': 'ash', '02': 'violet', '03': 'gold',
    '08': 'pearl', '1': 'ash', '11': 'ash', '2': 'violet', '21': 'violet',
    '22': 'violet', '23': 'violet', '26': 'violet', '3': 'gold', '32': 'gold',
    '34': 'gold', '35': 'gold', '4': 'copper', '44': 'copper', '45': 'copper',
    '46': 'copper', '5': 'mahogany', '53': 'mahogany', '6': 'red', '64': 'red',
    '65': 'red', '66': 'red', '7': 'cool', '71': 'cool', '8': 'pearl',
    '82': 'pearl', '83': 'pearl', '85': 'pearl', '88': 'pearl',
  },
  'pulp-riot-liquid-demi': {
    '0': 'natural', '00': 'natural', '01': 'ash', '02': 'violet', '03': 'gold',
    '08': 'pearl', '1': 'ash', '11': 'ash', '2': 'violet', '21': 'violet',
    '22': 'violet', '23': 'violet', '26': 'violet', '3': 'gold', '32': 'gold',
    '34': 'gold', '35': 'gold', '4': 'copper', '44': 'copper', '45': 'copper',
    '46': 'copper', '5': 'mahogany', '53': 'mahogany', '6': 'red', '64': 'red',
    '65': 'red', '66': 'red', '7': 'cool', '71': 'cool', '8': 'pearl',
    '82': 'pearl', '83': 'pearl', '85': 'pearl', '88': 'pearl',
  },
  'r-color': {
    '0': 'natural', '00': 'natural',
    '1': 'ash', '11': 'ash',
    '3': 'gold', '34': 'gold', '03': 'natural',
    '4': 'copper', '43': 'copper',
    '5': 'red', '55': 'red', '56': 'red',
    '6': 'violet', '63': 'violet', '65': 'violet', '66': 'violet',
    '80': 'pearl', '81': 'pearl',
  },
  'soho': {
    '0': 'natural', '00': 'natural',
    '1': 'ash',
    '2': 'matte',
    '3': 'gold', '03': 'gold', '63': 'gold',
    '4': 'copper',
    '5': 'red',
    '56': 'red',
    '6': 'violet', '66': 'violet',
    '80': 'pearl',
  },
  'omcorcolor': {
    '.0': 'natural', '.00': 'natural',
    '.1': 'ash', '.11': 'ash', '.19': 'ash',
    '.13': 'beige', '.03': 'beige',
    '.3': 'gold', '.34': 'gold',
    '.4': 'copper', '.43': 'copper',
    '.45': 'red', '.5': 'red', '.55': 'red', '.46': 'red', '.65': 'red',
    '.6': 'violet', '.63': 'violet', '.65': 'violet', '.66': 'violet', '.67': 'violet',
    '.7': 'mahogany', '.71': 'mahogany', '.73': 'mahogany', '.75': 'mahogany', '.77': 'mahogany',
    '.8': 'pearl', '.81': 'pearl',
    '.16': 'violet',
    'WN': 'natural',
  },
  'chi': {
    'N': 'natural', 'NN': 'natural', 'NW': 'natural', 'NV': 'natural',
    'A': 'ash', 'AA': 'ash', 'S': 'ash',
    'B': 'beige', 'BB': 'beige', 'BV': 'beige',
    'G': 'gold', 'NG': 'gold', 'GN': 'gold',
    'CG': 'copper', 'C': 'copper', 'ROG': 'copper', 'RO': 'copper', 'CC': 'copper', 'RCC': 'copper',
    'R': 'red', 'RR': 'red',
    'RB': 'mahogany', 'CM': 'mahogany', 'CB': 'mahogany', 'WN': 'mahogany',
    'RV': 'violet', 'V': 'violet', 'I': 'violet',
    'W': 'warm', 'WR': 'warm',
  },
};

/**
 * Lookup a tone family for a brand + tone code.
 * Returns null if no mapping exists.
 */
export function getToneFamily(brand: string, toneCode: string): ToneFamily | null {
  const brandMap = RAW_MAPPINGS[brand];
  if (!brandMap) return null;
  const family = brandMap[toneCode];
  if (!family) return null;
  return family as ToneFamily;
}

/**
 * Get all tone codes for a given brand.
 */
export function getBrandToneCodes(brand: string): string[] {
  const brandMap = RAW_MAPPINGS[brand];
  if (!brandMap) return [];
  return Object.keys(brandMap);
}

/**
 * Check if a brand has a mapping for a given tone code.
 */
export function hasToneMapping(brand: string, toneCode: string): boolean {
  return getToneFamily(brand, toneCode) !== null;
}

/**
 * Get all brands that have tone mappings defined.
 */
export function getMappedBrands(): string[] {
  return Object.keys(RAW_MAPPINGS);
}

/**
 * Build a reverse lookup: toneFamily → toneCodes[] for a brand.
 */
export function getCodesForFamily(brand: string, toneFamily: ToneFamily): string[] {
  const brandMap = RAW_MAPPINGS[brand];
  if (!brandMap) return [];
  return Object.entries(brandMap)
    .filter(([, family]) => family === toneFamily)
    .map(([code]) => code);
}

export default RAW_MAPPINGS;
