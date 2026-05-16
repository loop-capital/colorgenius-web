'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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
  const center = 130

  // Position tones around the circle
  const positioned = tones.map((tone, i) => {
    const angle = (i / tones.length) * Math.PI * 2 - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { ...tone, x, y, angle }
  })

  const selectedTone = positioned.find((t) => t.value === selected)

  return (
    <div className={`relative ${className || ''}`} style={{ width: 260, height: 280 }}>
      <svg width="260" height="280" viewBox="0 0 260 280" className="absolute inset-0">
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
          <g key={`line-${tone.value}`}>
            <line
              x1={center}
              y1={center}
              x2={tone.x}
              y2={tone.y}
              stroke={tone.color}
              strokeWidth={0.5}
              opacity={0.08}
            />
            {tone.value === selected && (
              <line
                x1={center}
                y1={center}
                x2={tone.x}
                y2={tone.y}
                stroke={tone.color}
                strokeWidth={2}
                opacity={0.4}
              />
            )}
          </g>
        ))}

        {/* Tone nodes */}
        {positioned.map((tone, i) => {
          const isSelected = tone.value === selected
          const isHovered = tone.value === hovered

          return (
            <g key={tone.value}>
              {/* Glow ring for selected */}
              {isSelected && (
                <circle
                  cx={tone.x}
                  cy={tone.y}
                  r={20}
                  fill="none"
                  stroke={tone.color}
                  strokeWidth="2"
                  opacity={0.4}
                >
                  <animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Animated color circle (visual only — no pointer events) */}
              <motion.circle
                cx={tone.x}
                cy={tone.y}
                r={isSelected ? 14 : isHovered ? 12 : 10}
                fill={tone.gradient || tone.color}
                stroke={isSelected ? tone.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isSelected ? 2.5 : 1}
                className="pointer-events-none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.03 * i }}
                style={{ filter: isSelected ? `drop-shadow(0 0 8px ${tone.color})` : 'none' }}
              />

              {/* Invisible hit target (clickable — plain SVG, not framer-motion) */}
              <circle
                cx={tone.x}
                cy={tone.y}
                r={20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(tone.value)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(tone.value)}
              />

              {/* Label */}
              <text
                x={tone.x}
                y={tone.y + 28}
                textAnchor="middle"
                fill={isSelected ? '#F5F5F7' : '#71717A'}
                fontSize="9"
                fontWeight={isSelected ? 600 : 500}
                fontFamily="system-ui"
                letterSpacing="0.05em"
                className="pointer-events-none select-none"
              >
                {tone.label}
              </text>
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
    </div>
  )
}