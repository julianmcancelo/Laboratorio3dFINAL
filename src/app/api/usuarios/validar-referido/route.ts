import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/usuarios/validar-referido
 * Validar código de referido para sistema de recomendaciones
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const usuarioActual = parseInt(searchParams.get('usuario_actual') || '0');

    if (!codigo) {
      return NextResponse.json({
        success: false,
        error: 'Código de referido requerido'
      }, { status: 400 });
    }

    // Buscar usuario por código de referido
    const usuario = await prisma.usuario.findFirst({
      where: {
        codigoReferido: codigo.toUpperCase().trim(),
        validado: true, // Solo usuarios validados pueden ser referidos
        aptoParaCanje: true // Solo usuarios activos (no bloqueados)
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        codigoReferido: true
      }
    });

    // Verificar que no sea el mismo usuario
    if (usuario && usuario.id === usuarioActual) {
      return NextResponse.json({
        success: false,
        error: 'No puedes usar tu propio código de referido'
      });
    }

    if (!usuario) {
      return NextResponse.json({
        success: false,
        error: 'Código de referido no encontrado o usuario no válido'
      });
    }

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombreCompleto,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Error validando referido:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al validar código de referido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
