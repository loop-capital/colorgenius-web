'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const HAIR_TEXTURE_OPTIONS = [
  { value: 'fine', label: 'Fine', desc: 'Thin strands, easy to process' },
  { value: 'medium', label: 'Medium', desc: 'Average thickness, standard processing' },
  { value: 'coarse', label: 'Coarse', desc: 'Thick strands, may need longer processing' },
];

const SCALP_CONDITION_OPTIONS = [
  { value: 'normal', label: 'Normal', desc: 'No sensitivities' },
  { value: 'sensitive', label: 'Sensitive', desc: 'Prone to irritation' },
  { value: 'dry', label: 'Dry', desc: 'Flaky or tight scalp' },
  { value: 'oily', label: 'Oily', desc: 'Excess sebum' },
];

const SERVICE_TYPE_OPTIONS = [
  { value: 'root_touchup', label: 'Root Touch-Up', desc: 'New growth only' },
  { value: 'full_color', label: 'Full Color', desc: 'Entire head' },
  { value: 'highlights', label: 'Highlights', desc: 'Partial lightening' },
  { value: 'balayage', label: 'Balayage', desc: 'Hand-painted highlights' },
  { value: 'corrective', label: 'Corrective', desc: 'Fix previous color' },
  { value: 'gloss', label: 'Gloss/Toner', desc: 'Refresh existing color' },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1: Client info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    // Step 2: Hair history
    has_straightening: false,
    straightening_date: '',
    has_perm: false,
    perm_date: '',
    has_metallic_dye: false,
    has_henna: false,
    has_allergy: false,
    allergy_details: '',
    // Step 3: Hair profile
    texture: 'medium',
    porosity: 'normal',
    scalp_condition: 'normal',
    gray_percentage: 0,
    // Step 4: Service
    service_type: 'full_color',
    target_level: 6,
    target_tone: 'N',
    preferred_brand: '',
    is_virgin: false,
    previous_color_date: '',
    previous_color_brand: '',
    // Step 5: Notes
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    // Store form in sessionStorage for formulate page
    sessionStorage.setItem('cg_questionnaire', JSON.stringify(form));
    await new Promise((r) => setTimeout(r, 500)); // Simulate save
    setSaving(false);
    router.push('/formulate');
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div className="container-md">
          {/* Header */}
          <div style={styles.header}>
            <button onClick={() => step > 1 && setStep(step - 1)} style={styles.backBtn}>
              ← Back
            </button>
            <div>
              <h1 style={styles.title}>Client Questionnaire</h1>
              <p style={styles.subtitle}>Step {step} of 5 — All fields affect formulation accuracy</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          {/* Form card */}
          <div className="card" style={styles.card}>
            <div className="card-body">

              {/* STEP 1: Client Info */}
              {step === 1 && (
                <div style={styles.step}>
                  <h2 style={styles.stepTitle}>Client Information</h2>
                  <p style={styles.stepDesc}>Basic contact details for records</p>

                  <div style={styles.grid2}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" value={form.first_name}
                        onChange={(e) => update('first_name', e.target.value)} placeholder="Jane" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" value={form.last_name}
                        onChange={(e) => update('last_name', e.target.value)} placeholder="Smith" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" type="email" value={form.email}
                      onChange={(e) => update('email', e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Phone (optional)</label>
                    <input className="form-input" type="tel" value={form.phone}
                      onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                </div>
              )}

              {/* STEP 2: Treatment History */}
              {step === 2 && (
                <div style={styles.step}>
                  <h2 style={styles.stepTitle}>Treatment History</h2>
                  <p style={styles.stepDesc}>Critical for formulation safety — these are hard stops</p>

                  <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                    ⚠️ Metallic dyes and henna require corrective treatment before coloring.
                    Previous chemical treatments affect developer selection.
                  </div>

                  <div style={styles.toggleGroup}>
                    {[
                      { key: 'has_straightening', label: 'Hair straightening (keratin, relaxer, Japanese)' },
                      { key: 'has_perm', label: 'Perm or body wave' },
                      { key: 'has_metallic_dye', label: 'Metallic-based dye (silver, gray, black)' },
                      { key: 'has_henna', label: 'Henna dye' },
                      { key: 'has_allergy', label: 'Known PPD or color allergies' },
                    ].map((item) => (
                      <div key={item.key} style={styles.toggleItem}
                        onClick={() => update(item.key, !form[item.key as keyof typeof form])}>
                        <div style={{
                          ...styles.checkbox,
                          background: form[item.key as keyof typeof form] ? 'var(--color-primary)' : 'white',
                          borderColor: form[item.key as keyof typeof form] ? 'var(--color-primary)' : 'var(--color-border)',
                        }}>
                          {form[item.key as keyof typeof form] && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={styles.toggleLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {form.has_allergy && (
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">Allergy Details</label>
                      <input className="form-input" value={form.allergy_details}
                        onChange={(e) => update('allergy_details', e.target.value)}
                        placeholder="Describe the reaction or product" />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Hair Profile */}
              {step === 3 && (
                <div style={styles.step}>
                  <h2 style={styles.stepTitle}>Hair Profile</h2>
                  <p style={styles.stepDesc}>Observed characteristics that affect processing</p>

                  <div className="form-group">
                    <label className="form-label">Hair Texture</label>
                    <div style={styles.optionGrid}>
                      {HAIR_TEXTURE_OPTIONS.map((opt) => (
                        <div key={opt.value} style={{
                          ...styles.optionCard,
                          borderColor: form.texture === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                          background: form.texture === opt.value ? 'rgb(99 102 241 / 0.05)' : 'white',
                        }} onClick={() => update('texture', opt.value)}>
                          <span style={{ fontWeight: 600 }}>{opt.label}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Porosity</label>
                    <select className="form-select" value={form.porosity}
                      onChange={(e) => update('porosity', e.target.value)}>
                      <option value="low">Low (Hard to process — resistant)</option>
                      <option value="normal">Normal (Standard processing)</option>
                      <option value="high">High (Processes quickly — fragile)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Scalp Condition</label>
                    <div style={styles.optionGrid}>
                      {SCALP_CONDITION_OPTIONS.map((opt) => (
                        <div key={opt.value} style={{
                          ...styles.optionCard,
                          borderColor: form.scalp_condition === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                          background: form.scalp_condition === opt.value ? 'rgb(99 102 241 / 0.05)' : 'white',
                        }} onClick={() => update('scalp_condition', opt.value)}>
                          <span style={{ fontWeight: 600 }}>{opt.label}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Gray Coverage Needed: {form.gray_percentage}%</label>
                    <input type="range" min="0" max="100" step="5" value={form.gray_percentage}
                      onChange={(e) => update('gray_percentage', parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Service Details */}
              {step === 4 && (
                <div style={styles.step}>
                  <h2 style={styles.stepTitle}>Service & Target</h2>
                  <p style={styles.stepDesc}>What the client wants to achieve</p>

                  <div className="form-group">
                    <label className="form-label">Service Type</label>
                    <div style={styles.optionGrid}>
                      {SERVICE_TYPE_OPTIONS.map((opt) => (
                        <div key={opt.value} style={{
                          ...styles.optionCard,
                          borderColor: form.service_type === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                          background: form.service_type === opt.value ? 'rgb(99 102 241 / 0.05)' : 'white',
                        }} onClick={() => update('service_type', opt.value)}>
                          <span style={{ fontWeight: 600 }}>{opt.label}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.grid2, marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Target Level (1-10)</label>
                      <select className="form-select" value={form.target_level}
                        onChange={(e) => update('target_level', parseInt(e.target.value))}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                          <option key={l} value={l}>Level {l} — {['Black', 'Darkest Brown', 'Dark Brown', 'Dark Chestnut', 'Chestnut', 'Dark Blonde', 'Medium Blonde', 'Light Blonde', 'Very Light Blonde', 'Lightest Blonde'][l - 1]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Tone</label>
                      <select className="form-select" value={form.target_tone}
                        onChange={(e) => update('target_tone', e.target.value)}>
                        <option value="N">Natural</option>
                        <option value="A">Ash (Cool)</option>
                        <option value="G">Gold (Warm)</option>
                        <option value="R">Red</option>
                        <option value="V">Violet</option>
                        <option value="K">Copper</option>
                        <option value="B">Beige</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Preferred Brand (optional)</label>
                    <select className="form-select" value={form.preferred_brand}
                      onChange={(e) => update('preferred_brand', e.target.value)}>
                      <option value="">No preference</option>
                      <option value="Redken">Redken</option>
                      <option value="Wella Koleston Perfect ME">Wella Koleston Perfect ME</option>
                      <option value="Schwarzkopf Igora Royal">Schwarzkopf Igora Royal</option>
                      <option value="Matrix SoColor">Matrix SoColor</option>
                      <option value="Joico">Joico</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}
                    onClick={() => update('is_virgin', !form.is_virgin)}>
                    <div style={{
                      ...styles.checkbox,
                      width: 24, height: 24,
                      background: form.is_virgin ? 'var(--color-primary)' : 'white',
                      borderColor: form.is_virgin ? 'var(--color-primary)' : 'var(--color-border)',
                    }}>
                      {form.is_virgin && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>Virgin hair (no previous color)</span>
                  </div>
                </div>
              )}

              {/* STEP 5: Notes */}
              {step === 5 && (
                <div style={styles.step}>
                  <h2 style={styles.stepTitle}>Additional Notes</h2>
                  <p style={styles.stepDesc}>Anything else that affects the service</p>

                  <div className="form-group">
                    <label className="form-label">Stylist Notes</label>
                    <textarea
                      className="form-input"
                      rows={6}
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      placeholder="Consultation notes, client preferences, observations..."
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Summary */}
                  <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Form Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Client:</span>
                      <span>{form.first_name} {form.last_name}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>Texture:</span>
                      <span style={{ textTransform: 'capitalize' }}>{form.texture}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>Service:</span>
                      <span>{SERVICE_TYPE_OPTIONS.find(o => o.value === form.service_type)?.label}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>Target:</span>
                      <span>Level {form.target_level} / {form.target_tone}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>Gray:</span>
                      <span>{form.gray_percentage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={styles.nav}>
                {step > 1 ? (
                  <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Previous</button>
                ) : <div />}

                {step < 5 ? (
                  <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                    Continue →
                  </button>
                ) : (
                  <button className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Saving...' : 'Generate Formulation →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: 'calc(100vh - 65px)', padding: '2rem 0 4rem' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0.25rem', marginTop: '0.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' },
  subtitle: { fontSize: '0.875rem', color: 'var(--color-text-muted)' },
  progressBar: { height: 4, background: 'var(--color-border)', borderRadius: 2, marginBottom: '2rem', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--color-primary)', borderRadius: 2, transition: 'width 0.3s ease' },
  card: { },
  step: { },
  stepTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' },
  stepDesc: { fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  toggleGroup: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  toggleItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', transition: 'background 0.15s' },
  checkbox: { width: 20, height: 20, borderRadius: 4, border: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  toggleLabel: { fontSize: '0.9375rem', color: 'var(--color-text)' },
  optionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' },
  optionCard: { padding: '0.875rem', borderRadius: 'var(--radius-md)', border: 2, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.15s' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' },
};