'use client';
import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950" />}>
      <AuthPage />
    </Suspense>
  );
}
