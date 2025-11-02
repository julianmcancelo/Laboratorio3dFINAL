/**
 * 🔐 API Route - Recuperación de Contraseña (Prisma)
 * 
 * Este endpoint maneja el proceso de recuperación de contraseña usando Prisma.
 * Incluye solicitud de recuperación, verificación de token y restablecimiento.
 * 
 * Endpoints:
 * - POST /api/auth/recuperar - Solicitar recuperación
 * - PUT /api/auth/recuperar - Restablecer contraseña
 * - GET /api/auth/recuperar - Verificar token
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  obtenerUsuarioPorEmail,
  crearTokenRecuperacion,
  obtenerTokenRecuperacion,
  actualizarPasswordUsuario,
  testConnection 
} from '@/lib/prisma-client';

/**
 * 🔐 POST - Solicitar recuperación de contraseña
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔐 Solicitud de recuperación para: ${email}`);

    // Buscar usuario en la base de datos real
    const usuario = await obtenerUsuarioPorEmail(email);
    
    if (!usuario) {
      // Por seguridad, no revelamos si el email existe
      console.log(`⚠️ Email no encontrado: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // Generar token de recuperación
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Crear token en la base de datos
    await crearTokenRecuperacion(usuario.id!, token);

    // En desarrollo, mostramos el token en la respuesta
    // En producción, aquí enviarías un email
    console.log(`🔑 Token de recuperación para ${email}: ${token}`);
    console.log(`🔗 Link de recuperación: http://localhost:3000/recuperar/${token}`);

    return NextResponse.json({
      success: true,
      message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña',
      // Solo para desarrollo
      debug: {
        token,
        link: `http://localhost:3000/recuperar/${token}`
      }
    });

  } catch (error) {
    console.error('❌ Error en recuperación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🔐 PUT - Restablecer contraseña
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar conexión a Prisma
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    const { token, nueva_password, confirmar_password } = await request.json();

    if (!token || !nueva_password || !confirmar_password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (nueva_password !== confirmar_password) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    if (nueva_password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    console.log(`🔐 Intento de restablecimiento con token: ${token}`);

    // Verificar token en la base de datos
    const tokenData = await obtenerTokenRecuperacion(token);
    
    if (!tokenData) {
      console.log(`❌ Token inválido o expirado: ${token}`);
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(nueva_password, 10);
    
    // Actualizar contraseña del usuario
    await actualizarPasswordUsuario(tokenData.usuarioId, passwordHash);

    // Marcar token como usado (simulado por ahora)
    // TODO: Implementar función para marcar token como usado en Prisma
    console.log(`✅ Contraseña actualizada para usuario ID: ${tokenData.usuarioId}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🔐 GET - Verificar token
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

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔐 Verificando token: ${token}`);

    const tokenData = await obtenerTokenRecuperacion(token);
    
    if (!tokenData) {
      console.log(`❌ Token inválido o expirado: ${token}`);
      return NextResponse.json(
        { valid: false, error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    console.log(`✅ Token válido para usuario ID: ${tokenData.usuarioId}`);

    return NextResponse.json({
      valid: true,
      message: 'Token válido',
      usuario_id: tokenData.usuarioId
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
