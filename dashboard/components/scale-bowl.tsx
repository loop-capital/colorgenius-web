'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Check, BluetoothConnected, RotateCcw } from 'lucide-react';
import { useScale } from '@/lib/scale/use-scale';
import { deductFormulaFromInventory } from '../components/custom/inventory-dashboard';

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
  salonId?: string;
  onComplete?: (weights: Record<string, number>) => void;
  onReweigh?: () => void;
  showUnitToggle?: boolean;
  className?: string;
}

// ─── Round Bowl Shape ─────────────────────────────────────────────────────────

const BOWL_W = 240;
const BOWL_H = 200;

// Round mixing bowl viewed from front:
// - Wide elliptical opening at top
// - Rounded bottom (hemisphere-like)
// - Center of bowl at roughly (120, 110)
const BOWL_PATH = `
  M 20 60
  C 20 160, 60 190, 120 190
  C 180 190, 220 160, 220 60
  C 220 40, 200 30, 120 30
  C 40 30, 20 40, 20 60
  Z
`;

// Inner bowl path (slightly inset for depth)
const BOWL_INNER_PATH = `
  M 28 62
  C 28 148, 64 178, 120 178
  C 176 178, 212 148, 212 62
  C 212 46, 194 38, 120 38
  C 46 38, 28 46, 28 62
  Z
`;

// Rim ellipse
const RIM_PATH = `
  M 20 60
  C 20 76, 60 86, 120 86
  C 180 86, 220 76, 220 60
  C 220 44, 180 34, 120 34
  C 60 34, 20 44, 20 60
  Z
`;

// ─── Component ───────────────────────────────────────────────────────────────

export function ScaleBowl({
  ingredients,
  salonId,
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
  const [pouringIngredient, setPouringIngredient] = useState<string | null>(null);
  const [pourComplete, setPourComplete] = useState(false);

  const currentIngredient = bowl.ingredients[bowl.currentIndex];
  const totalTarget = ingredients.reduce((sum, i) => sum + i.targetGrams, 0);
  const totalCurrent = Object.values(bowl.weights).reduce((sum, w) => sum + w, 0);
  const fillPercent = totalTarget > 0 ? Math.min(totalCurrent / totalTarget, 1) : 0;
  const isComplete = bowl.currentIndex >= bowl.ingredients.length && bowl.ingredients.length > 0;

  const convertWeight = (g: number) =>
    unit === 'oz' ? (g / 28.3495).toFixed(2) : g.toFixed(1);
  const unitLabel = unit === 'oz' ? 'oz' : 'g';

  // ─── Pour Animation ──────────────────────────────────────────────────────
  const triggerPourAnimation = useCallback((ingredientId: string) => {
    setPouringIngredient(ingredientId);
    setPourComplete(false);
    setTimeout(() => setPourComplete(true), 1200);
    setTimeout(() => setPouringIngredient(null), 1600);
  }, []);

  // ─── Inventory Deduction ───────────────────────────────────────────────────
  const handleInventoryDeduction = useCallback(
    async (weights: Record<string, number>) => {
      if (!salonId) return;

      const steps = bowl.ingredients
        .filter((ing) => weights[ing.id] && weights[ing.id] > 0)
        .map((ing) => ({
          product: { shadeCode: ing.shadeCode, brand: ing.brand },
          grams: weights[ing.id],
        }));

      if (steps.length > 0) {
        try {
          await deductFormulaFromInventory(steps, salonId);
        } catch (e) {
          console.error('Inventory deduction failed:', e);
        }
      }

      // If there's leftover formula, record it as a bowl remainder
      if (totalTarget > totalCurrent) {
        const remainderGrams = totalCurrent;
        try {
          await fetch('/api/v1/bowls/remainder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              salonId,
              formulaGrams: totalTarget,
              remainderGrams,
              ingredients: bowl.ingredients.map((ing) => ({
                shadeCode: ing.shadeCode,
                brand: ing.brand,
                targetGrams: ing.targetGrams,
                actualGrams: weights[ing.id] || 0,
              })),
            }),
          });
        } catch (e) {
          console.error('Bowl remainder API call failed:', e);
        }
      }
    },
    [salonId, bowl.ingredients, totalTarget, totalCurrent]
  );

  // ─── Capture Weight ──────────────────────────────────────────────────────
  const captureWeight = useCallback(() => {
    if (!currentIngredient || !weight) return;
    const grams = Math.round(weight.value * 10) / 10;

    // Trigger pour animation
    triggerPourAnimation(currentIngredient.id);

    setBowl((prev) => {
      const newWeights = { ...prev.weights, [currentIngredient.id]: grams };
      const nextIndex = prev.currentIndex + 1;
      const done = nextIndex >= prev.ingredients.length;
      if (done && onComplete) {
        // Wait for pour animation then call onComplete + inventory deduction
        setTimeout(() => {
          onComplete(newWeights);
          handleInventoryDeduction(newWeights);
        }, 600);
      }
      return { ...prev, weights: newWeights, currentIndex: done ? prev.currentIndex : nextIndex };
    });
    tare();
  }, [
    currentIngredient,
    weight,
    tare,
    onComplete,
    triggerPourAnimation,
    handleInventoryDeduction,
  ]);

  // ─── Reweigh ───────────────────────────────────────────────────────────────
  const reweigh = useCallback(() => {
    if (!currentIngredient) return;
    setBowl((prev) => {
      const newWeights = { ...prev.weights };
      delete newWeights[currentIngredient.id];
      return {
        ...prev,
        weights: newWeights,
        currentIndex: bowl.ingredients.findIndex((i) => i.id === currentIngredient.id),
      };
    });
    tare();
  }, [currentIngredient, bowl.ingredients, tare]);

  const currentTarget = currentIngredient?.targetGrams || 0;
  const currentWeighed = currentIngredient ? bowl.weights[currentIngredient.id] || 0 : 0;
  const currentRemaining = Math.max(0, currentTarget - currentWeighed);

  // ─── Bowl Geometry Helpers ───────────────────────────────────────────────
  const bowlCenterX = BOWL_W / 2; // 120
  const bowlBottomY = 178;
  const bowlTopY = 62;
  const bowlDepth = bowlBottomY - bowlTopY; // 116
  const liquidMaxHeight = bowlDepth * 0.92; // leave some space at top

  // Calculate fill height based on total current vs total target
  const currentFillHeight = totalTarget > 0
    ? (totalCurrent / totalTarget) * liquidMaxHeight
    : 0;
  const liquidTopY = bowlBottomY - currentFillHeight;

  // Meniscus (curved surface) path
  const getMeniscusPath = (y: number, fillPct: number) => {
    const widthAtY = 30 + (1 - (y - bowlTopY) / bowlDepth) * 160;
    const leftX = bowlCenterX - widthAtY / 2;
    const rightX = bowlCenterX + widthAtY / 2;
    const curveY = y - 6 * Math.sin(fillPct * Math.PI); // subtle curve
    return `M ${leftX} ${y} Q ${bowlCenterX} ${curveY} ${rightX} ${y}`;
  };

  // Get layer bounds for stacking
  const getLayerBounds = () => {
    const layers: Array<{
      id: string;
      y: number;
      height: number;
      color: string;
      shadeCode: string;
      isCurrent: boolean;
    }> = [];

    let currentY = bowlBottomY;
    for (let i = ingredients.length - 1; i >= 0; i--) {
      const ing = ingredients[i];
      const ingWeight = bowl.weights[ing.id] || 0;
      if (ingWeight <= 0) continue;

      const layerHeight = (ingWeight / totalTarget) * liquidMaxHeight;
      const layerY = currentY - layerHeight;

      layers.unshift({
        id: ing.id,
        y: layerY,
        height: layerHeight,
        color: ing.color,
        shadeCode: ing.shadeCode,
        isCurrent: ing.id === currentIngredient?.id,
      });

      currentY = layerY;
    }

    return layers.reverse(); // bottom to top
  };

  const layerBounds = getLayerBounds();

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
          onClick={() => setUnit((u) => (u === 'g' ? 'oz' : 'g'))}
          className="text-[10px] mb-4 px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#71717A',
          }}
        >
          {unit === 'g' ? 'Switch to oz' : 'Switch to g'}
        </button>
      )}

      {/* Round Bowl Visualization */}
      <div className="relative mb-4" style={{ width: BOWL_W, height: BOWL_H + 40 }}>
        <svg
          width={BOWL_W}
          height={BOWL_H + 40}
          viewBox={`0 0 ${BOWL_W} ${BOWL_H + 40}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Bowl clip path (inner) */}
            <clipPath id="bowlClip">
              <path d={BOWL_INNER_PATH} />
            </clipPath>

            {/* Glow filter */}
            <filter id="bowlGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Drop shadow */}
            <filter id="bowlShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
            </filter>

            {/* Liquid surface gradient */}
            <linearGradient id="liquidSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Glass reflection gradient */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Drop shadow ellipse under bowl */}
          <ellipse
            cx={bowlCenterX}
            cy={BOWL_H + 15}
            rx={80}
            ry={12}
            fill="rgba(0,0,0,0.25)"
            filter="url(#bowlShadow)"
          />

          {/* Outer bowl body (glass/ceramic look) */}
          <path
            d={BOWL_PATH}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
            filter="url(#bowlGlow)"
          />

          {/* ─── Liquid Fill Layers ───────────────────────────────────────── */}
          <g clipPath="url(#bowlClip)">
            {layerBounds.map((layer, idx) => {
              // Build a path that fills from this layer's top to bottom of bowl
              const prevLayersHeight = layerBounds
                .slice(0, idx)
                .reduce((sum, l) => sum + l.height, 0);
              const layerBottomY = bowlBottomY - prevLayersHeight;
              const layerTopY = layerBottomY - layer.height;

              // Simplified: draw rect within clip
              return (
                <g key={layer.id}>
                  <defs>
                    <linearGradient
                      id={`layer-grad-${layer.id}`}
                      x1="0%"
                      y1="100%"
                      x2="0%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor={layer.color}
                        stopOpacity={layer.isCurrent ? 0.95 : 0.65}
                      />
                      <stop
                        offset="100%"
                        stopColor={layer.color}
                        stopOpacity={layer.isCurrent ? 0.75 : 0.45}
                      />
                    </linearGradient>
                  </defs>

                  <motion.rect
                    x={10}
                    y={layerTopY}
                    width={BOWL_W - 20}
                    height={layerBottomY - layerTopY + 2}
                    fill={`url(#layer-grad-${layer.id})`}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ transformOrigin: 'center bottom' }}
                  />

                  {/* Shade code label on thick layers */}
                  {layer.height > 28 && (
                    <text
                      x={bowlCenterX}
                      y={layerTopY + layer.height / 2 + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="system-ui"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                    >
                      {layer.shadeCode}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Meniscus (curved surface line) at fill top */}
            {fillPercent > 0.02 && layerBounds.length > 0 && (
              <motion.path
                d={getMeniscusPath(liquidTopY, fillPercent)}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Liquid surface wave animation */}
            {fillPercent > 0.02 && layerBounds.length > 0 && (
              <motion.ellipse
                cx={bowlCenterX}
                cy={liquidTopY}
                rx={60}
                ry={3}
                fill="rgba(255,255,255,0.05)"
                animate={{
                  rx: [55, 65, 55],
                  ry: [2, 4, 2],
                  cy: [liquidTopY - 0.5, liquidTopY + 0.5, liquidTopY - 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Glass reflection overlay */}
            <rect
              x={30}
              y={40}
              width={40}
              height={120}
              rx={20}
              fill="url(#glassReflection)"
              opacity="0.3"
            />
          </g>

          {/* Rim highlight */}
          <path
            d={RIM_PATH}
            fill="none"
            stroke="rgba(147,51,234,0.25)"
            strokeWidth="2"
            filter="url(#bowlGlow)"
          />
          <path
            d={RIM_PATH}
            fill="none"
            stroke="rgba(147,51,234,0.12)"
            strokeWidth="0.5"
          />

          {/* Top rim highlight arc */}
          <path
            d={`M 40 58 Q 120 50 200 58`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* ─── Pour Animation ────────────────────────────────────────────── */}
        <AnimatePresence>
          {pouringIngredient && currentIngredient && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: bowlCenterX - 4,
                top: -20,
                width: 8,
                height: bowlTopY + 20,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stream */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 6,
                  background: `linear-gradient(to bottom, ${currentIngredient.color}, ${currentIngredient.color}88)`,
                }}
                initial={{ height: 0, top: 0 }}
                animate={{ height: '100%', top: 0 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
              />
              {/* Droplets */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: '50%',
                    width: 4 + i * 2,
                    height: 4 + i * 2,
                    marginLeft: -(2 + i),
                    background: currentIngredient.color,
                  }}
                  initial={{ top: 0, opacity: 1, scale: 1 }}
                  animate={{
                    top: bowlTopY + 30 + i * 20,
                    opacity: [1, 1, 0],
                    scale: [1, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 0.5 + i * 0.15,
                    delay: 0.3 + i * 0.1,
                    ease: 'easeIn',
                  }}
                />
              ))}
              {/* Splash at bottom */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  bottom: -10,
                  width: 20,
                  height: 10,
                  marginLeft: -10,
                  background: `radial-gradient(ellipse, ${currentIngredient.color}66, transparent)`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 0.6, 0] }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
          {bowl.ingredients
            .slice(bowl.currentIndex + 1, bowl.currentIndex + 3)
            .map((ing) => (
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
            {convertWeight(totalCurrent)}
            {unitLabel} / {convertWeight(totalTarget)}
            {unitLabel}
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
                Capture{' '}
                {weight?.value ? `${convertWeight(weight.value)}${unitLabel}` : ''}
              </button>
            )}

            {isComplete && (
              <button
                type="button"
                onClick={() => {
                  onComplete?.(bowl.weights);
                  handleInventoryDeduction(bowl.weights);
                }}
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

  // Mini bowl path scaled
  const miniBowlPath = `
    M 4 12
    C 4 36, 16 46, 28 46
    C 40 46, 52 36, 52 12
    C 52 6, 46 4, 28 4
    C 10 4, 4 6, 4 12
    Z
  `;

  const miniBowlInner = `
    M 6 13
    C 6 34, 16 42, 28 42
    C 40 42, 50 34, 50 13
    C 50 8, 44 6, 28 6
    C 12 6, 6 8, 6 13
    Z
  `;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: dims.w, height: dims.h }}>
        <svg
          width={dims.w}
          height={dims.h}
          viewBox="0 0 56 52"
          className="absolute inset-0"
        >
          <defs>
            <clipPath id="miniBowlClip">
              <path d={miniBowlInner} />
            </clipPath>
          </defs>

          {/* Bowl outline */}
          <path
            d={miniBowlPath}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* Layer fills */}
          <g clipPath="url(#miniBowlClip)">
            {ingredients.map((ing, i) => {
              if (ing.targetGrams <= 0) return null;
              const layerH = (ing.targetGrams / Math.max(totalTarget, 1)) * 38;
              const prevH = ingredients
                .slice(0, i)
                .reduce((s, p) => s + (p.targetGrams / Math.max(totalTarget, 1)) * 38, 0);
              return (
                <rect
                  key={ing.name}
                  x={2}
                  y={44 - prevH - layerH}
                  width={52}
                  height={layerH + 2}
                  fill={ing.color}
                  opacity={0.6}
                />
              );
            })}
          </g>

          {/* Rim */}
          <ellipse
            cx={28}
            cy={12}
            rx={24}
            ry={5}
            fill="none"
            stroke="rgba(147,51,234,0.2)"
            strokeWidth="0.5"
          />
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
          {ingredients.map((ing) => (
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

// ─── Scale Weight Badge ─────────────────────────────────────────────────────

interface ScaleWeightBadgeProps {
  weight: number;
  target?: number;
  color?: string;
}

export function ScaleWeightBadge({ weight, target, color }: ScaleWeightBadgeProps) {
  const isClose = target !== undefined && Math.abs(weight - target) <= target * 0.05;
  const isOver = target !== undefined && weight > target;

  return (
    <div className="flex items-center gap-2">
      <div
        className="px-3 py-1.5 rounded-xl font-mono text-sm font-bold"
        style={{
          background: isOver
            ? 'rgba(239,68,68,0.1)'
            : isClose
              ? 'rgba(16,185,129,0.1)'
              : 'rgba(255,255,255,0.05)',
          color: isOver ? '#EF4444' : isClose ? '#10B981' : '#F5F5F7',
          border: `1px solid ${isOver ? 'rgba(239,68,68,0.2)' : isClose ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {weight.toFixed(1)}g
      </div>
      {target !== undefined && (
        <span className="text-xs" style={{ color: '#71717A' }}>
          / {target.toFixed(1)}g
        </span>
      )}
    </div>
  );
}
