import { NextRequest, NextResponse } from 'next/server';
import { ejecutarConsulta } from '@/lib/db';
import type { RowDataPacket } from '@/lib/db';

interface UsuarioReferido extends RowDataPacket {
  id: number;
  nombre_completo: string;
  email: string;
  codigo_referido: string;
  fecha_registro: string;
  referente_nombre: string;
  referente_email: string;
  tiene_compras: number;
  cupon_entregado: boolean;
}

/**
 * 📋 GET - Obtener lista de usuarios referidos pendientes de cupón
 * 
 * Este endpoint muestra usuarios que:
 * - Se registraron con código de referido
 * - Aún no tienen compras o es su primera compra
 * - Necesitan recibir cupón de $25.000 en Tienda Nube
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener usuarios referidos recientes
    const usuariosReferidos = await ejecutarConsulta<UsuarioReferido>(`
      SELECT 
        u.id,
        u.nombre_completo,
        u.email,
        u.codigo_referido,
        u.created_at as fecha_registro,
        ref.nombre_completo as referente_nombre,
        ref.email as referente_email,
        COUNT(c.id) as tiene_compras,
        COALESCE(u.cupon_bienvenida_entregado, FALSE) as cupon_entregado
      FROM usuarios u
      INNER JOIN usuarios ref ON u.referido_por_id = ref.id
      LEFT JOIN compras c ON c.cliente_id = u.id AND c.verificado = TRUE
      WHERE u.referido_por_id IS NOT NULL
      GROUP BY u.id, u.nombre_completo, u.email, u.codigo_referido, u.created_at, 
               ref.nombre_completo, ref.email, u.cupon_bienvenida_entregado
      ORDER BY u.created_at DESC
      LIMIT 50
    `);

    // Separar en pendientes y ya entregados
    const pendientes = usuariosReferidos.filter(u => !u.cupon_entregado);
    const entregados = usuariosReferidos.filter(u => u.cupon_entregado);

    return NextResponse.json({
      success: true,
      pendientes,
      entregados,
      total_pendientes: pendientes.length,
      total_entregados: entregados.length
    });

  } catch (error) {
    console.error('Error al obtener referidos pendientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de referidos' },
      { status: 500 }
    );
  }
}

/**
 * 🎟️ POST - Marcar cupón como entregado
 * 
 * Cuando el admin entrega el cupón en Tienda Nube,
 * marca al usuario para no mostrarlo más en pendientes
 */
export async function POST(request: NextRequest) {
  try {
    const { usuario_id } = await request.json();

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    await ejecutarConsulta(
      'UPDATE usuarios SET cupon_bienvenida_entregado = TRUE WHERE id = ?',
      [usuario_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Cupón marcado como entregado'
    });

  } catch (error) {
    console.error('Error al marcar cupón como entregado:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado' },
      { status: 500 }
    );
  }
}
