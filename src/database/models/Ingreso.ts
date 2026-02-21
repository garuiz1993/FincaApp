import { TipoIngreso } from '@/types';

export interface Ingreso {
  id: string;
  fecha: string;
  tipo: TipoIngreso;
  descripcion: string | null;
  monto: number;
  cantidad: number | null;
  precio_unitario: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type IngresoInput = Omit<Ingreso, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
