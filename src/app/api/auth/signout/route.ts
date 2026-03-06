import { NextResponse } from 'next/server';

const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.magnova.ai' : 'localhost';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear httpOnly session cookie
  res.cookies.set('magnova_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    maxAge: 0,
    path: '/',
  });
  // Clear JavaScript-readable auth flag
  res.cookies.set('magnova_auth', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    maxAge: 0,
    path: '/',
  });
  return res;
}
