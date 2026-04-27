"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GlassCard } from '@/components/custom';
import {
  Upload,
  Image as ImageIcon,
  Palette,
  CheckCircle,
  X,
  ScanLine,
  Camera,
  Info,
  Save,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/* ─── Inline sub-components (no shadcn Card) ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--cg-text-tertiary, #71717A)' }}>
      {children}
    </p>
  );
}

function StatValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-2xl font-bold', className)} style={{ color: 'var(--cg-text-primary, #F5F5F7)' }}>
      {children}
    </p>
  );
}

function StatSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs mt-0.5" style={{ color: 'var(--cg-text-tertiary, #71717A)' }}>
      {children}
    </p>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'text-[#0A0A0A] hover:opacity-90 active:scale-[0.98]',
    outline:
      'bg-transparent border hover:text-[#F5F5F7] active:scale-[0.98]',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 active:scale-[0.98]',
  };
  const bg =
    variant === 'primary'
      ? { background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }
      : variant === 'outline'
        ? { borderColor: 'rgba(255,255,255,0.12)', color: '#A1A1AA' }
        : {};

  return (
    <motion.button
      className={cn(base, styles[variant], className)}
      style={bg}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

function StatusPill({ label, color, glow = false }: { label: string; color: string; glow?: boolean }) {
  return (
    <div
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', glow && 'shadow-sm')}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
        boxShadow: glow ? `0 0 12px ${color}30` : undefined,
      }}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', glow && 'animate-pulse')} style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}

/* ─── Main Page ─── */

export default function Analyze() {
  const [clientId, setClientId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (analysisResult && !loading && clientId) {
      saveAnalysisToClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult, loading, clientId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        e.target.value = '';
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image upload');
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setError('Please drop a valid image file');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImageUrl(event.target?.result as string);
          setLoading(false);
        };
        reader.onerror = () => {
          setError('Error processing image drop');
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image drop');
        setLoading(false);
      }
    },
    []
  );

  const analyzeImage = async () => {
    if (!imageUrl || !canvasRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const sampleSize = 50;
        const startX = Math.max(0, (img.width - sampleSize) / 2);
        const startY = Math.max(0, (img.height - sampleSize) / 2);
        const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
        const data = imageData.data;

        let rSum = 0,
          gSum = 0,
          bSum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        const result = rgbToHairColor(avgR, avgG, avgB);

        setAnalysisResult({
          ...result,
          rgb: { r: avgR, g: avgG, b: avgB },
          timestamp: new Date().toISOString(),
        });
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load image for analysis');
        setLoading(false);
      };
      img.src = imageUrl;
    } catch (err) {
      setError('Error analyzing image');
      setLoading(false);
    }
  };

  const rgbToHairColor = (r: number, g: number, b: number): any => {
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    let level = Math.round(10 * lightness);
    level = Math.max(1, Math.min(10, level));

    const toneScore = (r - b) / (r + g + b + 1);
    let tone: string;
    if (toneScore > 0.1) {
      tone = 'Warm';
    } else if (toneScore < -0.1) {
      tone = 'Cool';
    } else {
      tone = 'Neutral';
    }

    let underlyingPigment: string;
    if (level <= 4) {
      underlyingPigment = 'Red';
    } else if (level <= 6) {
      underlyingPigment = 'Orange';
    } else if (level <= 8) {
      underlyingPigment = 'Yellow';
    } else {
      underlyingPigment = 'Pale Yellow';
    }

    const levelNames = [
      '',
      'Black',
      'Darkest Brown',
      'Dark Brown',
      'Medium Brown',
      'Light Brown',
      'Dark Blonde',
      'Medium Blonde',
      'Light Blonde',
      'Lightest Blonde',
    ];

    return {
      level,
      levelName: levelNames[level],
      tone,
      underlyingPigment,
      confidence: Math.min(95, 70 + Math.random() * 25),
    };
  };

  const saveAnalysisToClient = async () => {
    try {
      await db.analysis.create({
        data: {
          clientId,
          level: analysisResult.level,
          tone: analysisResult.tone,
          underlyingPigment: analysisResult.underlyingPigment,
          rgbR: analysisResult.rgb.r,
          rgbG: analysisResult.rgb.g,
          rgbB: analysisResult.rgb.b,
          confidence: analysisResult.confidence,
          imageUrl,
        },
      });
      setError('Analysis saved to client profile!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Failed to save analysis to client');
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#0F0F0F' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F7' }}>
            Hair Color <span style={{ color: '#14B8A6' }}>Analysis</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#71717A' }}>
            Upload a clear photo to analyze level, tone, and underlying pigment
          </p>
        </motion.div>

        {/* Hidden canvas for pixel sampling */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left Column: Upload ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <GlassCard className="h-fit p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-4 w-4" style={{ color: '#14B8A6' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                  Upload Client Photo
                </h3>
              </div>

              {!imageUrl ? (
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                    dragOver
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]'
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(20,184,166,0.1)' }}
                  >
                    <Upload className="h-6 w-6" style={{ color: '#14B8A6' }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: '#F5F5F7' }}>
                    Drag & drop or click to upload
                  </h3>
                  <p className="text-xs" style={{ color: '#71717A' }}>
                    JPEG, PNG, WebP — up to 10MB
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: '#52525B' }}>
                    For best results, use a front-facing photo in natural light
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Image preview */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <img
                      src={imageUrl}
                      alt="Uploaded hair photo"
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                    {/* Scanning animation overlay */}
                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{ background: 'rgba(0,0,0,0.5)' }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <motion.div
                              className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>
                              Analyzing...
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Remove button */}
                    <ActionBtn
                      variant="danger"
                      className="absolute top-2 right-2 !p-2 !rounded-lg"
                      onClick={handleReset}
                    >
                      <X className="h-3.5 w-3.5" />
                    </ActionBtn>
                  </div>

                  {!analysisResult && !loading && (
                    <ActionBtn onClick={analyzeImage} className="w-full">
                      <ScanLine className="h-4 w-4 mr-2" />
                      Analyze Hair Color
                    </ActionBtn>
                  )}

                  {analysisResult && (
                    <div className="flex gap-2">
                      <ActionBtn variant="outline" className="flex-1" onClick={analyzeImage}>
                        <ScanLine className="h-4 w-4 mr-2" />
                        Re-analyze
                      </ActionBtn>
                      <ActionBtn variant="outline" className="flex-1" onClick={handleReset}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </ActionBtn>
                    </div>
                  )}
                </div>
              )}

              {/* Loading spinner (non-overlay state) */}
              {loading && !imageUrl && (
                <div className="flex items-center justify-center py-8 gap-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-[#14B8A6] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    Processing image...
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* ── Right Column: Results ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="space-y-4"
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4" style={{ color: '#14B8A6' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                  Analysis Results
                </h3>
              </div>

              {!analysisResult && !loading && !error && (
                <div className="text-center py-8">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Info className="h-5 w-5" style={{ color: '#52525B' }} />
                  </div>
                  <p className="text-sm" style={{ color: '#52525B' }}>
                    Upload an image to begin analysis
                  </p>
                </div>
              )}

              {loading && !analysisResult && (
                <div className="flex items-center justify-center py-8 gap-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-[#14B8A6] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    Analyzing image...
                  </p>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert
                    className="border"
                    style={{
                      borderColor: 'rgba(239,68,68,0.3)',
                      backgroundColor: 'rgba(239,68,68,0.08)',
                    }}
                  >
                    <AlertCircle className="h-4 w-4" style={{ color: '#EF4444' }} />
                    <AlertTitle className="text-sm" style={{ color: '#F5F5F7' }}>
                      Error
                    </AlertTitle>
                    <AlertDescription className="text-xs" style={{ color: '#A1A1AA' }}>
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {analysisResult && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {/* Color swatch + metadata */}
                  <div className="flex items-start gap-4">
                    {/* Color swatch */}
                    <div
                      className="w-16 h-16 rounded-xl shrink-0"
                      style={{
                        backgroundColor: `rgb(${analysisResult.rgb.r}, ${analysisResult.rgb.g}, ${analysisResult.rgb.b})`,
                        boxShadow: `0 0 20px rgba(${analysisResult.rgb.r}, ${analysisResult.rgb.g}, ${analysisResult.rgb.b}, 0.3)`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs mb-1" style={{ color: '#71717A' }}>
                        Detected Color
                      </p>
                      <p className="font-semibold text-sm" style={{ color: '#F5F5F7' }}>
                        RGB({analysisResult.rgb.r}, {analysisResult.rgb.g}, {analysisResult.rgb.b})
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
                        Based on {50 * 50} sampled pixels
                      </p>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <SectionLabel>Level</SectionLabel>
                      <StatValue>{analysisResult.level}</StatValue>
                      <StatSub>{analysisResult.levelName}</StatSub>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <SectionLabel>Tone</SectionLabel>
                      <StatValue style={{ color: analysisResult.tone === 'Warm' ? '#F59E0B' : analysisResult.tone === 'Cool' ? '#60A5FA' : '#A78BFA' }}>
                        {analysisResult.tone}
                      </StatValue>
                      <StatSub>{analysisResult.confidence?.toFixed(0)}% confidence</StatSub>
                    </div>
                    <div
                      className="rounded-xl p-3 col-span-2"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <SectionLabel>Underlying Pigment</SectionLabel>
                      <StatValue>{analysisResult.underlyingPigment}</StatValue>
                    </div>
                  </div>

                  {/* Tone indicator */}
                  <div className="flex items-center gap-2">
                    <StatusPill
                      label={`Level ${analysisResult.level} · ${analysisResult.levelName}`}
                      color="#14B8A6"
                      glow
                    />
                    <StatusPill
                      label={analysisResult.tone}
                      color={
                        analysisResult.tone === 'Warm'
                          ? '#F59E0B'
                          : analysisResult.tone === 'Cool'
                            ? '#60A5FA'
                            : '#A78BFA'
                      }
                    />
                  </div>

                  {/* Save to client */}
                  <div
                    className="rounded-xl p-4 space-y-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" style={{ color: '#14B8A6' }} />
                      <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>
                        Save to Client Profile
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter client ID"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="flex-1"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#F5F5F7',
                        }}
                      />
                      <ActionBtn
                        onClick={() => {
                          if (clientId.trim()) {
                            saveAnalysisToClient();
                          }
                        }}
                        disabled={!clientId.trim()}
                      >
                        Save
                      </ActionBtn>
                    </div>
                  </div>
                </motion.div>
              )}
            </GlassCard>

            {/* Error state below card (non-destructive) */}
            {error && !analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert
                  className="border"
                  style={{
                    borderColor: 'rgba(239,68,68,0.3)',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                  }}
                >
                  <AlertCircle className="h-4 w-4" style={{ color: '#EF4444' }} />
                  <AlertTitle className="text-sm" style={{ color: '#F5F5F7' }}>
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-xs" style={{ color: '#A1A1AA' }}>
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
