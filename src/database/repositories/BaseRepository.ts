import type { SQLiteDatabase } from 'expo-sqlite';

export abstract class BaseRepository<T> {
  constructor(
    protected db: SQLiteDatabase,
    protected tableName: string
  ) {}

  async getAll(): Promise<T[]> {
    return this.db.getAllAsync<T>(
      `SELECT * FROM ${this.tableName} WHERE deleted = 0 ORDER BY created_at DESC`
    );
  }

  async getById(id: string): Promise<T | null> {
    return this.db.getFirstAsync<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted = 0`,
      [id]
    );
  }

  async getUnsynced(): Promise<T[]> {
    return this.db.getAllAsync<T>(
      `SELECT * FROM ${this.tableName} WHERE synced = 0`
    );
  }

  async markSynced(id: string, firebaseId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET synced = 1, firebase_id = ? WHERE id = ?`,
      [firebaseId, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET deleted = 1, synced = 0, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  }

  async count(): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE deleted = 0`
    );
    return result?.total ?? 0;
  }
}
