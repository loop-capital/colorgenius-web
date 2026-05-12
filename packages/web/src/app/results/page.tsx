import { Suspense } from 'react';
import ResultsPageClient from './ResultsPageClient';

export const dynamic = 'force-dynamic';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <ResultsPageClient />
    </Suspense>
  );
}
