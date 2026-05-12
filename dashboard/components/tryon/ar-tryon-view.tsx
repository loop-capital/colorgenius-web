'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShadeDefinition } from '@/lib/tryon/shade-library'
import { segmentByColor, smoothMask, createMaskCanvas, type SegmentationMode } from '@/lib/tryon/hair-segmentation'
import { processImageData, applyRootShadow, createVerticalGradient } from '@/lib/tryon/color-engine'

interface ARTryOnViewProps {
  shade: ShadeDefinition | null
  blendMode: 'natural' | 'vibrant' | 'subtle' | 'fashion'
  segmentationMode: SegmentationMode
  rootShadow: boolean
  intensity: number
  className?: string
}

export function ARTryOnView({ shade, blendMode, segmentationMode, rootShadow, intensity, className }: ARTryOnViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [segmentationResult, setSegmentationResult] = useState<ReturnType<typeof segmentByColor> | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
      }
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied')
      setCameraActive(false)
    }
  }, [facingMode])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    cancelAnimationFrame(animFrameRef.current)
  }, [])

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (cameraActive) stopCamera()
    else startCamera()
  }, [cameraActive, startCamera, stopCamera])

  // Switch facing mode
  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode(m => m === 'user' ? 'environment' : 'user')
  }, [stopCamera])

  // Re-start camera when facing mode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera()
    }
  }, [facingMode])

  // Process video frames for color application
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let frameCount = 0
    const PROCESS_EVERY_N_FRAMES = 4 // Process every 4th frame for performance
    let lastMask: Uint8Array | null = null

    const processFrame = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animFrameRef.current = requestAnimationFrame(processFrame)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      frameCount++
      if (frameCount % PROCESS_EVERY_N_FRAMES === 0 && shade) {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Segment hair
        const segResult = segmentByColor(imageData, segmentationMode)
        lastMask = smoothMask(segResult.mask, canvas.width, canvas.height, 2)

        // Apply color
        const shadeToApply = rootShadow ? applyRootShadow(shade) : shade
        processImageData(imageData, lastMask, shadeToApply, {
          blendMode,
          intensity,
        })

        ctx.putImageData(imageData, 0, 0)

        // Draw segmentation overlay if we have the overlay canvas
        if (overlayCanvasRef.current) {
          const overlayCtx = overlayCanvasRef.current.getContext('2d')
          if (overlayCtx) {
            overlayCanvasRef.current.width = canvas.width
            overlayCanvasRef.current.height = canvas.height
            const maskCanvas = createMaskCanvas(lastMask, canvas.width, canvas.height)
            overlayCtx.clearRect(0, 0, canvas.width, canvas.height)
            overlayCtx.drawImage(maskCanvas, 0, 0)
          }
        }
      } else if (shade && lastMask) {
        // Re-use last mask for intermediate frames
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const shadeToApply = rootShadow ? applyRootShadow(shade) : shade
        processImageData(imageData, lastMask, shadeToApply, {
          blendMode,
          intensity,
        })
        ctx.putImageData(imageData, 0, 0)
      }

      animFrameRef.current = requestAnimationFrame(processFrame)
    }

    animFrameRef.current = requestAnimationFrame(processFrame)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [cameraActive, shade, blendMode, segmentationMode, rootShadow, intensity])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#0F0F1A] ${className || ''}`}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
      />

      {/* Segmentation overlay (debug) */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 hover:opacity-60 transition-opacity"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined, mixBlendMode: 'screen' }}
      />

      {/* Camera inactive state */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0F0F1A]">
          {cameraError ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M1 1l22 22M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-red-400">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-[#9333EA] text-[#0A0A0F] text-sm font-semibold hover:bg-[#EC4899] transition-colors"
              >
                Retry Camera
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-white/[0.04] border-2 border-dashed border-white/[0.1] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-[#A1A1AA]">Camera preview will appear here</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 rounded-xl bg-[#9333EA] text-[#0A0A0F] text-sm font-bold hover:bg-[#EC4899] transition-colors shadow-lg shadow-[#9333EA]/20"
              >
                Start Camera
              </button>
            </>
          )}
        </div>
      )}

      {/* Camera controls overlay */}
      {cameraActive && (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={switchCamera}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-colors"
            title="Switch camera"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={stopCamera}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-red-500/50 transition-colors"
            title="Stop camera"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" fill="white" />
            </svg>
          </button>
        </div>
      )}

      {/* Active shade indicator */}
      {shade && cameraActive && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md"
        >
          <div
            className="w-6 h-6 rounded-full border border-white/10"
            style={{
              background: `radial-gradient(circle at 35% 35%, rgb(${shade.rgb.join(',')}), rgb(${Math.max(0,shade.rgb[0]-40)},${Math.max(0,shade.rgb[1]-40)},${Math.max(0,shade.rgb[2]-40)}))`,
            }}
          />
          <div>
            <p className="text-[11px] font-semibold text-white">{shade.code}</p>
            <p className="text-[9px] text-white/50">{shade.name}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
