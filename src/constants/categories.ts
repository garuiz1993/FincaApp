import { CategoriaGasto, TipoIngreso, EstadoAnimal, TipoTratamiento, TipoEventoAnimal } from '@/types';

export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string; icon: string }[] = [
  { value: 'alimentacion', label: 'Alimentación', icon: 'corn' },
  { value: 'salud', label: 'Salud', icon: 'medical-bag' },
  { value: 'mano_obra', label: 'Mano de Obra', icon: 'account-hard-hat' },
  { value: 'mantenimiento', label: 'Mantenimiento', icon: 'wrench' },
  { value: 'servicios', label: 'Servicios', icon: 'lightning-bolt' },
  { value: 'inversion', label: 'Inversión', icon: 'trending-up' },
  { value: 'otro', label: 'Otro', icon: 'cash-minus' },
];

export const TIPOS_INGRESO: { value: TipoIngreso; label: string; icon: string }[] = [
  { value: 'venta_leche', label: 'Venta de Leche', icon: 'water' },
  { value: 'venta_animal', label: 'Venta de Animal', icon: 'cow' },
  { value: 'venta_subproducto', label: 'Subproducto', icon: 'cheese' },
  { value: 'otro', label: 'Otro Ingreso', icon: 'cash-plus' },
];

export const ESTADOS_ANIMAL: { value: EstadoAnimal; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'produccion', label: 'En Producción' },
  { value: 'seca', label: 'Seca' },
  { value: 'gestante', label: 'Gestante' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'muerto', label: 'Muerto' },
  { value: 'descartado', label: 'Descartado' },
];

export const TIPOS_TRATAMIENTO: { value: TipoTratamiento; label: string }[] = [
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'desparasitacion', label: 'Desparasitación' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'cirugia', label: 'Cirugía' },
];

export const TIPOS_EVENTO_ANIMAL: { value: TipoEventoAnimal; label: string; icon: string }[] = [
  { value: 'vacunacion', label: 'Vacunación', icon: 'needle' },
  { value: 'desparasitacion', label: 'Desparasitación', icon: 'bug' },
  { value: 'tratamiento', label: 'Tratamiento', icon: 'medical-bag' },
  { value: 'revision', label: 'Revisión', icon: 'stethoscope' },
  { value: 'parto', label: 'Parto', icon: 'baby-carriage' },
  { value: 'otro', label: 'Otro', icon: 'clipboard-text' },
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
