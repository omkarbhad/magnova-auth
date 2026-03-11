import { NextRequest, NextResponse } from 'next/server';

const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.magnova.ai' : undefined;

export async function POST(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get('redirect') ?? 'https://magnova.ai';
  
  const res = NextResponse.redirect(redirect);
  
  // Clear both cookies
  res.cookies.set('magnova_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    maxAge: 0,
    path: '/',
  });
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

export async function GET(req: NextRequest) {
  return POST(req);
}
