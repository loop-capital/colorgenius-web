'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

const MOCK_STATS = {
  total_formulations: 142,
  avg_score: 87,
  this_month: 23,
  clients: 38,
  top_brands: [
    { name: 'Wella Koleston Perfect ME', count: 48 },
    { name: 'Redken Color Gels', count: 35 },
    { name: 'Schwarzkopf Igora Royal', count: 28 },
    { name: 'Matrix SoColor', count: 19 },
    { name: 'Joico K-Pak', count: 12 },
  ],
  weekly_data: [
    { week: 'Apr 7', formulations: 8, avg_score: 85 },
    { week: 'Apr 14', formulations: 11, avg_score: 88 },
    { week: 'Apr 21', formulations: 14, avg_score: 86 },
    { week: 'Apr 28', formulations: 9, avg_score: 89 },
  ],
  tone_distribution: [
    { tone: 'Natural', count: 42 },
    { tone: 'Gold', count: 35 },
    { tone: 'Ash', count: 28 },
    { tone: 'Red', count: 18 },
    { tone: 'Copper', count: 12 },
    { tone: 'Violet', count: 7 },
  ],
};

function SimpleBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div className="container">
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Analytics</h1>
              <p style={styles.subtitle}>Formulation performance and insights</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['week', 'month', 'quarter'] as const).map((p) => (
                <button key={p} style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: period === p ? 'var(--color-primary)' : 'var(--color-border)',
                  background: period === p ? 'var(--color-primary)' : 'white',
                  color: period === p ? 'white' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: period === p ? 600 : 400,
                }} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div style={styles.kpiGrid}>
            {[
              { label: 'Total Formulations', value: MOCK_STATS.total_formulations, sub: '+12% vs last period', color: 'var(--color-primary)' },
              { label: 'Average Score', value: `${MOCK_STATS.avg_score}%`, sub: 'Quality consistency', color: 'var(--color-success)' },
              { label: 'This Month', value: MOCK_STATS.this_month, sub: '23 last month', color: 'var(--color-accent)' },
              { label: 'Active Clients', value: MOCK_STATS.clients, sub: '38 unique clients', color: 'var(--color-primary)' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="card">
                <div className="card-body">
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Weekly trend */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 600 }}>Weekly Formulations</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {MOCK_STATS.weekly_data.map(({ week, formulations, avg_score }) => (
                    <div key={week}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{week}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{formulations} formulas · {avg_score}% avg</span>
                      </div>
                      <SimpleBar value={formulations} max={15} color="var(--color-primary)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top brands */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 600 }}>Top Brands Used</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {MOCK_STATS.top_brands.map(({ name, count }, i) => (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>{name}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{count}</span>
                      </div>
                      <SimpleBar value={count} max={48} color={['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', '#8b5cf6', '#06b6d4'][i]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tone distribution */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 600 }}>Tone Distribution</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {MOCK_STATS.tone_distribution.map(({ tone, count }) => (
                    <div key={tone}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>{tone}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{count}</span>
                      </div>
                      <SimpleBar value={count} max={42} color="var(--color-primary)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score history */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 600 }}>Score Trend</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 120, paddingTop: '1rem' }}>
                  {MOCK_STATS.weekly_data.map(({ week, avg_score }) => (
                    <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: avg_score >= 88 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                        {avg_score}%
                      </div>
                      <div style={{ width: '100%', height: `${avg_score}%`, background: avg_score >= 88 ? 'var(--color-success)' : 'var(--color-accent)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{week.split(' ')[1]}</div>
                    </div>
                  ))}
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
  main: { minHeight: 'calc(100vh - 65px)', padding: '2rem 0 4rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { fontSize: '0.9375rem', color: 'var(--color-text-muted)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
};