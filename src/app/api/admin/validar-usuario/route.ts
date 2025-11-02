/**
 * 🛡️ API Route - Validación de Usuarios (Solo Admin)
 * 
 * Este endpoint permite que solo los administradores validen usuarios.
 * Incluye verificación de rol de administrador y actualización de estado.
 * 
 * Endpoint: POST /api/admin/validar-usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  obtenerSesion,
  obtenerUsuarioPorId,
  actualizarUsuario,
  testConnection 
} from '@/lib/prisma-client';

/**
 * 🛡️ POST - Validar usuario (Solo Admin)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar conexión a Prisma
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Obtener session_id del header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No se proporcionó token de sesión' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);

    // Verificar sesión del administrador
    const sesionAdmin = await obtenerSesion(sessionId);
    if (!sesionAdmin) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    // Obtener datos del administrador
    const admin = await obtenerUsuarioPorId(sesionAdmin.usuario_id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Administrador no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que sea administrador
    if (admin.rol !== 'ADMIN') {
      console.log(`❌ Usuario no autorizado intentando validar: ${admin.email} (Rol: ${admin.rol})`);
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const { usuario_id, validar } = await request.json();

    if (!usuario_id || typeof validar !== 'boolean') {
      return NextResponse.json(
        { error: 'Se requiere usuario_id y validar (boolean)' },
        { status: 400 }
      );
    }

    console.log(`🛡️ Admin ${admin.email} validando usuario ID: ${usuario_id}, validar: ${validar}`);

    // Obtener usuario a validar
    const usuarioAValidar = await obtenerUsuarioPorId(usuario_id);
    if (!usuarioAValidar) {
      return NextResponse.json(
        { error: 'Usuario a validar no encontrado' },
        { status: 404 }
      );
    }

    // No permitir validar a otros administradores
    if (usuarioAValidar.rol === 'ADMIN') {
      return NextResponse.json(
        { error: 'No se puede validar a otro administrador' },
        { status: 403 }
      );
    }

    // Actualizar estado de validación del usuario
    await actualizarUsuario(usuario_id, {
      // TODO: Agregar campo 'validado' a la tabla de usuarios
      // Por ahora, usaremos 'activo' como indicador de validación
      activo: validar
    });

    console.log(`✅ Usuario ${usuarioAValidar.email} ${validar ? 'validado' : 'invalidado'} por admin ${admin.email}`);

    return NextResponse.json({
      success: true,
      message: `Usuario ${validar ? 'validado' : 'invalidado'} exitosamente`,
      usuario: {
        id: usuarioAValidar.id,
        email: usuarioAValidar.email,
        nombre_completo: usuarioAValidar.nombre_completo,
        validado: validar
      },
      validado_por: {
        id: admin.id,
        email: admin.email,
        nombre_completo: admin.nombre_completo
      }
    });

  } catch (error: any) {
    console.error('❌ Error en validación de usuario:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🛡️ GET - Listar usuarios pendientes de validación (Solo Admin)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar conexión a Prisma
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Obtener session_id del header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No se proporcionó token de sesión' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);

    // Verificar sesión del administrador
    const sesionAdmin = await obtenerSesion(sessionId);
    if (!sesionAdmin) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    // Obtener datos del administrador
    const admin = await obtenerUsuarioPorId(sesionAdmin.usuario_id);
    if (!admin || admin.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const solo_pendientes = searchParams.get('solo_pendientes') === 'true';
    const pagina = parseInt(searchParams.get('pagina') || '1', 10);
    const limite = parseInt(searchParams.get('limite') || '20', 10);

    console.log(`🛡️ Admin ${admin.email} listando usuarios (pendientes: ${solo_pendientes})`);

    // TODO: Implementar consulta con filtros en Prisma
    // Por ahora, retornamos una estructura básica
    return NextResponse.json({
      success: true,
      usuarios: [], // TODO: Implementar lista real de usuarios
      paginacion: {
        pagina_actual: pagina,
        total_paginas: 0,
        total_registros: 0,
        registros_por_pagina: limite
      },
      filtros: {
        solo_pendientes
      }
    });

  } catch (error: any) {
    console.error('❌ Error listando usuarios pendientes:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🚫 Método no permitido para otros métodos HTTP
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
