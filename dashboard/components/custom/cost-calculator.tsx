'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

// Default product pricing (per gram) — salons can customize
const DEFAULT_PRICE_PER_GRAM: Record<string, number> = {
  'Davines': 0.45,
  'Wella': 0.38,
  'Schwarzkopf': 0.42,
  'Redken': 0.40,
  'Matrix': 0.35,
  'Joico': 0.38,
  'Goldwell': 0.44,
  'L\'Oréal': 0.36,
  'Pravana': 0.48,
  'Pulp Riot': 0.52,
  'Paul Mitchell': 0.37,
  'Kenra': 0.35,
};

const DEVELOPER_COST_PER_ML = 0.008; // ~$8 per liter

interface FormulaStep {
  product: { shadeCode: string; shadeName: string; brand?: string; level?: number };
  grams: number;
  role: string;
}

interface CostCalculatorProps {
  steps: FormulaStep[];
  developerMl?: number;
  brand?: string;
  markup?: number; // salon multiplier (default 3x)
  onChargeChange?: (charge: number) => void;
}

export function CostCalculator({
  steps,
  developerMl = 60,
  brand = 'Wella',
  markup = 3,
  onChargeChange,
}: CostCalculatorProps) {
  const pricePerGram = DEFAULT_PRICE_PER_GRAM[brand] || 0.40;

  const colorCost = steps.reduce((sum, step) => {
    const stepBrand = step.product.brand || brand;
    const price = DEFAULT_PRICE_PER_GRAM[stepBrand] || pricePerGram;
    return sum + (step.grams * price);
  }, 0);

  const developerCost = developerMl * DEVELOPER_COST_PER_ML;
  const totalCost = colorCost + developerCost;
  const suggestedCharge = totalCost * markup;
  const profit = suggestedCharge - totalCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-[#9333EA]" />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
          Cost Breakdown
        </h3>
      </div>

      {/* Per-shade breakdown */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const stepBrand = step.product.brand || brand;
          const price = DEFAULT_PRICE_PER_GRAM[stepBrand] || pricePerGram;
          const cost = step.grams * price;
          return (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'var(--cg-gradient-teal)' }}
                >
                  {step.product.shadeCode?.slice(0, 2) || '??'}
                </div>
                <span style={{ color: 'var(--cg-text-secondary)' }}>
                  {step.product.shadeCode} ({step.grams}g)
                </span>
              </div>
              <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>
                ${cost.toFixed(2)}
              </span>
            </div>
          );
        })}

        <div className="flex items-center justify-between text-sm pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span style={{ color: 'var(--cg-text-secondary)' }}>Developer ({developerMl}ml)</span>
          <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>
            ${developerCost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="pt-3 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>Product Cost</span>
          <span className="text-sm font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            ${totalCost.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>
            Suggested Charge ({markup}x)
          </span>
          <span className="text-lg font-mono font-bold text-[#9333EA]">
            ${suggestedCharge.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
          <TrendingUp className="w-3 h-3" />
          <span>Est. profit: ${profit.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(147, 51, 234, 0.08)' }}>
        <AlertCircle className="w-3.5 h-3.5 text-[#9333EA] mt-0.5 flex-shrink-0" />
        <p className="text-[10px]" style={{ color: 'var(--cg-text-secondary)' }}>
          Prices are estimates. Update actual product costs in Settings → Pricing.
        </p>
      </div>
    </motion.div>
  );
}
