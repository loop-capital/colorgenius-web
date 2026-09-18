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

interface Account {
  userId: string;
  email: string;
  name: string;
  role: string;
  handle: string | null;
  createdAt: string;
  stylistId: string | null;
  formulaSalesCount: number;
  marketplaceTierOverride: string | null;
  marketplaceTier: string | null;
}

const TIER_COLORS: Record<string, string> = {
  community: '#71717A',
  professional: '#38BDF8',
  master: '#A855F7',
  signature: '#F59E0B',
  elite: '#EC4899',
};

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

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ userId: string; email: string; password: string } | null>(null);
  const [settingTierId, setSettingTierId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (salonId: string) => {
    setLoadingAccounts(true);
    try {
      const res = await fetch(`/api/v1/admin/salons/${salonId}/stylists`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to load accounts');
      setAccounts(data.data.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

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
      await fetchAccounts(salonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setCreatingStylist(false);
    }
  }

  function toggleExpand(salonId: string) {
    const next = expandedSalonId === salonId ? null : salonId;
    setExpandedSalonId(next);
    setNewAccount(null);
    setResetResult(null);
    setAccounts([]);
    if (next) fetchAccounts(next);
  }

  async function handleResetPassword(userId: string, email: string) {
    setResettingUserId(userId);
    setResetResult(null);
    setError('');
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/reset-password`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to reset password');
      setResetResult({ userId, email, password: data.data.temporaryPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setResettingUserId(null);
    }
  }

  async function handleSetTier(stylistId: string, salonId: string, tier: string | null) {
    setSettingTierId(stylistId);
    setError('');
    try {
      const res = await fetch(`/api/v1/admin/stylists/${stylistId}/tier`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to set tier');
      await fetchAccounts(salonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set tier');
    } finally {
      setSettingTierId(null);
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
                onClick={() => toggleExpand(salon.id)}>
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
                  {loadingAccounts ? (
                    <p style={{ color: '#71717A', fontSize: 13 }}>Loading accounts…</p>
                  ) : accounts.length > 0 ? (
                    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {accounts.map((acct) => (
                        <div key={acct.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#0F0F1A', borderRadius: 6, fontSize: 13, gap: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {acct.name} {acct.handle && <span style={{ color: '#71717A' }}>@{acct.handle}</span>}
                              {acct.marketplaceTier && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 999,
                                  color: TIER_COLORS[acct.marketplaceTier] || '#71717A',
                                  background: `${TIER_COLORS[acct.marketplaceTier] || '#71717A'}22`,
                                }}>
                                  {acct.marketplaceTier}
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#71717A', fontSize: 12 }}>
                              {acct.email} &middot; {acct.role}
                              {acct.stylistId && <> &middot; {acct.formulaSalesCount} career purchases</>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            {acct.stylistId && (
                              <button
                                onClick={() => handleSetTier(acct.stylistId!, salon.id, acct.marketplaceTierOverride === 'elite' ? null : 'elite')}
                                disabled={settingTierId === acct.stylistId}
                                style={{
                                  padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                                  background: acct.marketplaceTierOverride === 'elite' ? 'rgba(236,72,153,0.15)' : 'transparent',
                                  border: `1px solid ${acct.marketplaceTierOverride === 'elite' ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.15)'}`,
                                  color: acct.marketplaceTierOverride === 'elite' ? '#EC4899' : '#F5F5F7',
                                  opacity: settingTierId === acct.stylistId ? 0.6 : 1,
                                }}
                              >
                                {settingTierId === acct.stylistId ? 'Saving…' : acct.marketplaceTierOverride === 'elite' ? 'Remove Elite' : 'Set Elite'}
                              </button>
                            )}
                            <button
                              onClick={() => handleResetPassword(acct.userId, acct.email)}
                              disabled={resettingUserId === acct.userId}
                              style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#F5F5F7', fontSize: 12, cursor: 'pointer', opacity: resettingUserId === acct.userId ? 0.6 : 1 }}
                            >
                              {resettingUserId === acct.userId ? 'Resetting…' : 'Reset Password'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#71717A', fontSize: 13, marginBottom: 16 }}>No accounts yet at this salon.</p>
                  )}

                  {resetResult && (
                    <div style={{ marginBottom: 16, padding: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Password reset for {resetResult.email} &mdash; share this now, it won&apos;t be shown again:</div>
                      <div>Password: <code>{resetResult.password}</code></div>
                    </div>
                  )}

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
