/**
 * 🔍 Script para inspeccionar la base de datos existente
 * y generar configuración Prisma adaptada
 */

const mysql = require('mysql2/promise');

async function inspectDatabase() {
  let connection;
  
  try {
    console.log('🔍 Inspeccionando base de datos existente...');
    
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

    // Obtener todas las tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Tablas encontradas: ${tables.length}`);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🗂️  Tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      
      columns.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
      
      // Obtener primeros registros para ver datos
      try {
        const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        if (rows.length > 0) {
          console.log(`   📄 Datos de ejemplo:`);
          rows.forEach((row, index) => {
            console.log(`     ${index + 1}:`, JSON.stringify(row, null, 6));
          });
        } else {
          console.log(`   📄 Tabla vacía`);
        }
      } catch (error) {
        console.log(`   ❌ Error obteniendo datos: ${error.message}`);
      }
    }

    // Verificar específicamente la tabla usuarios
    console.log('\n🎯 Análisis específico de tabla usuarios:');
    try {
      const [userColumns] = await connection.execute('DESCRIBE usuarios');
      const hasPassword = userColumns.some(col => col.Field === 'password');
      const hasEmail = userColumns.some(col => col.Field === 'email');
      const hasDni = userColumns.some(col => col.Field === 'dni');
      
      console.log(`   ✅ Tiene password: ${hasPassword}`);
      console.log(`   ✅ Tiene email: ${hasEmail}`);
      console.log(`   ✅ Tiene dni: ${hasDni}`);
      
      if (!hasPassword) {
        console.log('\n⚠️  La tabla usuarios no tiene columna password');
        console.log('💡 Se necesita agregar la columna password para autenticación');
        
        // Generar SQL para agregar columna
        console.log('\n🔧 SQL para agregar password:');
        console.log('ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) NULL AFTER email;');
      }
      
    } catch (error) {
      console.log(`❌ Error analizando tabla usuarios: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error inspeccionando base de datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inspectDatabase();
