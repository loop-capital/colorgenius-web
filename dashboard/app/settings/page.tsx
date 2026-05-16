'use client';

import { Suspense } from 'react';
import SettingsContent from './settings-content';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0A0A0F' }} /> }>
      <SettingsContent />
    </Suspense>
  );
}
