'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShadeDefinition } from '@/lib/tryon/shade-library'
import { ALL_SHADES, getShadesByTone, rgbToCss, hslToCss } from '@/lib/tryon/shade-library'

interface ShadePickerProps {
  selectedShade: ShadeDefinition | null
  onShadeSelect: (shade: ShadeDefinition) => void
  filterByBrand?: string
  filterByTone?: string
  className?: string
}

const TONE_COLORS: Record<string, string> = {
  neutral: '#9C8B7A',
  ash: '#8A7D6E',
  golden: '#C4A35A',
  copper: '#B87333',
  red: '#A03030',
  violet: '#7B68A6',
  pearl: '#B8B0C4',
  beige: '#C4B5A0',
  mahogany: '#6B3A3A',
  chocolate: '#4A2C2A',
  warm: '#D4A574',
  cool: '#7D8B9A',
  pink: '#E8A0B0',
  silver: '#C0C0C0',
  platinum: '#E8E4DF',
  blue: '#5B7FA5',
  green: '#6B9B7A',
}

export function ShadePicker({ selectedShade, onShadeSelect, filterByBrand, filterByTone, className }: ShadePickerProps) {
  const [activeTone, setActiveTone] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredShades = ALL_SHADES.filter(s => {
    if (filterByBrand && s.brand !== filterByBrand) return false
    if (filterByTone && s.tone !== filterByTone) return false
    if (activeTone !== 'all' && s.tone !== activeTone) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q)
    }
    return true
  })

  const toneGroups = getShadesByTone()
  const tones = Object.keys(toneGroups).sort()

  return (
    <div className={className}>
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search shades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#F5F5F7] placeholder:text-[#71717A] focus:outline-none focus:border-[#9333EA]/40 transition-colors"
        />
      </div>

      {/* Tone filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveTone('all')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.05em] transition-all ${
            activeTone === 'all'
              ? 'bg-[#9333EA] text-[#0A0A0F]'
              : 'bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08]'
          }`}
        >
          All
        </button>
        {tones.map(tone => (
          <button
            key={tone}
            onClick={() => setActiveTone(tone)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 ${
              activeTone === tone
                ? 'text-[#0A0A0F]'
                : 'bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08]'
            }`}
            style={{
              backgroundColor: activeTone === tone ? (TONE_COLORS[tone] || '#9333EA') : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TONE_COLORS[tone] || '#999' }}
            />
            {tone}
          </button>
        ))}
      </div>

      {/* Shade grid */}
      <div ref={scrollRef} className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <AnimatePresence mode="popLayout">
          {filteredShades.map(shade => (
            <ShadeSwatch
              key={shade.id}
              shade={shade}
              isSelected={selectedShade?.id === shade.id}
              onClick={() => onShadeSelect(shade)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Shade count */}
      <div className="mt-2 text-[10px] text-[#71717A] text-right">
        {filteredShades.length} shade{filteredShades.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function ShadeSwatch({ shade, isSelected, onClick }: { shade: ShadeDefinition; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        isSelected
          ? 'bg-white/[0.08] ring-1 ring-[#9333EA]/60 shadow-lg shadow-[#9333EA]/10'
          : 'bg-white/[0.02] hover:bg-white/[0.05]'
      }`}
    >
      {/* Swatch circle */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden">
        <div
          className="w-full h-full rounded-full border border-white/[0.08]"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${rgbToCss(shade.rgb, 0.9)}, ${rgbToCss([
              Math.max(0, shade.rgb[0] - 30),
              Math.max(0, shade.rgb[1] - 30),
              Math.max(0, shade.rgb[2] - 30),
            ])})`,
          }}
        />
        {shade.shimmer && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)',
            }}
          />
        )}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 rounded-full border-2 border-[#9333EA] flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7L6 10L11 4" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Shade info */}
      <span className="text-[9px] font-medium text-[#A1A1AA] leading-tight text-center truncate w-full">
        {shade.code}
      </span>
    </motion.button>
  )
}
