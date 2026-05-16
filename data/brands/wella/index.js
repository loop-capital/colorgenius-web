// Wella brand data exports
// Contains Koleston Perfect, Color Touch, Illumina, and Shinefinity shade/spec data

const kolestonPerfectShades = require('./koleston-perfect-shades.json');
const colorTouchShades = require('./color-touch-shades.json');
const illuminaShades = require('./illumina-shades.json');
const shinefinityShades = require('./shinefinity-shades.json');

const kolestonPerfectSpecs = require('./koleston-perfect-specs.json');
const wellaSpecs = require('./wella-specs.json');
const illuminaSpecs = require('./illumina-specs.json');
const shinefinitySpecs = require('./shinefinity-specs.json');

module.exports = {
  shades: {
    'koleston-perfect': kolestonPerfectShades,
    'color-touch': colorTouchShades,
    'illumina': illuminaShades,
    'shinefinity': shinefinityShades,
  },
  specs: {
    'koleston-perfect': kolestonPerfectSpecs,
    'color-touch': wellaSpecs,
    'illumina': illuminaSpecs,
    'shinefinity': shinefinitySpecs,
  },
  getAllShades() {
    return [
      ...kolestonPerfectShades,
      ...colorTouchShades,
      ...illuminaShades,
      ...shinefinityShades,
    ];
  },
  getShadesByLine(line) {
    return this.shades[line] || [];
  },
};