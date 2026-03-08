import * as admin from 'firebase-admin';

const SERVICE_ACCOUNT_ENV = 'FIREBASE_SERVICE_ACCOUNT_JSON';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!;
  const serviceAccountJson = process.env[SERVICE_ACCOUNT_ENV];
  if (!serviceAccountJson) {
    throw new Error(`${SERVICE_ACCOUNT_ENV} is not defined`);
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error('Unable to parse Firebase service account JSON');
  }

  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

type FirebaseTokenResult = {
  uid: string;
  email?: string;
};

export async function verifyToken(idToken: string): Promise<FirebaseTokenResult> {
  const app = getAdminApp();
  const decoded = await admin.auth(app).verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email ?? undefined,
  };
}
