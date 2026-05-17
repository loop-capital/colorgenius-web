'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PhotoGallery from '@/components/gallery/PhotoGallery'

export default function GalleryPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0A1A' }}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Discover
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F7' }}>
            Color{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #D946EF)' }}
            >
              Gallery
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Inspiring transformations from professional colorists worldwide
          </p>
        </motion.div>

        <PhotoGallery />
      </div>
    </div>
  )
}
