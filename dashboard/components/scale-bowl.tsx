'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Check, BluetoothConnected, RotateCcw } from 'lucide-react';
import { useScale } from '@/lib/scale/use-scale';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BowlIngredient {
  id: string;
  name: string;
  brand: string;
  shadeCode: string;
  targetGrams: number;
  color: string;
  order: number;
}

interface BowlState {
  ingredients: BowlIngredient[];
  currentIndex: number;
  weights: Record<string, number>;
}

interface ScaleBowlProps {
  ingredients: BowlIngredient[];
  onComplete?: (weights: Record<string, number>) => void;
  onReweigh?: () => void;
  showUnitToggle?: boolean;
  className?: string;
}

// ─── Drop Shape (Vish-style egg/pear) ────────────────────────────────────────

const DROP_W = 220;
const DROP_H = 300;

// Smooth egg/pear — wider at top-center, tapers to soft point at bottom
const DROP_PATH = `
  M 110 18
  C 162 18, 195 55, 195 115
  C 195 168, 183 210, 162 240
  C 144 264, 128 280, 110 292
  C 92 280, 76 264, 58 240
  C 37 210, 25 168, 25 115
  C 25 55, 58 18, 110 18
  Z
`;

// ─── Component ───────────────────────────────────────────────────────────────

export function ScaleBowl({
  ingredients,
  onComplete,
  onReweigh,
  showUnitToggle = true,
  className = '',
}: ScaleBowlProps) {
  const { connected, weight, device, connect, disconnect, tare, connecting, isSupported, error } =
    useScale();

  const [bowl, setBowl] = useState<BowlState>({
    ingredients: ingredients.sort((a, b) => a.order - b.order),
    currentIndex: 0,
    weights: {},
  });
  const [unit, setUnit] = useState<'g' | 'oz'>('g');
  const [showMenu, setShowMenu] = useState(false);

  const currentIngredient = bowl.ingredients[bowl.currentIndex];
  const totalTarget = ingredients.reduce((sum, i) => sum + i.targetGrams, 0);
  const totalCurrent = Object.values(bowl.weights).reduce((sum, w) => sum + w, 0);
  const fillPercent = totalTarget > 0 ? Math.min(totalCurrent / totalTarget, 1) : 0;
  const isComplete = bowl.currentIndex >= bowl.ingredients.length && bowl.ingredients.length > 0;

  const convertWeight = (g: number) =>
    unit === 'oz' ? (g / 28.3495).toFixed(2) : g.toFixed(1);
  const unitLabel = unit === 'oz' ? 'oz' : 'g';

  // Capture weight for current ingredient
  const captureWeight = useCallback(() => {
    if (!currentIngredient || !weight) return;
    const grams = Math.round(weight.value * 10) / 10;
    setBowl(prev => {
      const newWeights = { ...prev.weights, [currentIngredient.id]: grams };
      const nextIndex = prev.currentIndex + 1;
      const done = nextIndex >= prev.ingredients.length;
      if (done && onComplete) setTimeout(() => onComplete(newWeights), 400);
      return { ...prev, weights: newWeights, currentIndex: done ? prev.currentIndex : nextIndex };
    });
    tare();
  }, [currentIngredient, weight, tare, onComplete]);

  // Reweigh current ingredient
  const reweigh = useCallback(() => {
    if (!currentIngredient) return;
    setBowl(prev => {
      const newWeights = { ...prev.weights };
      delete newWeights[currentIngredient.id];
      return {
        ...prev,
        weights: newWeights,
        currentIndex: bowl.ingredients.findIndex(i => i.id === currentIngredient.id),
      };
    });
    tare();
  }, [currentIngredient, bowl.ingredients, tare]);

  const currentTarget = currentIngredient?.targetGrams || 0;
  const currentWeighed = currentIngredient ? bowl.weights[currentIngredient.id] || 0 : 0;
  const currentRemaining = Math.max(0, currentTarget - currentWeighed);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Header: total weight */}
      <div className="text-center mb-2">
        <span
          className="text-5xl font-bold font-mono tracking-tight"
          style={{ color: '#F5F5F7' }}
        >
          {convertWeight(totalCurrent)}
        </span>
        <span className="text-lg ml-1" style={{ color: '#71717A' }}>
          / {convertWeight(totalTarget)}
          {unitLabel}
        </span>
      </div>

      {/* Unit toggle */}
      {showUnitToggle && (
        <button
          type="button"
          onClick={() => setUnit(u => (u === 'g' ? 'oz' : 'g'))}
          className="text-[10px] mb-4 px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#71717A',
          }}
        >
          {unit === 'g' ? 'Switch to oz' : 'Switch to g'}
        </button>
      )}

      {/* Drop Visualization — Vish-style layered fill */}
      <div className="relative mb-4" style={{ width: DROP_W, height: DROP_H }}>
        <svg width={DROP_W} height={DROP_H} viewBox={`0 0 ${DROP_W} ${DROP_H}`}>
          <defs>
            <clipPath id="dropClip">
              <path d={DROP_PATH} />
            </clipPath>
            {/* Glow filter for the whole drop */}
            <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Subtle inner shadow */}
            <filter id="innerShadow">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="3" result="shadow" />
              <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>
          </defs>

          {/* Outer glow ring */}
          <path
            d={DROP_PATH}
            fill="none"
            stroke="rgba(147,51,234,0.08)"
            strokeWidth="3"
            filter="url(#dropGlow)"
          />

          {/* Drop background */}
          <path
            d={DROP_PATH}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
          />

          {/* Stacked fill layers (clipped to drop) */}
          <g clipPath="url(#dropClip)">
            {ingredients.map((ing, i) => {
              const ingWeight = bowl.weights[ing.id] || 0;
              if (ingWeight <= 0) return null;

              // Height proportional to weight vs total target
              const layerHeight = (ingWeight / totalTarget) * (DROP_H * 0.88);
              // Position: stack from bottom up
              const prevFill = ingredients
                .slice(0, i)
                .reduce((s, p) => s + ((bowl.weights[p.id] || 0) / totalTarget), 0);
              const layerY = DROP_H - (prevFill * DROP_H * 0.88) - layerHeight;

              const isCurrent = ing.id === currentIngredient?.id;

              return (
                <g key={ing.id}>
                  {/* Layer fill with gradient */}
                  <defs>
                    <linearGradient
                      id={`layer-${ing.id}`}
                      x1="0%"
                      y1="100%"
                      x2="0%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor={ing.color} stopOpacity={isCurrent ? 0.95 : 0.6} />
                      <stop offset="100%" stopColor={ing.color} stopOpacity={isCurrent ? 0.7 : 0.35} />
                    </linearGradient>
                  </defs>
                  <motion.rect
                    x={10}
                    y={layerY}
                    width={DROP_W - 20}
                    height={layerHeight + 2}
                    fill={`url(#layer-${ing.id})`}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ transformOrigin: 'center bottom' }}
                  />

                  {/* Layer label (shade code) if tall enough */}
                  {layerHeight > 35 && (
                    <text
                      x={DROP_W / 2}
                      y={layerY + layerHeight / 2 + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="13"
                      fontWeight="700"
                      fontFamily="system-ui"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                    >
                      {ing.shadeCode}
                    </text>
                  )}

                  {/* Thin separator line between layers */}
                  <line
                    x1={30}
                    y1={layerY}
                    x2={DROP_W - 30}
                    y2={layerY}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}

            {/* Liquid surface wave animation */}
            {fillPercent > 0.02 && (
              <motion.ellipse
                cx={DROP_W / 2}
                cy={DROP_H - fillPercent * DROP_H * 0.88}
                rx={70}
                ry={4}
                fill="rgba(255,255,255,0.06)"
                animate={{
                  rx: [65, 75, 65],
                  ry: [3, 5, 3],
                  cy: [
                    DROP_H - fillPercent * DROP_H * 0.88 - 1,
                    DROP_H - fillPercent * DROP_H * 0.88 + 1,
                    DROP_H - fillPercent * DROP_H * 0.88 - 1,
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </g>

          {/* Drop highlight (top left reflection) */}
          <ellipse
            cx={80}
            cy={60}
            rx={25}
            ry={35}
            fill="rgba(255,255,255,0.02)"
            transform="rotate(-15, 80, 60)"
          />
        </svg>
      </div>

      {/* Current product card */}
      {!isComplete && currentIngredient && (
        <motion.div
          key={currentIngredient.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl p-4 mb-3"
          style={{
            background: 'rgba(22,22,32,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: currentIngredient.color }}
              />
              <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                {currentIngredient.shadeCode}
              </span>
              <span className="text-xs" style={{ color: '#71717A' }}>
                {currentIngredient.brand}
              </span>
            </div>
            <span className="text-lg font-bold font-mono" style={{ color: '#F5F5F7' }}>
              {convertWeight(currentWeighed)}
              <span className="text-xs ml-0.5" style={{ color: '#71717A' }}>
                / {convertWeight(currentTarget)}
                {unitLabel}
              </span>
            </span>
          </div>

          {/* Remaining indicator */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: currentIngredient.color }}
                  animate={{
                    width: `${Math.min((currentWeighed / currentTarget) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{
                color: currentRemaining <= 0 ? '#10B981' : '#F59E0B',
              }}
            >
              {currentRemaining <= 0
                ? '✓ Complete'
                : `${convertWeight(currentRemaining)}${unitLabel} remaining`}
            </span>
          </div>
        </motion.div>
      )}

      {/* Up Next queue */}
      {!isComplete && bowl.currentIndex < bowl.ingredients.length - 1 && (
        <div className="w-full mb-3">
          {bowl.ingredients.slice(bowl.currentIndex + 1, bowl.currentIndex + 3).map(ing => (
            <div
              key={ing.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg mb-1"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: ing.color, opacity: 0.4 }}
                />
                <span className="text-[11px]" style={{ color: '#71717A' }}>
                  {ing.shadeCode}
                </span>
              </div>
              <span className="text-[11px] font-mono" style={{ color: '#71717A' }}>
                {convertWeight(ing.targetGrams)}
                {unitLabel}
              </span>
            </div>
          ))}
          {bowl.ingredients.length > bowl.currentIndex + 3 && (
            <p className="text-[10px] text-center mt-1" style={{ color: '#71717A' }}>
              +{bowl.ingredients.length - bowl.currentIndex - 3} more
            </p>
          )}
        </div>
      )}

      {/* Complete state */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-2xl p-5 mb-3 text-center"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <Check className="w-8 h-8 mx-auto mb-2 text-[#10B981]" />
          <p className="text-sm font-semibold text-[#10B981]">All components weighed</p>
          <p className="text-xs mt-1" style={{ color: '#71717A' }}>
            {convertWeight(totalCurrent)}{unitLabel} / {convertWeight(totalTarget)}{unitLabel}
          </p>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <div
          className="w-full mb-3 p-3 rounded-xl text-xs"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Action bar */}
      <div className="w-full flex gap-3">
        {!connected ? (
          <button
            type="button"
            onClick={connect}
            disabled={connecting || !isSupported}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#FFF',
            }}
          >
            <Scale className="w-4 h-4" />
            {connecting ? 'Scanning...' : 'Connect Scale'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={tare}
              className="py-3.5 px-5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: 'rgba(147,51,234,0.12)', color: '#A855F7' }}
            >
              <RotateCcw className="w-4 h-4" />
              Tare
            </button>

            {!isComplete && (
              <button
                type="button"
                onClick={captureWeight}
                disabled={!weight || weight.value <= 0}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                  color: '#FFF',
                }}
              >
                <Check className="w-4 h-4" />
                Capture {weight?.value ? `${convertWeight(weight.value)}${unitLabel}` : ''}
              </button>
            )}

            {isComplete && (
              <button
                type="button"
                onClick={() => onComplete?.(bowl.weights)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFF',
                }}
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            )}

            {onReweigh && isComplete && (
              <button
                type="button"
                onClick={onReweigh}
                className="py-3.5 px-5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
              >
                <Scale className="w-4 h-4" />
                Reweigh
              </button>
            )}
          </>
        )}
      </div>

      {/* Scale connection indicator */}
      {connected && (
        <div className="flex items-center gap-1.5 mt-3">
          <BluetoothConnected className="w-3 h-3 text-[#10B981]" />
          <span className="text-[10px]" style={{ color: '#10B981' }}>
            {device?.model || 'Scale'} connected
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Mini drop indicator (for formula cards / service view) ──────────────────

interface DropIndicatorProps {
  ingredients: { name: string; shadeCode: string; color: string; targetGrams: number }[];
  totalCurrent: number;
  totalTarget: number;
  size?: 'sm' | 'md';
}

export function DropIndicator({
  ingredients,
  totalCurrent,
  totalTarget,
  size = 'sm',
}: DropIndicatorProps) {
  const dims = size === 'sm' ? { w: 36, h: 48 } : { w: 50, h: 68 };

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: dims.w, height: dims.h }}>
        <svg
          width={dims.w}
          height={dims.h}
          viewBox="0 0 220 300"
          className="absolute inset-0"
        >
          <defs>
            <clipPath id="miniDropClip">
              <path d={DROP_PATH} />
            </clipPath>
          </defs>
          <path
            d={DROP_PATH}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <g clipPath="url(#miniDropClip)">
            {ingredients.map((ing, i) => {
              if (ing.targetGrams <= 0) return null;
              const layerH = (ing.targetGrams / Math.max(totalTarget, 1)) * 264;
              const prevH = ingredients
                .slice(0, i)
                .reduce((s, p) => s + (p.targetGrams / Math.max(totalTarget, 1)) * 264, 0);
              return (
                <rect
                  key={ing.name}
                  x={10}
                  y={290 - prevH - layerH}
                  width={200}
                  height={layerH + 2}
                  fill={ing.color}
                  opacity={0.6}
                />
              );
            })}
          </g>
        </svg>
      </div>
      <div>
        <span className="text-xs font-mono font-bold" style={{ color: '#F5F5F7' }}>
          {totalCurrent.toFixed(1)}g
        </span>
        <span className="text-xs ml-0.5" style={{ color: '#71717A' }}>
          / {totalTarget.toFixed(1)}g
        </span>
        <div className="flex gap-1 mt-1">
          {ingredients.map(ing => (
            <div
              key={ing.name}
              className="rounded-full"
              style={{
                width: size === 'sm' ? 5 : 7,
                height: size === 'sm' ? 5 : 7,
                background: ing.color,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
