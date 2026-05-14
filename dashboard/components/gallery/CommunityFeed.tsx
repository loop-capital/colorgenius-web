'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Plus, TrendingUp, Clock, Star, Filter } from 'lucide-react'
import Link from 'next/link'
import PhotoUpload from './PhotoUpload'

interface FeedItem {
  id: string
  type: 'formula_share' | 'tip' | 'question' | 'milestone'
  author: string
  authorAvatar: string
  authorInstagram?: string
  content: string
  beforeUrl?: string
  afterUrl?: string
  formulaId?: string
  brand?: string
  shades?: string[]
  voteCount: number
  commentCount: number
  createdAt: string
  tags?: string[]
}

export default function CommunityFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostText, setNewPostText] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [activeTab, page])

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('tab', activeTab)
      params.append('page', page.toString())

      const res = await fetch(`/api/v1/gallery/feed?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      if (page === 1) {
        setItems(data.items || [])
      } else {
        setItems(prev => [...prev, ...(data.items || [])])
      }
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Failed to load feed:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tip',
          content: newPostText,
        }),
      })

      if (res.ok) {
        const newItem = await res.json()
        setItems(prev => [newItem, ...prev])
        setNewPostText('')
        setShowCreatePost(false)
      }
    } catch (err) {
      console.error('Failed to create post:', err)
    }
  }

  const handleVote = async (itemId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${itemId}/like`, {
        method: 'POST',
      })

      if (res.ok) {
        setItems(prev => prev.map(item => {
          if (item.id === itemId) {
            return { ...item, voteCount: item.voteCount + 1 }
          }
          return item
        }))
      }
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: 'Trending' },
    { id: 'following', label: 'Following' },
    { id: 'my_posts', label: 'My Posts' },
  ]

  if (loading && page === 1) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161620] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Post</h3>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share a tip, ask a question, or celebrate a win..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50 min-h-[120px] resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Items */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No posts yet</p>
          <p className="text-white/20 text-sm mt-2">Be the first to share!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center text-white font-bold">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.author}</p>
                      {item.authorInstagram && (
                        <p className="text-sm text-[#EC4899]">@{item.authorInstagram}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                  <p className="text-white/80 mb-4">{item.content}</p>

                  {/* Photos */}
                  {(item.beforeUrl || item.afterUrl) && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {item.beforeUrl && (
                        <div className="relative">
                          <img
                            src={item.beforeUrl}
                            alt="Before"
                            className="w-full h-48 object-cover rounded-xl"
                          />
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Before</span>
                        </div>
                      )}
                      {item.afterUrl && (
                        <div className="relative">
                          <img
                            src={item.afterUrl}
                            alt="After"
                            className="w-full h-48 object-cover rounded-xl"
                          />
                          <span className="absolute top-2 left-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-xs px-2 py-1 rounded-full">After</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formula Tag */}
                  {item.formulaId && (
                    <Link
                      href={`/formulas/${item.formulaId}`}
                      className="inline-block bg-gradient-to-r from-[#9333EA]/10 to-[#EC4899]/10 border border-[#9333EA]/20 rounded-lg px-3 py-2 text-sm text-[#9333EA] hover:border-[#9333EA]/40 transition-colors mb-4"
                    >
                      {item.brand} {item.shades?.join(' + ')}
                    </Link>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
                  <button
                    onClick={() => handleVote(item.id)}
                    className="flex items-center gap-2 text-white/40 hover:text-[#EC4899] transition-colors"
                  >
                    <Heart size={18} />
                    <span className="text-sm">{item.voteCount}</span>
                  </button>

                  <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">{item.commentCount}</span>
                  </button>

                  <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
