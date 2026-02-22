export interface EventoAnimal {
  id: string;
  id_animal: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type EventoAnimalInput = Omit<
  EventoAnimal,
  'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'
>;
