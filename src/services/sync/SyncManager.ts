import type { SQLiteDatabase } from 'expo-sqlite';
import { pushBatch } from '../firebase/firestoreService';

interface SyncResult {
  table: string;
  synced: number;
}

const SYNC_TABLES = [
  { table: 'animales', collection: 'animales' },
  { table: 'produccion', collection: 'produccion' },
  { table: 'tratamientos', collection: 'tratamientos' },
  { table: 'ingresos', collection: 'ingresos' },
  { table: 'gastos', collection: 'gastos' },
  { table: 'potreros', collection: 'potreros' },
  { table: 'rotacion', collection: 'rotacion' },
  { table: 'eventos_reproductivos', collection: 'eventos_reproductivos' },
];

export async function syncAll(db: SQLiteDatabase, fincaId: string): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const { table, collection } of SYNC_TABLES) {
    const count = await syncTable(db, table, `fincas/${fincaId}/${collection}`);
    results.push({ table, synced: count });
  }

  return results;
}

async function syncTable(
  db: SQLiteDatabase,
  tableName: string,
  collectionPath: string
): Promise<number> {
  const unsynced = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM ${tableName} WHERE synced = 0`
  );

  if (unsynced.length === 0) return 0;

  const records = unsynced.map((row) => ({
    id: row.id as string,
    data: row,
  }));

  await pushBatch(collectionPath, records);

  const ids = unsynced.map((r) => r.id as string);
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE ${tableName} SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  );

  return unsynced.length;
}
