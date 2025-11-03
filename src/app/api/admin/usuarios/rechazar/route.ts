/**
 * ❌ API Route - Rechazar Usuario (Admin)
 * 
 * Endpoint para que el administrador rechace la validación de un usuario
 */

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, admin_id, motivo } = await request.json();

    if (!usuario_id || !admin_id || !motivo) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (usuario_id, admin_id, motivo)' },
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

    // Verificar que el usuario a rechazar existe
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
        { error: 'No se puede rechazar a un administrador' },
        { status: 400 }
      );
    }

    if (usuario.validado) {
      return NextResponse.json(
        { error: 'No se puede rechazar a un usuario ya validado' },
        { status: 400 }
      );
    }

    // Rechazar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario_id },
      data: {
        validado: false,
        motivoRechazo: motivo,
        aptoParaCanje: false // Al rechazar, no queda apto para canje
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
        tipoTransaccion: 'RECHAZO',
        puntosMovimiento: 0,
        descripcionDetalle: `Validación rechazada: ${motivo}`,
        fechaTransaccion: new Date()
      }
    });

    console.log(`❌ Usuario ${usuario.email} rechazado por admin ${admin.email}. Motivo: ${motivo}`);

    return NextResponse.json({
      success: true,
      message: 'Usuario rechazado exitosamente',
      usuario: {
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        validado: usuarioActualizado.validado,
        motivo_rechazo: usuarioActualizado.motivoRechazo,
        apto_para_canje: usuarioActualizado.aptoParaCanje
      }
    });

  } catch (error: any) {
    console.error('❌ Error rechazando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
