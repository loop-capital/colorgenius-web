'use client'
import { useState } from 'react'
import { HairSwatch } from '@/components/ui/hair-swatch'
import { ColorCircle } from '@/components/ui/color-circle'
import { HAIR_LEVELS } from '@/lib/products'

export default function FormulatePage() {
  const [step, setStep] = useState(1)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F5F5F7', padding: 32 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Formulate — Step {step} of 5</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: s === step ? '#9333EA' : s < step ? 'rgba(147,51,234,0.3)' : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14
          }}>{s}</div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
          <h2>📸 Step 1: Photo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <button onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.capture='environment'; i.click() }}
              style={{ padding: 32, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(147,51,234,0.05)', color: '#F5F5F7', cursor: 'pointer', fontSize: 16 }}>
              📷 Take Photo
            </button>
            <button onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.click() }}
              style={{ padding: 32, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(245,158,11,0.05)', color: '#F5F5F7', cursor: 'pointer', fontSize: 16 }}>
              📁 Upload Photo
            </button>
          </div>
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button onClick={() => { console.log('STEP 1 → 2'); setStep(2) }}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
              Next: Hair Assessment →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
          <h2 style={{ marginBottom: 16 }}>✨ Step 2: Hair Assessment</h2>

          <div style={{ marginBottom: 24 }}>
            <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Current Level</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(HAIR_LEVELS).map(([level, info]) => (
                <HairSwatch key={level} color={info.hex} label={info.name} level={Number(level)} isActive={false} onClick={() => console.log('Level:', level)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Current Tone</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
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
              ].map((tone) => (
                <ColorCircle key={tone.value} color={tone.color} label={tone.label} isActive={false} onClick={() => console.log('Tone:', tone.value)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Gray Coverage</p>
            <input type="range" min={0} max={100} defaultValue={0} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#71717A' }}>
              <span>No gray</span><span>Partial</span><span>Full coverage needed</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.12)', color: '#A1A1AA', borderRadius: 12, cursor: 'pointer', background: 'transparent', fontSize: 14 }}>
              ← Back
            </button>
            <button onClick={() => { console.log('STEP 2 → 3'); setStep(3) }}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
              Next: Target Look →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
          <h2>🎨 Step 3: Target Look</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(2)} style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.12)', color: '#A1A1AA', borderRadius: 12, cursor: 'pointer', background: 'transparent', fontSize: 14 }}>← Back</button>
            <button onClick={() => { console.log('STEP 3 → 4'); setStep(4) }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>Generate Formula →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
          <h2>📋 Step 4: Condition</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(3)} style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.12)', color: '#A1A1AA', borderRadius: 12, cursor: 'pointer', background: 'transparent', fontSize: 14 }}>← Back</button>
            <button onClick={() => { console.log('STEP 4 → 5'); setStep(5) }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>View Results →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
          <h2>✅ Step 5: Results</h2>
          <p style={{ color: '#A1A1AA', marginTop: 8 }}>Formula ready!</p>
          <button onClick={() => setStep(1)} style={{ marginTop: 16, padding: '12px 24px', background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>Start Over</button>
        </div>
      )}
    </div>
  )
}
