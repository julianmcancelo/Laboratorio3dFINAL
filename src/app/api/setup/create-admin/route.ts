/**
 * 🔧 API Route - Crear primer usuario administrador
 * 
 * Este endpoint solo funciona cuando no hay usuarios en la BD
 * y crea el primer usuario con rol ADMIN
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Verificar que no existan usuarios
    const usuarioCount = await prisma.usuario.count();
    if (usuarioCount > 0) {
      return NextResponse.json(
        { error: 'Ya existen usuarios en el sistema' },
        { status: 400 }
      );
    }

    const datos = await request.json();
    const { nombre_completo, email, password, confirmar_password, dni, instagram } = datos;

    // Validaciones básicas
    if (!nombre_completo || !email || !password || !confirmar_password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password !== confirmar_password) {
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

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario administrador
    const usuario = await prisma.usuario.create({
      data: {
        nombreCompleto: nombre_completo,
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        rol: 'ADMIN',
        puntosAcumulados: 0,
        aptoParaCanje: false,
        dni: dni || null,
        instagram: instagram || null,
        codigoReferido: `ADMIN-${Date.now()}`
      }
    });

    console.log(`✅ Primer administrador creado: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Administrador creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error: any) {
    console.error('❌ Error creando administrador:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
