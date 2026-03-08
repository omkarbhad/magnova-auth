import { Suspense } from 'react';
import AuthPage, { AuthPageFallback } from '@/components/AuthPage';

export default function AstrovaAuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback app="astrova" />}>
      <AuthPage app="astrova" />
    </Suspense>
  );
}
