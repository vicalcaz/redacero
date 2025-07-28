
import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


// Inicializa firebase-admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    // Si usas variables de entorno para el service account, puedes usar:
    // credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = getFirestore();


export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing mail id');
  }
  try {
    // Actualiza el campo "mailleido" del mailUsuarioEvento en Firestore
    const mailRef = db.collection('mailUsuarioEvento').doc(id);
    await mailRef.set({ mailleido: true, fechaleido: new Date().toISOString() }, { merge: true });
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
