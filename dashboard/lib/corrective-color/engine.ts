// Corrective Color Diagnostics Engine
// Diagnoses hair color problems and suggests corrective strategies

export interface CorrectiveIssue {
  id: string
  name: string
  category: 'lift' | 'tone' | 'damage' | 'application' | 'filler'
  severity: 'mild' | 'moderate' | 'severe'
  visualSigns: string[]
  rootCause: string
  neutralizationStrategy: string
  suggestedFormulas: CorrectiveFormula[]
  processingNotes: string[]
  homeCare: string[]
}

export interface CorrectiveFormula {
  name: string
  purpose: string
  products: { brand: string; shade: string; developer: string; ratio: string; amount: string }[]
  processingTime: string
  sectioning: string
  notes: string[]
}

export interface HairState {
  currentLevel: number
  currentTone: string
  targetLevel: number
  targetTone: string
  porosity: 'low' | 'normal' | 'high'
  condition: string
  previousColor?: string
  previousLightener?: boolean
  banding?: boolean
  hotRoots?: boolean
  multipleColors?: boolean
}

// --- DIAGNOSTIC RULES ---

const ISSUES: Record<string, CorrectiveIssue> = {
  hot_roots: {
    id: 'hot_roots',
    name: 'Hot Roots',
    category: 'application',
    severity: 'moderate',
    visualSigns: ['Warmer/brighter at scalp than mids', 'Visible heat band near scalp', 'Color fades faster at roots'],
    rootCause: 'Scalp heat accelerates developer action, causing over-lift or over-deposit at the root zone. Common when applying color to virgin regrowth over previously colored hair.',
    neutralizationStrategy: 'Use a lower-volume developer (10V or 5V) on the regrowth area. Apply root color last, or use a "root shadow" technique with a darker demi-permanent shade. For banded hot roots, apply corrective toner only to the warm band.',
    suggestedFormulas: [
      {
        name: 'Root Shadow / Melt',
        purpose: 'Blend the hot root into cooler mids',
        products: [
          { brand: 'Redken', shade: 'Shades EQ 06N + 06T', developer: 'Processing Solution', ratio: '1:1', amount: '1-2 oz' },
        ],
        processingTime: '15-20 min on damp hair, mids to ends',
        sectioning: 'Apply to hot root band only, feather down 1-2 inches. Do NOT apply to scalp.',
        notes: ['Process at room temperature — no heat', 'Rinse with cool water', 'Follow with acidic pH conditioner'],
      },
      {
        name: 'Virgin Application Fix',
        purpose: 'Prevent hot roots on touch-up',
        products: [
          { brand: 'Wella', shade: 'Color Touch 5/0 + 5/1', developer: '6V', ratio: '1:2', amount: '1-2 oz' },
        ],
        processingTime: '15 min on roots only',
        sectioning: 'Apply 1/4 inch from scalp, pull through last 5 min only if needed',
        notes: ['Lower developer = slower, controlled lift', 'Match depth to mids, not lighter'],
      },
    ],
    processingNotes: [
      'Always use lower developer on scalp zone (heat accelerates action)',
      'Apply color to mids first, then roots last (roots process faster)',
      'For severe hot roots: pre-pigment with a filler 1-2 levels deeper',
    ],
    homeCare: [
      'Use cool water rinses to close cuticle and lock color',
      'Purple or blue shampoo 1x/week to neutralize warmth',
      'Avoid clarifying shampoos which strip deposit and reveal warmth',
    ],
  },

  green_cast: {
    id: 'green_cast',
    name: 'Green Cast',
    category: 'tone',
    severity: 'moderate',
    visualSigns: ['Dull olive tone', 'Muddy appearance in light', 'Especially visible on Level 7-10 hair'],
    rootCause: 'Color built up with too much ash (blue + yellow = green) or swimming pool/mineral buildup (copper + chlorine). Common when over-toning blonde with ash-based products.',
    neutralizationStrategy: 'Use a red-based filler or gloss to neutralize green. Red is the direct complement to green on the color wheel. Apply a warm demi-permanent to add missing warmth without additional lift.',
    suggestedFormulas: [
      {
        name: 'Red Neutralizer Gloss',
        purpose: 'Cancel green with warmth',
        products: [
          { brand: 'Matrix', shade: 'ColorSync 8RC + Clear', developer: '10V', ratio: '1:1', amount: '2-3 oz' },
        ],
        processingTime: '10-15 min on damp hair',
        sectioning: 'Apply globally, focusing on green areas',
        notes: ['Use CLEAR to dilute if red is too strong', 'Process with low heat for max deposit', 'Rinse cool, condition acidic'],
      },
      {
        name: 'Copper Warmth Infusion',
        purpose: 'Replace missing warm pigment in over-ashed hair',
        products: [
          { brand: 'Wella', shade: 'Color Touch 8/43 + 7/43', developer: '6V', ratio: '1:2', amount: '2 oz' },
        ],
        processingTime: '15-20 min',
        sectioning: 'Global application on dry hair',
        notes: ['Wet hair = less pigment deposit', 'Use 6V for minimal lift, max deposit', 'Expect 1-2 levels of warmth addition'],
      },
    ],
    processingNotes: [
      'Never use more ash on green hair — it deepens the problem',
      'Clarify FIRST if mineral buildup is suspected (malibu treatment)',
      'Pre-pigment with a warm filler before re-lightening',
    ],
    homeCare: [
      'Malibu C Hard Water Wellness treatment weekly',
      'Avoid ash-based shampoos and conditioners',
      'Use chelating shampoo if swimmer — remove metals first',
    ],
  },

  muddy_toner: {
    id: 'muddy_toner',
    name: 'Muddy Toner',
    category: 'tone',
    severity: 'moderate',
    visualSigns: ['Dull, lifeless color', 'Brownish-gray cast', 'Lacks dimension or shine'],
    rootCause: 'Toner applied over hair that was not lifted light enough, or toner left on too long. The underlying pigment was too warm/dark, and the toner created a muddy overlay instead of clean toning.',
    neutralizationStrategy: 'Clarify to remove muddy toner, then re-lighten if needed to proper underlying pigment. Apply a fresh toner matched to the actual lifted level. For mild cases, use a clear gloss to add shine and break up the mud.',
    suggestedFormulas: [
      {
        name: 'Clarify + Re-Tone',
        purpose: 'Remove muddy deposit and re-tone clean',
        products: [
          { brand: 'Davines', shade: 'SOLU Clarifying Shampoo', developer: 'N/A', ratio: 'Direct', amount: 'Generous' },
          { brand: 'Redken', shade: 'Shades EQ 09V + 09T + Clear', developer: 'Processing Solution', ratio: '1:1', amount: '2 oz' },
        ],
        processingTime: 'Clarify 5 min, tone 10-15 min',
        sectioning: 'Clarify global. Tone on damp hair, apply to most muddy sections first.',
        notes: ['Clarify ONLY — do not use bleach shampoo', 'Re-tone must match actual lifted level', 'Add CLEAR for translucent finish'],
      },
      {
        name: 'Clear Gloss Refresh',
        purpose: 'Break up mud and add shine without more color',
        products: [
          { brand: 'Matrix', shade: 'ColorSync Clear + 1 drop 8V', developer: '10V', ratio: '1:1', amount: '2 oz' },
        ],
        processingTime: '10 min on damp hair',
        sectioning: 'Global application',
        notes: ['Minimal pigment — safe on compromised hair', 'Adds shine and dimension', 'Can be repeated as needed'],
      },
    ],
    processingNotes: [
      'Muddy toner = hair not lifted light enough OR toner too dark',
      'Always check underlying pigment before toning: Level 8+ should be pale yellow',
      'Toner should be 1-2 levels LIGHTER than target, not darker',
    ],
    homeCare: [
      'Use sulfate-free shampoo to preserve clean tone',
      'Weekly acidic treatment (pH 4.5-5.5) to seal cuticle',
      'Avoid heavy styling products that dull shine',
    ],
  },

  over_ashy: {
    id: 'over_ashy',
    name: 'Over-Ashy / Grayish',
    category: 'tone',
    severity: 'mild',
    visualSigns: ['Flat gray appearance', 'Lacks warmth or dimension', 'Looks "dirty" or dull'],
    rootCause: 'Too much ash (blue + green base) deposited, often from over-toning or using ash shades on hair that was lifted too high. The hair lacks the warm underlying pigment needed to support the ash.',
    neutralizationStrategy: 'Add warmth back with a gold or beige demi-permanent. Use 1-2 levels lighter than current depth with warm tones. Process with heat for maximum pigment deposit.',
    suggestedFormulas: [
      {
        name: 'Warmth Restoration Gloss',
        purpose: 'Add gold/beige back to over-ashed hair',
        products: [
          { brand: 'Wella', shade: 'Color Touch 8/38 + 9/38', developer: '6V', ratio: '1:2', amount: '2 oz' },
        ],
        processingTime: '15-20 min with gentle heat',
        sectioning: 'Global application on damp hair',
        notes: ['8/38 = light gold pearl, 9/38 = very light gold pearl', 'Use gentle heat for max deposit', 'Process to desired warmth, check every 5 min'],
      },
      {
        name: 'Beige Balancer',
        purpose: 'Neutralize gray cast with beige warmth',
        products: [
          { brand: 'Redken', shade: 'Shades EQ 08WG + 09NB', developer: 'Processing Solution', ratio: '1:1', amount: '2 oz' },
        ],
        processingTime: '15 min',
        sectioning: 'Global on damp hair',
        notes: ['WG = warm gold, NB = neutral beige', 'Adds dimension without going brassy', 'Safe on compromised hair'],
      },
    ],
    processingNotes: [
      'Over-ashy = missing warm pigment. Add it back gradually.',
      'Do NOT use more ash or violet — deepens the problem',
      'If hair is Level 9-10, use Level 8-9 warm tones to add depth + warmth',
    ],
    homeCare: [
      'Avoid purple/blue shampoos which deepen ash',
      'Use warm-tone enhancing shampoo (gold or champagne)',
      'Deep conditioning mask weekly to improve light reflection',
    ],
  },

  orange_bands: {
    id: 'orange_bands',
    name: 'Orange Bands / Brassy Bands',
    category: 'lift',
    severity: 'severe',
    visualSigns: ['Distinct orange/yellow bands', 'Uneven color between sections', 'Often at mid-lengths where overlap occurred'],
    rootCause: 'Overlapping lightener on previously lightened hair causes bands of uneven lift. The mid-shaft was lightened multiple times while roots and ends were only processed once. Result: orange band in the middle.',
    neutralizationStrategy: 'Break up bands with a "color melting" technique: apply darker shadow to the band, lighter tone to roots and ends. For severe bands, pre-lighten the dark band ONLY with foils, then tone globally.',
    suggestedFormulas: [
      {
        name: 'Band Breaker — Shadow Melt',
        purpose: 'Visually break up the orange band',
        products: [
          { brand: 'Redken', shade: 'Shades EQ 06NB (band) + 09V (roots/ends)', developer: 'Processing Solution', ratio: '1:1', amount: '2 oz total' },
        ],
        processingTime: '15-20 min',
        sectioning: 'Apply 06NB ONLY to orange band. Apply 09V to roots (1 inch) and ends. Feather where they meet.',
        notes: ['06NB = dark neutral beige to darken band', '09V = very light violet for roots/ends', 'Feather overlap zone for seamless blend'],
      },
      {
        name: 'Band Pre-Lighten + Tone',
        purpose: 'Lift the dark band to match, then tone clean',
        products: [
          { brand: 'Schwarzkopf', shade: 'BlondMe Premium Lightener + 20V', developer: '20V', ratio: '1:1.5', amount: '1-2 oz' },
          { brand: 'Redken', shade: 'Shades EQ 09P + 09V', developer: 'Processing Solution', ratio: '1:1', amount: '2 oz' },
        ],
        processingTime: 'Lighten 15-20 min, tone 10-15 min',
        sectioning: 'Lightener ONLY on orange band, in foils. Tone globally after rinsing lightener.',
        notes: ['Protect roots and ends with conditioner or oil during lightening', 'Check lightener every 5 min', 'Tone must match the lifted level of the band'],
      },
    ],
    processingNotes: [
      'NEVER overlap lightener on previously lightened hair',
      'For touch-ups: apply lightener to regrowth only, pull through last 5-10 min if needed',
      'Bands require either darkening the band OR lightening it — choose based on client\'s target level',
    ],
    homeCare: [
      'Purple shampoo on mid-lengths only (avoid roots if they\'re clean)',
      'Bond-building treatments to strengthen compromised mid-shaft',
      'Heat protectant always — banded hair is structurally weak',
    ],
  },

  uneven_lift: {
    id: 'uneven_lift',
    name: 'Uneven Lift',
    category: 'lift',
    severity: 'severe',
    visualSigns: ['Patchy lightening', 'Some sections lighter than others', 'Uneven underlying pigment'],
    rootCause: 'Inconsistent application, uneven saturation, or varying hair density/resistance. Often occurs when lightener is applied too thin, or when some sections process longer than others.',
    neutralizationStrategy: 'Re-lighten the darker sections ONLY using back-to-back foils or balayage technique. Ensure complete saturation. After even lift is achieved, tone globally with a shade that matches the lightest lifted level.',
    suggestedFormulas: [
      {
        name: 'Spot Correction — Foiled Re-Lift',
        purpose: 'Even out patchy lift in dark sections',
        products: [
          { brand: 'Schwarzkopf', shade: 'BlondMe Premium Lightener + 20V or 30V', developer: 'Match to remaining level', ratio: '1:1.5', amount: 'As needed' },
        ],
        processingTime: '15-25 min, check every 5 min',
        sectioning: 'Isolate dark sections in foils. Protect already-lifted hair with conditioner.',
        notes: ['Higher developer ONLY on dark sections', 'Already-lifted hair gets 10V or no lightener', 'Full saturation is critical — scrape and re-apply if dry'],
      },
      {
        name: 'Global Tone After Even Lift',
        purpose: 'Unify all sections after lift is even',
        products: [
          { brand: 'Wella', shade: 'Color Touch 10/81 + 10/6', developer: '6V', ratio: '1:2', amount: '2-3 oz' },
        ],
        processingTime: '15 min on damp hair',
        sectioning: 'Global application',
        notes: ['10/81 = light pearl ash for cool finish', '10/6 = light violet for neutralization', 'Adjust ratio based on warmth level'],
      },
    ],
    processingNotes: [
      'Uneven lift = application error. Fix application technique.',
      'Section hair in clean quadrants. Work methodically.',
      'For balayage: use cotton or plastic wrap between sections to prevent bleeding',
      'Check every 5-7 min. Rinse sections that lift early.',
    ],
    homeCare: [
      'Purple shampoo to even out yellow tones in lighter sections',
      'Deep conditioning on darker sections which may be more resistant/healthy',
      'Avoid heat styling until lift is even and hair is stable',
    ],
  },

  color_grab: {
    id: 'color_grab',
    name: 'Color Grab / Staining',
    category: 'damage',
    severity: 'moderate',
    visualSigns: ['Ends darker than target', 'Color absorbs unevenly', 'Patchy deposit on porous sections'],
    rootCause: 'Highly porous or damaged ends absorb color faster than healthy hair, creating a "grab" effect. Common on over-processed hair, previously lightened ends, or hair with split ends.',
    neutralizationStrategy: 'Pre-treat porous ends with a filler or protein treatment before applying color. Use a lighter shade or clear mix on ends. Apply color to roots and mids first, ends last 5-10 min.',
    suggestedFormulas: [
      {
        name: 'Porosity Equalizer Pre-Treatment',
        purpose: 'Fill porous ends before color application',
        products: [
          { brand: 'Redken', shade: 'pH-Bonder or Protein treatment', developer: 'N/A', ratio: 'Direct', amount: 'As needed' },
          { brand: 'Wella', shade: 'Color Touch (1-2 levels lighter than target) + Clear', developer: '6V', ratio: '1:1', amount: '1-2 oz' },
        ],
        processingTime: 'Pre-treatment 10 min, color 15-20 min',
        sectioning: 'Apply pre-treatment to ends only. Rinse. Apply color to roots/mids first, ends last 5-10 min.',
        notes: ['Pre-treatment fills "holes" in cuticle', 'Lighter shade on ends prevents over-deposit', 'Use demi-permanent for less aggressive deposit'],
      },
      {
        name: 'Clear Dilution for Ends',
        purpose: 'Prevent color grab with translucent formula',
        products: [
          { brand: 'Matrix', shade: 'ColorSync Clear + 1/4 target shade', developer: '10V', ratio: '1:1', amount: '1 oz' },
        ],
        processingTime: '5-10 min on ends only',
        sectioning: 'Apply to ends in last phase of application',
        notes: ['Clear dilutes pigment strength', 'Ends get color without over-deposit', 'Safe on compromised hair'],
      },
    ],
    processingNotes: [
      'Color grab = porous, damaged ends. Pre-treat before color.',
      'Always apply color to HEALTHY sections first, porous ends LAST',
      'Use lower developer (6V-10V) on porous ends',
      'Consider cutting damaged ends if grab is severe',
    ],
    homeCare: [
      'Protein treatments every 2 weeks to rebuild porosity',
      'Acidic pH conditioner to seal cuticle',
      'Avoid bleach on porous ends until rebuilt',
    ],
  },

  hollow_ends: {
    id: 'hollow_ends',
    name: 'Hollow Ends / See-Through',
    category: 'damage',
    severity: 'severe',
    visualSigns: ['Ends look transparent or see-through', 'Lack pigment density', 'Breakage-prone, fragile'],
    rootCause: 'Severe cuticle damage from repeated lightening, heat, or chemical over-processing. The hair shaft is hollow — the cortex is depleted. Color cannot anchor properly.',
    neutralizationStrategy: 'DO NOT attempt to color hollow ends — they will grab unevenly and break. Cut off hollow sections (minimum 1-2 inches). If client refuses, use a demi-permanent gloss only for temporary cosmetic improvement.',
    suggestedFormulas: [
      {
        name: 'Demi-Permanent Cosmetic Gloss',
        purpose: 'Temporary color on compromised ends only if cutting is refused',
        products: [
          { brand: 'Redken', shade: 'Shades EQ (1 level deeper than target) + Clear', developer: 'Processing Solution', ratio: '1:1', amount: '1 oz' },
        ],
        processingTime: '5-10 min ONLY',
        sectioning: 'Apply to hollow ends only',
        notes: ['5-10 min max — longer = more damage', 'Deeper shade compensates for lack of pigment', 'This is cosmetic only, not a fix'],
      },
    ],
    processingNotes: [
      'Hollow ends = structural failure. Color cannot fix this.',
      'Recommend trim of 1-3 inches based on severity',
      'If cutting is refused: use ONLY demi-permanent, 5-10 min max',
      'Never use permanent color or lightener on hollow ends',
    ],
    homeCare: [
      'Olaplex No. 3 weekly to rebuild bonds (won\'t fix hollow, but prevents further damage)',
      'Silk pillowcase to reduce friction breakage',
      'Heat protectant at 450°F+ if heat styling is unavoidable',
    ],
  },

  overfilled_red: {
    id: 'overfilled_red',
    name: 'Overfilled Red / Too Warm',
    category: 'filler',
    severity: 'moderate',
    visualSigns: ['Unnaturally bright red/orange', 'Lacks depth or dimension', 'Looks "cartoonish" or artificial'],
    rootCause: 'Too much warm filler applied before ash toning, or red pigment over-deposited during previous service. Common when trying to "fill" blonde before going brunette but using too much red/orange.',
    neutralizationStrategy: 'Use an ash-based demi-permanent to cool down the red. Blue-green base cancels red-orange. Apply globally, process with heat for maximum neutralization. For severe cases, a soap cap (bleach shampoo) may be needed first.',
    suggestedFormulas: [
      {
        name: 'Ash Neutralizer for Overfilled Red',
        purpose: 'Cool down excessive red pigment',
        products: [
          { brand: 'Wella', shade: 'Color Touch 6/1 + 7/1 + Green additive (1/8 oz)', developer: '6V', ratio: '1:2', amount: '2-3 oz' },
        ],
        processingTime: '15-20 min with gentle heat',
        sectioning: 'Global application on dry hair',
        notes: ['6/1 = dark ash blonde, 7/1 = medium ash blonde', 'Green additive = extra red cancellation', 'Process with heat for max deposit'],
      },
      {
        name: 'Soap Cap (for severe overfill)',
        purpose: 'Lift some red pigment before re-toning',
        products: [
          { brand: 'Schwarzkopf', shade: 'BlondMe Lightener', developer: '10V', ratio: '1:3 with shampoo', amount: '2 oz lightener + 6 oz clarifying shampoo' },
        ],
        processingTime: '5-10 min, watching closely',
        sectioning: 'Apply to overfilled areas, keep wet',
        notes: ['5 min MAX — this lifts AND cleanses', 'Rinse immediately when desired level reached', 'Follow with ash toner', 'NOT for compromised hair'],
      },
    ],
    processingNotes: [
      'Overfilled red = too much warm pigment deposited',
      'Ash (blue-green) cancels red-orange on color wheel',
      'Use darker ash levels (5-7) for more red neutralization',
      'Green additive can be used for extreme cases',
    ],
    homeCare: [
      'Blue shampoo (not purple — blue cancels orange/red)',
      'Avoid heat which opens cuticle and releases red pigment',
      'Cool water rinses to seal cuticle and lock in ash',
    ],
  },
}

// --- DIAGNOSTIC ENGINE ---

export function diagnose(hairState: HairState): CorrectiveIssue[] {
  const issues: CorrectiveIssue[] = []

  // Hot roots: warm scalp zone with cooler mids
  if (hairState.hotRoots || (hairState.currentLevel > hairState.targetLevel && hairState.condition === 'previously_colored')) {
    issues.push(ISSUES.hot_roots)
  }

  // Green cast: over-ashed blonde or mineral buildup
  if (hairState.currentTone === 'A' && hairState.currentLevel >= 7 && hairState.porosity === 'high') {
    issues.push(ISSUES.green_cast)
  }

  // Muddy toner: toner too dark for lifted level
  if (hairState.currentTone === 'A' && hairState.currentLevel < hairState.targetLevel) {
    issues.push(ISSUES.muddy_toner)
  }

  // Over-ashy: flat gray, lacking warmth
  if (hairState.currentTone === 'A' && hairState.condition === 'damaged') {
    issues.push(ISSUES.over_ashy)
  }

  // Orange bands: visible banding from overlap
  if (hairState.banding || (hairState.previousLightener && hairState.condition === 'bleached')) {
    issues.push(ISSUES.orange_bands)
  }

  // Uneven lift: patchy lightening
  if (hairState.multipleColors || hairState.condition === 'damaged') {
    issues.push(ISSUES.uneven_lift)
  }

  // Color grab: porous ends absorbing too much
  if (hairState.porosity === 'high' && hairState.condition === 'damaged') {
    issues.push(ISSUES.color_grab)
  }

  // Hollow ends: severe structural damage
  if (hairState.condition === 'damaged' && hairState.porosity === 'high' && hairState.currentLevel >= 9) {
    issues.push(ISSUES.hollow_ends)
  }

  // Overfilled red: excessive warm pigment
  if (hairState.currentTone === 'R' && hairState.currentLevel <= 6) {
    issues.push(ISSUES.overfilled_red)
  }

  return issues
}

// Severity-based priority
export function prioritizeIssues(issues: CorrectiveIssue[]): CorrectiveIssue[] {
  const severityOrder = { severe: 0, moderate: 1, mild: 2 }
  return [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

// Quick check: does this hair state need corrective color?
export function needsCorrectiveColor(hairState: HairState): boolean {
  return diagnose(hairState).length > 0
}
