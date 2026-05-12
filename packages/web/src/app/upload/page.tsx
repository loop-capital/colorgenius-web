import { Suspense } from 'react';
import UploadPageClient from './UploadPageClient';

export const dynamic = 'force-dynamic';

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <UploadPageClient />
    </Suspense>
  );
}
