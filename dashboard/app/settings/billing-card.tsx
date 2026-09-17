'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Unlink, ArrowRight, CreditCard } from 'lucide-react';

interface BillingStatus {
  has_card_on_file: boolean;
  card_last4: string | null;
  card_brand: string | null;
}

export default function BillingCard() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/billing/setup', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch {
      setError('Failed to check billing status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleSetup() {
    setSettingUp(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/billing/setup', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to start setup');
      window.location.href = data.data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup');
      setSettingUp(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Remove this card? Licensed formulas can’t be used again until a new card is added.')) return;
    try {
      const res = await fetch('/api/marketplace/billing/setup', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setStatus(null); fetchStatus(); }
      else setError(data.error?.message || 'Failed to remove card');
    } catch {
      setError('Failed to remove card');
    }
  }

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#9333EA' }}>
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: '#F5F5F7' }}>Formula License Billing</h2>
            <p className="text-xs" style={{ color: '#71717A' }}>Card on file for monthly per-use charges</p>
          </div>
        </div>
        {loading ? null : status?.has_card_on_file ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: '#10B981' }}>Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <XCircle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            <span className="text-xs font-medium" style={{ color: '#EF4444' }}>Not Set Up</span>
          </div>
        )}
      </div>

      {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{error}</div>}

      {loading ? (
        <p className="text-sm" style={{ color: '#71717A' }}>Loading...</p>
      ) : status?.has_card_on_file ? (
        <div>
          <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Card on File</p>
            <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>
              {status.card_brand || 'Card'} &bull;&bull;&bull;&bull; {status.card_last4}
            </p>
          </div>
          <p className="text-xs mb-4" style={{ color: '#A1A1AA' }}>
            Any licensed formula your salon uses gets billed to this card automatically on the 1st of each month, based on actual usage.
          </p>
          <button onClick={handleRemove}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Unlink className="w-3.5 h-3.5" /> Remove Card
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>
            Licensed (per-use) formulas from the marketplace bill your salon monthly based on actual use &mdash; not upfront.
            Add a card once here so licensed formulas can be used. Square requires a real payment to save a card, so
            this is a one-time <strong>$1.00</strong> verification charge, not a subscription.
          </p>
          <button onClick={handleSetup} disabled={settingUp}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#9333EA', color: '#fff' }}>
            {settingUp ? 'Starting...' : 'Add Card'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
