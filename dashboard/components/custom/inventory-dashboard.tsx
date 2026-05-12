'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Plus, Minus, RefreshCw, TrendingDown, Lock } from 'lucide-react';
import { useCanEdit } from '@/lib/user-context';

interface InventoryItem {
  id: string;
  brand: string;
  line: string;
  shadeCode: string;
  shadeName: string;
  currentGrams: number;
  reorderPoint: number;
  lastUsed: string;
  costPerGram: number;
}

const STORAGE_KEY = 'cg-inventory';

export function getInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveInventory(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function deductFromInventory(shadeCode: string, grams: number, brand: string) {
  const items = getInventory();
  const idx = items.findIndex(i => i.shadeCode === shadeCode && i.brand === brand);
  if (idx >= 0) {
    items[idx].currentGrams = Math.max(0, items[idx].currentGrams - grams);
    items[idx].lastUsed = new Date().toISOString();
    saveInventory(items);
  }
}

export function deductFormulaFromInventory(steps: Array<{ product: { shadeCode: string; brand?: string }; grams: number }>) {
  steps.forEach(step => {
    deductFromInventory(step.product.shadeCode, step.grams, step.product.brand || '');
  });
}

// ─── Inventory Dashboard Component ───────────────────────────────────

interface InventoryDashboardProps {
  className?: string;
}

export function InventoryDashboard({ className }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const { canEdit } = useCanEdit();

  useEffect(() => {
    setItems(getInventory());
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'low') return item.currentGrams > 0 && item.currentGrams <= item.reorderPoint;
    if (filter === 'out') return item.currentGrams === 0;
    return true;
  });

  const lowStock = items.filter(i => i.currentGrams > 0 && i.currentGrams <= i.reorderPoint).length;
  const outOfStock = items.filter(i => i.currentGrams === 0).length;
  const totalValue = items.reduce((sum, i) => sum + (i.currentGrams * i.costPerGram), 0);

  const handleAdjust = (id: string, delta: number) => {
    const updated = items.map(i => {
      if (i.id === id) {
        return { ...i, currentGrams: Math.max(0, i.currentGrams + delta) };
      }
      return i;
    });
    setItems(updated);
    saveInventory(updated);
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3" style={{ background: 'var(--cg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Total Items</p>
          <p className="text-xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>{items.length}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--cg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Low Stock</p>
          <p className="text-xl font-bold text-[#F59E0B]">{lowStock}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--cg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>Inventory Value</p>
          <p className="text-xl font-bold text-[#9333EA]">${totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `All (${items.length})` },
          { key: 'low', label: `Low (${lowStock})` },
          { key: 'out', label: `Out (${outOfStock})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f.key ? 'rgba(147, 51, 234, 0.15)' : 'var(--cg-surface)',
              border: filter === f.key ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: filter === f.key ? '#A855F7' : 'var(--cg-text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--cg-text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>
              {filter === 'all' ? 'No inventory items yet' : `No ${filter === 'low' ? 'low stock' : 'out of stock'} items`}
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isLow = item.currentGrams > 0 && item.currentGrams <= item.reorderPoint;
            const isOut = item.currentGrams === 0;
            const pct = Math.min(100, (item.currentGrams / (item.reorderPoint * 3)) * 100);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  background: 'var(--cg-surface)',
                  border: isOut ? '1px solid rgba(239,68,68,0.3)' : isLow ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--cg-text-primary)' }}>
                      {item.shadeCode} {item.shadeName}
                    </p>
                    {isOut && <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />}
                    {isLow && !isOut && <TrendingDown className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                    {item.brand} · {item.line}
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: isOut ? '#EF4444' : isLow ? '#F59E0B' : '#9333EA',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canEdit ? (<>
                  <button
                    onClick={() => handleAdjust(item.id, -10)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <Minus className="w-3 h-3" style={{ color: 'var(--cg-text-secondary)' }} />
                  </button>
                  <span className="text-sm font-mono font-bold w-14 text-center" style={{ color: 'var(--cg-text-primary)' }}>
                    {item.currentGrams}g
                  </span>
                  <button
                    onClick={() => handleAdjust(item.id, 10)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <Plus className="w-3 h-3" style={{ color: 'var(--cg-text-secondary)' }} />
                  </button>
                  </>) : (
                  <span className="text-sm font-mono font-bold w-14 text-center" style={{ color: 'var(--cg-text-primary)' }}>
                    {item.currentGrams}g
                  </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
