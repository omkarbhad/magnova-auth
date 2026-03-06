import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function GraphiniAuthPage() {
  return (
    <Suspense>
      <AuthPage app="graphini" />
    </Suspense>
  );
}
