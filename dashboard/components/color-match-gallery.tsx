'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, TrendingUp, Eye } from 'lucide-react'

interface GalleryItem {
  id: string
  beforeUrl: string
  afterUrl: string
  shadeName: string
  brand: string
  level: number
  tone: string
  score: number
  viewCount: number
  tags: string[]
  colorHex: string
}

interface ColorMatchGalleryProps {
  items?: GalleryItem[]
  onItemClick?: (item: GalleryItem) => void
}

// Fallback demo data — in production, fetch from /api/v1/gallery/photos
const DEMO_ITEMS: GalleryItem[] = [
  {
    id: 'demo-1',
    beforeUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop',
    shadeName: 'Beige Blonde 8/1',
    brand: 'Wella',
    level: 8,
    tone: 'beige',
    score: 94,
    viewCount: 1247,
    tags: ['transformation', 'blonde', 'balayage'],
    colorHex: '#D4A574',
  },
  {
    id: 'demo-2',
    beforeUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1519699047748-e8e732aff431?w=400&h=500&fit=crop',
    shadeName: 'Copper Red 6/4',
    brand: "L'Oréal",
    level: 6,
    tone: 'copper',
    score: 91,
    viewCount: 892,
    tags: ['vibrant', 'red', 'single-process'],
    colorHex: '#B87333',
  },
  {
    id: 'demo-3',
    beforeUrl: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=500&fit=crop',
    shadeName: 'Ash Blonde 9/1',
    brand: 'Schwarzkopf',
    level: 9,
    tone: 'ash',
    score: 89,
    viewCount: 2156,
    tags: ['cool-blonde', 'highlights', 'low-maintenance'],
    colorHex: '#C4B8A5',
  },
  {
    id: 'demo-4',
    beforeUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1487412912499-97fc11f37600?w=400&h=500&fit=crop',
    shadeName: 'Golden Brunette 5/3',
    brand: 'Davines',
    level: 5,
    tone: 'golden',
    score: 87,
    viewCount: 654,
    tags: ['brunette', 'warm', 'gloss'],
    colorHex: '#8B6914',
  },
  {
    id: 'demo-5',
    beforeUrl: 'https://images.unsplash.com/photo-1620331311520-246422fd82f8?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1595152772835-219d2f8a8d11?w=400&h=500&fit=crop',
    shadeName: 'Violet Smoke 7/2',
    brand: 'Pulp Riot',
    level: 7,
    tone: 'violet',
    score: 93,
    viewCount: 3102,
    tags: ['pastel', 'violet', 'creative'],
    colorHex: '#9B6B9E',
  },
  {
    id: 'demo-6',
    beforeUrl: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=500&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f9?w=400&h=500&fit=crop',
    shadeName: 'Pearl Platinum 10/8',
    brand: 'Redken',
    level: 10,
    tone: 'pearl',
    score: 96,
    viewCount: 4521,
    tags: ['platinum', 'transformation', 'cool'],
    colorHex: '#E8DCC8',
  },
]

export default function ColorMatchGallery({ items, onItemClick }: ColorMatchGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(items || [])
  const [liked, setLiked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!items) {
      // In production: fetch from /api/v1/gallery/photos?sort=featured&limit=6
      // For now, load demo data after a brief "loading" feel
      const timer = setTimeout(() => setGalleryItems(DEMO_ITEMS), 300)
      return () => clearTimeout(timer)
    }
  }, [items])

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Trending Matches
          </p>
          <h2 className="text-2xl md:text-4xl font-black mb-3">
            Popular Color Matches
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            See what others are matching right now — real results from real stylists
          </p>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      {galleryItems.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariant}
              onClick={() => onItemClick?.(item)}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden cursor-pointer hover:border-[#9333EA]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]"
            >
              {/* Image Stack */}
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* After (default visible) */}
                <img
                  src={item.afterUrl}
                  alt={`${item.shadeName} after`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                />
                {/* Before (reveals on hover) */}
                <img
                  src={item.beforeUrl}
                  alt={`${item.shadeName} before`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Hover label */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  Before → After
                </div>

                {/* Match score badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  {item.score}% Match
                </div>

                {/* Color swatch overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-xs font-medium text-white/80 drop-shadow-md">
                    {item.shadeName}
                  </span>
                </div>

                {/* Like button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(item.id)
                  }}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
                >
                  <Heart
                    size={14}
                    className={liked.has(item.id) ? 'text-red-400 fill-red-400' : 'text-white/70'}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{item.brand}</p>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Eye size={12} />
                    {item.viewCount.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-[#9333EA] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/40 text-sm">Loading trending matches..."</p>
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center mt-10">
        <a
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#9333EA] hover:text-[#EC4899] transition-colors"
        >
          View All Matches
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  )
}
