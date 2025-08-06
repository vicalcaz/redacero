// firestore-backup.js
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();

async function exportCollections() {
  const collections = await db.listCollections();
  for (const col of collections) {
    const snapshot = await col.get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    fs.writeFileSync(`${col.id}.json`, JSON.stringify(data, null, 2));
    console.log(`Exportada colección: ${col.id} (${data.length} documentos)`);
  }
  console.log('✅ Backup completo.');
}

exportCollections();