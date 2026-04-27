'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToneOption {
  value: string
  label: string
  color: string
  gradient?: string
}

interface ColorWheel3DProps {
  tones: ToneOption[]
  selected: string
  onSelect: (value: string) => void
  className?: string
}

export function ColorWheel3D({ tones, selected, onSelect, className }: ColorWheel3DProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const radius = 100
  const center = 120

  // Position tones around the circle
  const positioned = tones.map((tone, i) => {
    const angle = (i / tones.length) * Math.PI * 2 - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { ...tone, x, y, angle }
  })

  const selectedTone = positioned.find((t) => t.value === selected)

  return (
    <div className={`relative ${className || ''}`} style={{ width: 240, height: 240 }}>
      <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0">
        {/* Outer ring gradient */}
        <defs>
          <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="25%" stopColor="#B87333" />
            <stop offset="50%" stopColor="#A03030" />
            <stop offset="75%" stopColor="#7B68A6" />
            <stop offset="100%" stopColor="#8A7D6E" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle cx={center} cy={center} r={radius + 16} fill="none" stroke="url(#wheelGrad)" strokeWidth="2" opacity="0.15" />

        {/* Connection lines from center to tones */}
        {positioned.map((tone) => (
          <motion.line
            key={tone.value}
            x1={center}
            y1={center}
            x2={tone.x}
            y2={tone.y}
            stroke={tone.color}
            strokeWidth={tone.value === selected ? 2 : 0.5}
            opacity={tone.value === selected ? 0.4 : 0.08}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.05 * positioned.indexOf(tone) }}
          />
        ))}

        {/* Tone nodes */}
        {positioned.map((tone) => {
          const isSelected = tone.value === selected
          const isHovered = tone.value === hovered

          return (
            <g key={tone.value}>
              {/* Glow ring for selected */}
              {isSelected && (
                <motion.circle
                  cx={tone.x}
                  cy={tone.y}
                  r={20}
                  fill="none"
                  stroke={tone.color}
                  strokeWidth="2"
                  initial={{ r: 14, opacity: 0 }}
                  animate={{ r: 20, opacity: 0.4 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'easeInOut' }}
                />
              )}

              {/* Color circle */}
              <motion.circle
                cx={tone.x}
                cy={tone.y}
                r={isSelected ? 14 : isHovered ? 12 : 10}
                fill={tone.gradient || tone.color}
                stroke={isSelected ? tone.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isSelected ? 2.5 : 1}
                className="cursor-pointer"
                onHoverStart={() => setHovered(tone.value)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => onSelect(tone.value)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.03 * positioned.indexOf(tone) }}
                style={{ filter: isSelected ? `drop-shadow(0 0 8px ${tone.color})` : 'none' }}
              />

              {/* Label */}
              <motion.text
                x={tone.x}
                y={tone.y + 28}
                textAnchor="middle"
                fill={isSelected ? '#F5F5F7' : '#71717A'}
                fontSize="9"
                fontWeight={isSelected ? 600 : 500}
                fontFamily="system-ui"
                letterSpacing="0.05em"
                className="pointer-events-none select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + 0.03 * positioned.indexOf(tone) }}
              >
                {tone.label}
              </motion.text>
            </g>
          )
        })}

        {/* Center indicator */}
        {selectedTone && (
          <motion.circle
            cx={center}
            cy={center}
            r={8}
            fill={selectedTone.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ filter: `drop-shadow(0 0 12px ${selectedTone.color})` }}
          />
        )}
      </svg>

      {/* Selected tone display below wheel */}
      <AnimatePresence mode="wait">
        {selectedTone && (
          <motion.div
            key={selectedTone.value}
            className="text-center mt-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTone.color }} />
              <span className="text-sm font-semibold text-[#F5F5F7]">{selectedTone.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}