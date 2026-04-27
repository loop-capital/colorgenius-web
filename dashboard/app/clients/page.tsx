'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { UserPlus, Trash2, Edit3, ChevronRight, Search } from 'lucide-react'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  createdAt: string
  lastVisit?: string
  favoriteBrand?: string
  conditions?: Array<{
    type: string
    porosity: string
    grayPercent: number
    date: string
  }>
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchClients()
  }, [searchTerm])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clients${searchTerm ? `?search=${searchTerm}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load clients',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return
    try {
      const response = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete client')
      toast({ title: 'Client Deleted', description: 'Client has been removed successfully' })
      fetchClients()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete client',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cg-deep)] text-white p-4 min-w-[768px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Client Management</h1>
          <Button variant="outline" onClick={() => router.push('/questionnaire')}>
            <UserPlus className="mr-2 h-4 w-4" /> New Consultation
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--cg-accent)] mx-auto mb-4" />
          <p className="text-white/60">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--cg-deep)] text-white p-4 min-w-[768px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-white/60 mt-1">Manage client profiles and formulation history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/questionnaire')}>
            <UserPlus className="mr-2 h-4 w-4" /> New Consultation
          </Button>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search clients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {clients.length === 0 && !searchTerm ? (
        <Card className="card-glass text-center py-12">
          <CardContent>
            <p className="text-white/60 mb-4">No clients found.</p>
            <Button variant="outline" onClick={() => router.push('/questionnaire')}>
              <UserPlus className="mr-2 h-4 w-4" /> Start First Consultation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="card-glass hover:bg-white/[0.06] transition-colors cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/clients/${client.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cg-accent)] to-[var(--cg-accent2)] flex items-center justify-center text-sm font-bold shrink-0">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{client.name}</p>
                      <p className="text-sm text-white/50 truncate">
                        {client.email || client.phone || 'No contact info'}
                        {client.favoriteBrand && ` · ${client.favoriteBrand}`}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {client.lastVisit && (
                      <span className="text-xs text-white/40 hidden md:inline">
                        Last visit: {new Date(client.lastVisit).toLocaleDateString()}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                      onClick={() => router.push(`/clients/${client.id}`)}
                      title="View client"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                      onClick={(e) => { e.stopPropagation(); router.push(`/questionnaire?clientId=${client.id}`) }}
                      title="New consultation"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-red-400"
                      onClick={(e) => { e.stopPropagation(); handleDelete(client.id) }}
                      title="Delete client"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center text-sm text-white/40 pt-2">
            <span>Showing {clients.length} client{clients.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  )
}
