import { Suspense } from 'react';
import ScorePageClient from './ScorePageClient';

export const dynamic = 'force-dynamic';

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <ScorePageClient />
    </Suspense>
  );
}
