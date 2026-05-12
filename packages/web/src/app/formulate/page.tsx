import { Suspense } from 'react';
import FormulateClient from './FormulateClient';

export const dynamic = 'force-dynamic';

export default function FormulatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <FormulateClient />
    </Suspense>
  );
}
