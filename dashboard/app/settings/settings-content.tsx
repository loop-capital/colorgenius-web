'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, XCircle, RefreshCw, Unlink, Package, CreditCard, ArrowRight, Users, ToggleLeft, ToggleRight } from 'lucide-react';

interface SquareStatus {
  connected: boolean;
  business_name?: string;
  merchant_id?: string;
  location_ids?: string[];
  connected_at?: string;
  catalog_synced_at?: string;
  connect_url?: string;
}

interface SyncResult {
  products_synced: number;
  synced_at: string;
}

interface ClientSyncResult {
  imported: number;
  updated: number;
  errors: number;
}

export default function SettingsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<SquareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [clientSyncEnabled, setClientSyncEnabled] = useState(false);
  const [clientSyncing, setClientSyncing] = useState(false);
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [clientSyncResult, setClientSyncResult] = useState<ClientSyncResult | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchClientSyncToggle();
    if (searchParams.get('square_connected')) { setError(''); fetchStatus(); }
    if (searchParams.get('square_error')) setError(`Connection failed: ${searchParams.get('square_error')}`);
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/square/status');
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch { setError('Failed to check Square status'); }
    finally { setLoading(false); }
  }

  async function handleSync() {
    setSyncing(true); setSyncResult(null);
    try {
      const res = await fetch('/api/square/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) { setSyncResult(data.data); fetchStatus(); }
      else setError(data.error?.message || 'Sync failed');
    } catch { setError('Sync failed'); }
    finally { setSyncing(false); }
  }

  async function fetchClientSyncToggle() {
    try {
      const res = await fetch('/api/square/clients/sync-toggle');
      const data = await res.json();
      if (data.success) setClientSyncEnabled(data.data?.square_client_sync === true);
    } catch { /* ignore */ }
  }

  async function handleClientSyncToggle() {
    const newValue = !clientSyncEnabled;
    try {
      const res = await fetch('/api/square/clients/sync-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newValue }),
      });
      const data = await res.json();
      if (data.success) setClientSyncEnabled(newValue);
    } catch { setError('Failed to toggle client sync'); }
  }

  async function handleClientSync() {
    setClientSyncing(true); setClientSyncResult(null); setError('');
    try {
      const res = await fetch('/api/square/clients/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setClientSyncResult(data.data);
      } else {
        setError(data.error || 'Client sync failed');
      }
    } catch { setError('Client sync failed'); }
    finally { setClientSyncing(false); }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Square? This will stop inventory sync and billing.')) return;
    try {
      const res = await fetch('/api/square/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) { setStatus(null); fetchStatus(); }
      else setError(data.error?.message || 'Disconnect failed');
    } catch { setError('Disconnect failed'); }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F5F5F7' }}>Settings</h1>
        <p className="text-sm mb-8" style={{ color: '#71717A' }}>Manage your integrations and account</p>

        <div className="rounded-2xl p-6 mb-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#006AFF' }}>
                <Image src="/images/logos/square-white.png" alt="Square" width={24} height={24} />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: '#F5F5F7' }}>Square POS</h2>
                <p className="text-xs" style={{ color: '#71717A' }}>Inventory, payments, and billing</p>
              </div>
            </div>
            {status?.connected ? (
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

          {loading ? <p className="text-sm" style={{ color: '#71717A' }}>Loading...</p>
          : status?.connected ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Business</p>
                  <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>{status.business_name}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Connected</p>
                  <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>{status.connected_at ? new Date(status.connected_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" style={{ color: '#71717A' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Client Import</p>
                      <p className="text-xs" style={{ color: '#71717A' }}>Auto-import clients from Square</p>
                    </div>
                  </div>
                  <button onClick={handleClientSyncToggle}
                    className="flex items-center gap-2 transition-colors"
                    style={{ color: clientSyncEnabled ? '#10B981' : '#71717A' }}>
                    {clientSyncEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    <span className="text-xs font-medium">{clientSyncEnabled ? 'On' : 'Off'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: '#71717A' }}>
                    {clientSyncResult
                      ? `Last import: ${clientSyncResult.imported} new, ${clientSyncResult.updated} updated`
                      : 'Import your Square customer list into COLORgenius'}
                  </p>
                  <button onClick={handleClientSync} disabled={clientSyncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#0A0A0A' }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${clientSyncing ? 'animate-spin' : ''}`} />
                    {clientSyncing ? 'Importing...' : 'Import Now'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" style={{ color: '#71717A' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Product Catalog</p>
                      <p className="text-xs" style={{ color: '#71717A' }}>{status.catalog_synced_at ? `Last synced ${new Date(status.catalog_synced_at).toLocaleString()}` : 'Not synced yet'}</p>
                    </div>
                  </div>
                  <button onClick={handleSync} disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#0A0A0A' }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
                {syncResult && <p className="text-xs mt-2" style={{ color: '#10B981' }}>✅ Synced {syncResult.products_synced} products</p>}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Unlink className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>Connect your Square account to enable automatic inventory tracking, product catalog sync, and formula license billing.</p>
              <div className="space-y-2 mb-4">
                {['Real-time inventory counts from your POS', 'Auto-sync product catalog for formula requirements', 'Monthly billing via Square for formula licenses', 'Low-stock alerts when supplies run low'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
                    <span className="text-sm" style={{ color: '#A1A1AA' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href={status?.connect_url || '#'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#006AFF', color: '#FFFFFF' }}>
                <CreditCard className="w-4 h-4" /> Connect Square <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] mt-3" style={{ color: '#71717A' }}>You'll be redirected to Square to authorize COLORgenius. We only request read access to your inventory and catalog.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#F5F5F7' }}>Account</h2>
          <p className="text-sm" style={{ color: '#71717A' }}>Account settings coming soon</p>
        </div>
      </div>
    </div>
  );
}
