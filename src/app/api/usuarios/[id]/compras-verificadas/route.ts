import { NextRequest, NextResponse } from 'next/server';
import { ejecutarConsulta } from '@/lib/db';
import type { RowDataPacket } from '@/lib/db';

interface CompraVerificada extends RowDataPacket {
  id: number;
  fecha_aprobacion: string;
  monto: number;
  descripcion: string;
  puntos_otorgados: number;
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

    // Obtener compras verificadas (comprobantes aprobados)
    const compras = await ejecutarConsulta<CompraVerificada>(`
      SELECT 
        id,
        fecha_validacion as fecha_aprobacion,
        monto,
        CONCAT('Comprobante #', id, ' - ', 
          CASE 
            WHEN descripcion IS NOT NULL THEN descripcion
            ELSE 'Sin descripción'
          END
        ) as descripcion,
        puntos_otorgados
      FROM comprobantes
      WHERE usuario_id = ? 
        AND estado = 'aprobado'
        AND fecha_validacion IS NOT NULL
      ORDER BY fecha_validacion DESC
      LIMIT 5
    `, [userId]);

    return NextResponse.json({
      success: true,
      compras
    });
  } catch (error) {
    console.error('Error al obtener compras verificadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las compras verificadas' },
      { status: 500 }
    );
  }
}
