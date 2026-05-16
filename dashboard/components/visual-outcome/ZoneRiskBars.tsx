'use client';

import React from 'react';
import { computeWarmthExposure, computeZoneRisk, type RiskLevel } from '@/lib/color-utils';
import type { FormulationInput, FormulationResult } from '@/lib/formulation';

interface ZoneRiskBarsProps {
  input: FormulationInput;
  result: FormulationResult;
}

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Low' },
  moderate: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', label: 'Moderate' },
  high: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'High' },
};

interface ZoneRowProps {
  zoneName: string;
  hex: string;
  risk: RiskLevel;
  note: string;
}

function ZoneRow({ zoneName, hex, risk, note }: ZoneRowProps) {
  const rc = RISK_COLORS[risk];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ minWidth: 90 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>{zoneName}</p>
      </div>
      <div
        aria-label={`${zoneName} predicted color ${hex}`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: hex,
          border: '2px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          background: rc.bg,
          color: rc.text,
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {rc.label}
      </div>
      <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0, flex: 1 }}>{note}</p>
    </div>
  );
}

export default function ZoneRiskBars({ input, result }: ZoneRiskBarsProps) {
  const exposure = computeWarmthExposure(input, result);
  const { risk, notes } = computeZoneRisk(input, result);

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Zone Risk Assessment
      </p>
      <div style={{ background: 'rgba(22,22,32,0.4)', borderRadius: 12, padding: '0 16px' }}>
        <ZoneRow zoneName="Root Zone" hex={exposure.root} risk={risk.root} note={notes.root || 'No concerns'} />
        <ZoneRow zoneName="Midshaft Zone" hex={exposure.midshaft} risk={risk.midshaft} note={notes.midshaft || 'No concerns'} />
        <ZoneRow zoneName="Ends Zone" hex={exposure.ends} risk={risk.ends} note={notes.ends || 'No concerns'} />
      </div>
    </div>
  );
}
