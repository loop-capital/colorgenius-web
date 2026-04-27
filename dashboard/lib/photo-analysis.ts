// Photo Analysis Pipeline — OpenCV-based hair color analysis
// Detects: hair color level (1-10), tone, condition, gray %
// Uses colorthief for dominant color + custom pixel processing for gray/damage

import * as ColorThief from 'colorthief';
import { HAIR_LEVELS, TONE_DESCRIPTORS, ToneFamily } from './products';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HairAnalysisResult {
  currentLevel: number;           // 1-10
  currentLevelName: string;
  currentTone: ToneFamily;
  toneName: string;
  grayPercent: number;           // 0-100
  condition: HairCondition;
  conditionScore: number;        // 0-100 (100 = perfect)
  damageIndicators: DamageIndicators;
  warmthRatio: number;
  saturation: number;
  dominantHex: string;
  secondaryHex?: string;
  confidence: number;            // 0-1 overall
  faceDetected: boolean;
  hairRegionFound: boolean;
  recommendations: string[];
  rawMetrics: RawMetrics;
}

export type HairCondition = 
  | 'excellent'   // 85-100
  | 'good'        // 70-84
  | 'fair'        // 55-69
  | 'damaged'     // 40-54
  | 'severely_damaged'; // <40

export interface DamageIndicators {
  porosityEstimate: 'low' | 'medium' | 'high';
  splitEndDetected: boolean;
  drynessScore: number;          // 0-100
  shineScore: number;            // 0-100
  texture: 'smooth' | 'rough' | 'frizzy' | 'brittle';
}

export interface RawMetrics {
  avgBrightness: number;
  brightnessStdDev: number;
  redRatio: number;
  yellowRatio: number;
  blueRatio: number;
  grayPixelRatio: number;
  darkPixelRatio: number;
  lightPixelRatio: number;
  uniformity: number;             // 0-1, 1 = very uniform
  sampleSize: number;
}

// ─── Color Math Helpers ─────────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
}

// ─── Level Reference Database ─────────────────────────────────────────────

const LEVEL_REFERENCES = [
  { level: 1,  r: 9,   g: 8,   b: 13,  name: 'Black' },
  { level: 2,  r: 28,  g: 16,  b: 8,   name: 'Darkest Brown' },
  { level: 3,  r: 59,  g: 35,  b: 32,  name: 'Dark Brown' },
  { level: 4,  r: 92,  g: 58,  b: 40,  name: 'Medium Brown' },
  { level: 5,  r: 125, g: 80,  b: 56,  name: 'Light Brown' },
  { level: 6,  r: 156, g: 107, b: 64,  name: 'Dark Blonde' },
  { level: 7,  r: 192, g: 140, b: 90,  name: 'Medium Blonde' },
  { level: 8,  r: 212, g: 170, b: 125, name: 'Light Blonde' },
  { level: 9,  r: 232, g: 201, b: 155, name: 'Very Light Blonde' },
  { level: 10, r: 245, g: 230, b: 211, name: 'Lightest Blonde' },
];

// ─── Face Detection / Hair Region Isolation ─────────────────────────────────

/**
 * Naive face region detection using skin-tone pixel clustering.
 * Returns bounding box {x, y, w, h} or null if no face-like region found.
 */
function detectFaceRegion(pixels: Uint8ClampedArray, width: number, height: number): { x: number; y: number; w: number; h: number } | null {
  const skinMask = new Uint8Array(width * height);
  let skinCount = 0;

  // Pass 1: identify skin-like pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      if (isSkinTone(r, g, b)) {
        skinMask[y * width + x] = 1;
        skinCount++;
      }
    }
  }

  // Need minimum skin pixels to consider it a face
  if (skinCount < width * height * 0.005) return null;

  // Pass 2: find largest connected skin region (simple bounding box)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (skinMask[y * width + x]) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;

  // Sanity check: face should be roughly oval-ish proportions
  if (w < 20 || h < 20 || w / h > 2.5 || h / w > 2.5) return null;

  return { x: minX, y: minY, w, h };
}

function isSkinTone(r: number, g: number, b: number): boolean {
  // HSV-like skin detection with relaxed thresholds
  const brightness = (r + g + b) / 3;
  if (brightness < 40 || brightness > 230) return false;
  // Skin: R > G > B (roughly), R - G > threshold
  if (r < g || g < b * 0.7) return false;
  const rg = r - g;
  const rb = r - b;
  return rg > 8 && rb > 8 && rg < 80 && rb < 120;
}

/**
 * Extract hair region pixels based on face position.
 * Hair is typically above the face and extends to sides.
 */
function extractHairPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  face: { x: number; y: number; w: number; h: number } | null
): Array<{ r: number; g: number; b: number; x: number; y: number }> {
  const hairPixels: Array<{ r: number; g: number; b: number; x: number; y: number }> = [];

  // Define hair search region
  let searchY1 = 0, searchY2 = height;
  let searchX1 = 0, searchX2 = width;

  if (face) {
    // Hair is above face top, plus extends ~30% into face region (bangs)
    searchY2 = Math.min(height, face.y + Math.floor(face.h * 0.3));
    // Extend beyond face sides
    searchX1 = Math.max(0, face.x - Math.floor(face.w * 0.2));
    searchX2 = Math.min(width, face.x + face.w + Math.floor(face.w * 0.2));
  }

  for (let y = searchY1; y < searchY2; y++) {
    for (let x = searchX1; x < searchX2; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
      if (a < 128) continue;

      const brightness = (r + g + b) / 3;
      // Filter out skin-like, very dark (background/shadow), very light (glare)
      if (brightness < 12) continue;
      if (brightness > 248) continue;
      if (isSkinTone(r, g, b) && brightness > 80) continue;

      // Filter out obvious background colors (very saturated colors that aren't hair)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      // Skip extremely saturated non-hair colors (e.g., bright red/green/blue backgrounds)
      if (saturation > 0.85 && brightness > 120) continue;

      hairPixels.push({ r, g, b, x, y });
    }
  }

  return hairPixels;
}

// ─── Brightness / Contrast Normalization ────────────────────────────────────

function normalizeBrightness(pixels: Array<{ r: number; g: number; b: number }>): Array<{ r: number; g: number; b: number }> {
  if (pixels.length === 0) return pixels;

  const brightnesses = pixels.map(p => (p.r + p.g + p.b) / 3);
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;
  const targetBrightness = 128;
  const scale = targetBrightness / Math.max(avgBrightness, 1);

  // Clamp to prevent over-blowing
  const clampedScale = Math.min(scale, 1.8);

  return pixels.map(p => ({
    r: Math.min(255, Math.round(p.r * clampedScale)),
    g: Math.min(255, Math.round(p.g * clampedScale)),
    b: Math.min(255, Math.round(p.b * clampedScale)),
  }));
}

function autoContrast(pixels: Array<{ r: number; g: number; b: number }>): Array<{ r: number; g: number; b: number }> {
  if (pixels.length === 0) return pixels;

  const brightnesses = pixels.map(p => (p.r + p.g + p.b) / 3);
  const minB = Math.min(...brightnesses);
  const maxB = Math.max(...brightnesses);

  if (maxB - minB < 10) return pixels; // Already low contrast

  // Stretch to full range but keep some headroom
  const range = maxB - minB;
  const targetMin = 15;
  const targetMax = 240;

  return pixels.map(p => {
    const b = (p.r + p.g + p.b) / 3;
    const norm = (b - minB) / range;
    const newB = targetMin + norm * (targetMax - targetMin);
    const factor = newB / Math.max(b, 1);
    return {
      r: Math.min(255, Math.round(p.r * factor)),
      g: Math.min(255, Math.round(p.g * factor)),
      b: Math.min(255, Math.round(p.b * factor)),
    };
  });
}

// ─── Gray Detection ─────────────────────────────────────────────────────────

function detectGrayPixels(pixels: Array<{ r: number; g: number; b: number }>): {
  grayPixels: Array<{ r: number; g: number; b: number }>;
  grayPercent: number;
} {
  const grayPixels: Array<{ r: number; g: number; b: number }> = [];
  const grayThreshold = 18; // max channel diff for gray

  for (const p of pixels) {
    const avg = (p.r + p.g + p.b) / 3;
    const diff = Math.max(Math.abs(p.r - avg), Math.abs(p.g - avg), Math.abs(p.b - avg));
    // Gray: low saturation + brightness in hair range (not pure white/black)
    if (diff < grayThreshold && avg > 30 && avg < 220) {
      grayPixels.push(p);
    }
  }

  const grayPercent = pixels.length > 0 ? (grayPixels.length / pixels.length) * 100 : 0;
  return { grayPixels, grayPercent };
}

// ─── Level Detection ────────────────────────────────────────────────────────

function detectLevel(r: number, g: number, b: number): { level: number; confidence: number } {
  let closestLevel = 1;
  let minDistance = Infinity;

  for (const ref of LEVEL_REFERENCES) {
    const dist = colorDistance({ r, g, b }, { r: ref.r, g: ref.g, b: ref.b });
    if (dist < minDistance) {
      minDistance = dist;
      closestLevel = ref.level;
    }
  }

  // Confidence: closer = higher
  const confidence = Math.max(0, 1 - minDistance / 150);
  return { level: closestLevel, confidence };
}

// ─── Tone Detection ─────────────────────────────────────────────────────────

function detectTone(r: number, g: number, b: number, level: number): { tone: ToneFamily; warmthRatio: number; confidence: number } {
  const hsl = rgbToHsl(r, g, b);
  const { h, s } = hsl;

  // Warmth ratio: negative = cool, positive = warm
  let warmthRatio = 0;
  if (h >= 15 && h <= 60) warmthRatio = (h - 15) / 45;
  else if (h > 60 && h <= 120) warmthRatio = 1 - (h - 60) / 60;
  else if (h >= 180 && h <= 270) warmthRatio = -(h - 180) / 90 - 0.2;
  else if (h > 0 && h < 15) warmthRatio = -0.1;
  else warmthRatio = -0.1;

  // Tone classification
  let tone: ToneFamily = 'neutral';

  if (s < 0.08) {
    tone = 'neutral'; // very desaturated
  } else if (level <= 3) {
    if (warmthRatio > 0.3) tone = 'mahogany';
    else if (warmthRatio < -0.3) tone = 'cool';
    else tone = 'neutral';
  } else if (level <= 6) {
    if (h >= 0 && h <= 30) tone = 'red';
    else if (h > 30 && h <= 55) tone = 'copper';
    else if (h > 55 && h <= 75) tone = 'golden';
    else if (h >= 200 && h <= 270) tone = 'ash';
    else if (h >= 270 && h <= 330) tone = 'violet';
    else tone = 'neutral';
  } else {
    if (h >= 45 && h <= 75) tone = 'golden';
    else if (h >= 20 && h <= 45) tone = 'beige';
    else if (h >= 200 && h <= 270) tone = 'ash';
    else if (h >= 270 && h <= 330) tone = 'pearl';
    else if (h >= 330 || h <= 15) tone = 'warm';
    else tone = 'neutral';
  }

  const confidence = Math.abs(warmthRatio) > 0.3 ? 0.85 : s < 0.08 ? 0.4 : 0.65;
  return { tone, warmthRatio, confidence };
}

// ─── Damage Assessment ────────────────────────────────────────────────────────

function assessCondition(
  pixels: Array<{ r: number; g: number; b: number }>,
  grayPercent: number,
  uniformity: number,
  brightnessStdDev: number
): { condition: HairCondition; score: number; indicators: DamageIndicators } {
  const brightnesses = pixels.map(p => (p.r + p.g + p.b) / 3);
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;

  // Calculate roughness from brightness variance in local windows
  // High variance = potential frizz/damage
  let localVarianceSum = 0;
  const windowSize = 9;
  for (let i = windowSize; i < brightnesses.length - windowSize; i += windowSize) {
    const window = brightnesses.slice(i - windowSize, i + windowSize);
    const winAvg = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((s, b) => s + Math.pow(b - winAvg, 2), 0) / window.length;
    localVarianceSum += variance;
  }
  const avgLocalVariance = localVarianceSum / Math.max(1, Math.floor(brightnesses.length / windowSize));

  // Shine estimation: specular-like highlights = higher shine
  // Damaged hair has less shine (dull appearance)
  const highlightPixels = brightnesses.filter(b => b > avgBrightness * 1.3);
  const highlightRatio = highlightPixels.length / brightnesses.length;
  const shineScore = Math.min(100, highlightRatio * 500 + 20);

  // Dryness: low saturation + high brightness variance suggests dryness
  const sats = pixels.map(p => {
    const max = Math.max(p.r, p.g, p.b);
    const min = Math.min(p.r, p.g, p.b);
    return max === 0 ? 0 : (max - min) / max;
  });
  const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length;
  const drynessScore = Math.min(100, (1 - avgSat) * 80 + avgLocalVariance * 0.5);

  // Porosity: damaged = porous; high variance + low uniformity = porous
  let porosityEstimate: 'low' | 'medium' | 'high' = 'medium';
  if (uniformity < 0.5 || avgLocalVariance > 400) porosityEstimate = 'high';
  else if (uniformity > 0.8 && avgLocalVariance < 100) porosityEstimate = 'low';

  // Split end detection: very high local variance in specific brightness bands
  const splitEndDetected = avgLocalVariance > 600 && avgBrightness > 100;

  // Texture classification
  let texture: DamageIndicators['texture'] = 'smooth';
  if (avgLocalVariance > 800) texture = 'brittle';
  else if (avgLocalVariance > 400) texture = 'frizzy';
  else if (avgLocalVariance > 200) texture = 'rough';

  // Composite condition score
  let score = 70; // base
  score += shineScore * 0.2; // + up to 20
  score -= drynessScore * 0.2; // - up to 20
  score -= grayPercent * 0.3; // gray hair is coarser/drier
  score += uniformity * 15;
  score -= brightnessStdDev * 0.1;
  if (splitEndDetected) score -= 15;
  if (texture === 'brittle') score -= 10;
  if (texture === 'frizzy') score -= 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let condition: HairCondition;
  if (score >= 85) condition = 'excellent';
  else if (score >= 70) condition = 'good';
  else if (score >= 55) condition = 'fair';
  else if (score >= 40) condition = 'damaged';
  else condition = 'severely_damaged';

  return {
    condition,
    score,
    indicators: {
      porosityEstimate,
      splitEndDetected,
      drynessScore: Math.round(drynessScore),
      shineScore: Math.round(shineScore),
      texture,
    },
  };
}

// ─── Clustering (K-Means) ───────────────────────────────────────────────────

function kMeans(
  pixels: Array<{ r: number; g: number; b: number }>,
  k: number = 4
): Array<{ r: number; g: number; b: number; count: number }> {
  if (pixels.length === 0) return [];
  if (pixels.length < k) k = pixels.length;

  const centroids: Array<{ r: number; g: number; b: number }> = [];
  const used = new Set<number>();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push({ ...pixels[idx] });
    }
  }

  for (let iter = 0; iter < 12; iter++) {
    const clusters: Array<Array<{ r: number; g: number; b: number }>> = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let minDist = Infinity, closest = 0;
      for (let c = 0; c < k; c++) {
        const dist = colorDistance(p, centroids[c]);
        if (dist < minDist) { minDist = dist; closest = c; }
      }
      clusters[closest].push(p);
    }
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;
      centroids[c] = {
        r: Math.round(clusters[c].reduce((s, p) => s + p.r, 0) / clusters[c].length),
        g: Math.round(clusters[c].reduce((s, p) => s + p.g, 0) / clusters[c].length),
        b: Math.round(clusters[c].reduce((s, p) => s + p.b, 0) / clusters[c].length),
      };
    }
  }

  const clusters: Array<Array<{ r: number; g: number; b: number }>> = Array.from({ length: k }, () => []);
  for (const p of pixels) {
    let minDist = Infinity, closest = 0;
    for (let c = 0; c < k; c++) {
      const dist = colorDistance(p, centroids[c]);
      if (dist < minDist) { minDist = dist; closest = c; }
    }
    clusters[closest].push(p);
  }

  return centroids
    .map((c, i) => ({ ...c, count: clusters[i].length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

export async function analyzeHairPhoto(imageElement: HTMLImageElement): Promise<HairAnalysisResult> {
  // 1. Draw to canvas for pixel access
  const canvas = document.createElement('canvas');
  const maxDim = 400; // process at 400px for speed
  const scale = Math.min(maxDim / imageElement.width, maxDim / imageElement.height, 1);
  canvas.width = Math.round(imageElement.width * scale);
  canvas.height = Math.round(imageElement.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // 2. Face detection
  const faceRegion = detectFaceRegion(pixels, canvas.width, canvas.height);
  const faceDetected = faceRegion !== null;

  // 3. Extract hair region
  const hairPixelsRaw = extractHairPixels(pixels, canvas.width, canvas.height, faceRegion);
  const hairRegionFound = hairPixelsRaw.length > 50;

  if (!hairRegionFound) {
    // Fallback: sample center region
    const fallbackPixels: Array<{ r: number; g: number; b: number }> = [];
    const marginX = Math.floor(canvas.width * 0.2);
    const marginY = Math.floor(canvas.height * 0.2);
    for (let y = marginY; y < canvas.height - marginY; y += 2) {
      for (let x = marginX; x < canvas.width - marginX; x += 2) {
        const i = (y * canvas.width + x) * 4;
        fallbackPixels.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
      }
    }
    hairPixelsRaw.push(...fallbackPixels.map((p, i) => ({ ...p, x: marginX + (i % 100), y: marginY + Math.floor(i / 100) })));
  }

  // 4. Preprocessing: brightness/contrast normalization
  const hairColors = hairPixelsRaw.map(p => ({ r: p.r, g: p.g, b: p.b }));
  const normalizedColors = normalizeBrightness(hairColors);
  const processedColors = autoContrast(normalizedColors);

  // 5. Gray detection
  const { grayPercent } = detectGrayPixels(processedColors);

  // 6. Clustering
  const clusters = kMeans(processedColors, 4);
  const hairClusters = clusters.filter(c => {
    const brightness = (c.r + c.g + c.b) / 3;
    return brightness > 12 && brightness < 248;
  });

  const dominant = hairClusters[0] || clusters[0];
  const secondary = hairClusters[1];

  if (!dominant) {
    throw new Error('Could not detect hair color. Please use a clearer, well-lit photo.');
  }

  // 7. Level & Tone detection
  const { level: currentLevel, confidence: levelConf } = detectLevel(dominant.r, dominant.g, dominant.b);
  const { tone: currentTone, warmthRatio, confidence: toneConf } = detectTone(dominant.r, dominant.g, dominant.b, currentLevel);
  const hsl = rgbToHsl(dominant.r, dominant.g, dominant.b);

  // 8. Calculate metrics
  const brightnesses = processedColors.map(p => (p.r + p.g + p.b) / 3);
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;
  const brightnessStdDev = Math.sqrt(
    brightnesses.reduce((s, b) => s + Math.pow(b - avgBrightness, 2), 0) / brightnesses.length
  );
  const redRatio = processedColors.reduce((s, p) => s + p.r, 0) / processedColors.length / 255;
  const yellowRatio = processedColors.reduce((s, p) => s + Math.min(p.r, p.g) / Math.max(p.b, 1), 0) / processedColors.length;
  const blueRatio = processedColors.reduce((s, p) => s + p.b, 0) / processedColors.length / 255;
  const grayPixelRatio = grayPercent / 100;
  const darkPixelRatio = brightnesses.filter(b => b < 50).length / brightnesses.length;
  const lightPixelRatio = brightnesses.filter(b => b > 200).length / brightnesses.length;
  const uniformity = 1 - Math.min(1, brightnessStdDev / 80);

  // 9. Condition assessment
  const { condition, score: conditionScore, indicators } = assessCondition(
    processedColors, grayPercent, uniformity, brightnessStdDev
  );

  // 10. Overall confidence
  const confidence = Math.min(0.95, ((levelConf + toneConf) / 2) * (hairRegionFound ? 1 : 0.7));

  // 11. Recommendations
  const recommendations: string[] = [];
  if (grayPercent > 30) {
    recommendations.push(`High gray coverage (${Math.round(grayPercent)}%) — use permanent color with higher developer volume`);
  } else if (grayPercent > 10) {
    recommendations.push(`Moderate gray (${Math.round(grayPercent)}%) — consider demi-permanent or permanent with low-volume developer`);
  }
  if (condition === 'damaged' || condition === 'severely_damaged') {
    recommendations.push('Hair condition compromised — pre-treat with bond builder, use lower developer volume');
    if (indicators.porosityEstimate === 'high') {
      recommendations.push('High porosity detected — color may grab darker; go 1/2 level lighter');
    }
  }
  if (condition === 'fair') {
    recommendations.push('Fair condition — use demi-permanent or gentle permanent formula');
  }
  if (currentLevel <= 3 && currentTone !== 'ash') {
    recommendations.push('Dark base with warmth — ash or cool tones will prevent brassiness');
  }
  if (warmthRatio > 0.3 && currentLevel >= 6) {
    recommendations.push('Warm natural base — golden/copper shades will enhance warmth beautifully');
  }
  if (warmthRatio < -0.2 && currentLevel >= 5) {
    recommendations.push('Cool base detected — violet or ash tones will neutralize unwanted warmth');
  }
  if (secondary && Math.abs((secondary.r + secondary.g + secondary.b) / 3 - avgBrightness) > 40) {
    recommendations.push('Multi-tonal hair detected — balayage or color melting techniques recommended');
  }
  if (!faceDetected) {
    recommendations.push('Face not clearly detected — for best results, use a front-facing photo with good lighting');
  }

  return {
    currentLevel,
    currentLevelName: HAIR_LEVELS[currentLevel]?.name || 'Unknown',
    currentTone,
    toneName: TONE_DESCRIPTORS[currentTone] || currentTone,
    grayPercent: Math.round(grayPercent),
    condition,
    conditionScore,
    damageIndicators: indicators,
    warmthRatio,
    saturation: hsl.s,
    dominantHex: rgbToHex(dominant.r, dominant.g, dominant.b),
    secondaryHex: secondary ? rgbToHex(secondary.r, secondary.g, secondary.b) : undefined,
    confidence: Math.round(confidence * 100) / 100,
    faceDetected,
    hairRegionFound,
    recommendations,
    rawMetrics: {
      avgBrightness: Math.round(avgBrightness),
      brightnessStdDev: Math.round(brightnessStdDev),
      redRatio: Math.round(redRatio * 100) / 100,
      yellowRatio: Math.round(yellowRatio * 100) / 100,
      blueRatio: Math.round(blueRatio * 100) / 100,
      grayPixelRatio: Math.round(grayPixelRatio * 100) / 100,
      darkPixelRatio: Math.round(darkPixelRatio * 100) / 100,
      lightPixelRatio: Math.round(lightPixelRatio * 100) / 100,
      uniformity: Math.round(uniformity * 100) / 100,
      sampleSize: processedColors.length,
    },
  };
}

// ─── Server-side entry point (for API route) ───────────────────────────────

export async function analyzeImageBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<HairAnalysisResult> {
  // On server, we need to create an image from buffer
  // This requires canvas or sharp — for Next.js API routes, we use a data URL approach
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      analyzeHairPhoto(img).then(resolve).catch(reject);
    };
    img.onerror = () => reject(new Error('Failed to load image from buffer'));
    img.src = dataUrl;
  });
}
