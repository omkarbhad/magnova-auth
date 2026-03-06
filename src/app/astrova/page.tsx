import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function AstrovaAuthPage() {
  return (
    <Suspense>
      <AuthPage app="astrova" />
    </Suspense>
  );
}
