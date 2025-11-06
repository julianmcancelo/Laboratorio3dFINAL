-- ============================================================================
-- 🔄 SCRIPT DE REGENERACIÓN COMPLETA DE BASE DE DATOS
-- Laboratorio 3D - Sistema de Puntos y Premios
-- ============================================================================
-- Este script elimina y recrea todas las tablas desde cero
-- ADVERTENCIA: Se perderán todos los datos existentes
-- ============================================================================

USE jcancelo_laboratorio3d;

-- ============================================================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS historial_puntos;
DROP TABLE IF EXISTS canjes_premios;
DROP TABLE IF EXISTS compras;
DROP TABLE IF EXISTS premios;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS tokens_recuperacion;
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS niveles_lealtad;
DROP TABLE IF EXISTS configuracion_referidos;
DROP TABLE IF EXISTS configuracion_sitio;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- PASO 2: CREAR TABLA DE NIVELES DE LEALTAD
-- ============================================================================

CREATE TABLE niveles_lealtad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_nivel VARCHAR(50) NOT NULL UNIQUE,
  icono_nivel VARCHAR(100) NULL,
  puntos_minimos_requeridos INT NOT NULL DEFAULT 0,
  multiplicador_puntos DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  descripcion TEXT NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_puntos_minimos (puntos_minimos_requeridos),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 3: CREAR TABLA DE USUARIOS
-- ============================================================================

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NULL UNIQUE,
  instagram VARCHAR(100) NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  puntos_acumulados INT NOT NULL DEFAULT 0,
  codigo_referido VARCHAR(20) NULL UNIQUE,
  referido_por_id INT NULL,
  apto_para_canje BOOLEAN NOT NULL DEFAULT FALSE,
  nivel_lealtad_id INT NULL,
  validado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_validacion TIMESTAMP NULL,
  validado_por_id INT NULL,
  motivo_rechazo TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_dni (dni),
  INDEX idx_codigo_referido (codigo_referido),
  INDEX idx_nivel_lealtad (nivel_lealtad_id),
  INDEX idx_referido_por (referido_por_id),
  
  CONSTRAINT fk_usuario_nivel_lealtad 
    FOREIGN KEY (nivel_lealtad_id) REFERENCES niveles_lealtad(id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_usuario_referido_por 
    FOREIGN KEY (referido_por_id) REFERENCES usuarios(id) 
    ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT fk_usuario_validado_por 
    FOREIGN KEY (validado_por_id) REFERENCES usuarios(id) 
    ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 4: CREAR TABLA DE SESIONES
-- ============================================================================

CREATE TABLE sesiones (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id INT NOT NULL,
  expira_en TIMESTAMP NOT NULL,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_expira_en (expira_en),
  
  CONSTRAINT fk_sesion_usuario 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 5: CREAR TABLA DE TOKENS DE RECUPERACIÓN
-- ============================================================================

CREATE TABLE tokens_recuperacion (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_token (token),
  INDEX idx_expira_en (expira_en),
  
  CONSTRAINT fk_token_usuario 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 6: CREAR TABLA DE CLIENTES (LEGACY - MANTENER POR COMPATIBILIDAD)
-- ============================================================================

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  instagram VARCHAR(100) NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  puntos_acumulados INT NOT NULL DEFAULT 0,
  apto_para_canje BOOLEAN NOT NULL DEFAULT FALSE,
  codigo_referido VARCHAR(20) NULL UNIQUE,
  referido_por_id INT NULL,
  
  INDEX idx_dni (dni),
  INDEX idx_codigo_referido (codigo_referido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 7: CREAR TABLA DE PREMIOS
-- ============================================================================

CREATE TABLE premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  puntos_requeridos INT NOT NULL DEFAULT 0,
  nivel_lealtad_requerido_id INT NULL,
  activo BOOLEAN DEFAULT TRUE,
  
  INDEX idx_puntos_requeridos (puntos_requeridos),
  INDEX idx_nivel_requerido (nivel_lealtad_requerido_id),
  INDEX idx_activo (activo),
  
  CONSTRAINT fk_premio_nivel_lealtad 
    FOREIGN KEY (nivel_lealtad_requerido_id) REFERENCES niveles_lealtad(id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 8: CREAR TABLA DE CANJES DE PREMIOS
-- ============================================================================

CREATE TABLE canjes_premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  premio_id INT NOT NULL,
  puntos_canjeados INT NOT NULL,
  fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visto_por_admin BOOLEAN NOT NULL DEFAULT FALSE,
  estado_entrega VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_premio_id (premio_id),
  INDEX idx_fecha_canje (fecha_canje),
  INDEX idx_estado_entrega (estado_entrega),
  
  CONSTRAINT fk_canjes_premios_usuario 
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) 
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_canjes_premios_premio 
    FOREIGN KEY (premio_id) REFERENCES premios(id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 9: CREAR TABLA DE MÉTODOS DE PAGO
-- ============================================================================

CREATE TABLE metodos_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 10: CREAR TABLA DE COMPRAS
-- ============================================================================

CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT NULL,
  fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comprobante_url VARCHAR(255) NULL,
  metodo_pago_id INT NULL,
  
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_fecha_compra (fecha_compra),
  INDEX idx_verificado (verificado),
  INDEX idx_metodo_pago (metodo_pago_id),
  
  CONSTRAINT fk_compras_usuario 
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) 
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_metodo_pago 
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 11: CREAR TABLA DE HISTORIAL DE PUNTOS
-- ============================================================================

CREATE TABLE historial_puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_transaccion VARCHAR(50) NOT NULL,
  puntos_movimiento INT NOT NULL,
  descripcion_detalle VARCHAR(255) NULL,
  premio_id INT NULL,
  compra_id INT NULL,
  canje_id INT NULL,
  referido_que_genero_id INT NULL,
  fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_tipo_transaccion (tipo_transaccion),
  INDEX idx_fecha_transaccion (fecha_transaccion),
  INDEX idx_premio_id (premio_id),
  INDEX idx_compra_id (compra_id),
  INDEX idx_canje_id (canje_id),
  INDEX idx_referido_que_genero_id (referido_que_genero_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 12: CREAR TABLA DE CONFIGURACIÓN DE REFERIDOS
-- ============================================================================

CREATE TABLE configuracion_referidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  porcentaje_comision_referido DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  puntos_fijos_primera_compra INT NOT NULL DEFAULT 0,
  sistema_comision_activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 13: CREAR TABLA DE CONFIGURACIÓN DEL SITIO
-- ============================================================================

CREATE TABLE configuracion_sitio (
  id INT PRIMARY KEY DEFAULT 1,
  tema_activo VARCHAR(50) NOT NULL DEFAULT 'nexus-dark'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASO 14: INSERTAR DATOS INICIALES - NIVELES DE LEALTAD
-- ============================================================================

INSERT INTO niveles_lealtad (nombre_nivel, icono_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion, orden, activo) VALUES
('Bronce', '🥉', 0, 1.00, 'Nivel inicial - Comienza tu viaje de lealtad', 1, TRUE),
('Plata', '🥈', 10000, 1.10, 'Nivel intermedio - 10% de bonificación en puntos', 2, TRUE),
('Oro', '🥇', 20000, 1.20, 'Nivel avanzado - 20% de bonificación en puntos', 3, TRUE);

-- ============================================================================
-- PASO 15: INSERTAR DATOS INICIALES - MÉTODOS DE PAGO
-- ============================================================================

INSERT INTO metodos_pago (nombre, activo) VALUES
('Efectivo', TRUE),
('Transferencia Bancaria', TRUE),
('MercadoPago', TRUE),
('Tarjeta de Crédito', TRUE),
('Tarjeta de Débito', TRUE);

-- ============================================================================
-- PASO 16: INSERTAR DATOS INICIALES - PREMIOS
-- ============================================================================

INSERT INTO premios (nombre, descripcion, puntos_requeridos, nivel_lealtad_requerido_id, activo) VALUES
('3kg Filamento Premium', 'Tu constancia se transforma en beneficios: lleváte 3 kg de filamento gratis.', 1500, NULL, TRUE),
('Cupón $90.000', 'Invertí en tus proyectos: $90.000 de regalo en tu próxima compra mayor a $500.000.', 3000, NULL, TRUE),
('Cupón $180.000', 'Tu crecimiento merece un impulso: $180.000 para tu próxima inversión mayor a $500.000.', 10000, 2, TRUE),
('Impresora Bambu Lab A1 Mini', 'Llegaste a la cima 🏆. Como miembro Oro te premiamos con una impresora A1 Mini.', 20000, 3, TRUE),
('Set de Herramientas 3D', 'Kit completo con espátulas, pinzas y herramientas para impresión 3D.', 5000, NULL, TRUE),
('Resina 1L Estándar', 'Resina fotopolimérica de 1 litro para impresoras SLA/DLP.', 8000, 2, TRUE);

-- ============================================================================
-- PASO 17: INSERTAR CONFIGURACIÓN DE REFERIDOS
-- ============================================================================

INSERT INTO configuracion_referidos (porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo) VALUES
(10.00, 500, TRUE);

-- ============================================================================
-- PASO 18: INSERTAR CONFIGURACIÓN DEL SITIO
-- ============================================================================

INSERT INTO configuracion_sitio (id, tema_activo) VALUES (1, 'nexus-dark');

-- ============================================================================
-- PASO 19: INSERTAR USUARIO ADMINISTRADOR POR DEFECTO
-- ============================================================================
-- Contraseña: admin123 (hash bcrypt)

INSERT INTO usuarios (
  nombre_completo, 
  dni, 
  email, 
  password_hash, 
  rol, 
  puntos_acumulados, 
  codigo_referido, 
  validado, 
  nivel_lealtad_id,
  apto_para_canje
) VALUES (
  'Administrador', 
  '00000000', 
  'admin@laboratorio3d.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin', 
  50000, 
  'ADMIN123', 
  TRUE,
  3,
  TRUE
);

-- ============================================================================
-- PASO 20: VERIFICACIÓN DE DATOS
-- ============================================================================

SELECT 'Niveles de Lealtad' as Tabla, COUNT(*) as Total FROM niveles_lealtad
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Métodos de Pago', COUNT(*) FROM metodos_pago
UNION ALL
SELECT 'Premios', COUNT(*) FROM premios
UNION ALL
SELECT 'Configuración Referidos', COUNT(*) FROM configuracion_referidos
UNION ALL
SELECT 'Configuración Sitio', COUNT(*) FROM configuracion_sitio;

-- ============================================================================
-- ✅ REGENERACIÓN COMPLETA FINALIZADA
-- ============================================================================

SELECT '✅ Base de datos regenerada exitosamente' as Resultado;
