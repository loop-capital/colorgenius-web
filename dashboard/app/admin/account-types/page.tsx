'use client'

import { useEffect, useState } from 'react'

interface StylistEntry {
  id: string
  email: string
  name: string
  accountType: string
  brandId?: string
}

const ACCOUNT_TYPES = [
  { value: 'stylist', label: 'Stylist' },
  { value: 'beta_tester', label: 'Beta Tester' },
  { value: 'brand_ambassador', label: 'Brand Ambassador' },
  { value: 'brand_account', label: 'Brand Account' },
]

export default function AdminAccountTypesPage() {
  const [stylists, setStylists] = useState<StylistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchStylists()
  }, [])

  async function fetchStylists() {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/admin/account-types')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStylists(data.stylists || [])
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load stylists' })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(stylistId: string, accountType: string, brandId?: string) {
    try {
      setSaving(stylistId)
      setMessage(null)

      const res = await fetch('/api/v1/admin/account-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stylistId, accountType, brandId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      setMessage({ type: 'success', text: 'Account type updated' })
      await fetchStylists()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Account Type Management</h1>
        <p className="text-gray-500">Loading stylists...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Type Management</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Account Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Brand ID</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stylists.map((stylist) => (
              <StylistRow
                key={stylist.id}
                stylist={stylist}
                saving={saving === stylist.id}
                onUpdate={handleUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StylistRow({
  stylist,
  saving,
  onUpdate,
}: {
  stylist: StylistEntry
  saving: boolean
  onUpdate: (id: string, type: string, brandId?: string) => void
}) {
  const [selectedType, setSelectedType] = useState(stylist.accountType)
  const [brandId, setBrandId] = useState(stylist.brandId || '')
  const hasChanges = selectedType !== stylist.accountType || brandId !== (stylist.brandId || '')

  const needsBrand = selectedType === 'brand_ambassador' || selectedType === 'brand_account'

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{stylist.name || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{stylist.email}</td>
      <td className="px-4 py-3">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {needsBrand ? (
          <input
            type="text"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            placeholder="Brand UUID"
            className="text-sm border border-gray-300 rounded px-2 py-1 w-48"
          />
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {hasChanges && (
          <button
            onClick={() => onUpdate(stylist.id, selectedType, needsBrand ? brandId : undefined)}
            disabled={saving || (needsBrand && !brandId)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </td>
    </tr>
  )
}
