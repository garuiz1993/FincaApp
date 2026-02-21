import { TipoTratamiento } from '@/types';

export interface Tratamiento {
  id: string;
  id_animal: string;
  fecha: string;
  tipo: TipoTratamiento;
  medicamento: string | null;
  dosis: string | null;
  costo: number;
  veterinario: string | null;
  proxima_fecha: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type TratamientoInput = Omit<Tratamiento, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
