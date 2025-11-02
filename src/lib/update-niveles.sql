-- Script para actualizar los niveles en la base de datos existente
-- Ejecutar este script si ya tienes usuarios con nivel 'Platino'

USE jcancelo_laboratorio3d;

-- Primero, actualizar usuarios que tengan 'Platino' a 'Fundador'
UPDATE usuarios 
SET nivel = 'Fundador' 
WHERE nivel = 'Platino';

-- Modificar la columna para incluir los nuevos niveles
ALTER TABLE usuarios 
MODIFY COLUMN nivel ENUM('Bronce', 'Plata', 'Oro', 'Diamante', 'Esmeralda', 'Fundador') DEFAULT 'Bronce';

-- Verificar los cambios
SELECT 'Niveles actualizados exitosamente' AS mensaje;
SELECT nivel, COUNT(*) as cantidad FROM usuarios GROUP BY nivel;
