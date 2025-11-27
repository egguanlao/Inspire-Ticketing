import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const trim = (value) => (typeof value === 'string' ? value.trim() : value);

const firebaseConfig = {
  apiKey:
    trim(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) ??
    trim(process.env.FIREBASE_API_KEY) ??
    trim(process.env.next_public_firebase_api_key) ??
    trim(process.env.firebase_api_key),
  authDomain:
    trim(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ??
    trim(process.env.FIREBASE_AUTH_DOMAIN),
  projectId:
    trim(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ??
    trim(process.env.FIREBASE_PROJECT_ID),
  storageBucket:
    trim(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ??
    trim(process.env.FIREBASE_STORAGE_BUCKET),
  messagingSenderId:
    trim(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ??
    trim(process.env.FIREBASE_MESSAGING_SENDER_ID),
  appId:
    trim(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) ?? trim(process.env.FIREBASE_APP_ID),
};

if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config check:', {
    apiKeyPrefix: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 6)}***` : null,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}

if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase configuration is missing. Check your environment variables.'
  );
}

// Avoid re-initialising Firebase during hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

