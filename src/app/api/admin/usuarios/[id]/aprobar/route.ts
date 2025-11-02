import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// PATCH - Aprobar usuario para canjes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  
  try {
    const usuarioId = params.id;

    connection = await mysql.createConnection(dbConfig);

    // Verificar que el usuario existe y es un cliente
    const [usuario]: any = await connection.execute(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (usuario[0].rol !== 'cliente') {
      return NextResponse.json(
        { error: 'Solo se pueden aprobar clientes' },
        { status: 400 }
      );
    }

    // Aprobar usuario
    await connection.execute(
      'UPDATE usuarios SET apto_para_canje = TRUE WHERE id = ?',
      [usuarioId]
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario aprobado correctamente'
    });

  } catch (error: any) {
    console.error('Error al aprobar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
