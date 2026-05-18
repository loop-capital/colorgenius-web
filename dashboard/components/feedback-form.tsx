'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Send, X } from 'lucide-react';

interface FeedbackFormProps {
  formulaId: string;
  formulaTitle: string;
  onSubmit?: (feedback: any) => void;
  onClose?: () => void;
}

const CORRECTION_TAGS = [
  'Too warm', 'Too ashy', 'Too dark', 'Too light', 'Faded fast',
  'Perfect match', 'Great gray coverage', 'Band lines', 'Hot roots',
  'Uneven lift', 'Too porous result', 'Color matched expectations',
];

export function FeedbackForm({ formulaId, formulaTitle, onSubmit, onClose }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit() {
    if (rating === null) return;

    const feedback = {
      formula_id: formulaId,
      rating,
      tags: selectedTags,
      comment,
      adjustment,
    };

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
    } catch {
      // Non-fatal — still show thank-you
    }
    onSubmit?.(feedback);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: '#0F0F1A', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.1)' }}>
          <ThumbsUp className="w-6 h-6 text-[#10B981]" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Thank you!</h3>
        <p className="text-xs" style={{ color: '#71717A' }}>Your feedback helps improve the formulation engine for everyone.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">How did this formula perform?</h3>
        {onClose && <button onClick={onClose} className="text-white/40 hover:text-white/70"><X size={16} /></button>}
      </div>
      <p className="text-xs mb-4" style={{ color: '#71717A' }}>{formulaTitle}</p>

      {/* Rating */}
      <div className="flex items-center gap-4 mb-4">
        <p className="text-xs" style={{ color: '#A1A1AA' }}>Formula performed well:</p>
        <div className="flex gap-2">
          <button onClick={() => setRating(1)}
            className={`p-2 rounded-lg transition-colors ${rating === 1 ? 'bg-[#10B981]/15 text-[#10B981]' : 'text-white/30 hover:text-white/50'}`}>
            <ThumbsUp size={20} />
          </button>
          <button onClick={() => setRating(-1)}
            className={`p-2 rounded-lg transition-colors ${rating === -1 ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'text-white/30 hover:text-white/50'}`}>
            <ThumbsDown size={20} />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <p className="text-xs mb-2" style={{ color: '#A1A1AA' }}>Quick tags:</p>
        <div className="flex flex-wrap gap-2">
          {CORRECTION_TAGS.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-[#9333EA]/15 border-[#9333EA]/30 text-[#9333EA]'
                  : 'border-white/10 text-white/50 hover:text-white/70'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* What did you adjust? (Training data) */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#A1A1AA' }}>
          <AlertTriangle size={12} className="text-[#F59E0B]" />
          What did you adjust? (helps train the AI)
        </label>
        <textarea value={adjustment} onChange={e => setAdjustment(e.target.value)}
          rows={2} placeholder="e.g., Added 5g of 0/11 to counteract brassiness on level 7 porous hair"
          className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#A1A1AA' }}>
          <MessageSquare size={12} /> Additional notes
        </label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          rows={2} placeholder="Any other observations..."
          className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      <button onClick={handleSubmit} disabled={rating === null}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff' }}>
        <Send size={14} /> Submit Feedback
      </button>
    </div>
  );
}
