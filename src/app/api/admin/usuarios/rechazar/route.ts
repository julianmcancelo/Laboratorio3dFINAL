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

    console.log('🔍 [RECHAZAR] Admin encontrado:', admin ? { id: admin.id, email: admin.email, rol: admin.rol } : 'null');

    if (!admin) {
      console.log('❌ [RECHAZAR] Admin no encontrado con ID:', admin_id);
      return NextResponse.json(
        { error: 'Administrador no encontrado' },
        { status: 404 }
      );
    }

    // Comparación case-insensitive del rol
    const rolUpper = admin.rol.toString().toUpperCase();
    console.log('🔍 [RECHAZAR] Rol comparación:', rolUpper, 'vs ADMIN');
    
    if (rolUpper !== 'ADMIN') {
      console.log('❌ [RECHAZAR] Rol no autorizado:', admin.rol);
      return NextResponse.json(
        { error: `No autorizado. Rol actual: ${admin.rol}` },
        { status: 403 }
      );
    }

    console.log('✅ [RECHAZAR] Admin autorizado:', admin.email);

    // Verificar que el usuario a rechazar existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id }
    });

    console.log('🔍 [RECHAZAR] Usuario encontrado:', usuario ? { id: usuario.id, email: usuario.email, validado: usuario.validado } : 'null');

    if (!usuario) {
      console.log('❌ [RECHAZAR] Usuario no encontrado con ID:', usuario_id);
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
    console.log('🔄 [RECHAZAR] Actualizando usuario...', { usuario_id, admin_id, motivo });
    
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

    console.log('✅ [RECHAZAR] Usuario actualizado en BD:', {
      id: usuarioActualizado.id,
      validado: usuarioActualizado.validado,
      motivo_rechazo: usuarioActualizado.motivoRechazo
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
