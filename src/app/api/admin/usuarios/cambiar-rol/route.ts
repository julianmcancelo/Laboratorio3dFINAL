import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, nuevo_rol, admin_id } = await request.json();

    // Validar datos
    if (!usuario_id || !nuevo_rol || !admin_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el nuevo_rol sea válido
    const rolesValidos = ['CLIENTE', 'OPERADOR', 'ADMIN'];
    if (!rolesValidos.includes(nuevo_rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
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

    // Cambiar el rol
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario_id },
      data: {
        rol: nuevo_rol
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: `Rol cambiado a ${nuevo_rol}`,
      usuario: {
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol
      }
    });

  } catch (error) {
    console.error('Error cambiando rol:', error);
    return NextResponse.json(
      { error: 'Error al cambiar el rol del usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
