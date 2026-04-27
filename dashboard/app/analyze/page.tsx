'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhotoOverlay } from '@/components/ui/photo-overlay'
import { ConfidenceBadge } from '@/components/ui/confidence-badge'
import { useToast } from '@/components/ui/use-toast'
import { analyzeHairPhoto, HairAnalysisResult } from '@/lib/photo-analysis'
import {
  Upload, Trash2, ScanLine, AlertCircle, CheckCircle2, Info,
  Sparkles, Droplets, Gauge, Palette, Shield, Camera, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
      case 'excellent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'good': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'fair': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      case 'damaged': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'severely_damaged': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getPorosityColor = (p: string) => {
    switch (p) {
      case 'low': return 'text-emerald-400'
      case 'medium': return 'text-[#F59E0B]'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Photo Analysis</h1>
          <p className="text-sm text-[#A3A3A3] mt-1">AI-powered hair color, condition &amp; gray assessment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-[#171717] border-[#2A2A2A] h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#F5F5F5]">
                <Camera className="h-4 w-4 text-[#14B8A6]" />
                Upload Client Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

              {!imageUrl ? (
                <div
                  onClick={handleUploadClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                    dragOver
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5'
                      : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
                  )}
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#14B8A6]/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-[#14B8A6]" />
                  </div>
                  <h3 className="font-semibold text-[#F5F5F5] mb-1">Drag &amp; drop or click to upload</h3>
                  <p className="text-sm text-[#737373]">JPEG, PNG, WebP — up to 10MB</p>
                  <p className="text-xs text-[#737373] mt-2">For best results, use a front-facing photo in natural light</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A]">
                    <img src={imageUrl} alt="Client photo" className="w-full h-auto max-h-[400px] object-contain" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-[#0F0F0F]/60 flex items-center justify-center">
                        <div className="text-center">
                          <div className="relative mx-auto mb-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#14B8A6]/20 border-t-[#14B8A6] mx-auto" />
                            <ScanLine className="h-5 w-5 text-[#14B8A6] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-sm text-[#F5F5F5] font-medium">Analyzing Hair Photo</p>
                          <p className="text-xs text-[#737373]">Detecting color level, tone, condition &amp; gray coverage...</p>
                        </div>
                      </div>
                    )}
                    {!isAnalyzing && !analysisResult && (
                      <PhotoOverlay />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600"
                      onClick={handleReset}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {!analysisResult && !isAnalyzing && (
                    <Button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90" size="lg">
                      <ScanLine className="h-4 w-4 mr-2" />
                      Analyze Photo
                    </Button>
                  )}

                  {analysisResult && (
                    <div className="flex gap-2">
                      <Button onClick={handleAnalyze} variant="outline" className="flex-1 bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]" disabled={isAnalyzing}>
                        <ScanLine className="h-4 w-4 mr-2" />
                        Re-analyze
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]" onClick={() => setShowBeforeAfter(!showBeforeAfter)}>
                        <Zap className="h-4 w-4 mr-2" />
                        {showBeforeAfter ? 'Hide Preview' : 'Before/After'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            {!analysisResult ? (
              <Card className="bg-[#171717] border-[#2A2A2A]">
                <CardContent className="py-16 text-center">
                  <Info className="h-10 w-10 mx-auto mb-3 text-[#2A2A2A]" />
                  <h3 className="font-medium text-[#F5F5F5] mb-1">No Analysis Yet</h3>
                  <p className="text-sm text-[#737373]">Upload a photo and click &quot;Analyze Photo&quot; to begin</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Hair Characteristics */}
                <Card className="bg-[#171717] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#F5F5F5]">
                      <Palette className="h-4 w-4 text-[#14B8A6]" />
                      Hair Characteristics
                      <ConfidenceBadge score={Math.round(analysisResult.confidence * 100)} size="sm" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Level */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A3A3A3]">Natural Level</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-white/[0.08]"
                          style={{ backgroundColor: analysisResult.dominantHex }}
                        />
                        <span className="font-bold text-[#F5F5F5]">{analysisResult.currentLevel}</span>
                        <span className="text-[#737373] text-sm">— {analysisResult.currentLevelName}</span>
                      </div>
                    </div>

                    {/* Tone */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A3A3A3]">Underlying Tone</span>
                      <Badge variant="outline" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5] capitalize">
                        {analysisResult.toneName}
                      </Badge>
                    </div>

                    {/* Warmth indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#737373]">
                        <span>Cool</span>
                        <span>Neutral</span>
                        <span>Warm</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'linear-gradient(to right, #60A5FA, #9CA3AF, #F59E0B)' }}>
                        <div
                          className="absolute top-0 w-3 h-3 bg-white border-2 border-[#0F0F0F] rounded-full shadow-md -translate-y-[2px]"
                          style={{ left: `${Math.max(0, Math.min(100, (analysisResult.warmthRatio + 1) * 50))}%`, transform: 'translateX(-50%) translateY(-2px)' }}
                        />
                      </div>
                    </div>

                    {/* Gray */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#A3A3A3]">Gray Percentage</span>
                        <span className="font-semibold text-[#F5F5F5]">{analysisResult.grayPercent}%</span>
                      </div>
                      <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${analysisResult.grayPercent}%`, background: 'linear-gradient(to right, #737373, #A3A3A3)' }}
                        />
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#A3A3A3]">Hair Condition</span>
                        <Badge className={cn('border', getConditionColor(analysisResult.condition))}>
                          {analysisResult.condition.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#737373]">
                          <span>Severely Damaged</span>
                          <span>Excellent</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)' }}>
                          <div
                            className="absolute top-0 w-3 h-3 bg-white border-2 border-[#0F0F0F] rounded-full shadow-md -translate-y-[2px]"
                            style={{ left: `${analysisResult.conditionScore}%`, transform: 'translateX(-50%) translateY(-2px)' }}
                          />
                        </div>
                        <p className="text-[10px] text-[#737373] text-right">Score: {analysisResult.conditionScore}/100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Damage Assessment */}
                <Card className="bg-[#171717] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#F5F5F5]">
                      <Shield className="h-4 w-4 text-[#F59E0B]" />
                      Damage Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Porosity', value: analysisResult.damageIndicators.porosityEstimate, color: getPorosityColor(analysisResult.damageIndicators.porosityEstimate) },
                        { label: 'Texture', value: analysisResult.damageIndicators.texture, color: 'text-[#F5F5F5]' },
                        { label: 'Shine Score', value: `${analysisResult.damageIndicators.shineScore}/100`, color: analysisResult.damageIndicators.shineScore > 70 ? 'text-emerald-400' : 'text-[#F59E0B]' },
                        { label: 'Dryness', value: `${analysisResult.damageIndicators.drynessScore}/100`, color: analysisResult.damageIndicators.drynessScore > 60 ? 'text-red-400' : 'text-[#F5F5F5]' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <span className="text-[10px] text-[#737373] uppercase tracking-wider font-medium">{item.label}</span>
                          <p className={cn('font-semibold capitalize', item.color)}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {analysisResult.damageIndicators.splitEndDetected && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-orange-400 bg-orange-400/10 p-3 rounded-lg border border-orange-400/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Split ends detected — recommend trim before color service
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-[#171717] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#F5F5F5]">
                      <Sparkles className="h-4 w-4 text-[#14B8A6]" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#A3A3A3]">
                          <CheckCircle2 className="h-4 w-4 text-[#14B8A6] mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Color extraction visualization */}
                <Card className="bg-[#171717] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#F5F5F5]">
                      <Droplets className="h-4 w-4 text-[#14B8A6]" />
                      Color Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl border-2 border-[#2A2A2A] mx-auto mb-2"
                          style={{ backgroundColor: analysisResult.dominantHex }}
                        />
                        <p className="text-[10px] text-[#737373] uppercase">Dominant</p>
                        <p className="text-xs font-mono text-[#A3A3A3]">{analysisResult.dominantHex}</p>
                      </div>
                      {analysisResult.secondaryHex && (
                        <div className="text-center">
                          <div
                            className="w-16 h-16 rounded-xl border-2 border-[#2A2A2A] mx-auto mb-2"
                            style={{ backgroundColor: analysisResult.secondaryHex }}
                          />
                          <p className="text-[10px] text-[#737373] uppercase">Secondary</p>
                          <p className="text-xs font-mono text-[#A3A3A3]">{analysisResult.secondaryHex}</p>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#737373]">Saturation</span>
                          <span className="text-[#F5F5F5] font-medium">{Math.round(analysisResult.saturation * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] rounded-full transition-all duration-500"
                            style={{ width: `${analysisResult.saturation * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#737373]">Uniformity</span>
                          <span className="text-[#F5F5F5] font-medium">{Math.round(analysisResult.rawMetrics.uniformity * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-500"
                            style={{ width: `${analysisResult.rawMetrics.uniformity * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical details */}
                <Card className="bg-[#1A1A1A] border-dashed border-[#2A2A2A]">
                  <CardContent className="py-4">
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-[#737373] hover:text-[#A3A3A3] transition-colors text-xs uppercase tracking-wider">
                        Technical Details
                      </summary>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#737373]">
                        <span>Face Detected:</span>
                        <span className={analysisResult.faceDetected ? 'text-emerald-400' : 'text-orange-400'}>
                          {analysisResult.faceDetected ? 'Yes' : 'No'}
                        </span>
                        <span>Hair Region:</span>
                        <span className={analysisResult.hairRegionFound ? 'text-emerald-400' : 'text-orange-400'}>
                          {analysisResult.hairRegionFound ? 'Found' : 'Fallback'}
                        </span>
                        <span>Sample Pixels:</span>
                        <span>{analysisResult.rawMetrics.sampleSize.toLocaleString()}</span>
                        <span>Avg Brightness:</span>
                        <span>{analysisResult.rawMetrics.avgBrightness}</span>
                        <span>Uniformity:</span>
                        <span>{(analysisResult.rawMetrics.uniformity * 100).toFixed(0)}%</span>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
