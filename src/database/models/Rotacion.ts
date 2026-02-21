export interface Rotacion {
  id: string;
  id_potrero: string;
  fecha_ingreso: string;
  fecha_salida: string | null;
  numero_animales: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type RotacionInput = Omit<Rotacion, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
