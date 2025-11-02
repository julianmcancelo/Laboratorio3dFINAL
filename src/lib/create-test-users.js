/**
 * 🔧 Script para crear usuarios de prueba con la estructura REAL
 * de la base de datos existente
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  let connection;
  
  try {
    console.log('🔧 Creando usuarios de prueba con estructura real...');
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: '167.250.5.55',
      user: 'jcancelo_3d',
      password: 'feelthesky1',
      database: 'jcancelo_laboratorio3d',
      port: 3306,
      ssl: false
    });

    console.log('✅ Conectado a la base de datos');

    // Verificar niveles de lealtad existentes
    const [niveles] = await connection.execute('SELECT * FROM niveles_lealtad WHERE activo = 1 ORDER BY orden ASC');
    console.log(`📊 Niveles de lealtad encontrados: ${niveles.length}`);
    
    let nivelBronceId = null;
    niveles.forEach(nivel => {
      console.log(`   - ${nivel.nombre_nivel}: ${nivel.puntos_minimos_requeridos} pts (ID: ${nivel.id})`);
      if (nivel.nombre_nivel.toLowerCase() === 'bronce') {
        nivelBronceId = nivel.id;
      }
    });

    if (!nivelBronceId) {
      console.log('⚠️  No se encontró nivel Bronce, usando ID 1');
      nivelBronceId = 1;
    }

    // Hashear contraseñas
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testPassword = await bcrypt.hash('test123', 10);

    // Insertar usuarios con la estructura CORRECTA
    console.log('👤 Creando usuarios de prueba...');
    
    await connection.execute(`
      INSERT IGNORE INTO usuarios (
        nombre_completo, dni, email, password, password_hash, rol, 
        puntos_acumulados, codigo_referido, apto_para_canje, nivel_lealtad_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Administrador Sistema',
      '00000000',
      'admin@lab3d.com',
      adminPassword, // Nueva columna password
      adminPassword, // Columna existente password_hash
      'admin',
      50000,
      'ADMIN123',
      true,
      3 // Nivel Oro (según datos existentes)
    ]);

    await connection.execute(`
      INSERT IGNORE INTO usuarios (
        nombre_completo, dni, email, password, password_hash, rol, 
        puntos_acumulados, codigo_referido, apto_para_canje, nivel_lealtad_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Usuario de Prueba',
      '12345678',
      'test@lab3d.com',
      testPassword, // Nueva columna password
      testPassword, // Columna existente password_hash
      'cliente',
      1500,
      'TEST1234',
      true,
      nivelBronceId
    ]);

    console.log('✅ Usuarios de prueba creados');

    // Verificar usuarios creados
    const [users] = await connection.execute(`
      SELECT id, nombre_completo, email, rol, puntos_acumulados, 
             CASE WHEN password IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password,
             CASE WHEN password_hash IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password_hash
      FROM usuarios 
      WHERE email IN ('admin@lab3d.com', 'test@lab3d.com')
    `);

    console.log('\n🎉 Usuarios configurados:');
    users.forEach(user => {
      console.log(`   ✅ ID: ${user.id}, Email: ${user.email}, Rol: ${user.rol}, Puntos: ${user.puntos_acumulados}`);
      console.log(`      Password: ${user.has_password}, Password Hash: ${user.has_password_hash}`);
    });

    // Crear historial de puntos para el usuario de prueba
    await connection.execute(`
      INSERT IGNORE INTO historial_puntos (
        usuario_id, tipo_transaccion, puntos_movimiento, descripcion_detalle, fecha_transaccion
      ) VALUES (?, ?, ?, ?, NOW())
    `, [
      2, // ID del usuario test
      'bienvenida_registro',
      1500,
      'Puntos de bienvenida por registrarse en el sistema'
    ]);

    console.log('✅ Historial de puntos creado para usuario de prueba');

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   - Admin: admin@lab3d.com / admin123');
    console.log('   - Test:  test@lab3d.com / test123');
    console.log('\n📊 Base de datos lista para usar con Prisma');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUsers();
