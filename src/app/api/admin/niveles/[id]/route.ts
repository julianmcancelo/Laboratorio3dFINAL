import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// PUT - Actualizar nivel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  
  try {
    const body = await request.json();
    const { nombre_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion, orden, icono_nivel } = body;
    const nivelId = params.id;

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `UPDATE niveles_lealtad 
       SET nombre_nivel = ?, 
           puntos_minimos_requeridos = ?, 
           multiplicador_puntos = ?, 
           descripcion = ?, 
           orden = ?, 
           icono_nivel = ?
       WHERE id = ?`,
      [nombre_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion || '', orden || 0, icono_nivel || '🏅', nivelId]
    );

    return NextResponse.json({
      success: true,
      message: 'Nivel actualizado correctamente'
    });

  } catch (error: any) {
    console.error('Error al actualizar nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
