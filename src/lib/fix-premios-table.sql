-- 🔧 Fix para tabla premios
-- Agrega las columnas de imagen en base64

USE jcancelo_laboratorio3d;

-- Verificar estructura actual
DESCRIBE premios;

-- Agregar columnas para imágenes en base64
ALTER TABLE premios 
ADD COLUMN imagen_base64 LONGTEXT NULL AFTER descripcion,
ADD COLUMN tipo_imagen VARCHAR(50) NULL AFTER imagen_base64;

-- Verificar que se agregaron
DESCRIBE premios;

-- Ver los premios
SELECT id, nombre, puntos_requeridos, activo FROM premios;
