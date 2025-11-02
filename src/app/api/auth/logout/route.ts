/**
 * 🚪 API Route - Logout de Usuarios (Prisma)
 * 
 * Este endpoint maneja el proceso de cierre de sesión de usuarios.
 * Elimina la sesión de la base de datos usando Prisma.
 * 
 * Endpoint: POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { eliminarSesion, obtenerSesion, testConnection } from '@/lib/prisma-client';

/**
 * 🚪 Maneja la solicitud POST para logout
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚪 Iniciando proceso de logout');

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
    let sessionId = null;
    let usuarioInfo = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.substring(7);
      
      // Verificar si la sesión existe antes de eliminar
      try {
        const sesion = await obtenerSesion(sessionId);
        if (sesion) {
          usuarioInfo = `Usuario ID: ${sesion.usuario_id}`;
          console.log(`👤 Usuario haciendo logout: ${usuarioInfo}`);
        }
      } catch (error) {
        console.log('⚠️ Error verificando sesión, procediendo con logout');
      }

      // Eliminar la sesión de la base de datos
      if (sessionId) {
        try {
          await eliminarSesion(sessionId);
          console.log(`✅ Sesión eliminada: ${sessionId}`);
        } catch (error) {
          console.log('⚠️ Error eliminando sesión, pero continuando con logout');
        }
      }
    } else {
      console.log('⚠️ Logout sin session_id en Authorization header');
    }

    // Retornar respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente',
        redirigir_a: '/login',
        usuario: usuarioInfo
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error en el proceso de logout:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al cerrar sesión',
        codigo: 'ERROR_LOGOUT'
      },
      { status: 500 }
    );
  }
}

/**
 * 🚫 Método no permitido para GET
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método no permitido',
      codigo: 'METODO_NO_PERMITIDO'
    },
    { status: 405 }
  );
}
