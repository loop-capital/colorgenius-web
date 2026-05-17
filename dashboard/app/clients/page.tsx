'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/custom/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, ChevronRight, FlaskConical, Star } from 'lucide-react'

interface ClientData {
  id: string
  name: string
  phone?: string
  email?: string
  visits?: number
  lastVisit?: string
  notes?: string
}

const AVATAR_COLORS = ['#9333EA', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#14B8A6']

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async (q?: string) => {
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      const res = await fetch(`/api/clients?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch (e) {
      console.error('Failed to fetch clients:', e)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9333EA]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7] tracking-tight">Clients</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">Manage client profiles and visit history</p>
        </motion.div>

        {/* Search + Add */}
        <motion.div className="flex flex-col sm:flex-row gap-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <Input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="pl-10 bg-[#161620] border-white/[0.06] text-[#F5F5F7] placeholder:text-[#52525B] focus:border-[#9333EA]/50 focus:ring-[#9333EA]/20"
            />
          </div>
          <Link href="/questionnaire">
            <Button className="bg-[#A855F7] hover:bg-[#D946EF] text-[#0A0A0F] font-semibold">
              <Plus className="w-4 h-4 mr-2" /> New Client
            </Button>
          </Link>
        </motion.div>

        {/* Client List */}
        <div className="space-y-3">
          {clients.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <Link href={`/clients/${client.id}`}>
                <GlassCard className="group cursor-pointer hover:border-[#9333EA]/20 transition-all duration-200">
                  <div className="p-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: `${getColor(client.id)}18`, color: getColor(client.id) }}
                    >{getInitials(client.name)}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#F5F5F7] truncate">{client.name}</h3>
                        {(client.visits || 0) >= 10 && <Star className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#71717A]">{client.phone || client.email || 'No contact info'}</p>
                      {client.notes && <p className="text-xs text-[#52525B] mt-0.5 truncate">{client.notes}</p>}
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      {client.visits !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <FlaskConical className="w-3 h-3 text-[#71717A]" />
                          <span className="text-[#A1A1AA]">{client.visits} visits</span>
                        </div>
                      )}
                      {client.lastVisit && (
                        <span className="text-[10px] text-[#52525B]">Last: {new Date(client.lastVisit).toLocaleDateString()}</span>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#9333EA] transition-colors shrink-0" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {clients.length === 0 && !loading && (
          <GlassCard>
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-[#52525B] mx-auto mb-3" />
              <p className="text-sm text-[#A1A1AA]">{search ? 'No clients found' : 'No clients yet'}</p>
              <p className="text-xs text-[#52525B] mt-1">{search ? 'Try a different search term' : 'Add your first client to get started'}</p>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  )
}
