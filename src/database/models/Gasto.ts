import { CategoriaGasto } from '@/types';

export interface Gasto {
  id: string;
  fecha: string;
  categoria: CategoriaGasto;
  descripcion: string | null;
  monto: number;
  proveedor: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type GastoInput = Omit<Gasto, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
