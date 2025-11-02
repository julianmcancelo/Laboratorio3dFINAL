-- ============================================================================
-- 🎁 IMPLEMENTACIÓN COMPLETA DEL SISTEMA DE REFERIDOS
-- Laboratorio 3D - Programa de Puntos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASO 1: CREAR TABLA DE CUPONES (OPCIONAL - No se usa para Tienda Nube)
-- ----------------------------------------------------------------------------
-- NOTA: Los cupones de $25.000 se gestionan desde TIENDA NUBE
-- Esta tabla es opcional, por si quieres gestionar otros cupones internos

CREATE TABLE IF NOT EXISTS cupones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'referido',
  monto_descuento DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  usado BOOLEAN DEFAULT FALSE,
  fecha_uso DATETIME NULL,
  compra_id INT NULL,
  valido_desde DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valido_hasta DATETIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_cupon_usuario 
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_cupon_compra
    FOREIGN KEY (compra_id)
    REFERENCES compras(id)
    ON DELETE SET NULL,
    
  INDEX idx_usuario (usuario_id),
  INDEX idx_codigo (codigo),
  INDEX idx_usado (usado),
  INDEX idx_valido (valido_desde, valido_hasta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- PASO 2: CONFIGURAR SISTEMA DE REFERIDOS
-- ----------------------------------------------------------------------------

-- Actualizar configuración (50 puntos por primera compra del referido)
INSERT INTO configuracion_referidos 
  (id, porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo) 
VALUES 
  (1, 0.00, 50, TRUE)
ON DUPLICATE KEY UPDATE
  puntos_fijos_primera_compra = 50,
  sistema_comision_activo = TRUE;

-- ----------------------------------------------------------------------------
-- PASO 3: AGREGAR COLUMNA PARA TRACKING DE CUPÓN DE TIENDA NUBE
-- ----------------------------------------------------------------------------

-- Agregar columna para marcar si ya se entregó el cupón de $25.000 en Tienda Nube
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cupon_bienvenida_entregado BOOLEAN DEFAULT FALSE
COMMENT 'Indica si ya se entregó el cupón de $25.000 en Tienda Nube';

-- ----------------------------------------------------------------------------
-- PASO 4: VERIFICAR ESTRUCTURA DE TABLAS NECESARIAS
-- ----------------------------------------------------------------------------

-- Verificar que usuarios tenga la columna referido_por_id
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'usuarios' 
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('referido_por_id', 'codigo_referido', 'puntos_acumulados');

-- Verificar que compras tenga verificado
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'compras' 
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('cliente_id', 'verificado', 'monto');

-- ----------------------------------------------------------------------------
-- 📊 VERIFICAR IMPLEMENTACIÓN
-- ----------------------------------------------------------------------------

-- Ver configuración de referidos
SELECT * FROM configuracion_referidos WHERE id = 1;

-- Ver estructura de tabla cupones
DESCRIBE cupones;

-- Verificar usuarios con códigos de referido
SELECT 
  id,
  nombre_completo,
  codigo_referido,
  referido_por_id,
  puntos_acumulados
FROM usuarios
WHERE codigo_referido IS NOT NULL
LIMIT 5;

-- ============================================================================
-- ✅ SISTEMA DE REFERIDOS IMPLEMENTADO
-- ============================================================================

-- FUNCIONALIDADES AUTOMÁTICAS:
-- 1. ✅ Tracking de referidos en BD
-- 2. ✅ Configuración establecida: 50 puntos por primera compra
-- 3. ✅ Al registrarse con código → Se guarda referido_por_id
-- 4. ✅ Al aprobar primer comprobante → 50 puntos al referente automáticamente
-- 5. ✅ Columna de tracking para cupones de Tienda Nube

-- FLUJO DE CUPÓN DE $25.000 (TIENDA NUBE):
-- 1. Usuario se registra con código de referido
-- 2. Admin ve lista de "Referidos Pendientes" en /admin/referidos-pendientes
-- 3. Admin crea cupón de $25.000 en TIENDA NUBE manualmente
-- 4. Admin envía cupón al usuario (email, whatsapp, etc.)
-- 5. Admin marca en el sistema como "entregado"
-- 6. Usuario ya no aparece en lista de pendientes

-- ENDPOINTS DISPONIBLES:
-- GET  /api/admin/referidos-pendientes → Ver quién necesita cupón
-- POST /api/admin/referidos-pendientes → Marcar cupón como entregado

-- ============================================================================
