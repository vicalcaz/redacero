// Vercel Serverless Function: /api/magicLink.js
// Crea y almacena un magic link para login automático y cambio de contraseña
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  // Parsear body manualmente si es necesario (Vercel serverless)
  if (!req.body || Object.keys(req.body).length === 0) {
    try {
      const rawBody = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
      });
      req.body = JSON.parse(rawBody);
    } catch {
      req.body = {};
    }
  }
  const { userId, email } = req.body;
  if (!userId || !email) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  try {
    const token = uuidv4();
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutos
    await setDoc(doc(db, 'magicLinks', token), {
      userId,
      email,
      expires,
      used: false,
      created: new Date().toISOString(),
    });
    return res.status(200).json({ token, url: `https://redacero.vercel.app/magic-login?token=${token}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
