-- ============================================================================
-- ⚡ CORRECCIÓN RÁPIDA DE REFERIDOS - UNA SOLA EJECUCIÓN
-- ============================================================================
-- Ejecuta todo en una sola transacción

START TRANSACTION;

-- 1. Otorgar puntos a referentes (usando subquery para evitar duplicados)
UPDATE usuarios ref
INNER JOIN usuarios u ON u.referido_por_id = ref.id
SET ref.puntos_acumulados = ref.puntos_acumulados + 50
WHERE u.referido_por_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM comprobantes c 
    WHERE c.usuario_id = u.id 
      AND c.estado = 'aprobado'
  )
  AND NOT EXISTS (
    SELECT 1 FROM historial_puntos hp 
    WHERE hp.usuario_id = ref.id 
      AND hp.tipo_transaccion = 'GANANCIA_REFERIDO' 
      AND hp.referido_que_genero_id = u.id
  );

-- 2. Registrar en historial
INSERT INTO historial_puntos (
  usuario_id,
  tipo_transaccion,
  puntos_movimiento,
  descripcion_detalle,
  referido_que_genero_id
)
SELECT 
  u.referido_por_id,
  'GANANCIA_REFERIDO',
  50,
  CONCAT('Bonificación referido: ', u.nombre_completo),
  u.id
FROM usuarios u
WHERE u.referido_por_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM comprobantes c 
    WHERE c.usuario_id = u.id 
      AND c.estado = 'aprobado'
  )
  AND NOT EXISTS (
    SELECT 1 FROM historial_puntos hp 
    WHERE hp.usuario_id = u.referido_por_id 
      AND hp.tipo_transaccion = 'GANANCIA_REFERIDO' 
      AND hp.referido_que_genero_id = u.id
  );

COMMIT;

-- Verificar cuántos se corrigieron
SELECT 
  COUNT(DISTINCT hp.usuario_id) as referentes_corregidos,
  SUM(hp.puntos_movimiento) as total_puntos_otorgados
FROM historial_puntos hp
WHERE hp.tipo_transaccion = 'GANANCIA_REFERIDO'
  AND DATE(hp.fecha_transaccion) = CURDATE();
