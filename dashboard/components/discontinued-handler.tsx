'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, X, RefreshCw } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InactiveProduct {
  id: string;
  shadeCode: string;
  shadeName: string;
  brand: string;
  color: string;
  suggestedReplacement?: {
    id: string;
    shadeCode: string;
    shadeName: string;
    color: string;
  };
}

interface ActiveProduct {
  id: string;
  shadeCode: string;
  shadeName: string;
  brand: string;
  line: string;
  color: string;
}

interface DiscontinuedHandlerProps {
  inactiveProducts: InactiveProduct[];
  availableReplacements: ActiveProduct[];
  onReplace: (inactiveId: string, replacementId: string) => void;
  onContinueAnyway: () => void;
  onClose: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DiscontinuedHandler({
  inactiveProducts,
  availableReplacements,
  onReplace,
  onContinueAnyway,
  onClose,
  className = '',
}: DiscontinuedHandlerProps) {
  const [resolving, setResolving] = useState<string | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  const allResolved = inactiveProducts.every(p => resolved[p.id]);

  const handleQuickSwap = (product: InactiveProduct) => {
    if (product.suggestedReplacement) {
      setResolved(prev => ({ ...prev, [product.id]: product.suggestedReplacement!.id }));
      onReplace(product.id, product.suggestedReplacement.id);
    }
  };

  const handleCustomReplace = (inactiveId: string, replacementId: string) => {
    setResolved(prev => ({ ...prev, [inactiveId]: replacementId }));
    onReplace(inactiveId, replacementId);
    setShowCustomPicker(null);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#F5F5F7' }}>
            Inactive Products
          </h3>
          <p className="text-xs" style={{ color: '#71717A' }}>
            {inactiveProducts.length} product{inactiveProducts.length > 1 ? 's' : ''} need{inactiveProducts.length === 1 ? 's' : ''} replacement
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#71717A' }} />
        </button>
      </div>

      {/* Warning */}
      <div className="rounded-xl p-3 mb-4 flex items-center gap-2"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
        <span className="text-xs" style={{ color: '#F59E0B' }}>
          Mix Now is disabled until all inactive products are resolved.
        </span>
      </div>

      {/* Product list */}
      <div className="space-y-3 mb-4">
        {inactiveProducts.map(product => {
          const isResolved = !!resolved[product.id];
          const isShowingCustom = showCustomPicker === product.id;

          return (
            <motion.div
              key={product.id}
              layout
              className="rounded-xl overflow-hidden"
              style={{
                background: isResolved ? 'rgba(16,185,129,0.04)' : 'rgba(30,30,45,0.6)',
                border: isResolved ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="p-4">
                {/* Product header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: product.color, opacity: isResolved ? 0.4 : 0.8 }} />
                    <div>
                      <span className="text-sm font-semibold" style={{
                        color: isResolved ? '#71717A' : '#F5F5F7',
                        textDecoration: isResolved ? 'line-through' : 'none',
                      }}>
                        {product.shadeCode}
                      </span>
                      <span className="text-xs ml-1" style={{ color: '#71717A' }}>
                        {product.shadeName}
                      </span>
                    </div>
                  </div>
                  {isResolved ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                      Inactive
                    </span>
                  )}
                </div>

                {/* Resolved replacement */}
                {isResolved && (
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)' }}>
                    <ArrowRight className="w-3 h-3 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">
                      Replaced with {availableReplacements.find(r => r.id === resolved[product.id])?.shadeCode || 'selected product'}
                    </span>
                  </div>
                )}

                {/* Resolution options */}
                {!isResolved && !isShowingCustom && (
                  <div className="flex gap-2">
                    {product.suggestedReplacement && (
                      <button
                        type="button"
                        onClick={() => handleQuickSwap(product)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                        style={{ background: 'rgba(147,51,234,0.15)', color: '#A855F7' }}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Use {product.suggestedReplacement.shadeCode}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCustomPicker(product.id)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}
                    >
                      Custom Replacement
                    </button>
                  </div>
                )}

                {/* Custom picker */}
                {isShowingCustom && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {availableReplacements.map(rep => (
                      <button
                        type="button"
                        key={rep.id}
                        onClick={() => handleCustomReplace(product.id, rep.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white/5"
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: rep.color }} />
                        <span className="text-xs" style={{ color: '#F5F5F7' }}>
                          {rep.shadeCode} — {rep.shadeName}
                        </span>
                        <span className="text-[10px] ml-auto" style={{ color: '#71717A' }}>
                          {rep.brand} {rep.line}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onContinueAnyway}
          className="flex-1 py-3 rounded-xl text-xs font-medium"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA' }}
        >
          Close & Continue
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={!allResolved}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
        >
          <Check className="w-4 h-4" /> All Resolved
        </button>
      </div>
    </div>
  );
}
