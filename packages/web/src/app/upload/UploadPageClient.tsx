'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUploader from '@/components/PhotoUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { uploadPhotoApi, analyzePhotoApi } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'current' | 'target'>('current');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((f: File | null, p: string | null) => {
    setFile(f);
    setPreview(p);
    setError(null);
      // TODO: Implement upload API call
      console.log('Upload attempt', { file, preview });
      // TODO: Implement upload callback
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError('Please upload a photo first.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setIsAnalyzing(true);

    try {
      // 1. Upload the photo
      const formData = new FormData();
      formData.append('photo', file);

      const uploadRes = await uploadPhotoApi(file);
      if (uploadRes.error || !uploadRes.data) {
        throw new Error(typeof uploadRes.error === 'string' ? uploadRes.error : (uploadRes.error?.message || 'Upload failed'));
      }

      const analysisId = (uploadRes.data as any)?.analysis_id || 'demo';

      // 2. Navigate to results (analysis happens async)
      router.push(`/results?id=${analysisId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [file, photoType, router]);

  const isProcessing = isUploading || isAnalyzing;
  const canAnalyze = !!file && !isProcessing;

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div className="container-md">
          {/* Page header */}
          <div className="page-header" style={styles.header}>
            <h1 style={styles.title}>Hair Color Analysis</h1>
            <p style={styles.subtitle}>
              Upload a clear photo of your client&apos;s hair for AI-powered color level and tone analysis.
            </p>
          </div>

          <div style={styles.layout}>
            {/* Left: uploader */}
            <div style={styles.uploaderSection}>
              <PhotoUploader
                onFileChange={handleFileChange}
                photoType={photoType}
                onPhotoTypeChange={setPhotoType}
                disabled={isProcessing}
              />

              {error && (
                <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-accent btn-full btn-lg"
                style={{ marginTop: '1.25rem' }}
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {isUploading ? 'Uploading photo…' : 'Analyzing color…'}
                  </>
                ) : (
                  'Analyze Hair Color'
                )}
              </button>
            </div>

            {/* Right: tips */}
            <div style={styles.tipsSection}>
              <div className="card" style={styles.tipsCard}>
                <div className="card-header">
                  <h3 style={styles.tipsTitle}>📸 Photo Tips</h3>
                </div>
                <div className="card-body">
                  <ul style={styles.tipsList}>
                    {[
                      'Use natural or neutral white lighting',
                      'Capture hair in focus, clean background',
                      'Show 2–3 inches of root area',
                      'Avoid harsh shadows on hair',
                      'Wet hair shows true color more accurately',
                      'Include a reference card for best accuracy',
                    ].map((tip) => (
                      <li key={tip} style={styles.tipItem}>
                        <span style={styles.tipBullet}>✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card" style={{ marginTop: '1.25rem' }}>
                <div className="card-header">
                  <h3 style={styles.tipsTitle}>🎯 Photo Types</h3>
                </div>
                <div className="card-body">
                  <div style={styles.photoTypes}>
                    {[
                      { type: 'Current', desc: 'Your client\'s current hair color (most common)' },
                      { type: 'Target', desc: 'The desired result they want to achieve' },
                      { type: 'Texture', desc: 'Hair porosity, condition, and texture reference' },
                    ].map((pt) => (
                      <div key={pt.type} style={styles.photoTypeItem}>
                        <span style={styles.photoTypeLabel}>{pt.type}</span>
                        <span style={styles.photoTypeDesc}>{pt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: 'calc(100vh - 65px)',
    paddingBottom: '4rem',
  },
  header: {
    paddingTop: '2rem',
    paddingBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '0.375rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--color-text-muted)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '1.5rem',
    alignItems: 'start',
  },
  uploaderSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  tipsSection: {
    position: 'sticky',
    top: 'calc(65px + 1.5rem)',
  },
  tipsCard: {},
  tipsTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  tipsList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  tipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    color: 'var(--color-text)',
  },
  tipBullet: {
    color: 'var(--color-success)',
    fontWeight: 700,
    flexShrink: 0,
  },
  photoTypes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  photoTypeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  photoTypeLabel: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  photoTypeDesc: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
};