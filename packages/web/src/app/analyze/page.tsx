import { Suspense } from 'react';
import AnalyzePageClient from './AnalyzePageClient';

export const dynamic = 'force-dynamic';

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <AnalyzePageClient />
    </Suspense>
  );
}
