import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthCredential,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  browserSessionPersistence,
  setPersistence,
  inMemoryPersistence,
  linkWithCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Check if storage is available (fails in iOS private browsing)
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Set persistence based on storage availability
if (typeof window !== 'undefined') {
  const persistence = isStorageAvailable() ? browserSessionPersistence : inMemoryPersistence;
  setPersistence(auth, persistence).catch(console.error);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo'); // Access private repos
githubProvider.addScope('read:user');

export async function signInWithGoogle() {
  // Use redirect instead of popup - more reliable
  return signInWithRedirect(auth, googleProvider);
}

export async function getGoogleRedirectResult() {
  return getRedirectResult(auth);
}

/**
 * Sign in with GitHub using popup (not redirect) so we can capture
 * the OAuth access token from the credential.
 * Returns { user, githubToken } where githubToken is the GitHub OAuth token.
 */
export async function signInWithGitHub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    return {
      user: result.user,
      githubToken: credential?.accessToken ?? null,
    };
  } catch (e: unknown) {
    const err = e as { code?: string; email?: string; customData?: { email?: string } };
    // Account exists with different credential (e.g. Google) — sign in with Google then link GitHub
    if (err.code === 'auth/account-exists-with-different-credential') {
      // Capture the pending GitHub credential (contains the GitHub access token)
      const pendingCredential = GithubAuthProvider.credentialFromError(
        e as Parameters<typeof GithubAuthProvider.credentialFromError>[0]
      );

      // Sign in with Google (the existing provider) — one popup
      const googleResult = await signInWithPopup(auth, googleProvider);

      // Link the GitHub credential to the now-signed-in Google account
      if (pendingCredential) {
        await linkWithCredential(googleResult.user, pendingCredential);
        const githubToken = (pendingCredential as OAuthCredential).accessToken ?? null;
        return { user: googleResult.user, githubToken };
      }

      return { user: googleResult.user, githubToken: null };
    }
    throw e;
  }
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential;
}

export async function signOut() {
  return firebaseSignOut(auth);
}
