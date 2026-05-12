import { Suspense } from 'react';
import DashboardPageClient from './DashboardPageClient';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <DashboardPageClient />
    </Suspense>
  );
}
