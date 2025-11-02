/**
 * 🗄️ Configuración de Base de Datos - Laboratorio 3D
 * 
 * Este archivo contiene la configuración y utilidades para la conexión
 * a la base de datos MySQL. Incluye manejo de conexiones, pool de conexiones
 * y utilidades para consultas seguras.
 */

import mysql from 'mysql2/promise';
import type { FieldPacket, ResultSetHeader, RowDataPacket, PoolConnection, Pool } from 'mysql2/promise';

// ============================================================================
// 🔧 CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================================================

/**
 * 🌐 Configuración de conexión a la base de datos
 * Se obtiene de las variables de entorno para mayor seguridad
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'laboratorio_3d',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  charset: 'utf8mb4',
  timezone: '-03:00', // Zona horaria de Argentina
  connectTimeout: 60000,
  multipleStatements: false,
};

/**
 * 🏊‍♂️ Pool de conexiones a la base de datos
 * Permite reutilizar conexiones y mejorar el rendimiento
 */
let pool: mysql.Pool | null = null;

/**
 * 🔧 Inicializa el pool de conexiones
 * Se crea una sola vez y se reutiliza en toda la aplicación
 */
function inicializarPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 20, // Máximo 20 conexiones simultáneas
      queueLimit: 0, // Sin límite de cola
      waitForConnections: true,
    });

    console.log('✅ Pool de conexiones a MySQL inicializado');
  }

  return pool;
}

// ============================================================================
// 🔍 UTILIDADES DE CONEXIÓN
// ============================================================================

/**
 * 🔗 Obtiene una conexión del pool
 * 
 * @returns Conexión a la base de datos
 * @throws Error si no se puede establecer la conexión
 */
export async function obtenerConexion(): Promise<mysql.PoolConnection> {
  try {
    const pool = inicializarPool();
    const conexion = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conexion.execute('SET NAMES utf8mb4');
    await conexion.execute('SET time_zone = "-03:00"');
    
    return conexion;
  } catch (error) {
    console.error('❌ Error al obtener conexión a la base de datos:', error);
    throw new Error('No se pudo establecer conexión con la base de datos');
  }
}

/**
 * 🔌 Ejecuta una consulta SQL con parámetros seguros
 * 
 * @param sql - Consulta SQL con placeholders (?)
 * @param parametros - Array de parámetros para la consulta
 * @returns Resultado de la consulta
 * 
 * @example
 * ```typescript
 * const usuarios = await ejecutarConsulta(
 *   'SELECT * FROM usuarios WHERE rol = ? AND activo = ?',
 *   ['cliente', true]
 * );
 * ```
 */
export async function ejecutarConsulta<T extends RowDataPacket>(
  sql: string,
  parametros: any[] = []
): Promise<T[]> {
  let conexion: mysql.Connection | null = null;
  
  try {
    // Validar que la consulta no esté vacía
    if (!sql || sql.trim() === '') {
      throw new Error('La consulta SQL no puede estar vacía');
    }

    // Validar que los parámetros sean un array
    if (!Array.isArray(parametros)) {
      throw new Error('Los parámetros deben ser un array');
    }

    conexion = await obtenerConexion();
    const [filas] = await conexion.execute<T[]>(sql, parametros);
    
    return filas;
  } catch (error) {
    console.error('❌ Error al ejecutar consulta:', { sql, parametros, error });
    throw new Error('Error al ejecutar la consulta en la base de datos');
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

/**
 * 📄 Ejecuta una consulta que devuelve una sola fila
 * 
 * @param sql - Consulta SQL con placeholders
 * @param parametros - Array de parámetros
 * @returns La primera fila del resultado o null si no hay resultados
 */
export async function ejecutarConsultaUnica<T extends RowDataPacket>(
  sql: string,
  parametros: any[] = []
): Promise<T | null> {
  try {
    const resultados = await ejecutarConsulta<T>(sql, parametros);
    return resultados.length > 0 ? resultados[0] : null;
  } catch (error) {
    console.error('❌ Error al ejecutar consulta única:', error);
    throw error;
  }
}

/**
 * ✏️ Ejecuta una consulta de inserción, actualización o eliminación
 * 
 * @param sql - Consulta SQL con placeholders
 * @param parametros - Array de parámetros
 * @returns Información sobre la operación ejecutada
 */
export async function ejecutarModificacion(
  sql: string,
  parametros: any[] = []
): Promise<ResultSetHeader> {
  let conexion: mysql.Connection | null = null;
  
  try {
    // Validar que la consulta no esté vacía
    if (!sql || sql.trim() === '') {
      throw new Error('La consulta SQL no puede estar vacía');
    }

    conexion = await obtenerConexion();
    const [resultado] = await conexion.execute<ResultSetHeader>(sql, parametros);
    
    return resultado;
  } catch (error) {
    console.error('❌ Error al ejecutar modificación:', { sql, parametros, error });
    throw new Error('Error al ejecutar la operación en la base de datos');
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

/**
 * 🔢 Ejecuta una consulta y devuelve el ID insertado
 * 
 * @param sql - Consulta SQL de inserción
 * @param parametros - Array de parámetros
 * @returns ID del registro insertado
 */
export async function ejecutarInsercion(
  sql: string,
  parametros: any[] = []
): Promise<number> {
  try {
    const resultado = await ejecutarModificacion(sql, parametros);
    return resultado.insertId;
  } catch (error) {
    console.error('❌ Error al ejecutar inserción:', error);
    throw error;
  }
}

/**
 * 📊 Ejecuta una consulta y devuelve el número de filas afectadas
 * 
 * @param sql - Consulta SQL
 * @param parametros - Array de parámetros
 * @returns Número de filas afectadas
 */
export async function ejecutarActualizacion(
  sql: string,
  parametros: any[] = []
): Promise<number> {
  try {
    const resultado = await ejecutarModificacion(sql, parametros);
    return resultado.affectedRows;
  } catch (error) {
    console.error('❌ Error al ejecutar actualización:', error);
    throw error;
  }
}

// ============================================================================
// 🔄 UTILIDADES DE TRANSACCIONES
// ============================================================================

/**
 * 🔄 Ejecuta múltiples consultas en una transacción
 * 
 * @param callback - Función que recibe la conexión y ejecuta las consultas
 * @returns Resultado del callback
 * 
 * @example
 * ```typescript
 * await ejecutarTransaccion(async (conexion) => {
 *   await conexion.execute('INSERT INTO usuarios (...) VALUES (...)', [datos]);
 *   await conexion.execute('UPDATE estadisticas SET ...', [valores]);
 * });
 * ```
 */
export async function ejecutarTransaccion<T>(
  callback: (conexion: mysql.Connection) => Promise<T>
): Promise<T> {
  let conexion: mysql.Connection | null = null;
  
  try {
    conexion = await obtenerConexion();
    await conexion.beginTransaction();
    
    const resultado = await callback(conexion);
    
    await conexion.commit();
    return resultado;
  } catch (error) {
    if (conexion) {
      await conexion.rollback();
    }
    console.error('❌ Error en transacción, se hizo rollback:', error);
    throw error;
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

// ============================================================================
// 🛡️ UTILIDADES DE SEGURIDAD Y VALIDACIÓN
// ============================================================================

/**
 * 🛡️ Escapa valores para prevenir SQL Injection
 * 
 * @param valor - Valor a escapar
 * @returns Valor escapado
 * @deprecated Usar siempre placeholders (?) en las consultas
 */
export function escaparValor(valor: any): string {
  try {
    if (valor === null || valor === undefined) {
      return 'NULL';
    }
    if (typeof valor === 'string') {
      return `'${valor.replace(/'/g, "\\'")}'`;
    }
    if (typeof valor === 'number') {
      return valor.toString();
    }
    if (typeof valor === 'boolean') {
      return valor ? '1' : '0';
    }
    if (valor instanceof Date) {
      return `'${valor.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    return `'${String(valor).replace(/'/g, "\\'")}'`;
  } catch (error) {
    console.error('❌ Error al escapar valor:', error);
    return 'NULL';
  }
}

/**
 * 🔍 Valida que una consulta SQL no contenga patrones peligrosos
 * 
 * @param sql - Consulta SQL a validar
 * @throws Error si la consulta contiene patrones peligrosos
 */
export function validarConsultaSQL(sql: string): void {
  try {
    const patronesPeligrosos = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM\s+\w+\s*$/i,
      /TRUNCATE/i,
      /ALTER\s+TABLE/i,
      /EXEC\s*\(/i,
      /SCRIPT/i,
      /UNION\s+SELECT/i,
    ];

    for (const patron of patronesPeligrosos) {
      if (patron.test(sql)) {
        throw new Error('La consulta contiene patrones SQL peligrosos');
      }
    }
  } catch (error) {
    console.error('❌ Error al validar consulta SQL:', error);
    throw error;
  }
}

// ============================================================================
// 📊 UTILIDADES DE MONITOREO Y DIAGNÓSTICO
// ============================================================================

/**
 * 📊 Obtiene estadísticas del pool de conexiones
 * 
 * @returns Estadísticas del pool
 */
export function obtenerEstadisticasPool(): {
  totalConexiones: number;
  conexionesLibres: number;
  conexionesEnUso: number;
  conexionesEsperando: number;
} | null {
  try {
    if (!pool) {
      return null;
    }

    // Nota: Las propiedades privadas del pool no están en los tipos
    // Retornamos información básica disponible
    return {
      totalConexiones: 20, // connectionLimit configurado
      conexionesLibres: 0,
      conexionesEnUso: 0,
      conexionesEsperando: 0,
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas del pool:', error);
    return null;
  }
}

/**
 * 🏥 Verifica la salud de la conexión a la base de datos
 * 
 * @returns true si la conexión está saludable, false si no
 */
export async function verificarSaludDB(): Promise<boolean> {
  try {
    const resultado = await ejecutarConsulta('SELECT 1 as salud');
    return resultado.length > 0 && resultado[0].salud === 1;
  } catch (error) {
    console.error('❌ Error al verificar salud de la base de datos:', error);
    return false;
  }
}

/**
 * 🔄 Cierra todas las conexiones del pool
 * Se debe usar al apagar la aplicación
 */
export async function cerrarPool(): Promise<void> {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('✅ Pool de conexiones cerrado correctamente');
    }
  } catch (error) {
    console.error('❌ Error al cerrar el pool de conexiones:', error);
    throw error;
  }
}

// ============================================================================
// 📝 EXPORTACIONES
// ============================================================================

export {
  dbConfig,
  inicializarPool,
};

// Exportar tipos de MySQL2 para uso en otros módulos
export type { 
  PoolConnection, 
  Pool, 
  RowDataPacket, 
  ResultSetHeader, 
  FieldPacket 
};
