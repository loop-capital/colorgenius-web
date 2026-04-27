'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/custom/glass-card'
import {
  MessageSquare, Heart, Share2, Bookmark, ImageIcon,
  TrendingUp, Users, Award, ChevronRight,
} from 'lucide-react'

const tabs = [
  { id: 'feed', label: 'Feed', icon: MessageSquare },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'experts', label: 'Experts', icon: Award },
]

const mockFeed = [
  {
    id: 1,
    author: 'Eiza at Pleij',
    avatar: 'EP',
    avatarColor: '#14B8A6',
    time: '2h ago',
    content: 'Just did a summer balayage on level 6 natural — lifted to 8 with Wella Blondor and toned with 8/73 + 7/73. The key was pre-softening the ends first!',
    image: true,
    likes: 47,
    comments: 12,
    saves: 8,
    tags: ['balayage', 'wellatips', 'summerhair'],
  },
  {
    id: 2,
    author: 'Maria Colorist',
    avatar: 'MC',
    avatarColor: '#F59E0B',
    time: '5h ago',
    content: 'Question for the community: client with previously box-dyed level 3 hair wants to go ash blonde. Porosity is high on ends. Would you pre-pigment before lifting?',
    image: false,
    likes: 89,
    comments: 34,
    saves: 15,
    tags: ['colorcorrection', 'help'],
  },
  {
    id: 3,
    author: 'Jen at Studio Y',
    avatar: 'JY',
    avatarColor: '#8B5CF6',
    time: '8h ago',
    content: 'New Schwarzkopf IGORA Vibrance shades are incredible. Just used 7-88 on a client and got the most vibrant copper. Highly recommend!',
    image: true,
    likes: 156,
    comments: 28,
    saves: 42,
    tags: ['productreview', 'schwarzkopf', 'copper'],
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSave = (id: number) => {
    setSavedPosts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]" style={{ backgroundImage: 'linear-gradient(135deg, #0A0A0F 0%, #1A1033 50%, #0F1A2E 100%)' }}>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] text-[#71717A] uppercase tracking-[0.1em] font-semibold mb-2">Connect</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7]">Community</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">Share formulas, ask questions, learn from pros worldwide</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {mockFeed.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${post.avatarColor}15`, color: post.avatarColor }}>
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-[#F5F5F7] font-medium">{post.author}</p>
                      <p className="text-[11px] text-[#71717A]">{post.time}</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <Share2 className="w-4 h-4 text-[#71717A]" />
                    </button>
                  </div>

                  <p className="text-[13px] text-[#A1A1AA] leading-relaxed mb-4">{post.content}</p>

                  {post.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-white/[0.04]">
                      <div className="aspect-video bg-[#161620] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#52525B]" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[11px] text-[#71717A]">#{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 pt-4 border-t border-white/[0.04]">
                    <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${likedPosts.has(post.id) ? 'text-[#EF4444] bg-[#EF4444]/10' : 'text-[#71717A] hover:bg-white/[0.04]'}`}>
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-[12px] font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#71717A] hover:bg-white/[0.04] transition-all">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[12px] font-medium">{post.comments}</span>
                    </button>

                    <button onClick={() => toggleSave(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${savedPosts.has(post.id) ? 'text-[#F59E0B] bg-[#F59E0B]/10' : 'text-[#71717A] hover:bg-white/[0.04]'}`}>
                      <Bookmark className={`w-4 h-4 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-[12px] font-medium">{post.saves + (savedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>

                    <button className="ml-auto text-[11px] text-[#14B8A6] hover:text-[#2DD4BF] font-medium flex items-center gap-1 transition-colors">
                      Reply <ChevronRight className="w-3 h-3" />
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