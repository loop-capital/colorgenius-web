'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, X, Search } from 'lucide-react';
import { ALL_PRODUCTS, BRANDS } from '@/lib/products';
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
const DEFAULT_REORDER = 30; // grams
const DEFAULT_COST_PER_GRAM = 0.40;

export function AddInventoryItem({ onAdded }: { onAdded?: () => void }) {
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<typeof ALL_PRODUCTS>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { canEdit } = useCanEdit();

  // Only admins can add inventory
  if (!canEdit) return null;

  const filteredProducts = ALL_PRODUCTS.filter(p => {
    const brandMatch = !brand || p.brand === brand;
    const searchMatch = !search ||
      p.shadeCode.toLowerCase().includes(search.toLowerCase()) ||
      p.shadeName.toLowerCase().includes(search.toLowerCase());
    return brandMatch && searchMatch;
  }).slice(0, 20);

  const handleAdd = (product: typeof ALL_PRODUCTS[0]) => {
    if (selectedProducts.find(p => p.id === product.id)) return;
    setSelectedProducts(prev => [...prev, product]);
  };

  const handleRemove = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = () => {
    const existing: InventoryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const existingCodes = new Set(existing.map(i => `${i.brand}-${i.shadeCode}`));

    const newItems: InventoryItem[] = selectedProducts
      .filter(p => !existingCodes.has(`${p.brand}-${p.shadeCode}`))
      .map(p => ({
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        brand: p.brand,
        line: p.line,
        shadeCode: p.shadeCode,
        shadeName: p.shadeName,
        currentGrams: 100, // default starting stock
        reorderPoint: DEFAULT_REORDER,
        lastUsed: '',
        costPerGram: DEFAULT_COST_PER_GRAM,
      }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...newItems]));
    setSelectedProducts([]);
    setIsOpen(false);
    onAdded?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
        style={{
          background: 'linear-gradient(135deg, #9333EA, #EC4899)',
          color: '#FFF',
        }}
      >
        <Plus className="w-4 h-4" />
        Add Inventory Items
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
          Add Products to Inventory
        </h3>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
        </button>
      </div>

      {/* Brand filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setBrand('')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
          style={{
            background: !brand ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
            border: !brand ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(255,255,255,0.06)',
            color: !brand ? '#A855F7' : 'var(--cg-text-secondary)',
          }}
        >
          All Brands
        </button>
        {BRANDS.slice(0, 8).map(b => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
            style={{
              background: brand === b ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
              border: brand === b ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: brand === b ? '#A855F7' : 'var(--cg-text-secondary)',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search by shade code or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--cg-text-primary)',
          }}
        />
      </div>

      {/* Selected items */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map(p => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#A855F7' }}
            >
              {p.shadeCode}
              <button onClick={() => handleRemove(p.id)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Product list */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredProducts.map(p => {
          const isSelected = selectedProducts.find(sp => sp.id === p.id);
          return (
            <button
              key={p.id}
              onClick={() => handleAdd(p)}
              disabled={!!isSelected}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-white/[0.03] disabled:opacity-40"
            >
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0"
                style={{ backgroundColor: p.hex || '#7D5038' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--cg-text-primary)' }}>
                  {p.shadeCode} {p.shadeName}
                </p>
                <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                  {p.brand} · {p.line} · Level {p.level}
                </p>
              </div>
              {!isSelected && <Plus className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cg-text-tertiary)' }} />}
            </button>
          );
        })}
      </div>

      {/* Save */}
      {selectedProducts.length > 0 && (
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
        >
          Add {selectedProducts.length} Item{selectedProducts.length > 1 ? 's' : ''} to Inventory
        </button>
      )}
    </motion.div>
  );
}
