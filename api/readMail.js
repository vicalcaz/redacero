import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

// Configuración de Firebase (ajusta con tus datos)
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
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing mail id');
  }
  try {
    // Actualiza el campo "leido" del mail en Firestore
    const mailRef = doc(db, 'mails', id);
    await updateDoc(mailRef, { leido: true, fechaLeido: new Date().toISOString() });
    // Devuelve un pixel transparente
    res.setHeader('Content-Type', 'image/png');
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgA1Qn1cAAAAASUVORK5CYII=',
      'base64'
    );
    res.status(200).send(pixel);
  } catch (err) {
    res.status(500).send('Error updating mail status');
  }
}
