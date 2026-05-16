'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react';

interface PublishFormProps {
  formulaId?: string;
  formulaTitle?: string;
  onSuccess?: (formula: any) => void;
  onCancel?: () => void;
}

export function PublishForm({ formulaId, formulaTitle, onSuccess, onCancel }: PublishFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/marketplace/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setPhotoUrl(data.data.url);
      else setError(data.error?.message || 'Upload failed');
    } catch { setError('Upload failed'); }
    setUploading(false);
  }

  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_formula_id: formulaId || 'manual',
          title: form.get('title'),
          description: form.get('description'),
          category: form.get('category'),
          tags: (form.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
          photo_url: photoUrl || undefined,
          creator_id: 'current-user',
          creator_name: 'Current User',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStep(3);
        onSuccess?.(data.data.formula);
      } else {
        setError(data.error?.message || 'Publish failed');
      }
    } catch { setError('Publish failed'); }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">
          {step === 3 ? 'Published!' : 'Publish to Marketplace'}
        </h2>
        {onCancel && step !== 3 && (
          <button onClick={onCancel} className="text-white/40 hover:text-white/70"><X size={18} /></button>
        )}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>
            Upload a photo of the result. This helps other stylists see what the formula produces.
          </p>

          {!photoUrl ? (
            <label className="block w-full p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors hover:border-purple-500/50"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {uploading ? (
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#9333EA]" />
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-white/30" />
                  <p className="text-sm text-white/60">Drop a photo or click to upload</p>
                  <p className="text-[10px] mt-1 text-white/30">JPEG, PNG, or WebP — max 5MB</p>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img src={photoUrl} alt="Formula result" className="w-full h-48 object-cover" />
              <button onClick={() => setPhotoUrl('')}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff' }}>
              Next: Details
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#A1A1AA' }}>Title</label>
              <input name="title" type="text" required minLength={3} maxLength={100}
                defaultValue={formulaTitle || ''}
                placeholder="e.g., Caramel Balayage Master Formula"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#A1A1AA' }}>Description</label>
              <textarea name="description" required minLength={10} maxLength={500} rows={3}
                placeholder="Describe the technique, results, and who it's best for..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#A1A1AA' }}>Category</label>
              <select name="category" required
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="">Select category</option>
                {['Balayage', 'Full Color', 'Highlights', 'Toning', 'Color Correction', 'Fashion Color', 'Gray Coverage', 'Root Touch-Up'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#A1A1AA' }}>Tags</label>
              <input name="tags" type="text" placeholder="balayage, warm, caramel, wella"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <p className="text-[10px] mt-1" style={{ color: '#71717A' }}>Comma-separated — helps stylists find your formula</p>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="py-3 px-6 rounded-xl text-sm"
                style={{ color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)' }}>Back</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Publish Formula
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {step === 3 && result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Check className="w-8 h-8 text-[#10B981]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{result.formula.title}</h3>
          <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>{result.message}</p>

          <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase" style={{ color: '#71717A' }}>Tier</p>
                <p className="font-semibold capitalize" style={{ color: result.tier_info.tier === 'signature' ? '#EC4899' : result.tier_info.tier === 'master' ? '#9333EA' : '#3B82F6' }}>
                  {result.tier_info.tier}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase" style={{ color: '#71717A' }}>Per Use</p>
                <p className="font-semibold text-white">{result.tier_info.per_use_display}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase" style={{ color: '#71717A' }}>Score</p>
                <p className="font-semibold text-white">{result.tier_info.score}/100</p>
              </div>
              <div>
                <p className="text-[10px] uppercase" style={{ color: '#71717A' }}>You Earn</p>
                <p className="font-semibold text-[#10B981]">{result.tier_info.creator_earnings}</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl mb-4 text-left" style={{ background: 'rgba(147,51,234,0.05)' }}>
            <p className="text-[10px] uppercase mb-1" style={{ color: '#71717A' }}>Share Code</p>
            <code className="text-sm font-bold text-[#9333EA]">{result.formula.share_code}</code>
          </div>

          <button onClick={onCancel} className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff' }}>
            Done
          </button>
        </motion.div>
      )}
    </div>
  );
}
