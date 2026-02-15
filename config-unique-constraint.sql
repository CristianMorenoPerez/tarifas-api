-- Ejecuta esto PRIMERO si la tabla no tiene constraint único
-- Esto es obligatorio para que el ON CONFLICT funcione

ALTER TABLE tarifas_energia
ADD CONSTRAINT uk_tarifas_unica UNIQUE (anio, periodo, comercializadora, nivel);

-- Luego ejecuta el SP optimizado del archivo config-sp-optimized.sql
