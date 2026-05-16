'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X, Lightbulb, HelpCircle, Star, FlaskConical, Plus, ImageIcon,
  Upload, Trash2, Loader2, Hash, ChevronDown, Check, Send,
} from 'lucide-react';
import { GlassCard } from '@/components/custom/glass-card';
import { CommunityPostType, CreatePostInput } from '@/lib/api/types';
import { useToast } from '@/components/ui/use-toast';

const POST_TYPES: { id: CommunityPostType; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { id: 'tip', label: 'Tip', icon: Lightbulb, color: '#10B981', description: 'Share your technique or pro tip' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: '#F59E0B', description: 'Ask the community for help' },
  { id: 'review', label: 'Review', icon: Star, color: '#EC4899', description: 'Rate a product or technique' },
  { id: 'formula_share', label: 'Formula', icon: FlaskConical, color: '#9333EA', description: 'Share your color formula' },
];

const SUGGESTED_TAGS = ['balayage', 'blonde', 'graycoverage', 'copper', 'wella', 'redken', 'schwarzkopf', 'toning', 'foilyage', 'vivids'];

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<CommunityPostType>('tip');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const currentType = POST_TYPES.find(t => t.id === type) || POST_TYPES[0];
  const TypeIcon = currentType.icon;

  const reset = useCallback(() => {
    setType('tip');
    setContent('');
    setCaption('');
    setTags([]);
    setTagInput('');
    setImages([]);
    setUploading(false);
    setSubmitting(false);
    setShowTypeDropdown(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  function addTag(tag: string) {
    const clean = tag.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 20) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 4) {
      toast({ title: 'Max 4 images', description: 'You can only upload up to 4 images per post', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files).slice(0, 4 - images.length)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/community/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.data?.url) {
          newImages.push(data.data.url);
        }
      } catch {
        // skip failed uploads
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploading(false);
  }

  async function handleSubmit() {
    if (!content.trim()) {
      toast({ title: 'Content required', description: 'Please write something before posting', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<CreatePostInput> = {
        type,
        content: content.trim(),
        caption: caption.trim() || undefined,
        image_urls: images.length > 0 ? images : undefined,
        tags,
      };

      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Posted!', description: 'Your post has been shared with the community' });
        reset();
        onClose();
        onCreated();
      } else {
        throw new Error(data.error?.message || 'Failed to create post');
      }
    } catch (err) {
      toast({
        title: 'Post failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh] z-50 overflow-hidden"
          >
            <div className="bg-[#13131F] border border-white/[0.06] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${currentType.color}15` }}
                  >
                    <TypeIcon className="w-4 h-4" style={{ color: currentType.color }} />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="flex items-center gap-1.5 text-[13px] text-[#F5F5F7] font-medium hover:text-[#9333EA] transition-colors"
                    >
                      {currentType.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTypeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 mt-1 bg-[#1E1E2D] border border-white/[0.06] rounded-xl shadow-xl py-1 w-48 z-10"
                      >
                        {POST_TYPES.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setType(t.id); setShowTypeDropdown(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${t.color}15` }}
                            >
                              <t.icon className="w-3.5 h-3.5" style={{ color: t.color }} />
                            </div>
                            <div>
                              <p className="text-[12px] text-[#F5F5F7] font-medium">{t.label}</p>
                              <p className="text-[10px] text-[#71717A]">{t.description}</p>
                            </div>
                            {type === t.id && <Check className="w-3.5 h-3.5 text-[#9333EA] ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
                <button type="button" onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Caption */}
                <input
                  type="text"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Headline (optional)"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-[14px] text-[#F5F5F7] placeholder-[#52525B] focus:outline-none focus:border-[#9333EA]/30 focus:ring-1 focus:ring-[#9333EA]/20 transition-all"
                  maxLength={200}
                />

                {/* Content */}
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`What's on your mind?`}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-[14px] text-[#F5F5F7] placeholder-[#52525B] focus:outline-none focus:border-[#9333EA]/30 focus:ring-1 focus:ring-[#9333EA]/20 transition-all resize-none"
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-[10px] text-[#52525B] text-right">{content.length}/5000</p>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#9333EA]/10 text-[#9333EA] text-[11px]">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#F5F5F7]">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                      placeholder="Add tags... (press Enter)"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-[13px] text-[#F5F5F7] placeholder-[#52525B] focus:outline-none focus:border-[#9333EA]/30 focus:ring-1 focus:ring-[#9333EA]/20 transition-all"
                    />
                  </div>
                  {tagInput && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {SUGGESTED_TAGS.filter(t => t.includes(tagInput.toLowerCase()) && !tags.includes(t)).slice(0, 5).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addTag(t)}
                          className="text-[11px] text-[#71717A] hover:text-[#9333EA] bg-white/[0.03] hover:bg-[#9333EA]/10 px-2 py-0.5 rounded-md transition-colors"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((url, i) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.04]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                {images.length < 4 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      dragOver ? 'border-[#9333EA] bg-[#9333EA]/5' : 'border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleFileUpload(e.target.files)}
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-[#9333EA] animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-[#52525B]" />
                        <p className="text-[12px] text-[#71717A]">Click or drag images here</p>
                        <p className="text-[10px] text-[#52525B]">{4 - images.length} remaining · Max 5MB each</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between flex-shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-[13px] text-[#71717A] hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9333EA] text-white text-[13px] font-medium hover:bg-[#7C3AED] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
