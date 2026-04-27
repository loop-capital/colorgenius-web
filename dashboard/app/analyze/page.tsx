'use client'

import { useState, useRef, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { analyzeHairPhoto, HairAnalysisResult } from '@/lib/photo-analysis'
import { HairSegmentationOverlay } from '@/components/custom'
import { ColorSpectrumBar } from '@/components/custom'
import { BeforeAfterSlider } from '@/components/custom'
import { GlassCard } from '@/components/custom'
import {
  Upload, Trash2, ScanLine, AlertCircle, CheckCircle2, Info,
  Sparkles, Droplets, Shield, Camera, Zap, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* Custom inline components — no shadcn */

function ActionButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'danger'
  disabled?: boolean
  className?: string
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const styles = {
    primary: 'text-[#0A0A0A] hover:opacity-90 active:scale-[0.98]',
    outline: 'bg-transparent border hover:text-[#F5F5F7] active:scale-[0.98]',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 active:scale-[0.98]',
  }
  const bg = variant === 'primary'
    ? { background: 'var(--cg-gradient-teal)' }
    : variant === 'outline'
      ? { borderColor: 'rgba(255,255,255,0.12)', color: 'var(--cg-text-secondary)' }
      : {}

  return (
    <motion.button
      className={cn(base, styles[variant], className)}
      style={bg}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

function StatusPill({
  label,
  color,
  glow = false,
}: {
  label: string
  color: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        glow && 'shadow-sm'
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
        boxShadow: glow ? `0 0 12px ${color}30` : undefined,
      }}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', glow && 'animate-pulse')}
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  )
}

function SectionHeader({ icon, title, confidence }: { icon: React.ReactNode; title: string; confidence?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>{title}</h3>
      </div>
      {confidence !== undefined && (
        <div
          className="px-2.5 py-1 rounded-full text-xs font-semibold border"
          style={{
            color: confidence >= 90 ? '#14B8A6' : '#F59E0B',
            borderColor: confidence >= 90 ? 'rgba(20,184,166,0.3)' : 'rgba(245,158,11,0.3)',
            backgroundColor: confidence >= 90 ? 'rgba(20,184,166,0.08)' : 'rgba(245,158,11,0.08)',
          }}
        >
          {confidence}%
        </div>
      )}
    </div>
  )
}

export default function AnalyzePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<HairAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please upload an image file (JPEG, PNG, WebP)', variant: 'destructive' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Maximum file size is 10MB', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string)
      setAnalysisResult(null)
      setShowBeforeAfter(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageChange(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageChange(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleAnalyze = async () => {
    if (!imageUrl) return
    setIsAnalyzing(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      const result = await new Promise<HairAnalysisResult>((resolve, reject) => {
        img.onload = () => {
          analyzeHairPhoto(img).then(resolve).catch((err) => reject(new Error(err.message || 'Analysis failed')))
        }
        img.onerror = () => reject(new Error('Failed to load image for analysis'))
        img.src = imageUrl
      })
      setAnalysisResult(result)
      toast({
        title: 'Analysis Complete',
        description: `Detected Level ${result.currentLevel} — ${result.currentLevelName} (${result.currentTone})`,
      })
    } catch (error) {
      toast({ title: 'Analysis Error', description: error instanceof Error ? error.message : 'Failed to analyze image', variant: 'destructive' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleReset = () => {
    setImageUrl(null)
    setAnalysisResult(null)
    setShowBeforeAfter(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-[#10B981]'
      case 'good': return 'bg-[#10B981]'
      case 'fair': return 'bg-[#F59E0B]'
      case 'damaged': return 'bg-orange-500'
      case 'severely_damaged': return 'bg-[#EF4444]'
      default: return 'bg-gray-500'
    }
  }

  const getConditionTextColor = (condition: string) => {
    switch (condition) {
      case 'excellent': case 'good': return '#10B981'
      case 'fair': return '#F59E0B'
      case 'damaged': return '#FB923C'
      case 'severely_damaged': return '#EF4444'
      default: return '#A1A1AA'
    }
  }

  const getPorosityColor = (p: string) => {
    switch (p) {
      case 'low': return '#14B8A6'
      case 'medium': return '#F59E0B'
      case 'high': return '#EF4444'
      default: return '#A1A1AA'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            Photo <span className="gradient-text-teal">Analysis</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
            AI-powered hair color, condition &amp; gray assessment
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="h-fit p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-4 w-4 text-[#14B8A6]" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
                  Upload Client Photo
                </h3>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

              {!imageUrl ? (
                <motion.div
                  onClick={handleUploadClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                    dragOver
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]'
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(20,184,166,0.1)' }}>
                    <Upload className="h-6 w-6 text-[#14B8A6]" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--cg-text-primary)' }}>
                    Drag &amp; drop or click to upload
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>JPEG, PNG, WebP — up to 10MB</p>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                    For best results, use a front-facing photo in natural light
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* HairSegmentationOverlay wraps the photo + scanning */}
                  <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={imageUrl} alt="Client photo" className="w-full h-auto max-h-[400px] object-contain" />

                    {/* Hair segmentation overlay */}
                    <div className="absolute inset-0 z-10">
                      <HairSegmentationOverlay
                        photoUrl={imageUrl}
                        isScanning={isAnalyzing}
                        onScanComplete={() => {}}
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>

                    {/* Close button */}
                    <ActionButton
                      variant="danger"
                      className="absolute top-2 right-2 z-20 !p-2 !rounded-lg"
                      onClick={handleReset}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </ActionButton>
                  </div>

                  {!analysisResult && !isAnalyzing && (
                    <ActionButton onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Analyze Photo
                    </ActionButton>
                  )}

                  {analysisResult && (
                    <div className="flex gap-2">
                      <ActionButton variant="outline" className="flex-1" onClick={handleAnalyze} disabled={isAnalyzing}>
                        <ScanLine className="h-4 w-4 mr-2" />
                        Re-analyze
                      </ActionButton>
                      <ActionButton
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {showBeforeAfter ? 'Hide Preview' : 'Before/After'}
                      </ActionButton>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Before/After slider */}
            <AnimatePresence>
              {showBeforeAfter && imageUrl && analysisResult && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard className="p-5">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--cg-text-primary)' }}>
                      Before &amp; After
                    </h3>
                    <BeforeAfterSlider
                      beforeImage={imageUrl}
                      afterImage={imageUrl}
                      beforeLabel="Current"
                      afterLabel="Suggested"
                    />
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!analysisResult ? (
              <GlassCard className="py-16 text-center">
                <Info className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--cg-text-tertiary)' }} />
                <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--cg-text-primary)' }}>
                  No Analysis Yet
                </h3>
                <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                  Upload a photo and click &quot;Analyze Photo&quot; to begin
                </p>
              </GlassCard>
            ) : (
              <>
                {/* Hair Characteristics */}
                <GlassCard className="p-5">
                  <SectionHeader
                    icon={<Sparkles className="h-4 w-4 text-[#14B8A6]" />}
                    title="Hair Characteristics"
                    confidence={Math.round(analysisResult.confidence * 100)}
                  />

                  {/* Level */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Natural Level</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/[0.08]"
                        style={{ backgroundColor: analysisResult.dominantHex }}
                      />
                      <span className="font-bold text-sm" style={{ color: 'var(--cg-text-primary)' }}>
                        {analysisResult.currentLevel}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                        — {analysisResult.currentLevelName}
                      </span>
                    </div>
                  </div>

                  {/* Tone */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Underlying Tone</span>
                    <div
                      className="px-2.5 py-1 rounded-full text-xs font-medium border capitalize"
                      style={{
                        color: 'var(--cg-text-primary)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        background: 'var(--cg-surface)',
                      }}
                    >
                      {analysisResult.toneName}
                    </div>
                  </div>

                  {/* Warmth spectrum */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
                      <span>Cool</span>
                      <span>Neutral</span>
                      <span>Warm</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'linear-gradient(to right, #60A5FA, #9CA3AF, #F59E0B)' }}>
                      <div
                        className="absolute top-0 w-3 h-3 bg-white border-2 border-[#0F0F1A] rounded-full shadow-md"
                        style={{
                          left: `${Math.max(0, Math.min(100, (analysisResult.warmthRatio + 1) * 50))}%`,
                          transform: 'translateX(-50%) translateY(-2px)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Gray */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Gray Percentage</span>
                      <span className="font-semibold text-sm" style={{ color: 'var(--cg-text-primary)' }}>
                        {analysisResult.grayPercent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(to right, #737373, #A3A3A3)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResult.grayPercent}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Hair Condition</span>
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                        style={{
                          color: getConditionTextColor(analysisResult.condition),
                          borderColor: `${getConditionTextColor(analysisResult.condition)}30`,
                          backgroundColor: `${getConditionTextColor(analysisResult.condition)}15`,
                        }}
                      >
                        {analysisResult.condition.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
                        <span>Severely Damaged</span>
                        <span>Excellent</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)' }}>
                        <div
                          className="absolute top-0 w-3 h-3 bg-white border-2 border-[#0F0F1A] rounded-full shadow-md"
                          style={{
                            left: `${analysisResult.conditionScore}%`,
                            transform: 'translateX(-50%) translateY(-2px)',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-right" style={{ color: 'var(--cg-text-tertiary)' }}>
                        Score: {analysisResult.conditionScore}/100
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Color Spectrum Bar */}
                <GlassCard className="p-5">
                  <SectionHeader
                    icon={<Droplets className="h-4 w-4 text-[#14B8A6]" />}
                    title="Color Extraction"
                  />
                  <ColorSpectrumBar
                    dominant={{
                      hex: analysisResult.dominantHex,
                      label: 'Dominant',
                      saturation: Math.round(analysisResult.saturation * 100),
                      uniformity: Math.round(analysisResult.rawMetrics.uniformity * 100),
                    }}
                    secondary={analysisResult.secondaryHex ? {
                      hex: analysisResult.secondaryHex,
                      label: 'Secondary',
                      saturation: Math.round(analysisResult.saturation * 80),
                      uniformity: Math.round(analysisResult.rawMetrics.uniformity * 90),
                    } : undefined}
                  />
                </GlassCard>

                {/* Damage Assessment */}
                <GlassCard className="p-5">
                  <SectionHeader
                    icon={<Shield className="h-4 w-4 text-[#F59E0B]" />}
                    title="Damage Assessment"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Porosity', value: analysisResult.damageIndicators.porosityEstimate, color: getPorosityColor(analysisResult.damageIndicators.porosityEstimate) },
                      { label: 'Texture', value: analysisResult.damageIndicators.texture, color: 'var(--cg-text-primary)' },
                      { label: 'Shine Score', value: `${analysisResult.damageIndicators.shineScore}/100`, color: analysisResult.damageIndicators.shineScore > 70 ? '#10B981' : '#F59E0B' },
                      { label: 'Dryness', value: `${analysisResult.damageIndicators.drynessScore}/100`, color: analysisResult.damageIndicators.drynessScore > 60 ? '#EF4444' : 'var(--cg-text-primary)' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--cg-text-tertiary)' }}>
                          {item.label}
                        </span>
                        <p className="font-semibold text-sm capitalize" style={{ color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {analysisResult.damageIndicators.splitEndDetected && (
                    <motion.div
                      className="mt-4 flex items-center gap-2 text-sm p-3 rounded-lg border"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#FB923C',
                        backgroundColor: 'rgba(251,146,60,0.08)',
                        borderColor: 'rgba(251,146,60,0.2)',
                      }}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Split ends detected — recommend trim before color service
                    </motion.div>
                  )}
                </GlassCard>

                {/* Recommendations */}
                <GlassCard className="p-5">
                  <SectionHeader
                    icon={<Sparkles className="h-4 w-4 text-[#14B8A6]" />}
                    title="Recommendations"
                  />
                  <ul className="space-y-2.5">
                    {analysisResult.recommendations.map((rec, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: 'var(--cg-text-secondary)' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#14B8A6]" />
                        <span>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </GlassCard>

                {/* Technical details */}
                <div
                  className="rounded-xl border border-dashed p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--cg-surface)' }}
                >
                  <details className="text-sm">
                    <summary
                      className="cursor-pointer font-medium text-xs uppercase tracking-wider transition-colors"
                      style={{ color: 'var(--cg-text-tertiary)' }}
                    >
                      Technical Details
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                      <span>Face Detected:</span>
                      <span className={analysisResult.faceDetected ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                        {analysisResult.faceDetected ? 'Yes' : 'No'}
                      </span>
                      <span>Hair Region:</span>
                      <span className={analysisResult.hairRegionFound ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                        {analysisResult.hairRegionFound ? 'Found' : 'Fallback'}
                      </span>
                      <span>Sample Pixels:</span>
                      <span style={{ color: 'var(--cg-text-secondary)' }}>{analysisResult.rawMetrics.sampleSize.toLocaleString()}</span>
                      <span>Avg Brightness:</span>
                      <span style={{ color: 'var(--cg-text-secondary)' }}>{analysisResult.rawMetrics.avgBrightness}</span>
                      <span>Uniformity:</span>
                      <span style={{ color: 'var(--cg-text-secondary)' }}>{(analysisResult.rawMetrics.uniformity * 100).toFixed(0)}%</span>
                    </div>
                  </details>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
