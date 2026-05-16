// Matrix SoColor shade exports for ColorGenius
// LINE 1: SoColor Pre-Bonded Permanent Color
// LINE 2: SoColor Sync Demi-Permanent Color
// LINE 3: Super Sync Demi-Permanent Color
// LINE 4: Tonal Control Acidic Gel-Cream Toners

import socolorShades from './socolor-shades.json';
import socolorSpecs from './socolor-specs.json';
import socolorSyncShades from './socolor-sync-shades.json';
import socolorSyncSpecs from './socolor-sync-specs.json';
import superSyncShades from './super-sync-shades.json';
import superSyncSpecs from './super-sync-specs.json';
import tonalControlShades from './tonal-control-shades.json';
import tonalControlSpecs from './tonal-control-specs.json';

export {
  socolorShades,
  socolorSpecs,
  socolorSyncShades,
  socolorSyncSpecs,
  superSyncShades,
  superSyncSpecs,
  tonalControlShades,
  tonalControlSpecs,
};

export default {
  socolor: {
    shades: socolorShades,
    specs: socolorSpecs,
  },
  socolorSync: {
    shades: socolorSyncShades,
    specs: socolorSyncSpecs,
  },
  superSync: {
    shades: superSyncShades,
    specs: superSyncSpecs,
  },
  tonalControl: {
    shades: tonalControlShades,
    specs: tonalControlSpecs,
  },
};
