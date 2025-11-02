-- Script para agregar la tabla de comprobantes a la base de datos existente
-- Ejecutar este script si la base de datos ya está creada

USE jcancelo_laboratorio3d;

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

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla comprobantes creada exitosamente' AS mensaje;
DESC comprobantes;
