'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Unlink, ArrowRight } from 'lucide-react';

interface PhorestStatus {
  connected: boolean;
  business_id?: string;
  branch_id?: string;
  api_email?: string;
  region?: string;
  status?: string;
  last_sync_at?: string;
  sync_error?: string;
}

export default function PhorestCard() {
  const [status, setStatus] = useState<PhorestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ businessId: '', branchId: '', apiEmail: '', apiPassword: '', serverRegion: 'us' as 'us' | 'eu' });

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/phorest/connect', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch {
      setError('Failed to check Phorest status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/phorest/connect', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Connection failed');
      setShowForm(false);
      setForm({ businessId: '', branchId: '', apiEmail: '', apiPassword: '', serverRegion: 'us' });
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Phorest? Color Bar charges will stop pushing to Phorest tickets.')) return;
    try {
      const res = await fetch('/api/v1/phorest/connect', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setStatus(null); fetchStatus(); }
      else setError(data.error?.message || 'Disconnect failed');
    } catch {
      setError('Disconnect failed');
    }
  }

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: '#1E3A8A', color: '#fff' }}>Ph</div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: '#F5F5F7' }}>Phorest</h2>
            <p className="text-xs" style={{ color: '#71717A' }}>Salon management &amp; POS</p>
          </div>
        </div>
        {loading ? null : status?.connected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: '#10B981' }}>Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <XCircle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            <span className="text-xs font-medium" style={{ color: '#EF4444' }}>Not Connected</span>
          </div>
        )}
      </div>

      {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{error}</div>}

      {loading ? (
        <p className="text-sm" style={{ color: '#71717A' }}>Loading...</p>
      ) : status?.connected ? (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Business ID</p>
              <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>{status.business_id}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Email</p>
              <p className="text-sm font-medium truncate" style={{ color: '#F5F5F7' }}>{status.api_email}</p>
            </div>
          </div>
          {status.sync_error && (
            <p className="text-xs mb-3" style={{ color: '#F59E0B' }}>Last sync error: {status.sync_error}</p>
          )}
          <button onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Unlink className="w-3.5 h-3.5" /> Disconnect
          </button>
        </div>
      ) : showForm ? (
        <form onSubmit={handleConnect} className="space-y-2">
          <input required placeholder="Business ID" value={form.businessId}
            onChange={(e) => setForm((f) => ({ ...f, businessId: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }} />
          <input required placeholder="Branch ID" value={form.branchId}
            onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }} />
          <input required type="email" placeholder="API Email" value={form.apiEmail}
            onChange={(e) => setForm((f) => ({ ...f, apiEmail: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }} />
          <input required type="password" placeholder="API Password" value={form.apiPassword}
            onChange={(e) => setForm((f) => ({ ...f, apiPassword: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }} />
          <select value={form.serverRegion} onChange={(e) => setForm((f) => ({ ...f, serverRegion: e.target.value as 'us' | 'eu' }))}
            className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}>
            <option value="us">US</option>
            <option value="eu">EU</option>
          </select>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={connecting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1E3A8A', color: '#fff' }}>
              {connecting ? 'Connecting...' : 'Connect'} <ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-lg text-sm" style={{ color: '#71717A', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: '#71717A' }}>
            Find these in Phorest under Setup &rarr; API Access. Credentials are encrypted at rest.
          </p>
        </form>
      ) : (
        <div>
          <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>
            Connect Phorest to push Color Bar formula charges straight onto the client&apos;s ticket.
          </p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#1E3A8A', color: '#fff' }}>
            Connect Phorest <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
