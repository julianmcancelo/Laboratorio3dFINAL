import { NextRequest, NextResponse } from 'next/server';
import { ejecutarConsulta } from '@/lib/db';
import type { RowDataPacket } from '@/lib/db';

interface MovimientoPuntos extends RowDataPacket {
  tipo_registro: string;
  id: number;
  fecha: string;
  tipo: 'GANANCIA' | 'GASTO';
  puntos: number;
  descripcion: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Obtener historial de puntos del usuario
    // Incluye comprobantes aprobados y canjes de premios
    const movimientos = await ejecutarConsulta<MovimientoPuntos>(`
      SELECT 
        'comprobante' as tipo_registro,
        c.id,
        c.fecha_validacion as fecha,
        'GANANCIA' as tipo,
        c.puntos_otorgados as puntos,
        CONCAT('Comprobante aprobado: $', c.monto) as descripcion
      FROM comprobantes c
      WHERE c.usuario_id = ? 
        AND c.estado = 'aprobado'
        AND c.fecha_validacion IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'canje' as tipo_registro,
        cp.id,
        cp.fecha_canje as fecha,
        'GASTO' as tipo,
        p.puntos_requeridos as puntos,
        CONCAT('Premio canjeado: ', p.nombre) as descripcion
      FROM canjes_premios cp
      JOIN premios p ON cp.premio_id = p.id
      WHERE cp.cliente_id = ?
      
      ORDER BY fecha DESC
      LIMIT 10
    `, [userId, userId]);

    return NextResponse.json({
      success: true,
      movimientos
    });
  } catch (error) {
    console.error('Error al obtener historial de puntos:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial de puntos' },
      { status: 500 }
    );
  }
}
