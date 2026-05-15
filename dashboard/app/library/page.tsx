'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TreatmentCard } from '@/components/custom'
import { GlassCard } from '@/components/custom'
import { ColorWheel3D } from '@/components/custom'
import { HairSwatch } from '@/components/ui/hair-swatch'
import {
  Search, Save, Edit3, Trash2, X, FlaskConical, Filter,
  Grid3X3, LayoutList, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { classifyFormula } from '@/lib/formula-classifier'

/* Inline custom components — no shadcn Card/Badge/Button */

function ActionButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
}: {
  children: React.ReactNode
  onClick?: (e?: any) => void
  variant?: 'primary' | 'outline' | 'ghost'
  disabled?: boolean
  className?: string
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const styles = {
    primary: 'text-[#0A0A0A] hover:opacity-90 active:scale-[0.98]',
    outline: 'bg-transparent border hover:text-[#F5F5F7] active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-white/[0.04] active:scale-[0.98]',
  }
  const bg = variant === 'primary'
    ? { background: 'var(--cg-gradient-teal)' }
    : variant === 'outline'
      ? { borderColor: 'rgba(255,255,255,0.12)', color: 'var(--cg-text-secondary)' }
      : { color: 'var(--cg-text-secondary)' }

  return (
    <motion.button
      className={cn(base, styles[variant], className)}
      style={bg}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

function TagPill({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
      style={{
        color: 'var(--cg-text-tertiary)',
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      {label}
    </div>
  )
}

interface Formula {
  id: string
  name: string
  clientName: string
  brand: string
  line: string
  createdAt: string
  tags: string[]
  developer: string
  developerVolume: string
  totalVolume: string
  processingTime: string
  application: string
  coverage: string
  notes: string
  shades: { code: string; name: string; hex: string }[]
  confidence: number
  autoTags?: string[]
  searchText?: string
}

const MOCK_FORMULAS: Formula[] = [
  {
    id: '1',
    name: 'Summer Balayage Formula',
    clientName: 'Jennifer Martinez',
    brand: 'Wella',
    line: 'Koleston Perfect ME+',
    createdAt: '2026-04-20',
    tags: ['balayage', 'summer', 'low-maintenance'],
    developer: '30Vol',
    developerVolume: '30ml',
    totalVolume: '60ml',
    processingTime: '35 minutes',
    application: 'Balayage',
    coverage: 'Partial',
    notes: 'Apply to mid-lengths and ends using balayage technique. Process for 30-40 minutes.',
    shades: [
      { code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' },
      { code: '8/73', name: 'Light Golden Blonde', hex: '#D4AA7D' },
    ],
    confidence: 94,
  },
  {
    id: '2',
    name: 'Root Touch-Up — Natural Brown',
    clientName: 'Sarah Chen',
    brand: 'Schwarzkopf',
    line: 'Igora Royal',
    createdAt: '2026-04-18',
    tags: ['root-touch-up', 'natural', 'gray-coverage'],
    developer: '10Vol',
    developerVolume: '20ml',
    totalVolume: '40ml',
    processingTime: '30 minutes',
    application: 'Root application',
    coverage: 'Full',
    notes: 'Section hair into quadrants. Apply directly to regrowth only.',
    shades: [
      { code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' },
    ],
    confidence: 91,
  },
  {
    id: '3',
    name: 'Vivid Rose Gold Blend',
    clientName: 'Mia Johnson',
    brand: 'Joico',
    line: 'Color Intensity',
    createdAt: '2026-04-15',
    tags: ['vivid', 'rose-gold', 'creative'],
    developer: '15Vol',
    developerVolume: '25ml',
    totalVolume: '50ml',
    processingTime: '20 minutes',
    application: 'Global',
    coverage: 'Full',
    notes: 'Pre-lighten to level 8 before applying. Mix equal parts Rose and Pink.',
    shades: [
      { code: 'R', name: 'Vivid Red', hex: '#D44444' },
      { code: 'P', name: 'Pink', hex: '#E892A0' },
    ],
    confidence: 87,
  },
  {
    id: '4',
    name: 'Ash Blonde Correction',
    clientName: 'Emily Davis',
    brand: 'Goldwell',
    line: 'DualSenses Color',
    createdAt: '2026-04-12',
    tags: ['correction', 'ash-blonde', 'cool-tone'],
    developer: '30Vol',
    developerVolume: '40ml',
    totalVolume: '80ml',
    processingTime: '45 minutes',
    application: 'Zone application',
    coverage: 'Partial',
    notes: 'Pre-tone with 9V to neutralize warmth. Apply ash formula to mid-lengths first.',
    shades: [
      { code: '8A', name: 'Light Blonde Ash', hex: '#C4B0A0' },
      { code: '7A', name: 'Medium Blonde Ash', hex: '#A89080' },
    ],
    confidence: 88,
  },
  {
    id: '5',
    name: 'L\'ANZA Natural Gray Coverage',
    clientName: 'Patricia Williams',
    brand: 'L\'ANZA',
    line: 'Healing Color',
    createdAt: '2026-04-10',
    tags: ['gray-coverage', 'natural', 'permanent'],
    developer: '20Vol',
    developerVolume: '45ml',
    totalVolume: '75ml',
    processingTime: '35 minutes',
    application: 'Root application',
    coverage: 'Full',
    notes: 'Mix 5N + 5NN equal parts for 50%+ gray coverage. Apply to regrowth only. Process 30-35 minutes.',
    shades: [
      { code: '5N', name: 'Light Natural Brown', hex: '#7D6350' },
      { code: '5NN', name: 'Ultra Natural Light Brown', hex: '#6B5544' },
    ],
    confidence: 92,
  },
  {
    id: '6',
    name: 'L\'ANZA Violet Ash Transformation',
    clientName: 'Lisa Thompson',
    brand: 'L\'ANZA',
    line: 'Healing Color',
    createdAt: '2026-04-08',
    tags: ['violet', 'ash', 'cool-tone', 'fashion'],
    developer: '30Vol',
    developerVolume: '45ml',
    totalVolume: '75ml',
    processingTime: '35 minutes',
    application: 'Global',
    coverage: 'Full',
    notes: 'Pre-lighten to level 8. Apply 8V for violet ash blonde. Process 30-35 minutes. Use Color-Preserving Shampoo.',
    shades: [
      { code: '8V', name: 'Light Violet Blonde', hex: '#A890A0' },
    ],
    confidence: 89,
  },
  {
    id: '7',
    name: 'L\'ANZA Copper Gold Balayage',
    clientName: 'Michelle Garcia',
    brand: 'L\'ANZA',
    line: 'Healing Color',
    createdAt: '2026-04-05',
    tags: ['balayage', 'copper', 'gold', 'warm-tone'],
    developer: '30Vol',
    developerVolume: '45ml',
    totalVolume: '75ml',
    processingTime: '35 minutes',
    application: 'Balayage',
    coverage: 'Partial',
    notes: 'Apply 7CG to mid-lengths and ends. Process 30-35 minutes. For added vibrancy, mix with Orange Kicker.',
    shades: [
      { code: '7CG', name: 'Dark Copper Gold Blonde', hex: '#B87040' },
    ],
    confidence: 90,
  },
  {
    id: '8',
    name: 'L\'ANZA Pearl Platinum Blonde',
    clientName: 'Amanda Lee',
    brand: 'L\'ANZA',
    line: 'Healing Color',
    createdAt: '2026-04-01',
    tags: ['pearl', 'platinum', 'high-lift', 'blonde'],
    developer: '40Vol',
    developerVolume: '60ml',
    totalVolume: '100ml',
    processingTime: '40 minutes',
    application: 'Global',
    coverage: 'Full',
    notes: 'Use 100P with 40Vol for maximum lift to level 10+. Process up to 40 minutes. Tone with 10P if needed.',
    shades: [
      { code: '100P', name: 'Ultra Pearl Blonde', hex: '#C4B8C8' },
      { code: '10P', name: 'Lightest Pearl Blonde', hex: '#B8B0C4' },
    ],
    confidence: 86,
  },
]



const TONE_OPTIONS = [
  { value: 'N', label: 'Natural', color: '#9C8B7A' },
  { value: 'A', label: 'Ash', color: '#8A7D6E' },
  { value: 'G', label: 'Gold', color: '#C4A35A' },
  { value: 'K', label: 'Copper', color: '#B87333' },
  { value: 'R', label: 'Red', color: '#A03030' },
  { value: 'V', label: 'Violet', color: '#7B68A6' },
  { value: 'P', label: 'Pearl', color: '#B8B0C4' },
  { value: 'B', label: 'Beige', color: '#C4B5A0' },
  { value: 'M', label: 'Mahogany', color: '#6B3A3A' },
  { value: 'Ch', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'W', label: 'Warm', color: '#D4A574' },
  { value: 'C', label: 'Cool', color: '#7D8B9A' },
]

// Desired Result search vocabulary
const DESIRED_RESULT_MAP: Record<string, string[]> = {
  'expensive brunette': ['warm', 'dimensional', 'glossy', 'rich', 'brown', 'natural', 'brunette'],
  'lived-in bronde': ['balayage', 'warm', 'gold', 'natural', 'blonde', 'bronze', 'dimensional'],
  'icy level 10': ['platinum', 'ash', 'cool', 'pearl', 'high-lift', 'blonde', 'icy'],
  'copper cowboy': ['copper', 'warm', 'auburn', 'red', 'dimensional', 'natural'],
  'root melt': ['shadow', 'dimensional', 'low-maintenance', 'root', 'gradient', 'balayage'],
  'money piece': ['face-frame', 'highlight', 'blonde', 'dimensional', 'balayage'],
  'cherry coke': ['red', 'violet', 'mahogany', 'dark', 'rich', 'glossy'],
  'honey blonde': ['gold', 'warm', 'blonde', 'natural', 'honey', 'amber'],
  'mushroom brown': ['ash', 'cool', 'muted', 'brown', 'natural', 'dimensional'],
  'butter blonde': ['gold', 'warm', 'blonde', 'creamy', 'light', 'bright'],
  'chocolate cherry': ['chocolate', 'red', 'warm', 'brown', 'rich', 'vibrant'],
  'vanilla chai': ['beige', 'pearl', 'cool', 'blonde', 'soft', 'muted'],
  'espresso': ['dark', 'brown', 'cool', 'rich', 'natural', 'glossy'],
  'caramel balayage': ['gold', 'copper', 'warm', 'balayage', 'dimensional', 'blonde'],
  'smoky quartz': ['ash', 'cool', 'muted', 'brown', 'dimensional', 'soft'],
  'rose gold': ['copper', 'red', 'warm', 'fashion', 'vibrant'],
  'strawberry blonde': ['copper', 'gold', 'warm', 'blonde', 'red', 'natural'],
  'tiger eye': ['gold', 'copper', 'warm', 'dimensional', 'balayage', 'brunette'],
  'tortoiseshell': ['warm', 'dimensional', 'brown', 'gold', 'copper', 'rich'],
  'champagne': ['pearl', 'beige', 'cool', 'blonde', 'soft', 'muted'],
  'sand': ['beige', 'warm', 'neutral', 'blonde', 'soft', 'natural'],
  'pumpkin spice': ['copper', 'red', 'warm', 'vibrant', 'auburn'],
  'cinnamon': ['copper', 'red', 'warm', 'brown', 'auburn', 'natural'],
}

const TREND_CHIPS = [
  'Expensive Brunette', 'Lived-in Bronde', 'Icy Level 10', 'Copper Cowboy',
  'Root Melt', 'Money Piece', 'Cherry Coke', 'Honey Blonde',
  'Mushroom Brown', 'Espresso', 'Caramel Balayage', 'Rose Gold',
]

const FINISH_DESCRIPTORS = [
  { label: 'Cool', keywords: ['cool', 'ash', 'muted', 'smoky', 'icy'], color: '#7D8B9A' },
  { label: 'Neutral', keywords: ['neutral', 'natural', 'balanced', 'soft'], color: '#9C8B7A' },
  { label: 'Warm', keywords: ['warm', 'gold', 'copper', 'honey', 'amber'], color: '#D4A574' },
  { label: 'Dimensional', keywords: ['dimensional', 'multi-tonal', 'balayage', 'highlight'], color: '#C08C5A' },
  { label: 'Muted', keywords: ['muted', 'smoky', 'ash', 'soft', 'matte'], color: '#8A7D6E' },
  { label: 'Reflective', keywords: ['reflective', 'glossy', 'shiny', 'luminous'], color: '#C4A35A' },
  { label: 'Vibrant', keywords: ['vibrant', 'vivid', 'fashion', 'saturated'], color: '#A03030' },
  { label: 'Rich', keywords: ['rich', 'deep', 'intense', 'saturated'], color: '#6B3A3A' },
]

type ViewMode = 'grid' | 'table'

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterLine, setFilterLine] = useState('')
  const [filterTone, setFilterTone] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [formulas, setFormulas] = useState<Formula[]>(MOCK_FORMULAS)
  const [loading, setLoading] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState('')
  const [selectedFinish, setSelectedFinish] = useState('')
  const [desiredResultQuery, setDesiredResultQuery] = useState('')
  const [dynamicTrends, setDynamicTrends] = useState<string[]>([])

  // Log a search event for trend analytics
  const logTrendSearch = (query: string, category: 'trend' | 'finish' | 'free-text') => {
    fetch('/api/v1/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.toLowerCase(), category }),
    }).catch(() => {}) // fire-and-forget
  }

  // Fetch dynamic trends from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/v1/trends?days=30&limit=16')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.trends?.length > 0) {
          setDynamicTrends(data.trends.map((t: any) => t.name))
        }
      } catch (e) {
        // silent — fallback to hardcoded
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Fetch formulas from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/v1/formulas/list?limit=100')
        if (!res.ok) {
          console.warn('Library API returned', res.status, '- using fallback data')
          // Keep default mock data, don't set empty
          return
        }
        const data = await res.json()
        if (!cancelled && data.items?.length > 0) {
            const mapped = data.items.map((f: any) => ({
              id: f.id,
              name: f.name || 'Untitled Formula',
              clientName: f.clientName || 'Unknown',
              brand: f.brand || 'Unknown',
              line: f.productLine || '',
              createdAt: f.createdAt || new Date().toISOString(),
              tags: f.tags || [],
              developer: f.developerVolume ? f.developerVolume + 'Vol' : '20Vol',
              developerVolume: f.developerVolume ? f.developerVolume + 'ml' : '60ml',
              totalVolume: f.totalVolume || '60ml',
              processingTime: f.processingTime ? f.processingTime + ' min' : '30 min',
              application: f.application || 'Full Head',
              coverage: f.coverage || 'Roots',
              notes: f.notes || '',
              shades: (f.components || []).filter((c: any) => c.componentType === 'color').map((c: any) => ({
                code: c.shadeCode || '?',
                name: c.shadeName || c.shadeCode || 'Unknown',
                hex: '#9333EA',
              })),
              confidence: f.confidence || 85,
            }))
            setFormulas(mapped)
          }
      } catch (e) {
        console.error('Failed to fetch formulas:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const BRANDS = useMemo(() => Array.from(new Set(formulas.map((f) => f.brand))), [formulas])
  const LINES_BY_BRAND = useMemo(() => formulas.reduce(
    (acc, f) => {
      if (!acc[f.brand]) acc[f.brand] = []
      if (!acc[f.brand].includes(f.line)) acc[f.brand].push(f.line)
      return acc
    },
    {}
  ), [formulas])

  // Auto-classify all formulas for enriched search
  const classifiedFormulas = useMemo(() => {
    return formulas.map(f => {
      const classification = classifyFormula({
        shades: f.shades.map(s => ({ code: s.code, name: s.name })),
        notes: f.notes,
        application: f.application,
        coverage: f.coverage,
        name: f.name,
        tags: f.tags,
        brand: f.brand,
        line: f.line,
      })
      return {
        ...f,
        autoTags: classification.autoTags,
        searchText: classification.searchText,
      }
    })
  }, [formulas])

  // Build desired-result search terms from trend, finish, and free text
  const desiredResultTerms = useMemo(() => {
    let terms: string[] = []
    if (selectedTrend) {
      const trendKey = selectedTrend.toLowerCase()
      terms = [...terms, ...(DESIRED_RESULT_MAP[trendKey] || [trendKey])]
    }
    if (selectedFinish) {
      const desc = FINISH_DESCRIPTORS.find(d => d.label === selectedFinish)
      if (desc) terms = [...terms, ...desc.keywords]
    }
    if (desiredResultQuery.trim()) {
      const q = desiredResultQuery.toLowerCase().trim()
      // Check if the free text matches a known trend
      if (DESIRED_RESULT_MAP[q]) {
        terms = [...terms, ...DESIRED_RESULT_MAP[q]]
      }
      // Also split into words and check each
      terms = [...terms, ...q.split(/\s+/).filter(w => w.length > 2)]
    }
    return [...new Set(terms)]
  }, [selectedTrend, selectedFinish, desiredResultQuery])

  const filteredFormulas = useMemo(() => {
    let result = [...classifiedFormulas]
    // Standard text search — uses pre-computed searchText + clientName
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (f) =>
          (f.searchText || '').includes(q) ||
          f.clientName.toLowerCase().includes(q)
      )
    }
    if (filterBrand && filterBrand !== 'all') result = result.filter((f) => f.brand === filterBrand)
    if (filterLine && filterLine !== 'all') result = result.filter((f) => f.line === filterLine)
    // Tone filter — now searches the enriched searchText which includes auto-classified tone tags
    if (filterTone) {
      const toneLabel = TONE_OPTIONS.find(t => t.value === filterTone)?.label?.toLowerCase() || filterTone.toLowerCase()
      result = result.filter((f) => (f.searchText || '').includes(toneLabel))
    }
    // Desired result search — match against enriched searchText
    if (desiredResultTerms.length > 0) {
      result = result.filter((f) => {
        const text = f.searchText || ''
        return desiredResultTerms.some(term => text.includes(term))
      })
    }
    return result
  }, [searchTerm, filterBrand, filterLine, filterTone, desiredResultTerms, classifiedFormulas])

  const linesForBrand = (filterBrand && filterBrand !== 'all') ? LINES_BY_BRAND[filterBrand] || [] : []

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
              Formula <span className="gradient-text-teal">Library</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
              Browse, search, and manage your color formulas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? <LayoutList className="w-4 h-4 mr-1.5" /> : <Grid3X3 className="w-4 h-4 mr-1.5" />}
              {viewMode === 'grid' ? 'Table' : 'Grid'}
            </ActionButton>
            <ActionButton>
              <Save className="mr-1.5 h-4 w-4" />
              Save Formula
            </ActionButton>
          </div>
        </motion.div>

        {/* Desired Result Search */}
        <motion.div
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(30,30,45,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--cg-text-tertiary)' }}>
            Desired Result — Search by look
          </p>
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--cg-text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Describe the look — creamy beige, lived-in bronde, icy level 10..."
              value={desiredResultQuery}
              onChange={(e) => {
                setDesiredResultQuery(e.target.value)
              }}
              onBlur={() => {
                const val = desiredResultQuery.trim()
                if (val.length > 2) logTrendSearch(val, 'free-text')
              }}
              className={cn(
                'w-full pl-9 pr-4 py-3 rounded-xl text-sm transition-all duration-200',
                'placeholder:text-[#71717A]',
                'focus:outline-none focus:ring-2'
              )}
              style={{
                background: 'var(--cg-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--cg-text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          {/* Finish / descriptor pills */}
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
              Finish
            </p>
            <div className="flex flex-wrap gap-2">
              {FINISH_DESCRIPTORS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => {
                    const next = selectedFinish === d.label ? '' : d.label
                    setSelectedFinish(next)
                    if (next) logTrendSearch(d.label, 'finish')
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedFinish === d.label ? `${d.color}22` : 'var(--cg-surface)',
                    border: `1px solid ${selectedFinish === d.label ? d.color + '55' : 'rgba(255,255,255,0.08)'}`,
                    color: selectedFinish === d.label ? d.color : 'var(--cg-text-secondary)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {/* Trend chips */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
              Trend Looks
            </p>
            <div className="flex flex-wrap gap-2">
              {(dynamicTrends.length > 0 ? dynamicTrends.map(t => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : TREND_CHIPS).map((trend) => (
                <button
                  key={trend}
                  onClick={() => {
                    const next = selectedTrend === trend ? '' : trend
                    setSelectedTrend(next)
                    if (next) logTrendSearch(trend, 'trend')
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedTrend === trend ? 'rgba(20,184,166,0.1)' : 'var(--cg-surface)',
                    border: `1px solid ${selectedTrend === trend ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: selectedTrend === trend ? 'var(--cg-teal)' : 'var(--cg-text-secondary)',
                  }}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
          {/* Active filter summary */}
          {(selectedTrend || selectedFinish || desiredResultQuery.trim()) && (
            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--cg-text-tertiary)' }}>Active:</span>
              {selectedTrend && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(20,184,166,0.1)', color: 'var(--cg-teal)', border: '1px solid rgba(20,184,166,0.2)' }}>
                  {selectedTrend}
                  <X size={10} className="cursor-pointer ml-0.5" onClick={() => setSelectedTrend('')} />
                </span>
              )}
              {selectedFinish && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: `${FINISH_DESCRIPTORS.find(d => d.label === selectedFinish)?.color}15`, color: FINISH_DESCRIPTORS.find(d => d.label === selectedFinish)?.color, border: `1px solid ${FINISH_DESCRIPTORS.find(d => d.label === selectedFinish)?.color}30` }}>
                  {selectedFinish}
                  <X size={10} className="cursor-pointer ml-0.5" onClick={() => setSelectedFinish('')} />
                </span>
              )}
              {desiredResultQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--cg-text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  "{desiredResultQuery.trim()}"
                  <X size={10} className="cursor-pointer ml-0.5" onClick={() => setDesiredResultQuery('')} />
                </span>
              )}
              <button
                className="text-[10px] underline ml-auto cursor-pointer"
                style={{ color: 'var(--cg-text-tertiary)' }}
                onClick={() => { setSelectedTrend(''); setSelectedFinish(''); setDesiredResultQuery('') }}
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-3 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Custom search bar — no shadcn Input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--cg-text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Search formulas by name, client, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200',
                'placeholder:text-[#71717A]',
                'focus:outline-none focus:ring-2'
              )}
              style={{
                background: 'var(--cg-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--cg-text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={filterBrand}
              onValueChange={(value) => { setFilterBrand(value); setFilterLine('') }}
            >
              <SelectTrigger
                className="w-40"
                style={{
                  background: 'var(--cg-surface)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--cg-text-primary)',
                }}
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" style={{ color: 'var(--cg-text-tertiary)' }} />
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--cg-surface)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <SelectItem value="all" className="text-[#F5F5F7]">All brands</SelectItem>
                {BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand} className="text-[#F5F5F7]">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLine} onValueChange={setFilterLine} disabled={!filterBrand}>
              <SelectTrigger
                className="w-40"
                style={{
                  background: 'var(--cg-surface)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--cg-text-primary)',
                }}
              >
                <SelectValue placeholder="All lines" />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--cg-surface)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <SelectItem value="all" className="text-[#F5F5F7]">All lines</SelectItem>
                {linesForBrand.map((line) => (
                  <SelectItem key={line} value={line} className="text-[#F5F5F7]">{line}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tone filter — ColorWheel3D */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--cg-text-tertiary)' }}>
            Filter by Tone
          </p>
          <div className="flex items-center gap-4">
            <ColorWheel3D
              tones={TONE_OPTIONS}
              selected={filterTone as any}
              onSelect={(val) => setFilterTone(filterTone === val ? '' : val)}
            />
            <div className="flex flex-col gap-2 pt-4">
              <div className="grid grid-cols-6 gap-2">
                {TONE_OPTIONS.slice(0, 6).map((tone) => (
                  <HairSwatch
                    key={tone.value}
                    color={tone.color}
                    label={tone.label}
                    isActive={filterTone === tone.value}
                    onClick={() => setFilterTone(filterTone === tone.value ? '' : tone.value)}
                    size="sm"
                  />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {TONE_OPTIONS.slice(6, 12).map((tone) => (
                  <HairSwatch
                    key={tone.value}
                    color={tone.color}
                    label={tone.label}
                    isActive={filterTone === tone.value}
                    onClick={() => setFilterTone(filterTone === tone.value ? '' : tone.value)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
            Showing <span className="font-medium" style={{ color: 'var(--cg-text-primary)' }}>{filteredFormulas.length}</span> of {classifiedFormulas.length} formulas
          </p>
        </div>

        {filteredFormulas.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FlaskConical className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.06)' }} />
            <p style={{ color: 'var(--cg-text-tertiary)' }}>No formulas found. Save your first formula to build your library.</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredFormulas.map((formula, i) => (
              <motion.div
                key={formula.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <TreatmentCard
                  name={formula.name}
                  brand={formula.brand}
                  line={formula.line}
                  shades={formula.shades}
                  developer={formula.developer}
                  developerVolume={formula.developerVolume}
                  mixRatio="1:1"
                  processingTime={formula.processingTime}
                  application={formula.application}
                  confidence={formula.confidence}
                  notes={formula.notes}
                  onClick={() => setSelectedFormula(formula)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="overflow-x-auto rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'var(--cg-surface)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  {['Formula Name', 'Client', 'Brand / Line', 'Shades', 'Confidence', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--cg-text-tertiary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {filteredFormulas.map((formula) => (
                  <tr
                    key={formula.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedFormula(formula)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--cg-text-primary)' }}>{formula.name}</p>
                      <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>{formula.application} · {formula.processingTime}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--cg-text-secondary)' }}>{formula.clientName || '-'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--cg-text-secondary)' }}>
                      {formula.brand} <span style={{ color: 'var(--cg-text-tertiary)' }}>·</span> {formula.line}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {formula.shades.map((shade) => (
                          <div key={shade.code} className="flex items-center gap-1">
                            <div
                              className="w-5 h-5 rounded border border-white/[0.08]"
                              style={{ backgroundColor: shade.hex }}
                              title={shade.name}
                            />
                            <span className="text-[10px] font-mono" style={{ color: 'var(--cg-text-tertiary)' }}>{shade.code}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border"
                        style={{
                          color: formula.confidence >= 90 ? '#9333EA' : '#F59E0B',
                          borderColor: formula.confidence >= 90 ? 'rgba(20,184,166,0.3)' : 'rgba(245,158,11,0.3)',
                          backgroundColor: formula.confidence >= 90 ? 'rgba(20,184,166,0.08)' : 'rgba(245,158,11,0.08)',
                        }}
                      >
                        {formula.confidence}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ActionButton variant="ghost" className="!p-2 !rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </ActionButton>
                        <ActionButton variant="ghost" className="!p-2 !rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFormula && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            style={{ backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: 'var(--cg-bg-primary)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Modal header */}
              <div
                className="sticky top-0 px-6 py-4 flex justify-between items-start z-10"
                style={{
                  background: 'var(--cg-bg-primary)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>{selectedFormula.brand} · {selectedFormula.line}</p>
                </div>
                <ActionButton variant="ghost" className="!p-2 !rounded-lg" onClick={() => setSelectedFormula(null)}>
                  <X className="h-4 w-4" />
                </ActionButton>
              </div>

              <div className="px-6 py-4 space-y-5">
                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3">
                  <GlassCard className="p-4 space-y-1 text-sm">
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Client:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.clientName}</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Created:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{new Date(selectedFormula.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Application:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.application}</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Coverage:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.coverage}</span>
                    </p>
                  </GlassCard>

                  <GlassCard className="p-4 space-y-1 text-sm">
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Developer:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.developer} ({selectedFormula.developerVolume})</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Total Volume:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.totalVolume}</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Processing:</span>{' '}
                      <span style={{ color: 'var(--cg-text-primary)' }}>{selectedFormula.processingTime}</span>
                    </p>
                    <p>
                      <span style={{ color: 'var(--cg-text-tertiary)' }}>Confidence:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--cg-teal)' }}>{selectedFormula.confidence}%</span>
                    </p>
                  </GlassCard>
                </div>

                {/* Shade swatches */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                    Shades
                  </h3>
                  <div className="flex gap-3">
                    {selectedFormula.shades.map((shade) => (
                      <div
                        key={shade.code}
                        className="flex items-center gap-2 p-2 rounded-xl"
                        style={{
                          background: 'var(--cg-surface)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-md border border-white/[0.08]"
                          style={{ backgroundColor: shade.hex }}
                        />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--cg-text-primary)' }}>{shade.code}</p>
                          <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>{shade.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFormula.tags.map((tag) => (
                      <TagPill key={tag} label={tag} />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                    Application Notes
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cg-text-secondary)' }}>
                    {selectedFormula.notes}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <ActionButton variant="outline" onClick={() => setSelectedFormula(null)}>
                    Close
                  </ActionButton>
                  <ActionButton onClick={() => {}}>
                    Use Formula <ChevronRight className="h-4 w-4 ml-1" />
                  </ActionButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
