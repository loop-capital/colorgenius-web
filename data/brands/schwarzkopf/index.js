const shades = require('./shades.json');

module.exports = {
  brand: shades.brand,
  productLine: shades.product_line,
  lines: shades.lines,
  lighteners: shades.lighteners,
  toneSystem: shades.numbering_system,
  grayCoverage: shades.gray_coverage,
  developers: shades.developers,

  getLine(name) {
    return shades.lines.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  },

  getShade(code, lineName) {
    const line = lineName ? this.getLine(lineName) : this.getLine('IGORA ROYAL Permanent');
    if (!line || typeof line.shades === 'string') return null;
    return line.shades.find(s => s.code === code);
  },

  getShadesByLevel(level, lineName) {
    const line = lineName ? this.getLine(lineName) : this.getLine('IGORA ROYAL Permanent');
    if (!line || typeof line.shades === 'string') return [];
    return line.shades.filter(s => s.level === level);
  },

  getShadesByFamily(family, lineName) {
    const line = lineName ? this.getLine(lineName) : this.getLine('IGORA ROYAL Permanent');
    if (!line || typeof line.shades === 'string') return [];
    return line.shades.filter(s => s.family === family);
  },

  getShadesByTone(tone, lineName) {
    const line = lineName ? this.getLine(lineName) : this.getLine('IGORA ROYAL Permanent');
    if (!line || typeof line.shades === 'string') return [];
    return line.shades.filter(s => s.tone === tone);
  },

  parseCode(code) {
    const parts = code.split('-');
    return {
      level: parseFloat(parts[0]),
      primaryTone: parts[1] ? parts[1][0] : null,
      secondaryTone: parts[1] && parts[1].length > 1 ? parts[1].slice(1) : null
    };
  },

  getGrayFormulation(grayPercent, shade) {
    const gc = shades.gray_coverage;
    if (gc['100_percent_cover_shades'].some(s => shade.endsWith(s))) {
      return { coverage: '100%', addNatural: false };
    }
    if (grayPercent > 50) {
      return {
        coverage: '100%',
        addNatural: true,
        ratio: '2:1 (shade : Natural or Beige)',
        example: gc.example
      };
    }
    return { coverage: 'Up to 50-100% depending on shade', addNatural: false };
  },

  getDeveloperForLift(levels) {
    if (levels <= 0) return { volume: 3, strength: '3% (10 Vol.)' };
    if (levels <= 2) return { volume: 6, strength: '6% (20 Vol.)' };
    if (levels <= 4) return { volume: 9, strength: '9% (30 Vol.)' };
    return { volume: 12, strength: '12% (40 Vol.)' };
  },

  getAllShades() {
    return shades.lines.flatMap(l => {
      if (typeof l.shades === 'string') return [];
      return l.shades.map(s => ({ ...s, line: l.name, type: l.type }));
    });
  },

  getStats() {
    const all = this.getAllShades();
    return {
      brand: shades.brand,
      product_line: shades.product_line,
      total_shades: all.length,
      by_line: shades.lines.map(l => ({
        name: l.name,
        type: l.type,
        count: typeof l.shades === 'string' ? 'shared' : l.shades.length
      })),
      lighteners: shades.lighteners.length,
      tone_families: [...new Set(all.map(s => s.family))],
      levels: [...new Set(all.map(s => s.level))].sort((a, b) => a - b),
      source: shades.source,
      verified: shades.verification_status
    };
  }
};
