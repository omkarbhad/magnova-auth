import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('magnova_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.magnova.ai' : 'localhost',
    maxAge: 0,
    path: '/',
  });
  return res;
}
