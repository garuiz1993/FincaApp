import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './config';

export async function pushToFirestore(
  collectionPath: string,
  id: string,
  data: Record<string, unknown>
): Promise<string> {
  const docRef = doc(firestore, collectionPath, id);
  await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return docRef.id;
}

export async function pushBatch(
  collectionPath: string,
  records: { id: string; data: Record<string, unknown> }[]
): Promise<void> {
  const batch = writeBatch(firestore);

  for (const record of records) {
    const docRef = doc(firestore, collectionPath, record.id);
    batch.set(docRef, { ...record.data, updatedAt: new Date().toISOString() }, { merge: true });
  }

  await batch.commit();
}

export async function fetchFromFirestore<T>(
  collectionPath: string,
  filters?: { field: string; value: unknown }[]
): Promise<(T & { id: string })[]> {
  let q = query(collection(firestore, collectionPath));

  if (filters) {
    for (const filter of filters) {
      q = query(q, where(filter.field, '==', filter.value));
    }
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
}
