import * as admin from 'firebase-admin';

const SERVICE_ACCOUNT_ENV = 'FIREBASE_SERVICE_ACCOUNT_JSON';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!;
  const serviceAccountJson = process.env[SERVICE_ACCOUNT_ENV];
  if (!serviceAccountJson) {
    throw new Error(`${SERVICE_ACCOUNT_ENV} is not defined`);
  }
  const serviceAccount = JSON.parse(serviceAccountJson);
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

type FirebaseTokenPayload = {
  uid: string;
  email?: string;
  name?: string | null;
  picture?: string | null;
};

export async function verifyToken(idToken: string) {
  const app = getAdminApp();
  const decoded = await admin.auth(app).verifyIdToken(idToken);
  const token: FirebaseTokenPayload = {
    uid: decoded.uid,
    email: decoded.email ?? undefined,
    name: decoded.name ?? null,
    picture: decoded.picture ?? null,
  };
  return token;
}
