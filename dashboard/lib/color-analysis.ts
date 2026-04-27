// Color Analysis Engine — Canvas-based hair color extraction
// Uses pixel sampling to extract dominant colors and map them to hair color levels

import { HAIR_LEVELS, TONE_DESCRIPTORS, ToneFamily } from './products';

export interface AnalyzedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  level: number;
  levelName: string;
  tone: ToneFamily;
  toneName: string;
  confidence: number; // 0-1
  warmthRatio: number; // negative = cool, positive = warm
  saturation: number;
}

export interface AnalysisResult {
  dominant: AnalyzedColor;
  secondary?: AnalyzedColor;
  undertone: AnalyzedColor;
  skinTone: 'warm' | 'cool' | 'neutral' | 'olive';
  contrast: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// ─── Color Math Helpers ────────────────────────────────────────────────────────

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

// ─── Level Detection ───────────────────────────────────────────────────────────

// Reference colors for hair levels 1-10
const LEVEL_REFERENCES: Array<{ level: number; r: number; g: number; b: number; warm?: boolean }> = [
  { level: 1,  r: 9,   g: 8,   b: 13  }, // Black
  { level: 2,  r: 28,  g: 16,  b: 8   }, // Darkest Brown
  { level: 3,  r: 59,  g: 35,  b: 32  }, // Dark Brown
  { level: 4,  r: 92,  g: 58,  b: 40  }, // Medium Brown
  { level: 5,  r: 125, g: 80,  b: 56  }, // Light Brown
  { level: 6,  r: 156, g: 107, b: 64  }, // Dark Blonde
  { level: 7,  r: 192, g: 140, b: 90  }, // Medium Blonde
  { level: 8,  r: 212, g: 170, b: 125 }, // Light Blonde
  { level: 9,  r: 232, g: 201, b: 155 }, // Very Light Blonde
  { level: 10, r: 245, g: 230, b: 211 }, // Lightest Blonde
];

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

  // Confidence: closer = higher, max distance ~200
  const confidence = Math.max(0, 1 - minDistance / 150);
  return { level: closestLevel, confidence };
}

// ─── Tone Detection ─────────────────────────────────────────────────────────────

function detectTone(r: number, g: number, b: number, level: number): { tone: ToneFamily; warmthRatio: number; confidence: number } {
  const hsl = rgbToHsl(r, g, b);
  const { h, s } = hsl;

  // Warmth ratio: how warm vs cool
  // Warm tones: h in 10-60° (red-yellow), 60-120° (yellow)
  // Cool tones: h in 180-270° (blue-cyan), 0-10° (red/pink)
  let warmthRatio = 0;
  
  if (h >= 10 && h <= 60) warmthRatio = (h - 10) / 50; // yellow warm
  else if (h > 60 && h <= 120) warmthRatio = 1 - (h - 60) / 60; // golden
  else if (h > 0 && h < 10) warmthRatio = -0.3; // slightly warm red
  else if (h >= 270 && h <= 360) warmthRatio = -0.2; // slightly warm
  else if (h >= 180 && h <= 270) warmthRatio = -(h - 180) / 90 - 0.3; // cool blue

  // Tone classification based on hue
  let tone: ToneFamily = 'neutral';

  if (level <= 3) {
    // Dark levels — mahogany, chocolate, warm
    if (warmthRatio > 0.3) tone = 'mahogany';
    else if (warmthRatio < -0.3) tone = 'cool';
    else tone = 'neutral';
  } else if (level <= 6) {
    // Medium levels — ash, golden, red, copper
    if (h >= 0 && h <= 30) tone = 'red';
    else if (h > 30 && h <= 50) tone = 'copper';
    else if (h > 50 && h <= 70) tone = 'golden';
    else if (h >= 200 && h <= 270) tone = 'ash';
    else if (h >= 270 && h <= 330) tone = 'violet';
    else tone = 'neutral';
  } else {
    // Light levels — ash, golden, beige, pearl
    if (h >= 40 && h <= 70) tone = 'golden';
    else if (h >= 15 && h <= 40) tone = 'beige';
    else if (h >= 200 && h <= 270) tone = 'ash';
    else if (h >= 270 && h <= 330) tone = 'pearl';
    else if (h >= 330 || h <= 15) tone = 'warm';
    else tone = 'neutral';
  }

  const confidence = Math.abs(warmthRatio) > 0.3 ? 0.8 : 0.6;
  return { tone, warmthRatio, confidence };
}

// ─── Pixel Sampling ────────────────────────────────────────────────────────────

function samplePixels(imageData: ImageData, sampleSize: number = 2000): Array<{ r: number; g: number; b: number }> {
  const { data, width, height } = imageData;
  const pixels: Array<{ r: number; g: number; b: number }> = [];

  // Skip edges, focus on center region (likely hair)
  const marginX = Math.floor(width * 0.15);
  const marginY = Math.floor(height * 0.15);
  const centerW = width - marginX * 2;
  const centerH = height - marginY * 2;

  const step = Math.max(1, Math.floor((centerW * centerH) / sampleSize));

  for (let i = marginY * width + marginX; i < (marginY + centerH) * width + marginX; i += step) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    // Skip transparent, very dark (likely shadow), or very light (likely background)
    if (a < 128) continue;
    const brightness = (r + g + b) / 3;
    if (brightness < 15) continue;
    if (brightness > 245) continue;

    pixels.push({ r, g, b });
  }

  return pixels;
}

// ─── K-Means Clustering (simple) ─────────────────────────────────────────────

function kMeans(pixels: Array<{ r: number; g: number; b: number }>, k: number = 4): Array<{ r: number; g: number; b: number; count: number }> {
  if (pixels.length === 0) return [];
  if (pixels.length < k) k = pixels.length;

  // Initialize centroids randomly from existing pixels
  const centroids: Array<{ r: number; g: number; b: number }> = [];
  const used = new Set<number>();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push({ ...pixels[idx] });
    }
  }

  for (let iter = 0; iter < 10; iter++) {
    const clusters: Array<Array<{ r: number; g: number; b: number }>> = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < k; c++) {
        const dist = colorDistance(pixel, centroids[c]);
        if (dist < minDist) { minDist = dist; closest = c; }
      }
      clusters[closest].push(pixel);
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

  // Count cluster sizes
  const clusters: Array<Array<{ r: number; g: number; b: number }>> = Array.from({ length: k }, () => []);
  for (const pixel of pixels) {
    let minDist = Infinity;
    let closest = 0;
    for (let c = 0; c < k; c++) {
      const dist = colorDistance(pixel, centroids[c]);
      if (dist < minDist) { minDist = dist; closest = c; }
    }
    clusters[closest].push(pixel);
  }

  return centroids.map((c, i) => ({ ...c, count: clusters[i].length })).filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ─── Skin Tone Detection ──────────────────────────────────────────────────────

function detectSkinTone(pixels: Array<{ r: number; g: number; b: number }>): 'warm' | 'cool' | 'neutral' | 'olive' {
  // Filter for skin-like colors (not hair, not background)
  const skinPixels = pixels.filter(p => {
    const brightness = (p.r + p.g + p.b) / 3;
    const isSkin = brightness > 80 && brightness < 220;
    // Skin typically has: r > b, g roughly between r and b
    const skinRatio = p.r > p.b && p.r > p.g * 0.7;
    return isSkin && skinRatio;
  });

  if (skinPixels.length === 0) return 'neutral';

  const avgR = skinPixels.reduce((s, p) => s + p.r, 0) / skinPixels.length;
  const avgG = skinPixels.reduce((s, p) => s + p.g, 0) / skinPixels.length;
  const avgB = skinPixels.reduce((s, p) => s + p.b, 0) / skinPixels.length;

  // Warm: high R relative to B
  // Cool: high B relative to R
  // Olive: G is high relative to both
  const rB = avgR / Math.max(avgB, 1);
  const gAvg = (avgR + avgG + avgB) / 3;

  if (avgG > gAvg * 1.05) return 'olive';
  if (rB > 1.15) return 'warm';
  if (rB < 0.9) return 'cool';
  return 'neutral';
}

// ─── Contrast Calculation ─────────────────────────────────────────────────────

function calculateContrast(dominant: { r: number; g: number; b: number }, skin: 'warm' | 'cool' | 'neutral' | 'olive'): 'low' | 'medium' | 'high' {
  const brightness = (dominant.r + dominant.g + dominant.b) / 3;
  if (brightness < 50) return 'high'; // Dark hair on any skin = high contrast
  if (brightness > 180) return 'low'; // Very light blonde = low contrast on light skin
  return 'medium';
}

// ─── Main Analyze Function ────────────────────────────────────────────────────

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale down for performance, maintain aspect ratio
      const maxDim = 300;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Sample and cluster
      const pixels = samplePixels(imageData, 2000);
      if (pixels.length === 0) {
        reject(new Error('Could not detect hair color. Please use a clearer, well-lit photo.'));
        return;
      }

      const clusters = kMeans(pixels, 4);

      // Filter clusters by brightness to identify hair (not background)
      const hairClusters = clusters.filter(c => {
        const brightness = (c.r + c.g + c.b) / 3;
        return brightness > 15 && brightness < 245;
      });

      const dominant = hairClusters[0] || clusters[0];
      const secondary = hairClusters[1] || clusters[1];

      // Analyze dominant
      const { level, confidence: levelConf } = detectLevel(dominant.r, dominant.g, dominant.b);
      const { tone, warmthRatio, confidence: toneConf } = detectTone(dominant.r, dominant.g, dominant.b, level);
      const hsl = rgbToHsl(dominant.r, dominant.g, dominant.b);
      const overallConfidence = (levelConf + toneConf) / 2;

      const dominantResult: AnalyzedColor = {
        hex: rgbToHex(dominant.r, dominant.g, dominant.b),
        rgb: { r: dominant.r, g: dominant.g, b: dominant.b },
        level,
        levelName: HAIR_LEVELS[level]?.name || 'Unknown',
        tone,
        toneName: TONE_DESCRIPTORS[tone] || tone,
        confidence: overallConfidence,
        warmthRatio,
        saturation: hsl.s,
      };

      // Secondary
      let secondaryResult: AnalyzedColor | undefined;
      if (secondary) {
        const { level: sLevel, confidence: sConf } = detectLevel(secondary.r, secondary.g, secondary.b);
        const { tone: sTone, warmthRatio: sWarm } = detectTone(secondary.r, secondary.g, secondary.b, sLevel);
        secondaryResult = {
          hex: rgbToHex(secondary.r, secondary.g, secondary.b),
          rgb: { r: secondary.r, g: secondary.g, b: secondary.b },
          level: sLevel,
          levelName: HAIR_LEVELS[sLevel]?.name || 'Unknown',
          tone: sTone,
          toneName: TONE_DESCRIPTORS[sTone] || sTone,
          confidence: sConf,
          warmthRatio: sWarm,
          saturation: rgbToHsl(secondary.r, secondary.g, secondary.b).s,
        };
      }

      // Undertone (often visible in mid-tones)
      const undertoneColor = hairClusters.find(c => {
        const brightness = (c.r + c.g + c.b) / 3;
        return brightness > 40 && brightness < 160;
      }) || dominant;

      const { tone: uTone } = detectTone(undertoneColor.r, undertoneColor.g, undertoneColor.b, level);
      const undertoneResult: AnalyzedColor = {
        hex: rgbToHex(undertoneColor.r, undertoneColor.g, undertoneColor.b),
        rgb: { r: undertoneColor.r, g: undertoneColor.g, b: undertoneColor.b },
        level,
        levelName: HAIR_LEVELS[level]?.name || 'Unknown',
        tone: uTone,
        toneName: TONE_DESCRIPTORS[uTone] || uTone,
        confidence: overallConfidence * 0.7,
        warmthRatio,
        saturation: rgbToHsl(undertoneColor.r, undertoneColor.g, undertoneColor.b).s,
      };

      // Skin tone
      const skinPixels = pixels.filter(p => {
        const brightness = (p.r + p.g + p.b) / 3;
        return brightness > 80 && brightness < 220 && p.r > p.b && p.r > p.g * 0.7;
      });
      const skinTone = detectSkinTone(pixels);
      const contrast = calculateContrast(dominant, skinTone);

      // Generate recommendations
      const recommendations: string[] = [];
      if (level <= 3 && tone !== 'ash') {
        recommendations.push('Dark base — consider ash or cool tones to prevent warmth');
      }
      if (warmthRatio > 0.3 && level >= 6) {
        recommendations.push('Warm natural level — golden shades will enhance warmth');
      }
      if (warmthRatio < -0.2 && level >= 5) {
        recommendations.push('Cool base detected — violet or ash tones will neutralize warmth');
      }
      if (skinTone === 'warm' && tone === 'cool') {
        recommendations.push('Warm skin + cool hair — high contrast, striking look');
      }
      if (skinTone === 'cool' && tone === 'warm') {
        recommendations.push('Cool skin + warm hair — soft, natural contrast');
      }
      if (secondaryResult && secondaryResult.level !== level) {
        recommendations.push(`Multi-tonal detected (${HAIR_LEVELS[secondaryResult.level]?.name}) — consider balayage or color melting`);
      }

      URL.revokeObjectURL(url);
      resolve({
        dominant: dominantResult,
        secondary: secondaryResult,
        undertone: undertoneResult,
        skinTone,
        contrast,
        recommendations,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// ─── Level-to-Hex lookup ─────────────────────────────────────────────────────

export function getLevelHex(level: number): string {
  return HAIR_LEVELS[level]?.hex || '#888888';
}
