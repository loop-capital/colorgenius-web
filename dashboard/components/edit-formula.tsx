'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, Droplets, FlaskConical, Scale, StickyNote, MoreHorizontal, Check } from 'lucide-react';
import { DropIndicator as BowlIndicator } from './scale-bowl';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormulaIngredient {
  id: string;
  name: string;
  brand: string;
  shadeCode: string;
  series: string;
  targetGrams: number;
  actualGrams?: number; // Set by scale after weighing
  color: string;
  order: number;
}

interface EditFormulaProps {
  ingredients: FormulaIngredient[];
  developer: { name: string; volume: number };
  mixingRatio: string;
  onIngredientsChange: (ingredients: FormulaIngredient[]) => void;
  onDeveloperChange: (dev: { name: string; volume: number }) => void;
  onRatioChange: (ratio: string) => void;
  onAddProduct?: () => void;
  onSave?: () => void;
  onStartWeighing?: () => void;
  onBalance?: () => void;
  onNotes?: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditFormula({
  ingredients,
  developer,
  mixingRatio,
  onIngredientsChange,
  onDeveloperChange,
  onRatioChange,
  onAddProduct,
  onSave,
  onStartWeighing,
  onBalance,
  onNotes,
  className = '',
}: EditFormulaProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    ingredients.length > 0 ? ingredients[0].id : null
  );
  const [activeTab, setActiveTab] = useState<'formula' | 'ingredient'>('formula');

  const totalGrams = ingredients.reduce((sum, i) => sum + i.targetGrams, 0);
  const totalActual = ingredients.reduce((sum, i) => sum + (i.actualGrams ?? i.targetGrams), 0);
  const totalExcess = totalActual - totalGrams;
  const selectedIng = ingredients.find(i => i.id === selectedId);

  const updateGrams = (id: string, grams: number) => {
    onIngredientsChange(
      ingredients.map(i => (i.id === id ? { ...i, targetGrams: Math.max(0, grams) } : i))
    );
  };

  const removeIngredient = (id: string) => {
    const updated = ingredients.filter(i => i.id !== id).map((i, idx) => ({ ...i, order: idx }));
    onIngredientsChange(updated);
    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
  };

  return (
    <div className={className}>
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className="text-sm font-semibold pb-1"
            style={{
              color: activeTab === 'formula' ? '#F5F5F7' : '#71717A',
              borderBottom: activeTab === 'formula' ? '2px solid #9333EA' : '2px solid transparent',
            }}
          >
            Formula
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredient')}
            className="text-sm font-semibold pb-1"
            style={{
              color: activeTab === 'ingredient' ? '#F5F5F7' : '#71717A',
              borderBottom: activeTab === 'ingredient' ? '2px solid #9333EA' : '2px solid transparent',
            }}
          >
            Ingredient
          </button>
        </div>
        <div className="text-right">
          <span className="text-xs" style={{ color: '#71717A' }}>
            {ingredients.length} ingredients
          </span>
          <span className="text-sm font-bold font-mono ml-2" style={{ color: '#F5F5F7' }}>
            {totalGrams}g
          </span>
          {totalExcess !== 0 && (
            <span className="text-xs font-mono ml-1" style={{
              color: totalExcess > 0 ? "#EF4444" : "#10B981",
            }}>
              {totalExcess > 0 ? "+" : ""}{totalExcess.toFixed(1)}g excess
            </span>
          )}
        </div>
      </div>

      {activeTab === 'formula' ? (
        <>
          {/* Drop/Bowl Visualization — shows layered composition */}
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: 180, height: 240 }}>
              <svg width={180} height={240} viewBox="0 0 200 280">
                <defs>
                  <clipPath id="dropClip">
                    <path d={`
                      M 100 15
                      C 155 15, 185 50, 185 105
                      C 185 155, 175 195, 155 225
                      C 140 248, 122 265, 100 275
                      C 78 265, 60 248, 45 225
                      C 25 195, 15 155, 15 105
                      C 15 50, 45 15, 100 15
                      Z
                    `} />
                  </clipPath>
                </defs>

                {/* Drop outline */}
                <path
                  d={`
                    M 100 15
                    C 155 15, 185 50, 185 105
                    C 185 155, 175 195, 155 225
                    C 140 248, 122 265, 100 275
                    C 78 265, 60 248, 45 225
                    C 25 195, 15 155, 15 105
                    C 15 50, 45 15, 100 15
                    Z
                  `}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1.5"
                />

                {/* Stacked fill layers */}
                <g clipPath="url(#dropClip)">
                  {ingredients.map((ing, i) => {
                    if (ing.targetGrams <= 0) return null;
                    const ingFill = ing.targetGrams / Math.max(totalGrams, 1);
                    const prevFill = ingredients
                      .slice(0, i)
                      .reduce((s, p) => s + p.targetGrams / Math.max(totalGrams, 1), 0);
                    const h = ingFill * 260;
                    const y = 275 - (prevFill * 260) - h;
                    return (
                      <g key={ing.id}>
                        <rect
                          x={10}
                          y={y}
                          width={180}
                          height={h + 2}
                          fill={ing.color}
                          opacity={ing.id === selectedId ? 0.9 : 0.5}
                        />
                        {/* Label inside layer if tall enough */}
                        {h > 30 && (
                          <text
                            x={100}
                            y={y + h / 2 + 4}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="600"
                            fontFamily="system-ui"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                          >
                            {ing.shadeCode}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Ingredient Tiles — Vish-style selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ingredients.map(ing => {
              const isSelected = ing.id === selectedId;
              return (
                <button
                  type="button"
                  key={ing.id}
                  onClick={() => setSelectedId(ing.id)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: isSelected
                      ? `${ing.color}22`
                      : 'rgba(30,30,45,0.6)',
                    border: isSelected
                      ? `1px solid ${ing.color}66`
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: ing.color }}
                    />
                    <span className="text-xs font-semibold" style={{ color: '#F5F5F7' }}>
                      {ing.shadeCode}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-[#9333EA] ml-auto" />}
                  </div>
                  <p className="text-[10px]" style={{ color: '#71717A' }}>{ing.series}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-sm font-bold font-mono" style={{
                      color: isSelected ? ing.color : '#A1A1AA',
                    }}>
                      {ing.targetGrams}g
                    </p>
                    {ing.actualGrams !== undefined && ing.actualGrams !== ing.targetGrams && (
                      <span className="text-[10px] font-mono" style={{
                        color: ing.actualGrams > ing.targetGrams ? '#EF4444' : '#10B981',
                      }}>
                        {ing.actualGrams > ing.targetGrams ? '+' : ''}{(ing.actualGrams - ing.targetGrams).toFixed(1)}g
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected ingredient edit controls */}
          {selectedIng && (
            <motion.div
              key={selectedIng.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'rgba(22,22,32,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                    {selectedIng.shadeCode}
                  </p>
                  <p className="text-[11px]" style={{ color: '#71717A' }}>
                    {selectedIng.series}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(selectedIng.id)}
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>

              {/* Gram stepper */}
              <div className="flex items-center justify-center gap-1">
                {[-10, -5, -1].map(step => (
                  <button
                    type="button"
                    key={step}
                    onClick={() => updateGrams(selectedIng.id, selectedIng.targetGrams + step)}
                    className="w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}
                  >
                    {step}
                  </button>
                ))}
                <div
                  className="px-4 h-9 rounded-lg flex items-center justify-center mx-1"
                  style={{
                    background: `${selectedIng.color}22`,
                    border: `1px solid ${selectedIng.color}44`,
                  }}
                >
                  <span className="text-base font-bold font-mono" style={{ color: selectedIng.color }}>
                    {selectedIng.targetGrams}g
                  </span>
                </div>
                {[1, 5, 10].map(step => (
                  <button
                    type="button"
                    key={step}
                    onClick={() => updateGrams(selectedIng.id, selectedIng.targetGrams + step)}
                    className="w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Developer Section */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4" style={{ color: '#9333EA' }} />
              <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>Developer</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: '#71717A' }}>Volume</span>
              <div className="flex gap-2">
                {[10, 20, 30, 40].map(vol => (
                  <button
                    type="button"
                    key={vol}
                    onClick={() => onDeveloperChange({ ...developer, volume: vol })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: developer.volume === vol ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.05)',
                      border: developer.volume === vol ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      color: developer.volume === vol ? '#9333EA' : '#A1A1AA',
                    }}
                  >
                    {vol}vol
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#71717A' }}>Ratio</span>
              <div className="flex gap-2">
                {['1:1', '1:1.5', '1:2'].map(ratio => (
                  <button
                    type="button"
                    key={ratio}
                    onClick={() => onRatioChange(ratio)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: mixingRatio === ratio ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.05)',
                      border: mixingRatio === ratio ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      color: mixingRatio === ratio ? '#9333EA' : '#A1A1AA',
                    }}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Products */}
          {onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-4"
              style={{ background: 'linear-gradient(135deg, #EC4899, #F472B6)', color: '#FFF' }}
            >
              <Plus className="w-4 h-4" />
              Add Products
            </button>
          )}

          {/* Bottom action bar — Vish-style */}
          <div className="flex gap-2">
            {onBalance && (
              <button type="button" onClick={onBalance}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}>
                <Scale className="w-4 h-4" /> Balance
              </button>
            )}
            {onNotes && (
              <button type="button" onClick={onNotes}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}>
                <StickyNote className="w-4 h-4" /> Notes
              </button>
            )}
            <button type="button"
              className="py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {onStartWeighing && (
              <button type="button" onClick={onStartWeighing}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                <Check className="w-4 h-4" /> Done
              </button>
            )}
          </div>
        </>
      ) : (
        /* Ingredient tab — detailed view of selected ingredient */
        selectedIng && (
          <div className="space-y-4">
            <div className="rounded-xl p-6 text-center" style={{ background: `${selectedIng.color}11`, border: `1px solid ${selectedIng.color}33` }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: selectedIng.color, opacity: 0.8 }} />
              <p className="text-lg font-bold" style={{ color: '#F5F5F7' }}>{selectedIng.shadeCode}</p>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>{selectedIng.series}</p>
              <p className="text-xs mt-1" style={{ color: '#71717A' }}>{selectedIng.brand}</p>
              <p className="text-3xl font-bold font-mono mt-4" style={{ color: selectedIng.color }}>
                {selectedIng.targetGrams}g
              </p>
            </div>
            {/* Ingredient tiles to switch */}
            <div className="grid grid-cols-3 gap-2">
              {ingredients.map(ing => (
                <button
                  type="button"
                  key={ing.id}
                  onClick={() => setSelectedId(ing.id)}
                  className="rounded-lg p-2 text-center"
                  style={{
                    background: ing.id === selectedId ? `${ing.color}22` : 'rgba(255,255,255,0.03)',
                    border: ing.id === selectedId ? `1px solid ${ing.color}44` : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: ing.color }} />
                  <p className="text-[10px] font-medium" style={{ color: '#F5F5F7' }}>{ing.shadeCode}</p>
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
