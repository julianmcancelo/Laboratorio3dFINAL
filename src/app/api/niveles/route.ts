/**
 * 🏆 API Route - Niveles de Lealtad
 * Endpoint para obtener los niveles dinámicamente desde la BD
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    // Obtener niveles activos ordenados usando Prisma
    const niveles = await prisma.nivelLealtad.findMany({
      where: {
        activo: true
      },
      orderBy: {
        puntosMinimosRequeridos: 'asc'
      },
      select: {
        id: true,
        nombreNivel: true,
        iconoNivel: true,
        puntosMinimosRequeridos: true,
        multiplicadorPuntos: true,
        descripcion: true,
        orden: true
      }
    });

    // Mapear a formato esperado
    const nivelesFormateados = niveles.map(nivel => ({
      id: nivel.id,
      nombre: nivel.nombreNivel,
      icono: nivel.iconoNivel,
      puntos_requeridos: nivel.puntosMinimosRequeridos,
      multiplicador: nivel.multiplicadorPuntos,
      descripcion: nivel.descripcion,
      orden: nivel.orden
    }));

    console.log(`📊 Se obtuvieron ${nivelesFormateados.length} niveles de lealtad`);

    return NextResponse.json({
      success: true,
      niveles: nivelesFormateados
    });

  } catch (error: any) {
    console.error('❌ Error al obtener niveles:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
