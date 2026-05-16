// Kenra Color — Shade Data Exports
// Brand #14 — ColorGenius

import permanentShades from './kenra-permanent-shades.json' assert { type: 'json' };
import demiPermanentShades from './kenra-demi-permanent-shades.json' assert { type: 'json' };
import simplyBlondeShades from './simply-blonde.json' assert { type: 'json' };
import studioStylistExpressShades from './studio-stylist-express.json' assert { type: 'json' };
import creativesShades from './creatives.json' assert { type: 'json' };
import specs from './kenra-specs.json' assert { type: 'json' };

export {
  permanentShades,
  demiPermanentShades,
  simplyBlondeShades,
  studioStylistExpressShades,
  creativesShades,
  specs,
};

export default {
  permanent: permanentShades,
  demiPermanent: demiPermanentShades,
  simplyBlonde: simplyBlondeShades,
  studioStylistExpress: studioStylistExpressShades,
  creatives: creativesShades,
  specs,
};
