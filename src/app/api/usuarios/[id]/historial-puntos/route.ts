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

    // Obtener historial de puntos del usuario desde la nueva tabla
    const movimientos = await ejecutarConsulta<MovimientoPuntos>(`
      SELECT 
        hp.tipo as tipo_registro,
        hp.id,
        hp.created_at as fecha,
        CASE 
          WHEN hp.puntos > 0 THEN 'GANANCIA'
          ELSE 'GASTO'
        END as tipo,
        ABS(hp.puntos) as puntos,
        CASE 
          WHEN hp.tipo = 'comprobante' THEN 
            CONCAT('💰 ', hp.descripcion)
          WHEN hp.tipo = 'bonus_referido' THEN 
            CONCAT('🎁 ', hp.descripcion)
          WHEN hp.tipo = 'canje' THEN 
            CONCAT('🎁 ', hp.descripcion)
          WHEN hp.tipo = 'bono_bienvenida' THEN 
            CONCAT('🎉 ', hp.descripcion)
          WHEN hp.tipo = 'ajuste_manual' THEN 
            CONCAT('⚙️ ', hp.descripcion)
          ELSE 
            hp.descripcion
        END as descripcion
      FROM historial_puntos hp
      WHERE hp.usuario_id = ?
      ORDER BY hp.created_at DESC
      LIMIT 10
    `, [userId]);

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
