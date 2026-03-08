import { Suspense } from 'react';
import AuthPage, { AuthPageFallback } from '@/components/AuthPage';

export default function CodeCityAuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback app="codecity" />}>
      <AuthPage app="codecity" />
    </Suspense>
  );
}
