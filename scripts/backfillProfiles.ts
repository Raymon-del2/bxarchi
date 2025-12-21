import { initializeApp, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/*
  Back-fill script: creates a minimal Firestore profile document for every Firebase Auth user
  that does NOT already have one under `users/{uid}`.

  Usage:
    1. Create a Firebase service-account key JSON and save it as serviceAccount.json
       (or point GOOGLE_APPLICATION_CREDENTIALS to it).
    2. Run:  npx ts-node scripts/backfillProfiles.ts

  WARNING: This script runs with admin privileges — handle keys carefully.
*/

async function main() {
  // Load service account credentials
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccount.json');
  if (!fs.existsSync(credsPath)) {
    console.error('❌  Service account JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccount.json next to this script.');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(credsPath, 'utf8')) as ServiceAccount;

  // Initialise Admin SDK
  initializeApp({ credential: cert(serviceAccount) });
  const auth = getAuth();
  const db = getFirestore();

  let created = 0;
  let skipped = 0;

  console.log('🔍  Listing all auth users…');
  let nextPageToken: string | undefined;
  do {
    const list = await auth.listUsers(1000, nextPageToken);
    for (const user of list.users) {
      const docRef = db.collection('users').doc(user.uid);
      const snap = await docRef.get();
      if (snap.exists) {
        skipped++;
        continue;
      }
      await docRef.set({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      created++;
      console.log(`➕  Created profile for ${user.email || user.uid}`);
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);

  console.log(`✅  Done. Created ${created} profile docs, skipped ${skipped}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
