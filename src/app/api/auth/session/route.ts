import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { getUserByFirebaseUid, upsertUser } from '@/lib/db';

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour
const COOKIE_DOMAIN = '.magnova.ai';

function buildResponse(body: unknown, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return buildResponse({ error: 'Missing token' }, 400);
  }

  const token = (payload as { token?: string }).token;
  if (!token) {
    return buildResponse({ error: 'Missing token' }, 400);
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded.email) {
      return buildResponse({ error: 'Token missing email' }, 400);
    }

    const user = await upsertUser(decoded.uid, decoded.email);

    const res = buildResponse({ ok: true, user });
    res.cookies.set(COOKIE_NAME, decoded.uid, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Session error:', error);
    return buildResponse({ error: 'Invalid token' }, 401);
  }
}

export async function GET(req: NextRequest) {
  const firebaseUid = req.cookies.get(COOKIE_NAME)?.value;
  if (!firebaseUid) {
    return buildResponse({ error: 'Not authenticated' }, 401);
  }

  const user = await getUserByFirebaseUid(firebaseUid);
  if (!user) {
    return buildResponse({ error: 'User not found' }, 401);
  }

  return buildResponse({ user });
}
