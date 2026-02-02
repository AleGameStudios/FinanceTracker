import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './config';
import type { AppData } from '../types';

const COLLECTION_NAME = 'userData';

// Extended AppData with metadata for sync
export interface AppDataWithMeta extends AppData {
  updatedAt?: number;
}

/**
 * Save user data with timestamp-based conflict resolution.
 * Only saves if local timestamp is newer than cloud timestamp.
 * Returns the timestamp used for saving, or null if save was skipped.
 */
export const saveUserData = async (
  userId: string,
  data: AppData,
  localTimestamp?: number
): Promise<number | null> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const saveTimestamp = localTimestamp || Date.now();

  try {
    // Use a transaction to ensure atomic read-check-write
    const result = await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const cloudTimestamp = cloudData.updatedAt || 0;

        // Only save if our data is newer
        if (saveTimestamp <= cloudTimestamp) {
          console.log('Skipping save: cloud data is newer', {
            local: saveTimestamp,
            cloud: cloudTimestamp
          });
          return { saved: false, timestamp: cloudTimestamp };
        }
      }

      // Our data is newer (or doc doesn't exist), proceed with save
      transaction.set(docRef, {
        ...data,
        updatedAt: saveTimestamp
      });

      return { saved: true, timestamp: saveTimestamp };
    });

    return result.saved ? result.timestamp : null;
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

/**
 * Force save user data, bypassing timestamp check.
 * Use only for imports or explicit user actions.
 */
export const forceSaveUserData = async (userId: string, data: AppData): Promise<number> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const timestamp = Date.now();

  await setDoc(docRef, {
    ...data,
    updatedAt: timestamp
  });

  return timestamp;
};

/**
 * Load user data with timestamp information.
 */
export const loadUserData = async (userId: string): Promise<AppDataWithMeta | null> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as AppDataWithMeta;
  }

  return null;
};

/**
 * Get just the cloud timestamp without loading all data.
 */
export const getCloudTimestamp = async (userId: string): Promise<number | null> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().updatedAt || null;
  }

  return null;
};

/**
 * Subscribe to user data changes.
 * Callback receives data with timestamp information.
 */
export const subscribeToUserData = (
  userId: string,
  callback: (data: AppDataWithMeta | null, timestamp: number | null) => void
): Unsubscribe => {
  const docRef = doc(db, COLLECTION_NAME, userId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const timestamp = data.updatedAt || null;
      callback(data as AppDataWithMeta, timestamp);
    } else {
      callback(null, null);
    }
  });
};
