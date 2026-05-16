// Joico brand data exports
// Contains LumiShine Repair+ Permanent, Demi-Permanent Liquid, and Dimensional Deposit shade/spec data

const lumishinePermanentShades = require('./lumishine-permanent-shades.json');
const lumishineDemiLiquidShades = require('./lumishine-demi-liquid-shades.json');
const lumishineDimensionalDepositShades = require('./lumishine-dimensional-deposit-shades.json');
const lumishinePermanentSpecs = require('./lumishine-permanent-specs.json');
const lumishineDemiLiquidSpecs = require('./lumishine-demi-liquid-specs.json');
const lumishineDimensionalDepositSpecs = require('./lumishine-dimensional-deposit-specs.json');

module.exports = {
  shades: {
    'lumishine-permanent': lumishinePermanentShades,
    'lumishine-demi-liquid': lumishineDemiLiquidShades,
    'lumishine-dimensional-deposit': lumishineDimensionalDepositShades,
  },
  specs: {
    'lumishine-permanent': lumishinePermanentSpecs,
    'lumishine-demi-liquid': lumishineDemiLiquidSpecs,
    'lumishine-dimensional-deposit': lumishineDimensionalDepositSpecs,
  },
  getAllShades() {
    return [
      ...lumishinePermanentShades,
      ...lumishineDemiLiquidShades,
      ...lumishineDimensionalDepositShades,
    ];
  },
  getShadesByLine(line) {
    return this.shades[line] || [];
  },
};
