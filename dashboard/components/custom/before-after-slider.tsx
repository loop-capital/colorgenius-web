'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeImage?: string
  afterImage?: string
  beforeLabel?: string
  afterLabel?: string
  autoSweep?: boolean
  className?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  autoSweep = true,
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasSweeped, setHasSweeped] = useState(false)

  // Auto-sweep on load
  useEffect(() => {
    if (!autoSweep || hasSweeped || !beforeImage || !afterImage) return
    let raf: number
    const start = performance.now()
    const duration = 1200

    const animate = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      setSliderPos(50 + eased * 35)
      if (t < 1) raf = requestAnimationFrame(animate)
      else setHasSweeped(true)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [autoSweep, hasSweeped, beforeImage, afterImage])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const pct = Math.max(4, Math.min(96, (x / rect.width) * 100))
      setSliderPos(pct)
    },
    []
  )

  const handleMouseDown = useCallback(() => setIsDragging(true), [])
  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => handleMove(e.clientX)
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, handleMove])

  // Touch support
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX)
    },
    [handleMove]
  )

  if (!beforeImage || !afterImage) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: 200,
          background: '#0F0F1A',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#71717A', fontSize: 12, fontWeight: 500 }}>Upload a photo to see before/after</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: 280,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* After image (full) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${afterImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '4px 10px',
          }}
        >
          <p style={{ color: '#14B8A6', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {afterLabel}
          </p>
        </div>
      </div>

      {/* Before image (clipped) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          backgroundImage: `url(${beforeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '4px 10px',
          }}
        >
          <p style={{ color: '#F59E0B', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {beforeLabel}
          </p>
        </div>
      </div>

      {/* Divider line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: 2,
          background: 'linear-gradient(180deg, rgba(20,184,166,0.3), rgba(245,158,11,0.3))',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      />

      {/* Slider handle */}
      <motion.div
        animate={{ scale: isDragging ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPos}%`,
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(10,10,15,0.9)',
          border: '2px solid rgba(20,184,166,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          boxShadow: '0 0 20px rgba(20,184,166,0.2)',
        }}
      >
        <ChevronLeft className="w-3 h-3" style={{ color: '#14B8A6' }} />
        <ChevronRight className="w-3 h-3" style={{ color: '#F59E0B' }} />
      </motion.div>
    </div>
  )
}
