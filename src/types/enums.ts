// Estados del animal
export type EstadoAnimal = 'activo' | 'produccion' | 'seca' | 'gestante' | 'vendido' | 'muerto' | 'descartado';

// Sexo del animal
export type Sexo = 'H' | 'M';

// Tipos de tratamiento
export type TipoTratamiento = 'vacuna' | 'desparasitacion' | 'tratamiento' | 'cirugia';

// Tipos de ingreso
export type TipoIngreso = 'venta_leche' | 'venta_animal' | 'venta_subproducto' | 'otro';

// Categorías de gasto
export type CategoriaGasto =
  | 'alimentacion'
  | 'salud'
  | 'mano_obra'
  | 'mantenimiento'
  | 'servicios'
  | 'inversion'
  | 'otro';

// Estado del potrero
export type EstadoPotrero = 'disponible' | 'en_uso' | 'en_descanso' | 'mantenimiento';

// Tipos de evento reproductivo
export type TipoEventoReproductivo =
  | 'celo'
  | 'monta'
  | 'inseminacion'
  | 'confirmacion_prenez'
  | 'parto'
  | 'aborto';

// Resultado de evento reproductivo
export type ResultadoEvento = 'positivo' | 'negativo' | 'pendiente';

// Roles de usuario
export type RolUsuario = 'propietario' | 'administrador' | 'trabajador';

// Estado de sincronización
export type SyncStatus = 'synced' | 'pending' | 'error';
