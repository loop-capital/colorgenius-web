'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, User, FlaskConical, DollarSign, Check, Save,
  Search, Plus, Clock, Camera, Star, Sparkles, X, Scale,
} from 'lucide-react';
import { CostCalculator } from '@/components/custom/cost-calculator';
import { deductFormulaFromInventory } from '@/components/custom/inventory-dashboard';
import { ScaleWidget } from '@/components/scale-widget';

const STEPS = [
  { id: 0, title: 'Client', icon: User },
  { id: 1, title: 'Service', icon: Sparkles },
  { id: 2, title: 'Formula', icon: FlaskConical },
  { id: 3, title: 'Review', icon: DollarSign },
];

const SERVICE_TYPES = [
  { value: 'root-touch', label: 'Root Touch-Up', time: 45 },
  { value: 'full-color', label: 'Full Color', time: 60 },
  { value: 'highlights', label: 'Highlights', time: 90 },
  { value: 'balayage', label: 'Balayage', time: 120 },
  { value: 'toner', label: 'Toner / Glaze', time: 30 },
  { value: 'color-correction', label: 'Color Correction', time: 150 },
  { value: 'bleach', label: 'Bleach', time: 90 },
  { value: 'gloss', label: 'Gloss Treatment', time: 25 },
];

interface Client {
  id: string;
  name: string;
  email?: string;
  lastVisit?: string;
}

interface FormulaStep {
  product: { shadeCode: string; shadeName: string; brand?: string; level?: number };
  grams: number;
  role: string;
}

function ServiceEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [serviceType, setServiceType] = useState('');
  const [serviceTime, setServiceTime] = useState(0);
  const [formulaSteps, setFormulaSteps] = useState<FormulaStep[]>([]);
  const [developerMl, setDeveloperMl] = useState(60);
  const [brand, setBrand] = useState('Wella');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingFormula, setLoadingFormula] = useState(false);

  // Shade input for formula step
  const [shadeCode, setShadeCode] = useState('');
  const [shadeName, setShadeName] = useState('');
  const [shadeGrams, setShadeGrams] = useState(30);
  const [shadeRole, setShadeRole] = useState('Primary');

  // Load clients from API
  useEffect(() => {
    fetch('/api/clients').then(r => r.ok ? r.json() : { clients: [] }).then(d => {
      setClients(d.clients || []);
    }).catch(() => {});
  }, []);

  // Pre-select client from URL
  useEffect(() => {
    if (preselectedClientId && clients.length > 0) {
      const found = clients.find(c => c.id === preselectedClientId);
      if (found) setSelectedClient(found);
    }
  }, [preselectedClientId, clients]);

  // Load formula from URL
  useEffect(() => {
    if (!preselectedFormulaId) return;
    setLoadingFormula(true);
    fetch(`/api/v1/formulas/${preselectedFormulaId}`)
      .then(r => r.ok ? r.json() : null)
      .then(formula => {
        if (formula) {
          setBrand(formula.brand || 'Wella');
          setDeveloperMl(formula.developerVolume || 60);
          if (formula.shadeCode) {
            setFormulaSteps([{
              product: { 
                shadeCode: formula.shadeCode, 
                shadeName: formula.shadeName || formula.shadeCode,
                brand: formula.brand 
              },
              grams: 30,
              role: 'Primary',
            }]);
          }
          if (formula.processingTime) setServiceTime(formula.processingTime);
          if (formula.notes) setNotes(formula.notes);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFormula(false));
  }, [preselectedFormulaId]);

  const filteredClients = clients.filter(c =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const addShade = () => {
    if (!shadeCode) return;
    setFormulaSteps(prev => [...prev, {
      product: { shadeCode, shadeName, brand },
      grams: shadeGrams,
      role: shadeRole,
    }]);
    setShadeCode('');
    setShadeName('');
    setShadeGrams(30);
  };

  const removeShade = (idx: number) => {
    setFormulaSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedClient || !serviceType || formulaSteps.length === 0) return;
    setSaving(true);
    try {
      // Create formulation
      const formRes = await fetch('/api/v1/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          serviceType,
          brand,
          primaryFormula: { steps: formulaSteps, developer: { volume: 20, ml: developerMl } },
          processingInstructions: { time: serviceTime, notes },
          stylistNotes: notes,
        }),
      });
      if (!formRes.ok) throw new Error('Failed to save formula');

      // Deduct from inventory
      deductFormulaFromInventory(formulaSteps);

      setSaved(true);
      setTimeout(() => router.push('/clients/' + selectedClient.id), 1500);
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--cg-text-secondary)' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
              New <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Color Service</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Quick service entry — {STEPS[step].title}</p>
          </div>
        </div>

        {/* Loading indicator */}
        {loadingFormula && (
          <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Loading formula...
          </div>
        )}
        {/* Formula loaded badge */}
        {preselectedFormulaId && !loadingFormula && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Formula loaded from library
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isActive ? '#9333EA' : isComplete ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: !isActive && !isComplete ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}>
                    {isComplete ? <Check className="w-4 h-4 text-[#10B981]" /> : <Icon className="w-4 h-4" style={{ color: isActive ? '#FFF' : 'var(--cg-text-tertiary)' }} />}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: isActive ? '#A855F7' : 'var(--cg-text-tertiary)' }}>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px flex-1 mx-1" style={{ background: isComplete ? '#10B981' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 0: Client Selection */}
          {step === 0 && (
            <motion.div key="client" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
                <input type="text" placeholder="Search clients..." value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-sm"
                  style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredClients.map(c => (
                  <button key={c.id} onClick={() => { setSelectedClient(c); setStep(1); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                    style={{
                      background: selectedClient?.id === c.id ? 'rgba(147, 51, 234, 0.1)' : 'var(--cg-surface)',
                      border: selectedClient?.id === c.id ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                        {c.lastVisit ? `Last: ${new Date(c.lastVisit).toLocaleDateString()}` : 'New client'}
                      </p>
                    </div>
                    {selectedClient?.id === c.id && <Check className="w-4 h-4 text-[#9333EA]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Service Type */}
          {step === 1 && (
            <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-3">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--cg-text-secondary)' }}>Select service type</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map(st => (
                  <button key={st.value} onClick={() => { setServiceType(st.label); setServiceTime(st.time); setStep(2); }}
                    className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: serviceType === st.label ? 'rgba(147, 51, 234, 0.1)' : 'var(--cg-surface)',
                      border: serviceType === st.label ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>{st.label}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" style={{ color: 'var(--cg-text-tertiary)' }} />
                      <span className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>~{st.time} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Formula */}
          {step === 2 && (
            <motion.div key="formula" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              {/* Existing steps */}
              {formulaSteps.length > 0 && (
                <div className="space-y-2">
                  {formulaSteps.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9333EA]/30 to-[#EC4899]/10 flex items-center justify-center">
                          <span className="text-[10px] font-mono font-semibold text-[#9333EA]">{s.product.shadeCode.slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>{s.product.shadeCode} {s.product.shadeName}</p>
                          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>{s.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>{s.grams}g</span>
                        <button onClick={() => removeShade(i)} className="p-1 rounded hover:bg-white/5">
                          <X className="w-3.5 h-3.5 text-red-400/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add shade */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--cg-text-secondary)' }}>Add Formula Component</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Shade code (e.g. 6N)" value={shadeCode} onChange={e => setShadeCode(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
                  <input type="text" placeholder="Shade name" value={shadeName} onChange={e => setShadeName(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--cg-text-tertiary)' }}>Grams</label>
                    <div className="flex gap-2">
                      <input type="number" value={shadeGrams} onChange={e => setShadeGrams(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 rounded-xl text-sm font-mono"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
                      <button 
                        onClick={() => {
                          // Trigger scale read - the ScaleWidget onWeightCapture will update shadeGrams
                          // This just shows feedback that we're capturing
                          const el = document.getElementById('grams-input');
                          if (el) {
                            el.style.borderColor = '#10B981';
                            setTimeout(() => { el.style.borderColor = ''; }, 500);
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10B981' }}
                        title="Put product on scale and click to capture weight"
                      >
                        <Scale className="w-3.5 h-3.5" /> Capture
                      </button>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--cg-text-tertiary)' }}>
                      Put product on scale, click Capture to auto-fill
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--cg-text-tertiary)' }}>Role</label>
                    <select value={shadeRole} onChange={e => setShadeRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }}>
                      <option>Primary</option>
                      <option>Secondary</option>
                      <option>Toner</option>
                      <option>Bond</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: 'var(--cg-text-tertiary)' }}>Brand</label>
                    <select value={brand} onChange={e => setBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }}>
                      {['Wella', 'Redken', 'Davines', 'Schwarzkopf', 'Goldwell', 'Matrix', 'Pravana'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={addShade} disabled={!shadeCode}
                  className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-30"
                  style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#A855F7' }}>
                  <Plus className="w-4 h-4" /> Add Component
                </button>
              </div>

              {/* Developer */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Developer:</span>
                <input type="number" value={developerMl} onChange={e => setDeveloperMl(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg text-sm font-mono text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
                <span className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>ml</span>
              </div>

              {/* Scale for weighing - integrated with formula */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--cg-text-secondary)' }}>Scale Integration</p>
                <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
                  Connect your Acaia scale to auto-capture product weights
                </p>
                <ScaleWidget
                  compact
                  onWeightCapture={(grams) => {
                    setShadeGrams(Math.round(grams));
                    // Visual feedback
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    if (input) {
                      input.style.borderColor = '#10B981';
                      setTimeout(() => { input.style.borderColor = ''; }, 1000);
                    }
                  }}
                />
              </div>

              {/* Continue */}
              <button onClick={() => setStep(3)} disabled={formulaSteps.length === 0}
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                Continue to Review <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              {/* Summary */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <User className="w-4 h-4 text-[#9333EA]" />
                  <span className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>{selectedClient?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#A855F7' }}>{serviceType}</span>
                </div>
                {formulaSteps.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--cg-text-secondary)' }}>{s.product.shadeCode} ({s.role})</span>
                    <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>{s.grams}g</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--cg-text-secondary)' }}>Developer</span>
                  <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>{developerMl}ml</span>
                </div>
              </div>

              {/* Cost */}
              <CostCalculator steps={formulaSteps} developerMl={developerMl} brand={brand} />

              {/* Scale — compact for review */}
              <ScaleWidget compact onWeightCapture={(grams) => {}} />

              {/* Rating & Notes */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--cg-text-secondary)' }}>Result Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className="w-6 h-6" fill={s <= rating ? '#F59E0B' : 'transparent'}
                        stroke={s <= rating ? '#F59E0B' : 'rgba(255,255,255,0.15)'} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Notes (optional)..." value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm h-20 resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cg-text-primary)' }} />
              </div>

              {/* Save */}
              {saved ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>Service Saved!</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--cg-text-tertiary)' }}>Redirecting to client profile...</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--cg-text-secondary)' }}>
                    <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-[2] py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Complete Service'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && !saved && (
          <button onClick={() => setStep(step - 1)} className="mt-4 text-xs text-[#9333EA]">
            ← Back to {STEPS[step - 1].title}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ServiceEntryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="w-8 h-8 border-2 border-[#9333EA] border-t-transparent rounded-full animate-spin" />
    </div>}>
      <ServiceEntryContent />
    </Suspense>
  );
}
