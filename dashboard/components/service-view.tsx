'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, ChevronRight, Clock, X, History, Heart, AlertTriangle, Trash2, ArrowRightLeft, Scale, FlaskConical, Check } from 'lucide-react';
import { DropIndicator } from './scale-bowl';

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
  className?: string;
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

// ─── Bowl Card ───────────────────────────────────────────────────────────────

function BowlCard({
  bowl,
  serviceId,
  onOpen,
  onDiscard,
  onMove,
  onReweigh,
  onContinue,
}: {
  bowl: ServiceBowl;
  serviceId: string;
  onOpen: () => void;
  onDiscard: () => void;
  onMove: () => void;
  onReweigh: () => void;
  onContinue: () => void;
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
  onAddBowl,
  onOpenBowl,
  onMixFromHistory,
  onMixFavorite,
  onRemoveService,
  onDiscardBowl,
  onMoveBowl,
  onReweigh,
  onContinueMixing,
}: {
  service: SalonService;
  onAddBowl: () => void;
  onOpenBowl: (bowlId: string) => void;
  onMixFromHistory: () => void;
  onMixFavorite: () => void;
  onRemoveService: () => void;
  onDiscardBowl: (bowlId: string) => void;
  onMoveBowl: (bowlId: string) => void;
  onReweigh: (bowlId: string) => void;
  onContinueMixing: (bowlId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="mb-6">
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
  className = '',
}: ServiceViewProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#F5F5F7' }}>{clientName}</h2>
          <p className="text-xs" style={{ color: '#71717A' }}>{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Services */}
      {services.map(service => (
        <ServiceSection
          key={service.id}
          service={service}
          onAddBowl={() => onAddBowl(service.id)}
          onOpenBowl={(bowlId) => onOpenBowl(service.id, bowlId)}
          onMixFromHistory={() => onMixFromHistory(service.id)}
          onMixFavorite={() => onMixFavorite(service.id)}
          onRemoveService={() => onRemoveService(service.id)}
          onDiscardBowl={(bowlId) => onDiscardBowl(service.id, bowlId)}
          onMoveBowl={(bowlId) => onMoveBowl(service.id, bowlId)}
          onReweigh={(bowlId) => onReweigh(service.id, bowlId)}
          onContinueMixing={(bowlId) => onContinueMixing(service.id, bowlId)}
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
