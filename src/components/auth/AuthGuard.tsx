import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { AuthModal } from './AuthModal';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface to-surface/80">
        <div className="text-center px-4">
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
