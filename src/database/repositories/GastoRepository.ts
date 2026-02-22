import { BaseRepository } from './BaseRepository';
import type { Gasto, GastoInput } from '../models/Gasto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

export class GastoRepository extends BaseRepository<Gasto> {
  constructor(db: SQLiteDatabase) {
    super(db, 'gastos');
  }

  async create(data: GastoInput): Promise<string> {
    const id = randomUUID();
    await this.db.runAsync(
      `INSERT INTO gastos (id, fecha, categoria, descripcion, monto, proveedor, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.fecha, data.categoria, data.descripcion, data.monto, data.proveedor, data.notas]
    );
    return id;
  }

  async getByRango(fechaInicio: string, fechaFin: string): Promise<Gasto[]> {
    return this.db.getAllAsync<Gasto>(
      `SELECT * FROM gastos WHERE fecha BETWEEN ? AND ? AND deleted = 0 ORDER BY fecha DESC`,
      [fechaInicio, fechaFin]
    );
  }

  async getTotalByRango(fechaInicio: string, fechaFin: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE fecha BETWEEN ? AND ? AND deleted = 0`,
      [fechaInicio, fechaFin]
    );
    return result?.total ?? 0;
  }

  async getTotalByCategoria(fechaInicio: string, fechaFin: string): Promise<{ categoria: string; total: number }[]> {
    return this.db.getAllAsync<{ categoria: string; total: number }>(
      `SELECT categoria, COALESCE(SUM(monto), 0) as total
       FROM gastos WHERE fecha BETWEEN ? AND ? AND deleted = 0
       GROUP BY categoria ORDER BY total DESC`,
      [fechaInicio, fechaFin]
    );
  }
}
