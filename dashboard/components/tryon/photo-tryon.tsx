'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { ShadeDefinition } from '@/lib/tryon/shade-library'
import { segmentByColor, smoothMask, type SegmentationMode } from '@/lib/tryon/hair-segmentation'
import { processImageData, applyRootShadow } from '@/lib/tryon/color-engine'

interface PhotoTryOnProps {
  shade: ShadeDefinition | null
  blendMode: 'natural' | 'vibrant' | 'subtle' | 'fashion'
  segmentationMode: SegmentationMode
  rootShadow: boolean
  intensity: number
  onPhotoUploaded?: (url: string) => void
  className?: string
}

export function PhotoTryOn({ shade, blendMode, segmentationMode, rootShadow, intensity, onPhotoUploaded, className }: PhotoTryOnProps) {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setOriginalImage(img)
      setOriginalUrl(url)
      onPhotoUploaded?.(url)
    }
    img.src = url
  }, [onPhotoUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Process image when shade changes
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return
    if (!shade) {
      setProcessedUrl(null)
      return
    }

    setIsProcessing(true)

    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      
      // Scale image to max 640px wide for performance
      const maxDim = 640
      const scale = Math.min(1, maxDim / Math.max(originalImage.width, originalImage.height))
      canvas.width = originalImage.width * scale
      canvas.height = originalImage.height * scale
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Segment hair
      const segResult = segmentByColor(imageData, segmentationMode)
      const mask = smoothMask(segResult.mask, canvas.width, canvas.height, 3)

      // Apply color
      const shadeToApply = rootShadow ? applyRootShadow(shade) : shade
      processImageData(imageData, mask, shadeToApply, { blendMode, intensity })

      ctx.putImageData(imageData, 0, 0)
      setProcessedUrl(canvas.toDataURL('image/jpeg', 0.9))
      setIsProcessing(false)
    })
  }, [originalImage, shade, blendMode, segmentationMode, rootShadow, intensity])

  // Slider interaction
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    setSliderPos(Math.max(5, Math.min(95, (x / rect.width) * 100)))
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => handleSliderMove(e.clientX)
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [isDragging, handleSliderMove])

  if (!originalUrl) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-[#0F0F1A] border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#9333EA]/30 transition-colors ${className || ''}`}
        style={{ aspectRatio: '3/4' }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#A1A1AA]">Drop a photo or click to upload</p>
          <p className="text-[11px] text-[#71717A] mt-1">JPG, PNG — best results with face-forward shots</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#0F0F1A] ${className || ''}`}>
      <canvas ref={canvasRef} className="hidden" />

      <div
        ref={containerRef}
        className="relative w-full cursor-col-resize select-none"
        style={{ aspectRatio: '3/4' }}
        onMouseDown={() => setIsDragging(true)}
        onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* After (processed) */}
        {processedUrl && (
          <div className="absolute inset-0">
            <img src={processedUrl} alt="After" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md">
              <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#9333EA]">After</span>
            </div>
          </div>
        )}

        {/* Before (original) — clipped */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img src={originalUrl} alt="Before" className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md">
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#F59E0B]">Before</span>
          </div>
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#9333EA]/50 to-[#F59E0B]/50 z-10"
          style={{ left: `${sliderPos}%` }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 border-2 border-[#9333EA]/50 flex items-center justify-center z-20 shadow-lg shadow-black/30"
          style={{ left: `${sliderPos}%` }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#9333EA] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#9333EA]">Applying color...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
        >
          Change photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button
          onClick={() => {
            setOriginalImage(null)
            setOriginalUrl(null)
            setProcessedUrl(null)
          }}
          className="text-xs text-[#EF4444] hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
