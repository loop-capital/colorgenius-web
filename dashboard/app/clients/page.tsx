'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/custom/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, ChevronRight, FlaskConical, Star } from 'lucide-react'

const clients = [
  { id: '1', name: 'Maria Garcia', phone: '212-555-0142', email: 'maria.g@email.com', visits: 12, lastVisit: '2026-04-20', avatar: 'MG', color: '#9333EA', notes: 'Prefers ash tones, sensitive scalp' },
  { id: '2', name: 'Jennifer Liu', phone: '212-555-0198', email: 'jennifer.l@email.com', visits: 8, lastVisit: '2026-04-15', avatar: 'JL', color: '#F59E0B', notes: 'Wants balayage for summer, level 7 natural' },
  { id: '3', name: 'Sarah Thompson', phone: '212-555-0123', email: 'sarah.t@email.com', visits: 5, lastVisit: '2026-04-10', avatar: 'ST', color: '#8B5CF6', notes: 'First time color, virgin hair, nervous' },
  { id: '4', name: 'Amanda Chen', phone: '212-555-0187', email: 'amanda.c@email.com', visits: 15, lastVisit: '2026-04-08', avatar: 'AC', color: '#EC4899', notes: 'Regular root touch-up, level 4 natural' },
  { id: '5', name: 'Rachel Kim', phone: '212-555-0165', email: 'rachel.k@email.com', visits: 3, lastVisit: '2026-04-05', avatar: 'RK', color: '#9333EA', notes: 'Color correction needed, previously box-dyed' },
]

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

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
          <Button className="bg-[#9333EA] hover:bg-[#EC4899] text-[#0A0A0F] font-semibold">
            <Plus className="w-4 h-4 mr-2" /> New Client
          </Button>
        </motion.div>

        {/* Client List */}
        <div className="space-y-3">
          {filtered.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <Link href={`/clients/${client.id}`}>
                <GlassCard className="group cursor-pointer hover:border-[#9333EA]/20 transition-all duration-200">
                  <div className="p-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: `${client.color}18`, color: client.color }}
                    >{client.avatar}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#F5F5F7] truncate">{client.name}</h3>
                        {client.visits >= 10 && <Star className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#71717A]">{client.phone}</p>
                      <p className="text-xs text-[#52525B] mt-0.5 truncate">{client.notes}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <FlaskConical className="w-3 h-3 text-[#71717A]" />
                        <span className="text-[#A1A1AA]">{client.visits} visits</span>
                      </div>
                      <span className="text-[10px] text-[#52525B]">Last: {client.lastVisit}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#9333EA] transition-colors shrink-0" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <GlassCard>
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-[#52525B] mx-auto mb-3" />
              <p className="text-sm text-[#A1A1AA]">No clients found</p>
              <p className="text-xs text-[#52525B] mt-1">Try a different search term</p>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  )
}