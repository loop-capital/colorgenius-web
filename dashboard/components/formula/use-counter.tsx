'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, AlertCircle, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseCounterProps {
  formulaId: string;
  salonId: string;
  perUseFee: number;
  creatorName: string;
  totalUses: number;
  remainingPurchases: number | null;
  onPurchase: () => void;
  onUse: () => void;
  compact?: boolean;
  className?: string;
}

// ─── Compact Badge ───────────────────────────────────────────────────────────

function CompactBadge({ perUseFee, remainingPurchases }: { perUseFee: number; remainingPurchases: number | null }) {
  const isLow = remainingPurchases !== null && remainingPurchases <= 3;
  const isEmpty = remainingPurchases !== null && remainingPurchases <= 0;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
      style={{
        background: isEmpty
          ? 'rgba(239,68,68,0.1)'
          : isLow
          ? 'rgba(245,158,11,0.1)'
          : 'rgba(16,185,129,0.08)',
        color: isEmpty ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
      }}
    >
      <DollarSign className="w-2.5 h-2.5" />
      <span>${perUseFee.toFixed(2)}/use</span>
      {remainingPurchases !== null && (
        <>
          <span style={{ color: '#71717A' }}>·</span>
          <span>{remainingPurchases} left</span>
        </>
      )}
    </div>
  );
}

// ─── Full Counter ────────────────────────────────────────────────────────────

export function UseCounter({
  formulaId,
  salonId,
  perUseFee,
  creatorName,
  totalUses,
  remainingPurchases,
  onPurchase,
  onUse,
  compact = false,
  className = '',
}: UseCounterProps) {
  const isEmpty = remainingPurchases !== null && remainingPurchases <= 0;
  const isLow = remainingPurchases !== null && remainingPurchases <= 3 && remainingPurchases > 0;

  if (compact) {
    return <CompactBadge perUseFee={perUseFee} remainingPurchases={remainingPurchases} />;
  }

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: 'rgba(30,30,45,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: '#9333EA' }} />
          <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
            Community Formula
          </span>
        </div>
        <span className="text-xs" style={{ color: '#71717A' }}>
          by {creatorName}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold font-mono" style={{ color: '#F5F5F7' }}>
            ${perUseFee.toFixed(2)}
          </p>
          <p className="text-[10px]" style={{ color: '#71717A' }}>per use</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold font-mono" style={{ color: '#F5F5F7' }}>
            {totalUses}
          </p>
          <p className="text-[10px]" style={{ color: '#71717A' }}>times used</p>
        </div>
        <div className="text-center">
          <p
            className="text-lg font-bold font-mono"
            style={{
              color: isEmpty ? '#EF4444' : isLow ? '#F59E0B' : '#F5F5F7',
            }}
          >
            {remainingPurchases === null ? '∞' : remainingPurchases}
          </p>
          <p className="text-[10px]" style={{ color: '#71717A' }}>remaining</p>
        </div>
      </div>

      {/* Warning */}
      {isLow && (
        <div
          className="flex items-center gap-2 p-2 rounded-lg mb-3"
          style={{ background: 'rgba(245,158,11,0.08)' }}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-[10px]" style={{ color: '#F59E0B' }}>
            Running low — consider purchasing more
          </span>
        </div>
      )}

      {isEmpty && (
        <div
          className="flex items-center gap-2 p-2 rounded-lg mb-3"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
          <span className="text-[10px]" style={{ color: '#EF4444' }}>
            No uses remaining — purchase more to continue
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isEmpty && (
          <button
            type="button"
            onClick={onUse}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#FFF',
            }}
          >
            <Check className="w-3.5 h-3.5" /> Use Formula
          </button>
        )}
        <button
          type="button"
          onClick={onPurchase}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{
            background: isEmpty
              ? 'linear-gradient(135deg, #9333EA, #EC4899)'
              : 'rgba(255,255,255,0.05)',
            color: isEmpty ? '#FFF' : '#A1A1AA',
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Buy More
        </button>
      </div>
    </div>
  );
}
