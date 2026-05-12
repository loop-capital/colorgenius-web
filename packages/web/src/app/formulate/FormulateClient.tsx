'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { createFormulateApi } from '@/lib/api';
import {
  Beaker,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Palette,
  Droplets,
  ShieldCheck,
  Heart,
} from 'lucide-react';

interface FormData {
  current_level: number;
  current_tone: string;
  target_level: number;
  target_tone: string;
  service_type: string;
  gray_percentage: number;
  preferred_brand: string;
  is_virgin: boolean;
  hair_condition: string;
  has_metallic_dye: boolean;
  has_henna: boolean;
  is_post_chemo: boolean;
  recent_bleach: boolean;
}

interface FormulationResult {
  formulation_id: string;
  confidence_score: number;
  validation: { is_valid: boolean; warnings: string[] };
  primary_formula: {
    action_type: string;
    brand: string;
    product_line: string;
    components: Array<{
      shade: { id: string; code: string; name: string; level: number; primary_tone: string; undertone: string };
      amount_oz: number;
      amount_ml: number;
      purpose: string;
    }>;
    developer: { volume: number; amount_oz: number; amount_ml: number };
    mixing_ratio: string;
    total_volume_oz: number;
    total_volume_ml: number;
  };
  processing_instructions: {
    total_time_minutes: number;
    application_sequence: Array<{ zone: string; duration: number; description: string }>;
    heat_optional: boolean;
    notes: string[];
  };
  cost_estimate: { total_product_cost: number; breakdown: Array<{ product: string; cost: number }> };
  pricing_suggestion: { recommended_price: number; price_range: [number, number] };
  recommendations: { aftercare: string[]; maintenance_schedule: string; next_appointment: string };
}

const TONES = [
  { value: 'N', label: 'Natural' }, { value: 'A', label: 'Ash' }, { value: 'G', label: 'Gold' },
  { value: 'R', label: 'Red' }, { value: 'K', label: 'Copper' }, { value: 'B', label: 'Beige' },
  { value: 'V', label: 'Violet' },
];

const SERVICE_TYPES = [
  { value: 'full_color', label: 'Full Color' }, { value: 'root_touchup', label: 'Root Touch-Up' },
  { value: 'highlights', label: 'Highlights' }, { value: 'balayage', label: 'Balayage' },
  { value: 'corrective', label: 'Corrective' }, { value: 'gloss', label: 'Gloss' }, { value: 'toner', label: 'Toner' },
];

const HAIR_CONDITIONS = [
  { value: 'healthy', label: 'Healthy' }, { value: 'damaged', label: 'Damaged' },
  { value: 'porous', label: 'Porous' }, { value: 'resistant', label: 'Resistant' },
];

const BRANDS = [
  { value: '', label: 'Auto-Select (Best Match)' }, { value: 'Wella', label: 'Wella' },
  { value: 'Redken', label: 'Redken' }, { value: 'Goldwell', label: 'Goldwell' },
  { value: 'Schwarzkopf', label: 'Schwarzkopf' }, { value: 'Matrix', label: 'Matrix' },
  { value: 'Joico', label: 'Joico' }, { value: 'Paul Mitchell', label: 'Paul Mitchell' },
  { value: 'Pulp Riot', label: 'Pulp Riot' }, { value: 'Davines', label: 'Davines' },
  { value: "L'ANZA", label: "L'ANZA" },
];

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/20 bg-background/60 backdrop-blur-lg dark:bg-background/40 dark:border-border/30 ${className || ''}`}>
      {children}
    </div>
  );
}

function LevelSlider({ label, value, onChange, id }: { label: string; value: number; onChange: (v: number) => void; id: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <span className="text-2xl font-bold text-primary">{value}</span>
      </div>
      <input id={id} type="range" min={1} max={12} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
        style={{ background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((value - 1) / 11) * 100}%, #334155 ${((value - 1) / 11) * 100}%, #334155 100%)` }}
      />
      <div className="flex justify-between text-xs text-muted-foreground"><span>1 (Black)</span><span>12 (Lightest Blonde)</span></div>
    </div>
  );
}

function ToneGrid({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {TONES.map((t) => (
          <button key={t.value} onClick={() => onChange(t.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === t.value ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
            {t.value}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Selected: {TONES.find((t) => t.value === value)?.label || value}</p>
    </div>
  );
}

export default function FormulateClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FormulationResult | null>(null);

  const [form, setForm] = useState<FormData>({
    current_level: 6, current_tone: 'N', target_level: 7, target_tone: 'N',
    service_type: 'full_color', gray_percentage: 0, preferred_brand: '',
    is_virgin: true, hair_condition: 'healthy', has_metallic_dye: false,
    has_henna: false, is_post_chemo: false, recent_bleach: false,
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createFormulateApi({
        current_level: form.current_level, current_tone: form.current_tone,
        target_level: form.target_level, target_tone: form.target_tone,
        service_type: form.service_type, gray_percentage: form.gray_percentage,
        preferred_brand: form.preferred_brand || undefined, is_virgin: form.is_virgin,
        hair_condition: form.hair_condition as any,
        questionnaire: { has_metallic_dye: form.has_metallic_dye, has_henna: form.has_henna, is_post_chemo: form.is_post_chemo, recent_bleach: form.recent_bleach },
      });
      if (response.data && (response.data as any).success !== false) {
        const inner = (response.data as any).data || response.data;
        setResult(inner as FormulationResult);
        setStep(3);
      } else {
        setError(response.error?.message || 'Formulation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1); setResult(null); setError(null);
    setForm({ current_level: 6, current_tone: 'N', target_level: 7, target_tone: 'N', service_type: 'full_color', gray_percentage: 0, preferred_brand: '', is_virgin: true, hair_condition: 'healthy', has_metallic_dye: false, has_henna: false, is_post_chemo: false, recent_bleach: false });
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Beaker className="w-4 h-4" /> AI Formulation Engine
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">New Formulation</h1>
          <p className="text-muted-foreground">
            {step === 1 && "Describe the client's current hair state and desired result"}
            {step === 2 && 'Additional hair details for accuracy'}
            {step === 3 && 'Your professional formulation is ready'}
          </p>
        </div>

        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s === step ? 'bg-primary text-primary-foreground' : s < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{s}</div>
                {s < 2 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && <GlassCard className="p-4 mb-6 border-red-500/30 bg-red-500/10"><p className="text-red-400 text-sm">{error}</p></GlassCard>}

        {step === 1 && (
          <GlassCard className="p-6 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Palette className="w-4 h-4 text-muted-foreground" />Current Hair State</h3>
                <LevelSlider label="Current Level" value={form.current_level} onChange={(v) => set('current_level', v)} id="current-level" />
                <ToneGrid label="Current Tone" value={form.current_tone} onChange={(v) => set('current_tone', v)} />
              </div>
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-muted-foreground" />Desired Result</h3>
                <LevelSlider label="Target Level" value={form.target_level} onChange={(v) => set('target_level', v)} id="target-level" />
                <ToneGrid label="Target Tone" value={form.target_tone} onChange={(v) => set('target_tone', v)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Type</Label>
                <select value={form.service_type} onChange={(e) => set('service_type', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {SERVICE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Brand</Label>
                <select value={form.preferred_brand} onChange={(e) => set('preferred_brand', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {BRANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Gray Coverage %</Label>
                <span className="text-xl font-bold text-primary">{form.gray_percentage}%</span>
              </div>
              <input type="range" min={0} max={100} value={form.gray_percentage} onChange={(e) => set('gray_percentage', parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                style={{ background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${form.gray_percentage}%, #334155 ${form.gray_percentage}%, #334155 100%)` }}
              />
              <div className="flex justify-between text-xs text-muted-foreground"><span>No gray</span><span>Full gray</span></div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="gap-2">Next <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="p-6 space-y-8">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Hair History</Label>
              <div className="flex gap-3">
                <button onClick={() => set('is_virgin', true)} className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${form.is_virgin ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>Virgin Hair</button>
                <button onClick={() => set('is_virgin', false)} className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${!form.is_virgin ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>Previously Colored</button>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Hair Condition</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HAIR_CONDITIONS.map((c) => (
                  <button key={c.value} onClick={() => set('hair_condition', c.value)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${form.hair_condition === c.value ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Safety Checks</Label>
              <div className="space-y-2">
                {[
                  { key: 'has_metallic_dye', label: 'Metallic dye history (e.g., Grecian Formula)', critical: true },
                  { key: 'has_henna', label: 'Henna treatment history' },
                  { key: 'is_post_chemo', label: 'Post-chemotherapy hair' },
                  { key: 'recent_bleach', label: 'Recent bleach service (within 2 weeks)' },
                ].map((q) => (
                  <label key={q.key} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${(form as any)[q.key] ? (q.critical ? 'bg-red-500/10 border border-red-500/30' : 'bg-primary/10 border border-primary/30') : 'bg-muted/30 border border-transparent hover:bg-muted/50'}`}>
                    <input type="checkbox" checked={(form as any)[q.key]} onChange={(e) => set(q.key as keyof FormData, e.target.checked as any)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm">{q.label}</span>
                    {q.critical && (form as any)[q.key] && <Badge variant="destructive" className="ml-auto text-xs">CRITICAL</Badge>}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                {isLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Beaker className="w-4 h-4" /> Generate Formula</>}
              </Button>
            </div>
          </GlassCard>
        )}

        {step === 3 && result && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${result.confidence_score >= 0.85 ? 'bg-green-500/20 text-green-400' : result.confidence_score >= 0.7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {Math.round(result.confidence_score * 100)}%
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Confidence Score</p>
                    <p className="text-sm text-muted-foreground">{result.confidence_score >= 0.85 ? 'High confidence' : 'Review recommended'}</p>
                  </div>
                </div>
                <Badge variant={result.validation.is_valid ? 'default' : 'destructive'}>{result.validation.is_valid ? 'Valid' : 'Review Required'}</Badge>
              </div>
              {result.validation.warnings.length > 0 && (
                <div className="space-y-2 mt-4">
                  {result.validation.warnings.map((w, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${w.includes('CRITICAL') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{w.replace(/⚠️\s*/g, '')}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><Droplets className="w-4 h-4 text-primary" />Formula — {result.primary_formula.brand} {result.primary_formula.product_line}</h3>
              <div className="space-y-3">
                {result.primary_formula.components.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{c.shade.name}</p>
                      <p className="text-sm text-muted-foreground">{c.shade.code} · Level {c.shade.level} · {c.shade.primary_tone} ({c.purpose})</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{c.amount_oz} oz</p>
                      <p className="text-xs text-muted-foreground">{c.amount_ml}ml</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Developer {result.primary_formula.developer.volume}vol</p>
                    <p className="text-sm text-muted-foreground">Mixing ratio: {result.primary_formula.mixing_ratio}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{result.primary_formula.developer.amount_oz} oz</p>
                    <p className="text-xs text-muted-foreground">{result.primary_formula.developer.amount_ml}ml</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-primary" />Processing — {result.processing_instructions.total_time_minutes} minutes</h3>
              <div className="space-y-2">
                {result.processing_instructions.application_sequence.map((seq, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/30">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <div className="flex-1"><span className="font-medium text-foreground">{seq.zone}</span><span className="text-muted-foreground"> — {seq.description}</span></div>
                    {seq.duration > 0 && <span className="text-sm font-medium text-primary">{seq.duration}m</span>}
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="grid sm:grid-cols-2 gap-4">
              <GlassCard className="p-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-primary" />Product Cost</h3>
                <p className="text-3xl font-bold text-foreground">${result.cost_estimate.total_product_cost.toFixed(2)}</p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-green-400" />Suggested Price</h3>
                <p className="text-3xl font-bold text-green-400">${result.pricing_suggestion.recommended_price}</p>
                <p className="text-sm text-muted-foreground mt-1">Range: ${result.pricing_suggestion.price_range[0]} – ${result.pricing_suggestion.price_range[1]}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Heart className="w-4 h-4 text-primary" />Aftercare</h3>
              <div className="space-y-2">
                {result.recommendations.aftercare.map((a, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{a}</p>
                ))}
              </div>
            </GlassCard>

            <div className="flex justify-center gap-4 pb-8">
              <Button onClick={resetForm} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> New Formulation</Button>
              <Button onClick={() => router.push('/dashboard')} className="gap-2">Back to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
