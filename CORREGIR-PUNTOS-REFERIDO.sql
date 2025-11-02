-- ============================================================================
-- 🔧 CORREGIR PUNTOS DE REFERIDO NO OTORGADOS
-- ============================================================================
-- Este script otorga manualmente los 50 puntos al referente
-- en casos donde el sistema falló por el bug corregido

-- ----------------------------------------------------------------------------
-- PASO 1: IDENTIFICAR EL CASO
-- ----------------------------------------------------------------------------

-- Ver usuarios que fueron referidos y tienen comprobantes aprobados
SELECT 
  u.id as referido_id,
  u.nombre_completo as referido_nombre,
  u.email as referido_email,
  u.referido_por_id as referente_id,
  ref.nombre_completo as referente_nombre,
  ref.email as referente_email,
  ref.puntos_acumulados as puntos_actuales_referente,
  COUNT(c.id) as comprobantes_aprobados
FROM usuarios u
INNER JOIN usuarios ref ON u.referido_por_id = ref.id
LEFT JOIN comprobantes c ON c.usuario_id = u.id AND c.estado = 'aprobado'
WHERE u.referido_por_id IS NOT NULL
GROUP BY u.id, u.nombre_completo, u.email, u.referido_por_id, 
         ref.nombre_completo, ref.email, ref.puntos_acumulados
HAVING comprobantes_aprobados > 0
ORDER BY u.id DESC;

-- ----------------------------------------------------------------------------
-- PASO 2: VERIFICAR SI YA SE OTORGARON LOS PUNTOS
-- ----------------------------------------------------------------------------

-- Ver si ya existe registro de puntos de referido
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
ORDER BY hp.fecha_transaccion DESC;

-- ----------------------------------------------------------------------------
-- PASO 3: OTORGAR PUNTOS MANUALMENTE (SI ES NECESARIO)
-- ----------------------------------------------------------------------------

-- ⚠️ IMPORTANTE: Reemplaza estos valores con los IDs correctos
-- Ejemplo: Si el referente es el ID 5, reemplaza el 999

-- Verificar datos antes de ejecutar
SELECT 
  id,
  nombre_completo,
  puntos_acumulados
FROM usuarios 
WHERE id = 999; -- ← CAMBIAR por ID del REFERENTE

-- Otorgar 50 puntos al referente
UPDATE usuarios 
SET puntos_acumulados = puntos_acumulados + 50 
WHERE id = 999; -- ← CAMBIAR por ID del REFERENTE

-- Registrar en historial
INSERT INTO historial_puntos (
  usuario_id,
  tipo_transaccion,
  puntos_movimiento,
  descripcion_detalle,
  referido_que_genero_id,
  fecha_transaccion
) VALUES (
  999,  -- ← CAMBIAR por ID del REFERENTE
  'GANANCIA_REFERIDO',
  50,
  'Bonificación por primera compra de referido (corrección manual)',
  888,  -- ← CAMBIAR por ID del REFERIDO
  NOW()
);

-- Verificar que se aplicaron correctamente
SELECT 
  id,
  nombre_completo,
  puntos_acumulados
FROM usuarios 
WHERE id = 999; -- ← CAMBIAR por ID del REFERENTE

-- ----------------------------------------------------------------------------
-- PASO 4: VERIFICAR EN HISTORIAL
-- ----------------------------------------------------------------------------

SELECT * FROM historial_puntos 
WHERE usuario_id = 999  -- ← CAMBIAR por ID del REFERENTE
ORDER BY fecha_transaccion DESC 
LIMIT 5;

-- ============================================================================
-- ✅ PUNTOS CORREGIDOS
-- ============================================================================

-- PRÓXIMOS PASOS:
-- 1. El bug ya fue corregido en el código (src/lib/cupones.ts)
-- 2. Ahora busca en tabla 'comprobantes' en lugar de 'compras'
-- 3. Tiene logs detallados para debugging
-- 4. Las próximas aprobaciones funcionarán automáticamente

-- ============================================================================
