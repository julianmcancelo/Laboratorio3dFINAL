import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener historial de puntos con paginación
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const resultadosPorPagina = 25;
    const offset = (pagina - 1) * resultadosPorPagina;

    connection = await mysql.createConnection(dbConfig);

    // Contar total de registros
    const [countResult]: any = await connection.execute(
      'SELECT COUNT(*) as total FROM historial_puntos'
    );
    const totalRegistros = countResult[0].total;
    const totalPaginas = Math.ceil(totalRegistros / resultadosPorPagina);

    // Obtener movimientos paginados
    const [rows]: any = await connection.execute(
      `SELECT 
        hp.id as historial_id,
        hp.fecha_transaccion,
        hp.tipo_transaccion,
        hp.puntos_movimiento,
        hp.descripcion_detalle,
        u.nombre_completo as nombre_usuario_afectado,
        u.email as email_usuario_afectado
      FROM historial_puntos hp
      JOIN usuarios u ON hp.usuario_id = u.id
      ORDER BY hp.fecha_transaccion DESC
      LIMIT ? OFFSET ?`,
      [resultadosPorPagina, offset]
    );

    return NextResponse.json({
      movimientos: rows,
      paginaActual: pagina,
      totalPaginas,
      totalRegistros
    });

  } catch (error: any) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
