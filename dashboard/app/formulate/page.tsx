'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input, InputNumber } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HairSwatch } from '@/components/ui/hair-swatch'
import { ColorCircle } from '@/components/ui/color-circle'
import { ConfidenceBadge } from '@/components/ui/confidence-badge'
import { cn } from '@/lib/utils'
import { HAIR_LEVELS } from '@/lib/products'
import type { ToneFamily } from '@/lib/products'
import {
  FlaskConical, ChevronRight, ChevronLeft, Save, RotateCcw,
  Sparkles, Droplets, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Hair Assessment', description: 'Current color level & tone' },
  { id: 2, title: 'Target Look', description: 'Desired color result' },
  { id: 3, title: 'Condition', description: 'Hair health & history' },
  { id: 4, title: 'Results', description: 'Your custom formula' },
]

const TONE_OPTIONS: { value: ToneFamily; label: string; color: string }[] = [
  { value: 'neutral', label: 'Natural', color: '#9C8B7A' },
  { value: 'ash', label: 'Ash', color: '#8A7D6E' },
  { value: 'golden', label: 'Golden', color: '#C4A35A' },
  { value: 'copper', label: 'Copper', color: '#B87333' },
  { value: 'red', label: 'Red', color: '#A03030' },
  { value: 'violet', label: 'Violet', color: '#7B68A6' },
  { value: 'pearl', label: 'Pearl', color: '#B8B0C4' },
  { value: 'beige', label: 'Beige', color: '#C4B5A0' },
  { value: 'mahogany', label: 'Mahogany', color: '#6B3A3A' },
  { value: 'chocolate', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'warm', label: 'Warm', color: '#D4A574' },
  { value: 'cool', label: 'Cool', color: '#7D8B9A' },
]

const POROSITY_OPTIONS = [
  { value: 'low', label: 'Low — Smooth, cuticle intact', color: '#14B8A6' },
  { value: 'normal', label: 'Normal — Balanced', color: '#F59E0B' },
  { value: 'high', label: 'High — Porous, damaged', color: '#EF4444' },
]

const CONDITION_OPTIONS = [
  { value: 'virgin', label: 'Virgin Hair', desc: 'Never chemically treated' },
  { value: 'previously_colored', label: 'Previously Colored', desc: 'Has existing color' },
  { value: 'bleached', label: 'Bleached/Lightened', desc: 'Lifted from natural' },
  { value: 'damaged', label: 'Damaged', desc: 'Over-processed or dry' },
]

const BRAND_OPTIONS = ['Wella', 'Schwarzkopf', 'Redken', 'Matrix', 'Joico', 'Paul Mitchell', 'Pulp Riot', 'Goldwell']

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  isActive && 'bg-[#14B8A6] text-[#0A0A0A] shadow-lg shadow-[#14B8A6]/20',
                  isCompleted && 'bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/40',
                  !isActive && !isCompleted && 'bg-[#1A1A1A] text-[#737373] border border-[#2A2A2A]'
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <div className="text-center hidden md:block">
                  <p className={cn('text-xs font-semibold', isActive ? 'text-[#F5F5F5]' : 'text-[#737373]')}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#737373]">{step.description}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'h-[2px] flex-1 mx-3 transition-all duration-500',
                  isCompleted ? 'bg-[#14B8A6]/40' : 'bg-[#2A2A2A]'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FormulatePageContent() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    currentLevel: 5,
    currentTone: 'N' as string,
    targetLevel: 7,
    targetTone: 'N' as string,
    condition: {
      type: 'previously_colored' as string,
      porosity: 'normal' as string,
      grayPercent: 0,
      highlights: false,
      highlightedPercent: 0,
    },
    brandPreference: '',
  })
  const [isFormulating, setIsFormulating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const searchParams = useSearchParams()
  useEffect(() => {
    const p = searchParams
    if (!p) return
    if (!p.has('currentLevel') && !p.has('targetLevel')) return
    setFormData(prev => ({
      ...prev,
      currentLevel: Number(p.get('currentLevel') || prev.currentLevel),
      currentTone: p.get('currentTone') || prev.currentTone,
      targetLevel: Number(p.get('targetLevel') || prev.targetLevel),
      targetTone: p.get('targetTone') || prev.targetTone,
      condition: {
        ...prev.condition,
        type: (p.get('conditionType') || prev.condition.type) as any,
        porosity: (p.get('porosity') || prev.condition.porosity) as any,
        grayPercent: Number(p.get('grayPercent') ?? prev.condition.grayPercent),
        highlights: p.get('highlights') === 'true',
        highlightedPercent: Number(p.get('highlightedPercent') ?? prev.condition.highlightedPercent),
      },
      brandPreference: p.get('brandPreference') || prev.brandPreference,
    }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormulating(true)
    try {
      const response = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Formulation failed')
      const data = await response.json()
      setResult(data.data)
      setStep(4)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Formulation failed')
    } finally {
      setIsFormulating(false)
    }
  }

  const currentToneData = TONE_OPTIONS.find(t => {
    const map: Record<string, ToneFamily> = { N: 'neutral', A: 'ash', G: 'golden', R: 'red', V: 'violet', K: 'copper', B: 'beige', W: 'warm', C: 'cool', P: 'pearl', M: 'mahogany', Ch: 'chocolate' }
    return t.value === (map[formData.currentTone] || 'neutral')
  })

  const targetToneData = TONE_OPTIONS.find(t => {
    const map: Record<string, ToneFamily> = { N: 'neutral', A: 'ash', G: 'golden', R: 'red', V: 'violet', K: 'copper', B: 'beige', W: 'warm', C: 'cool', P: 'pearl', M: 'mahogany', Ch: 'chocolate' }
    return t.value === (map[formData.targetTone] || 'neutral')
  })

  const levelDiff = formData.targetLevel - formData.currentLevel

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Create Formulation</h1>
            <p className="text-sm text-[#A3A3A3] mt-1">Build a professional color formula in 4 steps</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                currentLevel: 5, currentTone: 'N',
                targetLevel: 7, targetTone: 'N',
                condition: { type: 'previously_colored', porosity: 'normal', grayPercent: 0, highlights: false, highlightedPercent: 0 },
                brandPreference: '',
              })
              setResult(null)
              setStep(1)
            }}
            className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#3A3A3A]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step 1: Hair Assessment */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-[#171717] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#14B8A6]" />
                  Current Hair Color
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Current Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Current Level</Label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(HAIR_LEVELS).map(([level, info]) => (
                      <HairSwatch
                        key={level}
                        color={info.hex}
                        label={info.name}
                        level={Number(level)}
                        isActive={formData.currentLevel === Number(level)}
                        onClick={() => setFormData(p => ({ ...p, currentLevel: Number(level) }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Current Tone */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Current Tone</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'N', label: 'Natural', color: '#9C8B7A' },
                      { value: 'A', label: 'Ash', color: '#8A7D6E' },
                      { value: 'G', label: 'Gold', color: '#C4A35A' },
                      { value: 'R', label: 'Red', color: '#A03030' },
                      { value: 'V', label: 'Violet', color: '#7B68A6' },
                      { value: 'K', label: 'Copper', color: '#B87333' },
                      { value: 'B', label: 'Beige', color: '#C4B5A0' },
                    ].map((tone) => (
                      <ColorCircle
                        key={tone.value}
                        color={tone.color}
                        label={tone.label}
                        isActive={formData.currentTone === tone.value}
                        onClick={() => setFormData(p => ({ ...p, currentTone: tone.value }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                  <div className="w-16 h-16 rounded-xl border-2 border-[#2A2A2A]" style={{ backgroundColor: HAIR_LEVELS[formData.currentLevel]?.hex }} />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F5]">{HAIR_LEVELS[formData.currentLevel]?.name}</p>
                    <p className="text-xs text-[#A3A3A3]">Level {formData.currentLevel} · {formData.currentTone} tone</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90"
                  >
                    Next: Target Look <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Target Look */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-[#171717] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  Target Look
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Target Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Target Level</Label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(HAIR_LEVELS).map(([level, info]) => (
                      <HairSwatch
                        key={level}
                        color={info.hex}
                        label={info.name}
                        level={Number(level)}
                        isActive={formData.targetLevel === Number(level)}
                        onClick={() => setFormData(p => ({ ...p, targetLevel: Number(level) }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Target Tone */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Target Tone</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'N', label: 'Natural', color: '#9C8B7A' },
                      { value: 'A', label: 'Ash', color: '#8A7D6E' },
                      { value: 'G', label: 'Gold', color: '#C4A35A' },
                      { value: 'R', label: 'Red', color: '#A03030' },
                      { value: 'V', label: 'Violet', color: '#7B68A6' },
                      { value: 'K', label: 'Copper', color: '#B87333' },
                      { value: 'B', label: 'Beige', color: '#C4B5A0' },
                    ].map((tone) => (
                      <ColorCircle
                        key={tone.value}
                        color={tone.color}
                        label={tone.label}
                        isActive={formData.targetTone === tone.value}
                        onClick={() => setFormData(p => ({ ...p, targetTone: tone.value }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Brand Preference */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Brand Preference (Optional)</Label>
                  <Select
                    value={formData.brandPreference}
                    onValueChange={(value) => setFormData(p => ({ ...p, brandPreference: value }))}
                  >
                    <SelectTrigger className="w-full bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5]">
                      <SelectValue placeholder="Select a brand or leave empty for any" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <SelectItem value="">Any brand</SelectItem>
                      {BRAND_OPTIONS.map(b => (
                        <SelectItem key={b} value={b} className="text-[#F5F5F5]">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Change Visual */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg border-2 border-[#2A2A2A] mx-auto mb-1" style={{ backgroundColor: HAIR_LEVELS[formData.currentLevel]?.hex }} />
                    <p className="text-[10px] text-[#737373]">From</p>
                    <p className="text-xs font-medium text-[#A3A3A3]">Level {formData.currentLevel}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-[2px] flex-1 bg-[#2A2A2A]" />
                    <div className={cn(
                      'px-2 py-1 rounded-full text-[10px] font-bold',
                      levelDiff > 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : levelDiff < 0 ? 'bg-[#14B8A6]/10 text-[#14B8A6]' : 'bg-[#2A2A2A] text-[#737373]'
                    )}>
                      {levelDiff > 0 ? `+${levelDiff} levels` : levelDiff < 0 ? `${levelDiff} levels` : 'Same level'}
                    </div>
                    <div className="h-[2px] flex-1 bg-[#2A2A2A]" />
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg border-2 border-[#14B8A6]/40 mx-auto mb-1" style={{ backgroundColor: HAIR_LEVELS[formData.targetLevel]?.hex }} />
                    <p className="text-[10px] text-[#737373]">To</p>
                    <p className="text-xs font-medium text-[#14B8A6]">Level {formData.targetLevel}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90"
                  >
                    Next: Condition <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Condition & History */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-[#171717] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#14B8A6]" />
                  Hair Condition & History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hair Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Hair Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CONDITION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, condition: { ...p.condition, type: opt.value } }))}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all duration-200',
                          formData.condition.type === opt.value
                            ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5'
                            : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
                        )}
                      >
                        <p className={cn('text-sm font-medium', formData.condition.type === opt.value ? 'text-[#14B8A6]' : 'text-[#F5F5F5]')}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-[#737373] mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Porosity */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#F5F5F5]">Porosity</Label>
                  <div className="flex gap-3">
                    {POROSITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, condition: { ...p.condition, porosity: opt.value } }))}
                        className={cn(
                          'flex-1 p-4 rounded-xl border text-center transition-all duration-200',
                          formData.condition.porosity === opt.value
                            ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5'
                            : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
                        )}
                      >
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: opt.color }}
                        />
                        <p className={cn('text-sm font-medium', formData.condition.porosity === opt.value ? 'text-[#F5F5F5]' : 'text-[#A3A3A3]')}>
                          {opt.label.split('—')[0]}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gray Coverage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-[#F5F5F5]">Gray Coverage</Label>
                    <span className="text-sm font-bold text-[#F5F5F5]">{formData.condition.grayPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.condition.grayPercent}
                    onChange={(e) => setFormData(p => ({ ...p, condition: { ...p.condition, grayPercent: Number(e.target.value) } }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[#737373]">
                    <span>No gray</span>
                    <span>Partial</span>
                    <span>Full coverage needed</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="highlights"
                      checked={formData.condition.highlights}
                      onChange={(e) => setFormData(p => ({ ...p, condition: { ...p.condition, highlights: e.target.checked } }))}
                      className="w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] accent-[#14B8A6]"
                    />
                    <Label htmlFor="highlights" className="text-sm font-medium text-[#F5F5F5] cursor-pointer">
                      Highlights Present
                    </Label>
                  </div>
                  {formData.condition.highlights && (
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-[#A3A3A3]">Highlighted Area</Label>
                        <span className="text-xs font-bold text-[#F5F5F5]">{formData.condition.highlightedPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={formData.condition.highlightedPercent}
                        onChange={(e) => setFormData(p => ({ ...p, condition: { ...p.condition, highlightedPercent: Number(e.target.value) } }))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Summary preview */}
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                  <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold mb-2">Consultation Summary</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-[#737373] block text-xs">Current</span>
                      <span className="text-[#F5F5F5] font-medium">Level {formData.currentLevel} {formData.currentTone}</span>
                    </div>
                    <div>
                      <span className="text-[#737373] block text-xs">Target</span>
                      <span className="text-[#14B8A6] font-medium">Level {formData.targetLevel} {formData.targetTone}</span>
                    </div>
                    <div>
                      <span className="text-[#737373] block text-xs">Condition</span>
                      <span className="text-[#F5F5F5] font-medium capitalize">{formData.condition.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[#737373] block text-xs">Gray</span>
                      <span className="text-[#F5F5F5] font-medium">{formData.condition.grayPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isFormulating}
                    className="bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90"
                  >
                    {isFormulating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        Generate Formula <FlaskConical className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
            {/* Main formula card */}
            <Card className="bg-[#171717] border-[#2A2A2A] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF]" />
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[#F5F5F5]">{result.name || 'Custom Formula'}</h2>
                      <ConfidenceBadge score={result.score || 92} size="sm" />
                    </div>
                    <p className="text-sm text-[#A3A3A3]">{result.formulation?.brand} · {result.formulation?.line}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]">
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                    </Button>
                  </div>
                </div>

                {/* Shade swatches */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                  <span className="text-xs text-[#737373] uppercase tracking-wider font-medium">Formula</span>
                  <div className="flex items-center gap-2">
                    {result.formulation?.shades?.map((shade: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-lg border border-white/[0.08]"
                          style={{ backgroundColor: shade.hex || HAIR_LEVELS[result.formulation?.targetLevel]?.hex }}
                        />
                        <div>
                          <p className="text-xs font-medium text-[#F5F5F5]">{shade.code}</p>
                          <p className="text-[10px] text-[#737373]">{shade.name || shade.code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mix ratio visual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-center">
                    <Droplets className="w-5 h-5 text-[#14B8A6] mx-auto mb-2" />
                    <p className="text-[10px] text-[#737373] uppercase tracking-wider">Developer</p>
                    <p className="text-lg font-bold text-[#F5F5F5]">{result.formulation?.developer}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-center">
                    <FlaskConical className="w-5 h-5 text-[#F59E0B] mx-auto mb-2" />
                    <p className="text-[10px] text-[#737373] uppercase tracking-wider">Mix Ratio</p>
                    <p className="text-lg font-bold text-[#F5F5F5]">{result.formulation?.mixRatio || '1:1'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-center">
                    <Clock className="w-5 h-5 text-[#14B8A6] mx-auto mb-2" />
                    <p className="text-[10px] text-[#737373] uppercase tracking-wider">Processing</p>
                    <p className="text-lg font-bold text-[#F5F5F5]">{result.formulation?.processingTime} min</p>
                  </div>
                </div>

                {/* Application */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                  <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#737373]">Application</p>
                    <p className="text-sm font-medium text-[#F5F5F5]">{result.formulation?.application}</p>
                  </div>
                </div>

                {/* Notes */}
                {result.notes && (
                  <div className="p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/10">
                    <p className="text-xs text-[#F59E0B] font-medium mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Colorist Notes
                    </p>
                    <p className="text-sm text-[#A3A3A3] leading-relaxed">{result.notes}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]"
                    onClick={() => setStep(1)}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Formula
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] text-[#0A0A0A] font-semibold hover:opacity-90">
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save to Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FormulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0F] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="skeleton-shimmer h-8 w-64 rounded-lg mb-4" />
          <div className="skeleton-shimmer h-4 w-96 rounded-lg mb-8" />
          <div className="skeleton-shimmer h-[400px] rounded-xl" />
        </div>
      </div>
    }>
      <FormulatePageContent />
    </Suspense>
  )
}
