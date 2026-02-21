import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { IngresoRepository } from '../repositories/IngresoRepository';
import { GastoRepository } from '../repositories/GastoRepository';
import type { Ingreso, IngresoInput } from '../models/Ingreso';
import type { Gasto, GastoInput } from '../models/Gasto';

export function useFinanzas() {
  const db = useSQLiteContext();
  const ingresoRepo = new IngresoRepository(db);
  const gastoRepo = new GastoRepository(db);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIngresos = useCallback(async (fechaInicio: string, fechaFin: string) => {
    setLoading(true);
    try {
      const data = await ingresoRepo.getByRango(fechaInicio, fechaFin);
      setIngresos(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const loadGastos = useCallback(async (fechaInicio: string, fechaFin: string) => {
    setLoading(true);
    try {
      const data = await gastoRepo.getByRango(fechaInicio, fechaFin);
      setGastos(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const createIngreso = useCallback(async (data: IngresoInput) => {
    const id = await ingresoRepo.create(data);
    return id;
  }, [db]);

  const createGasto = useCallback(async (data: GastoInput) => {
    const id = await gastoRepo.create(data);
    return id;
  }, [db]);

  const getTotales = useCallback(async (fechaInicio: string, fechaFin: string) => {
    const [totalIngresos, totalGastos] = await Promise.all([
      ingresoRepo.getTotalByRango(fechaInicio, fechaFin),
      gastoRepo.getTotalByRango(fechaInicio, fechaFin),
    ]);
    return {
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: totalIngresos - totalGastos,
    };
  }, [db]);

  const getGastosPorCategoria = useCallback(async (fechaInicio: string, fechaFin: string) => {
    return gastoRepo.getTotalByCategoria(fechaInicio, fechaFin);
  }, [db]);

  return {
    ingresos,
    gastos,
    loading,
    loadIngresos,
    loadGastos,
    createIngreso,
    createGasto,
    getTotales,
    getGastosPorCategoria,
  };
}
