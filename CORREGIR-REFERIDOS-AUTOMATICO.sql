-- ============================================================================
-- 🔧 CORRECCIÓN AUTOMÁTICA DE PUNTOS DE REFERIDO
-- Otorga 50 puntos a todos los referentes que no los recibieron
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASO 1: IDENTIFICAR CASOS QUE NECESITAN CORRECCIÓN
-- ----------------------------------------------------------------------------

SELECT 
  '=== CASOS A CORREGIR ===' as '';

-- Ver usuarios referidos con primer comprobante aprobado pero sin puntos otorgados al referente
SELECT 
  u.id as referido_id,
  u.nombre_completo as referido_nombre,
  u.referido_por_id as referente_id,
  ref.nombre_completo as referente_nombre,
  ref.puntos_acumulados as puntos_actuales_referente,
  (SELECT COUNT(*) FROM comprobantes WHERE usuario_id = u.id AND estado = 'aprobado') as comprobantes_aprobados,
  (SELECT COUNT(*) FROM historial_puntos WHERE usuario_id = u.referido_por_id AND tipo_transaccion = 'GANANCIA_REFERIDO' AND referido_que_genero_id = u.id) as ya_tiene_puntos_referido
FROM usuarios u
INNER JOIN usuarios ref ON u.referido_por_id = ref.id
WHERE u.referido_por_id IS NOT NULL
  AND (SELECT COUNT(*) FROM comprobantes WHERE usuario_id = u.id AND estado = 'aprobado') > 0
  AND (SELECT COUNT(*) FROM historial_puntos WHERE usuario_id = u.referido_por_id AND tipo_transaccion = 'GANANCIA_REFERIDO' AND referido_que_genero_id = u.id) = 0
ORDER BY u.id;

-- ----------------------------------------------------------------------------
-- PASO 2: APLICAR CORRECCIÓN AUTOMÁTICA
-- ----------------------------------------------------------------------------

-- Otorgar 50 puntos a todos los referentes afectados
UPDATE usuarios ref
INNER JOIN usuarios u ON u.referido_por_id = ref.id
SET ref.puntos_acumulados = ref.puntos_acumulados + 50
WHERE u.referido_por_id IS NOT NULL
  AND (SELECT COUNT(*) FROM comprobantes WHERE usuario_id = u.id AND estado = 'aprobado') > 0
  AND (SELECT COUNT(*) FROM historial_puntos WHERE usuario_id = ref.id AND tipo_transaccion = 'GANANCIA_REFERIDO' AND referido_que_genero_id = u.id) = 0;

SELECT 
  CONCAT('✅ Puntos otorgados a ', ROW_COUNT(), ' referentes') as resultado;

-- ----------------------------------------------------------------------------
-- PASO 3: REGISTRAR EN HISTORIAL
-- ----------------------------------------------------------------------------

-- Insertar registros en historial_puntos para cada corrección
INSERT INTO historial_puntos (
  usuario_id,
  tipo_transaccion,
  puntos_movimiento,
  descripcion_detalle,
  referido_que_genero_id,
  fecha_transaccion
)
SELECT 
  u.referido_por_id as usuario_id,
  'GANANCIA_REFERIDO' as tipo_transaccion,
  50 as puntos_movimiento,
  CONCAT('Bonificación por primera compra de referido (corrección automática) - ', u.nombre_completo) as descripcion_detalle,
  u.id as referido_que_genero_id,
  NOW() as fecha_transaccion
FROM usuarios u
WHERE u.referido_por_id IS NOT NULL
  AND (SELECT COUNT(*) FROM comprobantes WHERE usuario_id = u.id AND estado = 'aprobado') > 0
  AND (SELECT COUNT(*) FROM historial_puntos WHERE usuario_id = u.referido_por_id AND tipo_transaccion = 'GANANCIA_REFERIDO' AND referido_que_genero_id = u.id) = 0;

SELECT 
  CONCAT('✅ Registros creados en historial: ', ROW_COUNT()) as resultado;

-- ----------------------------------------------------------------------------
-- PASO 4: VERIFICAR RESULTADOS
-- ----------------------------------------------------------------------------

SELECT 
  '=== VERIFICACIÓN POST-CORRECCIÓN ===' as '';

-- Ver referentes que recibieron puntos
SELECT 
  ref.id as referente_id,
  ref.nombre_completo as referente_nombre,
  ref.puntos_acumulados as puntos_totales,
  COUNT(DISTINCT u.id) as referidos_que_compraron,
  SUM(50) as puntos_de_referidos
FROM usuarios ref
INNER JOIN usuarios u ON u.referido_por_id = ref.id
INNER JOIN comprobantes c ON c.usuario_id = u.id AND c.estado = 'aprobado'
GROUP BY ref.id, ref.nombre_completo, ref.puntos_acumulados
ORDER BY referidos_que_compraron DESC;

-- Ver historial de puntos de referidos
SELECT 
  hp.id,
  hp.usuario_id,
  u.nombre_completo as referente_nombre,
  hp.puntos_movimiento,
  hp.descripcion_detalle,
  hp.fecha_transaccion
FROM historial_puntos hp
INNER JOIN usuarios u ON hp.usuario_id = u.id
WHERE hp.tipo_transaccion = 'GANANCIA_REFERIDO'
ORDER BY hp.fecha_transaccion DESC
LIMIT 20;

-- ============================================================================
-- ✅ CORRECCIÓN COMPLETADA
-- ============================================================================

-- RESUMEN:
-- - Identificó usuarios referidos con comprobantes aprobados
-- - Otorgó 50 puntos a referentes que no los habían recibido
-- - Registró movimientos en historial_puntos
-- - Evitó duplicados verificando historial existente

-- ============================================================================
