import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, puntos, admin_id } = await request.json();

    // Validar datos
    if (!usuario_id || puntos === undefined || !admin_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que puntos sea un número
    const puntosNum = parseInt(puntos);
    if (isNaN(puntosNum)) {
      return NextResponse.json(
        { error: 'Los puntos deben ser un número válido' },
        { status: 400 }
      );
    }

    // Verificar que el admin existe
    const admin = await prisma.usuario.findUnique({
      where: { id: admin_id }
    });

    if (!admin || admin.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular nuevos puntos (sumar o restar)
    const puntosActuales = usuario.puntosAcumulados || 0;
    const nuevosPuntos = puntosActuales + puntosNum;

    // No permitir puntos negativos
    if (nuevosPuntos < 0) {
      return NextResponse.json(
        { error: 'El usuario no puede tener puntos negativos' },
        { status: 400 }
      );
    }

    // Actualizar puntos
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario_id },
      data: {
        puntosAcumulados: nuevosPuntos
      }
    });

    // Recalcular nivel según los nuevos puntos
    let nuevoNivelId = usuario.nivelLealtadId;
    
    // Obtener niveles disponibles
    const niveles = await prisma.nivelLealtad.findMany({
      orderBy: { puntosMinimosRequeridos: 'desc' }
    });

    // Encontrar el nivel correspondiente
    for (const nivel of niveles) {
      if (nuevosPuntos >= nivel.puntosMinimosRequeridos) {
        nuevoNivelId = nivel.id;
        break;
      }
    }

    // Actualizar nivel si cambió
    if (nuevoNivelId !== usuario.nivelLealtadId) {
      await prisma.usuario.update({
        where: { id: usuario_id },
        data: {
          nivelLealtadId: nuevoNivelId
        }
      });
    }

    return NextResponse.json({
      success: true,
      mensaje: `Puntos ajustados: ${puntosNum > 0 ? '+' : ''}${puntosNum}`,
      usuario: {
        id: usuarioActualizado.id,
        nombre_completo: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        puntos_anteriores: puntosActuales,
        puntos_nuevos: nuevosPuntos,
        puntos_ajustados: puntosNum
      }
    });

  } catch (error) {
    console.error('Error ajustando puntos:', error);
    return NextResponse.json(
      { error: 'Error al ajustar los puntos del usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
