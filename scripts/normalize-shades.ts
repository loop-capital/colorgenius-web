import * as fs from 'fs';
import * as path from 'path';

interface NormalizedShade {
  code: string;
  brand: string;
  line: string;
  level: number;
  toneFamily: string;
  toneCode: string;
  name: string;
  hex: string;
  isHighLift: boolean;
  isDemi: boolean;
  grayCoverage: "none" | "0-50%" | "50-100%" | "100%" | null;
}

const VALID_FAMILIES = [
  "natural", "ash", "blue-ash", "green-ash", "gold", "copper", "red",
  "violet", "pearl", "beige", "mahogany", "chocolate", "warm", "matte", "rose", "specialty"
];

function normalizeBrand(brandSlug: string) {
  return brandSlug
    .replace(/-pro$/, "pro")
    .replace(/-murphy$/, "murphy")
    .replace(/^kevin-/, "kevin")
    .replace(/-eq$/, "eq")
    .replace(/-xg$/, "xg")
    .replace(/-8$/, "8");
}

function isDemiLine(brand: string, line: string, specData?: any): boolean {
  if (specData && specData.lines) {
    const match = specData.lines.find((l: any) =>
      (l.shortName || l.name || "").toLowerCase().includes(line.toLowerCase())
    );
    if (match) {
      const t = (match.type || "").toLowerCase();
      return t === "demi-permanent" || t === "demi" || t === "acidic-toner" || t === "acidic";
    }
  }
  const l = line.toLowerCase();
  return l.includes("demi") || l.includes("tonal") || l.includes("toner") || l.includes("eq") || l.includes("sync") || l.includes("dialight") || l.includes("diacolor") || l.includes("illumina") || l.includes("shinefinity");
}

function mapToneCode(brand: string, code: string, toneCode: string): string {
  const toneMapPath = "data/brands/tone-family-map.json";
  const toneMap = JSON.parse(fs.readFileSync(toneMapPath, "utf-8"));

  // Try brand-specific mappings
  const brandMappings: Record<string, string> = {
    "wella": "wella",
    "wella-illumina": "wella-illumina",
    "wella-shinefinity": "wella-shinefinity",
    "redken-shades-eq": "redken-shades-eq",
    "redken-color-gels-lacquers": "redken-color-gels-lacquers",
    "joico-lumishine": "joico-lumishine",
    "matrix-socolor": "matrix-socolor",
    "matrix-socolor-sync": "matrix-socolor-sync",
    "matrix-super-sync": "matrix-super-sync",
    "matrix-tonal-control": "matrix-tonal-control",
    "pravana-vivids": "pravana-vivids",
    "pulp-riot-faction8": "pulp-riot-faction8",
    "pulp-riot-liquid-demi": "pulp-riot-liquid-demi",
    "kevinmurphy": "kevinmurphy",
    "lorealpro": "lorealpro",
    "oligo": "oligo",
    "schwarzkopf": "schwarzkopf",
    "moroccanoil": "moroccanoil",
    "lanza": "lanza",
    "davines": "davines",
    "aveda": "aveda"
  };

  const mappingKey = brandMappings[brand] || brand;
  const brandMap = toneMap[mappingKey];

  if (brandMap) {
    const t = (toneCode || "").toString();
    if (brandMap[t]) return brandMap[t];
    // Try without leading dot
    if (t.startsWith(".") && brandMap[t.slice(1)]) return brandMap[t.slice(1)];
    if (!t.startsWith(".") && brandMap["." + t]) return brandMap["." + t];
  }

  // Fallback: try universal families
  const family = (toneCode || "").toLowerCase();
  if (VALID_FAMILIES.includes(family)) return family;

  // Heuristic fallback
  const familyMap: Record<string, string> = {
    "n": "natural", "nn": "natural", "na": "ash", "a": "ash", "aa": "ash",
    "av": "ash", "v": "violet", "vv": "violet", "vr": "violet", "rv": "mahogany",
    "g": "gold", "gg": "gold", "cg": "gold", "ng": "gold", "nj": "gold",
    "c": "copper", "cc": "copper", "cb": "copper", "co": "copper", "rc": "copper",
    "r": "red", "rr": "red", "rb": "mahogany", "br": "mahogany", "bc": "copper",
    "m": "chocolate", "mm": "chocolate", "mb": "chocolate", "bm": "chocolate",
    "b": "beige", "bv": "beige", "nv": "violet", "nw": "warm", "w": "warm",
    "p": "pearl", "t": "ash", "d": "cool", "blue": "cool", "red": "red",
    "0": "natural", "00": "natural", "01": "natural",
    "1": "ash", "2": "ash", "3": "gold", "4": "copper", "5": "mahogany",
    "6": "red", "7": "chocolate", "8": "ash", "9": "pearl"
  };

  if (familyMap[family]) return familyMap[family];

  return "specialty";
}

function extractLevel(code: string): number {
  const match = code.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function isHighLift(code: string, level: number, isHL?: boolean): boolean {
  if (isHL === true) return true;
  if (level >= 12) return true;
  if (/HL|High.?Lift|Special.?Blonde|Ultra.?Blonde|Highlift/i.test(code)) return true;
  return false;
}

function hexForLevelTone(level: number, toneFamily: string): string {
  const baseHexes: Record<string, string> = {
    "natural": "#3d3d3d", "ash": "#4a4a5e", "blue-ash": "#3a3a55",
    "green-ash": "#4a5a4a", "gold": "#c4a055", "copper": "#b87333",
    "red": "#8b2500", "violet": "#6b3a7d", "pearl": "#e8e0d5",
    "beige": "#b8a088", "mahogany": "#5c2818", "chocolate": "#4a2e1a",
    "warm": "#c49060", "matte": "#5a5a5a", "rose": "#b8787d", "specialty": "#a0a0a0"
  };

  const lightening: Record<number, number> = {
    1: 0.1, 2: 0.15, 3: 0.25, 4: 0.35, 5: 0.45, 6: 0.55,
    7: 0.65, 8: 0.75, 9: 0.85, 10: 0.92, 11: 0.96, 12: 1.0
  };

  const base = baseHexes[toneFamily] || "#808080";
  const factor = lightening[level] || 0.5;

  const r = Math.min(255, Math.round(parseInt(base.slice(1, 3), 16) + (255 - parseInt(base.slice(1, 3), 16)) * factor));
  const g = Math.min(255, Math.round(parseInt(base.slice(3, 5), 16) + (255 - parseInt(base.slice(3, 5), 16)) * factor));
  const b = Math.min(255, Math.round(parseInt(base.slice(5, 7), 16) + (255 - parseInt(base.slice(5, 7), 16)) * factor));

  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function parseGrayCoverage(coverage: any): NormalizedShade["grayCoverage"] {
  if (coverage === null || coverage === undefined) return null;
  const s = String(coverage).toLowerCase();
  if (s.includes("none") || s.includes("not for") || s.includes("0%")) return "none";
  if (s.includes("50-100") || s.includes("50% to 100%") || s.includes("up to 100%") || s.includes("100%")) return "100%";
  if (s.includes("50") || s.includes("up to 75%") || s.includes("up to 70%") || s.includes("up to 85%")) return "50-100%";
  if (s.includes("25") || s.includes("up to 50%") || s.includes("0-50%") || s.includes("grey blending")) return "0-50%";
  if (s.includes("blend") || s.includes("blending")) return "0-50%";
  return null;
}

function loadSpecFile(brandDir: string, shadeFile: string): any | undefined {
  const baseName = shadeFile.replace(/-shades\.json$/, "");
  const possibleNames = [
    `${baseName}-specs.json`,
    "specs.json",
    brandDir + "-specs.json"
  ];

  for (const name of possibleNames) {
    const p = path.join(brandDir, name);
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      } catch { /* ignore */ }
    }
  }
  return undefined;
}

function normalizeShade(raw: any, brand: string, line: string, specData?: any): NormalizedShade {
  const code = raw.code || "";
  const level = raw.level || extractLevel(code);
  const toneCode = raw.toneCode || raw.tone || raw.primaryTone || "";
  const toneFamily = raw.toneFamily || mapToneCode(brand, code, toneCode);
  const name = raw.name || "";
  const isDemi = isDemiLine(brand, line, specData);
  const isHL = isHighLift(code, level, raw.highLift);
  const grayCoverage = parseGrayCoverage(raw.coverage || raw.grayCoverage || null);

  return {
    code,
    brand,
    line,
    level,
    toneFamily: VALID_FAMILIES.includes(toneFamily) ? toneFamily : "specialty",
    toneCode: String(toneCode),
    name,
    hex: raw.hex || hexForLevelTone(level, toneFamily),
    isHighLift: isHL,
    isDemi,
    grayCoverage
  };
}

function processBrand(brandSlug: string): NormalizedShade[] {
  const brandDir = path.join("data/brands", brandSlug);
  const files = fs.readdirSync(brandDir);
  const shadeFiles = files.filter(f => f.endsWith("-shades.json") || f === "shades.json");

  const allShades: NormalizedShade[] = [];

  for (const sf of shadeFiles) {
    const specData = loadSpecFile(brandDir, sf);
    const rawData = JSON.parse(fs.readFileSync(path.join(brandDir, sf), "utf-8"));

    let line = sf.replace(/-shades\.json$/, "").replace(/\.json$/, "");
    if (line === "shades") line = brandSlug;

    if (Array.isArray(rawData)) {
      for (const s of rawData) {
        allShades.push(normalizeShade(s, brandSlug, line, specData));
      }
    } else if (typeof rawData === "object" && rawData !== null) {
      if (rawData.shades && Array.isArray(rawData.shades)) {
        for (const s of rawData.shades) {
          allShades.push(normalizeShade(s, brandSlug, line, specData));
        }
      } else if (rawData.series && Array.isArray(rawData.series)) {
        for (const series of rawData.series) {
          const seriesLine = series.name || series.line || line;
          if (series.shades && Array.isArray(series.shades)) {
            for (const s of series.shades) {
              allShades.push(normalizeShade(s, brandSlug, seriesLine, specData));
            }
          }
        }
      } else if (rawData.shades && typeof rawData.shades === 'object' && !Array.isArray(rawData.shades)) {
        // Davines-style: shades keyed by line name
        for (const lineName of Object.keys(rawData.shades)) {
          const lineShades = rawData.shades[lineName];
          if (Array.isArray(lineShades)) {
            for (const s of lineShades) {
              allShades.push(normalizeShade(s, brandSlug, lineName, specData));
            }
          }
        }
      } else if (rawData.lines && Array.isArray(rawData.lines)) {
        for (const l of rawData.lines) {
          const lineName = l.name || l.type || line;
          if (l.shades && Array.isArray(l.shades)) {
            for (const s of l.shades) {
              allShades.push(normalizeShade(s, brandSlug, lineName, specData));
            }
          }
          if (l.levels) {
            for (const lvl of l.levels) {
              if (lvl.shades && Array.isArray(lvl.shades)) {
                for (const s of lvl.shades) {
                  allShades.push(normalizeShade(s, brandSlug, lineName, specData));
                }
              }
              if (lvl.series) {
                for (const s2 of lvl.series) {
                  if (s2.shades && Array.isArray(s2.shades)) {
                    for (const s of s2.shades) {
                      allShades.push(normalizeShade(s, brandSlug, lineName, specData));
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return allShades;
}

function main() {
  const brandsDir = "data/brands";
  const brandDirs = fs.readdirSync(brandsDir).filter(d => {
    const p = path.join(brandsDir, d);
    return fs.statSync(p).isDirectory();
  });

  let grandTotal = 0;
  const allNormalized: NormalizedShade[] = [];
  const summary: Record<string, Record<string, number>> = {};
  const toneSummary: Record<string, Record<string, number>> = {};

  for (const brand of brandDirs) {
    console.log(`Processing ${brand}...`);
    const normalized = processBrand(brand);
    grandTotal += normalized.length;
    allNormalized.push(...normalized);

    const outPath = path.join(brandsDir, brand, "shades-normalized.json");
    fs.writeFileSync(outPath, JSON.stringify(normalized, null, 2));
    console.log(`  Wrote ${normalized.length} shades to ${outPath}`);

    summary[brand] = {};
    toneSummary[brand] = {};
    for (const s of normalized) {
      summary[brand][s.line] = (summary[brand][s.line] || 0) + 1;
      toneSummary[brand][s.toneFamily] = (toneSummary[brand][s.toneFamily] || 0) + 1;
    }
  }

  // Write master file
  const masterPath = path.join(brandsDir, "all-shades-normalized.json");
  fs.writeFileSync(masterPath, JSON.stringify(allNormalized, null, 2));
  console.log(`\nMaster file written: ${allNormalized.length} total shades`);

  // Write summary
  const summaryReport = {
    totalShades: grandTotal,
    brands: brandDirs.length,
    byBrand: summary,
    byBrandAndTone: toneSummary,
    generatedAt: new Date().toISOString()
  };

  const summaryPath = path.join(brandsDir, "normalization-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
  console.log(`Summary written to ${summaryPath}`);
}

main();
