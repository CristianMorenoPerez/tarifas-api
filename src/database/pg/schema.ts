import {
  pgTable,
  uuid,
  text,
  integer,
  uniqueIndex,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

export const tarifasEnergia = pgTable(
  'tarifas_energia',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    anio: integer('anio').notNull(),
    periodo: text('periodo').notNull(),
    comercializadora: text('comercializadora').notNull(),
    nivel: text('nivel').notNull(),
    cuTotal: numeric('cu_total', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('tarifas_energia_anio_periodo_comercializadora_nivel').on(
      t.anio,
      t.periodo,
      t.comercializadora,
      t.nivel,
    ),
  ],
);

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const etlRuns = pgTable('etl_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  totalRegistros: integer('total_registros').notNull(),
  duracionMs: integer('duracion_ms').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
