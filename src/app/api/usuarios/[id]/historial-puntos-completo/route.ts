import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const usuarioId = parseInt(params.id);

    if (isNaN(usuarioId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Pool de conexiones a MySQL inicializado');

    // Obtener historial completo de puntos
    const [historial]: any = await connection.execute(
      `SELECT 
        hp.id,
        hp.tipo,
        hp.puntos,
        hp.descripcion,
        hp.comprobante_id,
        c.monto as comprobante_monto,
        c.nombre_comprador,
        hp.created_at
      FROM historial_puntos hp
      LEFT JOIN comprobantes c ON hp.comprobante_id = c.id
      WHERE hp.usuario_id = ?
      ORDER BY hp.created_at DESC
      LIMIT 100`,
      [usuarioId]
    );

    // Obtener resumen
    const [resumen]: any = await connection.execute(
      `SELECT 
        SUM(CASE WHEN puntos > 0 THEN puntos ELSE 0 END) as total_ganados,
        SUM(CASE WHEN puntos < 0 THEN ABS(puntos) ELSE 0 END) as total_gastados,
        SUM(CASE WHEN tipo = 'bonus_referido' THEN puntos ELSE 0 END) as puntos_por_referidos,
        SUM(CASE WHEN tipo = 'comprobante' THEN puntos ELSE 0 END) as puntos_por_comprobantes,
        SUM(CASE WHEN tipo = 'canje' THEN ABS(puntos) ELSE 0 END) as puntos_canjeados,
        COUNT(*) as total_movimientos
      FROM historial_puntos
      WHERE usuario_id = ?`,
      [usuarioId]
    );

    return NextResponse.json({
      success: true,
      historial: historial,
      resumen: resumen[0] || {
        total_ganados: 0,
        total_gastados: 0,
        puntos_por_referidos: 0,
        puntos_por_comprobantes: 0,
        puntos_canjeados: 0,
        total_movimientos: 0
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo historial de puntos:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener historial',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
