'use client';

import { useState, useEffect, useCallback } from 'react';

interface Breakdown {
  formula_id: string;
  title: string;
  use_count: number;
  total_cents: number;
}

interface CreatorPayout {
  payout_id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string | null;
  total_cents: number;
  status: string;
  paid_at: string | null;
  payout_method: string | null;
  payout_reference: string | null;
  breakdown: Breakdown[];
}

function defaultPeriod(): string {
  const now = new Date();
  const prior = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${prior.getUTCFullYear()}-${String(prior.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminCreatorPayoutsPage() {
  const [period, setPeriod] = useState(defaultPeriod());
  const [creators, setCreators] = useState<CreatorPayout[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState({ payout_method: '', payout_reference: '', notes: '' });

  const fetchPayouts = useCallback(async (p: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/admin/creator-payouts?period=${p}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to load payouts');
      setCreators(data.data.creators);
      setTotalOwed(data.data.total_owed_cents);
      setTotalPending(data.data.total_pending_cents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayouts(period); }, [period, fetchPayouts]);

  function toggleExpand(payoutId: string) {
    setExpandedId(expandedId === payoutId ? null : payoutId);
    setPayoutForm({ payout_method: '', payout_reference: '', notes: '' });
  }

  async function handleMarkPaid(e: React.FormEvent, payoutId: string) {
    e.preventDefault();
    setMarkingId(payoutId);
    setError('');
    try {
      const res = await fetch(`/api/v1/admin/creator-payouts/${payoutId}/mark-paid`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to mark paid');
      setExpandedId(null);
      await fetchPayouts(period);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark paid');
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#F5F5F7', background: '#0A0A0F', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Creator Payouts</h1>
      <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 24 }}>
        What each formula creator is owed for licensed usage that&apos;s already been billed and collected.
        Square can&apos;t pay these out automatically &mdash; pay each creator yourself, then mark it paid here.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: '#A1A1AA' }}>Period:</label>
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, background: '#161620', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
        />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {!loading && creators.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, background: '#161620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Total owed this period</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCents(totalOwed)}</div>
          </div>
          <div style={{ flex: 1, background: '#161620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Still pending</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: totalPending > 0 ? '#F59E0B' : '#10B981' }}>{formatCents(totalPending)}</div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#71717A' }}>Loading…</p>
      ) : creators.length === 0 ? (
        <p style={{ color: '#71717A' }}>No billed creator earnings for {period}.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {creators.map((c) => (
            <div key={c.payout_id} style={{ background: '#161620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => toggleExpand(c.payout_id)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.creator_name}</div>
                  <div style={{ fontSize: 12, color: '#71717A' }}>{c.creator_email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                    background: c.status === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: c.status === 'paid' ? '#10B981' : '#F59E0B',
                    textTransform: 'uppercase',
                  }}>
                    {c.status}
                  </span>
                  <div style={{ fontWeight: 700 }}>{formatCents(c.total_cents)}</div>
                  <span style={{ color: '#71717A' }}>{expandedId === c.payout_id ? '−' : '+'}</span>
                </div>
              </div>

              {expandedId === c.payout_id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.breakdown.map((b) => (
                      <div key={b.formula_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#0F0F1A', borderRadius: 6, fontSize: 13 }}>
                        <div>{b.title} <span style={{ color: '#71717A' }}>&times;{b.use_count}</span></div>
                        <div>{formatCents(b.total_cents)}</div>
                      </div>
                    ))}
                  </div>

                  {c.status === 'paid' ? (
                    <div style={{ padding: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Paid {c.paid_at ? new Date(c.paid_at).toLocaleDateString() : ''}</div>
                      {c.payout_method && <div>Method: {c.payout_method}</div>}
                      {c.payout_reference && <div>Reference: {c.payout_reference}</div>}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleMarkPaid(e, c.payout_id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        value={payoutForm.payout_method}
                        onChange={(e) => setPayoutForm((f) => ({ ...f, payout_method: e.target.value }))}
                        placeholder="Payout method (e.g. Venmo, check, bank transfer)"
                        style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                      />
                      <input
                        value={payoutForm.payout_reference}
                        onChange={(e) => setPayoutForm((f) => ({ ...f, payout_reference: e.target.value }))}
                        placeholder="Reference / transaction ID (optional)"
                        style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                      />
                      <input
                        value={payoutForm.notes}
                        onChange={(e) => setPayoutForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Notes (optional)"
                        style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                      />
                      <button type="submit" disabled={markingId === c.payout_id} style={{ padding: '8px 16px', borderRadius: 6, background: '#9333EA', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: markingId === c.payout_id ? 0.6 : 1 }}>
                        {markingId === c.payout_id ? 'Marking…' : 'Mark Paid'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
