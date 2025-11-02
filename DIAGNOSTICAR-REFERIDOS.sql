-- ============================================================================
-- 🔍 DIAGNÓSTICO DEL SISTEMA DE REFERIDOS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VERIFICAR CONFIGURACIÓN
-- ----------------------------------------------------------------------------

SELECT '=== CONFIGURACIÓN DE REFERIDOS ===' as '';
SELECT * FROM configuracion_referidos WHERE id = 1;

-- ----------------------------------------------------------------------------
-- 2. VERIFICAR ESTRUCTURA DE TABLAS
-- ----------------------------------------------------------------------------

SELECT '=== VERIFICAR TABLA USUARIOS ===' as '';
DESCRIBE usuarios;

SELECT '=== VERIFICAR TABLA COMPRAS ===' as '';
DESCRIBE compras;

-- ----------------------------------------------------------------------------
-- 3. BUSCAR USUARIOS CON REFERIDOS
-- ----------------------------------------------------------------------------

SELECT '=== USUARIOS CON REFERENTE (referido_por_id) ===' as '';
SELECT 
  u.id,
  u.nombre_completo,
  u.email,
  u.referido_por_id,
  u.puntos_acumulados,
  ref.nombre_completo as referente_nombre,
  ref.puntos_acumulados as referente_puntos
FROM usuarios u
LEFT JOIN usuarios ref ON u.referido_por_id = ref.id
WHERE u.referido_por_id IS NOT NULL
LIMIT 10;

-- ----------------------------------------------------------------------------
-- 4. VERIFICAR COMPRAS VERIFICADAS
-- ----------------------------------------------------------------------------

SELECT '=== COMPRAS VERIFICADAS POR USUARIO ===' as '';
SELECT 
  c.cliente_id,
  u.nombre_completo,
  COUNT(*) as total_compras,
  SUM(c.monto) as monto_total
FROM compras c
INNER JOIN usuarios u ON c.cliente_id = u.id
WHERE c.verificado = TRUE
GROUP BY c.cliente_id, u.nombre_completo
ORDER BY total_compras DESC;

-- ----------------------------------------------------------------------------
-- 5. VERIFICAR HISTORIAL DE PUNTOS POR REFERIDOS
-- ----------------------------------------------------------------------------

SELECT '=== HISTORIAL DE PUNTOS POR REFERIDOS ===' as '';
SELECT 
  hp.id,
  hp.usuario_id,
  u.nombre_completo,
  hp.tipo_transaccion,
  hp.puntos_movimiento,
  hp.descripcion_detalle,
  hp.fecha_transaccion
FROM historial_puntos hp
INNER JOIN usuarios u ON hp.usuario_id = u.id
WHERE hp.tipo_transaccion = 'GANANCIA_REFERIDO'
ORDER BY hp.fecha_transaccion DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- 6. CASO ESPECÍFICO: Usuario que fue referido
-- ----------------------------------------------------------------------------

SELECT '=== ANÁLISIS DEL CASO ESPECÍFICO ===' as '';

-- Buscar el usuario referido que tuvo una compra aprobada
SELECT 
  u.id as referido_id,
  u.nombre_completo as referido_nombre,
  u.referido_por_id,
  ref.nombre_completo as referente_nombre,
  ref.puntos_acumulados as puntos_referente,
  COUNT(c.id) as total_compras_verificadas
FROM usuarios u
LEFT JOIN usuarios ref ON u.referido_por_id = ref.id
LEFT JOIN compras c ON c.cliente_id = u.id AND c.verificado = TRUE
WHERE u.referido_por_id IS NOT NULL
GROUP BY u.id, u.nombre_completo, u.referido_por_id, ref.nombre_completo, ref.puntos_acumulados
HAVING total_compras_verificadas > 0
ORDER BY u.created_at DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- 7. VERIFICAR SI EXISTE LA COLUMNA verificado EN compras
-- ----------------------------------------------------------------------------

SELECT '=== VERIFICAR COLUMNA verificado ===' as '';
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'compras' 
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'verificado';

-- ============================================================================
-- ✅ FIN DEL DIAGNÓSTICO
-- ============================================================================
