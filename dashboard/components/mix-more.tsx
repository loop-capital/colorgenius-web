'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, X, FlaskConical, Scale, ArrowRightLeft } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OriginalIngredient {
  id: string;
  shadeCode: string;
  color: string;
  gramsOriginal: number;
  gramsWasted: number;
  isActive: boolean;
}

interface MixMoreProps {
  bowlName: string;
  ingredients: OriginalIngredient[];
  wasReweighed: boolean;
  onMix: (percentage: number, isNewBowl: boolean) => void;
  onClose: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MixMore({ bowlName, ingredients, wasReweighed, onMix, onClose, className = '' }: MixMoreProps) {
  const [percentage, setPercentage] = useState(100);
  const [isNewBowl, setIsNewBowl] = useState<boolean | null>(null);
  const [step, setStep] = useState<'config' | 'preview'>('config');

  const calculateGrams = (ing: OriginalIngredient) => {
    const usable = ing.gramsOriginal - (wasReweighed && isNewBowl ? ing.gramsWasted : 0);
    return Math.round(usable * (percentage / 100) * 10) / 10;
  };

  const totalOriginal = ingredients.reduce((s, i) => s + i.gramsOriginal, 0);
  const totalAdjusted = ingredients.reduce((s, i) => s + calculateGrams(i), 0);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#F5F5F7' }}>Mix More</h2>
          <p className="text-xs" style={{ color: '#71717A' }}>
            {bowlName} — re-mix a portion of this formula
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {step === 'config' ? (
        <>
          {/* Percentage selector */}
          <div className="mb-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: '#F5F5F7' }}>
              How much do you need?
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[25, 50, 75, 100].map(pct => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => setPercentage(pct)}
                  className="py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: percentage === pct ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.04)',
                    border: percentage === pct ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    color: percentage === pct ? '#9333EA' : '#A1A1AA',
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
            {/* Custom percentage */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={500}
                value={percentage}
                onChange={e => setPercentage(Math.max(1, Math.min(500, Number(e.target.value))))}
                className="w-20 px-3 py-2 rounded-lg text-sm text-center font-mono"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F7' }}
              />
              <span className="text-xs" style={{ color: '#71717A' }}>custom %</span>
            </div>
          </div>

          {/* New Bowl question */}
          <div className="mb-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: '#F5F5F7' }}>
              Are you using a new bowl?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsNewBowl(true)}
                className="p-4 rounded-xl text-left"
                style={{
                  background: isNewBowl === true ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)',
                  border: isNewBowl === true ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: '#F5F5F7' }}>Yes</p>
                <p className="text-[10px]" style={{ color: '#71717A' }}>
                  Different bowl — calculates without waste
                </p>
              </button>
              <button
                type="button"
                onClick={() => setIsNewBowl(false)}
                className="p-4 rounded-xl text-left"
                style={{
                  background: isNewBowl === false ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)',
                  border: isNewBowl === false ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: '#F5F5F7' }}>No</p>
                <p className="text-[10px]" style={{ color: '#71717A' }}>
                  Same bowl — accounts for remaining waste
                </p>
              </button>
            </div>
          </div>

          {/* Continue */}
          <button
            type="button"
            onClick={() => isNewBowl !== null && setStep('preview')}
            disabled={isNewBowl === null}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
          >
            Preview <ChevronRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          {/* Preview */}
          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#71717A' }}>
              {percentage}% FORMULA ({isNewBowl ? 'new bowl' : 'same bowl'})
            </p>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < ingredients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: ing.color }} />
                  <span className="text-sm" style={{ color: '#F5F5F7' }}>{ing.shadeCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: '#71717A' }}>{ing.gramsOriginal}g</span>
                  <ArrowRightLeft className="w-3 h-3" style={{ color: '#71717A' }} />
                  <span className="text-sm font-mono font-bold" style={{ color: '#9333EA' }}>{calculateGrams(ing)}g</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs" style={{ color: '#71717A' }}>Total</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: '#71717A' }}>{totalOriginal}g</span>
                <ArrowRightLeft className="w-3 h-3" style={{ color: '#71717A' }} />
                <span className="text-sm font-mono font-bold" style={{ color: '#9333EA' }}>{totalAdjusted}g</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('config')} className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA' }}>
              Back
            </button>
            <button
              type="button"
              onClick={() => onMix(percentage, isNewBowl!)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
            >
              <Scale className="w-4 h-4" /> Mix Now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
