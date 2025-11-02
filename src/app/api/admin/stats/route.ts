import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // Total usuarios
    const [usuarios]: any = await connection.execute(
      'SELECT COUNT(*) as total FROM usuarios WHERE rol = ?',
      ['USER']
    );

    // Comprobantes pendientes
    const [pendientes]: any = await connection.execute(
      'SELECT COUNT(*) as total FROM comprobantes WHERE estado = ?',
      ['pendiente']
    );

    // Comprobantes aprobados
    const [aprobados]: any = await connection.execute(
      'SELECT COUNT(*) as total FROM comprobantes WHERE estado = ?',
      ['aprobado']
    );

    // Puntos otorgados hoy
    const [puntosHoy]: any = await connection.execute(
      'SELECT COALESCE(SUM(puntos_otorgados), 0) as total FROM comprobantes WHERE estado = ? AND DATE(fecha_validacion) = CURDATE()',
      ['aprobado']
    );

    return NextResponse.json({
      totalUsuarios: usuarios[0].total,
      totalComprobantes: pendientes[0].total + aprobados[0].total,
      comprobantesPendientes: pendientes[0].total,
      comprobantesAprobados: aprobados[0].total,
      puntosOtorgadosHoy: puntosHoy[0].total
    });

  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
