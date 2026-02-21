import { EstadoAnimal, Sexo } from '@/types';

export interface Animal {
  id: string;
  codigo: string;
  nombre: string | null;
  raza: string;
  fecha_nacimiento: string | null;
  sexo: Sexo;
  estado: EstadoAnimal;
  peso_actual: number | null;
  id_madre: string | null;
  id_padre: string | null;
  foto_uri: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type AnimalInput = Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
