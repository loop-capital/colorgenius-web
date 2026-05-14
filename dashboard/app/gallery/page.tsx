'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GalleryFeed } from '@/components/custom/gallery-feed'
import { PhotoDetail, type PhotoDetailProps } from '@/components/custom/photo-detail'
import { AnimatePresence } from 'framer-motion'

export default function GalleryPage() {
  const [detailPhoto, setDetailPhoto] = useState<{
    id: string
    beforeUrl: string | null
    afterUrl: string | null
    caption: string
    tags: string[]
    likes: number
    comments: number
    isLiked: boolean
    isSaved: boolean
    createdAt: string
    stylistName: string
    salonName: string
    avatarUrl?: string
    confidence?: number
    formulaId?: string
    stylistId?: string
  } | null>(null)

  return (
    <div className="min-h-screen" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
            Discover
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            Color{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #9333EA, #EC4899)' }}
            >
              Gallery
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
            Inspiring transformations from professional colorists worldwide
          </p>
        </motion.div>
      </div>

      <GalleryFeed
        onPhotoClick={(photo) =>
          setDetailPhoto({
            id: photo.id,
            beforeUrl: photo.beforeImage || null,
            afterUrl: photo.afterImage || null,
            caption: '',
            tags: photo.tags,
            likes: 0,
            comments: photo.commentCount,
            isLiked: false,
            isSaved: false,
            createdAt: photo.createdAt,
            stylistName: photo.stylistName,
            salonName: '',
            formulaId: photo.formulaId,
            stylistId: undefined,
          })
        }
      />

      <AnimatePresence>
        {detailPhoto && (
          <PhotoDetail
            photoId={detailPhoto.id}
            beforeUrl={detailPhoto.beforeUrl}
            afterUrl={detailPhoto.afterUrl}
            caption={detailPhoto.caption}
            tags={detailPhoto.tags}
            likes={detailPhoto.likes}
            comments={detailPhoto.comments}
            isLiked={detailPhoto.isLiked}
            isSaved={detailPhoto.isSaved}
            createdAt={detailPhoto.createdAt}
            stylistName={detailPhoto.stylistName}
            salonName={detailPhoto.salonName}
            avatarUrl={detailPhoto.avatarUrl}
            confidence={detailPhoto.confidence}
            formulaId={detailPhoto.formulaId}
            stylistId={detailPhoto.stylistId}
            onClose={() => setDetailPhoto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
