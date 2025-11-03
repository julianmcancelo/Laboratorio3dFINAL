/**
 * 🔧 API Route - Verificar si necesita setup inicial
 * 
 * Este endpoint verifica si existe algún usuario en la BD
 * para determinar si se necesita crear el primer administrador
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    // Verificar si existe algún usuario
    const usuarioCount = await prisma.usuario.count();
    
    return NextResponse.json({
      needsSetup: usuarioCount === 0,
      usuarioCount
    });

  } catch (error: any) {
    console.error('❌ Error verificando setup:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
