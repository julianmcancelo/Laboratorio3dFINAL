import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '167.250.5.55',
      user: process.env.DB_USER || 'jcancelo_3d',
      password: process.env.DB_PASSWORD || 'feelthesky1',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    // SQL para crear la tabla
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`usuario_id\` int NOT NULL,
        \`token\` varchar(255) NOT NULL,
        \`expira_en\` datetime NOT NULL,
        \`creado_en\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`usado\` tinyint(1) DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`idx_token\` (\`token\`),
        KEY \`idx_usuario_id\` (\`usuario_id\`),
        KEY \`idx_expira_en\` (\`expira_en\`),
        CONSTRAINT \`fk_password_reset_tokens_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    // Ejecutar la creación de tabla
    await connection.execute(createTableSQL);

    // Verificar que la tabla existe
    const [tables]: any = await connection.execute(
      "SHOW TABLES LIKE 'password_reset_tokens'"
    );

    if (tables.length === 0) {
      throw new Error('No se pudo crear la tabla');
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Tabla password_reset_tokens creada exitosamente',
      table: tables[0]
    });

  } catch (error: any) {
    if (connection) {
      await connection.end();
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.sqlMessage
    }, { status: 500 });
  }
}
