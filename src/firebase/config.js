import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: verificar que las variables se carguen
console.log('Variables de entorno:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Cargada' : 'NO ENCONTRADA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// Verificar que todas las variables estén presentes
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('ERROR: Variables de Firebase no encontradas');
  console.log('Verifica que el archivo .env esté en la raíz del proyecto');
  throw new Error('Configuración de Firebase incompleta');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);