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

    console.log('🔍 [VALIDAR] Admin encontrado:', admin ? { id: admin.id, email: admin.email, rol: admin.rol } : 'null');

    if (!admin) {
      console.log('❌ [VALIDAR] Admin no encontrado con ID:', admin_id);
      return NextResponse.json(
        { error: 'Administrador no encontrado' },
        { status: 404 }
      );
    }

    // Comparación case-insensitive del rol
    const rolUpper = admin.rol.toString().toUpperCase();
    console.log('🔍 [VALIDAR] Rol comparación:', rolUpper, 'vs ADMIN');
    
    if (rolUpper !== 'ADMIN') {
      console.log('❌ [VALIDAR] Rol no autorizado:', admin.rol);
      return NextResponse.json(
        { error: `No autorizado. Rol actual: ${admin.rol}` },
        { status: 403 }
      );
    }

    console.log('✅ [VALIDAR] Admin autorizado:', admin.email);

    // Verificar que el usuario a validar existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id }
    });

    console.log('🔍 [VALIDAR] Usuario encontrado:', usuario ? { id: usuario.id, email: usuario.email, validado: usuario.validado } : 'null');

    if (!usuario) {
      console.log('❌ [VALIDAR] Usuario no encontrado con ID:', usuario_id);
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
    console.log('🔄 [VALIDAR] Actualizando usuario...', { usuario_id, admin_id });
    
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

    console.log('✅ [VALIDAR] Usuario actualizado en BD:', {
      id: usuarioActualizado.id,
      validado: usuarioActualizado.validado,
      fecha_validacion: usuarioActualizado.fechaValidacion,
      validado_por_id: usuarioActualizado.validadoPorId
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
