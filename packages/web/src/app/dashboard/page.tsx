'use client'

import React from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const LEVEL_NAMES = ['Black', 'Darkest Brown', 'Dark Brown', 'Dark Chestnut', 'Chestnut Brown', 'Dark Blonde', 'Medium Blonde', 'Light Blonde', 'Very Light Blonde', 'Lightest Blonde']
const TONE_NAMES: Record<string, string> = { N: 'Natural', A: 'Ash', G: 'Gold', R: 'Red', V: 'Violet', K: 'Copper', B: 'Beige' }

function getSwatchColor(level: number, tone: string): string {
  const base: Record<number, string> = {
    1: '#1a1a1a', 2: '#2d1f12', 3: '#3d2515', 4: '#4a2e1a', 5: '#5c3a20',
    6: '#7a5030', 7: '#9e7040', 8: '#b89050', 9: '#d4aa60', 10: '#e8c880',
  }
  return base[level] || '#888'
}

const RECENT_FORMULATIONS = [
  { id: 'f1', client: 'Sarah Mitchell', date: 'Apr 20', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'G' }, brand: 'Wella Koleston', score: 91 },
  { id: 'f2', client: 'Jessica Torres', date: 'Apr 19', current: { level: 5, tone: 'A' }, target: { level: 6, tone: 'N' }, brand: 'Redken', score: 88 },
  { id: 'f3', client: 'Amanda Brooks', date: 'Apr 18', current: { level: 7, tone: 'G' }, target: { level: 8, tone: 'N' }, brand: 'Schwarzkopf', score: 85 },
  { id: 'f4', client: 'Maria Chen', date: 'Apr 17', current: { level: 4, tone: 'N' }, target: { level: 5, tone: 'G' }, brand: 'Davines', score: 94 },
]

const TOP_STYLISTS = [
  { name: 'Jessica Torres', formulations: 28, avgScore: 91 },
  { name: 'Sarah Mitchell', formulations: 24, avgScore: 89 },
  { name: 'Amanda Brooks', formulations: 19, avgScore: 87 },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Welcome back — here's your color overview
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/questionnaire">
              <Button variant="outline" size="sm" className="text-xs h-9" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                + New Client
              </Button>
            </Link>
            <Link href="/formulate">
              <Button size="sm" className="text-xs h-9" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                + New Formulation
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Formulations', value: '142', sub: '+12 this month', accent: false },
            { label: 'Avg Score', value: '87%', sub: '+3% vs last month', accent: true },
            { label: 'Active Clients', value: '38', sub: '+5 this month', accent: false },
            { label: 'This Week', value: '9', sub: '3 formulations', accent: false },
          ].map(({ label, value, sub, accent }) => (
            <Card key={label} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
                <p className={`text-2xl font-bold mt-1 ${accent ? 'text-emerald-400' : ''}`}
                  style={{ color: accent ? 'hsl(142 71% 55%)' : 'hsl(var(--primary))' }}>
                  {value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Formulations */}
          <Card className="lg:col-span-2" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <CardHeader className="pb-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  Recent Formulations
                </CardTitle>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-xs h-7" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECENT_FORMULATIONS.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                  style={{ background: 'hsl(var(--muted))' }}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full border-2 shrink-0"
                      style={{ borderColor: 'hsl(var(--card))', backgroundColor: getSwatchColor(f.current.level, f.current.tone) }}
                      title={`Level ${f.current.level} ${TONE_NAMES[f.current.tone]}`}
                    />
                    <svg className="w-3 h-3 shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div
                      className="w-8 h-8 rounded-full border-2 shrink-0"
                      style={{ borderColor: 'hsl(var(--card))', backgroundColor: getSwatchColor(f.target.level, f.target.tone) }}
                      title={`Level ${f.target.level} ${TONE_NAMES[f.target.tone]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{f.client}</p>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.brand} · {f.date}</p>
                    </div>
                  </div>
                  <Badge
                    className="text-xs font-medium shrink-0"
                    style={
                      f.score >= 90
                        ? { background: 'hsl(142 71% 45% / 0.15)', color: 'hsl(142 71% 55%)', border: '1px solid hsl(142 71% 45% / 0.3)' }
                        : f.score >= 85
                        ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }
                        : { background: 'hsl(var(--destructive) / 0.1)', color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive) / 0.3)' }
                    }
                  >
                    {f.score}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <CardHeader className="pb-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <CardTitle className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/formulate" className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'hsl(var(--primary) / 0.1)' }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    <svg className="h-4 w-4" style={{ color: 'hsl(var(--primary-foreground))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>New Formulation</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Start from scratch</p>
                  </div>
                </div>
              </Link>
              <Link href="/history" className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'hsl(var(--muted))' }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{ background: 'hsl(32 95% 54% / 0.15)' }}
                  >
                    <svg className="h-4 w-4" style={{ color: 'hsl(32 95% 54%)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Client History</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Review past formulations</p>
                  </div>
                </div>
              </Link>
              <Link href="/library" className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'hsl(var(--muted))' }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{ background: 'hsl(262 83% 58% / 0.15)' }}
                  >
                    <svg className="h-4 w-4" style={{ color: 'hsl(262 83% 65%)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-.5a4 4 0 00-1.28-2.85A5 5 0 0013 8V7a2 2 0 00-2-2h-2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Color Library</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Browse shades & brands</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tabs */}
        <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <CardHeader className="pb-0" style={{ borderBottom: 'none' }}>
            <Tabs defaultValue="trends" className="w-full">
              <TabsList
                className="h-10 p-1 rounded-lg grid grid-cols-3"
                style={{ background: 'hsl(var(--muted))' }}
              >
                <TabsTrigger
                  value="trends"
                  className="h-7 text-xs rounded-md data-[state=active]:shadow-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Trends
                </TabsTrigger>
                <TabsTrigger
                  value="brands"
                  className="h-7 text-xs rounded-md data-[state=active]:shadow-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Top Brands
                </TabsTrigger>
                <TabsTrigger
                  value="stylists"
                  className="h-7 text-xs rounded-md data-[state=active]:shadow-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Top Stylists
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Formulations this week', value: '+18%', bg: 'hsl(142 71% 45% / 0.1)', color: 'hsl(142 71% 55%)' },
                    { label: 'Avg color accuracy', value: '89%', bg: 'hsl(174 72% 47% / 0.1)', color: 'hsl(174 72% 57%)' },
                    { label: 'Client satisfaction', value: '4.8', bg: 'hsl(32 95% 54% / 0.1)', color: 'hsl(32 95% 64%)' },
                  ].map(({ label, value, bg, color }) => (
                    <div key={label} className="p-4 rounded-lg" style={{ background: bg }}>
                      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                      <p className="text-xs mt-1" style={{ color }}>{label}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="brands" className="mt-4">
                <div className="space-y-2">
                  {[
                    { brand: 'Wella Koleston', count: 48, pct: 34 },
                    { brand: 'Redken Color Gels', count: 35, pct: 25 },
                    { brand: 'Schwarzkopf Igora', count: 28, pct: 20 },
                    { brand: 'Davines', count: 18, pct: 13 },
                    { brand: 'Other', count: 13, pct: 9 },
                  ].map(({ brand, count, pct }) => (
                    <div key={brand} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{brand}</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'hsl(var(--primary))' }} />
                      </div>
                      <div className="w-16 text-xs text-right" style={{ color: 'hsl(var(--muted-foreground))' }}>{count} ({pct}%)</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stylists" className="mt-4">
                <div className="space-y-2">
                  {TOP_STYLISTS.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{s.formulations} formulas</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Avg {s.avgScore}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  )
}