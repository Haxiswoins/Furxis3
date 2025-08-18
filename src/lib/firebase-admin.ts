import admin from 'firebase-admin';

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (!serviceAccountKeyString) {
    console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKeyString)),
      });
    } catch (e) {
       console.error('CRITICAL: Failed to initialize Firebase Admin SDK. The service account key might be invalid.', e);
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
