import { Suspense } from 'react';
import QuestionnairePageClient from './QuestionnairePageClient';

export const dynamic = 'force-dynamic';

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <QuestionnairePageClient />
    </Suspense>
  );
}
