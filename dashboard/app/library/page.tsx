'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormulaCard } from '@/components/ui/formula-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Save, Edit3, Trash2, X, FlaskConical, Filter, Grid3X3, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    notes: 'Apply to mid-lengths and ends using balayage technique. Process for 30-40 minutes depending on desired lift. Tone if necessary with Wella Color Touch 10VG.',
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
    notes: 'Section hair into quadrants. Apply directly to regrowth only. Process 25-30 minutes for resistant grays. Shampoo and condition with color-safe products.',
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
    notes: 'Pre-lighten to level 8 before applying. Mix equal parts Rose and Pink. Process under low heat for 15-20 minutes. Rinse in cool water.',
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
    notes: 'Pre-tone with 9V to neutralize warmth. Apply ash formula to mid-lengths first, then roots. Process 40-45 minutes. Use bonding additive for compromised hair.',
    shades: [
      { code: '8A', name: 'Light Blonde Ash', hex: '#C4B0A0' },
      { code: '7A', name: 'Medium Blonde Ash', hex: '#A89080' },
    ],
    confidence: 88,
  },
]

const BRANDS = Array.from(new Set(MOCK_FORMULAS.map((f) => f.brand)))

const LINES_BY_BRAND: Record<string, string[]> = MOCK_FORMULAS.reduce(
  (acc, f) => {
    if (!acc[f.brand]) acc[f.brand] = []
    if (!acc[f.brand].includes(f.line)) acc[f.brand].push(f.line)
    return acc
  },
  {} as Record<string, string[]>
)

type ViewMode = 'grid' | 'table'

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterLine, setFilterLine] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredFormulas = useMemo(() => {
    let result = [...MOCK_FORMULAS]
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.clientName.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)) ||
          f.notes.toLowerCase().includes(q)
      )
    }
    if (filterBrand) result = result.filter((f) => f.brand === filterBrand)
    if (filterLine) result = result.filter((f) => f.line === filterLine)
    return result
  }, [searchTerm, filterBrand, filterLine])

  const linesForBrand = filterBrand ? LINES_BY_BRAND[filterBrand] || [] : []

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Formula Library</h1>
            <p className="text-sm text-[#A3A3A3] mt-1">Browse, search, and manage your color formulas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#3A3A3A]"
            >
              {viewMode === 'grid' ? <LayoutList className="w-4 h-4 mr-1.5" /> : <Grid3X3 className="w-4 h-4 mr-1.5" />}
              {viewMode === 'grid' ? 'Table' : 'Grid'}
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save Formula
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <Input
              placeholder="Search formulas by name, client, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5] placeholder:text-[#737373] focus-visible:ring-[#14B8A6]/40"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filterBrand}
              onValueChange={(value) => { setFilterBrand(value); setFilterLine('') }}
            >
              <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5]">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="">All brands</SelectItem>
                {BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand} className="text-[#F5F5F5]">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLine} onValueChange={setFilterLine} disabled={!filterBrand}>
              <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5]">
                <SelectValue placeholder="All lines" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="">All lines</SelectItem>
                {linesForBrand.map((line) => (
                  <SelectItem key={line} value={line} className="text-[#F5F5F5]">{line}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#737373]">
            Showing <span className="text-[#F5F5F5] font-medium">{filteredFormulas.length}</span> of {MOCK_FORMULAS.length} formulas
          </p>
        </div>

        {filteredFormulas.length === 0 ? (
          <div className="text-center py-16">
            <FlaskConical className="h-12 w-12 text-[#2A2A2A] mx-auto mb-4" />
            <p className="text-[#737373]">No formulas found. Save your first formula to build your library.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((formula) => (
              <FormulaCard
                key={formula.id}
                {...formula}
                mixRatio="1:1"
                onClick={() => setSelectedFormula(formula)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2A2A2A] bg-[#171717]">
            <table className="w-full text-sm">
              <thead className="bg-[#1A1A1A]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Formula Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Brand / Line</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Shades</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Confidence</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filteredFormulas.map((formula) => (
                  <tr
                    key={formula.id}
                    className="hover:bg-[#1A1A1A]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFormula(formula)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#F5F5F5]">{formula.name}</p>
                      <p className="text-xs text-[#737373]">{formula.application} · {formula.processingTime}</p>
                    </td>
                    <td className="px-4 py-3 text-[#A3A3A3]">{formula.clientName || '-'}</td>
                    <td className="px-4 py-3 text-[#A3A3A3]">
                      {formula.brand} <span className="text-[#737373]">·</span> {formula.line}
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
                            <span className="text-[10px] text-[#737373] font-mono">{shade.code}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs border-0',
                          formula.confidence >= 90 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        )}
                      >
                        {formula.confidence}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737373] hover:text-[#F5F5F5]">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737373] hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFormula && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#171717] rounded-xl border border-[#2A2A2A] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#171717] border-b border-[#2A2A2A] px-6 py-4 flex justify-between items-start z-10">
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F5]">{selectedFormula.name}</h2>
                <p className="text-xs text-[#737373]">{selectedFormula.brand} · {selectedFormula.line}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFormula(null)} className="text-[#737373] hover:text-[#F5F5F5]">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-6 py-4 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardContent className="p-4 space-y-1 text-sm">
                    <p><span className="text-[#737373]">Client:</span> <span className="text-[#F5F5F5]">{selectedFormula.clientName}</span></p>
                    <p><span className="text-[#737373]">Created:</span> <span className="text-[#F5F5F5]">{new Date(selectedFormula.createdAt).toLocaleDateString()}</span></p>
                    <p><span className="text-[#737373]">Application:</span> <span className="text-[#F5F5F5]">{selectedFormula.application}</span></p>
                    <p><span className="text-[#737373]">Coverage:</span> <span className="text-[#F5F5F5]">{selectedFormula.coverage}</span></p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardContent className="p-4 space-y-1 text-sm">
                    <p><span className="text-[#737373]">Developer:</span> <span className="text-[#F5F5F5]">{selectedFormula.developer} ({selectedFormula.developerVolume})</span></p>
                    <p><span className="text-[#737373]">Total Volume:</span> <span className="text-[#F5F5F5]">{selectedFormula.totalVolume}</span></p>
                    <p><span className="text-[#737373]">Processing:</span> <span className="text-[#F5F5F5]">{selectedFormula.processingTime}</span></p>
                    <p><span className="text-[#737373]">Confidence:</span> <span className="text-[#14B8A6] font-medium">{selectedFormula.confidence}%</span></p>
                  </CardContent>
                </Card>
              </div>

              {/* Shade swatches in modal */}
              <div>
                <h3 className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">Shades</h3>
                <div className="flex gap-3">
                  {selectedFormula.shades.map((shade) => (
                    <div key={shade.code} className="flex items-center gap-2 p-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                      <div className="w-8 h-8 rounded-md border border-white/[0.08]" style={{ backgroundColor: shade.hex }} />
                      <div>
                        <p className="text-xs font-medium text-[#F5F5F5]">{shade.code}</p>
                        <p className="text-[10px] text-[#737373]">{shade.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFormula.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#A3A3A3] text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2A2A]">
                <h3 className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">Application Notes</h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">{selectedFormula.notes}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedFormula(null)} className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]">
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90">
                  Use Formula
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
