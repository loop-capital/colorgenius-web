// Pravana brand data exports for ColorGenius
// Contains ChromaSilk Permanent, Vivids Semi-Permanent, Express Tones, and Color Correctors

const chromasilkShades = require('./chromasilk-shades.json');
const chromasilkSpecs = require('./chromasilk-specs.json');
const vividsShades = require('./vivids-shades.json');
const vividsSpecs = require('./vivids-specs.json');

module.exports = {
  shades: {
    chromasilk: chromasilkShades,
    vivids: vividsShades,
  },
  specs: {
    chromasilk: chromasilkSpecs,
    vivids: vividsSpecs,
  },
  getAllShades() {
    return [
      ...chromasilkShades,
      ...vividsShades,
    ];
  },
  getShadesByLine(line) {
    return this.shades[line] || [];
  },
};
