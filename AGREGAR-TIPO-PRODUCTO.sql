-- ============================================================================
-- 🛒 AGREGAR TIPO DE PRODUCTO Y NÚMERO DE SERIE A COMPROBANTES
-- ============================================================================

-- Agregar columnas a la tabla comprobantes
ALTER TABLE comprobantes
ADD COLUMN tipo_producto ENUM('filamento', 'impresora_3d', 'otros') DEFAULT 'otros' AFTER monto,
ADD COLUMN numero_serie VARCHAR(100) NULL AFTER tipo_producto,
ADD COLUMN marca_modelo VARCHAR(200) NULL AFTER numero_serie;

-- Índice para búsquedas por tipo
ALTER TABLE comprobantes
ADD INDEX idx_tipo_producto (tipo_producto);

-- Índice para búsquedas por número de serie
ALTER TABLE comprobantes
ADD INDEX idx_numero_serie (numero_serie);

-- Verificar estructura
DESCRIBE comprobantes;

-- Ver columnas agregadas
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'comprobantes'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('tipo_producto', 'numero_serie', 'marca_modelo');

-- ============================================================================
-- ✅ COLUMNAS AGREGADAS
-- ============================================================================
-- tipo_producto: 'filamento', 'impresora_3d', 'otros'
-- numero_serie: Número de serie de impresora (opcional)
-- marca_modelo: Marca y modelo (opcional)
-- ============================================================================
