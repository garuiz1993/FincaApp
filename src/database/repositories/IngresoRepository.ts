import { BaseRepository } from './BaseRepository';
import type { Ingreso, IngresoInput } from '../models/Ingreso';
import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

export class IngresoRepository extends BaseRepository<Ingreso> {
  constructor(db: SQLiteDatabase) {
    super(db, 'ingresos');
  }

  async create(data: IngresoInput): Promise<string> {
    const id = randomUUID();
    await this.db.runAsync(
      `INSERT INTO ingresos (id, fecha, tipo, descripcion, monto, cantidad, precio_unitario, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.fecha, data.tipo, data.descripcion, data.monto, data.cantidad, data.precio_unitario, data.notas]
    );
    return id;
  }

  async getByRango(fechaInicio: string, fechaFin: string): Promise<Ingreso[]> {
    return this.db.getAllAsync<Ingreso>(
      `SELECT * FROM ingresos WHERE fecha BETWEEN ? AND ? AND deleted = 0 ORDER BY fecha DESC`,
      [fechaInicio, fechaFin]
    );
  }

  async getTotalByRango(fechaInicio: string, fechaFin: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE fecha BETWEEN ? AND ? AND deleted = 0`,
      [fechaInicio, fechaFin]
    );
    return result?.total ?? 0;
  }
}
