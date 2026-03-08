'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Per-app config                                                     */
/* ------------------------------------------------------------------ */

type AppConfig = {
  name: string;
  tagline: string;
  defaultRedirect: string;
  /** Tailwind accent ring / focus color */
  accent: string;
  /** Accent text color */
  accentText: string;
  /** Glow blob gradient */
  glow: string;
  /** Primary CTA gradient */
  cta: string;
  /** Hover variant */
  ctaHover: string;
};

export const APP_CONFIGS: Record<string, AppConfig> = {
  astrova: {
    name: 'Astrova',
    tagline: 'Navigate your knowledge like a living universe.',
    defaultRedirect: 'https://astrova.magnova.ai/chart',
    accent: 'focus-visible:ring-amber-500/40',
    accentText: 'text-amber-400',
    glow: 'from-amber-500/20 via-orange-500/10',
    cta: 'bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200',
    ctaHover: 'hover:from-amber-300 hover:via-orange-200 hover:to-yellow-100',
  },
  graphini: {
    name: 'Graphini',
    tagline: 'Design complex systems with clarity and speed.',
    defaultRedirect: 'https://graphini.magnova.ai/dashboard',
    accent: 'focus-visible:ring-violet-500/40',
    accentText: 'text-violet-400',
    glow: 'from-violet-500/20 via-fuchsia-500/10',
    cta: 'bg-gradient-to-r from-violet-400 via-fuchsia-300 to-purple-200',
    ctaHover: 'hover:from-violet-300 hover:via-fuchsia-200 hover:to-purple-100',
  },
  codecity: {
    name: 'CodeCity',
    tagline: 'See your codebase as a system you can explore.',
    defaultRedirect: 'https://codecity.magnova.ai/dashboard',
    accent: 'focus-visible:ring-cyan-500/40',
    accentText: 'text-cyan-400',
    glow: 'from-cyan-500/20 via-sky-500/10',
    cta: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-200',
    ctaHover: 'hover:from-cyan-300 hover:via-sky-200 hover:to-teal-100',
  },
  default: {
    name: 'Magnova',
    tagline: 'One sign-in for every Magnova experience.',
    defaultRedirect: 'https://astrova.magnova.ai/chart',
    accent: 'focus-visible:ring-indigo-500/40',
    accentText: 'text-indigo-400',
    glow: 'from-indigo-500/20 via-sky-500/10',
    cta: 'bg-gradient-to-r from-indigo-400 via-sky-300 to-blue-200',
    ctaHover: 'hover:from-indigo-300 hover:via-sky-200 hover:to-blue-100',
  },
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell — background, glow, dot grid                                 */
/* ------------------------------------------------------------------ */

function Shell({ config, children }: { config: AppConfig; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 antialiased">
      {/* subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* top-center glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-b blur-[100px]',
          config.glow,
        )}
      />

      {/* card-center glow (softer, larger) */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-40 blur-[120px]',
          config.glow,
        )}
      />

      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading / fallback                                                 */
/* ------------------------------------------------------------------ */

export function AuthPageFallback({ app = 'default' }: { app?: string }) {
  const config = APP_CONFIGS[app] ?? APP_CONFIGS.default;

  return (
    <Shell config={config}>
      <div className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-zinc-900/60 px-8 py-14 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-base text-zinc-400">
          ✦
        </div>
        <p className="text-[13px] font-medium text-zinc-300">Preparing {config.name}…</p>
        <p className="mt-1.5 text-[13px] text-zinc-500">Checking your session</p>
        <div className="mt-8">
          <Spinner />
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/*  Main auth page                                                     */
/* ------------------------------------------------------------------ */

export default function AuthPage({ app = 'default' }: { app?: string }) {
  const searchParams = useSearchParams();
  const config = APP_CONFIGS[app] ?? APP_CONFIGS.default;
  const redirectTo = searchParams.get('redirect') ?? config.defaultRedirect;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  /* ---- session check ---- */
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' });
        if (res.ok) {
          window.location.href = decodeURIComponent(redirectTo);
          return;
        }
      } catch {
        // not authenticated
      }
      setChecking(false);
    }
    checkExistingSession();
  }, [redirectTo]);

  useEffect(() => {
    if (checking) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const t = await user.getIdToken();
        await createSession(t);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  /* ---- session helpers ---- */
  async function createSession(token: string) {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      window.location.href = decodeURIComponent(redirectTo);
    } catch {
      setError('Failed to create session. Please try again.');
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      const r = await signInWithGoogle();
      await createSession(await r.user.getIdToken());
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Google sign-in failed');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r =
        mode === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);
      await createSession(await r.user.getIdToken());
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Authentication failed');
      setLoading(false);
    }
  }

  if (checking) return <AuthPageFallback app={app} />;

  const isDefault = app === 'default';

  return (
    <Shell config={config}>
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* ---- header ---- */}
        <div className="px-8 pb-0 pt-10 text-center">
          <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-base text-zinc-400">
            ✦
          </div>

          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-white">
            {isDefault ? 'Sign in to Magnova' : `Sign in to ${config.name}`}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            {mode === 'login' ? config.tagline : `Create your ${config.name} account`}
          </p>
        </div>

        {/* ---- body ---- */}
        <div className="px-8 pb-2 pt-8">
          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/[0.1] bg-white text-[14px] font-medium text-zinc-900 transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[13px] font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={cn(
                  'flex h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-all',
                  'focus-visible:border-white/[0.16] focus-visible:ring-2',
                  config.accent,
                )}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[13px] font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-all',
                  'focus-visible:border-white/[0.16] focus-visible:ring-2',
                  config.accent,
                )}
              />
            </div>

            {/* error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-zinc-950 transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
                config.cta,
                config.ctaHover,
              )}
            >
              {loading ? (
                <Spinner />
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* ---- footer ---- */}
        <div className="px-8 pb-8 pt-5">
          {/* toggle mode */}
          <p className="text-center text-[13px] text-zinc-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'signup' : 'login'));
                setError('');
              }}
              className={cn('font-medium transition-colors hover:underline', config.accentText)}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* terms */}
          <div className="mx-auto mt-6 h-px w-full bg-white/[0.06]" />
          <p className="mt-5 text-center text-[11px] leading-5 text-zinc-600">
            By continuing, you agree to Magnova&apos;s{' '}
            <a
              href="https://magnova.ai/terms"
              className="text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-400"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://magnova.ai/privacy"
              className="text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-400"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </Shell>
  );
}
