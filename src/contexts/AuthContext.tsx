import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from '@/lib/firebase';
import { getOrCreateAstrovaUser, setTokenProvider, type AstrovaUser } from '@/lib/api';

export interface AuthContextType {
  astrovaUser: AstrovaUser | null;
  user: User | null;
  loading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [astrovaUser, setAstrovaUser] = useState<AstrovaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const prevUserId = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | null>(null);
  const sessionSyncTokenRef = useRef<string | null>(null);

  const isLoaded = !loading;
  const isSignedIn = !!firebaseUser;

  useEffect(() => {
    setTokenProvider(() => () => tokenRef.current);
  }, []);

  const syncServerSession = useCallback(async (idToken: string) => {
    if (sessionSyncTokenRef.current === idToken) return;
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token: idToken }),
      });
      if (!res.ok) {
        console.error('[auth] session sync failed', res.status, await res.text());
        return;
      }
      sessionSyncTokenRef.current = idToken;
    } catch (error) {
      console.error('[auth] session sync error', error);
    }
  }, []);

  const syncAstrovaUser = useCallback(async () => {
    if (!firebaseUser || !token || !firebaseUser.email) return;
    const au = await getOrCreateAstrovaUser(
      firebaseUser.uid,
      firebaseUser.email,
      firebaseUser.displayName ?? undefined,
      firebaseUser.photoURL ?? undefined,
    );
    if (au) setAstrovaUser(au);
  }, [firebaseUser, token]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      if (!nextUser) {
        tokenRef.current = null;
        sessionSyncTokenRef.current = null;
        setToken(null);
        setAstrovaUser(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await nextUser.getIdToken();
        tokenRef.current = idToken;
        setToken(idToken);
        await syncServerSession(idToken);
      } catch (error) {
        console.error('[auth] failed to refresh token', error);
        tokenRef.current = null;
        setToken(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncServerSession]);

  useEffect(() => {
    if (token && firebaseUser) {
      syncAstrovaUser();
    } else {
      setAstrovaUser(null);
    }
  }, [token, firebaseUser, syncAstrovaUser]);

  useEffect(() => {
    const currentUserId = firebaseUser?.uid;
    if (currentUserId !== prevUserId.current) {
      if (prevUserId.current !== undefined) {
        setAstrovaUser(null);
      }
      prevUserId.current = currentUserId;
    }
  }, [firebaseUser?.uid]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await firebaseSignInWithGoogle();
      return {};
    } catch (error) {
      return { error: (error as Error).message || 'Google sign-in failed' };
    }
  }, []);

  const signInWithEmailFn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      return {};
    } catch (error) {
      return { error: (error as Error).message || 'Sign-in failed' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
      return {};
    } catch (error) {
      return { error: (error as Error).message || 'Sign-up failed' };
    }
  }, []);

  const signOutFn = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('[auth] sign out failed', error);
    } finally {
      tokenRef.current = null;
      sessionSyncTokenRef.current = null;
      setToken(null);
      setAstrovaUser(null);
      setFirebaseUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await syncAstrovaUser();
  }, [syncAstrovaUser]);

  return (
    <AuthContext.Provider value={{
      astrovaUser,
      user: firebaseUser,
      loading,
      isLoaded,
      isSignedIn,
      signInWithGoogle,
      signInWithEmail: signInWithEmailFn,
      signUp,
      signOut: signOutFn,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAstrovaUser() {
  const { astrovaUser } = useAuth();
  return astrovaUser;
}
