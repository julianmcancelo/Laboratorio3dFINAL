import mysql from 'mysql2/promise';

// Configuración de conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || '167.250.5.55',
  user: process.env.DB_USER || 'jcancelo_3d',
  password: process.env.DB_PASS || 'feelthesky1',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: false, // Desactivar SSL para este servidor
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de conexiones MySQL creado');
  }
  return pool;
}

// Función para ejecutar consultas
export async function query(sql: string, params?: any[]): Promise<any> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en consulta MySQL:', error);
    throw error;
  }
}

// Función para obtener una conexión
export async function getConnection(): Promise<mysql.Connection> {
  const pool = getPool();
  return await pool.getConnection();
}

// Verificar conexión
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a MySQL verificada');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión MySQL:', error);
    return false;
  }
}

// Cerrar pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Pool de conexiones MySQL cerrado');
  }
}
