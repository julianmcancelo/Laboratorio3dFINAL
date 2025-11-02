/**
 * 🔐 API Route - Login de Usuarios (MySQL)
 * 
 * Este endpoint maneja el proceso de autenticación de usuarios usando MySQL.
 * Valida credenciales, genera tokens de sesión y retorna información del usuario.
 * 
 * Endpoint: POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  obtenerUsuarioPorEmail, 
  crearSesion,
  testConnection 
} from '@/lib/db-mysql';

/**
 * 🔐 Maneja la solicitud POST para login
 * 
 * @param request - Request de Next.js con credenciales
 * @returns Response con token de sesión y datos del usuario
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar conexión a MySQL
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    const { email, password, recordarme } = await request.json();

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    console.log(`🔐 Intento de login: ${email}`);

    // Buscar usuario en MySQL
    const usuario = await obtenerUsuarioPorEmail(email);
    if (!usuario) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      console.log(`❌ Contraseña incorrecta para: ${email}`);
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Generar token de sesión
    const sessionId = uuidv4();
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + (recordarme ? 24 * 7 : 24)); // 7 días o 24 horas

    // Crear sesión en MySQL
    await crearSesion({
      id: sessionId,
      usuario_id: usuario.id!,
      expira_en: expiraEn.toISOString()
    });

    console.log(`✅ Login exitoso: ${email} (ID: ${usuario.id})`);

    // Preparar respuesta sin contraseña
    const usuarioResponse = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      puntos: usuario.puntos,
      nivel: usuario.nivel,
      codigo_referido: usuario.codigo_referido,
      telefono: usuario.telefono,
      instagram: usuario.instagram
    };

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      usuario: usuarioResponse,
      session_id: sessionId,
      expira_en: expiraEn.toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error en login:', error);
    
    // Manejar errores específicos
    if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * 🔍 GET - Verificar estado de conexión
 */
export async function GET(): Promise<NextResponse> {
  try {
    const connected = await testConnection();
    
    return NextResponse.json({
      mysql_connected: connected,
      message: connected ? 'Conexión MySQL activa' : 'Error en conexión MySQL'
    });
  } catch (error) {
    return NextResponse.json({
      mysql_connected: false,
      message: 'Error verificando conexión MySQL',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
