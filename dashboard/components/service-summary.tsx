'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceCostItem {
  name: string;
  shadeCode: string;
  color: string;
  gramsUsed: number;
  costPerGram: number;
  totalCost: number;
}

interface ServiceSummaryProps {
  serviceName: string;
  items: ServiceCostItem[];
  productAllowance: number;   // salon-set allowance for this service
  totalCost: number;
  onClose: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ServiceSummary({
  serviceName,
  items,
  productAllowance,
  totalCost,
  onClose,
  className = '',
}: ServiceSummaryProps) {
  const overAllowance = totalCost > productAllowance;
  const extraCharge = Math.max(0, totalCost - productAllowance);
  const remaining = Math.max(0, productAllowance - totalCost);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#F5F5F7' }}>
            Service Summary
          </h3>
          <p className="text-xs" style={{ color: '#71717A' }}>{serviceName}</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {/* Product breakdown */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4" style={{ color: '#9333EA' }} />
          <span className="text-xs font-semibold" style={{ color: '#71717A' }}>PRODUCT COST</span>
        </div>

        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2"
            style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <div>
                <span className="text-sm" style={{ color: '#F5F5F7' }}>{item.shadeCode}</span>
                <span className="text-[10px] ml-1" style={{ color: '#71717A' }}>{item.gramsUsed}g</span>
              </div>
            </div>
            <span className="text-sm font-mono" style={{ color: '#F5F5F7' }}>${item.totalCost.toFixed(2)}</span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>Total Product Cost</span>
          <span className="text-lg font-bold font-mono" style={{ color: '#F5F5F7' }}>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Allowance comparison */}
      <div className="rounded-xl p-4 mb-4" style={{
        background: overAllowance ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
        border: overAllowance ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(16,185,129,0.15)',
      }}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: '#71717A' }}>Allowance</p>
            <p className="text-base font-bold font-mono" style={{ color: '#F5F5F7' }}>
              ${productAllowance.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: '#71717A' }}>Actual</p>
            <p className="text-base font-bold font-mono" style={{
              color: overAllowance ? '#EF4444' : '#10B981',
            }}>
              ${totalCost.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: '#71717A' }}>
              {overAllowance ? 'Over' : 'Remaining'}
            </p>
            <div className="flex items-center justify-center gap-1">
              {overAllowance ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#10B981]" />
              )}
              <p className="text-base font-bold font-mono" style={{
                color: overAllowance ? '#EF4444' : '#10B981',
              }}>
                ${overAllowance ? extraCharge.toFixed(2) : remaining.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Over allowance warning */}
      {overAllowance && (
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <span className="text-sm font-semibold text-[#EF4444]">Over Product Allowance</span>
          </div>
          <p className="text-xs" style={{ color: '#A1A1AA' }}>
            Consider passing the extra ${extraCharge.toFixed(2)} charge to the guest.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Compact Summary Button (for top-right of mixing screen) ─────────────────

interface SummaryButtonProps {
  totalCost: number;
  productAllowance: number;
  onClick: () => void;
}

export function SummaryButton({ totalCost, productAllowance, onClick }: SummaryButtonProps) {
  const overAllowance = totalCost > productAllowance;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: overAllowance ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
        color: overAllowance ? '#EF4444' : '#F5F5F7',
      }}
    >
      <DollarSign className="w-3 h-3" />
      <span className="font-mono">${totalCost.toFixed(2)}</span>
      {overAllowance && <AlertTriangle className="w-3 h-3" />}
    </button>
  );
}
