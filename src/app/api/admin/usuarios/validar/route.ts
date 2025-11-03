/**
 * ✅ API Route - Validar Usuario (Admin)
 * 
 * Endpoint para que el administrador apruebe la validación de un usuario
 */

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, admin_id } = await request.json();

    if (!usuario_id || !admin_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el admin existe y es admin
    const admin = await prisma.usuario.findUnique({
      where: { id: admin_id }
    });

    if (!admin || admin.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Verificar que el usuario a validar existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (usuario.rol === 'ADMIN') {
      return NextResponse.json(
        { error: 'No se puede validar a un administrador' },
        { status: 400 }
      );
    }

    if (usuario.validado) {
      return NextResponse.json(
        { error: 'El usuario ya está validado' },
        { status: 400 }
      );
    }

    // Validar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario_id },
      data: {
        validado: true,
        fechaValidacion: new Date(),
        validadoPorId: admin_id,
        motivoRechazo: null,
        aptoParaCanje: true // Al validar, queda apto para canje
      },
      include: {
        validadoPor: {
          select: {
            id: true,
            nombreCompleto: true
          }
        }
      }
    });

    // Crear registro en historial de puntos
    await prisma.historialPunto.create({
      data: {
        usuarioId: usuario_id,
        tipoTransaccion: 'VALIDACION',
        puntosMovimiento: 0,
        descripcionDetalle: 'Usuario validado por administrador',
        fechaTransaccion: new Date()
      }
    });

    console.log(`✅ Usuario ${usuario.email} validado por admin ${admin.email}`);

    return NextResponse.json({
      success: true,
      message: 'Usuario validado exitosamente',
      usuario: {
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        validado: usuarioActualizado.validado,
        fecha_validacion: usuarioActualizado.fechaValidacion,
        validado_por: usuarioActualizado.validadoPor?.nombreCompleto,
        apto_para_canje: usuarioActualizado.aptoParaCanje
      }
    });

  } catch (error: any) {
    console.error('❌ Error validando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
