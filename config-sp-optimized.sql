-- Versión mejorada: No elimina registros, solo inserta o actualiza si es necesario
-- Esto es mucho más rápido porque:
-- 1. No borra todo
-- 2. Detecta cambios y actualiza solo lo necesario
-- 3. Ignora duplicados

CREATE OR REPLACE PROCEDURE public.sp_insert_tarifas_bulk(IN p_data jsonb)
 LANGUAGE plpgsql
AS $procedure$
BEGIN
    INSERT INTO tarifas_energia (
        anio,
        periodo,
        comercializadora,
        nivel,
        cu_total,
        created_at
    )
    SELECT
        (r.a_o)::INT                AS anio,
        r.periodo                  AS periodo,
        r.operador_de_red           AS comercializadora,
        r.nivel                     AS nivel,
        (r.cu_total)::NUMERIC       AS cu_total,
        CURRENT_TIMESTAMP           AS created_at
    FROM jsonb_to_recordset(p_data) AS r(
        a_o TEXT,
        periodo TEXT,
        operador_de_red TEXT,
        nivel TEXT,
        cu_total TEXT
    )
    ON CONFLICT (anio, periodo, comercializadora, nivel) 
    DO UPDATE SET
        cu_total = EXCLUDED.cu_total,
        created_at = CURRENT_TIMESTAMP
    WHERE tarifas_energia.cu_total IS DISTINCT FROM EXCLUDED.cu_total;
END;
$procedure$;
