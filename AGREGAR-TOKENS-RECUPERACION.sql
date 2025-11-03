-- Tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expira_en DATETIME NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expira_en (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpiar tokens expirados (puedes ejecutar esto periódicamente)
-- DELETE FROM password_reset_tokens WHERE expira_en < NOW() OR usado = TRUE;
