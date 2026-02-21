import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { AnimalRepository } from '../repositories/AnimalRepository';
import type { Animal, AnimalInput } from '../models/Animal';

export function useAnimales() {
  const db = useSQLiteContext();
  const repo = new AnimalRepository(db);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAnimales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repo.getAll();
      setAnimales(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const loadActivos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repo.getActivos();
      setAnimales(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const loadEnProduccion = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repo.getEnProduccion();
      setAnimales(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const createAnimal = useCallback(async (data: AnimalInput) => {
    const id = await repo.create(data);
    await loadAnimales();
    return id;
  }, [db, loadAnimales]);

  const updateAnimal = useCallback(async (id: string, data: Partial<AnimalInput>) => {
    await repo.update(id, data);
    await loadAnimales();
  }, [db, loadAnimales]);

  const deleteAnimal = useCallback(async (id: string) => {
    await repo.softDelete(id);
    await loadAnimales();
  }, [db, loadAnimales]);

  const getAnimal = useCallback(async (id: string) => {
    return repo.getById(id);
  }, [db]);

  return {
    animales,
    loading,
    loadAnimales,
    loadActivos,
    loadEnProduccion,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimal,
  };
}
