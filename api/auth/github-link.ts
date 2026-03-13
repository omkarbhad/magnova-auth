import { json, jsonError, parseBody } from '../_lib/db.js';
import * as admin from 'firebase-admin';

// Node.js runtime (not Edge) — needed for firebase-admin createCustomToken
export const config = { runtime: 'nodejs' };

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Given an email from a GitHub account-exists-with-different-credential error,
// look up the existing Firebase user and return a custom token for silent sign-in.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email } = await parseBody<{ email?: string }>(req);
    if (!email) return jsonError('Missing email', 400);

    const app = getAdminApp();
    const user = await admin.auth(app).getUserByEmail(email);
    const customToken = await admin.auth(app).createCustomToken(user.uid);

    return json({ customToken });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth][github-link]', msg);
    return jsonError(msg, 500);
  }
}
