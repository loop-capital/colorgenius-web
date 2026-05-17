'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, DollarSign, Clock, FlaskConical, Copy, Edit3, Star, TrendingUp,
  AlertCircle, User, Calendar,
} from 'lucide-react';
import { CostCalculator } from '@/components/custom/cost-calculator';

// Default product pricing (per gram)
const DEFAULT_PRICE_PER_GRAM: Record<string, number> = {
  'Davines': 0.45, 'Wella': 0.38, 'Schwarzkopf': 0.42, 'Redken': 0.40,
  'Matrix': 0.35, 'Joico': 0.38, 'Goldwell': 0.44, "L'Oreal": 0.36,
  'Pravana': 0.48, 'Pulp Riot': 0.52, 'Paul Mitchell': 0.37, 'Kenra': 0.35,
};
const DEVELOPER_COST_PER_ML = 0.008;

interface FormulaStep {
  product: { shadeCode: string; shadeName: string; brand?: string; level?: number };
  grams: number;
  role: string;
}

interface FormulaDetail {
  id: string;
  client_id?: string;
  stylist_id: string;
  brand?: string;
  product_line?: string;
  primary_formula: { steps?: FormulaStep[]; developer?: { volume: number; ml: number } };
  processing_instructions: { time?: number; technique?: string; notes?: string };
  warnings: string[];
  confidence_score?: string;
  status: string;
  score_overall?: number;
  stylist_notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FormulaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formulaId = params.id as string;
  const [formula, setFormula] = useState<FormulaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formulaId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/formulas/${formulaId}`);
        if (!res.ok) throw new Error('Formula not found');
        const data = await res.json();
        setFormula(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formulaId]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ background: 'var(--cg-bg-deep)' }}>
        <div className="w-8 h-8 border-2 border-[#9333EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !formula) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--cg-bg-deep)' }}>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400/60" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--cg-text-primary)' }}>
            {error || 'Formula not found'}
          </h2>
          <button onClick={() => router.back()} className="mt-4 text-sm text-[#9333EA]">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const steps: FormulaStep[] = formula.primary_formula?.steps || [];
  const developer = formula.primary_formula?.developer;
  const brand = formula.brand || 'Wella';
  const processingTime = formula.processing_instructions?.time || 0;
  const technique = formula.processing_instructions?.technique;
  const notes = formula.processing_instructions?.notes;

  // Calculate costs
  const colorCost = steps.reduce((sum, step) => {
    const stepBrand = step.product?.brand || brand;
    const price = DEFAULT_PRICE_PER_GRAM[stepBrand] || 0.40;
    return sum + (step.grams * price);
  }, 0);
  const developerCost = (developer?.ml || 60) * DEVELOPER_COST_PER_ML;
  const totalCost = colorCost + developerCost;
  const markup = 3;
  const servicePrice = totalCost * markup;
  const margin = servicePrice - totalCost;
  const marginPct = servicePrice > 0 ? (margin / servicePrice) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--cg-text-secondary)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
              Formula Detail
            </h1>
            <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
              {new Date(formula.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl hover:bg-white/5" title="Reuse formula">
              <Copy className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/5" title="Edit">
              <Edit3 className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
            </button>
          </div>
        </div>

        {/* Brand & Score */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
            {brand}
          </span>
          {formula.product_line && (
            <span className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>{formula.product_line}</span>
          )}
          {formula.score_overall != null && (
            <div className="flex items-center gap-1 ml-auto">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-4 h-4" fill={s <= (formula.score_overall || 0) ? '#F59E0B' : 'transparent'}
                  stroke={s <= (formula.score_overall || 0) ? '#F59E0B' : 'rgba(255,255,255,0.15)'} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formula Components */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#9333EA]" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>Formula Components</h3>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899]/10 flex items-center justify-center">
                      <span className="text-[10px] font-mono font-semibold text-[#9333EA]">
                        {step.product?.shadeCode?.slice(0, 3) || '???'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--cg-text-primary)' }}>
                        {step.product?.shadeCode} {step.product?.shadeName}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>{step.role}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>{step.grams}g</span>
                </div>
              ))}
              {developer && (
                <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.06)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <span className="text-[10px] font-bold text-[#F59E0B]">{developer.volume}v</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--cg-text-primary)' }}>Developer</p>
                  </div>
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>{developer.ml}ml</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Cost Breakdown */}
          <CostCalculator
            steps={steps}
            developerMl={developer?.ml || 60}
            brand={brand}
            markup={markup}
          />
        </div>

        {/* Processing & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>Processing</h3>
            </div>
            <div className="space-y-2 text-sm" style={{ color: 'var(--cg-text-secondary)' }}>
              <p>Time: <span className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>{processingTime} min</span></p>
              {technique && <p>Technique: <span style={{ color: 'var(--cg-text-primary)' }}>{technique}</span></p>}
              {notes && (
                <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--cg-text-tertiary)' }}>Instructions</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--cg-text-secondary)' }}>{notes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Warnings & Notes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {formula.warnings?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>Warnings</h3>
                </div>
                <div className="space-y-1">
                  {formula.warnings.map((w, i) => (
                    <p key={i} className="text-xs p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>{w}</p>
                  ))}
                </div>
              </div>
            )}
            {formula.stylist_notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--cg-text-tertiary)' }}>Stylist Notes</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cg-text-secondary)' }}>{formula.stylist_notes}</p>
              </div>
            )}
            {formula.confidence_score && (
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
                  AI Confidence: <span className="font-mono font-bold text-[#10B981]">{(parseFloat(String(formula.confidence_score)) * 100).toFixed(0)}%</span>
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Margin Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-4 rounded-2xl p-5"
          style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--cg-text-tertiary)' }}>Product Cost</p>
              <p className="text-xl font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--cg-text-tertiary)' }}>Service Price</p>
              <p className="text-xl font-mono font-bold text-[#9333EA]">${servicePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--cg-text-tertiary)' }}>Margin</p>
              <p className="text-xl font-mono font-bold text-[#10B981]">${margin.toFixed(2)} <span className="text-sm">({marginPct.toFixed(0)}%)</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
