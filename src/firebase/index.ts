export { auth, db, googleProvider } from './config';
export { signInWithGoogle, signOut, onAuthChange, getCurrentUser } from './auth';
export { saveUserData, loadUserData, subscribeToUserData, forceSaveUserData, getCloudTimestamp } from './database';
export type { AppDataWithMeta } from './database';
