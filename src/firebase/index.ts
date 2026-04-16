
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Global singleton instance to prevent multiple initializations
let initializedApp: FirebaseApp | undefined;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (initializedApp) {
    return getSdks(initializedApp);
  }

  const existingApps = getApps();
  if (existingApps.length) {
    initializedApp = existingApps[0];
    return getSdks(initializedApp);
  }

  try {
    // Attempt to initialize via Firebase App Hosting environment variables
    initializedApp = initializeApp();
  } catch (e) {
    // Fallback to config object if environment variables are not available (e.g., during development)
    initializedApp = initializeApp(firebaseConfig);
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
