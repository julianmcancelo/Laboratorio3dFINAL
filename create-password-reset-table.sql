-- Crear tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expira_en` datetime NOT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  `usado` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_expira_en` (`expira_en`),
  CONSTRAINT `fk_password_reset_tokens_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
