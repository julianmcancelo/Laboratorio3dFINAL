import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener usuarios pendientes de aprobación
export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows]: any = await connection.execute(
      `SELECT id, nombre_completo, dni, email, puntos_acumulados, created_at 
       FROM usuarios 
       WHERE apto_para_canje = FALSE AND rol = 'cliente' 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ usuarios: rows });

  } catch (error: any) {
    console.error('Error al obtener usuarios pendientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
