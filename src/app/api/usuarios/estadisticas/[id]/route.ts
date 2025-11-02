/**
 * 📊 API Route - Estadísticas de Usuario (Prisma)
 * 
 * Endpoint para obtener estadísticas detalladas de un usuario.
 * Requiere autenticación y devuelve información personalizada.
 * 
 * Endpoint: GET /api/usuarios/estadisticas/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  obtenerSesion,
  obtenerEstadisticasUsuario,
  testConnection 
} from '@/lib/prisma-client';

/**
 * 📊 GET - Obtener estadísticas del usuario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    // Verificar sesión activa
    const sesion = await obtenerSesion(sessionId);
    if (!sesion) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    // Verificar que el usuario solicita sus propias estadísticas
    const usuarioIdSolicitado = parseInt(params.id, 10);
    if (sesion.usuario_id !== usuarioIdSolicitado) {
      console.log(`❌ Usuario ${sesion.usuario_id} intentando acceder a estadísticas de ${usuarioIdSolicitado}`);
      return NextResponse.json(
        { error: 'No tienes permisos para ver estas estadísticas' },
        { status: 403 }
      );
    }

    console.log(`📊 Obteniendo estadísticas para usuario ID: ${usuarioIdSolicitado}`);

    // Obtener estadísticas del usuario
    const estadisticas = await obtenerEstadisticasUsuario(usuarioIdSolicitado);

    if (!estadisticas) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Estadísticas obtenidas para usuario ID: ${usuarioIdSolicitado}`);

    return NextResponse.json({
      success: true,
      ...estadisticas
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🚫 Método no permitido para otros métodos HTTP
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

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
