import { BaseRepository } from './BaseRepository';
import type { EventoAnimal, EventoAnimalInput } from '../models/EventoAnimal';
import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

export class EventoAnimalRepository extends BaseRepository<EventoAnimal> {
  constructor(db: SQLiteDatabase) {
    super(db, 'eventos_animal');
  }

  async create(data: EventoAnimalInput): Promise<string> {
    const id = randomUUID();
    await this.db.runAsync(
      `INSERT INTO eventos_animal (id, id_animal, tipo, fecha, descripcion, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.id_animal, data.tipo, data.fecha, data.descripcion, data.notas]
    );
    return id;
  }

  async getByAnimal(idAnimal: string): Promise<EventoAnimal[]> {
    return this.db.getAllAsync<EventoAnimal>(
      `SELECT * FROM eventos_animal WHERE id_animal = ? AND deleted = 0 ORDER BY fecha DESC, created_at DESC`,
      [idAnimal]
    );
  }

  async getRecentByAnimal(idAnimal: string, limit = 5): Promise<EventoAnimal[]> {
    return this.db.getAllAsync<EventoAnimal>(
      `SELECT * FROM eventos_animal WHERE id_animal = ? AND deleted = 0 ORDER BY fecha DESC, created_at DESC LIMIT ?`,
      [idAnimal, limit]
    );
  }

  async getCountByAnimal(idAnimal: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) as total FROM eventos_animal WHERE id_animal = ? AND deleted = 0`,
      [idAnimal]
    );
    return result?.total ?? 0;
  }
}
