'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatCard, GlassCard } from '@/components/custom/glass-card'
import { TreatmentCard } from '@/components/custom/treatment-card'
import {
  FlaskConical, Users, TrendingUp, Clock,
  ArrowRight, Camera, Sparkles, ChevronRight,
  Zap, Shield, Database,
} from 'lucide-react'

const stats = [
  { label: 'Active Clients', value: '24', change: '+3', icon: <Users className="w-5 h-5" />, accent: '#9333EA' },
  { label: 'Formulations Today', value: '8', change: '+2', icon: <FlaskConical className="w-5 h-5" />, accent: '#F59E0B' },
  { label: 'Avg. Confidence', value: '92%', change: '+1.5%', icon: <TrendingUp className="w-5 h-5" />, accent: '#10B981' },
  { label: 'Avg. Processing', value: '32m', change: '-3m', icon: <Clock className="w-5 h-5" />, accent: '#9333EA' },
]

const recentFormulations = [
  {
    name: 'Summer Balayage Formula', brand: 'Wella', line: 'Koleston Perfect ME+',
    shades: [{ code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' }, { code: '8/73', name: 'Light Golden Blonde', hex: '#D4AA7D' }],
    developer: 'Welloxon Perfect', developerVolume: '30Vol', mixRatio: '1:1', processingTime: '35',
    application: 'Balayage', confidence: 94,
  },
  {
    name: 'Root Touch-Up', brand: 'Schwarzkopf', line: 'Igora Royal',
    shades: [{ code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' }],
    developer: 'Igora Royal Oil', developerVolume: '10Vol', mixRatio: '1:1', processingTime: '30',
    application: 'Roots', confidence: 91,
  },
  {
    name: 'Ash Blonde Correction', brand: 'Goldwell', line: 'DualSenses Color',
    shades: [{ code: '8A', name: 'Light Blonde Ash', hex: '#C4B0A0' }, { code: '7A', name: 'Medium Blonde Ash', hex: '#A89080' }],
    developer: 'Topchic Developer', developerVolume: '20Vol', mixRatio: '1:1', processingTime: '45',
    application: 'Zone', confidence: 88,
  },
]

const quickActions = [
  { title: 'New Formula', desc: 'Create a custom formulation', icon: FlaskConical, href: '/formulate', gradient: 'linear-gradient(135deg, #9333EA 0%, #0D9488 50%, #115E59 100%)' },
  { title: 'Photo Analysis', desc: 'Analyze hair color from photo', icon: Camera, href: '/analyze', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)' },
  { title: 'Client Intake', desc: 'Guided consultation wizard', icon: Sparkles, href: '/questionnaire', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)' },
]

const systemStatus = [
  { label: 'AI Model', status: 'Online', icon: <Zap className="w-3.5 h-3.5" />, color: '#10B981' },
  { label: 'Photo Analysis', status: 'Ready', icon: <Camera className="w-3.5 h-3.5" />, color: '#10B981' },
  { label: 'Product DB', status: 'Synced', icon: <Database className="w-3.5 h-3.5" />, color: '#9333EA' },
  { label: 'Brand Library', status: '9 brands', icon: <Shield className="w-3.5 h-3.5" />, color: '#9333EA' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]" style={{ backgroundImage: 'linear-gradient(135deg, #0A0A0F 0%, #1A1033 50%, #0F1A2E 100%)' }}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[11px] text-[#71717A] uppercase tracking-[0.1em] font-semibold mb-2">Good morning</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7] tracking-tight">ColorGenius</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">AI-powered hair color formulation for professional colorists</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} icon={stat.icon} accent={stat.accent} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#F5F5F7] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  className="relative group overflow-hidden rounded-2xl p-5 text-white cursor-pointer"
                  style={{ background: action.gradient }}
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <div className="relative flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-[11px] text-white/60 mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Formulations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> Recent Formulations
            </h2>
            <Link href="/history" className="text-[11px] text-[#9333EA] hover:text-[#EC4899] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFormulations.map((formula, i) => (
              <motion.div key={formula.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <TreatmentCard {...formula} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity Feed */}
          <GlassCard className="lg:col-span-2">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4">Today&apos;s Activity</h3>
              <div className="space-y-2">
                {[
                  { text: 'Color analysis for Jennifer', time: '2h ago', color: '#9333EA' },
                  { text: 'New formula saved for Maria', time: '4h ago', color: '#F59E0B' },
                  { text: 'Client consultation — Sarah', time: '6h ago', color: '#8B5CF6' },
                  { text: 'Root touch-up formula used', time: '8h ago', color: '#F59E0B' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0F0F1A]/60 border border-white/[0.04]"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                      <FlaskConical className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <p className="text-[13px] text-[#F5F5F7] flex-1 truncate">{item.text}</p>
                    <span className="text-[10px] text-[#71717A] shrink-0 tabular-nums">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* System Status */}
          <GlassCard>
            <div className="p-5">
              <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4">System Status</h3>
              <div className="space-y-3">
                {systemStatus.map((item, i) => (
                  <motion.div key={item.label} className="flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.08 }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>{item.icon}</div>
                      <span className="text-[13px] text-[#A1A1AA]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-semibold" style={{ color: item.color }}>{item.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] text-[#71717A] uppercase tracking-[0.08em] font-semibold mb-2">Tip of the day</p>
                <p className="text-[12px] text-[#A1A1AA] leading-relaxed">Pre-soften resistant gray strands with 10Vol developer for 10 min before applying target formula.</p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}