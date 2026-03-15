
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Core initialization logic moved to its own file to prevent circular dependencies
 * between the barrel file (index.ts) and the client providers.
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initialization error:', e);
      // Fallback attempt
      app = getApp();
    }
  } else {
    app = getApp();
  }

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}
