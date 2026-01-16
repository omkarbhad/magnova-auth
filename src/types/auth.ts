import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}