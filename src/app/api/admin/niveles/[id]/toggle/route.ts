import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// PATCH - Toggle activo/inactivo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  
  try {
    const body = await request.json();
    const { activo } = body;
    const nivelId = params.id;

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE niveles_lealtad SET activo = ? WHERE id = ?',
      [activo ? 1 : 0, nivelId]
    );

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado correctamente'
    });

  } catch (error: any) {
    console.error('Error al cambiar estado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
