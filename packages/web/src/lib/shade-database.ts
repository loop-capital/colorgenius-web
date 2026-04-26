/**
 * Professional Hair Color Shade Database
 * Covers: Wella Koleston, Redken Color Gels, Schwarzkopf IGORA ROYAL,
 *         Matrix SoColor, Goldwell Topchic, Joico LumiShine
 *
 * Each shade entry contains:
 *   brand, productLine, shadeCode, name, level (1-12),
 *   tone ('N','A','G','V','R','K','B','C','P'), isNatural,
 *   maxGrayCoverage, mixingRatio, developerDefault
 */

export interface ShadeEntry {
  brand: string;
  productLine: string;
  shadeCode: string;      // Display code (e.g., "6/0", "6N", "6-0")
  name: string;
  level: number;          // 1-12
  tone: string;           // N, A, G, V, R, K, B, C, P, M
  toneFamily: string;     // natural|ash|gold|violet|red|copper|beige|pearl|mahogany|brown
  isNatural: boolean;      // Natural-series shades for gray coverage
  isHighLift: boolean;
  isMixingShade: boolean; // Booster/corrector shades (0/X)
  rgb: [number, number, number];
  undertone: 'warm' | 'neutral' | 'cool';
  maxGrayCoverage: number; // 0-100
  maxLift: number;         // Max levels this shade can lift
  developerDefault: number;
  mixingRatio: string;
  baseProcessingMinutes: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WELLA KOLESTON PERFECT ME+  (notation: level/tone  e.g. 7/0, 8/1)
// ─────────────────────────────────────────────────────────────────────────────
const WELLA_KOLESTON: ShadeEntry[] = [
  // Level 2
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'2/0', name:'Darkest Brown Natural', level:2, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[26,16,8], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  // Level 3
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'3/0', name:'Dark Brown Natural', level:3, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[51,31,16], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  // Level 4
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'4/0', name:'Medium Brown Natural', level:4, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[74,46,22], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'4/07', name:'Medium Brown Natural Brown', level:4, tone:'N', toneFamily:'brown', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[74,46,22], undertone:'warm', maxGrayCoverage:100, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // Level 5
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'5/0', name:'Light Brown Natural', level:5, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'5/1', name:'Light Brown Ash', level:5, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'5/3', name:'Light Brown Gold', level:5, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[112,80,48], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'5/4', name:'Light Brown Red Gold', level:5, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[112,56,32], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'5/71', name:'Light Brown Brown Ash', level:5, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  // Level 6
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/0', name:'Dark Blonde Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/1', name:'Dark Blonde Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/2', name:'Dark Blonde Matt', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/3', name:'Dark Blonde Gold', level:6, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/4', name:'Dark Blonde Red Gold', level:6, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[130,72,40], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/5', name:'Dark Blonde Mahogany', level:6, tone:'M', toneFamily:'mahogany', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[110,60,40], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/6', name:'Dark Blonde Violet', level:6, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[130,70,100], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/7', name:'Dark Blonde Brown', level:6, tone:'N', toneFamily:'brown', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/16', name:'Dark Blonde Ash Violet', level:6, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[130,70,100], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'6/81', name:'Dark Blonde Pearl Ash', level:6, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // Level 7
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/0', name:'Medium Blonde Natural', level:7, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/1', name:'Medium Blonde Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/2', name:'Medium Blonde Matt', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/3', name:'Medium Blonde Gold', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,128,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/4', name:'Medium Blonde Red Gold', level:7, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[165,96,52], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/7', name:'Medium Blonde Brown', level:7, tone:'N', toneFamily:'brown', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/16', name:'Medium Blonde Violet Ash', level:7, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[165,100,130], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'7/73', name:'Medium Blonde Gold Brown', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,128,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // Level 8
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/0', name:'Light Blonde Natural', level:8, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/1', name:'Light Blonde Ash', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/2', name:'Light Blonde Matt', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/3', name:'Light Blonde Gold', level:8, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[200,160,96], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/4', name:'Light Blonde Red Gold', level:8, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[190,120,64], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/16', name:'Light Blonde Ash Violet', level:8, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[192,128,158], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'8/81', name:'Light Blonde Pearl Ash', level:8, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // Level 9
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'9/0', name:'Very Light Blonde Natural', level:9, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'9/1', name:'Very Light Blonde Ash', level:9, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'9/3', name:'Very Light Blonde Gold', level:9, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[224,192,120], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'9/16', name:'Very Light Blonde Violet Ash', level:9, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[215,152,178], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'9/38', name:'Very Light Blonde Beige Gold', level:9, tone:'G', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[220,190,130], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // Level 10
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'10/0', name:'Lightest Blonde Natural', level:10, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[232,208,144], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'10/1', name:'Lightest Blonde Ash', level:10, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[232,208,144], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'10/16', name:'Lightest Blonde Violet Ash', level:10, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[235,185,200], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'10/38', name:'Lightest Blonde Beige Gold', level:10, tone:'G', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[240,215,155], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  // High Lift 12-series
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'12/0', name:'Special Blonde Natural', level:12, tone:'N', toneFamily:'natural', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,232,176], undertone:'neutral', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'12/1', name:'Special Blonde Ash', level:12, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,232,176], undertone:'cool', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'12/16', name:'Special Blonde Ash Violet', level:12, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,220,220], undertone:'cool', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'12/61', name:'Special Blonde Violet Ash', level:12, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,220,220], undertone:'cool', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'12/81', name:'Special Blonde Pearl Ash', level:12, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,232,176], undertone:'cool', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  // Mixing shades (boosters)
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/00', name:'Natural Concentrate', level:0, tone:'N', toneFamily:'natural', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[0,0,0], undertone:'neutral', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/11', name:'Intense Ash', level:0, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[128,128,128], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/22', name:'Intense Matt', level:0, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[128,128,128], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/28', name:'Matt Pearl', level:0, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[160,160,180], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/33', name:'Intense Gold', level:0, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[200,160,50], undertone:'warm', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/43', name:'Red Gold', level:0, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[180,80,30], undertone:'warm', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/66', name:'Intense Violet', level:0, tone:'V', toneFamily:'violet', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[100,50,150], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/81', name:'Pearl Ash', level:0, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[160,160,190], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
  { brand:'Wella Koleston Perfect ME+', productLine:'Koleston Perfect ME+', shadeCode:'0/88', name:'Intense Pearl', level:0, tone:'A', toneFamily:'pearl', isNatural:false, isHighLift:false, isMixingShade:true, rgb:[180,180,210], undertone:'cool', maxGrayCoverage:0, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:20 },
];

// ─────────────────────────────────────────────────────────────────────────────
// REDKEN COLOR GELS LACQUERS  (notation: level+tone e.g. 6N, 8G, 10A)
// ─────────────────────────────────────────────────────────────────────────────
const REDKEN_CGL: ShadeEntry[] = [
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'5N', name:'Light Brown Natural', level:5, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'5G', name:'Light Brown Gold', level:5, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[112,80,48], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'5NA', name:'Light Brown Neutral Ash', level:5, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6N', name:'Dark Blonde Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6G', name:'Dark Blonde Gold', level:6, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6A', name:'Dark Blonde Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6NA', name:'Dark Blonde Neutral Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6R', name:'Dark Blonde Red', level:6, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[130,56,36], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'6GN', name:'Dark Blonde Gold Natural', level:6, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'7N', name:'Medium Blonde Natural', level:7, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'7G', name:'Medium Blonde Gold', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,128,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'7A', name:'Medium Blonde Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'7NA', name:'Medium Blonde Neutral Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'7NW', name:'Medium Blonde Neutral Warm', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'8N', name:'Light Blonde Natural', level:8, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'8G', name:'Light Blonde Gold', level:8, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[200,160,96], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'8A', name:'Light Blonde Ash', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'8C', name:'Light Blonde Cool', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'9N', name:'Very Light Blonde Natural', level:9, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'9A', name:'Very Light Blonde Ash', level:9, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'10N', name:'Lightest Blonde Natural', level:10, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:true, isMixingShade:false, rgb:[232,208,144], undertone:'neutral', maxGrayCoverage:80, maxLift:2, developerDefault:30, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Redken Color Gels Lacquers', productLine:'Color Gels Lacquers', shadeCode:'10A', name:'Lightest Blonde Ash', level:10, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[232,208,144], undertone:'cool', maxGrayCoverage:80, maxLift:2, developerDefault:30, mixingRatio:'1:1', baseProcessingMinutes:40 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHWARZKOPF IGORA ROYAL  (notation: level-tone e.g. 6-0, 8-1)
// ─────────────────────────────────────────────────────────────────────────────
const SCHWARZKOPF_IGORA: ShadeEntry[] = [
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'3-0', name:'Dark Brown Natural', level:3, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[51,31,16], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'4-0', name:'Medium Brown Natural', level:4, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[74,46,22], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'5-0', name:'Light Brown Natural', level:5, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'5-4', name:'Light Brown Beige', level:5, tone:'B', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[120,95,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'5-68', name:'Light Brown Chocolate Red', level:5, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[100,52,32], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'6-0', name:'Dark Blonde Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'6-1', name:'Dark Blonde Cendre (Ash)', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'6-4', name:'Dark Blonde Beige', level:6, tone:'B', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[148,112,80], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'6-5', name:'Dark Blonde Gold', level:6, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'6-88', name:'Dark Blonde Intense Red', level:6, tone:'R', toneFamily:'red', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[120,48,28], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'7-0', name:'Medium Blonde Natural', level:7, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'7-1', name:'Medium Blonde Cendre (Ash)', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'7-4', name:'Medium Blonde Beige', level:7, tone:'B', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,140,96], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'7-77', name:'Medium Blonde Intense Copper', level:7, tone:'K', toneFamily:'copper', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[180,100,40], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'8-0', name:'Light Blonde Natural', level:8, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'8-1', name:'Light Blonde Cendre (Ash)', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'8-4', name:'Light Blonde Beige', level:8, tone:'B', toneFamily:'beige', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[200,168,120], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'9-0', name:'Very Light Blonde Natural', level:9, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'9-1', name:'Very Light Blonde Cendre (Ash)', level:9, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'10-0', name:'Lightest Blonde Natural', level:10, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:true, isMixingShade:false, rgb:[232,208,144], undertone:'neutral', maxGrayCoverage:100, maxLift:1, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'12-0', name:'Special Blonde Natural', level:12, tone:'N', toneFamily:'natural', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,232,176], undertone:'neutral', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
  { brand:'Schwarzkopf Igora Royal', productLine:'Igora Royal', shadeCode:'12-11', name:'Special Blonde Cendre Ash', level:12, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:true, isMixingShade:false, rgb:[248,232,176], undertone:'cool', maxGrayCoverage:50, maxLift:4, developerDefault:40, mixingRatio:'1:1', baseProcessingMinutes:45 },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATRIX SOCOLOR  (notation: level + letter code e.g. 6N, 8G)
// ─────────────────────────────────────────────────────────────────────────────
const MATRIX_SOCOLOR: ShadeEntry[] = [
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'5N', name:'Light Brown Natural', level:5, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'6N', name:'Dark Blonde Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'6G', name:'Dark Blonde Gold', level:6, tone:'G', toneFamily:'gold', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'6A', name:'Dark Blonde Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'6NA', name:'Dark Blonde Neutral Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'7N', name:'Medium Blonde Natural', level:7, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'7G', name:'Medium Blonde Gold', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,128,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'7A', name:'Medium Blonde Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'7NA', name:'Medium Blonde Neutral Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'8N', name:'Light Blonde Natural', level:8, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'8G', name:'Light Blonde Gold', level:8, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[200,160,96], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:40 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'9N', name:'Very Light Blonde Natural', level:9, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'9NA', name:'Very Light Blonde Neutral Ash', level:9, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Matrix SoColor', productLine:'SoColor', shadeCode:'10N', name:'Lightest Blonde Natural', level:10, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:true, isMixingShade:false, rgb:[232,208,144], undertone:'neutral', maxGrayCoverage:80, maxLift:2, developerDefault:30, mixingRatio:'1:1', baseProcessingMinutes:40 },
];

// ─────────────────────────────────────────────────────────────────────────────
// GOLDWELL TOPCHIC  (notation: level + letters e.g. 6N, 8G)
// ─────────────────────────────────────────────────────────────────────────────
const GOLDWELL_TOPCHIC: ShadeEntry[] = [
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'5N', name:'Light Brown Natural', level:5, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'5A', name:'Light Brown Ash', level:5, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[92,58,32], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'6N', name:'Dark Blonde Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'6A', name:'Dark Blonde Ash', level:6, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'6G', name:'Dark Blonde Gold', level:6, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[140,96,56], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'6NN', name:'Dark Blonde Intense Natural', level:6, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[122,80,48], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'7N', name:'Medium Blonde Natural', level:7, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'7A', name:'Medium Blonde Ash', level:7, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[158,108,58], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'7G', name:'Medium Blonde Gold', level:7, tone:'G', toneFamily:'gold', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[176,128,72], undertone:'warm', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:35 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'8N', name:'Light Blonde Natural', level:8, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'8A', name:'Light Blonde Ash', level:8, tone:'A', toneFamily:'ash', isNatural:false, isHighLift:false, isMixingShade:false, rgb:[184,144,80], undertone:'cool', maxGrayCoverage:80, maxLift:0, developerDefault:20, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'9N', name:'Very Light Blonde Natural', level:9, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:false, isMixingShade:false, rgb:[210,176,104], undertone:'neutral', maxGrayCoverage:100, maxLift:0, developerDefault:10, mixingRatio:'1:1', baseProcessingMinutes:30 },
  { brand:'Goldwell Topchic', productLine:'Topchic', shadeCode:'10N', name:'Lightest Blonde Natural', level:10, tone:'N', toneFamily:'natural', isNatural:true, isHighLift:true, isMixingShade:false, rgb:[232,208,144], undertone:'neutral', maxGrayCoverage:80, maxLift:2, developerDefault:30, mixingRatio:'1:1', baseProcessingMinutes:40 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ALL SHADES COMBINED
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_SHADES: ShadeEntry[] = [
  ...WELLA_KOLESTON,
  ...REDKEN_CGL,
  ...SCHWARZKOPF_IGORA,
  ...MATRIX_SOCOLOR,
  ...GOLDWELL_TOPCHIC,
];

// ─────────────────────────────────────────────────────────────────────────────
// BRAND LOOKUP
// ─────────────────────────────────────────────────────────────────────────────
export const BRANDS = [
  { id: 'wella-koleston', name: 'Wella Koleston Perfect ME+', code: 'WKPM' },
  { id: 'redken-cgl', name: 'Redken Color Gels Lacquers', code: 'RCGL' },
  { id: 'schwarzkopf-igora', name: 'Schwarzkopf Igora Royal', code: 'SKIR' },
  { id: 'matrix-socolor', name: 'Matrix SoColor', code: 'MTSC' },
  { id: 'goldwell-topchic', name: 'Goldwell Topchic', code: 'GWTC' },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUERY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find shades by brand. If brand is empty/undefined, searches all.
 */
export function findShadesByBrand(brand: string): ShadeEntry[] {
  if (!brand) return ALL_SHADES;
  const lower = brand.toLowerCase();
  return ALL_SHADES.filter(s =>
    s.brand.toLowerCase().includes(lower) ||
    s.productLine.toLowerCase().includes(lower)
  );
}

/**
 * Find the closest shade to the target level and tone.
 * Priority: exact level + exact tone > same level + same family > nearest level
 */
export function findShade(
  level: number,
  tone: string,
  brand?: string,
  preferNatural = false
): ShadeEntry | null {
  const pool = brand ? findShadesByBrand(brand) : ALL_SHADES;

  // Filter out mixing shades for normal lookups
  const candidates = pool.filter(s => !s.isMixingShade);

  // 1. Exact match
  let exact = candidates.filter(s => s.level === level && s.tone === tone && !s.isHighLift);
  if (exact.length > 0) {
    if (preferNatural) {
      const natural = exact.find(s => s.isNatural);
      return natural || exact[0];
    }
    return exact[0];
  }

  // 2. Same level, same tone family
  let sameLevel = candidates.filter(s => s.level === level && !s.isHighLift);
  if (sameLevel.length > 0) {
    if (preferNatural) {
      const natural = sameLevel.find(s => s.isNatural);
      return natural || sameLevel[0];
    }
    // Try same undertone
    const sameUndertone = sameLevel.find(s => s.undertone === getUndertone(tone));
    return sameUndertone || sameLevel[0];
  }

  // 3. Nearest level, same tone
  const sorted = [...candidates]
    .filter(s => s.tone === tone && !s.isHighLift)
    .sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
  if (sorted.length > 0) return sorted[0];

  // 4. Nearest level, any tone
  const anySorted = [...candidates]
    .filter(s => !s.isHighLift)
    .sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
  return anySorted[0] || null;
}

/**
 * Get undertone category from tone letter
 */
export function getUndertone(tone: string): 'warm' | 'cool' | 'neutral' {
  const toneLower = tone.toUpperCase();
  if (['G', 'K', 'R', 'C', 'O'].includes(toneLower)) return 'warm';
  if (['A', 'V', 'B', 'P'].includes(toneLower)) return 'cool';
  return 'neutral';
}

/**
 * Neutralize unwanted warmth based on lift level.
 * When lifting, underlying warm pigments (orange/red) are exposed and need neutralization.
 */
export function getNeutralizerForLift(liftLevels: number, targetTone: string): string | null {
  if (liftLevels === 0) return null;

  // If target is already cool (ash/violet), no extra neutralizer needed
  if (['A', 'V'].includes(targetTone.toUpperCase())) return null;

  // Lifting 1 level → orange undertone exposed → needs blue (ash)
  if (liftLevels >= 1) return 'A';
  return null;
}

/**
 * Calculate developer volume based on lift required.
 */
export function calculateDeveloperVolume(
  liftRequired: number,
  options: {
    grayPercentage?: number;
    isVirgin?: boolean;
    hasHighPorosity?: boolean;
    hasDamage?: boolean;
  } = {}
): number {
  const { grayPercentage = 0, isVirgin = true, hasHighPorosity = false, hasDamage = false } = options;

  let base: number;
  if (liftRequired <= 0) {
    base = 10; // Deposit only
  } else if (liftRequired === 1) {
    base = 20;
  } else if (liftRequired === 2) {
    base = 20;
  } else if (liftRequired === 3) {
    base = 30;
  } else {
    base = 40; // Max lift
  }

  // Reduce for high porosity (absorbs faster)
  if (hasHighPorosity && base > 20) base = 20;

  // Reduce for damaged hair
  if (hasDamage && base > 20) base = 20;

  // Boost for gray coverage on deposit
  if (liftRequired <= 0 && grayPercentage > 30 && base < 20) base = 20;

  // Boost for resistant non-virgin hair
  if (!isVirgin && liftRequired > 0 && base < 30) base = 30;

  return base;
}

/**
 * Calculate processing time in minutes.
 */
export function calculateProcessingTime(
  developerVolume: number,
  options: {
    grayPercentage?: number;
    isVirgin?: boolean;
    liftRequired?: number;
    serviceType?: string;
  } = {}
): number {
  const { grayPercentage = 0, isVirgin = true, liftRequired = 0, serviceType = 'full_color' } = options;

  let baseTime = developerVolume <= 10 ? 25 :
                 developerVolume <= 20 ? 30 :
                 developerVolume <= 30 ? 35 : 40;

  // Root touch-up is faster
  if (serviceType === 'root_touchup') baseTime = Math.max(20, baseTime - 10);

  // Gray coverage needs extra time
  if (grayPercentage > 50) baseTime += 10;
  else if (grayPercentage > 30) baseTime += 5;

  // Non-virgin may need longer for even coverage
  if (!isVirgin && liftRequired > 0) baseTime += 5;

  return baseTime;
}

/**
 * Estimate cost per gram/oz of color product.
 * In reality this would come from a pricing database.
 */
export function estimateShadeCost(shade: ShadeEntry, amountGrams: number): number {
  // Rough professional pricing: ~$0.08-0.12 per gram depending on brand tier
  const costPerGram: Record<string, number> = {
    'Wella Koleston Perfect ME+': 0.10,
    'Redken Color Gels Lacquers': 0.12,
    'Schwarzkopf Igora Royal': 0.09,
    'Matrix SoColor': 0.07,
    'Goldwell Topchic': 0.11,
  };
  const perGram = costPerGram[shade.brand] || 0.09;
  return perGram * amountGrams;
}
