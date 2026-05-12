'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUploader from '@/components/PhotoUploader';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ScorePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner size="lg" /></div>}>
      <ScorePageInner />
    </Suspense>
  );
}

function ScorePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const formulaId = params.get('id') || 'new';

  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const handleScore = async () => {
    if (!afterFile) return;
    setScoring(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResult({
      color_accuracy: 87,
      condition_score: 91,
      evenness_score: 83,
      overall: 87,
      feedback: 'Color matches target level well. Slight warmth in the mid-lengths. Hair condition maintained well during processing.',
    });
    setScoring(false);
  };

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div className="container-md">
          <div style={styles.header}>
            <button onClick={() => router.back()} style={styles.backBtn}>← Back</button>
            <div>
              <h1 style={styles.title}>Score Result</h1>
              <p style={styles.subtitle}>Upload the finished result to evaluate the formula</p>
            </div>
          </div>

          {!result ? (
            <>
              {/* Before/After comparison */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h2 style={styles.sectionTitle}>Before & After</h2>
                  <p style={styles.sectionDesc}>Upload photos to compare the transformation</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before</label>
                      <PhotoUploader onFileChange={(f, p) => { setBeforeFile(f); setBeforePhoto(p); }} currentPhoto={beforePhoto || undefined} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After</label>
                      <PhotoUploader onFileChange={(f, p) => { setAfterFile(f); setAfterPhoto(p); }} currentPhoto={afterPhoto || undefined} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Score button */}
              <button
                className="btn btn-accent btn-full btn-lg"
                onClick={handleScore}
                disabled={!afterFile || scoring}
              >
                {scoring ? 'Analyzing…' : afterFile ? 'Score Result' : 'Upload after photo to score'}
              </button>
            </>
          ) : (
            /* Results */
            <div>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h2 style={styles.sectionTitle}>Score Breakdown</h2>

                  <div style={styles.scoreGrid}>
                    {[
                      { label: 'Color Accuracy', value: result.color_accuracy, color: 'var(--color-primary)' },
                      { label: 'Hair Condition', value: result.condition_score, color: 'var(--color-success)' },
                      { label: 'Application Evenness', value: result.evenness_score, color: 'var(--color-accent)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={styles.scoreCard}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color }}>{value}%</div>
                        <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, marginTop: '0.75rem' }}>
                          <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall */}
                  <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgb(16 185 129 / 0.08)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>{result.overall}%</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Overall Score</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Strong result — minor adjustments for next time</div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                    {result.feedback}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card">
                <div className="card-body">
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Session Notes</h3>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this session — what worked, what to adjust, client preferences…"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => router.push('/history')}>View History</button>
                    <button className="btn btn-primary" onClick={() => router.push('/formulate')}>New Formulation</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: 'calc(100vh - 65px)', padding: '2rem 0 4rem' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0.25rem', marginTop: '0.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { fontSize: '0.875rem', color: 'var(--color-text-muted)' },
  sectionTitle: { fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' },
  sectionDesc: { fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' },
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  scoreCard: { padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' },
};