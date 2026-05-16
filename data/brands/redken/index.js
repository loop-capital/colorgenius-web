// Redken brand data exports
// Contains Color Gels Lacquers and Shades EQ shade/spec data

const colorGelsLacquersShades = require('./color-gels-lacquers-shades.json');
const shadesEQShades = require('./shades-eq-shades.json');
const colorGelsLacquersSpecs = require('./color-gels-lacquers-specs.json');
const shadesEQSpecs = require('./shades-eq-specs.json');

module.exports = {
  shades: {
    'color-gels-lacquers': colorGelsLacquersShades,
    'shades-eq': shadesEQShades,
  },
  specs: {
    'color-gels-lacquers': colorGelsLacquersSpecs,
    'shades-eq': shadesEQSpecs,
  },
  getAllShades() {
    return [...colorGelsLacquersShades, ...shadesEQShades];
  },
  getShadesByLine(line) {
    return this.shades[line] || [];
  },
};
