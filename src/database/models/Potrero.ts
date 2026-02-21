import { EstadoPotrero } from '@/types';

export interface Potrero {
  id: string;
  nombre: string;
  area: number | null;
  tipo_pasto: string | null;
  estado: EstadoPotrero;
  capacidad: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type PotreroInput = Omit<Potrero, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
