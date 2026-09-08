// firebase.config.js — Firebase Firestore initialization & cloud sync helpers
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key'
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('[Firebase] Connected to Firestore project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err.message);
  }
} else {
  console.info('[Firebase] Credentials not configured in .env. Falling back to local offline storage cache.');
}

export { app, db };

const FIRESTORE_COLLECTION = 'musicvid_projects';

/**
 * Save project metadata and state to Firebase Firestore (or localStorage fallback).
 */
export async function saveProjectToCloud(projectId, projectData) {
  const safeId = (projectId || 'default_project').replace(/[^a-zA-Z0-9_-]/g, '_');
  const payload = {
    ...projectData,
    updatedAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, safeId);
      await setDoc(docRef, { ...payload, serverTimestamp: serverTimestamp() }, { merge: true });
      return { success: true, mode: 'cloud', id: safeId };
    } catch (err) {
      console.warn('[Firebase] Firestore write failed, using local backup:', err.message);
    }
  }

  // Fallback: localStorage sync
  try {
    const key = `cloud_sync_${safeId}`;
    localStorage.setItem(key, JSON.stringify(payload));
    return { success: true, mode: 'local-fallback', id: safeId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Load project state from Firebase Firestore (or localStorage fallback).
 */
export async function loadProjectFromCloud(projectId) {
  const safeId = (projectId || 'default_project').replace(/[^a-zA-Z0-9_-]/g, '_');

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, safeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { success: true, mode: 'cloud', data: snapshot.data() };
      }
    } catch (err) {
      console.warn('[Firebase] Firestore read failed, checking local backup:', err.message);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(`cloud_sync_${safeId}`);
    if (raw) {
      return { success: true, mode: 'local-fallback', data: JSON.parse(raw) };
    }
    return { success: false, error: 'Project not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * List all projects synced to the cloud.
 */
export async function listCloudProjects() {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const querySnapshot = await getDocs(colRef);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.warn('[Firebase] Failed to list Firestore projects:', err.message);
    }
  }

  // Fallback
  const list = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cloud_sync_')) {
        const val = JSON.parse(localStorage.getItem(k));
        list.push({ id: k.replace('cloud_sync_', ''), ...val });
      }
    }
  } catch (e) {
    // Ignore
  }
  return list;
}
