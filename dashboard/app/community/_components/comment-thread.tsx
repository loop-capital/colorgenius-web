'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { PostComment } from '@/lib/api/types';
import { useToast } from '@/components/ui/use-toast';

interface CommentThreadProps {
  postId: string;
  onComment: (postId: string, content: string) => Promise<void>;
}

export function CommentThread({ postId, onComment }: CommentThreadProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setComments(data.data || []);
      }
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await onComment(postId, text.trim());
      setText('');
      await fetchComments();
    } catch (err) {
      toast({
        title: 'Comment failed',
        description: err instanceof Error ? err.message : 'Could not post comment',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 pt-3 border-t border-white/[0.04]"
    >
      {loading && comments.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 text-[#9333EA] animate-spin" />
        </div>
      )}

      <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start gap-2.5">
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-6 h-6 rounded-lg object-cover flex-shrink-0 mt-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name)}&background=9333EA&color=fff`;
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-[#9333EA]/15 text-[#9333EA] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {comment.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] text-[#F5F5F7] font-medium">{comment.author_name}</span>
                <span className="text-[10px] text-[#71717A]">
                  {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-[13px] text-[#F5F5F7] placeholder-[#52525B] focus:outline-none focus:border-[#9333EA]/30 focus:ring-1 focus:ring-[#9333EA]/20 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-xl bg-[#9333EA]/15 text-[#9333EA] flex items-center justify-center hover:bg-[#9333EA]/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </motion.div>
  );
}
