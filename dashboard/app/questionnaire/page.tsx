'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/custom/glass-card'
import { StepTransition } from '@/components/custom/step-transition'
import { BRANDS, LINES_BY_BRAND } from '@/lib/products'

interface FormData {
  clientName: string
  phone: string
  email: string
  salonNotes: string
  currentLevel: number
  currentTone: string
  hairCondition: string[]
  targetLevel: number
  targetTone: string
  brandPreference: string
  linePreference: string
  specialRequests: string
}

const TONES = [
  { value: 'N', label: 'Natural', color: '#9C8B7A' },
  { value: 'A', label: 'Ash', color: '#8A7D6E' },
  { value: 'G', label: 'Gold', color: '#C4A35A' },
  { value: 'K', label: 'Copper', color: '#B87333' },
  { value: 'R', label: 'Red', color: '#A03030' },
  { value: 'V', label: 'Violet', color: '#7B68A6' },
  { value: 'P', label: 'Pearl', color: '#B8B0C4' },
  { value: 'B', label: 'Beige', color: '#C4B5A0' },
  { value: 'M', label: 'Mahogany', color: '#6B3A3A' },
  { value: 'Ch', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'W', label: 'Warm', color: '#D4A574' },
  { value: 'C', label: 'Cool', color: '#7D8B9A' },
]

const HAIR_CONDITIONS = [
  { id: 'virgin', label: 'Virgin Hair' },
  { id: 'previously_colored', label: 'Previously Colored' },
  { id: 'bleached', label: 'Bleached / Lightened' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'gray', label: 'Gray Coverage Needed' },
  { id: 'dry', label: 'Dry / Brittle' },
  { id: 'oily', label: 'Oily Scalp' },
  { id: 'fine', label: 'Fine / Thin' },
  { id: 'thick', label: 'Thick / Coarse' },
]

const STEP_TITLES = ['Client Profile', 'Current Hair State', 'Desired Result', 'Review & Submit']
const STEP_DESCRIPTIONS = [
  "Enter your client's basic information",
  'Document the current hair condition',
  'Define the target color and preferences',
  'Review all details before creating the formula',
]

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === currentStep
                ? 'bg-[#9333EA] text-white'
                : step < currentStep
                ? 'bg-[#9333EA]/30 text-[#9333EA]'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: step === currentStep ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {step < currentStep ? '✓' : step}
          </motion.div>
          {step < totalSteps && (
            <motion.div
              className={`w-12 h-0.5 rounded-full transition-colors ${
                step < currentStep ? 'bg-[#9333EA]/50' : 'bg-white/10'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const totalSteps = 4

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    phone: '',
    email: '',
    salonNotes: '',
    currentLevel: 5,
    currentTone: 'N',
    hairCondition: [],
    targetLevel: 7,
    targetTone: 'N',
    brandPreference: '',
    linePreference: '',
    specialRequests: '',
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCondition = (condition: string) => {
    setFormData((prev) => {
      const has = prev.hairCondition.includes(condition)
      return {
        ...prev,
        hairCondition: has
          ? prev.hairCondition.filter((c) => c !== condition)
          : [...prev.hairCondition, condition],
      }
    })
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.clientName.trim().length > 0
    }
    return true
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setDirection('forward')
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setDirection('back')
      setStep((s) => s - 1)
    }
  }

  const handleSubmit = () => {
    const params = new URLSearchParams()
    params.set('currentLevel', String(formData.currentLevel))
    params.set('currentTone', formData.currentTone)
    params.set('targetLevel', String(formData.targetLevel))
    params.set('targetTone', formData.targetTone)
    if (formData.brandPreference) params.set('brand', formData.brandPreference)
    if (formData.linePreference) params.set('line', formData.linePreference)
    if (formData.specialRequests) params.set('notes', formData.specialRequests)
    if (formData.clientName) params.set('client', formData.clientName)
    params.set('conditions', formData.hairCondition.join(','))

    router.push(`/formulate?${params.toString()}`)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label htmlFor="clientName" className="text-[#F5F5F7]">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="e.g., Jennifer Smith"
                value={formData.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="mt-1.5 bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30 focus:border-[#9333EA] focus:ring-[#9333EA]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="phone" className="text-[#F5F5F7]">Phone</Label>
                <Input
                  id="phone"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30 focus:border-[#9333EA] focus:ring-[#9333EA]"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#F5F5F7]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30 focus:border-[#9333EA] focus:ring-[#9333EA]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salonNotes" className="text-[#F5F5F7]">Salon Notes</Label>
              <textarea
                id="salonNotes"
                rows={4}
                placeholder="Allergies, past treatments, stylist observations..."
                value={formData.salonNotes}
                onChange={(e) => updateField('salonNotes', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F5F5F7] placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9333EA] focus-visible:ring-offset-2 ring-offset-[#0F0F0F]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[#F5F5F7]">Current Level</Label>
                <motion.span
                  key={formData.currentLevel}
                  initial={{ scale: 1.3, color: '#9333EA' }}
                  animate={{ scale: 1, color: '#9333EA' }}
                  className="font-bold text-lg text-[#9333EA]"
                >
                  {formData.currentLevel}
                </motion.span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.currentLevel}
                onChange={(e) => updateField('currentLevel', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #9333EA 0%, #9333EA ${(formData.currentLevel - 1) * 11.11}%, rgba(255,255,255,0.1) ${(formData.currentLevel - 1) * 11.11}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1 (Black)</span>
                <span>10 (Lightest Blonde)</span>
              </div>
            </div>

            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Current Tone</Label>
              <div className="grid grid-cols-6 gap-3">
                {TONES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('currentTone', t.value)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-full transition-all"
                      style={{
                        backgroundColor: t.color,
                        border: formData.currentTone === t.value ? '3px solid #9333EA' : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: formData.currentTone === t.value ? '0 0 12px rgba(147,51,234,0.4)' : 'none',
                      }}
                    />
                    <span className="text-xs" style={{ color: formData.currentTone === t.value ? '#9333EA' : '#A1A1AA' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-[#F5F5F7]">Hair Condition</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HAIR_CONDITIONS.map((c) => (
                  <motion.label
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.hairCondition.includes(c.id)
                        ? 'border-[#9333EA]/50 bg-[#9333EA]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      id={`cond-${c.id}`}
                      checked={formData.hairCondition.includes(c.id)}
                      onChange={() => toggleCondition(c.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#9333EA] accent-[#9333EA] focus:ring-[#9333EA] focus:ring-offset-[#0F0F0F]"
                    />
                    <span className="text-sm text-[#F5F5F7]/80">{c.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[#F5F5F7]">Target Level</Label>
                <motion.span
                  key={formData.targetLevel}
                  initial={{ scale: 1.3, color: '#9333EA' }}
                  animate={{ scale: 1, color: '#9333EA' }}
                  className="font-bold text-lg text-[#9333EA]"
                >
                  {formData.targetLevel}
                </motion.span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.targetLevel}
                onChange={(e) => updateField('targetLevel', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #9333EA 0%, #9333EA ${(formData.targetLevel - 1) * 11.11}%, rgba(255,255,255,0.1) ${(formData.targetLevel - 1) * 11.11}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1 (Black)</span>
                <span>10 (Lightest Blonde)</span>
              </div>
            </div>

            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Target Tone</Label>
              <div className="grid grid-cols-6 gap-3">
                {TONES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('targetTone', t.value)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-full transition-all"
                      style={{
                        backgroundColor: t.color,
                        border: formData.targetTone === t.value ? '3px solid #9333EA' : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: formData.targetTone === t.value ? '0 0 12px rgba(147,51,234,0.4)' : 'none',
                      }}
                    />
                    <span className="text-xs" style={{ color: formData.targetTone === t.value ? '#9333EA' : '#A1A1AA' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-[#F5F5F7]">Brand Preference</Label>
                <Select
                  value={formData.brandPreference}
                  onValueChange={(v) => {
                    updateField('brandPreference', v)
                    updateField('linePreference', '')
                  }}
                >
                  <SelectTrigger className="mt-1.5 w-full bg-white/5 border-white/10 text-[#F5F5F7]">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    {BRANDS.map((b) => (
                      <SelectItem key={b} value={b} className="text-[#F5F5F7] focus:bg-[#9333EA]/20 focus:text-[#F5F5F7]">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#F5F5F7]">Line Preference</Label>
                <Select
                  value={formData.linePreference}
                  onValueChange={(v) => updateField('linePreference', v)}
                  disabled={!formData.brandPreference}
                >
                  <SelectTrigger className="mt-1.5 w-full bg-white/5 border-white/10 text-[#F5F5F7]">
                    <SelectValue placeholder={formData.brandPreference ? "Select line" : "Select brand first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    {(LINES_BY_BRAND[formData.brandPreference] || []).map((l) => (
                      <SelectItem key={l} value={l} className="text-[#F5F5F7] focus:bg-[#9333EA]/20 focus:text-[#F5F5F7]">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests" className="text-[#F5F5F7]">Special Requests / Notes</Label>
              <textarea
                id="specialRequests"
                rows={3}
                placeholder="Any additional details, preferences, or concerns..."
                value={formData.specialRequests}
                onChange={(e) => updateField('specialRequests', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F5F5F7] placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9333EA] focus-visible:ring-offset-2 ring-offset-[#0F0F0F]"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F5F5F7]">Client Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Name:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.clientName || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Phone:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Email:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.email || '—'}</span>
                </div>
              </div>
              {formData.salonNotes && (
                <div className="text-sm">
                  <span className="text-white/40">Salon Notes:</span>
                  <p className="text-[#F5F5F7]/70 mt-1">{formData.salonNotes}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F5F5F7]">Current Hair State</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Level:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.currentLevel}</span>
                </div>
                <div>
                  <span className="text-white/40">Tone:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">
                    {TONES.find((t) => t.value === formData.currentTone)?.label || formData.currentTone}
                  </span>
                </div>
              </div>
              {formData.hairCondition.length > 0 && (
                <div className="text-sm">
                  <span className="text-white/40">Conditions:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.hairCondition.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 rounded-full text-xs bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/20"
                      >
                        {HAIR_CONDITIONS.find((h) => h.id === c)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F5F5F7]">Desired Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Target Level:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.targetLevel}</span>
                </div>
                <div>
                  <span className="text-white/40">Target Tone:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">
                    {TONES.find((t) => t.value === formData.targetTone)?.label || formData.targetTone}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Brand:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.brandPreference || 'Any'}</span>
                </div>
                <div>
                  <span className="text-white/40">Line:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.linePreference || 'Any'}</span>
                </div>
              </div>
              {formData.specialRequests && (
                <div className="text-sm">
                  <span className="text-white/40">Special Requests:</span>
                  <p className="text-[#F5F5F7]/70 mt-1">{formData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-[#0F0F0F] text-[#F5F5F7] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9333EA] to-[#0D9488] bg-clip-text text-transparent">
            New Consultation
          </h1>
          <p className="text-white/50 mt-2">Walk through a professional color consultation with your client</p>
        </motion.div>

        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        <GlassCard className="p-6" hover={false}>
          <motion.div
            className="mb-4"
            key={`title-${step}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-[#F5F5F7]">{STEP_TITLES[step - 1]}</h2>
            <p className="text-white/50 text-sm mt-1">{STEP_DESCRIPTIONS[step - 1]}</p>
          </motion.div>

          <StepTransition direction={direction} stepKey={step}>
            {renderStep()}
          </StepTransition>
        </GlassCard>

        <motion.div
          className="flex items-center justify-between mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="border-white/10 text-[#F5F5F7] hover:bg-white/5 hover:text-[#F5F5F7] disabled:opacity-30"
          >
            ← Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[#9333EA] hover:bg-[#9333EA]/90 text-white disabled:opacity-30"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#9333EA] to-[#0D9488] hover:opacity-90 text-white font-semibold"
            >
              Create Formula →
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}