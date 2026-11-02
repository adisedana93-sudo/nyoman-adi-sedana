import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UnitRiskItem } from '../types/clinical';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const RISKS_COLLECTION = 'risks';

export async function saveRiskToFirestore(item: UnitRiskItem): Promise<void> {
  try {
    const docRef = doc(db, RISKS_COLLECTION, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.warn('Firestore save error:', err);
  }
}

export async function deleteRiskFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, RISKS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
}

export async function syncBatchToFirestore(items: UnitRiskItem[]): Promise<void> {
  try {
    if (!items || items.length === 0) return;
    const batch = writeBatch(db);
    for (const item of items) {
      if (item && item.id) {
        const ref = doc(db, RISKS_COLLECTION, item.id);
        batch.set(ref, item, { merge: true });
      }
    }
    await batch.commit();
  } catch (err) {
    console.warn('Firestore batch error:', err);
  }
}

export async function clearAllRisksFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, RISKS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore clear error:', err);
  }
}
