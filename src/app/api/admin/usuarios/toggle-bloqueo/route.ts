import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, admin_id } = await request.json();

    // Validar datos
    if (!usuario_id || !admin_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el admin existe
    const admin = await prisma.usuario.findUnique({
      where: { id: admin_id }
    });

    if (!admin || admin.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Toggle de aptoParaCanje (usado como proxy de bloqueo)
    // NOTA: Agregar campo 'estado' String? @default("ACTIVO") al schema de Prisma para producción
    const nuevoEstado = !usuario.aptoParaCanje;

    // Actualizar el estado de apto para canje (bloqueo)
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario_id },
      data: {
        aptoParaCanje: nuevoEstado
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: `Usuario ${nuevoEstado ? 'desbloqueado' : 'bloqueado'} exitosamente`,
      usuario: {
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        estado: usuarioActualizado.aptoParaCanje ? 'ACTIVO' : 'BLOQUEADO'
      }
    });

  } catch (error) {
    console.error('Error cambiando estado de usuario:', error);
    return NextResponse.json(
      { error: 'Error al cambiar el estado del usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
