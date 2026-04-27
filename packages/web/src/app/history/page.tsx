'use client'

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

function getSwatchColor(level: number): string {
  const base: Record<number, string> = {
    1: '#1a1a1a', 2: '#2d1f12', 3: '#3d2515', 4: '#4a2e1a', 5: '#5c3a20',
    6: '#7a5030', 7: '#9e7040', 8: '#b89050', 9: '#d4aa60', 10: '#e8c880',
  }
  return base[level] || '#888'
}

const TONE_NAMES: Record<string, string> = { N: 'Nat', A: 'Ash', G: 'Gold', R: 'Red', V: 'Violet', K: 'Cop', B: 'Bei' }

interface Client {
  id: string; name: string; email: string; phone: string; formulations: number
  lastVisit: string | null; avgScore: number | null; nextAppt: string | null; created_at: string
}
interface FormulationEntry {
  id: string; client: string; date: string; brand: string
  current: { level: number; tone: string }; target: { level: number; tone: string }
  service: string; score: number; stylist: string
}

const ALL_HISTORY: FormulationEntry[] = [
  { id: 'f1', client: 'Sarah Mitchell', date: '2026-04-20', brand: 'Wella Koleston', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'G' }, service: 'Full Color', score: 91, stylist: 'You' },
  { id: 'f2', client: 'Jessica Torres', date: '2026-04-19', brand: 'Redken Color Gels', current: { level: 5, tone: 'A' }, target: { level: 6, tone: 'N' }, service: 'Root Touch-up', score: 88, stylist: 'You' },
  { id: 'f3', client: 'Amanda Brooks', date: '2026-04-18', brand: 'Schwarzkopf Igora', current: { level: 7, tone: 'G' }, target: { level: 8, tone: 'N' }, service: 'Full Color', score: 85, stylist: 'You' },
  { id: 'f4', client: 'Maria Chen', date: '2026-04-17', brand: 'Davines TODOS', current: { level: 4, tone: 'N' }, target: { level: 5, tone: 'G' }, service: 'Highlights', score: 94, stylist: 'You' },
  { id: 'f5', client: 'Emma Wilson', date: '2026-04-15', brand: 'Wella Koleston', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'A' }, service: 'Full Color', score: 90, stylist: 'You' },
  { id: 'f6', client: 'Priya Patel', date: '2026-04-12', brand: 'Redken Color Gels', current: { level: 5, tone: 'N' }, target: { level: 6, tone: 'R' }, service: 'Full Color', score: 87, stylist: 'You' },
  { id: 'f7', client: 'Lisa Rodriguez', date: '2026-04-10', brand: 'Schwarzkopf Igora', current: { level: 7, tone: 'N' }, target: { level: 6, tone: 'N' }, service: 'Root Touch-up', score: 89, stylist: 'You' },
  { id: 'f8', client: 'Sarah Mitchell', date: '2026-03-23', brand: 'Wella Koleston', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'G' }, service: 'Full Color', score: 93, stylist: 'You' },
]

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('clients')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'clients') {
      setLoading(true)
      fetch(`/api/clients?search=${encodeURIComponent(search)}&limit=20`)
        .then(r => r.json())
        .then(d => { if (d.success) setClients(d.data.clients) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [tab, search])

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredHistory = ALL_HISTORY.filter((f) =>
    f.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {tab === 'clients' ? 'Client History' : 'All Formulations'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {tab === 'clients' ? `${clients.length} clients` : `${ALL_HISTORY.length} formulations`}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm w-48"
              style={{ background: 'hsl(var(--input))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <Button variant="outline" size="sm" className="h-9 text-sm" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-10 p-1 rounded-lg grid grid-cols-2" style={{ background: 'hsl(var(--muted))' }}>
            <TabsTrigger value="clients" className="h-7 text-xs rounded-md data-[state=active]:shadow-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Clients
            </TabsTrigger>
            <TabsTrigger value="formulations" className="h-7 text-xs rounded-md data-[state=active]:shadow-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Formulations
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-4">
            <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Client</TableHead>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Contact</TableHead>
                      <TableHead className="text-xs font-medium text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Visits</TableHead>
                      <TableHead className="text-xs font-medium text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Avg Score</TableHead>
                      <TableHead className="text-xs font-medium text-right" style={{ color: 'hsl(var(--muted-foreground))' }}>Next Appt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Loading clients...
                        </TableCell>
                      </TableRow>
                    ) : filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          No clients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((c) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '1px solid hsl(var(--border))' }}
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{c.name}</p>
                              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Since {c.created_at}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{c.email}</p>
                            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.phone}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>{c.formulations}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {c.avgScore ? (
                              <Badge className="text-xs font-medium" style={{
                                background: c.avgScore >= 90 ? 'hsl(142 71% 45% / 0.15)' : 'hsl(var(--muted))',
                                color: c.avgScore >= 90 ? 'hsl(142 71% 55%)' : 'hsl(var(--muted-foreground))',
                                border: '1px solid',
                                borderColor: c.avgScore >= 90 ? 'hsl(142 71% 45% / 0.3)' : 'hsl(var(--border))',
                              }}>
                                {c.avgScore}%
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              {c.nextAppt ? c.nextAppt : '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formulations Tab */}
          <TabsContent value="formulations" className="mt-4">
            <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Client</TableHead>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Color Change</TableHead>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Brand</TableHead>
                      <TableHead className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Service</TableHead>
                      <TableHead className="text-xs font-medium text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((f) => (
                      <TableRow
                        key={f.id}
                        className="cursor-pointer"
                        style={{ borderBottom: '1px solid hsl(var(--border))' }}
                      >
                        <TableCell>
                          <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{f.client}</p>
                          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.date}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getSwatchColor(f.current.level) }} />
                            <svg className="w-3 h-3" style={{ color: 'hsl(var(--muted-foreground))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getSwatchColor(f.target.level) }} />
                            <span className="text-xs ml-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              L{f.current.level}{TONE_NAMES[f.current.tone]} → L{f.target.level}{TONE_NAMES[f.target.tone]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{f.brand}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}>
                            {f.service}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="text-xs font-medium" style={{
                            background: f.score >= 90 ? 'hsl(142 71% 45% / 0.15)' : 'hsl(var(--muted))',
                            color: f.score >= 90 ? 'hsl(142 71% 55%)' : 'hsl(var(--muted-foreground))',
                            border: '1px solid',
                            borderColor: f.score >= 90 ? 'hsl(142 71% 45% / 0.3)' : 'hsl(var(--border))',
                          }}>
                            {f.score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}