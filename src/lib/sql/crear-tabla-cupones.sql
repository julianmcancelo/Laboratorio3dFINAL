-- ============================================================================
-- 🎟️ TABLA DE CUPONES PARA SISTEMA DE REFERIDOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cupones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'referido', -- 'referido', 'promocion', 'regalo'
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
  
  -- Foreign Keys
  CONSTRAINT fk_cupon_usuario 
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_cupon_compra
    FOREIGN KEY (compra_id)
    REFERENCES compras(id)
    ON DELETE SET NULL,
    
  -- Índices para mejorar consultas
  INDEX idx_usuario (usuario_id),
  INDEX idx_codigo (codigo),
  INDEX idx_usado (usado),
  INDEX idx_valido (valido_desde, valido_hasta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 📊 INSERTAR CONFIGURACIÓN DE REFERIDOS
-- ============================================================================

-- Actualizar o insertar configuración de referidos
INSERT INTO configuracion_referidos 
  (id, porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo) 
VALUES 
  (1, 0.00, 50, TRUE)
ON DUPLICATE KEY UPDATE
  puntos_fijos_primera_compra = 50,
  sistema_comision_activo = TRUE;

-- ============================================================================
-- ✅ TABLA CREADA
-- ============================================================================
