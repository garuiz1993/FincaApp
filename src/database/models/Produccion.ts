export interface Produccion {
  id: string;
  id_animal: string;
  fecha: string;
  litros_manana: number;
  litros_tarde: number;
  total: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type ProduccionInput = Pick<Produccion, 'id_animal' | 'fecha' | 'litros_manana' | 'litros_tarde' | 'notas'>;
