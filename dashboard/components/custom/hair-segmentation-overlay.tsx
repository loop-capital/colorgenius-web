'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScanRegion {
  id: string
  label: string
  color: string
  path: string // SVG path
}

interface HairSegmentationOverlayProps {
  photoUrl?: string
  isScanning: boolean
  onScanComplete?: () => void
  className?: string
}

const HAIR_ZONES: ScanRegion[] = [
  {
    id: 'roots',
    label: 'Roots',
    color: '#F59E0B',
    path: 'M128,20 C80,20 40,60 35,100 L35,120 L221,120 L221,100 C216,60 176,20 128,20 Z',
  },
  {
    id: 'midlengths',
    label: 'Mid-lengths',
    color: '#14B8A6',
    path: 'M35,120 L30,180 L226,180 L221,120 Z',
  },
  {
    id: 'ends',
    label: 'Ends',
    color: '#A78BFA',
    path: 'M30,180 L25,240 L231,240 L226,180 Z',
  },
]

export function HairSegmentationOverlay({
  photoUrl,
  isScanning,
  onScanComplete,
  className,
}: HairSegmentationOverlayProps) {
  const [scanProgress, setScanProgress] = useState(0)
  const [showZones, setShowZones] = useState(false)
  const [visibleZones, setVisibleZones] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!isScanning) {
      setShowZones(true)
      return
    }

    setScanProgress(0)
    setShowZones(false)
    setVisibleZones([])

    let start: number | null = null
    const duration = 2000

    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      setScanProgress(progress)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setShowZones(true)
        onScanComplete?.()
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isScanning, onScanComplete])

  useEffect(() => {
    if (!showZones) return

    const delays = [0, 200, 400]
    HAIR_ZONES.forEach((zone, i) => {
      setTimeout(() => {
        setVisibleZones((prev) => [...prev, zone.id])
      }, delays[i])
    })
  }, [showZones])

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#0F0F1A] ${className || ''}`}>
      {/* Photo */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Hair analysis"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
          <div className="w-48 h-64 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C18 4 10 12 10 22C10 32 16 38 24 38C32 38 38 32 38 22C38 12 30 4 24 4Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <path d="M16 22H20M28 22H32M24 18V26" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-white/30">
              Position hair within frame
            </span>
          </div>
        </div>
      )}

      {/* Scanning animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                top: `${scanProgress * 100}%`,
                background: 'linear-gradient(90deg, transparent, #14B8A6, #2DD4BF, #14B8A6, transparent)',
                boxShadow: '0 0 20px rgba(20,184,166,0.5), 0 0 60px rgba(20,184,166,0.2)',
              }}
            />
            {/* Grid overlay fading out */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Progress text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#14B8A6]">
                Analyzing {Math.round(scanProgress * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hair zone overlays */}
      {showZones && (
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 256 260">
          {HAIR_ZONES.map((zone) => (
            <motion.g key={zone.id}>
              <motion.path
                d={zone.path}
                fill={zone.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: visibleZones.includes(zone.id) ? 0.18 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.path
                d={zone.path}
                fill="none"
                stroke={zone.color}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                initial={{ opacity: 0 }}
                animate={{ opacity: visibleZones.includes(zone.id) ? 0.6 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.g>
          ))}
        </svg>
      )}

      {/* Zone labels */}
      {showZones && (
        <div className="absolute left-4 top-0 bottom-0 z-10 flex flex-col justify-around py-8 pointer-events-none">
          {HAIR_ZONES.map((zone) => (
            <motion.div
              key={zone.id}
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={visibleZones.includes(zone.id) ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {zone.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}