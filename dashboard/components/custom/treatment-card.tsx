'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ConfidenceBreakdown } from './confidence-breakdown'

export interface TreatmentCardProps {
  name: string
  brand: string
  line: string
  shades: { code: string; name: string; hex: string }[]
  developer: string
  developerVolume: string
  mixRatio: string
  processingTime: string
  application: string
  confidence: number
  confidenceScores?: {
    label: string
    value: number
    color: string
  }[]
  notes?: string
  onClick?: () => void
  showActions?: boolean
  className?: string
}

function MixRatioDiagram({ ratio }: { ratio: string }) {
  const [colorPart, developerPart] = ratio.split(':').map(Number)
  const total = colorPart + developerPart
  const colorPct = (colorPart / total) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.06] flex">
        <motion.div
          className="h-full bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${colorPct}%` }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${100 - colorPct}%` }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
      </div>
      <span className="text-[10px] font-mono text-[#A1A1AA]">{ratio}</span>
    </div>
  )
}

function ProcessingTimer({ time }: { time: string }) {
  const minutes = parseInt(time) || 35

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <motion.circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="#9333EA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="97.4"
            initial={{ strokeDashoffset: 97.4 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-semibold text-[#F5F5F7]">{minutes}</span>
        </div>
      </div>
      <span className="text-[11px] text-[#A1A1AA]">min</span>
    </div>
  )
}

export function TreatmentCard({
  name,
  brand,
  line,
  shades,
  developer,
  developerVolume,
  mixRatio,
  processingTime,
  application,
  confidence,
  confidenceScores,
  notes,
  showActions = true,
  onClick,
  className,
}: TreatmentCardProps) {
  // Determine gradient background based on first shade
  const primaryShade = shades[0]?.hex || '#9333EA'

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${className || ''}`}
      onClick={onClick}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: `linear-gradient(135deg, ${primaryShade}22 0%, #0F0F1A 60%, ${primaryShade}11 100%)`,
        }}
      />

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-[#9333EA]/20 transition-colors duration-300" />

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#F5F5F7] leading-tight tracking-tight group-hover:text-[#9333EA] transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A1A1AA]">
                {brand}
              </span>
              <span className="text-[10px] text-[#71717A]">{line}</span>
            </div>
          </div>
        </motion.div>

        {/* Shade swatches — large */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {shades.map((shade, i) => (
            <motion.div
              key={shade.code}
              className="flex flex-col items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + i * 0.08 }}
            >
              <div
                className="w-10 h-10 rounded-xl border border-white/[0.08] shadow-sm"
                style={{
                  backgroundColor: shade.hex,
                  boxShadow: `0 2px 8px ${shade.hex}33`,
                }}
              />
              <span className="text-[9px] font-mono font-medium text-[#A1A1AA]">{shade.code}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Mix ratio visual */}
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#71717A]">Mix Ratio</span>
          <MixRatioDiagram ratio={mixRatio} />
        </motion.div>

        {/* Developer + Processing row */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#71717A]">Developer</span>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L8.5 5.5L12 7L8.5 8.5L7 13L5.5 8.5L2 7L5.5 5.5L7 1Z" fill="#9333EA" />
              </svg>
              <span className="text-sm font-semibold text-[#F5F5F7]">{developer}</span>
              <span className="text-[11px] text-[#A1A1AA]">{developerVolume}</span>
            </div>
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#71717A]">Processing</span>
            <ProcessingTimer time={processingTime} />
          </div>
        </motion.div>

        {/* Confidence breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <ConfidenceBreakdown
            overall={confidence}
            scores={confidenceScores || [
              { label: 'Warmth accuracy', value: Math.min(confidence + 3, 100), color: '#9333EA' },
              { label: 'Coverage', value: Math.min(confidence - 2, 100), color: '#F59E0B' },
              { label: 'Damage risk', value: Math.min(confidence + 5, 100), color: '#A78BFA' },
              { label: 'Lift accuracy', value: Math.min(confidence - 1, 100), color: '#10B981' },
            ]}
          />
        </motion.div>

        {/* Notes */}
        {notes && (
          <motion.p
            className="text-[11px] text-[#71717A] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {notes}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}