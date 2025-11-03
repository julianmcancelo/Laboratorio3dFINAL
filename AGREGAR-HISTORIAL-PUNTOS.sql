-- ============================================================================
-- Script para crear tabla de historial de puntos
-- Laboratorio 3D - Sistema de Puntos
-- ============================================================================

-- Crear tabla de historial de puntos
CREATE TABLE IF NOT EXISTS historial_puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL COMMENT 'comprobante, bonus_referido, canje, ajuste_manual, bono_bienvenida, etc',
  puntos INT NOT NULL COMMENT 'Puede ser positivo (suma) o negativo (resta)',
  descripcion TEXT,
  comprobante_id INT NULL,
  canje_id INT NULL,
  admin_id INT NULL COMMENT 'ID del admin si fue un ajuste manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usuario (usuario_id),
  INDEX idx_tipo (tipo),
  INDEX idx_fecha (created_at),
  INDEX idx_comprobante (comprobante_id),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Migrar datos históricos de comprobantes aprobados
-- ============================================================================

-- Insertar movimientos de comprobantes aprobados
INSERT INTO historial_puntos (usuario_id, tipo, puntos, descripcion, comprobante_id, created_at)
SELECT 
  usuario_id,
  'comprobante' as tipo,
  puntos_otorgados as puntos,
  CONCAT('Comprobante aprobado - ', descripcion) as descripcion,
  id as comprobante_id,
  COALESCE(fecha_validacion, created_at) as created_at
FROM comprobantes
WHERE estado = 'aprobado' 
  AND puntos_otorgados > 0
  AND NOT EXISTS (
    SELECT 1 FROM historial_puntos hp 
    WHERE hp.comprobante_id = comprobantes.id 
    AND hp.tipo = 'comprobante'
  );

-- ============================================================================
-- Migrar bonos de bienvenida (500 puntos iniciales)
-- ============================================================================

-- Detectar usuarios que tienen 500 puntos o más y probablemente recibieron bono
INSERT INTO historial_puntos (usuario_id, tipo, puntos, descripcion, created_at)
SELECT 
  u.id as usuario_id,
  'bono_bienvenida' as tipo,
  500 as puntos,
  'Bono de bienvenida por registro' as descripcion,
  u.created_at
FROM usuarios u
WHERE NOT EXISTS (
  SELECT 1 FROM historial_puntos hp 
  WHERE hp.usuario_id = u.id 
  AND hp.tipo = 'bono_bienvenida'
)
AND u.created_at IS NOT NULL;

-- ============================================================================
-- Detectar y registrar bonos de referidos históricos
-- ============================================================================

-- Registrar bonos de referidos que se aplicaron en comprobantes
INSERT INTO historial_puntos (usuario_id, tipo, puntos, descripcion, comprobante_id, created_at)
SELECT 
  c.referido_por_id as usuario_id,
  'bonus_referido' as tipo,
  50 as puntos,
  CONCAT('Bonus por referir a ', COALESCE(c.nombre_comprador, 'comprador'), ' - Compra: $', FORMAT(c.monto, 2)) as descripcion,
  c.id as comprobante_id,
  COALESCE(c.fecha_validacion, c.created_at) as created_at
FROM comprobantes c
WHERE c.referido_por_id IS NOT NULL
  AND c.estado = 'aprobado'
  AND c.monto >= 500000
  AND NOT EXISTS (
    SELECT 1 FROM historial_puntos hp 
    WHERE hp.comprobante_id = c.id 
    AND hp.tipo = 'bonus_referido'
  );

-- ============================================================================
-- Vistas útiles para reportes
-- ============================================================================

-- Vista de resumen de puntos por usuario
CREATE OR REPLACE VIEW resumen_puntos_usuario AS
SELECT 
  u.id as usuario_id,
  u.nombreCompleto as nombre,
  u.email,
  u.puntos_acumulados as puntos_actuales,
  COUNT(hp.id) as total_movimientos,
  SUM(CASE WHEN hp.puntos > 0 THEN hp.puntos ELSE 0 END) as total_ganados,
  SUM(CASE WHEN hp.puntos < 0 THEN ABS(hp.puntos) ELSE 0 END) as total_gastados,
  SUM(CASE WHEN hp.tipo = 'bonus_referido' THEN hp.puntos ELSE 0 END) as puntos_por_referidos,
  SUM(CASE WHEN hp.tipo = 'comprobante' THEN hp.puntos ELSE 0 END) as puntos_por_comprobantes,
  SUM(CASE WHEN hp.tipo = 'canje' THEN ABS(hp.puntos) ELSE 0 END) as puntos_canjeados
FROM usuarios u
LEFT JOIN historial_puntos hp ON u.id = hp.usuario_id
GROUP BY u.id, u.nombreCompleto, u.email, u.puntos_acumulados;

-- Vista de historial completo con detalles
CREATE OR REPLACE VIEW historial_completo AS
SELECT 
  hp.id,
  hp.usuario_id,
  u.nombreCompleto as usuario_nombre,
  hp.tipo,
  hp.puntos,
  hp.descripcion,
  hp.comprobante_id,
  c.monto as comprobante_monto,
  c.nombre_comprador,
  hp.created_at
FROM historial_puntos hp
LEFT JOIN usuarios u ON hp.usuario_id = u.id
LEFT JOIN comprobantes c ON hp.comprobante_id = c.id
ORDER BY hp.created_at DESC;

-- ============================================================================
-- Procedimiento para verificar consistencia de puntos
-- ============================================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS verificar_consistencia_puntos()
BEGIN
  SELECT 
    u.id,
    u.nombreCompleto,
    u.puntos_acumulados as puntos_sistema,
    COALESCE(SUM(hp.puntos), 0) as puntos_historial,
    (u.puntos_acumulados - COALESCE(SUM(hp.puntos), 0)) as diferencia
  FROM usuarios u
  LEFT JOIN historial_puntos hp ON u.id = hp.usuario_id
  GROUP BY u.id, u.nombreCompleto, u.puntos_acumulados
  HAVING ABS(diferencia) > 0
  ORDER BY ABS(diferencia) DESC;
END$$

DELIMITER ;

-- ============================================================================
-- Fin del script
-- ============================================================================

-- Para ejecutar la verificación, usa:
-- CALL verificar_consistencia_puntos();
