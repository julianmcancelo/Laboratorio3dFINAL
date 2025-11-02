-- Script para insertar niveles de lealtad por defecto
-- Ejecutar solo si la tabla niveles_lealtad está vacía o necesita actualizarse

USE jcancelo_laboratorio3d;

-- Limpiar niveles existentes (opcional, comentar si no quieres eliminar datos)
-- DELETE FROM niveles_lealtad;

-- Insertar niveles de lealtad básicos
INSERT INTO niveles_lealtad (nombre_nivel, icono_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion, orden, activo) VALUES
('Bronce', '🥉', 0, 1.00, 'Nivel inicial - Comienza tu viaje de lealtad', 1, 1),
('Plata', '🥈', 10000, 1.10, 'Nivel intermedio - 10% de bonificación en puntos', 2, 1),
('Oro', '🥇', 20000, 1.20, 'Nivel avanzado - 20% de bonificación en puntos', 3, 1)
ON DUPLICATE KEY UPDATE 
  puntos_minimos_requeridos = VALUES(puntos_minimos_requeridos),
  multiplicador_puntos = VALUES(multiplicador_puntos),
  descripcion = VALUES(descripcion),
  orden = VALUES(orden),
  activo = VALUES(activo);

-- Verificar los niveles insertados
SELECT * FROM niveles_lealtad ORDER BY puntos_minimos_requeridos ASC;

-- Contar niveles activos
SELECT COUNT(*) as total_niveles FROM niveles_lealtad WHERE activo = 1;
