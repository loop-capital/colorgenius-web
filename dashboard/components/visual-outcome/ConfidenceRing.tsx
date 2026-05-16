'use client';

import React from 'react';
import type { ConfidenceAdjustment } from '@/lib/formulation';

interface ConfidenceRingProps {
  confidence: number;
  adjustments?: ConfidenceAdjustment[];
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Moderate';
  if (confidence >= 0.4) return 'Caution';
  return 'Low';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#22C55E';
  if (confidence >= 0.6) return '#EAB308';
  if (confidence >= 0.4) return '#F97316';
  return '#EF4444';
}

function formatFactorName(factor: string): string {
  return factor
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ConfidenceRing({ confidence, adjustments }: ConfidenceRingProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence * circumference);
  const color = getConfidenceColor(confidence);

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Formula Confidence
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Confidence: ${Math.round(confidence * 100)}% — ${getConfidenceLabel(confidence)}`}>
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F7', display: 'block' }}>
              {Math.round(confidence * 100)}%
            </span>
            <span style={{ fontSize: 11, color: '#A1A1AA' }}>
              {getConfidenceLabel(confidence)}
            </span>
          </div>
        </div>

        {adjustments && adjustments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
            {adjustments.map((adj, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#A1A1AA',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                }}
              >
                {formatFactorName(adj.factor)}: -{Math.round(adj.reduction * 100)}%
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
