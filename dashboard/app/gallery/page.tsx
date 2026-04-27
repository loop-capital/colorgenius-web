'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/custom/glass-card'
import { TreatmentCard } from '@/components/custom/treatment-card'
import {
  TrendingUp, Flame, Heart, Bookmark,
  Palette, ChevronRight, Sparkles, Filter,
} from 'lucide-react'

const tabs = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'seasonal', label: 'Seasonal', icon: Palette },
  { id: 'latest', label: 'Latest', icon: Flame },
]

const mockPosts = [
  {
    name: 'Summer Balayage', brand: 'Wella', line: 'Koleston Perfect',
    shades: [{ code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' }, { code: '8/73', name: 'Light Golden', hex: '#D4AA7D' }],
    developer: 'Welloxon Perfect', developerVolume: '30Vol', mixRatio: '1:1', processingTime: '35',
    application: 'Balayage', confidence: 94,
    likes: 234, saves: 67,
    stylist: { name: 'Eiza', salon: 'Pleij' },
  },
  {
    name: 'Root Touch-Up', brand: 'Schwarzkopf', line: 'Igora Royal',
    shades: [{ code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' }],
    developer: 'Igora Royal Oil', developerVolume: '10Vol', mixRatio: '1:1', processingTime: '30',
    application: 'Roots', confidence: 91,
    likes: 156, saves: 34,
    stylist: { name: 'Maria', salon: 'Salon X' },
  },
  {
    name: 'Ash Blonde Correction', brand: 'Goldwell', line: 'DualSenses',
    shades: [{ code: '8A', name: 'Light Blonde Ash', hex: '#C4B0A0' }],
    developer: 'Topchic Developer', developerVolume: '20Vol', mixRatio: '1:1', processingTime: '45',
    application: 'Zone', confidence: 88,
    likes: 189, saves: 52,
    stylist: { name: 'Jen', salon: 'Studio Y' },
  },
]

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState('trending')

  return (
    <div className="min-h-screen bg-[#0A0A0F]" style={{ backgroundImage: 'linear-gradient(135deg, #0A0A0F 0%, #1A1033 50%, #0F1A2E 100%)' }}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] text-[#71717A] uppercase tracking-[0.1em] font-semibold mb-2">Discover</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7]">Color Gallery</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">Inspiring transformations from professional colorists worldwide</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#14B8A6]/15 text-[#14B8A6] border border-[#14B8A6]/20'
                  : 'bg-white/[0.03] text-[#71717A] border border-white/[0.04] hover:bg-white/[0.06] hover:text-[#A1A1AA]'
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </motion.button>
          ))}
          <motion.button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.03] text-[#71717A] border border-white/[0.04] hover:bg-white/[0.06] shrink-0" whileTap={{ scale: 0.97 }}>
            <Filter className="w-4 h-4" /> Filter
          </motion.button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockPosts.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 flex items-center justify-center text-[#14B8A6] text-xs font-bold">
                        {post.stylist.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] text-[#F5F5F7] font-medium">{post.stylist.name}</p>
                        <p className="text-[11px] text-[#71717A]">{post.stylist.salon}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#71717A]">
                      <Sparkles className="w-3 h-3 text-[#F59E0B]" />{post.confidence}%
                    </div>
                  </div>
                  <TreatmentCard {...post} className='w-full' />
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.04]">
                    <button className="flex items-center gap-1.5 text-[11px] text-[#71717A] hover:text-[#EF4444] transition-colors">
                      <Heart className="w-3.5 h-3.5" />{post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px] text-[#71717A] hover:text-[#F59E0B] transition-colors">
                      <Bookmark className="w-3.5 h-3.5" />{post.saves}
                    </button>
                    <button className="ml-auto text-[11px] text-[#14B8A6] hover:text-[#2DD4BF] font-medium flex items-center gap-1 transition-colors">
                      View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}