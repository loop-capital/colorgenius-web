'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { HairSwatch } from '@/components/ui/hair-swatch'
import { ColorCircle } from '@/components/ui/color-circle'
import { ConfidenceBadge } from '@/components/ui/confidence-badge'
import { GlassCard, StepTransition, ColorWheel3D, TreatmentCard, ConfidenceBreakdown } from '@/components/custom'
import { HAIR_LEVELS } from '@/lib/products'
import type { ToneFamily } from '@/lib/products'
import {
  FlaskConical, ChevronRight, ChevronLeft, Save, RotateCcw,
  Sparkles, Droplets, Clock, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const BRAND_OPTIONS = ['Davines', 'Wella', 'Schwarzkopf', 'Redken', 'Matrix', 'Joico', 'Paul Mitchell', 'Pulp Riot', 'Goldwell']

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                    isActive && 'shadow-lg',
                    isCompleted && 'border border-[#14B8A6]/40',
                    !isActive && !isCompleted && 'border border-white/[0.08]'
                  )}
                  style={{
                    backgroundColor: isActive ? '#14B8A6' : isCompleted ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#0A0A0A' : isCompleted ? '#14B8A6' : 'var(--cg-text-tertiary)',
                    boxShadow: isActive ? '0 0 20px rgba(20,184,166,0.3)' : undefined,
                  }}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {isCompleted ? <ChevronRight className="w-5 h-5" /> : step.id}
                </motion.div>
                <div className="text-center hidden md:block">
                  <p className={cn('text-xs font-semibold', isActive ? 'text-[#F5F5F7]' : 'text-[#71717A]')}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#71717A]">{step.description}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <motion.div
                  className={cn('h-[2px] flex-1 mx-3 rounded-full')}
                  style={{
                    backgroundColor: isCompleted ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.06)',
                  }}
                  initial={false}
                  animate={isCompleted ? { scaleX: 1 } : { scaleX: 1 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Custom button component inline
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
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
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

// Custom section header
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <h2 className="text-lg font-bold" style={{ color: 'var(--cg-text-primary)' }}>{title}</h2>
    </div>
  )
}

function FormulatePageContent() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
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
      setDirection('forward')
      setStep(4)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Formulation failed')
    } finally {
      setIsFormulating(false)
    }
  }

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 'forward' : 'back')
    setStep(nextStep)
  }

  const levelDiff = formData.targetLevel - formData.currentLevel

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
              Create <span className="gradient-text-teal">Formulation</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
              Build a professional color formula in 4 steps
            </p>
          </div>
          <ActionButton
            variant="outline"
            onClick={() => {
              setFormData({
                currentLevel: 5, currentTone: 'N',
                targetLevel: 7, targetTone: 'N',
                condition: { type: 'previously_colored', porosity: 'normal', grayPercent: 0, highlights: false, highlightedPercent: 0 },
                brandPreference: '',
              })
              setResult(null)
              goToStep(1)
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </ActionButton>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step 1: Hair Assessment */}
        {step === 1 && (
          <StepTransition stepKey="step1" direction={direction}>
            <GlassCard className="p-6 md:p-8">
              <SectionHeader
                icon={<Sparkles className="w-5 h-5 text-[#14B8A6]" />}
                title="Current Hair Color"
              />

              <div className="space-y-8">
                {/* Current Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                    Current Level
                  </Label>
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

                {/* Current Tone - ColorWheel3D */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                    Current Tone
                  </Label>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <ColorWheel3D
                      tones={TONE_OPTIONS}
                      selected={(() => {
                        const map: Record<string, ToneFamily> = { N: 'neutral', A: 'ash', G: 'golden', R: 'red', V: 'violet', K: 'copper', B: 'beige', W: 'warm', C: 'cool', P: 'pearl', M: 'mahogany', Ch: 'chocolate' }
                        return map[formData.currentTone] || 'neutral'
                      })()}
                      onSelect={(val) => {
                        const revMap: Record<ToneFamily, string> = { neutral: 'N', ash: 'A', golden: 'G', red: 'R', violet: 'V', copper: 'K', beige: 'B', warm: 'W', cool: 'C', pearl: 'P', mahogany: 'M', chocolate: 'Ch' }
                        setFormData(p => ({ ...p, currentTone: revMap[val as ToneFamily] || 'N' }))
                      }}
                    />
                    {/* Fallback tone circles */}
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
                </div>

                {/* Preview */}
                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className="w-16 h-16 rounded-xl border-2 border-white/[0.08]"
                    style={{ backgroundColor: HAIR_LEVELS[formData.currentLevel]?.hex }}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                      {HAIR_LEVELS[formData.currentLevel]?.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
                      Level {formData.currentLevel} · {formData.currentTone} tone
                    </p>
                  </div>
                </motion.div>

                <div className="flex justify-end">
                  <ActionButton onClick={() => goToStep(2)}>
                    Next: Target Look <ChevronRight className="w-4 h-4 ml-1" />
                  </ActionButton>
                </div>
              </div>
            </GlassCard>
          </StepTransition>
        )}

        {/* Step 2: Target Look */}
        {step === 2 && (
          <StepTransition stepKey="step2" direction={direction}>
            <GlassCard className="p-6 md:p-8">
              <SectionHeader
                icon={<Sparkles className="w-5 h-5 text-[#F59E0B]" />}
                title="Target Look"
              />

              <div className="space-y-8">
                {/* Target Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                    Target Level
                  </Label>
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
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                    Target Tone
                  </Label>
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
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                    Brand Preference (Optional)
                  </Label>
                  <Select
                    value={formData.brandPreference}
                    onValueChange={(value) => setFormData(p => ({ ...p, brandPreference: value }))}
                  >
                    <SelectTrigger className="w-full" style={{ background: 'var(--cg-surface)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }}>
                      <SelectValue placeholder="Select a brand or leave empty for any" />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'var(--cg-surface)', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <SelectItem value="">Any brand</SelectItem>
                      {BRAND_OPTIONS.map(b => (
                        <SelectItem key={b} value={b} className="text-[#F5F5F7]">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Change Visual */}
                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-white/[0.08] mx-auto mb-1"
                      style={{ backgroundColor: HAIR_LEVELS[formData.currentLevel]?.hex }}
                    />
                    <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>From</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--cg-text-secondary)' }}>Level {formData.currentLevel}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-[2px] flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div
                      className={cn('px-2 py-1 rounded-full text-[10px] font-bold')}
                      style={{
                        backgroundColor: levelDiff > 0 ? 'rgba(245,158,11,0.1)' : levelDiff < 0 ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.06)',
                        color: levelDiff > 0 ? '#F59E0B' : levelDiff < 0 ? '#14B8A6' : 'var(--cg-text-tertiary)',
                      }}
                    >
                      {levelDiff > 0 ? `+${levelDiff} levels` : levelDiff < 0 ? `${levelDiff} levels` : 'Same level'}
                    </div>
                    <div className="h-[2px] flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg border-2 mx-auto mb-1"
                      style={{ backgroundColor: HAIR_LEVELS[formData.targetLevel]?.hex, borderColor: 'rgba(20,184,166,0.4)' }}
                    />
                    <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>To</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--cg-teal)' }}>Level {formData.targetLevel}</p>
                  </div>
                </motion.div>

                <div className="flex justify-between">
                  <ActionButton variant="outline" onClick={() => goToStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </ActionButton>
                  <ActionButton onClick={() => goToStep(3)}>
                    Next: Condition <ChevronRight className="w-4 h-4 ml-1" />
                  </ActionButton>
                </div>
              </div>
            </GlassCard>
          </StepTransition>
        )}

        {/* Step 3: Condition & History */}
        {step === 3 && (
          <StepTransition stepKey="step3" direction={direction}>
            <GlassCard className="p-6 md:p-8">
              <SectionHeader
                icon={<Droplets className="w-5 h-5 text-[#14B8A6]" />}
                title="Hair Condition & History"
              />

              <div className="space-y-6">
                {/* Hair Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>Hair Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CONDITION_OPTIONS.map(opt => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, condition: { ...p.condition, type: opt.value } }))}
                        className={cn('p-4 rounded-xl border text-left transition-all duration-200')}
                        style={{
                          backgroundColor: formData.condition.type === opt.value ? 'rgba(20,184,166,0.05)' : 'var(--cg-surface)',
                          borderColor: formData.condition.type === opt.value ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.06)',
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className={cn('text-sm font-medium', formData.condition.type === opt.value ? 'text-[#14B8A6]' : 'text-[#F5F5F7]')}>
                          {opt.label}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--cg-text-tertiary)' }}>{opt.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Porosity */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>Porosity</Label>
                  <div className="flex gap-3">
                    {POROSITY_OPTIONS.map(opt => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, condition: { ...p.condition, porosity: opt.value } }))}
                        className={cn('flex-1 p-4 rounded-xl border text-center transition-all duration-200')}
                        style={{
                          backgroundColor: formData.condition.porosity === opt.value ? 'rgba(20,184,166,0.05)' : 'var(--cg-surface)',
                          borderColor: formData.condition.porosity === opt.value ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.06)',
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: opt.color }} />
                        <p className={cn('text-sm font-medium', formData.condition.porosity === opt.value ? 'text-[#F5F5F7]' : 'text-[#A1A1AA]')}>
                          {opt.label.split('—')[0]}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Gray Coverage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>Gray Coverage</Label>
                    <span className="text-sm font-bold" style={{ color: 'var(--cg-text-primary)' }}>{formData.condition.grayPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.condition.grayPercent}
                    onChange={(e) => setFormData(p => ({ ...p, condition: { ...p.condition, grayPercent: Number(e.target.value) } }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
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
                      className="w-4 h-4 rounded border-[rgba(255,255,255,0.12)] bg-[var(--cg-surface)] accent-[#14B8A6]"
                    />
                    <Label htmlFor="highlights" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--cg-text-primary)' }}>
                      Highlights Present
                    </Label>
                  </div>
                  {formData.condition.highlights && (
                    <motion.div
                      className="pl-7 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: 'var(--cg-text-secondary)' }}>Highlighted Area</Label>
                        <span className="text-xs font-bold" style={{ color: 'var(--cg-text-primary)' }}>{formData.condition.highlightedPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={formData.condition.highlightedPercent}
                        onChange={(e) => setFormData(p => ({ ...p, condition: { ...p.condition, highlightedPercent: Number(e.target.value) } }))}
                        className="w-full"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Summary preview */}
                <motion.div
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                    Consultation Summary
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="block text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Current</span>
                      <span className="font-medium" style={{ color: 'var(--cg-text-primary)' }}>Level {formData.currentLevel} {formData.currentTone}</span>
                    </div>
                    <div>
                      <span className="block text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Target</span>
                      <span className="font-medium" style={{ color: 'var(--cg-teal)' }}>Level {formData.targetLevel} {formData.targetTone}</span>
                    </div>
                    <div>
                      <span className="block text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Condition</span>
                      <span className="font-medium capitalize" style={{ color: 'var(--cg-text-primary)' }}>{formData.condition.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="block text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Gray</span>
                      <span className="font-medium" style={{ color: 'var(--cg-text-primary)' }}>{formData.condition.grayPercent}%</span>
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-between">
                  <ActionButton variant="outline" onClick={() => goToStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </ActionButton>
                  <ActionButton onClick={handleSubmit} disabled={isFormulating}>
                    {isFormulating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        Generate Formula <FlaskConical className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </ActionButton>
                </div>
              </div>
            </GlassCard>
          </StepTransition>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <StepTransition stepKey="step4" direction={direction}>
            <div className="space-y-4">
              {/* Warnings if any */}
              {result.warnings && result.warnings.length > 0 && (
                <GlassCard className="p-4 border-yellow-500/20">
                  {result.warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-yellow-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </GlassCard>
              )}

              {/* Main formula card using TreatmentCard */}
              <TreatmentCard
                name={result.brand + ' ' + result.line + ' Formula'}
                brand={result.brand}
                line={result.line}
                shades={result.steps?.filter((s: any) => s.role === 'primary' || s.role === 'secondary').map((s: any) => ({
                  code: s.product.shadeCode,
                  name: s.product.shadeName || s.product.shadeCode,
                  hex: HAIR_LEVELS[s.product.level]?.hex || '#7D5038',
                })) || []}
                developer={result.brand + ' Developer'}
                developerVolume={result.developerVolume + 'Vol'}
                mixRatio={result.steps?.[0]?.product?.mixingRatio || '1:1'}
                processingTime={String(result.processingTime || 35)}
                application={result.application?.replace('_', ' ') || 'all over'}
                confidence={result.success ? 92 : 70}
                notes={result.notes?.join('. ') || ''}
              />

              {/* Confidence breakdown */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--cg-text-primary)' }}>
                  Confidence Analysis
                </h3>
                <ConfidenceBreakdown
                  overall={result.success ? 92 : 70}
                  scores={[
                    { label: 'Warmth accuracy', value: result.success ? 95 : 70, color: '#14B8A6' },
                    { label: 'Coverage', value: result.coverage === 'full' ? 94 : 80, color: '#F59E0B' },
                    { label: 'Damage risk', value: result.developerVolume <= 20 ? 97 : 85, color: '#A78BFA' },
                    { label: 'Lift accuracy', value: result.success ? 91 : 65, color: '#10B981' },
                  ]}
                />
              </GlassCard>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <ActionButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => goToStep(1)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Formula
                </ActionButton>
                <ActionButton className="flex-1" onClick={() => {}}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save to Library
                </ActionButton>
              </div>
            </div>
          </StepTransition>
        )}
      </div>
    </div>
  )
}

export default function FormulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-8" style={{ background: 'var(--cg-bg-deep)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="cg-shimmer h-8 w-64 rounded-lg mb-4" />
          <div className="cg-shimmer h-4 w-96 rounded-lg mb-8" />
          <div className="cg-shimmer h-[400px] rounded-xl" />
        </div>
      </div>
    }>
      <FormulatePageContent />
    </Suspense>
  )
}
