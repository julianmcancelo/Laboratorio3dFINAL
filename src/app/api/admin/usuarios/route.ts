/**
 * 🔐 API Route - Gestión de Usuarios (Admin)
 * 
 * Endpoints para que el administrador pueda ver y gestionar usuarios
 */

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// GET - Obtener todos los usuarios con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado'); // 'pendientes', 'validados', 'rechazados', 'todos'
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');
    const busqueda = searchParams.get('busqueda') || '';

    // Construir filtro where
    let whereClause: any = {};
    
    if (estado === 'pendientes') {
      whereClause.validado = false;
      whereClause.motivoRechazo = null;
    } else if (estado === 'validados') {
      whereClause.validado = true;
    } else if (estado === 'rechazados') {
      whereClause.validado = false;
      whereClause.motivoRechazo = { not: null };
    }

    // Búsqueda por nombre, email o DNI
    if (busqueda) {
      whereClause.OR = [
        { nombreCompleto: { contains: busqueda } },
        { email: { contains: busqueda } },
        { dni: { contains: busqueda } }
      ];
    }

    // Excluir administradores
    whereClause.rol = { not: 'ADMIN' };

    const skip = (pagina - 1) * limite;

    // Obtener usuarios y total
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: whereClause,
        include: {
          nivelLealtad: true,
          validadoPor: {
            select: {
              id: true,
              nombreCompleto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limite
      }),
      prisma.usuario.count({ where: whereClause })
    ]);

    // Formatear datos
    const usuariosFormateados = usuarios.map(usuario => ({
      id: usuario.id,
      nombre_completo: usuario.nombreCompleto,
      email: usuario.email,
      dni: usuario.dni,
      instagram: usuario.instagram,
      rol: usuario.rol,
      puntos: usuario.puntosAcumulados,
      nivel: usuario.nivelLealtad?.nombre || 'Sin nivel',
      validado: usuario.validado,
      fecha_validacion: usuario.fechaValidacion,
      validado_por: usuario.validadoPor?.nombreCompleto || null,
      motivo_rechazo: usuario.motivoRechazo,
      apto_para_canje: usuario.aptoParaCanje,
      creado_en: usuario.createdAt,
      codigo_referido: usuario.codigoReferido
    }));

    return NextResponse.json({
      success: true,
      usuarios: usuariosFormateados,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
