import { BaseRepository } from './BaseRepository';
import type { Tratamiento, TratamientoInput } from '../models/Tratamiento';
import type { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

export class TratamientoRepository extends BaseRepository<Tratamiento> {
  constructor(db: SQLiteDatabase) {
    super(db, 'tratamientos');
  }

  async create(data: TratamientoInput): Promise<string> {
    const id = uuidv4();
    await this.db.runAsync(
      `INSERT INTO tratamientos (id, id_animal, fecha, tipo, medicamento, dosis, costo, veterinario, proxima_fecha, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.id_animal,
        data.fecha,
        data.tipo,
        data.medicamento,
        data.dosis,
        data.costo,
        data.veterinario,
        data.proxima_fecha,
        data.notas,
      ]
    );
    return id;
  }

  async getByAnimal(idAnimal: string): Promise<Tratamiento[]> {
    return this.db.getAllAsync<Tratamiento>(
      `SELECT * FROM tratamientos WHERE id_animal = ? AND deleted = 0 ORDER BY fecha DESC`,
      [idAnimal]
    );
  }

  async getProximos(): Promise<Tratamiento[]> {
    return this.db.getAllAsync<Tratamiento>(
      `SELECT t.*, a.codigo as animal_codigo, a.nombre as animal_nombre
       FROM tratamientos t
       JOIN animales a ON t.id_animal = a.id
       WHERE t.proxima_fecha IS NOT NULL AND t.proxima_fecha >= date('now') AND t.deleted = 0
       ORDER BY t.proxima_fecha ASC`
    );
  }
}
