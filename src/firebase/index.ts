
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

let initializedApp: FirebaseApp | undefined;

export function initializeFirebase() {
  if (initializedApp) return getSdks(initializedApp);

  const existingApps = getApps();
  if (existingApps.length) {
    initializedApp = existingApps[0];
    return getSdks(initializedApp);
  }

  try {
    // Robust initialization to prevent network failed issues
    initializedApp = initializeApp(firebaseConfig);
  } catch (e) {
    initializedApp = initializeApp();
  }

  return getSdks(initializedApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
