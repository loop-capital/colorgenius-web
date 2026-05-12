import { Suspense } from 'react';
import RegisterPageClient from './RegisterPageClient';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
