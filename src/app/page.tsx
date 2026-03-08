'use client';
import { Suspense } from 'react';
import AuthPage, { AuthPageFallback } from '@/components/AuthPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPage />
    </Suspense>
  );
}
