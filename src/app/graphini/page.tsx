import { Suspense } from 'react';
import AuthPage, { AuthPageFallback } from '@/components/AuthPage';

export default function GraphiniAuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback app="graphini" />}>
      <AuthPage app="graphini" />
    </Suspense>
  );
}
