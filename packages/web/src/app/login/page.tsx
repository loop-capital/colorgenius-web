import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <LoginPageClient />
    </Suspense>
  );
}
