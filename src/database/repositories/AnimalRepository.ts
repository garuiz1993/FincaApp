import { BaseRepository } from './BaseRepository';
import type { Animal, AnimalInput } from '../models/Animal';
import type { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

export class AnimalRepository extends BaseRepository<Animal> {
  constructor(db: SQLiteDatabase) {
    super(db, 'animales');
  }

  async create(data: AnimalInput): Promise<string> {
    const id = uuidv4();
    await this.db.runAsync(
      `INSERT INTO animales (id, codigo, nombre, raza, fecha_nacimiento, sexo, estado, peso_actual, id_madre, id_padre, foto_uri, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.codigo,
        data.nombre,
        data.raza,
        data.fecha_nacimiento,
        data.sexo,
        data.estado,
        data.peso_actual,
        data.id_madre,
        data.id_padre,
        data.foto_uri,
        data.notas,
      ]
    );
    return id;
  }

  async update(id: string, data: Partial<AnimalInput>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) return;

    fields.push('updated_at = datetime(\'now\')');
    fields.push('synced = 0');
    values.push(id);

    await this.db.runAsync(
      `UPDATE animales SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async getActivos(): Promise<Animal[]> {
    return this.db.getAllAsync<Animal>(
      `SELECT * FROM animales WHERE estado IN ('activo', 'produccion', 'seca', 'gestante') AND deleted = 0 ORDER BY codigo`
    );
  }

  async getEnProduccion(): Promise<Animal[]> {
    return this.db.getAllAsync<Animal>(
      `SELECT * FROM animales WHERE estado = 'produccion' AND deleted = 0 ORDER BY codigo`
    );
  }

  async getByCodigo(codigo: string): Promise<Animal | null> {
    return this.db.getFirstAsync<Animal>(
      `SELECT * FROM animales WHERE codigo = ? AND deleted = 0`,
      [codigo]
    );
  }
}
