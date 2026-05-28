'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import PhotoDetail from '@/components/gallery/PhotoDetail'

export default function GalleryPhotoPage() {
  const params = useParams()
  const photoId = params.id as string

  return (
    <div className="min-h-screen" style={{ background: '#0A0A1A' }}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </motion.div>

        <PhotoDetail photoId={photoId} />
      </div>
    </div>
  )
}
