-- 🎁 Seed de Premios
-- Ejecutar después de create-tables.sql

USE jcancelo_laboratorio3d;

-- Limpiar tabla de premios (opcional, comentar si no quieres borrar datos existentes)
-- TRUNCATE TABLE premios;

-- Insertar premios de ejemplo
INSERT INTO premios (nombre, descripcion, puntos_requeridos, stock, imagen_url, activo) VALUES
('1 Kg Filamento PLA Básico', 'Filamento PLA estándar, ideal para impresiones generales. Disponible en varios colores.', 1500, 50, '/images/premios/filamento-basico.jpg', 1),
('3 Kg Filamento Premium', 'Pack de 3kg de filamento premium con mejor acabado y resistencia.', 5000, 30, '/images/premios/filamento-premium.jpg', 1),
('Set de Herramientas 3D', 'Kit completo con espátulas, pinzas y herramientas para impresión 3D.', 8000, 25, '/images/premios/herramientas.jpg', 1),
('Resina 1L Estándar', 'Resina fotopolimérica de 1 litro para impresoras SLA/DLP.', 12000, 15, '/images/premios/resina.jpg', 1),
('Hotend de Alta Temperatura', 'Hotend profesional que soporta hasta 300°C, ideal para materiales avanzados.', 18000, 10, '/images/premios/hotend.jpg', 1),
('Placa de Impresión Magnética', 'Placa flexible magnética para fácil remoción de impresiones.', 22000, 20, '/images/premios/placa-magnetica.jpg', 1);

-- Verificar inserción
SELECT 
    id,
    nombre,
    puntos_requeridos,
    stock,
    activo,
    CASE 
        WHEN puntos_requeridos >= 20000 THEN '🥇 Oro'
        WHEN puntos_requeridos >= 10000 THEN '🥈 Plata'
        ELSE '🥉 Bronce'
    END as nivel
FROM premios
ORDER BY puntos_requeridos ASC;
