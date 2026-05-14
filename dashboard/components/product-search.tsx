'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Minus, Check, Package } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectedProduct {
  id: string;
  brand: string;
  line: string;
  shadeCode: string;
  shadeName: string;
  color: string;
  targetGrams: number;
}

interface ShadeItem {
  shadeCode: string;
  shadeName: string;
  quantity: number;
  brand: string;
}

interface ProductSearchProps {
  salonId: string;
  onSelect: (product: SelectedProduct) => void;
  onClose: () => void;
  excludeIds?: string[];
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map shade codes to approximate color hex for the color dot */
function shadeToColor(shadeCode: string): string {
  const code = shadeCode.toUpperCase();

  // Level-based base tones
  const levelMatch = code.match(/(\d{1,2})/);
  const level = levelMatch ? parseInt(levelMatch[1], 10) : 5;

  // Natural / neutral tones
  if (/N\b|\/0\b|\.0$/.test(code)) {
    const tones: Record<number, string> = {
      1: '#1a1a1a', 2: '#3b2a1a', 3: '#5c3a1e', 4: '#7a4a2a',
      5: '#9a6a3a', 6: '#b8844a', 7: '#c9a06a', 8: '#d4b88a',
      9: '#e0cca0', 10: '#f0e0c0',
    };
    return tones[Math.min(level, 10)] || '#8a7a6a';
  }

  // Ash / cool
  if (/A\b|\/1\b|\.1$|ASH/i.test(code)) return blendN(level, '#8a8a8a', 0.3);
  // Gold / warm
  if (/G\b|\/3\b|\.3$|GOLD/i.test(code)) return blendN(level, '#d4a030', 0.4);
  // Red / copper
  if (/R\b|C\b|\/4\b|\/5\b|\.4$|\.5$|RED|COPPER/i.test(code)) return blendN(level, '#c04030', 0.35);
  // Violet / purple
  if (/V\b|\/6\b|\.6$|VIOLET/i.test(code)) return blendN(level, '#8040a0', 0.3);
  // Blue / matte
  if (/B\b|\/7\b|\.7$|BLUE/i.test(code)) return blendN(level, '#4070b0', 0.3);
  // Green
  if (/G\b|\/2\b|\.2$|GREEN/i.test(code)) return blendN(level, '#40a060', 0.3);

  // Fallback by level
  const fallback: Record<number, string> = {
    1: '#1a1a1a', 2: '#3b2a1a', 3: '#5c3a1e', 4: '#7a4a2a',
    5: '#9a6a3a', 6: '#b8844a', 7: '#c9a06a', 8: '#d4b88a',
    9: '#e0cca0', 10: '#f0e0c0',
  };
  return fallback[Math.min(level, 10)] || '#8a7a6a';
}

function blendN(level: number, tint: string, strength: number): string {
  const l = Math.min(10, Math.max(1, level));
  const base = 20 + l * 18; // lightness scale
  const r = parseInt(tint.slice(1, 3), 16);
  const g = parseInt(tint.slice(3, 5), 16);
  const b = parseInt(tint.slice(5, 7), 16);
  const bg = base;
  const blend = (c: number) => Math.round(bg * (1 - strength) + c * strength);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductSearch({ salonId, onSelect, onClose, excludeIds = [], className = '' }: ProductSearchProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [shades, setShades] = useState<ShadeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingShades, setLoadingShades] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Gram stepper state
  const [steppingItem, setSteppingItem] = useState<ShadeItem | null>(null);
  const [stepperGrams, setStepperGrams] = useState(30);

  // ── Fetch brands ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingBrands(true);
        const params = new URLSearchParams();
        if (salonId) params.set('salonId', salonId);
        const res = await fetch(`/api/user/brands?${params}`);
        const data = await res.json();
        if (!cancelled && data.brands) {
          setBrands(data.brands);
          // Auto-select first brand
          if (data.brands.length > 0) setSelectedBrand(data.brands[0]);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      } finally {
        if (!cancelled) setLoadingBrands(false);
      }
    })();
    return () => { cancelled = true; };
  }, [salonId]);

  // ── Fetch shades when brand changes ──────────────────────────────────────
  useEffect(() => {
    if (!selectedBrand) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingShades(true);
        const params = new URLSearchParams({ brand: selectedBrand });
        if (salonId) params.set('salonId', salonId);
        const res = await fetch(`/api/user/shades?${params}`);
        const data = await res.json();
        if (!cancelled && data.shades) {
          setShades(data.shades);
        }
      } catch (err) {
        console.error('Failed to fetch shades:', err);
      } finally {
        if (!cancelled) setLoadingShades(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedBrand, salonId]);

  // ── Filtered shades ──────────────────────────────────────────────────────
  const filteredShades = useMemo(() => {
    let list = shades;

    // Exclude already-added
    if (excludeIds.length > 0) {
      list = list.filter(s => !excludeIds.includes(s.shadeCode));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        s =>
          s.shadeCode.toLowerCase().includes(q) ||
          s.shadeName.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q)
      );
    }

    return list;
  }, [shades, excludeIds, searchQuery]);

  // ── Confirm add ──────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!steppingItem) return;
    const product: SelectedProduct = {
      id: steppingItem.shadeCode,
      brand: steppingItem.brand,
      line: selectedBrand || steppingItem.brand,
      shadeCode: steppingItem.shadeCode,
      shadeName: steppingItem.shadeName,
      color: shadeToColor(steppingItem.shadeCode),
      targetGrams: stepperGrams,
    };
    onSelect(product);
    setSteppingItem(null);
    setStepperGrams(30);
  }, [steppingItem, stepperGrams, selectedBrand, onSelect]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col ${className}`}
      style={{ background: '#0a0a12' }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold" style={{ color: '#F5F5F7' }}>
          Add Products
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: '#71717A' }} />
        </button>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div className="px-4 mb-3">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#71717A' }} />
          <input
            type="text"
            placeholder="Search by name, shade, or brand…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#F5F5F7' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" style={{ color: '#71717A' }} />
            </button>
          )}
        </div>
      </div>

      {/* ── Brand pills (horizontal scroll) ──────────────────────────────── */}
      <div className="px-4 mb-3">
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loadingBrands ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-8 w-20 rounded-full animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          ) : (
            brands.map(brand => (
              <button
                type="button"
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background:
                    selectedBrand === brand
                      ? 'rgba(147, 51, 234, 0.2)'
                      : 'rgba(255,255,255,0.04)',
                  border:
                    selectedBrand === brand
                      ? '1px solid rgba(147, 51, 234, 0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                  color: selectedBrand === brand ? '#A855F7' : '#A1A1AA',
                }}
              >
                {brand}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loadingShades ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="rounded-2xl h-28 animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            ))}
          </div>
        ) : filteredShades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-10 h-10 mb-3" style={{ color: '#3f3f46' }} />
            <p className="text-sm" style={{ color: '#71717A' }}>
              {searchQuery ? 'No products match your search' : 'No shades found for this brand'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredShades.map(shade => {
              const color = shadeToColor(shade.shadeCode);
              return (
                <button
                  type="button"
                  key={shade.shadeCode}
                  onClick={() => {
                    setSteppingItem(shade);
                    setStepperGrams(30);
                  }}
                  className="rounded-2xl p-3 text-left transition-all active:scale-[0.97]"
                  style={{
                    background: 'rgba(22, 22, 36, 0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Color dot */}
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-full shadow-inner"
                      style={{
                        background: color,
                        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 8px ${color}33`,
                      }}
                    />
                    {shade.quantity > 0 ? (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                        }}
                      >
                        {shade.quantity} in stock
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                        }}
                      >
                        0 stock
                      </span>
                    )}
                  </div>

                  {/* Shade code */}
                  <p className="text-sm font-bold mb-0.5 truncate" style={{ color: '#F5F5F7' }}>
                    {shade.shadeCode}
                  </p>

                  {/* Shade name */}
                  <p className="text-xs truncate" style={{ color: '#71717A' }}>
                    {shade.shadeName || '—'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Gram stepper overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {steppingItem && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5"
            style={{
              background: '#12121e',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Stepper header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0"
                style={{
                  background: shadeToColor(steppingItem.shadeCode),
                  boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3)`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#F5F5F7' }}>
                  {steppingItem.shadeCode}
                </p>
                <p className="text-xs truncate" style={{ color: '#71717A' }}>
                  {steppingItem.shadeName || steppingItem.brand}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSteppingItem(null)}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" style={{ color: '#71717A' }} />
              </button>
            </div>

            {/* Gram controls */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <button
                type="button"
                onClick={() => setStepperGrams(g => Math.max(1, g - 5))}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Minus className="w-5 h-5" style={{ color: '#A1A1AA' }} />
              </button>

              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={stepperGrams}
                  onChange={e => setStepperGrams(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                  className="w-20 text-center text-3xl font-mono font-bold bg-transparent outline-none"
                  style={{ color: '#F5F5F7' }}
                />
                <span className="text-xs" style={{ color: '#71717A' }}>grams</span>
              </div>

              <button
                type="button"
                onClick={() => setStepperGrams(g => Math.min(999, g + 5))}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Plus className="w-5 h-5" style={{ color: '#A1A1AA' }} />
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 justify-center mb-5">
              {[10, 20, 30, 50, 60].map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setStepperGrams(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background:
                      stepperGrams === g
                        ? 'rgba(147, 51, 234, 0.15)'
                        : 'rgba(255,255,255,0.04)',
                    border:
                      stepperGrams === g
                        ? '1px solid rgba(147, 51, 234, 0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                    color: stepperGrams === g ? '#A855F7' : '#71717A',
                  }}
                >
                  {g}g
                </button>
              ))}
            </div>

            {/* Add to Formula button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                color: '#FFF',
              }}
            >
              <Check className="w-4 h-4" />
              Add to Formula — {stepperGrams}g
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
