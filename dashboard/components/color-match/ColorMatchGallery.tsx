'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface TrendingMatch {
  id: string
  image: string
  colorFamily: string
  brand: string
  shadeName: string
  likes: number
  confidence: number
}

const TRENDING_MATCHES: TrendingMatch[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1522337364685-0c1e27f72a0e?w=400&h=400&fit=crop',
    colorFamily: 'Cool Blonde',
    brand: 'Wella',
    shadeName: 'Illumina 9/16',
    likes: 1247,
    confidence: 96,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    colorFamily: 'Warm Brunette',
    brand: 'Davines',
    shadeName: 'Mask 5.35',
    likes: 892,
    confidence: 94,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    colorFamily: 'Copper Red',
    brand: 'Redken',
    shadeName: 'Shades EQ 06C',
    likes: 756,
    confidence: 91,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    colorFamily: 'Ash Blonde',
    brand: 'L\'Oréal',
    shadeName: 'Majirel 8.1',
    likes: 634,
    confidence: 93,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop',
    colorFamily: 'Chocolate Brown',
    brand: 'Schwarzkopf',
    shadeName: 'Igora Royal 5-68',
    likes: 521,
    confidence: 89,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1503951911505-97d4b3e04ca4?w=400&h=400&fit=crop',
    colorFamily: 'Pearl Blonde',
    brand: 'Matrix',
    shadeName: 'Color Sync 10P',
    likes: 489,
    confidence: 95,
  },
]

export function ColorMatchGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <TrendingUp size={18} color="#EC4899" />
              <span style={{ color: '#EC4899', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Trending Now
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, marginBottom: 12 }}>
              Popular Color Matches
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              See what others are matching — from Instagram inspirations to salon transformations
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {TRENDING_MATCHES.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onMouseEnter={() => setHoveredId(match.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                ...(hoveredId === match.id ? { borderColor: 'rgba(147,51,234,0.3)' } : {}),
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                <img
                  src={match.image}
                  alt={match.colorFamily}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                    transform: hoveredId === match.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
                {/* Confidence Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#4ADE80',
                  }}
                >
                  <Sparkles size={12} />
                  {match.confidence}%
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{match.colorFamily}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    <Heart size={14} />
                    {match.likes.toLocaleString()}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                  {match.brand} · {match.shadeName}
                </p>
                <a
                  href="/formulate"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#9333EA',
                    textDecoration: 'none',
                  }}
                >
                  Match this color
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
