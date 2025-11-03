-- ============================================================================
-- Script para agregar sistema de referidos a comprobantes
-- Laboratorio 3D - Sistema de Puntos
-- ============================================================================

-- Agregar campos de referido a la tabla de comprobantes
-- Ejecutar uno por uno si hay error

-- 1. Agregar referido_por_id
ALTER TABLE comprobantes 
ADD COLUMN IF NOT EXISTS referido_por_id INT NULL COMMENT 'Usuario que recomendó y cargó el comprobante';

-- 2. Agregar nombre_comprador
ALTER TABLE comprobantes 
ADD COLUMN IF NOT EXISTS nombre_comprador VARCHAR(100) NULL COMMENT 'Nombre del comprador referido';

-- 3. Agregar dni_comprador
ALTER TABLE comprobantes 
ADD COLUMN IF NOT EXISTS dni_comprador VARCHAR(20) NULL COMMENT 'DNI del comprador referido (opcional)';

-- 4. Agregar índice (solo si no existe)
ALTER TABLE comprobantes 
ADD INDEX IF NOT EXISTS idx_referido (referido_por_id);

-- Agregar foreign key
ALTER TABLE comprobantes
ADD CONSTRAINT fk_comprobante_referido 
FOREIGN KEY (referido_por_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Ya están comentados en el ALTER TABLE inicial

-- ============================================================================
-- Vista para ver comprobantes con referidos
-- ============================================================================

CREATE OR REPLACE VIEW comprobantes_con_referidos AS
SELECT 
  c.id,
  c.usuario_id,
  u.nombreCompleto as usuario_nombre,
  c.monto,
  c.descripcion,
  c.estado,
  c.puntos_otorgados,
  c.referido_por_id,
  r.nombreCompleto as referidor_nombre,
  r.email as referidor_email,
  c.nombre_comprador,
  c.dni_comprador,
  c.fecha_carga
FROM comprobantes c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN usuarios r ON c.referido_por_id = r.id
WHERE c.referido_por_id IS NOT NULL
ORDER BY c.fecha_carga DESC;

-- ============================================================================
-- Estadísticas de referidos
-- ============================================================================

CREATE OR REPLACE VIEW estadisticas_referidos AS
SELECT 
  u.id as usuario_id,
  u.nombreCompleto as nombre,
  u.email,
  u.codigoReferido as codigo_referido,
  COUNT(c.id) as total_comprobantes_referidos,
  SUM(CASE WHEN c.estado = 'aprobado' THEN c.monto ELSE 0 END) as monto_total_aprobado,
  SUM(CASE WHEN c.estado = 'aprobado' THEN c.puntos_otorgados ELSE 0 END) as puntos_generados
FROM usuarios u
LEFT JOIN comprobantes c ON c.referido_por_id = u.id
GROUP BY u.id, u.nombreCompleto, u.email, u.codigoReferido
HAVING total_comprobantes_referidos > 0
ORDER BY total_comprobantes_referidos DESC;

-- ============================================================================
-- Fin del script
-- ============================================================================
