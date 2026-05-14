'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CommunityFeed from '@/components/gallery/CommunityFeed'

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]" style={{ backgroundImage: 'linear-gradient(135deg, #0A0A0F 0%, #1A1033 50%, #0F1A2E 100%)' }}>
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-28">
        {/* Header */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] text-[#71717A] uppercase tracking-[0.1em] font-semibold mb-2">Connect</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7]">Community</h1>
              <p className="text-sm text-[#A1A1AA] mt-1">Share formulas, ask questions, learn from pros worldwide</p>
            </div>
          </div>
        </motion.div>

        <CommunityFeed />
      </div>
    </div>
  )
}
