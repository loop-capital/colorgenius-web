'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Info, Save, ArrowRight } from 'lucide-react';
import { useCanEdit } from '@/lib/user-context';

const DEFAULT_BRANDS = [
  { name: 'Wella', costPerOz: 3.50 },
  { name: 'Davines', costPerOz: 4.20 },
  { name: 'Redken', costPerOz: 3.60 },
  { name: 'Schwarzkopf', costPerOz: 3.80 },
  { name: 'Goldwell', costPerOz: 4.10 },
  { name: 'Matrix', costPerOz: 3.20 },
  { name: 'L\'Oréal Professionnel', costPerOz: 3.40 },
  { name: 'Joico', costPerOz: 3.50 },
  { name: 'Pravana', costPerOz: 4.50 },
  { name: 'Pulp Riot', costPerOz: 4.80 },
];

const DEVELOPER_COST = 0.48; // per oz

export default function PricingPage() {
  const { toast } = useToast();
  const { canEdit } = useCanEdit();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markupPercent, setMarkupPercent] = useState(100); // 2x default
  const [applyToColor, setApplyToColor] = useState(true);
  const [applyToDeveloper, setApplyToDeveloper] = useState(true);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pricing/config');
      if (res.ok) {
        const data = await res.json();
        const cfg = {
          markupPercent: data.config.markupPercent ?? 100,
          applyToColor: data.config.applyToColor ?? true,
          applyToDeveloper: data.config.applyToDeveloper ?? true,
        };
        setMarkupPercent(cfg.markupPercent);
        setApplyToColor(cfg.applyToColor);
        setApplyToDeveloper(cfg.applyToDeveloper);
        setInitialConfig(cfg);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/pricing/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markupPercent,
          applyToColor,
          applyToDeveloper,
        }),
      });
      if (res.ok) {
        toast({ title: 'Pricing saved', description: `Markup set to ${markupPercent}%` });
      } else {
        toast({ title: 'Save failed', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const [initialConfig, setInitialConfig] = useState({ markupPercent: 100, applyToColor: true, applyToDeveloper: true });
  const multiplier = 1 + markupPercent / 100;
  const hasChanges = markupPercent !== initialConfig.markupPercent ||
    applyToColor !== initialConfig.applyToColor ||
    applyToDeveloper !== initialConfig.applyToDeveloper;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            Pricing <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Setup</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
            Set your cost-plus markup. Your product cost × markup = what the client sees.
          </p>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[#9333EA]" />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>How Cost-Plus Works</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="px-4 py-3 rounded-xl flex-1 min-w-[120px] text-center"
              style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#10B981' }}>Product Cost</div>
              <div className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>$8.50</div>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cg-text-tertiary)' }} />
            <div className="px-4 py-3 rounded-xl flex-1 min-w-[120px] text-center"
              style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.15)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-[#9333EA]">Markup</div>
              <div className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>+{markupPercent}%</div>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cg-text-tertiary)' }} />
            <div className="px-4 py-3 rounded-xl flex-1 min-w-[120px] text-center"
              style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.15)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-[#EC4899]">Client Charge</div>
              <div className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${(8.50 * multiplier).toFixed(2)}</div>
            </div>
          </div>
        </motion.div>

        {/* Markup Control */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>Your Markup</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cg-text-secondary)' }}>
                {multiplier.toFixed(1)}× multiplier — charge ${(10 * multiplier).toFixed(2)} per $10 product cost
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-[#9333EA]">{markupPercent}%</div>
              <div className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>markup</div>
            </div>
          </div>

          <div className="relative mb-2">
            <input
              type="range"
              min={0}
              max={400}
              step={10}
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
              disabled={!canEdit}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333EA 0%, #EC4899 ${(markupPercent / 400) * 100}%, rgba(255,255,255,0.06) ${(markupPercent / 400) * 100}%)`,
                accentColor: '#9333EA',
              }}
            />
          </div>

          <div className="flex justify-between text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
            <span>0% (at cost)</span>
            <span>100% (2×)</span>
            <span>200% (3×)</span>
            <span>300% (4×)</span>
            <span>400% (5×)</span>
          </div>

          {/* Quick Presets */}
          {canEdit && (
            <div className="flex gap-2 mt-4">
              {[100, 150, 200, 250, 300].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setMarkupPercent(pct)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: markupPercent === pct ? 'rgba(147, 51, 234, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: markupPercent === pct ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    color: markupPercent === pct ? '#9333EA' : 'var(--cg-text-secondary)',
                  }}
                >
                  {pct}% ({1 + pct / 100}×)
                </button>
              ))}
            </div>
          )}

          {/* Apply To */}
          <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--cg-text-secondary)' }}>
              <input type="checkbox" checked={applyToColor} onChange={(e) => setApplyToColor(e.target.checked)} disabled={!canEdit}
                style={{ accentColor: '#9333EA' }} className="w-4 h-4 rounded" />
              Apply to color
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--cg-text-secondary)' }}>
              <input type="checkbox" checked={applyToDeveloper} onChange={(e) => setApplyToDeveloper(e.target.checked)} disabled={!canEdit}
                style={{ accentColor: '#9333EA' }} className="w-4 h-4 rounded" />
              Apply to developer
            </label>
          </div>
        </motion.div>

        {/* Price Preview Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-[#9333EA]" />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>Price Preview by Brand</h3>
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--cg-text-tertiary)' }}>
              <span>Brand</span>
              <span className="text-right">Cost / oz</span>
              <span className="text-right">Client Price / oz</span>
              <span className="text-right">Est. Service</span>
            </div>

            {DEFAULT_BRANDS.map((brand, i) => {
              const clientPricePerOz = brand.costPerOz * multiplier;
              const estServiceCost = clientPricePerOz * 4; // ~4oz per service
              return (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-4 gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>{brand.name}</span>
                  <span className="text-sm font-mono text-right" style={{ color: 'var(--cg-text-secondary)' }}>${brand.costPerOz.toFixed(2)}</span>
                  <span className="text-sm font-mono text-right font-bold text-[#9333EA]">${clientPricePerOz.toFixed(2)}</span>
                  <span className="text-sm font-mono text-right" style={{ color: '#10B981' }}>${estServiceCost.toFixed(2)}</span>
                </motion.div>
              );
            })}

            {/* Developer Row */}
            <div className="grid grid-cols-4 gap-2 px-3 py-2.5 rounded-xl mt-1"
              style={{ background: 'rgba(147, 51, 234, 0.04)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>Developer</span>
              <span className="text-sm font-mono text-right" style={{ color: 'var(--cg-text-secondary)' }}>${DEVELOPER_COST.toFixed(2)}</span>
              <span className="text-sm font-mono text-right font-bold text-[#9333EA]">
                ${applyToDeveloper ? (DEVELOPER_COST * multiplier).toFixed(2) : DEVELOPER_COST.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-right" style={{ color: 'var(--cg-text-tertiary)' }}>per oz</span>
            </div>
          </div>

          <p className="text-[10px] mt-3" style={{ color: 'var(--cg-text-tertiary)' }}>
            Est. service assumes ~4oz color per visit. Developer at 60ml (~2oz). Actual costs vary by service.
          </p>
        </motion.div>

        {/* Save */}
        {canEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Pricing'}
            </button>
          </motion.div>
        )}

        {/* Footer Note */}
        <div className="mt-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(147, 51, 234, 0.06)', border: '1px solid rgba(147, 51, 234, 0.15)' }}>
          <TrendingUp className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium" style={{ color: '#A855F7' }}>Cost-Plus Pricing</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
              Product cost is automatically calculated from your formula. Your markup is applied on top, 
              giving you a transparent, fair pricing model that adjusts with every formulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
