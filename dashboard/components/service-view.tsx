'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, ChevronRight, Clock, X, History, Heart, AlertTriangle, Trash2, ArrowRightLeft, Scale, FlaskConical, Check } from 'lucide-react';
import { DropIndicator } from './scale-bowl';
import { deductFormulaFromInventory } from './custom/inventory-dashboard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BowlIngredient {
  name: string;
  shadeCode: string;
  color: string;
  targetGrams: number;
  weighedGrams: number;
}

export interface ServiceBowl {
  id: string;
  name: string;
  status: 'active' | 'reweighed' | 'discarded' | 'closed';
  ingredients: BowlIngredient[];
  totalTarget: number;
  totalWeighed: number;
  createdAt: string;
  isFavorite?: boolean;
}

export interface SalonService {
  id: string;
  name: string;
  bowls: ServiceBowl[];
}

interface ServiceViewProps {
  clientId: string;
  clientName: string;
  services: SalonService[];
  salonId?: string;
  onAddService: () => void;
  onAddBowl: (serviceId: string) => void;
  onOpenBowl: (serviceId: string, bowlId: string) => void;
  onMixFromHistory: (serviceId: string) => void;
  onMixFavorite: (serviceId: string) => void;
  onRemoveService: (serviceId: string) => void;
  onDiscardBowl: (serviceId: string, bowlId: string) => void;
  onMoveBowl: (serviceId: string, bowlId: string) => void;
  onReweigh: (serviceId: string, bowlId: string) => void;
  onContinueMixing: (serviceId: string, bowlId: string) => void;
  onBowlComplete?: (serviceId: string, bowl: ServiceBowl) => void;
  className?: string;
}

interface RemainderItem {
  brand: string;
  shadeCode: string;
  shadeName: string;
  remainingGrams: number;
}

// ─── Bowl Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ServiceBowl['status'] }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: 'rgba(147,51,234,0.15)', color: '#A855F7', label: 'Active' },
    reweighed: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Reweighed' },
    discarded: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Discarded' },
    closed: { bg: 'rgba(113,113,122,0.15)', color: '#71717A', label: 'Closed' },
  };
  const s = styles[status];
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Carry-Forward Banner ───────────────────────────────────────────────────

function CarryForwardBanner({ remainders }: { remainders: RemainderItem[] }) {
  if (remainders.length === 0) return null;
  return (
    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical className="w-3.5 h-3.5 text-[#10B981]" />
        <span className="text-xs font-medium text-[#10B981]">Remaining Formula Available</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {remainders.map((r, i) => (
          <span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            {r.shadeCode}: {r.remainingGrams}g
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Bowl Card ───────────────────────────────────────────────────────────────

function BowlCard({
  bowl,
  serviceId,
  onOpen,
  onDiscard,
  onMove,
  onReweigh,
  onContinue,
  onClose,
}: {
  bowl: ServiceBowl;
  serviceId: string;
  onOpen: () => void;
  onDiscard: () => void;
  onMove: () => void;
  onReweigh: () => void;
  onContinue: () => void;
  onClose: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isActive = bowl.status === 'active';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-xl p-4 text-left transition-all"
        style={{
          background: isActive ? 'rgba(147,51,234,0.04)' : 'rgba(22,22,32,0.6)',
          border: isActive ? '1px solid rgba(147,51,234,0.15)' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                {bowl.name}
              </span>
              {bowl.isFavorite && <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />}
              <StatusBadge status={bowl.status} />
            </div>
            <span className="text-[10px]" style={{ color: '#71717A' }}>
              {new Date(bowl.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: '#71717A' }} />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 z-10 w-48 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(30,30,45,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {isActive && (
                    <button type="button" onClick={() => { onContinue(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#A855F7' }}>
                      <Scale className="w-3.5 h-3.5" /> Continue Mixing
                    </button>
                  )}
                  {isActive && bowl.totalWeighed > 0 && (
                    <button type="button" onClick={() => { onClose(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#10B981' }}>
                      <Check className="w-3.5 h-3.5" /> Close Bowl
                    </button>
                  )}
                  {bowl.status === 'closed' && (
                    <button type="button" onClick={() => { onReweigh(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#F59E0B' }}>
                      <Scale className="w-3.5 h-3.5" /> Reweigh
                    </button>
                  )}
                  <button type="button" onClick={() => { onMove(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#A1A1AA' }}>
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Move to Service
                  </button>
                  {isActive && bowl.totalWeighed === 0 && (
                    <button type="button" onClick={() => { onDiscard(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#EF4444' }}>
                      <Trash2 className="w-3.5 h-3.5" /> Discard
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ingredient preview */}
        <div className="flex items-center gap-3">
          <DropIndicator
            ingredients={bowl.ingredients.map(i => ({ name: i.name, shadeCode: i.shadeCode, color: i.color, targetGrams: i.targetGrams }))}
            totalCurrent={bowl.totalWeighed}
            totalTarget={bowl.totalTarget}
            size="sm"
          />
          <div className="flex gap-1 flex-wrap">
            {bowl.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: ing.color }} />
                <span className="text-[10px]" style={{ color: '#71717A' }}>
                  {ing.shadeCode} {ing.weighedGrams > 0 ? `${ing.weighedGrams}g` : `${ing.targetGrams}g`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}

// ─── Service Section ─────────────────────────────────────────────────────────

function ServiceSection({
  service,
  salonId,
  remainders,
  onAddBowl,
  onOpenBowl,
  onMixFromHistory,
  onMixFavorite,
  onRemoveService,
  onDiscardBowl,
  onMoveBowl,
  onReweigh,
  onContinueMixing,
  onCloseBowl,
}: {
  service: SalonService;
  salonId?: string;
  remainders: RemainderItem[];
  onAddBowl: () => void;
  onOpenBowl: (bowlId: string) => void;
  onMixFromHistory: () => void;
  onMixFavorite: () => void;
  onRemoveService: () => void;
  onDiscardBowl: (bowlId: string) => void;
  onMoveBowl: (bowlId: string) => void;
  onReweigh: (bowlId: string) => void;
  onContinueMixing: (bowlId: string) => void;
  onCloseBowl: (bowl: ServiceBowl) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="mb-6">
      {/* Carry-forward banner */}
      <CarryForwardBanner remainders={remainders} />

      {/* Service header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
          {service.name}
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-white/5"
          >
            <MoreHorizontal className="w-4 h-4" style={{ color: '#71717A' }} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-10 w-44 rounded-xl overflow-hidden"
                style={{ background: 'rgba(30,30,45,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <button type="button" onClick={() => { onRemoveService(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-white/5" style={{ color: '#EF4444' }}>
                  <Trash2 className="w-3.5 h-3.5" /> Remove Service
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bowl cards */}
      <div className="space-y-2 mb-3">
        {service.bowls.map(bowl => (
          <BowlCard
            key={bowl.id}
            bowl={bowl}
            serviceId={service.id}
            onOpen={() => onOpenBowl(bowl.id)}
            onDiscard={() => onDiscardBowl(bowl.id)}
            onMove={() => onMoveBowl(bowl.id)}
            onReweigh={() => onReweigh(bowl.id)}
            onContinue={() => onContinueMixing(bowl.id)}
            onClose={() => onCloseBowl(bowl)}
          />
        ))}
      </div>

      {/* Add bowl options */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAddBowl}
          className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
          style={{ border: '1px dashed rgba(147,51,234,0.3)', color: '#A855F7', background: 'rgba(147,51,234,0.04)' }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Bowl
        </button>
        <button
          type="button"
          onClick={onMixFromHistory}
          className="py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <History className="w-3.5 h-3.5" /> History
        </button>
        <button
          type="button"
          onClick={onMixFavorite}
          className="py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Heart className="w-3.5 h-3.5" /> Favorite
        </button>
      </div>
    </div>
  );
}

// ─── Main Service View ───────────────────────────────────────────────────────

export function ServiceView({
  clientId,
  clientName,
  services,
  salonId,
  onAddService,
  onAddBowl,
  onOpenBowl,
  onMixFromHistory,
  onMixFavorite,
  onRemoveService,
  onDiscardBowl,
  onMoveBowl,
  onReweigh,
  onContinueMixing,
  onBowlComplete,
  className = '',
}: ServiceViewProps) {
  const [localRemainders, setLocalRemainders] = useState<RemainderItem[]>([]);
  const [lowStockAlert, setLowStockAlert] = useState<string[]>([]);

  // Fetch remainders for this salon when component mounts
  const fetchRemainders = useCallback(async () => {
    if (!salonId) return;
    try {
      const res = await fetch(`/api/v1/bowls/remainder?salonId=${encodeURIComponent(salonId)}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: RemainderItem[] = (data.remainders || []).map((r: any) => ({
          brand: r.brand,
          shadeCode: r.shadeCode,
          shadeName: r.shadeName || r.shadeCode,
          remainingGrams: Number(r.remainingGrams),
        }));
        setLocalRemainders(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch remainders:', e);
    }
  }, [salonId]);

  useEffect(() => {
    fetchRemainders();
  }, [fetchRemainders]);

  // Handle bowl close: deduct inventory, store remainders, check reorder points
  const handleCloseBowl = useCallback(
    async (serviceId: string, bowl: ServiceBowl) => {
      // 1. Deduct weighed ingredients from inventory
      if (bowl.totalWeighed > 0 && bowl.ingredients.length > 0) {
        const steps = bowl.ingredients
          .filter((ing) => ing.weighedGrams > 0)
          .map((ing) => ({
            product: {
              shadeCode: ing.shadeCode,
              brand: '', // Brand not tracked per-ingredient in current schema
            },
            grams: ing.weighedGrams,
          }));
        if (steps.length > 0) {
          const lowStockItems = await deductFormulaFromInventory(steps, salonId);
          if (lowStockItems.length > 0) {
            setLowStockAlert(lowStockItems.map((item) => item.shadeCode));
          }
        }
      }

      // 2. Calculate remainders and store them
      const remainders: Array<{ brand: string; shadeCode: string; shadeName: string; remainingGrams: number }> = [];
      for (const ing of bowl.ingredients) {
        if (ing.weighedGrams > 0) {
          const remaining = Math.max(0, ing.targetGrams - ing.weighedGrams);
          if (remaining > 0) {
            remainders.push({
              brand: '',
              shadeCode: ing.shadeCode,
              shadeName: ing.name,
              remainingGrams: remaining,
            });
          }
        }
      }

      if (remainders.length > 0 && salonId) {
        try {
          await fetch('/api/v1/bowls/remainder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              salonId,
              sourceBowlId: bowl.id,
              items: remainders,
            }),
          });
          // Refresh local remainders
          await fetchRemainders();
        } catch (e) {
          console.error('Failed to store remainders:', e);
        }
      }

      // 3. Check reorder points
      if (salonId) {
        try {
          const res = await fetch(`/api/v1/inventory/reorder-check?salonId=${encodeURIComponent(salonId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.items?.length > 0) {
              setLowStockAlert(data.items.map((item: any) => item.shadeCode));
            }
          }
        } catch (e) {
          console.error('Reorder check failed:', e);
        }
      }

      // 4. Notify parent
      onBowlComplete?.(serviceId, bowl);
    },
    [salonId, onBowlComplete, fetchRemainders]
  );

  // Filter remainders for this client's services (match shadeCodes in any bowl)
  const clientShadeCodes = new Set(
    services.flatMap((s) => s.bowls.flatMap((b) => b.ingredients.map((i) => i.shadeCode)))
  );
  const relevantRemainders = localRemainders.filter((r) => clientShadeCodes.has(r.shadeCode));

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#F5F5F7' }}>{clientName}</h2>
          <p className="text-xs" style={{ color: '#71717A' }}>{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockAlert.length > 0 && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 text-xs"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{lowStockAlert.length} shade{lowStockAlert.length !== 1 ? 's' : ''} below reorder point: {lowStockAlert.join(', ')}</span>
        </div>
      )}

      {/* Services */}
      {services.map((service) => (
        <ServiceSection
          key={service.id}
          service={service}
          salonId={salonId}
          remainders={relevantRemainders}
          onAddBowl={() => onAddBowl(service.id)}
          onOpenBowl={(bowlId) => onOpenBowl(service.id, bowlId)}
          onMixFromHistory={() => onMixFromHistory(service.id)}
          onMixFavorite={() => onMixFavorite(service.id)}
          onRemoveService={() => onRemoveService(service.id)}
          onDiscardBowl={(bowlId) => onDiscardBowl(service.id, bowlId)}
          onMoveBowl={(bowlId) => onMoveBowl(service.id, bowlId)}
          onReweigh={(bowlId) => onReweigh(service.id, bowlId)}
          onContinueMixing={(bowlId) => onContinueMixing(service.id, bowlId)}
          onCloseBowl={(bowl) => handleCloseBowl(service.id, bowl)}
        />
      ))}

      {/* Add Service */}
      <button
        type="button"
        onClick={onAddService}
        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #EC4899, #F472B6)', color: '#FFF' }}
      >
        <Plus className="w-4 h-4" /> Add Services
      </button>
    </div>
  );
}
