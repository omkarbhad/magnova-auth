import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { upsertUser } from '@/lib/db';

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Verify Firebase token
    const decoded = await verifyToken(token);

    // Upsert user in Neon
    const user = await upsertUser(
      decoded.uid,
      decoded.email!,
      decoded.name,
      decoded.picture,
    );

    // Set cookie on .magnova.ai (works across all subdomains)
    const res = NextResponse.json({ user });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.magnova.ai' : 'localhost',
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
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const decoded = await verifyToken(token);
    const user = await import('@/lib/db').then(m => m.getUserByFirebaseUid(decoded.uid));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
