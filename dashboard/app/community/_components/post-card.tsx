'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassCard } from '@/components/custom/glass-card';
import { PostTypeBadge } from './post-type-badge';
import {
  MessageSquare, Heart, Bookmark, Share2, ChevronRight,
  Award, ImageIcon, ChevronLeft,
} from 'lucide-react';
import { CommunityPost, PostComment } from '@/lib/api/types';
import { CommentThread } from './comment-thread';

interface PostCardProps {
  post: CommunityPost;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, content: string) => Promise<void>;
  liked: boolean;
  saved: boolean;
  index?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function PostCard({ post, onLike, onSave, onComment, liked, saved, index = 0 }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const images = post.image_urls || [];
  const hasImages = images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <GlassCard>
        <div className="p-4 md:p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=9333EA&color=fff`;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(147,51,234,0.15)', color: '#9333EA' }}>
                {post.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] text-[#F5F5F7] font-medium truncate">{post.author_name}</p>
                {post.author_is_educator && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#9333EA]/15 text-[#9333EA] text-[9px] font-semibold uppercase tracking-wider">
                    <Award className="w-2.5 h-2.5" /> Educator
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-[#71717A]">{post.author_handle} · {timeAgo(post.created_at)}</p>
              </div>
            </div>
            <PostTypeBadge type={post.type} />
          </div>

          {/* Content */}
          <div className="mb-3">
            {post.caption && (
              <p className="text-[13px] text-[#F5F5F7] font-medium mb-1.5">{post.caption}</p>
            )}
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Formula Card */}
          {post.formulation_snapshot && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9333EA' }} />
                <span className="text-[11px] text-[#9333EA] font-semibold uppercase tracking-wider">Formula</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Brand</p>
                  <p className="text-[12px] text-[#F5F5F7]">{post.formulation_snapshot.brand}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Shade</p>
                  <p className="text-[12px] text-[#F5F5F7]">{post.formulation_snapshot.shade_code} · {post.formulation_snapshot.shade_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Level</p>
                  <p className="text-[12px] text-[#F5F5F7]">{post.formulation_snapshot.level}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Developer</p>
                  <p className="text-[12px] text-[#F5F5F7]">{post.formulation_snapshot.developer_volume}vol · {post.formulation_snapshot.processing_time}min</p>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {hasImages && (
            <div className="relative rounded-xl overflow-hidden mb-3 border border-white/[0.04]">
              <div className="aspect-[4/3] relative bg-[#161620]">
                {images.map((url, i) => (
                  !imgError[url] && (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: i === imgIndex ? 1 : 0, transition: 'opacity 0.3s' }}
                      onError={() => setImgError(prev => ({ ...prev, [url]: true }))}
                    />
                  )
                ))}
                {images.every(u => imgError[u]) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#52525B]" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    style={{ opacity: imgIndex > 0 ? 1 : 0, pointerEvents: imgIndex > 0 ? 'auto' : 'none' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    style={{ opacity: imgIndex < images.length - 1 ? 1 : 0, pointerEvents: imgIndex < images.length - 1 ? 'auto' : 'none' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full transition-colors"
                        style={{ backgroundColor: i === imgIndex ? '#9333EA' : 'rgba(255,255,255,0.3)' }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[11px] text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-1 pt-3 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                liked ? 'text-[#EF4444] bg-[#EF4444]/10' : 'text-[#71717A] hover:bg-white/[0.04]'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-[12px] font-medium">{post.likes}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#71717A] hover:bg-white/[0.04] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[12px] font-medium">{post.comments}</span>
            </button>

            <button
              type="button"
              onClick={() => onSave(post.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                saved ? 'text-[#F59E0B] bg-[#F59E0B]/10' : 'text-[#71717A] hover:bg-white/[0.04]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span className="text-[12px] font-medium">{post.saves}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.caption || post.content, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#71717A] hover:bg-white/[0.04] transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <CommentThread
              postId={post.id}
              onComment={onComment}
            />
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
