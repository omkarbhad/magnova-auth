import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app: App;

function getApp() {
  if (app) return app;
  
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is required');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  app = initializeApp({
    credential: cert(serviceAccount),
  });

  return app;
}

export async function verifyToken(token: string) {
  const auth = getAuth(getApp());
  return auth.verifyIdToken(token);
}
