// Vercel Serverless Function: /api/validateMagicLink.js
// Valida el magic link y marca como usado
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

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
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Falta token' });
  try {
    const ref = doc(db, 'magicLinks', token);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: 'Token inválido' });
    const data = snap.data();
    if (data.used) return res.status(400).json({ error: 'Token ya usado' });
    if (Date.now() > data.expires) return res.status(400).json({ error: 'Token expirado' });
    await updateDoc(ref, { used: true, usedAt: new Date().toISOString() });
    return res.status(200).json({ userId: data.userId, email: data.email });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
