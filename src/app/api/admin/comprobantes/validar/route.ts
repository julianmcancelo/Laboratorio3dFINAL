import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { comprobante_id, estado, puntos_otorgados } = body;

    // Validaciones
    if (!comprobante_id || !estado) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Obtener información del comprobante
    const [comprobantes]: any = await connection.execute(
      'SELECT usuario_id, monto, estado FROM comprobantes WHERE id = ?',
      [comprobante_id]
    );

    if (comprobantes.length === 0) {
      return NextResponse.json(
        { error: 'Comprobante no encontrado' },
        { status: 404 }
      );
    }

    const comprobante = comprobantes[0];

    if (comprobante.estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'El comprobante ya fue procesado' },
        { status: 400 }
      );
    }

    // Usar los puntos que vienen del frontend (editados por el admin)
    const puntosAOtorgar = estado === 'aprobado' ? (puntos_otorgados || 0) : 0;

    // Actualizar estado del comprobante
    await connection.execute(
      `UPDATE comprobantes 
       SET estado = ?, 
           puntos_otorgados = ?,
           fecha_validacion = NOW()
       WHERE id = ?`,
      [estado, puntosAOtorgar, comprobante_id]
    );

    // Si fue aprobado, otorgar puntos al usuario
    if (estado === 'aprobado' && puntosAOtorgar > 0) {
      await connection.execute(
        'UPDATE usuarios SET puntos_acumulados = puntos_acumulados + ? WHERE id = ?',
        [puntosAOtorgar, comprobante.usuario_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Comprobante ${estado} exitosamente`,
      puntos_otorgados: puntosAOtorgar
    });

  } catch (error: any) {
    console.error('Error al validar comprobante:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
