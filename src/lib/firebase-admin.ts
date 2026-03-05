import * as admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  return admin.initializeApp({ credential: admin.credential.cert(sa) });
}

export async function verifyToken(token: string) {
  const app = getAdminApp();
  return admin.auth(app).verifyIdToken(token);
}
