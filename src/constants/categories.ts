import { CategoriaGasto, TipoIngreso, EstadoAnimal, TipoTratamiento } from '@/types';

export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string }[] = [
  { value: 'alimentacion', label: 'Alimentaci\u00f3n' },
  { value: 'salud', label: 'Salud / Medicamentos' },
  { value: 'mano_obra', label: 'Mano de Obra' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'inversion', label: 'Inversi\u00f3n' },
  { value: 'otro', label: 'Otro' },
];

export const TIPOS_INGRESO: { value: TipoIngreso; label: string }[] = [
  { value: 'venta_leche', label: 'Venta de Leche' },
  { value: 'venta_animal', label: 'Venta de Animal' },
  { value: 'venta_subproducto', label: 'Venta de Subproducto' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADOS_ANIMAL: { value: EstadoAnimal; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'produccion', label: 'En Producci\u00f3n' },
  { value: 'seca', label: 'Seca' },
  { value: 'gestante', label: 'Gestante' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'muerto', label: 'Muerto' },
  { value: 'descartado', label: 'Descartado' },
];

export const TIPOS_TRATAMIENTO: { value: TipoTratamiento; label: string }[] = [
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'desparasitacion', label: 'Desparasitaci\u00f3n' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'cirugia', label: 'Cirug\u00eda' },
];

export const RAZAS_GANADO = [
  'Holstein',
  'Jersey',
  'Pardo Suizo',
  'Guernsey',
  'Ayrshire',
  'Gyr',
  'Girolando',
  'Brahman',
  'Normando',
  'Simmental',
  'Criolla',
  'Mestiza',
  'Otra',
];
