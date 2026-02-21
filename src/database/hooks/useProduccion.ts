import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ProduccionRepository } from '../repositories/ProduccionRepository';
import type { Produccion, ProduccionInput } from '../models/Produccion';

export function useProduccion() {
  const db = useSQLiteContext();
  const repo = new ProduccionRepository(db);
  const [registros, setRegistros] = useState<Produccion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadByFecha = useCallback(async (fecha: string) => {
    setLoading(true);
    try {
      const data = await repo.getByFecha(fecha);
      setRegistros(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const upsertProduccion = useCallback(async (data: ProduccionInput) => {
    const id = await repo.upsert(data);
    return id;
  }, [db]);

  const getTotalDiario = useCallback(async (fecha: string) => {
    return repo.getTotalByFecha(fecha);
  }, [db]);

  const getTotalMensual = useCallback(async (fechaInicio: string, fechaFin: string) => {
    return repo.getTotalByRango(fechaInicio, fechaFin);
  }, [db]);

  return {
    registros,
    loading,
    loadByFecha,
    upsertProduccion,
    getTotalDiario,
    getTotalMensual,
  };
}
