'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Plus, Minus, RefreshCw, TrendingDown, Lock } from 'lucide-react';
import { useCanEdit } from '@/lib/user-context';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InventoryItem {
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

interface ApiInventoryItem {
  id: string;
  salonId: string;
  brand: string;
  shadeCode: string;
  shadeName: string | null;
  quantity: number;
  unit: string | null;
  lowStockThreshold: number | null;
  lastUpdated: string | null;
}

const STORAGE_KEY = 'cg-inventory';

// ─── localStorage Helpers (cache / fallback) ──────────────────────────────────

function getCachedInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setCachedInventory(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── API Helpers ───────────────────────────────────────────────────────────────

async function fetchInventory(salonId: string): Promise<ApiInventoryItem[]> {
  const res = await fetch(`/api/v1/inventory?salonId=${encodeURIComponent(salonId)}&limit=500`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  const data = await res.json();
  return data.items || [];
}

export async function deductFromInventory(
  shadeCode: string,
  grams: number,
  brand: string,
  salonId?: string
): Promise<{ success: boolean; remaining?: number; lowStock?: boolean }> {
  // Always update localStorage cache immediately (optimistic)
  const cached = getCachedInventory();
  const idx = cached.findIndex((i) => i.shadeCode === shadeCode && i.brand === brand);
  if (idx >= 0) {
    cached[idx].currentGrams = Math.max(0, cached[idx].currentGrams - grams);
    cached[idx].lastUsed = new Date().toISOString();
    setCachedInventory(cached);
  }

  // If no salonId, stop at localStorage (offline mode)
  if (!salonId) {
    return { success: true };
  }

  try {
    const res = await fetch('/api/v1/inventory/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salonId,
        items: [{ shadeCode, brand, grams }],
      }),
    });
    if (!res.ok) throw new Error('API deduction failed');
    const data = await res.json();
    const result = data.results?.[0];
    return {
      success: true,
      remaining: result?.remaining,
      lowStock: result?.lowStock,
    };
  } catch (e) {
    console.error('deductFromInventory API error:', e);
    return { success: false };
  }
}

export async function deductFormulaFromInventory(
  steps: Array<{ product: { shadeCode: string; brand?: string }; grams: number }>,
  salonId?: string
): Promise<Array<{ shadeCode: string; brand: string; lowStock?: boolean }>> {
  const lowStockItems: Array<{ shadeCode: string; brand: string; lowStock?: boolean }> = [];

  // Batch API call if salonId present
  if (salonId) {
    const items = steps.map((step) => ({
      shadeCode: step.product.shadeCode,
      brand: step.product.brand || '',
      grams: step.grams,
    }));
    try {
      const res = await fetch('/api/v1/inventory/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, items }),
      });
      if (res.ok) {
        const data = await res.json();
        for (const r of data.results || []) {
          if (r.lowStock) {
            lowStockItems.push({ shadeCode: r.shadeCode, brand: r.brand, lowStock: true });
          }
        }
      }
    } catch (e) {
      console.error('deductFormulaFromInventory batch API error:', e);
    }
  }

  // Always update localStorage cache
  steps.forEach((step) => {
    deductFromInventory(step.product.shadeCode, step.grams, step.product.brand || '', undefined);
  });

  return lowStockItems;
}

// ─── Inventory Dashboard Component ───────────────────────────────────────────

interface InventoryDashboardProps {
  className?: string;
  salonId?: string;
}

export function InventoryDashboard({ className, salonId }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const { canEdit } = useCanEdit();
  const { toast } = useToast();

  const mapApiToUi = useCallback((apiItems: ApiInventoryItem[]): InventoryItem[] => {
    return apiItems.map((it) => ({
      id: it.id,
      brand: it.brand,
      line: it.brand,
      shadeCode: it.shadeCode,
      shadeName: it.shadeName || it.shadeCode,
      currentGrams: it.quantity || 0,
      reorderPoint: it.lowStockThreshold || 0,
      lastUsed: it.lastUpdated || new Date().toISOString(),
      costPerGram: 0,
    }));
  }, []);

  const loadItems = useCallback(async () => {
    // 1. Load from cache immediately
    const cached = getCachedInventory();
    if (cached.length > 0) setItems(cached);

    // 2. If salonId provided, fetch from API and merge
    if (salonId) {
      setLoading(true);
      try {
        const apiItems = await fetchInventory(salonId);
        const mapped = mapApiToUi(apiItems);
        setItems(mapped);
        setCachedInventory(mapped);
      } catch (e) {
        console.error('Failed to load inventory from API:', e);
        // Keep cached items on error
      } finally {
        setLoading(false);
      }
    }
  }, [salonId, mapApiToUi]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter((item) => {
    if (filter === 'low') return item.currentGrams > 0 && item.currentGrams <= item.reorderPoint;
    if (filter === 'out') return item.currentGrams === 0;
    return true;
  });

  const lowStock = items.filter((i) => i.currentGrams > 0 && i.currentGrams <= i.reorderPoint).length;
  const outOfStock = items.filter((i) => i.currentGrams === 0).length;
  const totalValue = items.reduce((sum, i) => sum + i.currentGrams * i.costPerGram, 0);

  const handleAdjust = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updated = items.map((i) => {
      if (i.id === id) {
        return { ...i, currentGrams: Math.max(0, i.currentGrams + delta) };
      }
      return i;
    });
    setItems(updated);
    setCachedInventory(updated);

    // Sync adjustment to API if salonId present
    if (salonId) {
      try {
        await fetch('/api/v1/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salonId,
            brand: item.brand,
            shadeCode: item.shadeCode,
            shadeName: item.shadeName,
            quantity: Math.max(0, item.currentGrams + delta),
            unit: 'g',
            lowStockThreshold: item.reorderPoint > 0 ? item.reorderPoint : undefined,
          }),
        });
      } catch (e) {
        console.error('Inventory adjustment sync error:', e);
      }
    }
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
        ].map((f) => (
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

      {/* Reorder alert banner */}
      {lowStock > 0 && (
        <div
          className="rounded-xl p-3 flex items-center gap-2 text-xs"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{lowStock} item{lowStock !== 1 ? 's' : ''} below reorder point. Restock soon.</span>
        </div>
      )}

      {/* Loading */}
      {loading && items.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" style={{ color: 'var(--cg-text-tertiary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>Loading inventory...</p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--cg-text-tertiary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>
              {filter === 'all' ? 'No inventory items yet' : `No ${filter === 'low' ? 'low stock' : 'out of stock'} items`}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
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
                  border: isOut
                    ? '1px solid rgba(239,68,68,0.3)'
                    : isLow
                      ? '1px solid rgba(245,158,11,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
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
                  {canEdit ? (
                    <>
                      <button
                        onClick={() => handleAdjust(item.id, -10)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <Minus className="w-3 h-3" style={{ color: 'var(--cg-text-secondary)' }}
                        />
                      </button>
                      <span className="text-sm font-mono font-bold w-14 text-center" style={{ color: 'var(--cg-text-primary)' }}>
                        {item.currentGrams}g
                      </span>
                      <button
                        onClick={() => handleAdjust(item.id, 10)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <Plus className="w-3 h-3" style={{ color: 'var(--cg-text-secondary)' }}
                        />
                      </button>
                    </>
                  ) : (
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
