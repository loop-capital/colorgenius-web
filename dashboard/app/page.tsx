'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBadge } from '@/components/ui/confidence-badge'
import { FormulaCard } from '@/components/ui/formula-card'
import {
  FlaskConical,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Camera,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const stats = [
  { label: 'Active Clients', value: '24', change: '+3', icon: Users, accent: 'text-[#14B8A6]' },
  { label: 'Formulations Today', value: '8', change: '+2', icon: FlaskConical, accent: 'text-[#F59E0B]' },
  { label: 'Avg. Confidence', value: '92%', change: '+1.5%', icon: TrendingUp, accent: 'text-emerald-400' },
  { label: 'Avg. Processing', value: '32m', change: '-3m', icon: Clock, accent: 'text-[#14B8A6]' },
]

const recentFormulations = [
  {
    name: 'Summer Balayage Formula',
    brand: 'Wella',
    line: 'Koleston Perfect ME+',
    shades: [
      { code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' },
      { code: '8/73', name: 'Light Golden Blonde', hex: '#D4AA7D' },
    ],
    developer: '30Vol',
    developerVolume: '30ml',
    mixRatio: '1:1',
    processingTime: '35 min',
    application: 'Balayage',
    confidence: 94,
    clientName: 'Jennifer Martinez',
    createdAt: '2 hours ago',
  },
  {
    name: 'Root Touch-Up — Natural Brown',
    brand: 'Schwarzkopf',
    line: 'Igora Royal',
    shades: [
      { code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' },
    ],
    developer: '10Vol',
    developerVolume: '20ml',
    mixRatio: '1:1',
    processingTime: '30 min',
    application: 'Roots',
    confidence: 91,
    clientName: 'Sarah Chen',
    createdAt: '4 hours ago',
  },
  {
    name: 'Ash Blonde Correction',
    brand: 'Goldwell',
    line: 'DualSenses Color',
    shades: [
      { code: '8A', name: 'Light Blonde Ash', hex: '#C4B0A0' },
      { code: '7A', name: 'Medium Blonde Ash', hex: '#A89080' },
    ],
    developer: '20Vol',
    developerVolume: '40ml',
    mixRatio: '1:1',
    processingTime: '45 min',
    application: 'Zone',
    confidence: 88,
    clientName: 'Emily Davis',
    createdAt: '6 hours ago',
  },
]

const quickActions = [
  {
    title: 'New Formula',
    description: 'Create a custom color formulation',
    icon: FlaskConical,
    href: '/formulate',
    accent: 'from-[#14B8A6] to-[#2DD4BF]',
    glow: 'shadow-[#14B8A6]/20',
  },
  {
    title: 'Photo Analysis',
    description: 'Analyze hair color from photo',
    icon: Camera,
    href: '/analyze',
    accent: 'from-[#F59E0B] to-[#FBBF24]',
    glow: 'shadow-[#F59E0B]/20',
  },
  {
    title: 'Client Consultation',
    description: 'Guided client intake wizard',
    icon: Sparkles,
    href: '/questionnaire',
    accent: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">Good morning</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">ColorGenius Dashboard</h1>
        <p className="text-sm text-[#A3A3A3] mt-1">AI-powered hair color formulation and salon consultation platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-[#171717] border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-[#737373] font-medium">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-[#F5F5F5]">{stat.value}</p>
                </div>
                <div className={cn('p-2 rounded-lg bg-opacity-10', stat.accent.replace('text-', 'bg-'))}>
                  <stat.icon className={cn('w-4 h-4', stat.accent)} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] border-0 px-1.5 py-0.5',
                    stat.change.startsWith('+') ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                  )}
                >
                  {stat.change}
                </Badge>
                <span className="text-[10px] text-[#737373]">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[#F5F5F5] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br',
                action.accent,
                'text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5',
                action.glow
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <action.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs text-white/70">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Formulations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#F5F5F5] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            Recent Formulations
          </h2>
          <Link
            href="/history"
            className="text-xs text-[#14B8A6] hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentFormulations.map((formula) => (
            <FormulaCard key={formula.name} {...formula} />
          ))}
        </div>
      </div>

      {/* Activity + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#171717] border-[#2A2A2A]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Today's Activity</h3>
            <div className="space-y-3">
              {[
                { text: 'Color analysis for Jennifer', time: '2h ago', type: 'analyze' as const },
                { text: 'New formula saved for Maria', time: '4h ago', type: 'formula' as const },
                { text: 'Client consultation completed — Sarah', time: '6h ago', type: 'consult' as const },
                { text: 'Root touch-up formula used', time: '8h ago', type: 'formula' as const },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]/50"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    activity.type === 'analyze' && 'bg-[#14B8A6]/10 text-[#14B8A6]',
                    activity.type === 'formula' && 'bg-[#F59E0B]/10 text-[#F59E0B]',
                    activity.type === 'consult' && 'bg-violet-500/10 text-violet-400'
                  )}>
                    <FlaskConical className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F5F5] truncate">{activity.text}</p>
                  </div>
                  <span className="text-[10px] text-[#737373] shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171717] border-[#2A2A2A]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { label: 'AI Model', status: 'Online', color: 'text-emerald-400' },
                { label: 'Photo Analysis', status: 'Ready', color: 'text-emerald-400' },
                { label: 'Product DB', status: 'Synced', color: 'text-emerald-400' },
                { label: 'Brand Library', status: '8 brands', color: 'text-[#14B8A6]' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-[#A3A3A3]">{item.label}</span>
                  <span className={cn('text-xs font-semibold', item.color)}>{item.status}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#2A2A2A]">
              <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold mb-2">Tip of the day</p>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                When formulating for gray coverage, always pre-soften resistant strands with 10Vol developer for 10 minutes before applying your target formula.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper
import { cn } from '@/lib/utils'
