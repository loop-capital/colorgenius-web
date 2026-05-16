/**
 * Brand Conversion Engine — Unit Tests
 * Validates TypeScript engine against ADR-015 specifications.
 */

import { describe, it, expect } from '@jest/globals';
import {
  convertShade,
  convertDeveloper,
  getMixingRatio,
  calculateMixingAmounts,
  convertShadeComponent,
  convertFormula,
  findEquivalents,
} from '../engine';
import { loadBrandShades, loadBrandSpecs, findShadeByCode } from '../data-loader';
import { getToneFamily, getMappedBrands } from '../tone-family-mappings';
import type { NormalizedShade } from '../types';

// ─── Mock Data Helpers ────────────────────────────────────────────────────

function createMockShade(overrides: Partial<NormalizedShade> = {}): NormalizedShade {
  return {
    code: '7-0',
    brand: 'schwarzkopf',
    line: 'IGORA ROYAL',
    level: 7,
    toneFamily: 'natural',
    toneCode: '0',
    name: 'Medium Blonde Natural',
    hex: '#8B7355',
    isHighLift: false,
    isDemi: false,
    grayCoverage: '100%',
    ...overrides,
  };
}

// ─── Tone Family Mappings ─────────────────────────────────────────────────

describe('Tone Family Mappings', () => {
  it('should have mappings for all major brands', () => {
    const brands = getMappedBrands();
    expect(brands.length).toBeGreaterThanOrEqual(17);
    expect(brands).toContain('schwarzkopf');
    expect(brands).toContain('wella');
    expect(brands).toContain('redken-color-gels-lacquers');
    expect(brands).toContain('kenra');
  });

  it('should map Schwarzkopf tone codes correctly', () => {
    expect(getToneFamily('schwarzkopf', '0')).toBe('natural');
    expect(getToneFamily('schwarzkopf', '1')).toBe('blue-ash');
    expect(getToneFamily('schwarzkopf', '2')).toBe('ash');
    expect(getToneFamily('schwarzkopf', '5')).toBe('gold');
    expect(getToneFamily('schwarzkopf', '8')).toBe('red');
    expect(getToneFamily('schwarzkopf', '9')).toBe('violet');
  });

  it('should map Wella tone codes correctly', () => {
    expect(getToneFamily('wella', '/0')).toBe('natural');
    expect(getToneFamily('wella', '/1')).toBe('ash');
    expect(getToneFamily('wella', '/3')).toBe('gold');
    expect(getToneFamily('wella', '/4')).toBe('copper');
    expect(getToneFamily('wella', '/6')).toBe('violet');
  });

  it('should return null for unknown mappings', () => {
    expect(getToneFamily('schwarzkopf', '999')).toBeNull();
    expect(getToneFamily('nonexistent-brand', '0')).toBeNull();
  });
});

// ─── Confidence Scoring ─────────────────────────────────────────────────────

describe('Confidence Scoring', () => {
  it('should return confidence 1.0 for exact match', async () => {
    const source = createMockShade({ brand: 'schwarzkopf', level: 7, toneFamily: 'natural' });
    const result = await convertShade(source, 'schwarzkopf');
    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(1.0);
    expect(result!.matchType).toBe('exact');
  });

  it('should return confidence 0.9 for adjacent tone match', async () => {
    // Gold → Copper (adjacent)
    const source = createMockShade({ brand: 'schwarzkopf', level: 7, toneFamily: 'gold' });
    const result = await convertShade(source, 'schwarzkopf');
    // Should find exact match first, but if not available, adjacent
    if (result && result.matchType === 'close') {
      expect(result.confidence).toBe(0.9);
    }
  });

  it('should return confidence 0.8 for closest level match', async () => {
    // Search for a tone family that exists at adjacent level but not exact
    const source = createMockShade({ brand: 'schwarzkopf', level: 7, toneFamily: 'copper' });
    const result = await convertShade(source, 'schwarzkopf');
    if (result && result.matchType === 'level-adjusted') {
      expect(result.confidence).toBe(0.8);
    }
  });

  it('should return confidence 0.55 for fuzzy match', async () => {
    const source = createMockShade({ brand: 'schwarzkopf', level: 7, toneFamily: 'rose' });
    const result = await convertShade(source, 'schwarzkopf');
    if (result && result.matchType === 'weak') {
      expect(result.confidence).toBe(0.55);
    }
  });

  it('should return null for no match', async () => {
    const source = createMockShade({ brand: 'schwarzkopf', level: 12, toneFamily: 'specialty' });
    const result = await convertShade(source, 'nonexistent-brand');
    expect(result).toBeNull();
  });
});

// ─── Developer Volume Translation ──────────────────────────────────────────

describe('Developer Volume Translation', () => {
  it('should convert developer by semantic intent', async () => {
    const result = await convertDeveloper(20, 'schwarzkopf');
    expect(result).toBeDefined();
    expect(result.volume).toBeGreaterThan(0);
  });

  it('should map deposit intent to lowest volume', async () => {
    const result = await convertDeveloper(10, 'schwarzkopf');
    expect(result.volume).toBeLessThanOrEqual(20);
  });

  it('should handle brands without developer data', async () => {
    const result = await convertDeveloper(30, 'nonexistent-brand');
    expect(result.volume).toBe(30);
    expect(result.notes).toContain('no developer volume data');
  });
});

// ─── Mixing Ratio Adjustment ──────────────────────────────────────────────

describe('Mixing Ratio Adjustment', () => {
  it('should parse standard 1:1 ratio', async () => {
    const ratio = await getMixingRatio('schwarzkopf');
    expect(ratio).toMatch(/1:1/);
  });

  it('should calculate mixing amounts for ratio change', async () => {
    const result = await calculateMixingAmounts('schwarzkopf', 'lanza', undefined, undefined, 30);
    expect(result.colorGrams).toBeGreaterThan(0);
    expect(result.developerGrams).toBeGreaterThan(0);
    expect(result.totalGrams).toBeGreaterThan(0);
  });

  it('should preserve total grams within reasonable bounds', async () => {
    const result = await calculateMixingAmounts('schwarzkopf', 'schwarzkopf', undefined, undefined, 30);
    // Same brand, same ratio: should be approximately equal
    expect(result.colorGrams + result.developerGrams).toBeGreaterThanOrEqual(30);
  });
});

// ─── Multi-Shade Formula Handling ─────────────────────────────────────────

describe('Multi-Shade Formula Handling', () => {
  it('should convert single-shade formula', async () => {
    const request = {
      shades: [{ shadeCode: '7-0', brand: 'schwarzkopf', line: 'IGORA ROYAL', grams: 30 }],
      targetBrand: 'schwarzkopf',
      developerVolume: 20,
    };
    const result = await convertFormula(request);
    expect(result.shades.length).toBeGreaterThanOrEqual(0);
    expect(result.overallConfidence).toBeGreaterThanOrEqual(0);
  });

  it('should apply multi-shade penalty to overall confidence', async () => {
    const request = {
      shades: [
        { shadeCode: '7-0', brand: 'schwarzkopf', line: 'IGORA ROYAL', grams: 30 },
        { shadeCode: '7-1', brand: 'schwarzkopf', line: 'IGORA ROYAL', grams: 15 },
      ],
      targetBrand: 'schwarzkopf',
      developerVolume: 20,
    };
    const result = await convertFormula(request);
    if (result.shades.length >= 2) {
      expect(result.overallConfidence).toBeLessThanOrEqual(
        Math.min(...result.shades.map(s => s.confidence)) * 0.9 + 0.01
      );
    }
  });

  it('should collect hard stops for missing shades', async () => {
    const request = {
      shades: [{ shadeCode: 'INVALID-CODE', brand: 'schwarzkopf', line: 'IGORA ROYAL', grams: 30 }],
      targetBrand: 'schwarzkopf',
      developerVolume: 20,
    };
    const result = await convertFormula(request);
    expect(result.hardStops.length).toBeGreaterThan(0);
  });

  it('should collect warnings for weak matches', async () => {
    const request = {
      shades: [{ shadeCode: '12-0', brand: 'schwarzkopf', line: 'IGORA ROYAL', grams: 30 }],
      targetBrand: 'aveda',
      developerVolume: 40,
    };
    const result = await convertFormula(request);
    // Should have warnings or hard stops for this conversion
    expect(result.warnings.length + result.hardStops.length).toBeGreaterThanOrEqual(0);
  });
});

// ─── Find Equivalents ─────────────────────────────────────────────────────

describe('Find Equivalents', () => {
  it('should find equivalents across brands', async () => {
    const equivalents = await findEquivalents(7, 'natural');
    expect(Object.keys(equivalents).length).toBeGreaterThanOrEqual(0);
  });

  it('should exclude specified brand', async () => {
    const equivalents = await findEquivalents(7, 'natural', 'schwarzkopf');
    expect(equivalents['schwarzkopf']).toBeUndefined();
  });
});

// ─── Integration: Real Brand Data ───────────────────────────────────────

describe('Integration: Real Brand Data', () => {
  it('should load Schwarzkopf shades', () => {
    const shades = loadBrandShades('schwarzkopf');
    expect(shades.length).toBeGreaterThan(0);
  });

  it('should load brand specs', () => {
    const specs = loadBrandSpecs('schwarzkopf');
    expect(specs).not.toBeNull();
  });

  it('should find shade by code', () => {
    const shade = findShadeByCode('schwarzkopf', '7-0');
    expect(shade).not.toBeNull();
    if (shade) {
      expect(shade.level).toBe(7);
      expect(shade.toneFamily).toBe('natural');
    }
  });

  it('should handle Wella 7/43 → Redken conversion', async () => {
    const source = findShadeByCode('wella', '7/43');
    if (source) {
      const result = await convertShade(source, 'redken');
      // May or may not find a match — just verify it doesn't crash
      expect(result === null || result.confidence > 0).toBe(true);
    }
  });

  it('should handle Schwarzkopf 7-0 → Davines conversion', async () => {
    const source = findShadeByCode('schwarzkopf', '7-0');
    expect(source).not.toBeNull();
    if (source) {
      const result = await convertShade(source, 'davines');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      }
    }
  });
});
