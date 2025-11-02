/**
 * 🔧 Script para agregar columna password a tabla usuarios
 * y configurar para autenticación
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addPasswordColumn() {
  let connection;
  
  try {
    console.log('🔧 Configurando tabla usuarios para autenticación...');
    
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

    // Verificar si existe la columna password
    const [columns] = await connection.execute('DESCRIBE usuarios');
    const hasPassword = columns.some(col => col.Field === 'password');
    
    if (!hasPassword) {
      console.log('➕ Agregando columna password...');
      await connection.execute('ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) NULL AFTER email');
      console.log('✅ Columna password agregada');
    } else {
      console.log('✅ Columna password ya existe');
    }

    // Verificar si existen los usuarios de prueba
    const [users] = await connection.execute("SELECT * FROM usuarios WHERE email IN ('admin@lab3d.com', 'test@lab3d.com')");
    
    if (users.length === 0) {
      console.log('👥 Creando usuarios de prueba...');
      
      // Hashear contraseñas
      const adminPassword = await bcrypt.hash('admin123', 10);
      const testPassword = await bcrypt.hash('test123', 10);
      
      // Insertar usuarios de prueba
      await connection.execute(`
        INSERT INTO usuarios (nombre_completo, dni, email, password, puntos, nivel, codigo_referido, activo) VALUES
        ('Administrador', '00000000', 'admin@lab3d.com', ?, 50000, 'Platino', 'ADMIN123', TRUE),
        ('Usuario Test', '12345678', 'test@lab3d.com', ?, 1500, 'Bronce', 'TEST1234', TRUE)
      `, [adminPassword, testPassword]);
      
      console.log('✅ Usuarios de prueba creados');
    } else {
      console.log(`👥 Encontrados ${users.length} usuarios de prueba`);
      
      // Actualizar contraseñas si no tienen
      for (const user of users) {
        if (!user.password) {
          const password = user.email.includes('admin') ? 'admin123' : 'test123';
          const hashedPassword = await bcrypt.hash(password, 10);
          
          await connection.execute(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
          );
          
          console.log(`✅ Contraseña actualizada para ${user.email}`);
        }
      }
    }

    // Verificar resultado final
    const [finalUsers] = await connection.execute(`
      SELECT id, nombre_completo, email, puntos, nivel, codigo_referido, 
             CASE WHEN password IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password
      FROM usuarios 
      WHERE email IN ('admin@lab3d.com', 'test@lab3d.com')
    `);

    console.log('\n🎉 Configuración completada:');
    console.log('📊 Usuarios configurados:');
    finalUsers.forEach(user => {
      console.log(`   ✅ ID: ${user.id}, Email: ${user.email}, Nivel: ${user.nivel}, Puntos: ${user.puntos}, Password: ${user.has_password}`);
    });

    console.log('\n🔑 Credenciales de prueba:');
    console.log('   - Admin: admin@lab3d.com / admin123');
    console.log('   - Test:  test@lab3d.com / test123');

  } catch (error) {
    console.error('❌ Error configurando tabla:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addPasswordColumn();
