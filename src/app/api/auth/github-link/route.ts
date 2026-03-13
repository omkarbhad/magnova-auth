import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  return initializeApp({ credential: cert(serviceAccount) });
}

// Given an email from a GitHub account-exists-with-different-credential error,
// find the existing Firebase user by email and return a custom token so the
// client can sign in without showing a Google popup.
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400, headers: corsHeaders(origin) });
    }

    const adminAuth = getAuth(getAdminApp());
    const user = await adminAuth.getUserByEmail(email);
    const customToken = await adminAuth.createCustomToken(user.uid);

    return NextResponse.json({ customToken }, { headers: corsHeaders(origin) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('github-link error:', msg);
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders(origin) });
  }
}
