import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://astrova.magnova.ai',
  'https://graphini.magnova.ai',
  'https://codecity.magnova.ai',
  'https://magnova.ai',
  'http://localhost:3000',
  'http://localhost:5173',
];

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
import { verifyToken } from '@/lib/firebase-admin';
import { getUserByFirebaseUid, upsertUser, updateGitHubToken } from '@/lib/db';

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.magnova.ai' : undefined;

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const { token, githubToken, githubUsername } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400, headers: corsHeaders(origin) });

    // Verify Firebase token
    const decoded = await verifyToken(token);
    if (!decoded.email) {
      return NextResponse.json({ error: 'Token missing email' }, { status: 400, headers: corsHeaders(origin) });
    }

    // Upsert user in Neon (with optional GitHub token)
    const user = await upsertUser(
      decoded.uid,
      decoded.email!,
      decoded.name ?? undefined,
      decoded.picture ?? undefined,
      githubToken ?? undefined,
      githubUsername ?? undefined,
    );

    // If user already exists and is linking GitHub, update token
    if (githubToken && !user.github_token) {
      await updateGitHubToken(decoded.uid, githubToken, githubUsername);
      user.github_token = githubToken;
      user.github_username = githubUsername ?? null;
    }

    // Set httpOnly session cookie on .magnova.ai (works across all subdomains)
    const res = NextResponse.json({ ok: true, user }, { headers: corsHeaders(origin) });
    res.cookies.set(COOKIE_NAME, decoded.uid, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    // Also set a non-httpOnly flag so JavaScript can detect auth status
    res.cookies.set('magnova_auth', '1', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Session error:', errMsg, err);
    return NextResponse.json({ error: 'Invalid token', details: errMsg }, { status: 401, headers: corsHeaders(origin) });
  }
}

// Verify existing session (used by apps to check auth)
export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const firebaseUid = req.cookies.get(COOKIE_NAME)?.value;
    if (!firebaseUid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders(origin) });
    const user = await getUserByFirebaseUid(firebaseUid);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401, headers: corsHeaders(origin) });
    
    const res = NextResponse.json({ user }, { headers: corsHeaders(origin) });
    
    // Ensure magnova_auth cookie exists (for old sessions)
    const hasAuthCookie = req.cookies.get('magnova_auth')?.value;
    if (!hasAuthCookie) {
      res.cookies.set('magnova_auth', '1', {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        domain: COOKIE_DOMAIN,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
    }
    
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders(origin) });
  }
}
