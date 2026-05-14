'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, X, Check, AlertTriangle, Scale } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ingredient {
  id: string;
  shadeCode: string;
  color: string;
  targetGrams: number;
  currentGrams: number;
  isDeveloper: boolean;
}

// ─── Rebalance ───────────────────────────────────────────────────────────────

interface RebalanceProps {
  ingredients: Ingredient[];
  overpouredId: string;
  mixingRatio: string;
  onRebalance: (newTargets: Record<string, number>) => void;
  onClose: () => void;
}

export function Rebalance({ ingredients, overpouredId, mixingRatio, onRebalance, onClose }: RebalanceProps) {
  const overpoured = ingredients.find(i => i.id === overpouredId);
  if (!overpoured) return null;

  const overpourAmount = overpoured.currentGrams - overpoured.targetGrams;
  const ratioParts = mixingRatio.split(':').map(Number);
  const devMultiplier = (ratioParts[1] || 1) / (ratioParts[0] || 1);

  // Calculate new targets: scale all products proportionally
  const products = ingredients.filter(i => !i.isDeveloper);
  const scaleFactor = overpoured.currentGrams / overpoured.targetGrams;

  const newTargets: Record<string, number> = {};
  let newTotal = 0;
  products.forEach(p => {
    const newTarget = Math.round(p.targetGrams * scaleFactor * 10) / 10;
    newTargets[p.id] = newTarget;
    newTotal += newTarget;
  });

  // Developer target based on ratio
  const devTarget = Math.round(newTotal * devMultiplier * 10) / 10;
  ingredients.filter(i => i.isDeveloper).forEach(d => {
    newTargets[d.id] = devTarget;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#F5F5F7' }}>Rebalance Formula</h3>
          <p className="text-xs" style={{ color: '#71717A' }}>
            Overpoured by {overpourAmount}g — targets will adjust to maintain {mixingRatio} ratio
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {/* Overpour alert */}
      <div className="rounded-xl p-3 mb-4 flex items-center gap-2"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
        <span className="text-xs" style={{ color: '#F59E0B' }}>
          {overpoured.shadeCode}: {overpoured.targetGrams}g target → {overpoured.currentGrams}g actual (+{overpourAmount}g)
        </span>
      </div>

      {/* New targets */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#71717A' }}>ADJUSTED TARGETS</p>
        {ingredients.map(ing => (
          <div key={ing.id} className="flex items-center justify-between py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: ing.color }} />
              <span className="text-sm" style={{ color: '#F5F5F7' }}>
                {ing.shadeCode}
                {ing.id === overpouredId && <span className="text-[10px] ml-1 text-[#F59E0B]">OVERPOURED</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono" style={{ color: '#71717A' }}>{ing.targetGrams}g</span>
              <ArrowRightLeft className="w-3 h-3" style={{ color: '#71717A' }} />
              <span className="text-sm font-mono font-bold" style={{ color: '#9333EA' }}>
                {newTargets[ing.id] || ing.targetGrams}g
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onRebalance(newTargets)}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
      >
        <Scale className="w-4 h-4" /> Apply Rebalance
      </button>
    </div>
  );
}

// ─── Transfer Segments ───────────────────────────────────────────────────────

interface TransferSegmentsProps {
  ingredients: Ingredient[];
  fromId: string;
  onTransfer: (fromId: string, toId: string, grams: number) => void;
  onClose: () => void;
}

export function TransferSegments({ ingredients, fromId, onTransfer, onClose }: TransferSegmentsProps) {
  const [toId, setToId] = useState<string | null>(null);
  const [grams, setGrams] = useState(0);

  const fromIngredient = ingredients.find(i => i.id === fromId);
  if (!fromIngredient) return null;

  const availableTargets = ingredients.filter(i => i.id !== fromId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#F5F5F7' }}>Transfer Segments</h3>
          <p className="text-xs" style={{ color: '#71717A' }}>
            Move product from {fromIngredient.shadeCode} to the correct ingredient
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {/* From ingredient */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#71717A' }}>FROM</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: fromIngredient.color }} />
            <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>{fromIngredient.shadeCode}</span>
          </div>
          <span className="text-sm font-mono" style={{ color: '#F5F5F7' }}>{fromIngredient.currentGrams}g</span>
        </div>

        {/* Amount to transfer */}
        <div className="mt-3">
          <p className="text-xs mb-1" style={{ color: '#71717A' }}>Amount to transfer</p>
          <div className="flex items-center gap-1">
            {[0.5, 1, 2, 5].map(g => (
              <button
                type="button"
                key={g}
                onClick={() => setGrams(g)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: grams === g ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.04)',
                  border: grams === g ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: grams === g ? '#9333EA' : '#A1A1AA',
                }}
              >
                {g}g
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* To ingredient */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2" style={{ color: '#71717A' }}>TO</p>
        <div className="space-y-2">
          {availableTargets.map(ing => (
            <button
              type="button"
              key={ing.id}
              onClick={() => setToId(ing.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left"
              style={{
                background: toId === ing.id ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)',
                border: toId === ing.id ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: ing.color }} />
                <span className="text-sm" style={{ color: '#F5F5F7' }}>{ing.shadeCode}</span>
              </div>
              {toId === ing.id && <Check className="w-4 h-4 text-[#9333EA]" />}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => toId && grams > 0 && onTransfer(fromId, toId, grams)}
        disabled={!toId || grams <= 0}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
      >
        <ArrowRightLeft className="w-4 h-4" /> Transfer {grams}g
      </button>
    </div>
  );
}
