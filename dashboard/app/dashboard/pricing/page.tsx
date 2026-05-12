'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Edit3, Trash2, X, Check, AlertCircle, TrendingUp, Save, Copy,
} from 'lucide-react';
import { useCanEdit } from '@/lib/user-context';

interface PricingRule {
  id: string;
  salonId: string;
  serviceType: string;
  basePrice: number;
  pricePerOz?: number | null;
  minimumPrice?: number | null;
  effectiveDate: string;
  createdAt: string;
}

interface RuleFormData {
  serviceType: string;
  basePrice: string;
  pricePerOz: string;
  minimumPrice: string;
  effectiveDate: string;
}

const SERVICE_TYPES = [
  'Root Touch-Up',
  'Full Color',
  'Highlights',
  'Balayage',
  'Color Correction',
  'Toner / Glaze',
  'Bleach',
  'Ombre',
  'Gloss Treatment',
  'Other',
];

const emptyForm: RuleFormData = {
  serviceType: '',
  basePrice: '',
  pricePerOz: '',
  minimumPrice: '',
  effectiveDate: new Date().toISOString().split('T')[0],
};

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { canEdit } = useCanEdit();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/pricing?salonId=default&limit=100');
      if (!res.ok) throw new Error('Failed to load pricing rules');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rule: PricingRule) => {
    setForm({
      serviceType: rule.serviceType,
      basePrice: String(rule.basePrice),
      pricePerOz: rule.pricePerOz != null ? String(rule.pricePerOz) : '',
      minimumPrice: rule.minimumPrice != null ? String(rule.minimumPrice) : '',
      effectiveDate: rule.effectiveDate.split('T')[0],
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const openDuplicate = (rule: PricingRule) => {
    setForm({
      serviceType: rule.serviceType,
      basePrice: String(rule.basePrice),
      pricePerOz: rule.pricePerOz != null ? String(rule.pricePerOz) : '',
      minimumPrice: rule.minimumPrice != null ? String(rule.minimumPrice) : '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.serviceType || !form.basePrice) return;
    setSaving(true);
    try {
      const payload = {
        salonId: 'default',
        serviceType: form.serviceType,
        basePrice: parseFloat(form.basePrice),
        pricePerOz: form.pricePerOz ? parseFloat(form.pricePerOz) : undefined,
        minimumPrice: form.minimumPrice ? parseFloat(form.minimumPrice) : undefined,
        effectiveDate: form.effectiveDate,
      };

      const url = editingId ? `/api/v1/pricing/${editingId}` : '/api/v1/pricing';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setShowForm(false);
      setEditingId(null);
      fetchRules();
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing rule?')) return;
    try {
      const res = await fetch(`/api/v1/pricing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchRules();
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
              Pricing <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Rules</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
              Configure how your salon charges for color services
            </p>
          </div>
          {canEdit && !showForm && (
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
            >
              <Plus className="w-4 h-4" /> New Rule
            </button>
          )}
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-5 mb-6 space-y-4"
              style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
                  {editingId ? 'Edit Pricing Rule' : 'New Pricing Rule'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
                </button>
              </div>

              {/* Service Type */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--cg-text-secondary)' }}>Service Type</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPES.map(st => (
                    <button
                      key={st}
                      onClick={() => setForm(f => ({ ...f, serviceType: st }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.serviceType === st ? 'rgba(147, 51, 234, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.serviceType === st ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                        color: form.serviceType === st ? '#A855F7' : 'var(--cg-text-secondary)',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type a custom service name..."
                  value={SERVICE_TYPES.includes(form.serviceType) ? '' : form.serviceType}
                  onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--cg-text-primary)',
                  }}
                />
              </div>

              {/* Pricing Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--cg-text-secondary)' }}>Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.00"
                    value={form.basePrice}
                    onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--cg-text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--cg-text-secondary)' }}>Price Per Oz ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.50"
                    value={form.pricePerOz}
                    onChange={e => setForm(f => ({ ...f, pricePerOz: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--cg-text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--cg-text-secondary)' }}>Minimum Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.00"
                    value={form.minimumPrice}
                    onChange={e => setForm(f => ({ ...f, minimumPrice: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--cg-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--cg-text-secondary)' }}>Effective Date</label>
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--cg-text-primary)',
                  }}
                />
              </div>

              {/* Pricing Example */}
              {form.basePrice && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(147, 51, 234, 0.08)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#A855F7' }}>Pricing Preview</p>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
                    <p>Base charge: <span className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${parseFloat(form.basePrice || '0').toFixed(2)}</span></p>
                    {form.pricePerOz && (
                      <p>30g formula = base + {form.pricePerOz}/oz × ~1oz = <span className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${(parseFloat(form.basePrice || '0') + parseFloat(form.pricePerOz)).toFixed(2)}</span></p>
                    )}
                    {form.minimumPrice && (
                      <p>Minimum: <span className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${parseFloat(form.minimumPrice).toFixed(2)}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!form.serviceType || !form.basePrice || saving}
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--cg-surface)' }}>
                <div className="h-4 w-32 bg-white/[0.06] rounded mb-3" />
                <div className="h-3 w-48 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">{error}</p>
              <button onClick={fetchRules} className="text-xs text-red-300 underline mt-1">Retry</button>
            </div>
          </div>
        )}

        {/* Rules List */}
        {!loading && !error && (
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--cg-text-tertiary)' }} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--cg-text-primary)' }}>No pricing rules yet</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--cg-text-tertiary)' }}>Create your first pricing rule to start calculating service charges</p>
                {canEdit && (
                  <button onClick={openNew} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                    <Plus className="w-4 h-4 inline mr-1" /> Create Rule
                  </button>
                )}
              </div>
            ) : (
              rules.map((rule, i) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--cg-text-primary)' }}>{rule.serviceType}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>Active</span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
                        <span>Base: <span className="font-mono font-bold" style={{ color: '#A855F7' }}>${rule.basePrice.toFixed(2)}</span></span>
                        {rule.pricePerOz != null && (
                          <span>Per Oz: <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>${rule.pricePerOz.toFixed(2)}</span></span>
                        )}
                        {rule.minimumPrice != null && (
                          <span>Min: <span className="font-mono" style={{ color: 'var(--cg-text-primary)' }}>${rule.minimumPrice.toFixed(2)}</span></span>
                        )}
                        <span>Since: {new Date(rule.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(rule)} className="p-2 rounded-lg hover:bg-white/5" title="Edit">
                          <Edit3 className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
                        </button>
                        <button onClick={() => openDuplicate(rule)} className="p-2 rounded-lg hover:bg-white/5" title="Duplicate">
                          <Copy className="w-4 h-4" style={{ color: 'var(--cg-text-tertiary)' }} />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="p-2 rounded-lg hover:bg-red-500/10" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400/60" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Summary Footer */}
        {rules.length > 0 && (
          <div className="mt-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(147, 51, 234, 0.06)', border: '1px solid rgba(147, 51, 234, 0.15)' }}>
            <TrendingUp className="w-4 h-4 text-[#A855F7] flex-shrink-0" />
            <p className="text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
              {rules.length} active pricing rule{rules.length !== 1 ? 's' : ''} ·
              Average base price: <span className="font-mono font-bold" style={{ color: 'var(--cg-text-primary)' }}>${(rules.reduce((s, r) => s + r.basePrice, 0) / rules.length).toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
