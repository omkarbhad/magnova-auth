import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { getUserByFirebaseUid, upsertUser } from '@/lib/db';

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour
const COOKIE_DOMAIN = '.magnova.ai';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Verify Firebase token
    const decoded = await verifyToken(token);
    if (!decoded.email) {
      return NextResponse.json({ error: 'Token missing email' }, { status: 400 });
    }

    // Upsert user in Neon
    const user = await upsertUser(
      decoded.uid,
      decoded.email!,
      decoded.name ?? undefined,
      decoded.picture ?? undefined,
    );

    // Set httpOnly session cookie on .magnova.ai (works across all subdomains)
    const res = NextResponse.json({ ok: true, user });
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
    console.error('Session error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Verify existing session (used by Graphini/CodeCity to check auth)
export async function GET(req: NextRequest) {
  try {
    const firebaseUid = req.cookies.get(COOKIE_NAME)?.value;
    if (!firebaseUid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await getUserByFirebaseUid(firebaseUid);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });
    
    const res = NextResponse.json({ user });
    
    // Ensure magnova_auth cookie exists (for old sessions that predate this cookie)
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
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
