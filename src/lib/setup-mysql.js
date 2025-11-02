/**
 * 🔧 Script para configurar MySQL
 * 
 * Este script crea las tablas necesarias en MySQL
 * e inserta los usuarios de prueba.
 */

const mysql = require('mysql2/promise');

// Configuración desde .env.local
const dbConfig = {
  host: process.env.DB_HOST || '167.250.5.55',
  user: process.env.DB_USER || 'jcancelo_3d',
  password: process.env.DB_PASS || 'feelthesky1',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: false // Desactivar SSL para este servidor
};

async function setupMySQL() {
  let connection;
  
  try {
    console.log('🔧 Conectando a MySQL...');
    
    // Conectar sin especificar base de datos primero
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined
    });

    console.log('✅ Conexión establecida');

    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Base de datos '${dbConfig.database}' creada/verificada`);

    // Usar la base de datos
    await connection.query(`USE ${dbConfig.database}`);

    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        dni VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20) NULL,
        instagram VARCHAR(100) NULL,
        puntos INT DEFAULT 1500,
        nivel ENUM('Bronce', 'Plata', 'Oro', 'Platino') DEFAULT 'Bronce',
        codigo_referido VARCHAR(20) NULL UNIQUE,
        referido_por VARCHAR(20) NULL,
        activo BOOLEAN DEFAULT TRUE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_codigo_referido (codigo_referido),
        INDEX idx_referido_por (referido_por)
      )
    `);
    console.log('✅ Tabla "usuarios" creada/verificada');

    // Crear tabla de sesiones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id VARCHAR(255) PRIMARY KEY,
        usuario_id INT NOT NULL,
        expira_en TIMESTAMP NOT NULL,
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_expira_en (expira_en)
      )
    `);
    console.log('✅ Tabla "sesiones" creada/verificada');

    // Crear tabla de tokens de recuperación
    await connection.query(`
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
      )
    `);
    console.log('✅ Tabla "tokens_recuperacion" creada/verificada');

    // Insertar usuarios de prueba
    const adminPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'admin123'
    const testPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'test123'

    await connection.query(`
      INSERT IGNORE INTO usuarios (id, nombre_completo, dni, email, password, puntos, nivel, codigo_referido, activo) VALUES
      (1, 'Administrador', '00000000', 'admin@lab3d.com', ?, 50000, 'Platino', 'ADMIN123', TRUE),
      (2, 'Usuario Test', '12345678', 'test@lab3d.com', ?, 1500, 'Bronce', 'TEST1234', TRUE)
    `, [adminPassword, testPassword]);
    console.log('✅ Usuarios de prueba insertados/verificados');

    // Verificar que los usuarios existen
    const [users] = await connection.query('SELECT id, email, nivel FROM usuarios WHERE activo = TRUE');
    console.log(`📊 Total usuarios activos: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Nivel: ${user.nivel}`);
    });

    console.log('\n🎉 ¡Configuración MySQL completada exitosamente!');
    console.log('\n🔑 Usuarios de prueba creados:');
    console.log('   - Admin: admin@lab3d.com / admin123');
    console.log('   - Test:  test@lab3d.com / test123');

  } catch (error) {
    console.error('❌ Error configurando MySQL:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución posible:');
      console.log('   1. Verifica que el usuario y contraseña sean correctos');
      console.log('   2. Verifica que el usuario tenga permisos para crear bases de datos');
      console.log('   3. Revisa la configuración en .env.local');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

// Ejecutar setup
if (require.main === module) {
  setupMySQL();
}

module.exports = { setupMySQL };
