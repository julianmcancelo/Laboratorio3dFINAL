/**
 * 🔧 Base de Datos Directa (Sin Prisma)
 * 
 * Este archivo usa mysql2 directamente como alternativa temporal
 * mientras se resuelven los problemas de permisos de Prisma.
 */

const mysql = require('mysql2/promise');

// Configuración de conexión
const dbConfig = {
  host: '167.250.5.55',
  user: 'jcancelo_3d',
  password: 'feelthesky1',
  database: 'jcancelo_laboratorio3d',
  port: 3306,
  ssl: false
};

// Pool de conexiones
let pool: any = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Interfaces basadas en estructura REAL
export interface Usuario {
  id?: number;
  nombre_completo: string;
  dni?: string;
  instagram?: string;
  email: string;
  password?: string;
  password_hash: string;
  rol: 'cliente' | 'admin';
  puntos_acumulados: number;
  codigo_referido?: string;
  referido_por_id?: number;
  apto_para_canje: boolean;
  nivel_lealtad_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Sesion {
  id?: string;
  usuario_id: number;
  expira_en: Date;
  creada_en?: Date;
}

// Funciones de base de datos directa
export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    
    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      return {
        id: user.id,
        nombre_completo: user.nombre_completo,
        dni: user.dni || undefined,
        instagram: user.instagram || undefined,
        email: user.email,
        password: user.password || undefined,
        password_hash: user.password_hash,
        rol: user.rol,
        puntos_acumulados: user.puntos_acumulados,
        codigo_referido: user.codigo_referido || undefined,
        referido_por_id: user.referido_por_id || undefined,
        apto_para_canje: user.apto_para_canje,
        nivel_lealtad_id: user.nivel_lealtad_id || undefined,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario por email:', error);
    throw error;
  }
}

export async function crearSesion(datos: { id: string; usuario_id: number; expira_en: Date }): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO sesiones (id, usuario_id, expira_en, creada_en) VALUES (?, ?, ?, NOW())',
      [datos.id, datos.usuario_id, datos.expira_en]
    );
    
    console.log(`✅ Sesión creada: ${datos.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando sesión:', error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute('SELECT 1');
    console.log('✅ Conexión MySQL verificada');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión MySQL:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('✅ Conexión MySQL cerrada');
  }
}
