'use client';

import { useState, useEffect, useCallback } from 'react';

interface Salon {
  id: string;
  name: string;
  slug: string;
  inviteCode: string | null;
  staffCount: number;
  createdAt: string;
}

interface NewAccount {
  email: string;
  handle: string;
  role: string;
  temporaryPassword?: string;
}

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newSalonName, setNewSalonName] = useState('');
  const [creatingSalon, setCreatingSalon] = useState(false);

  const [expandedSalonId, setExpandedSalonId] = useState<string | null>(null);
  const [stylistForm, setStylistForm] = useState({ email: '', displayName: '', role: 'owner' as 'owner' | 'stylist' });
  const [creatingStylist, setCreatingStylist] = useState(false);
  const [newAccount, setNewAccount] = useState<NewAccount | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin/salons', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to load salons');
      setSalons(data.data.salons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSalons(); }, [fetchSalons]);

  async function handleCreateSalon(e: React.FormEvent) {
    e.preventDefault();
    setCreatingSalon(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin/salons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSalonName }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to create salon');
      setNewSalonName('');
      await fetchSalons();
      setExpandedSalonId(data.data.salon.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create salon');
    } finally {
      setCreatingSalon(false);
    }
  }

  async function handleCreateStylist(e: React.FormEvent, salonId: string) {
    e.preventDefault();
    setCreatingStylist(true);
    setError('');
    setNewAccount(null);
    try {
      const res = await fetch(`/api/v1/admin/salons/${salonId}/stylists`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stylistForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to create account');
      setNewAccount({
        email: data.data.email,
        handle: data.data.handle,
        role: data.data.role,
        temporaryPassword: data.data.temporaryPassword,
      });
      setStylistForm({ email: '', displayName: '', role: 'stylist' });
      await fetchSalons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setCreatingStylist(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#F5F5F7', background: '#0A0A0F', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Salons</h1>
      <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>
        Add a salon or independent pro, then add each stylist as their own account.
        These accounts don&apos;t sign up through the app &mdash; you&apos;re creating them here.
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreateSalon} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          value={newSalonName}
          onChange={(e) => setNewSalonName(e.target.value)}
          placeholder="Salon name (or the pro's business name)"
          required
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: '#161620', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
        />
        <button type="submit" disabled={creatingSalon} style={{ padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: creatingSalon ? 0.6 : 1 }}>
          {creatingSalon ? 'Creating…' : '+ New Salon'}
        </button>
      </form>

      {loading ? (
        <p style={{ color: '#71717A' }}>Loading…</p>
      ) : salons.length === 0 ? (
        <p style={{ color: '#71717A' }}>No salons yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {salons.map((salon) => (
            <div key={salon.id} style={{ background: '#161620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedSalonId(expandedSalonId === salon.id ? null : salon.id)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{salon.name}</div>
                  <div style={{ fontSize: 12, color: '#71717A' }}>
                    {salon.staffCount} {salon.staffCount === 1 ? 'account' : 'accounts'} &middot; invite code: <code>{salon.inviteCode}</code>
                  </div>
                </div>
                <span style={{ color: '#71717A' }}>{expandedSalonId === salon.id ? '−' : '+'}</span>
              </div>

              {expandedSalonId === salon.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <form onSubmit={(e) => handleCreateStylist(e, salon.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      value={stylistForm.displayName}
                      onChange={(e) => setStylistForm((s) => ({ ...s, displayName: e.target.value }))}
                      placeholder="Stylist's name"
                      required
                      style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                    />
                    <input
                      value={stylistForm.email}
                      onChange={(e) => setStylistForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder="Email"
                      type="email"
                      required
                      style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                    />
                    <select
                      value={stylistForm.role}
                      onChange={(e) => setStylistForm((s) => ({ ...s, role: e.target.value as 'owner' | 'stylist' }))}
                      style={{ padding: '8px 10px', borderRadius: 6, background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F7' }}
                    >
                      <option value="owner">Owner (first account for a new salon)</option>
                      <option value="stylist">Stylist</option>
                    </select>
                    <button type="submit" disabled={creatingStylist} style={{ padding: '8px 16px', borderRadius: 6, background: '#9333EA', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: creatingStylist ? 0.6 : 1 }}>
                      {creatingStylist ? 'Creating…' : 'Add Account'}
                    </button>
                  </form>

                  {newAccount && (
                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Account created &mdash; share this now, it won&apos;t be shown again:</div>
                      <div>Email: <code>{newAccount.email}</code></div>
                      <div>Handle: <code>@{newAccount.handle}</code></div>
                      {newAccount.temporaryPassword && <div>Password: <code>{newAccount.temporaryPassword}</code></div>}
                    </div>
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
