import type { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await createInitialSchema(db);
}

async function createInitialSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS animales (
      id              TEXT PRIMARY KEY,
      codigo          TEXT NOT NULL UNIQUE,
      nombre          TEXT,
      raza            TEXT NOT NULL,
      fecha_nacimiento TEXT,
      sexo            TEXT NOT NULL DEFAULT 'H',
      estado          TEXT NOT NULL DEFAULT 'activo',
      peso_actual     REAL,
      id_madre        TEXT,
      id_padre        TEXT,
      foto_uri        TEXT,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS produccion (
      id              TEXT PRIMARY KEY,
      id_animal       TEXT NOT NULL,
      fecha           TEXT NOT NULL,
      litros_manana   REAL NOT NULL DEFAULT 0,
      litros_tarde    REAL NOT NULL DEFAULT 0,
      total           REAL NOT NULL DEFAULT 0,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (id_animal) REFERENCES animales(id),
      UNIQUE(id_animal, fecha)
    );

    CREATE TABLE IF NOT EXISTS tratamientos (
      id              TEXT PRIMARY KEY,
      id_animal       TEXT NOT NULL,
      fecha           TEXT NOT NULL,
      tipo            TEXT NOT NULL,
      medicamento     TEXT,
      dosis           TEXT,
      costo           REAL DEFAULT 0,
      veterinario     TEXT,
      proxima_fecha   TEXT,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (id_animal) REFERENCES animales(id)
    );

    CREATE TABLE IF NOT EXISTS ingresos (
      id              TEXT PRIMARY KEY,
      fecha           TEXT NOT NULL,
      tipo            TEXT NOT NULL,
      descripcion     TEXT,
      monto           REAL NOT NULL,
      cantidad        REAL,
      precio_unitario REAL,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id              TEXT PRIMARY KEY,
      fecha           TEXT NOT NULL,
      categoria       TEXT NOT NULL,
      descripcion     TEXT,
      monto           REAL NOT NULL,
      proveedor       TEXT,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS potreros (
      id              TEXT PRIMARY KEY,
      nombre          TEXT NOT NULL,
      area            REAL,
      tipo_pasto      TEXT,
      estado          TEXT NOT NULL DEFAULT 'disponible',
      capacidad       INTEGER,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rotacion (
      id                TEXT PRIMARY KEY,
      id_potrero        TEXT NOT NULL,
      fecha_ingreso     TEXT NOT NULL,
      fecha_salida      TEXT,
      numero_animales   INTEGER NOT NULL,
      notas             TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
      synced            INTEGER NOT NULL DEFAULT 0,
      firebase_id       TEXT,
      deleted           INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (id_potrero) REFERENCES potreros(id)
    );

    CREATE TABLE IF NOT EXISTS eventos_reproductivos (
      id              TEXT PRIMARY KEY,
      id_animal       TEXT NOT NULL,
      tipo            TEXT NOT NULL,
      fecha           TEXT NOT NULL,
      id_toro         TEXT,
      pajilla         TEXT,
      resultado       TEXT,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (id_animal) REFERENCES animales(id)
    );

    CREATE INDEX IF NOT EXISTS idx_produccion_fecha ON produccion(fecha);
    CREATE INDEX IF NOT EXISTS idx_produccion_animal ON produccion(id_animal);
    CREATE INDEX IF NOT EXISTS idx_produccion_animal_fecha ON produccion(id_animal, fecha);
    CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
    CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
    CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);
    CREATE INDEX IF NOT EXISTS idx_tratamientos_animal ON tratamientos(id_animal);
    CREATE INDEX IF NOT EXISTS idx_animales_estado ON animales(estado);

    CREATE TABLE IF NOT EXISTS eventos_animal (
      id              TEXT PRIMARY KEY,
      id_animal       TEXT NOT NULL,
      tipo            TEXT NOT NULL,
      fecha           TEXT NOT NULL,
      descripcion     TEXT NOT NULL,
      notas           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 0,
      firebase_id     TEXT,
      deleted         INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (id_animal) REFERENCES animales(id)
    );

    CREATE INDEX IF NOT EXISTS idx_eventos_animal_animal ON eventos_animal(id_animal);
    CREATE INDEX IF NOT EXISTS idx_eventos_animal_fecha ON eventos_animal(fecha);
  `);
}
