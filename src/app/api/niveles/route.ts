/**
 * 🏆 API Route - Niveles de Lealtad
 * Endpoint para obtener los niveles dinámicamente desde la BD
 */

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laboratorio3d',
  port: parseInt(process.env.DB_PORT || '3306')
};

export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // Obtener niveles activos ordenados
    const [niveles]: any = await connection.execute(
      `SELECT 
        id,
        nombre_nivel as nombre,
        icono_nivel as icono,
        puntos_minimos_requeridos as puntos_requeridos,
        multiplicador_puntos as multiplicador,
        descripcion,
        orden
      FROM niveles_lealtad 
      WHERE activo = 1
      ORDER BY puntos_minimos_requeridos ASC`
    );

    console.log(`📊 Se obtuvieron ${niveles.length} niveles de lealtad`);

    return NextResponse.json({
      success: true,
      niveles: niveles
    });

  } catch (error: any) {
    console.error('❌ Error al obtener niveles:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
