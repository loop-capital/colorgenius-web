import { Suspense } from 'react';
import AnalyticsPageClient from './AnalyticsPageClient';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <AnalyticsPageClient />
    </Suspense>
  );
}
