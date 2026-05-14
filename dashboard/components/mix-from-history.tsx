'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight, Check, AlertTriangle, ArrowRight, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HistoricalFormula {
  id: string;
  date: string;
  serviceName: string;
  brand: string;
  line: string;
  ingredients: {
    id: string;
    shadeCode: string;
    shadeName: string;
    color: string;
    gramsUsed: number;
    gramsWasted: number;
    isActive: boolean;
  }[];
  totalUsed: number;
  totalWasted: number;
  wasReweighed: boolean;
}

interface MixFromHistoryProps {
  clientId: string;
  clientName: string;
  history: HistoricalFormula[];
  onSelect: (formulaId: string, percentage: number) => void;
  onClose: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MixFromHistory({ clientId, clientName, history, onSelect, onClose, className = '' }: MixFromHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(100);
  const [showBuilder, setShowBuilder] = useState(false);

  const selectedFormula = history.find(h => h.id === selectedId);

  // Check for inactive products
  const hasInactive = selectedFormula?.ingredients.some(i => !i.isActive) || false;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#F5F5F7' }}>Mix From History</h2>
          <p className="text-xs" style={{ color: '#71717A' }}>
            {clientName} — select a previous formula to duplicate
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {!showBuilder ? (
        /* Step 1: Select formula from history */
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 mx-auto mb-2" style={{ color: '#71717A' }} />
              <p className="text-sm" style={{ color: '#71717A' }}>No previous formulas for this client</p>
            </div>
          ) : (
            history.map(formula => {
              const isSelected = formula.id === selectedId;
              const hasInactiveProds = formula.ingredients.some(i => !i.isActive);
              return (
                <button
                  type="button"
                  key={formula.id}
                  onClick={() => setSelectedId(formula.id)}
                  className="w-full rounded-xl p-4 text-left transition-all"
                  style={{
                    background: isSelected ? 'rgba(147,51,234,0.08)' : 'rgba(30,30,45,0.6)',
                    border: isSelected ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                        {formula.serviceName}
                      </p>
                      <p className="text-[10px]" style={{ color: '#71717A' }}>
                        {new Date(formula.date).toLocaleDateString()} · {formula.brand} {formula.line}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasInactiveProds && (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                      )}
                      {formula.wasReweighed && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                          Reweighed
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#9333EA]" />}
                    </div>
                  </div>

                  {/* Ingredients preview */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {formula.ingredients.map((ing, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: ing.color,
                            opacity: ing.isActive ? 0.8 : 0.3,
                            border: !ing.isActive ? '1px solid #F59E0B' : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: '#71717A' }}>
                      {formula.totalUsed}g used
                      {formula.wasReweighed && formula.totalWasted > 0 && ` · ${formula.totalWasted}g waste`}
                    </span>
                  </div>
                </button>
              );
            })
          )}

          {/* Continue button */}
          {selectedId && (
            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-4"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Step 2: Configure percentage + handle inactive products */
        <div>
          {/* Inactive product warnings */}
          {hasInactive && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-[#F59E0B]">Inactive Products</span>
              </div>
              {selectedFormula?.ingredients.filter(i => !i.isActive).map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: ing.color, opacity: 0.4 }} />
                    <span className="text-xs" style={{ color: '#A1A1AA' }}>{ing.shadeCode} — {ing.shadeName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                    Needs replacement
                  </span>
                </div>
              ))}
              <p className="text-[10px] mt-2" style={{ color: '#F59E0B' }}>
                Mix Now will be disabled until all inactive products are resolved.
              </p>
            </div>
          )}

          {/* Percentage selector */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block" style={{ color: '#F5F5F7' }}>
              Mix Percentage
            </label>
            <div className="flex gap-2 mb-2">
              {[50, 75, 100, 125, 150].map(pct => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => setPercentage(pct)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
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
            <p className="text-[10px]" style={{ color: '#71717A' }}>
              {percentage < 100 && 'Useful for new-growth-only appointments'}
              {percentage === 100 && 'Full formula reproduction'}
              {percentage > 100 && 'Extra formula for longer hair or multiple applications'}
            </p>
          </div>

          {/* Adjusted ingredients preview */}
          {selectedFormula && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#71717A' }}>
                ADJUSTED FORMULA ({percentage}%)
              </p>
              {selectedFormula.ingredients.map((ing, i) => {
                const adjustedGrams = Math.round((ing.gramsUsed - (selectedFormula.wasReweighed ? ing.gramsWasted : 0)) * (percentage / 100) * 10) / 10;
                return (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ing.color }} />
                      <span className="text-xs" style={{ color: '#F5F5F7' }}>{ing.shadeCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono" style={{ color: '#71717A' }}>{ing.gramsUsed}g</span>
                      <ArrowRight className="w-3 h-3" style={{ color: '#71717A' }} />
                      <span className="text-xs font-mono font-bold" style={{ color: '#9333EA' }}>{adjustedGrams}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowBuilder(false)} className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA' }}>
              Back
            </button>
            <button
              type="button"
              onClick={() => selectedId && onSelect(selectedId, percentage)}
              disabled={hasInactive}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
            >
              Mix Now <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
