'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


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
  { value: 'N', label: 'Natural' },
  { value: 'A', label: 'Ash' },
  { value: 'G', label: 'Gold' },
  { value: 'R', label: 'Red' },
  { value: 'V', label: 'Violet' },
  { value: 'K', label: 'Copper' },
  { value: 'B', label: 'Beige' },
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

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === currentStep
                ? 'bg-[#A855F7] text-white'
                : step < currentStep
                ? 'bg-[#A855F7]/30 text-[#A855F7]'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-12 h-0.5 rounded-full transition-colors ${
                step < currentStep ? 'bg-[#A855F7]/50' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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
    if (step === 2) {
      return true
    }
    if (step === 3) {
      return true
    }
    return true
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
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="e.g., Jennifer Smith"
                value={formData.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salonNotes">Salon Notes</Label>
              <textarea
                id="salonNotes"
                rows={4}
                placeholder="Allergies, past treatments, stylist observations..."
                value={formData.salonNotes}
                onChange={(e) => updateField('salonNotes', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 ring-offset-[#0A0A1A]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Current Level</Label>
                <span className="text-[#A855F7] font-bold text-lg">{formData.currentLevel}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.currentLevel}
                onChange={(e) => updateField('currentLevel', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${(formData.currentLevel - 1) * 11.11}%, rgba(255,255,255,0.1) ${(formData.currentLevel - 1) * 11.11}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1 (Black)</span>
                <span>10 (Lightest Blonde)</span>
              </div>
            </div>

            <div>
              <Label htmlFor="currentTone">Current Tone</Label>
              <Select
                value={formData.currentTone}
                onValueChange={(value) => updateField('currentTone', value)}
              >
                <SelectTrigger className="mt-1.5 w-full bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-white/10">
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-white focus:bg-[#A855F7]/20 focus:text-white">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Hair Condition</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HAIR_CONDITIONS.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.hairCondition.includes(c.id)
                        ? 'border-[#A855F7]/50 bg-[#A855F7]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`cond-${c.id}`}
                      checked={formData.hairCondition.includes(c.id)}
                      onChange={() => toggleCondition(c.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#A855F7] accent-[#A855F7] focus:ring-[#A855F7] focus:ring-offset-[#0A0A1A]"
                    />
                    <span className="text-sm text-white/80">{c.label}</span>
                  </label>
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
                <Label>Target Level</Label>
                <span className="text-[#EC4899] font-bold text-lg">{formData.targetLevel}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.targetLevel}
                onChange={(e) => updateField('targetLevel', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #EC4899 0%, #EC4899 ${(formData.targetLevel - 1) * 11.11}%, rgba(255,255,255,0.1) ${(formData.targetLevel - 1) * 11.11}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1 (Black)</span>
                <span>10 (Lightest Blonde)</span>
              </div>
            </div>

            <div>
              <Label htmlFor="targetTone">Target Tone</Label>
              <Select
                value={formData.targetTone}
                onValueChange={(value) => updateField('targetTone', value)}
              >
                <SelectTrigger className="mt-1.5 w-full bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-white/10">
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-white focus:bg-[#A855F7]/20 focus:text-white">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="brandPreference">Brand Preference</Label>
                <Input
                  id="brandPreference"
                  placeholder="e.g., Wella, Redken"
                  value={formData.brandPreference}
                  onChange={(e) => updateField('brandPreference', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <Label htmlFor="linePreference">Line Preference</Label>
                <Input
                  id="linePreference"
                  placeholder="e.g., Koleston Perfect"
                  value={formData.linePreference}
                  onChange={(e) => updateField('linePreference', e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests / Notes</Label>
              <textarea
                id="specialRequests"
                rows={3}
                placeholder="Any additional details, preferences, or concerns..."
                value={formData.specialRequests}
                onChange={(e) => updateField('specialRequests', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 ring-offset-[#0A0A1A]"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Client Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Name:</span>{' '}
                  <span className="text-white font-medium">{formData.clientName || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Phone:</span>{' '}
                  <span className="text-white font-medium">{formData.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-white/40">Email:</span>{' '}
                  <span className="text-white font-medium">{formData.email || '—'}</span>
                </div>
              </div>
              {formData.salonNotes && (
                <div className="text-sm">
                  <span className="text-white/40">Salon Notes:</span>
                  <p className="text-white/70 mt-1">{formData.salonNotes}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Current Hair State</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Level:</span>{' '}
                  <span className="text-white font-medium">{formData.currentLevel}</span>
                </div>
                <div>
                  <span className="text-white/40">Tone:</span>{' '}
                  <span className="text-white font-medium">
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
                        className="px-2 py-1 rounded-full text-xs bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/20"
                      >
                        {HAIR_CONDITIONS.find((h) => h.id === c)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Desired Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Target Level:</span>{' '}
                  <span className="text-white font-medium">{formData.targetLevel}</span>
                </div>
                <div>
                  <span className="text-white/40">Target Tone:</span>{' '}
                  <span className="text-white font-medium">
                    {TONES.find((t) => t.value === formData.targetTone)?.label || formData.targetTone}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Brand:</span>{' '}
                  <span className="text-white font-medium">{formData.brandPreference || 'Any'}</span>
                </div>
                <div>
                  <span className="text-white/40">Line:</span>{' '}
                  <span className="text-white font-medium">{formData.linePreference || 'Any'}</span>
                </div>
              </div>
              {formData.specialRequests && (
                <div className="text-sm">
                  <span className="text-white/40">Special Requests:</span>
                  <p className="text-white/70 mt-1">{formData.specialRequests}</p>
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
    <div className="min-h-screen bg-[#0A0A1A] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">
            New Consultation
          </h1>
          <p className="text-white/50 mt-2">Walk through a professional color consultation with your client</p>
        </div>

        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        <Card className="bg-[#0F0F2A]/80 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {step === 1 && 'Client Profile'}
              {step === 2 && 'Current Hair State'}
              {step === 3 && 'Desired Result'}
              {step === 4 && 'Review & Submit'}
            </CardTitle>
            <CardDescription className="text-white/50">
              {step === 1 && 'Enter your client\'s basic information'}
              {step === 2 && 'Document the current hair condition'}
              {step === 3 && 'Define the target color and preferences'}
              {step === 4 && 'Review all details before creating the formula'}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="border-white/10 text-white hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            ← Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-[#A855F7] hover:bg-[#A855F7]/90 text-white disabled:opacity-30"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] hover:opacity-90 text-white font-semibold"
            >
              Create Formula →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
