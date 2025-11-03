/**
 * 🔐 API Route - Verificación de Sesión
 * 
 * Este endpoint verifica si una sesión es válida y retorna
 * la información del usuario asociado.
 */

import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesion, obtenerUsuarioPorId, testConnection } from '@/lib/prisma-client';

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

    const sessionId = authHeader.substring(7); // Remover 'Bearer '

    // Verificar si la sesión existe y no ha expirado
    const sesion = await obtenerSesion(sessionId);
    if (!sesion) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    // Obtener información del usuario
    const usuario = await obtenerUsuarioPorId(sesion.usuario_id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Sesión verificada: ${usuario.email} (ID: ${usuario.id})`);
    console.log(`💎 Puntos acumulados de usuario ${usuario.id}: ${usuario.puntos_acumulados}`);

    // Retornar información del usuario
    return NextResponse.json({
      success: true,
      message: 'Sesión válida',
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        puntos: usuario.puntos_acumulados || 0,
        nivel: usuario.nivel || 'Bronce', // Ahora usa el nombre del nivel
        rol: usuario.rol,
        codigo_referido: usuario.codigo_referido,
        instagram: usuario.instagram,
        apto_para_canje: usuario.apto_para_canje,
        validado: (usuario as any).validado || false
      },
      sesion: {
        id: sesion.id,
        expira_en: sesion.expira_en
      }
    });

  } catch (error: any) {
    console.error('❌ Error verificando sesión:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Para refresh de sesión o extensión
    const { session_id } = await request.json();
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'Se requiere session_id' },
        { status: 400 }
      );
    }

    const sesion = await obtenerSesion(session_id);
    if (!sesion) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sesión válida',
      expira_en: sesion.expira_en
    });

  } catch (error: any) {
    console.error('❌ Error en refresh de sesión:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
