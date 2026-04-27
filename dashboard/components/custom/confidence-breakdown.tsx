'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SubScore {
  label: string
  value: number // 0-100
  color: string
}

interface ConfidenceBreakdownProps {
  overall: number // 0-5
  scores: SubScore[]
  className?: string
}

function StarRating({ value, size = 24 }: { value: number; size?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(value))
  return (
    <div className="flex items-center gap-1">
      {stars.map((filled, i) => (
        <motion.svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={filled ? '#F59E0B' : 'rgba(255,255,255,0.08)'}
            stroke={filled ? '#FBBF24' : 'rgba(255,255,255,0.12)'}
            strokeWidth={1}
          />
        </motion.svg>
      ))}
    </div>
  )
}

function ScoreBar({ label, value, color, delay }: SubScore & { delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">{label}</span>
        <span className="text-[11px] font-semibold text-[#F5F5F7] tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  )
}

export function ConfidenceBreakdown({ overall, scores, className }: ConfidenceBreakdownProps) {
  const starValue = Math.round((overall / 100) * 5 * 10) / 10

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        <StarRating value={starValue} size={20} />
        <span className="text-sm font-semibold text-[#F5F5F7]">{starValue}/5</span>
      </div>
      <div className="space-y-3">
        {scores.map((score, i) => (
          <ScoreBar key={score.label} {...score} delay={0.3 + i * 0.15} />
        ))}
      </div>
    </div>
  )
}