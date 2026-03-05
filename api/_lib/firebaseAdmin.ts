import * as admin from 'firebase-admin';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

export const auth = admin.auth();

export async function verifyToken(token: string) {
  return auth.verifyIdToken(token);
}
