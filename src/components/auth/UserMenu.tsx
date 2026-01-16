import { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthModal } from './AuthModal';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-800/50 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAuthModal(true)}
          className="gap-2 bg-neutral-800/50 border-neutral-700/50 text-white/80 hover:bg-neutral-800/60 hover:text-white"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';
  const userEmail = user.email || 'User';
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail;
  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-600/50">
          {userAvatar && !imageError ? (
            <img 
              src={userAvatar} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover border border-neutral-600/50"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-700/50 border border-neutral-600/50 flex items-center justify-center">
              <span className="text-sm font-medium text-white">{userInitial}</span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-700/50">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <p className="text-xs text-white/50 truncate">{userEmail}</p>
        </div>
        <DropdownMenuSeparator className="bg-neutral-800/50" />
        <DropdownMenuItem className="gap-2 text-white/80 focus:bg-neutral-800/50 focus:text-white cursor-pointer">
          <Settings className="w-4 h-4" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800/50" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="gap-2 text-white/80 focus:bg-neutral-800/50 focus:text-white cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
