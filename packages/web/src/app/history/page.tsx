import { Suspense } from 'react';
import HistoryPageClient from './HistoryPageClient';

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <HistoryPageClient />
    </Suspense>
  );
}
