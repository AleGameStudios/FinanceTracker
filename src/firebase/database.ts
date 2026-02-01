import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './config';
import type { AppData } from '../types';

const COLLECTION_NAME = 'userData';

export const saveUserData = async (userId: string, data: AppData): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
};

export const loadUserData = async (userId: string): Promise<AppData | null> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Remove updatedAt field before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt, ...appData } = data;
    return appData as AppData;
  }

  return null;
};

export const subscribeToUserData = (
  userId: string,
  callback: (data: AppData | null) => void
): Unsubscribe => {
  const docRef = doc(db, COLLECTION_NAME, userId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, ...appData } = data;
      callback(appData as AppData);
    } else {
      callback(null);
    }
  });
};
