'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export interface ColorData {
  hex: string
  label: string
  saturation: number // 0-100
  uniformity: number // 0-100
}

interface ColorSpectrumBarProps {
  dominant: ColorData
  secondary?: ColorData
  className?: string
}

export function ColorSpectrumBar({ dominant, secondary, className }: ColorSpectrumBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredColor, setHoveredColor] = useState<ColorData | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Dominant color bar
    const domGrad = ctx.createLinearGradient(0, 0, w * 0.9, 0)
    domGrad.addColorStop(0, dominant.hex)
    domGrad.addColorStop(1, adjustBrightness(dominant.hex, 20))
    ctx.fillStyle = domGrad
    roundRect(ctx, 0, 0, w * 0.9, h * 0.6, 6)
    ctx.fill()

    // Saturation overlay
    const satGrad = ctx.createLinearGradient(0, 0, w * (dominant.saturation / 100) * 0.9, 0)
    satGrad.addColorStop(0, 'rgba(255,255,255,0.12)')
    satGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = satGrad
    roundRect(ctx, 0, 0, w * 0.9, h * 0.6, 6)
    ctx.fill()

    // Secondary color bar
    if (secondary) {
      const secGrad = ctx.createLinearGradient(0, 0, w * 0.6, 0)
      secGrad.addColorStop(0, secondary.hex)
      secGrad.addColorStop(1, adjustBrightness(secondary.hex, 15))
      ctx.fillStyle = secGrad
      roundRect(ctx, 0, h * 0.7, w * 0.6, h * 0.3, 4)
      ctx.fill()
    }
  }, [dominant, secondary])

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {/* Canvas spectrum */}
      <div
        className="relative w-full"
        onMouseEnter={() => setHoveredColor(dominant)}
        onMouseLeave={() => setHoveredColor(null)}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={48}
          className="w-full h-12 rounded-xl"
        />

        {/* Hover tooltip */}
        {hoveredColor && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-[#1E1E2D]/90 backdrop-blur-md border border-white/[0.06] pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: hoveredColor.hex }} />
              <span className="text-[11px] font-mono font-medium text-[#F5F5F7]">{hoveredColor.hex}</span>
              <span className="text-[10px] text-[#A1A1AA]">{hoveredColor.label}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border border-white/[0.08]" style={{ backgroundColor: dominant.hex }} />
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Dominant</span>
        </div>
        {secondary && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md border border-white/[0.08]" style={{ backgroundColor: secondary.hex }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Secondary</span>
          </div>
        )}
      </div>

      {/* Saturation + Uniformity bars */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#71717A]">Saturation</span>
            <span className="text-[10px] font-semibold text-[#F5F5F7] tabular-nums">{dominant.saturation}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF]"
              initial={{ width: 0 }}
              animate={{ width: `${dominant.saturation}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#71717A]">Uniformity</span>
            <span className="text-[10px] font-semibold text-[#F5F5F7] tabular-nums">{dominant.uniformity}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
              initial={{ width: 0 }}
              animate={{ width: `${dominant.uniformity}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helpers
function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}