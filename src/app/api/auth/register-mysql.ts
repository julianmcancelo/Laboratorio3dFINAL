/**
 * 🔐 API Route - Registro de Usuarios (MySQL)
 * 
 * Este endpoint maneja el registro de nuevos usuarios en MySQL.
 * Valida datos, hashea contraseñas y crea el usuario.
 * 
 * Endpoint: POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  crearUsuario,
  obtenerUsuarioPorEmail,
  testConnection 
} from '@/lib/db-mysql';

/**
 * 🔐 Maneja la solicitud POST para registro
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

    const {
      nombre_completo,
      dni,
      email,
      password,
      password_confirmation,
      telefono,
      instagram,
      codigo_referido,
      acepta_terminos,
      acepta_privacidad
    } = await request.json();

    console.log(`📝 Intento de registro: ${email} - ${nombre_completo}`);

    // Validaciones básicas
    if (!nombre_completo || !dni || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (!acepta_terminos || !acepta_privacidad) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y condiciones y la política de privacidad' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en MySQL
    const usuarioExistente = await obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      console.log(`❌ Email ya registrado: ${email}`);
      return NextResponse.json(
        { error: `El email "${email}" ya está registrado. Intenta con otro email o recupera tu contraseña.` },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Generar código de referido único
    const codigoReferido = generarCodigoReferido();

    // Crear usuario en MySQL
    const usuarioId = await crearUsuario({
      nombre_completo: nombre_completo.trim(),
      dni: dni.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      telefono: telefono?.trim() || null,
      instagram: instagram?.trim() || null,
      puntos: 1500, // Puntos iniciales
      nivel: 'Bronce', // Nivel inicial
      codigo_referido: codigoReferido,
      referido_por: codigo_referido?.trim() || null,
      activo: true
    });

    console.log(`✅ Usuario creado exitosamente: ${email} (ID: ${usuarioId})`);

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario_id: usuarioId,
      codigo_referido: codigoReferido,
      puntos_iniciales: 1500,
      nivel_inicial: 'Bronce'
    });

  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    
    // Manejar errores específicos de MySQL
    if (error.message.includes('ER_DUP_ENTRY')) {
      return NextResponse.json(
        { error: 'El email o DNI ya está registrado' },
        { status: 409 }
      );
    }

    if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
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
      message: connected ? 'Conexión MySQL activa para registro' : 'Error en conexión MySQL'
    });
  } catch (error) {
    return NextResponse.json({
      mysql_connected: false,
      message: 'Error verificando conexión MySQL',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * 🔧 Generar código de referido único
 */
function generarCodigoReferido(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}
