'use client'

import { useState } from 'react'
import { HAIR_LEVELS } from '@/lib/products'
import { HairSwatch } from '@/components/ui/hair-swatch'
import { ColorCircle } from '@/components/ui/color-circle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ColorWheel3D } from '@/components/custom'
import { ScaleWidget } from '@/components/scale-widget'
import { Camera, Upload, X, Sparkles, Droplets, FlaskConical, ChevronRight, ChevronLeft, RotateCcw, Save, AlertTriangle } from 'lucide-react'
import type { ToneFamily } from '@/lib/products'

const STEPS = [
  { id: 1, title: 'Photo', desc: 'Capture or upload hair photo' },
  { id: 2, title: 'Hair Assessment', desc: 'Current color, tone & condition' },
  { id: 3, title: 'Target Look', desc: 'Desired color result' },
  { id: 4, title: 'Condition', desc: 'Hair health & history' },
  { id: 5, title: 'Results', desc: 'Your custom formula' },
]

const POROSITY = [
  { value: 'low', label: 'Low', color: '#9333EA' },
  { value: 'normal', label: 'Normal', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
]

const CONDITION_TYPES = [
  { value: 'virgin', label: 'Virgin Hair', desc: 'Never chemically treated' },
  { value: 'previously_colored', label: 'Previously Colored', desc: 'Has existing color' },
  { value: 'bleached', label: 'Bleached/Lightened', desc: 'Lifted from natural' },
  { value: 'damaged', label: 'Damaged', desc: 'Over-processed or dry' },
]

const TONES = [
  { value: 'N', label: 'Natural', color: '#9C8B7A' }, { value: 'A', label: 'Ash', color: '#8A7D6E' },
  { value: 'G', label: 'Gold', color: '#C4A35A' }, { value: 'K', label: 'Copper', color: '#B87333' },
  { value: 'R', label: 'Red', color: '#A03030' }, { value: 'V', label: 'Violet', color: '#7B68A6' },
  { value: 'P', label: 'Pearl', color: '#B8B0C4' }, { value: 'B', label: 'Beige', color: '#C4B5A0' },
  { value: 'M', label: 'Mahogany', color: '#6B3A3A' }, { value: 'Ch', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'W', label: 'Warm', color: '#D4A574' }, { value: 'C', label: 'Cool', color: '#7D8B9A' },
]

const BRANDS = ['Davines', 'Wella', 'Schwarzkopf', 'Redken', 'Matrix', 'Joico', 'Paul Mitchell', 'Pulp Riot', 'Goldwell']

const toneMap: Record<string, ToneFamily> = { N: 'neutral', A: 'ash', G: 'golden', R: 'red', V: 'violet', K: 'copper', B: 'beige', P: 'pearl', M: 'mahogany', Ch: 'chocolate', W: 'warm', C: 'cool' }
const revToneMap: Record<string, string> = { neutral: 'N', ash: 'A', golden: 'G', red: 'R', violet: 'V', copper: 'K', beige: 'B', pearl: 'P', mahogany: 'M', chocolate: 'Ch', warm: 'W', cool: 'C' }

const card = { background: 'rgba(30,30,45,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 32px' }
const btnPrimary = { padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold' as const, cursor: 'pointer' as const, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnOutline = { padding: '12px 24px', border: '1px solid rgba(255,255,255,0.12)', color: '#A1A1AA', borderRadius: 12, cursor: 'pointer' as const, background: 'transparent', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }

export default function FormulatePage() {
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [fd, setFd] = useState({
    currentLevel: 5, currentTone: 'N', targetLevel: 7, targetTone: 'N',
    condition: { type: 'previously_colored', porosity: 'normal', grayPercent: 0, highlights: false, highlightedPercent: 0 },
    brandPreference: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/formulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) })
      if (!res.ok) throw new Error('Formulation failed')
      const data = await res.json()
      setResult(data.data)
      setStep(5)
    } catch (e: any) { alert(e.message) }
    setLoading(false)
  }

  const lvlDiff = fd.targetLevel - fd.currentLevel

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F5F5F7', padding: '16px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create <span style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Formulation</span></h1>
            <p style={{ color: '#A1A1AA', fontSize: 14 }}>Build a professional color formula in 5 steps</p>
          </div>
          <button type="button" onClick={() => { setFd({ currentLevel: 5, currentTone: 'N', targetLevel: 7, targetTone: 'N', condition: { type: 'previously_colored', porosity: 'normal', grayPercent: 0, highlights: false, highlightedPercent: 0 }, brandPreference: '' }); setResult(null); setPhoto(null); setStep(1) }} style={btnOutline}><RotateCcw size={14} /> Reset</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.id === step ? '#9333EA' : s.id < step ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto', fontSize: 14 }}>{s.id < step ? '✓' : s.id}</div>
                <p style={{ fontSize: 11, marginTop: 4, color: s.id === step ? '#F5F5F7' : '#71717A', fontWeight: s.id === step ? 600 : 400 }}>{s.title}</p>
                <p style={{ fontSize: 9, color: '#71717A', marginTop: 1 }}>{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: s.id < step ? 'rgba(147,51,234,0.4)' : 'rgba(255,255,255,0.06)', flexShrink: 0, marginTop: -20 }} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Photo */}
        {step === 1 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Camera style={{ color: '#9333EA' }} /> Capture Hair Photo</h2>
            <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 16 }}>Take a clear photo of the client's current hair. Wet or dry both work.</p>
            {photo ? (
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
                <img src={photo} alt="Hair" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
                <button type="button" onClick={() => setPhoto(null)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <button type="button" onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.capture='environment'; i.onchange=(e:any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(f) }}; i.click() }}
                  style={{ padding: 32, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(147,51,234,0.05)', color: '#F5F5F7', cursor: 'pointer', fontSize: 16, textAlign: 'center' }}>
                  <Camera style={{ width: 28, height: 28, color: '#9333EA', margin: '0 auto 8px', display: 'block' }} /> Take Photo
                </button>
                <button type="button" onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(f) }}; i.click() }}
                  style={{ padding: 32, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(245,158,11,0.05)', color: '#F5F5F7', cursor: 'pointer', fontSize: 16, textAlign: 'center' }}>
                  <Upload style={{ width: 28, height: 28, color: '#F59E0B', margin: '0 auto 8px', display: 'block' }} /> Upload Photo
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: '#71717A' }}>{photo ? 'Photo captured ✓' : 'Photo is optional — skip to continue'}</p>
              <button type="button" onClick={() => setStep(2)} style={btnPrimary}>{photo ? 'Next: Hair Assessment' : 'Skip to Assessment'} <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 2: Hair Assessment */}
        {step === 2 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles style={{ color: '#9333EA' }} /> Current Hair Color</h2>
            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Current Level</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(HAIR_LEVELS).map(([l, i]) => <HairSwatch key={l} color={i.hex} label={i.name} level={Number(l)} isActive={fd.currentLevel === Number(l)} onClick={() => setFd(p => ({ ...p, currentLevel: Number(l) }))} />)}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Current Tone</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <ColorWheel3D tones={TONES.map(t => ({ value: t.value as ToneFamily, label: t.label, color: t.color }))} selected={toneMap[fd.currentTone] || 'neutral'} onSelect={(val) => setFd(p => ({ ...p, currentTone: revToneMap[val] || 'N' }))} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {TONES.map(t => <ColorCircle key={t.value} color={t.color} label={t.label} isActive={fd.currentTone === t.value} onClick={() => setFd(p => ({ ...p, currentTone: t.value }))} />)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button type="button" onClick={() => setStep(1)} style={btnOutline}><ChevronLeft size={16} /> Back</button>
              <button type="button" onClick={() => setStep(3)} style={btnPrimary}>Next: Target Look <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 3: Target Look */}
        {step === 3 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles style={{ color: '#F59E0B' }} /> Target Look</h2>
            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Target Level</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(HAIR_LEVELS).map(([l, i]) => <HairSwatch key={l} color={i.hex} label={i.name} level={Number(l)} isActive={fd.targetLevel === Number(l)} onClick={() => setFd(p => ({ ...p, targetLevel: Number(l) }))} />)}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Target Tone</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TONES.slice(0, 7).map(t => <ColorCircle key={t.value} color={t.color} label={t.label} isActive={fd.targetTone === t.value} onClick={() => setFd(p => ({ ...p, targetTone: t.value }))} />)}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Brand Preference (Optional)</Label>
              <Select value={fd.brandPreference} onValueChange={v => setFd(p => ({ ...p, brandPreference: v }))}>
                <SelectTrigger style={{ background: 'rgba(30,30,45,0.6)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F5F7', width: '100%' }}><SelectValue placeholder="Select a brand or leave empty" /></SelectTrigger>
                <SelectContent style={{ background: 'rgba(30,30,45,0.9)' }}><SelectItem value="">Any brand</SelectItem>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, background: 'rgba(30,30,45,0.6)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: HAIR_LEVELS[fd.currentLevel]?.hex, border: '2px solid rgba(255,255,255,0.08)' }} />
              <div style={{ fontSize: 12, color: '#71717A' }}>Level {fd.currentLevel} → Level {fd.targetLevel} ({lvlDiff > 0 ? '+' : ''}{lvlDiff})</div>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: HAIR_LEVELS[fd.targetLevel]?.hex, border: '2px solid rgba(147,51,234,0.4)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(2)} style={btnOutline}><ChevronLeft size={16} /> Back</button>
              <button type="button" onClick={() => setStep(4)} style={btnPrimary}>Next: Condition <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 4: Condition */}
        {step === 4 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Droplets style={{ color: '#9333EA' }} /> Hair Condition</h2>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 24 }}>Pre-filled from consultation or prior service. Review and update as needed.</p>

            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Hair Type</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {CONDITION_TYPES.map(o => (
                  <button type="button" key={o.value} onClick={() => setFd(p => ({ ...p, condition: { ...p.condition, type: o.value } }))}
                    style={{ padding: 16, borderRadius: 12, border: fd.condition.type === o.value ? '1px solid rgba(147,51,234,0.4)' : '1px solid rgba(255,255,255,0.06)', background: fd.condition.type === o.value ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)', color: fd.condition.type === o.value ? '#9333EA' : '#F5F5F7', cursor: 'pointer', textAlign: 'left' }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</p>
                    <p style={{ fontSize: 12, color: '#71717A', marginTop: 4 }}>{o.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Porosity</Label>
              <div style={{ display: 'flex', gap: 12 }}>
                {POROSITY.map(o => (
                  <button type="button" key={o.value} onClick={() => setFd(p => ({ ...p, condition: { ...p.condition, porosity: o.value } }))}
                    style={{ flex: 1, padding: 16, borderRadius: 12, border: fd.condition.porosity === o.value ? '1px solid rgba(147,51,234,0.4)' : '1px solid rgba(255,255,255,0.06)', background: fd.condition.porosity === o.value ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: o.color, margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 14, color: fd.condition.porosity === o.value ? '#F5F5F7' : '#A1A1AA' }}>{o.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Label style={{ color: '#F5F5F7', fontSize: 14, fontWeight: 600 }}>Gray Coverage</Label>
                <span style={{ color: '#F5F5F7', fontWeight: 'bold' }}>{fd.condition.grayPercent}%</span>
              </div>
              <input type="range" min={0} max={100} value={fd.condition.grayPercent} onChange={e => setFd(p => ({ ...p, condition: { ...p.condition, grayPercent: Number(e.target.value) } }))} style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#71717A', marginTop: 4 }}><span>No gray</span><span>Partial</span><span>Full coverage needed</span></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="hl" checked={fd.condition.highlights} onChange={e => setFd(p => ({ ...p, condition: { ...p.condition, highlights: e.target.checked } }))} style={{ accentColor: '#9333EA' }} />
              <label htmlFor="hl" style={{ fontSize: 14, color: '#F5F5F7', cursor: 'pointer' }}>Highlights Present</label>
            </div>

            {/* Consultation Summary */}
            <div style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 10, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Consultation Summary</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
                <div><span style={{ display: 'block', fontSize: 11, color: '#71717A' }}>Current</span><span>Level {fd.currentLevel} {fd.currentTone}</span></div>
                <div><span style={{ display: 'block', fontSize: 11, color: '#71717A' }}>Target</span><span style={{ color: '#9333EA' }}>Level {fd.targetLevel} {fd.targetTone}</span></div>
                <div><span style={{ display: 'block', fontSize: 11, color: '#71717A' }}>Condition</span><span style={{ textTransform: 'capitalize' }}>{fd.condition.type.replace('_', ' ')}</span></div>
                <div><span style={{ display: 'block', fontSize: 11, color: '#71717A' }}>Gray</span><span>{fd.condition.grayPercent}%</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(3)} style={btnOutline}><ChevronLeft size={16} /> Back</button>
              <button type="button" onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                {loading ? <><Sparkles className="animate-spin" size={16} /> Generating...</> : <>Generate Formula <FlaskConical size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Results */}
        {step === 5 && result && (
          <div style={{ ...card, padding: 32 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>✅ Your Formula</h2>
            {result.warnings?.map((w: string, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FBBF24', marginBottom: 8 }}><AlertTriangle size={16} /><span>{w}</span></div>)}
            <div style={{ background: 'rgba(22,22,32,0.8)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <p style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{result.brand} {result.line}</p>
              {result.steps?.filter((s: any) => s.role === 'primary' || s.role === 'secondary').map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: HAIR_LEVELS[s.product?.level]?.hex || '#7D5038', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span>{s.product?.shadeCode} — {s.product?.shadeName}</span>
                </div>
              ))}
              <p style={{ color: '#A1A1AA', marginTop: 8 }}>Developer: {result.developerVolume}Vol · Processing: {result.processingTime}min</p>
              {result.notes?.map((n: string, i: number) => <p key={i} style={{ color: '#A1A1AA', fontSize: 13, marginTop: 4 }}>• {n}</p>)}
            </div>
            <ScaleWidget onWeightCapture={(g) => console.log('Weight:', g)} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" onClick={() => { setResult(null); setStep(1) }} style={{ ...btnOutline, flex: 1, justifyContent: 'center' }}><RotateCcw size={14} /> New Formula</button>
              <button type="button" onClick={() => alert('Saved!')} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}><Save size={14} /> Save to Library</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
