-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS jcancelo_laboratorio3d;
USE jcancelo_laboratorio3d;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  
  -- Datos de contacto y redes sociales
  telefono VARCHAR(20) NULL,
  whatsapp VARCHAR(20) NULL,
  instagram VARCHAR(100) NULL,
  facebook VARCHAR(100) NULL,
  telegram VARCHAR(100) NULL,
  direccion TEXT NULL,
  
  -- Sistema de puntos y niveles
  puntos INT DEFAULT 500,
  nivel ENUM('Bronce', 'Plata', 'Oro') DEFAULT 'Bronce',
  codigo_referido VARCHAR(20) NULL UNIQUE,
  referido_por VARCHAR(20) NULL,
  
  -- Sistema de validación de cuentas
  cuenta_validada BOOLEAN DEFAULT FALSE,
  validado_por INT NULL,
  fecha_validacion TIMESTAMP NULL,
  observaciones_validacion TEXT NULL,
  
  -- Control de estado
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (validado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_email (email),
  INDEX idx_codigo_referido (codigo_referido),
  INDEX idx_referido_por (referido_por)
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sesiones (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id INT NOT NULL,
  expira_en TIMESTAMP NOT NULL,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_expira_en (expira_en)
);

-- Tabla de tokens de recuperación
CREATE TABLE IF NOT EXISTS tokens_recuperacion (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_expira_en (expira_en)
);

-- Tabla de premios
CREATE TABLE IF NOT EXISTS premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  puntos_requeridos INT NOT NULL,
  stock INT DEFAULT 0,
  imagen_url VARCHAR(500) NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_puntos_requeridos (puntos_requeridos),
  INDEX idx_activo (activo)
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  premio_id INT NOT NULL,
  puntos_gastados INT NOT NULL,
  estado ENUM('pendiente', 'completado', 'cancelado') DEFAULT 'pendiente',
  fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT NULL,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (premio_id) REFERENCES premios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_premio_id (premio_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_compra (fecha_compra)
);

-- Tabla de comprobantes de compra
CREATE TABLE IF NOT EXISTS comprobantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT NULL,
  comprobante_base64 LONGTEXT NOT NULL,
  tipo_archivo VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
  puntos_otorgados INT DEFAULT 0,
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_validacion TIMESTAMP NULL,
  validado_por INT NULL,
  observaciones TEXT NULL,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (validado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_carga (fecha_carga),
  INDEX idx_validado_por (validado_por)
);

-- Tabla de roles (para permisos)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  rol ENUM('USER', 'ADMIN', 'SUPERADMIN') DEFAULT 'USER',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id)
);

-- Insertar usuarios de prueba
INSERT IGNORE INTO usuarios (id, nombre_completo, dni, email, password, puntos, nivel, codigo_referido, cuenta_validada, activo) VALUES
(1, 'Administrador', '00000000', 'admin@lab3d.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 50000, 'Oro', 'ADMIN123', TRUE, TRUE),
(2, 'Usuario Test', '12345678', 'test@lab3d.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 500, 'Bronce', 'TEST1234', TRUE, TRUE);

-- Asignar rol de admin al usuario 1
INSERT IGNORE INTO roles (usuario_id, rol) VALUES (1, 'SUPERADMIN'), (2, 'USER');

-- Insertar premios según documento oficial
INSERT IGNORE INTO premios (nombre, descripcion, puntos_requeridos, stock, imagen_url, activo) VALUES
('3kg Filamento Premium', 'Tu constancia se transforma en beneficios: lleváte 3 kg de filamento gratis.', 1500, 50, '/images/premios/filamento-3kg.jpg', TRUE),
('$90.000 de regalo', 'Invertí en tus proyectos, nosotros te apoyamos: $90.000 de regalo en tu próxima gran compra (> $500.000).', 3000, 100, '/images/premios/cupon-90k.jpg', TRUE),
('$180.000 de regalo', 'Tu crecimiento merece un impulso mayor: $180.000 para tu próxima inversión (> $500.000).', 10000, 100, '/images/premios/cupon-180k.jpg', TRUE),
('Impresora Bambu Lab A1 Mini', 'Llegaste a la cima 🏆. Como miembro Oro te premiamos con una impresora A1 Mini.', 20000, 3, '/images/premios/bambu-a1-mini.jpg', TRUE);

-- Crear vista de estadísticas
CREATE OR REPLACE VIEW vista_estadisticas_usuarios AS
SELECT 
  u.id,
  u.nombre_completo,
  u.email,
  u.puntos,
  u.nivel,
  u.codigo_referido,
  u.creado_en,
  COUNT(c.id) as total_compras,
  COALESCE(SUM(c.puntos_gastados), 0) as puntos_gastados_totales
FROM usuarios u
LEFT JOIN compras c ON u.id = c.usuario_id AND c.estado = 'completado'
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre_completo, u.email, u.puntos, u.nivel, u.codigo_referido, u.creado_en;

-- Limpiar tokens expirados automáticamente (opcional)
-- CREATE EVENT IF NOT EXISTS limpiar_tokens_expirados
-- ON SCHEDULE EVERY 1 HOUR
-- DO
--   DELETE FROM tokens_recuperacion WHERE expira_en < NOW() OR usado = TRUE;
