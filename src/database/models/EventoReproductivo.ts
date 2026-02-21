import { TipoEventoReproductivo, ResultadoEvento } from '@/types';

export interface EventoReproductivo {
  id: string;
  id_animal: string;
  tipo: TipoEventoReproductivo;
  fecha: string;
  id_toro: string | null;
  pajilla: string | null;
  resultado: ResultadoEvento | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  firebase_id: string | null;
  deleted: number;
}

export type EventoReproductivoInput = Omit<EventoReproductivo, 'id' | 'created_at' | 'updated_at' | 'synced' | 'firebase_id' | 'deleted'>;
