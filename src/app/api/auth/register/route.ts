/**
 * 🔐 API Route - Registro de Usuarios (Prisma + Base de Datos Real)
 * 
 * Este endpoint maneja el proceso de registro usando Prisma
 * con la estructura REAL de la base de datos existente.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  obtenerUsuarioPorEmail, 
  crearUsuario,
  testConnection 
} from '@/lib/prisma-client';

// Generar código de referido único
function generarCodigoReferido(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

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

    const {
      nombre_completo,
      dni,
      email,
      password,
      password_confirmation,
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

    // Verificar si el email ya existe en la base de datos real
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

    // Generar código de referido
    const codigoReferido = generarCodigoReferido();

    // Crear usuario en la base de datos real con Prisma
    const usuarioId = await crearUsuario({
      nombre_completo: nombre_completo.trim(),
      dni: dni.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash, // Usar password como campo principal
      password_hash: passwordHash, // También guardar en password_hash para compatibilidad
      rol: 'CLIENTE', // Usar valor del enum mapeado
      puntos_acumulados: 500, // 🎁 Bono de bienvenida según documento
      instagram: instagram?.trim() || null,
      codigo_referido: codigoReferido,
      referido_por_id: undefined, // TODO: Implementar lógica de referidos si es necesario
      apto_para_canje: true,
      nivel_lealtad_id: 1 // ID del nivel Bronce
    });

    console.log(`✅ Usuario creado exitosamente: ${email} (ID: ${usuarioId})`);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuarioId,
        nombre_completo: nombre_completo.trim(),
        email: email.toLowerCase().trim(),
        codigo_referido: codigoReferido,
        puntos: 1500,
        nivel: 'Bronce'
      }
    });

  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email o DNI ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const connected = await testConnection();
    
    return NextResponse.json({
      prisma_connected: connected,
      message: connected ? 'Conexión Prisma activa - Registro listo' : 'Error en conexión Prisma'
    });
  } catch (error) {
    return NextResponse.json({
      prisma_connected: false,
      message: 'Error verificando conexión Prisma',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
