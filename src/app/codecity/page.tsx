import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function CodeCityAuthPage() {
  return (
    <Suspense>
      <AuthPage app="codecity" />
    </Suspense>
  );
}
