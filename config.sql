CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tarifas_energia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anio INT NOT NULL,
  periodo TEXT NOT NULL,
  comercializadora TEXT NOT NULL,
  nivel TEXT NOT NULL,
  cu_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS tarifas_energia_anio_periodo_comercializadora_nivel
  ON tarifas_energia (anio, periodo, comercializadora, nivel);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etl_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_registros INT NOT NULL,
  duracion_ms INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE PROCEDURE sp_insert_tarifas_bulk(payload jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO tarifas_energia (anio, periodo, comercializadora, nivel, cu_total)
  SELECT
    (elem->>'a_o')::int,
    (elem->>'periodo')::text,
    (elem->>'operador_de_red')::text,
    (elem->>'nivel')::text,
    (elem->>'cu_total')::numeric(10,2)
  FROM jsonb_array_elements(payload) AS elem
  ON CONFLICT (anio, periodo, comercializadora, nivel) DO NOTHING;
END;
$$;
