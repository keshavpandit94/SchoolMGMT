import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;
let googleProvider;

try {
  // Check if firebase parameters are valid (not default placeholder/empty values)
  const isValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key' && !firebaseConfig.apiKey.startsWith('mock_');

  if (isValidConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn('Firebase config is not fully initialized. Operating in simulated Firebase mode.');
  }
} catch (error: any) {
  console.error('Firebase initialization error:', error.message);
}

export { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
