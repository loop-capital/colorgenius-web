'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ColorSwatch from '@/components/ColorSwatch';
import FormulaCard from '@/components/FormulaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAnalysisApi } from '@/lib/api';
import type { AnalysisResult } from '@/types';
type Formulation = any;

const TONE_LABELS: Record<string, string> = {
  N: 'Natural',
  A: 'Ash',
  G: 'Gold',
  GA: 'Gold Ash',
  AG: 'Ash Gold',
  R: 'Red',
  V: 'Violet',
  B: 'Brown',
  W: 'Warm',
  C: 'Copper',
  M: 'Mahogany',
};

function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Black',
    2: 'Darkest Brown',
    3: 'Dark Brown',
    4: 'Dark Chestnut',
    5: 'Chestnut Brown',
    6: 'Medium Brown',
    7: 'Dark Blonde',
    8: 'Medium Blonde',
    9: 'Light Blonde',
    10: 'Lightest Blonde',
  };
  return descriptions[level] || `Level ${level}`;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const analysisId = searchParams.get('id');

  const [analysis, setAnalysis] = useState<any>(null);
  const [formula, setFormula] = useState<Formulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) {
      setError('No analysis ID provided.');
      setIsLoading(false);
      return;
    }

    getAnalysisApi(analysisId).then((res) => {
      if (res.error || !res.data) {
        const errMsg = typeof res.error === 'string' ? res.error : (res.error?.message || 'Failed to load results.');
        setError(errMsg);
      } else {
        setAnalysis(res.data);
        if ('formula' in res.data && res.data.formula) {
          setFormula(res.data.formula as Formulation);
        }
      }
      setIsLoading(false);
    }).catch(() => {
      setError('Failed to connect to server.');
      setIsLoading(false);
    });
  }, [analysisId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <LoadingSpinner size="lg" label="Loading results…" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container-md" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
          {error || 'No results found.'}
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/upload" className="btn btn-primary">
            ← Upload a new photo
          </Link>
        </div>
      </div>
    );
  }

  const rgb = analysis.rgb || [0, 0, 0];
  const [r, g, b] = rgb;
  const levelDesc = getLevelDescription(analysis.level ?? 7);
  const toneLabel = TONE_LABELS[analysis.tone || 'N'] || analysis.tone;

  return (
    <div className="container">
      <div style={styles.layout}>
        {/* Left column: analysis results */}
        <div style={styles.leftCol}>
          {/* Analysis result card */}
          <div className="card" style={styles.resultCard}>
            <div className="card-header" style={styles.resultHeader}>
              <div>
                <h2 style={styles.resultTitle}>Hair Analysis Results</h2>
                <p style={styles.resultSubtitle}>
                  {analysis.photo_type === 'current' ? 'Current Hair' :
                   analysis.photo_type === 'target' ? 'Target Hair' : 'Hair Texture'} Analysis
                </p>
              </div>
              <div className="badge badge-success">
                {Math.round((analysis.confidence || 0) * 100)}% confident
              </div>
            </div>

            <div className="card-body" style={styles.resultBody}>
              {/* Color visualization */}
              <div style={styles.swatchSection}>
                <ColorSwatch rgb={analysis.rgb || [0, 0, 0]} size="lg" name="" code="" level={0} tone="" isNatural={false} onClick={undefined} />
                <div style={styles.swatchMeta}>
                  <div>
                    <span style={styles.swatchLabel}>Level</span>
                    <span style={styles.swatchValue}>
                      {analysis.level} — {levelDesc}
                    </span>
                  </div>
                  <div>
                    <span style={styles.swatchLabel}>Tone</span>
                    <span style={styles.swatchValue}>
                      {toneLabel} ({analysis.tone})
                    </span>
                  </div>
                  <div>
                    <span style={styles.swatchLabel}>RGB</span>
                    <span style={styles.swatchValue}>({r}, {g}, {b})</span>
                  </div>
                  <div>
                    <span style={styles.swatchLabel}>Hex</span>
                    <span style={styles.swatchValue}>
                      #{r.toString(16).padStart(2, '0')}{g.toString(16).padStart(2, '0')}{b.toString(16).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="divider" />

              {/* Level guide */}
              <div style={styles.levelGuide}>
                <p style={styles.levelGuideTitle}>Hair Level Guide</p>
                <div style={styles.levelBar}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
                    const colors: Record<number, string> = {
                      1: '#0a0a0a', 2: '#1a1a1a', 3: '#2d1f10', 4: '#3d2a1a',
                      5: '#5c3d2a', 6: '#7a5240', 7: '#9c7054', 8: '#c4a882',
                      9: '#e0c8a8', 10: '#f5ead8',
                    };
                    return (
                      <div
                        key={lvl}
                        style={{
                          ...styles.levelDot,
                          background: colors[lvl],
                          ...(lvl === analysis.level ? styles.levelDotActive : {}),
                        }}
                        title={`Level ${lvl}`}
                      >
                        {lvl === analysis.level && (
                          <span style={styles.levelDotLabel}>{lvl}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={styles.levelAxis}>
                  <span>1 (Darkest)</span>
                  <span>10 (Lightest)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <Link href="/upload" className="btn btn-outline">
              ← New Analysis
            </Link>
            <Link href="/history" className="btn btn-ghost">
              View History
            </Link>
          </div>
        </div>

        {/* Right column: formula */}
        <div style={styles.rightCol}>
          {formula ? (
            <FormulaCard formulation={formula} hairRgb={analysis.rgb || [0, 0, 0]} />
          ) : (
            <div className="card" style={styles.noFormula}>
              <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4m-6 0h6" />
                </svg>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>No formula generated yet.</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                  Analysis complete — formulation engine coming soon.
                </p>
              </div>
            </div>
          )}

          {/* Share / save */}
          <div style={styles.shareNote}>
            <p style={styles.shareNoteText}>
              💡 Share results with your client or save to your history for future reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <LoadingSpinner size="lg" label="Loading results…" />
          </div>
        }>
          <ResultsContent />
        </Suspense>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: 'calc(100vh - 65px)',
    padding: '2rem 0 4rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '1.5rem',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  rightCol: {
    position: 'sticky',
    top: 'calc(65px + 1.5rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  resultCard: {
    overflow: 'hidden',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  resultTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  resultSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.125rem',
  },
  resultBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  swatchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  swatchMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.625rem',
  },
  swatchLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    marginBottom: '0.125rem',
  },
  swatchValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  levelGuide: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  levelGuideTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  levelBar: {
    display: 'flex',
    gap: '0.375rem',
    alignItems: 'center',
  },
  levelDot: {
    flex: 1,
    height: 32,
    borderRadius: 'var(--radius-sm)' as string,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    border: '2px solid transparent',
  },
  levelDotActive: {
    borderColor: 'var(--color-primary)',
    transform: 'scale(1.1)',
    zIndex: 1,
  },
  levelDotLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  levelAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.6875rem',
    color: 'var(--color-text-light)',
    marginTop: '0.25rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  noFormula: {
    borderStyle: 'dashed',
  },
  shareNote: {
    padding: '0.75rem 1rem',
    background: 'rgb(99 102 241 / 0.04)',
    borderRadius: 'var(--radius-md)' as string,
    border: '1px solid rgb(99 102 241 / 0.12)',
  },
  shareNoteText: {
    fontSize: '0.875rem',
    color: 'var(--color-primary)',
  },
};