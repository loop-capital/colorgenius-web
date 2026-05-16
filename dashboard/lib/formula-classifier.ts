// Formula Auto-Classifier
// Derives tags, tone families, and search descriptors from formula data
// so stylists can search by look/feel without manual tagging.

// ─── Shade Code → Tone Family Mapping ─────────────────────────────────────────

const TONE_PREFIX_MAP: Record<string, string[]> = {
  // Common brand prefixes → tone descriptors
  'N':   ['natural', 'neutral'],
  'NN':  ['natural', 'neutral', 'gray-coverage'],
  'A':   ['ash', 'cool', 'muted'],
  'AA':  ['ash', 'cool', 'muted', 'intense-ash'],
  'G':   ['gold', 'warm', 'honey'],
  'GG':  ['gold', 'warm', 'rich-gold'],
  'K':   ['copper', 'warm', 'vibrant'],
  'KG':  ['copper', 'gold', 'warm'],
  'KR':  ['copper', 'red', 'warm', 'auburn'],
  'R':   ['red', 'vibrant', 'warm'],
  'RR':  ['red', 'vibrant', 'intense-red'],
  'RV':  ['red', 'violet', 'rich'],
  'V':   ['violet', 'cool', 'muted'],
  'VV':  ['violet', 'cool', 'intense-violet'],
  'B':   ['beige', 'neutral', 'soft'],
  'BB':  ['beige', 'warm', 'soft', 'nude'],
  'BG':  ['beige', 'gold', 'warm'],
  'M':   ['mahogany', 'warm', 'rich', 'brown'],
  'MC':  ['mahogany', 'cool', 'rich'],
  'P':   ['pearl', 'cool', 'soft', 'muted'],
  'PP':  ['pearl', 'cool', 'silver'],
  'W':   ['warm', 'neutral'],
  'C':   ['cool', 'neutral'],
  'CH':  ['chocolate', 'warm', 'rich', 'brown'],
  'CHV': ['chocolate', 'violet', 'rich'],
  'CHG': ['chocolate', 'gold', 'warm'],
  'CG':  ['copper', 'gold', 'warm', 'amber'],
  'CB':  ['copper', 'beige', 'warm'],
}

// Brands that use well-known shade code formats
// Wella: "7/73", Schwarzkopf: "7-0", L'ANZA: "7CG", Redken: "7G", etc.
// We extract the tone portion regardless of format

function extractToneCode(shadeCode: string): string {
  if (!shadeCode) return ''

  // Format: "7/73" (Wella) → take after /
  if (shadeCode.includes('/')) {
    const parts = shadeCode.split('/')
    const toneNum = parts[1] || ''
    // Wella tone map: 0=natural, 1=ash, 3=gold, 4=copper, 5=red, 6=violet, 7=brown
    const wellaToneMap: Record<string, string> = {
      '0': 'N', '00': 'NN', '1': 'A', '11': 'AA',
      '3': 'G', '33': 'GG', '4': 'K', '43': 'KG',
      '5': 'R', '55': 'RR', '6': 'V', '66': 'VV',
      '7': 'CH', '73': 'CHG', '71': 'A',
    }
    // Check multi-digit first
    return wellaToneMap[toneNum] || wellaToneMap[toneNum.charAt(0)] || 'N'
  }

  // Format: "7-0" (Schwarzkopf) → take after -
  if (shadeCode.includes('-')) {
    const parts = shadeCode.split('-')
    const tone = parts[1] || ''
    const schwToneMap: Record<string, string> = {
      '0': 'N', '1': 'A', '3': 'G', '4': 'K',
      '5': 'R', '6': 'V', '8': 'M', '9': 'B',
    }
    return schwToneMap[tone] || tone.toUpperCase()
  }

  // Format: "7CG" "5N" "10V" (L'ANZA, Redken, etc.)
  // Strip leading digits, remaining letters = tone
  const tonePart = shadeCode.replace(/^\d+/, '').toUpperCase()

  // Check multi-letter first (CG, KG, RV, etc.)
  if (TONE_PREFIX_MAP[tonePart]) return tonePart

  // Check single letter
  if (tonePart.length > 0 && TONE_PREFIX_MAP[tonePart.charAt(0)]) {
    return tonePart.charAt(0)
  }

  return tonePart || 'N'
}

function getToneTags(toneCode: string): string[] {
  return TONE_PREFIX_MAP[toneCode] || TONE_PREFIX_MAP[toneCode.charAt(0)] || ['natural']
}

// ─── Level → Descriptors ──────────────────────────────────────────────────────

function extractLevel(shadeCode: string): number | null {
  if (!shadeCode) return null
  // "7/73" → 7, "5N" → 5, "100P" → 10, "7-0" → 7
  const match = shadeCode.match(/^(\d+)/)
  if (!match) return null
  const raw = parseInt(match[1])
  // Some brands use 100+ for ultra-high lift
  if (raw >= 100) return Math.round(raw / 10)
  return raw
}

function getLevelTags(level: number | null): string[] {
  if (level === null) return []
  if (level <= 2) return ['dark', 'rich', 'deep', 'espresso', 'black']
  if (level <= 4) return ['dark', 'rich', 'deep', 'brunette', 'brown']
  if (level <= 6) return ['brunette', 'brown', 'natural', 'mid']
  if (level <= 8) return ['blonde', 'light', 'warm', 'bright']
  if (level <= 10) return ['blonde', 'light', 'bright', 'high-lift', 'platinum']
  return ['platinum', 'high-lift', 'icy', 'level 10']
}

// ─── Notes → Technique Keywords ───────────────────────────────────────────────

const TECHNIQUE_KEYWORDS: Record<string, string[]> = {
  'balayage': ['balayage', 'dimensional', 'low-maintenance', 'hand-painted'],
  'foil': ['highlights', 'dimensional', 'foils', 'streaks'],
  'highlight': ['highlights', 'dimensional', 'face-frame'],
  'root melt': ['root-melt', 'shadow', 'dimensional', 'low-maintenance', 'gradient'],
  'shadow root': ['shadow', 'root', 'dimensional', 'low-maintenance'],
  'root touchup': ['root-touch-up', 'gray-coverage'],
  'root touch-up': ['root-touch-up', 'gray-coverage'],
  'root touch up': ['root-touch-up', 'gray-coverage'],
  'global': ['global', 'all-over', 'full-coverage'],
  'toner': ['toner', 'glossy', 'reflective'],
  'gloss': ['glossy', 'reflective', 'toner'],
  'glaze': ['glossy', 'reflective', 'toner'],
  'corrective': ['corrective', 'color-correction'],
  'pre-lighten': ['high-lift', 'bleach', 'pre-lightened'],
  'pre lightened': ['high-lift', 'bleach', 'pre-lightened'],
  'money piece': ['face-frame', 'money-piece', 'highlight', 'dimensional'],
  'face frame': ['face-frame', 'highlight', 'dimensional'],
  'ombré': ['ombre', 'dimensional', 'gradient'],
  'sombre': ['sombre', 'dimensional', 'soft', 'subtle'],
  'babylights': ['babylights', 'dimensional', 'subtle', 'fine'],
  'lowlight': ['lowlights', 'dimensional', 'depth'],
  'vivid': ['vivid', 'fashion', 'creative', 'vibrant'],
  'fashion color': ['fashion', 'creative', 'vibrant', 'vivid'],
}

function extractTechniqueTags(notes: string, application: string, coverage: string): string[] {
  const searchStr = `${notes} ${application} ${coverage}`.toLowerCase()
  const tags: string[] = []
  for (const [keyword, descriptors] of Object.entries(TECHNIQUE_KEYWORDS)) {
    if (searchStr.includes(keyword)) {
      tags.push(...descriptors)
    }
  }
  return [...new Set(tags)]
}

// ─── Finish Descriptors from Formula Composition ─────────────────────────────

function getFinishTags(toneCodes: string[]): string[] {
  const tags: string[] = []
  let hasWarm = false
  let hasCool = false

  for (const code of toneCodes) {
    const toneTags = getToneTags(code)
    if (toneTags.some(t => ['warm', 'gold', 'copper', 'honey', 'amber'].includes(t))) hasWarm = true
    if (toneTags.some(t => ['cool', 'ash', 'muted', 'violet', 'pearl'].includes(t))) hasCool = true
  }

  if (hasWarm && !hasCool) tags.push('warm')
  if (hasCool && !hasWarm) tags.push('cool')
  if (hasWarm && hasCool) tags.push('dimensional')
  if (!hasWarm && !hasCool) tags.push('neutral')

  // Multi-shade formulas are dimensional
  if (toneCodes.length > 1) tags.push('dimensional', 'multi-tonal')

  return tags
}

// ─── Main Classifier ─────────────────────────────────────────────────────────

export interface FormulaForClassification {
  shades?: { code: string; name?: string }[]
  notes?: string
  application?: string
  coverage?: string
  name?: string
  tags?: string[]
  brand?: string
  line?: string
}

export interface ClassificationResult {
  autoTags: string[]
  toneFamilies: string[]
  levelRange: { min: number | null; max: number | null }
  searchText: string // pre-computed searchable string
}

export function classifyFormula(formula: FormulaForClassification): ClassificationResult {
  const allTags: string[] = []
  const toneFamilies: string[] = []
  const levels: number[] = []

  // Process each shade
  for (const shade of formula.shades || []) {
    const toneCode = extractToneCode(shade.code)
    const level = extractLevel(shade.code)

    allTags.push(...getToneTags(toneCode))
    toneFamilies.push(toneCode)

    if (level !== null) {
      levels.push(level)
      allTags.push(...getLevelTags(level))
    }
  }

  // Technique from notes/application
  allTags.push(...extractTechniqueTags(
    formula.notes || '',
    formula.application || '',
    formula.coverage || ''
  ))

  // Finish from tone composition
  allTags.push(...getFinishTags(toneFamilies))

  // Include existing manual tags
  if (formula.tags) allTags.push(...formula.tags)

  // Deduplicate
  const autoTags = [...new Set(allTags)]

  // Pre-compute searchable text (what the search engine will match against)
  const searchText = [
    formula.name,
    formula.brand,
    formula.line,
    ...autoTags,
    ...(formula.tags || []),
    formula.notes,
    formula.application,
    formula.coverage,
  ].filter(Boolean).join(' ').toLowerCase()

  return {
    autoTags,
    toneFamilies,
    levelRange: {
      min: levels.length > 0 ? Math.min(...levels) : null,
      max: levels.length > 0 ? Math.max(...levels) : null,
    },
    searchText,
  }
}

// ─── Trend Matching ───────────────────────────────────────────────────────────

export interface TrendMatch {
  trend: string
  score: number // 0-1, higher = better match
  matchedTerms: string[]
}

export function matchTrends(classification: ClassificationResult, trends: Record<string, string[]>): TrendMatch[] {
  const results: TrendMatch[] = []

  for (const [trendName, trendTerms] of Object.entries(trends)) {
    const matched = trendTerms.filter(term =>
      classification.autoTags.some(tag => tag.includes(term) || term.includes(tag)) ||
      classification.searchText.includes(term)
    )
    if (matched.length > 0) {
      results.push({
        trend: trendName,
        score: matched.length / trendTerms.length,
        matchedTerms: matched,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
