import { BaseRepository } from './BaseRepository';
import type { Produccion, ProduccionInput } from '../models/Produccion';
import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

export class ProduccionRepository extends BaseRepository<Produccion> {
  constructor(db: SQLiteDatabase) {
    super(db, 'produccion');
  }

  async create(data: ProduccionInput): Promise<string> {
    const id = randomUUID();
    const total = (data.litros_manana || 0) + (data.litros_tarde || 0);
    await this.db.runAsync(
      `INSERT INTO produccion (id, id_animal, fecha, litros_manana, litros_tarde, total, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.id_animal, data.fecha, data.litros_manana, data.litros_tarde, total, data.notas]
    );
    return id;
  }

  async upsert(data: ProduccionInput): Promise<string> {
    const existing = await this.db.getFirstAsync<Produccion>(
      `SELECT * FROM produccion WHERE id_animal = ? AND fecha = ? AND deleted = 0`,
      [data.id_animal, data.fecha]
    );

    if (existing) {
      const total = (data.litros_manana || 0) + (data.litros_tarde || 0);
      await this.db.runAsync(
        `UPDATE produccion SET litros_manana = ?, litros_tarde = ?, total = ?, notas = ?, updated_at = datetime('now'), synced = 0 WHERE id = ?`,
        [data.litros_manana, data.litros_tarde, total, data.notas, existing.id]
      );
      return existing.id;
    }

    return this.create(data);
  }

  async getByFecha(fecha: string): Promise<Produccion[]> {
    return this.db.getAllAsync<Produccion>(
      `SELECT p.*, a.codigo as animal_codigo, a.nombre as animal_nombre
       FROM produccion p
       JOIN animales a ON p.id_animal = a.id
       WHERE p.fecha = ? AND p.deleted = 0
       ORDER BY a.codigo`,
      [fecha]
    );
  }

  async getTotalByFecha(fecha: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM produccion WHERE fecha = ? AND deleted = 0`,
      [fecha]
    );
    return result?.total ?? 0;
  }

  async getTotalByRango(fechaInicio: string, fechaFin: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM produccion WHERE fecha BETWEEN ? AND ? AND deleted = 0`,
      [fechaInicio, fechaFin]
    );
    return result?.total ?? 0;
  }

  async getPromedioByAnimal(idAnimal: string, fechaInicio: string, fechaFin: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ promedio: number }>(
      `SELECT COALESCE(AVG(total), 0) as promedio FROM produccion WHERE id_animal = ? AND fecha BETWEEN ? AND ? AND deleted = 0`,
      [idAnimal, fechaInicio, fechaFin]
    );
    return result?.promedio ?? 0;
  }
}
