import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Note: no Firebase Storage here — file uploads go through Cloudinary
// instead (see src/lib/cloudinary.ts), since Firebase Storage now requires
// the paid Blaze plan even for tiny usage.

/**
 * Creating a new Firebase Auth user with the client SDK automatically signs
 * the browser in as that new user. That's a problem when the ADMIN is the
 * one creating an intern account — it would kick the admin out of their own
 * session. The standard workaround is to spin up a second, temporary
 * Firebase App instance just for the create-user call, then throw it away.
 * The admin's session on the main `auth` instance is never touched.
 */
export async function getSecondaryAuth() {
  const name = `secondary-${Date.now()}`;
  const secondaryApp: FirebaseApp = initializeApp(firebaseConfig, name);
  const secondaryAuth = getAuth(secondaryApp);
  return {
    auth: secondaryAuth,
    cleanup: async () => {
      await deleteApp(secondaryApp);
    },
  };
}

export function whatsappToEmail(whatsapp: string) {
  const digits = whatsapp.replace(/[^0-9]/g, '');
  const domain = import.meta.env.VITE_INTERN_EMAIL_DOMAIN || 'intern.local';
  return `intern_${digits}@${domain}`;
}
