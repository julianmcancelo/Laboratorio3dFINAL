/**
 * 🔍 API Route - Diagnóstico de Usuarios
 * 
 * Endpoint para verificar el estado de la base de datos
 */

import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // Verificar columnas de la tabla usuarios
    const [columns]: any = await connection.execute(
      "SHOW COLUMNS FROM usuarios"
    );
    
    const columnNames = columns.map((col: any) => col.Field);
    
    // Verificar columnas específicas
    const columnasRequeridas = [
      'validado',
      'fecha_validacion',
      'validado_por_id',
      'motivo_rechazo',
      'apto_para_canje'
    ];
    
    const columnasExistentes = columnasRequeridas.filter(col => columnNames.includes(col));
    const columnasFaltantes = columnasRequeridas.filter(col => !columnNames.includes(col));
    
    // Obtener un usuario admin de ejemplo
    const [admins]: any = await connection.execute(
      "SELECT id, email, rol FROM usuarios LIMIT 5"
    );

    return NextResponse.json({
      success: true,
      diagnostico: {
        total_columnas: columnNames.length,
        columnas_todos: columnNames,
        columnas_validacion_existentes: columnasExistentes,
        columnas_validacion_faltantes: columnasFaltantes,
        usuarios_ejemplo: admins,
        database: process.env.DB_NAME
      }
    });

  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
