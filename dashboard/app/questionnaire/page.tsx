'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/custom/glass-card'
import { StepTransition } from '@/components/custom/step-transition'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface FormData {
  clientName: string
  phone: string
  email: string
  salonNotes: string
  hairCondition: string[]
  texture: string
  hairPattern: string
  density: string
  porosity: string
  grayPercent: number
  chemicalHistory: string[]
  sensitivities: string[]
  lastChemicalService: string
}

const STEP_TITLES = ['Client Profile', 'Hair Characteristics', 'Review']
const STEP_DESCRIPTIONS = [
  "Enter your client's basic information",
  'Document permanent hair characteristics',
  'Review and save client profile',
]

const TEXTURES = [
  { value: 'fine', label: 'Fine', desc: 'Thin strands, processes faster' },
  { value: 'medium', label: 'Medium', desc: 'Average strand diameter' },
  { value: 'coarse', label: 'Coarse', desc: 'Thick strands, takes longer' },
]

const HAIR_PATTERNS = [
  { value: 'straight', label: 'Straight', desc: 'Type 1' },
  { value: 'wavy', label: 'Wavy', desc: 'Type 2' },
  { value: 'curly', label: 'Curly', desc: 'Type 3' },
  { value: 'coily', label: 'Coily', desc: 'Type 4' },
]

const DENSITIES = [
  { value: 'thin', label: 'Thin', desc: 'Low density' },
  { value: 'medium', label: 'Medium', desc: 'Average density' },
  { value: 'thick', label: 'Thick', desc: 'High density' },
]

const POROSITY = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
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

const CHEMICAL_HISTORY = [
  { value: 'box_dye', label: 'Box Dye', desc: 'Drugstore/home color kit — MAJOR HAZARD', warning: true },
  { value: 'metallic_salts', label: 'Metallic Salts', desc: 'Metallic dye or mineral buildup', warning: true },
  { value: 'henna', label: 'Henna', desc: 'Henna color — lightener = green disaster', warning: true },
  { value: 'keratin', label: 'Keratin Treatment', desc: 'Keratin smoothing in last 6 months' },
  { value: 'relaxer', label: 'Relaxer / Straightening', desc: 'Chemical relaxer or Japanese straightening' },
  { value: 'hard_water', label: 'Hard Water', desc: 'Hard water or well water at home' },
  { value: 'medication', label: 'Medication/Mineral Buildup', desc: 'Thyroid meds, iron, copper, etc.' },
]

const SENSITIVITIES = [
  { value: 'ppd_allergy', label: 'PPD Allergy', desc: 'Allergic to PPD — use PPD-free alternatives', warning: true },
  { value: 'pregnancy', label: 'Pregnancy', desc: 'Client is pregnant' },
  { value: 'breastfeeding', label: 'Breastfeeding', desc: 'Client is breastfeeding' },
  { value: 'chemotherapy', label: 'Active Chemotherapy', desc: 'Currently receiving chemo' },
]

const LAST_CHEMICAL_TIMES = [
  { value: 'never', label: 'Never' },
  { value: '6_plus_months', label: '6+ months ago' },
  { value: '3_to_6_months', label: '3-6 months ago' },
  { value: '1_to_3_months', label: '1-3 months ago' },
  { value: '3_to_4_weeks', label: '3-4 weeks ago' },
  { value: '1_to_2_weeks', label: '1-2 weeks ago' },
  { value: 'this_week', label: 'This week' },
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
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [saving, setSaving] = useState(false)
  const totalSteps = 3

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    phone: '',
    email: '',
    salonNotes: '',
    hairCondition: [],
    texture: '',
    hairPattern: '',
    density: '',
    porosity: '',
    grayPercent: 0,
    chemicalHistory: [],
    sensitivities: [],
    lastChemicalService: '',
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

  const toggleChemicalHistory = (value: string) => {
    setFormData((prev) => {
      const has = prev.chemicalHistory.includes(value)
      return {
        ...prev,
        chemicalHistory: has
          ? prev.chemicalHistory.filter((c) => c !== value)
          : [...prev.chemicalHistory, value],
      }
    })
  }

  const toggleSensitivity = (value: string) => {
    setFormData((prev) => {
      const has = prev.sensitivities.includes(value)
      return {
        ...prev,
        sensitivities: has
          ? prev.sensitivities.filter((c) => c !== value)
          : [...prev.sensitivities, value],
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

  const saveClient = async (): Promise<{ id: string; name: string } | null> => {
    try {
      const payload = {
        name: formData.clientName,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.salonNotes || undefined,
        hairCondition: formData.hairCondition,
        texture: formData.texture || undefined,
        hairPattern: formData.hairPattern || undefined,
        density: formData.density || undefined,
        porosity: formData.porosity || undefined,
        grayPercent: formData.grayPercent,
        chemicalHistory: formData.chemicalHistory,
        sensitivities: formData.sensitivities,
        lastChemicalService: formData.lastChemicalService || undefined,
      }
      const res = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success || data.client) {
        return { id: data.client?.id || data.id, name: formData.clientName }
      }
      toast({ title: 'Error', description: data.error || 'Failed to save client', variant: 'destructive' })
      return null
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
      return null
    }
  }

  const handleSaveClient = async () => {
    setSaving(true)
    const saved = await saveClient()
    setSaving(false)
    if (saved) {
      toast({ title: 'Saved', description: `Client "${saved.name}" saved successfully.` })
      router.push('/dashboard')
    }
  }

  const handleSaveAndFormulate = async () => {
    setSaving(true)
    const saved = await saveClient()
    setSaving(false)
    if (saved) {
      const params = new URLSearchParams()
      params.set('clientId', saved.id)
      params.set('clientName', saved.name)
      params.set('autoPopulate', 'true')
      if (formData.texture) params.set('texture', formData.texture)
      if (formData.hairPattern) params.set('hairPattern', formData.hairPattern)
      if (formData.density) params.set('density', formData.density)
      if (formData.porosity) params.set('porosity', formData.porosity)
      params.set('grayPercent', String(formData.grayPercent))
      if (formData.hairCondition.length > 0) params.set('conditions', formData.hairCondition.join(','))
      if (formData.chemicalHistory.length > 0) params.set('chemicalHistory', formData.chemicalHistory.join(','))
      if (formData.sensitivities.length > 0) params.set('sensitivities', formData.sensitivities.join(','))
      if (formData.lastChemicalService) params.set('lastChemicalService', formData.lastChemicalService)

      router.push(`/formulate?${params.toString()}`)
    }
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
            {/* Texture */}
            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Texture</Label>
              <div className="grid grid-cols-3 gap-3">
                {TEXTURES.map((t) => (
                  <motion.button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('texture', t.value)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center"
                    style={{
                      borderColor: formData.texture === t.value ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.texture === t.value ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-semibold" style={{ color: formData.texture === t.value ? '#9333EA' : '#F5F5F7' }}>{t.label}</span>
                    <span className="text-xs text-white/40">{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hair Pattern */}
            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Hair Pattern</Label>
              <div className="grid grid-cols-4 gap-3">
                {HAIR_PATTERNS.map((t) => (
                  <motion.button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('hairPattern', t.value)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center"
                    style={{
                      borderColor: formData.hairPattern === t.value ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.hairPattern === t.value ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-semibold" style={{ color: formData.hairPattern === t.value ? '#9333EA' : '#F5F5F7' }}>{t.label}</span>
                    <span className="text-xs text-white/40">{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Density</Label>
              <div className="grid grid-cols-3 gap-3">
                {DENSITIES.map((t) => (
                  <motion.button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('density', t.value)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center"
                    style={{
                      borderColor: formData.density === t.value ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.density === t.value ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-semibold" style={{ color: formData.density === t.value ? '#9333EA' : '#F5F5F7' }}>{t.label}</span>
                    <span className="text-xs text-white/40">{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Porosity */}
            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Porosity</Label>
              <div className="grid grid-cols-3 gap-3">
                {POROSITY.map((t) => (
                  <motion.button
                    type="button"
                    key={t.value}
                    onClick={() => updateField('porosity', t.value)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center"
                    style={{
                      borderColor: formData.porosity === t.value ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.porosity === t.value ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-semibold" style={{ color: formData.porosity === t.value ? '#9333EA' : '#F5F5F7' }}>{t.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Gray Percentage */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[#F5F5F7]">Gray Percentage</Label>
                <motion.span
                  key={formData.grayPercent}
                  initial={{ scale: 1.3, color: '#9333EA' }}
                  animate={{ scale: 1, color: '#9333EA' }}
                  className="font-bold text-lg text-[#9333EA]"
                >
                  {formData.grayPercent}%
                </motion.span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={formData.grayPercent}
                onChange={(e) => updateField('grayPercent', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #9333EA 0%, #9333EA ${formData.grayPercent}%, rgba(255,255,255,0.1) ${formData.grayPercent}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Hair Condition */}
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

            {/* Chemical History */}
            <div>
              <Label className="mb-3 block text-[#F5F5F7]">Chemical History</Label>
              <p className="text-white/40 text-xs mb-3">Past treatments that affect formulation</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHEMICAL_HISTORY.map((c) => (
                  <motion.button
                    type="button"
                    key={c.value}
                    onClick={() => toggleChemicalHistory(c.value)}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer text-left"
                    style={{
                      borderColor: formData.chemicalHistory.includes(c.value) ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.chemicalHistory.includes(c.value) ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="h-4 w-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center"
                      style={{
                        borderColor: formData.chemicalHistory.includes(c.value) ? '#9333EA' : 'rgba(255,255,255,0.2)',
                        background: formData.chemicalHistory.includes(c.value) ? '#9333EA' : 'transparent',
                      }}
                    >
                      {formData.chemicalHistory.includes(c.value) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#F5F5F7] flex items-center gap-1.5">
                        {c.warning && <AlertTriangle size={12} className="text-yellow-400" />}
                        {c.label}
                      </span>
                      <span className="text-xs text-white/40 block mt-0.5">{c.desc}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sensitivities */}
            <div>
              <Label className="mb-3 block text-[#F5F5F7]">Sensitivities & Contraindications</Label>
              <p className="text-white/40 text-xs mb-3">Safety-critical information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SENSITIVITIES.map((c) => (
                  <motion.button
                    type="button"
                    key={c.value}
                    onClick={() => toggleSensitivity(c.value)}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer text-left"
                    style={{
                      borderColor: formData.sensitivities.includes(c.value) ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)',
                      background: formData.sensitivities.includes(c.value) ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="h-4 w-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center"
                      style={{
                        borderColor: formData.sensitivities.includes(c.value) ? '#9333EA' : 'rgba(255,255,255,0.2)',
                        background: formData.sensitivities.includes(c.value) ? '#9333EA' : 'transparent',
                      }}
                    >
                      {formData.sensitivities.includes(c.value) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#F5F5F7] flex items-center gap-1.5">
                        {c.warning && <AlertTriangle size={12} className="text-yellow-400" />}
                        {c.label}
                      </span>
                      <span className="text-xs text-white/40 block mt-0.5">{c.desc}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Last Chemical Service */}
            <div>
              <Label className="text-[#F5F5F7] mb-3 block">Last Chemical Service</Label>
              <p className="text-white/40 text-xs mb-3">How recently was the last treatment?</p>
              <div className="flex flex-wrap gap-2">
                {LAST_CHEMICAL_TIMES.map((o) => (
                  <motion.button
                    type="button"
                    key={o.value}
                    onClick={() => updateField('lastChemicalService', o.value)}
                    className="px-4 py-2 rounded-full border cursor-pointer text-sm"
                    style={{
                      borderColor: formData.lastChemicalService === o.value ? 'rgba(147,51,234,0.6)' : 'rgba(255,255,255,0.12)',
                      background: formData.lastChemicalService === o.value ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.02)',
                      color: formData.lastChemicalService === o.value ? '#9333EA' : '#A1A1AA',
                      fontWeight: formData.lastChemicalService === o.value ? 600 : 400,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {o.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            {/* Client Profile Summary */}
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

            {/* Hair Characteristics Summary */}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F5F5F7]">Hair Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Texture:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{TEXTURES.find(t => t.value === formData.texture)?.label || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Pattern:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{HAIR_PATTERNS.find(t => t.value === formData.hairPattern)?.label || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Density:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{DENSITIES.find(t => t.value === formData.density)?.label || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Porosity:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{POROSITY.find(t => t.value === formData.porosity)?.label || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Gray:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{formData.grayPercent}%</span>
                </div>
                <div>
                  <span className="text-white/40">Last Chemical Service:</span>{' '}
                  <span className="text-[#F5F5F7] font-medium">{LAST_CHEMICAL_TIMES.find(t => t.value === formData.lastChemicalService)?.label || '—'}</span>
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
              {formData.chemicalHistory.length > 0 && (
                <div className="text-sm">
                  <span className="text-white/40">Chemical History:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.chemicalHistory.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20"
                      >
                        {CHEMICAL_HISTORY.find((h) => h.value === c)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {formData.sensitivities.length > 0 && (
                <div className="text-sm">
                  <span className="text-white/40">Sensitivities:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.sensitivities.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                      >
                        {SENSITIVITIES.find((h) => h.value === c)?.label}
                      </span>
                    ))}
                  </div>
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
            <div className="flex gap-3">
              <Button
                onClick={handleSaveClient}
                disabled={saving}
                variant="outline"
                className="border-white/10 text-[#F5F5F7] hover:bg-white/5 hover:text-[#F5F5F7]"
              >
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Save Client
              </Button>
              <Button
                onClick={handleSaveAndFormulate}
                disabled={saving}
                className="bg-gradient-to-r from-[#9333EA] to-[#0D9488] hover:opacity-90 text-white font-semibold"
              >
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Save & Formulate →
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
