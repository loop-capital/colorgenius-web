const shades = require('./shades.json');

module.exports = {
  brand: shades.brand,
  lines: shades.lines,
  service_types: shades.service_types,
  technology: shades.technology,

  // Lookup helpers
  getLine(name) {
    return shades.lines.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  },

  getShade(code, lineName) {
    const line = this.getLine(lineName || 'Color Rhapsody');
    if (!line) return null;
    return line.shades.find(s => s.code === code);
  },

  getShadesByLevel(level, lineName) {
    const line = lineName ? this.getLine(lineName) : null;
    if (line) return line.shades.filter(s => s.level === level);
    return shades.lines.flatMap(l => (l.shades || []).filter(s => s.level === level));
  },

  getShadesByFamily(family, lineName) {
    const line = lineName ? this.getLine(lineName) : null;
    if (line) return line.shades.filter(s => s.family === family);
    return shades.lines.flatMap(l => (l.shades || []).filter(s => s.family === family));
  },

  getAllShades() {
    return shades.lines.flatMap(l => (l.shades || []).map(s => ({
      ...s,
      line: l.name,
      type: l.type
    })));
  },

  getStats() {
    const all = this.getAllShades();
    return {
      brand: shades.brand,
      total_shades: all.length,
      by_line: shades.lines.map(l => ({
        name: l.name,
        type: l.type,
        count: (l.shades || []).length
      })),
      by_family: [...new Set(all.map(s => s.family))].reduce((acc, f) => {
        acc[f] = all.filter(s => s.family === f).length;
        return acc;
      }, {}),
      levels: [...new Set(all.map(s => s.level))].sort((a,b) => a-b),
      source: shades.source,
      verified: shades.verification_status
    };
  }
};
