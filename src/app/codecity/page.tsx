import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function CodeCityAuth() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <AuthPage app="codecity" />
    </Suspense>
  );
}
