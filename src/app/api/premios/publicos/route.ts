/**
 * 🎁 API Route - Premios Públicos (para Landing Page)
 * 
 * Endpoint optimizado para mostrar premios en el landing page.
 * Solo devuelve premios activos, ordenados por puntos_requeridos.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

/**
 * GET /api/premios/publicos
 * 
 * Devuelve todos los premios activos ordenados por puntos
 */
export async function GET() {
  try {
    console.log('🎁 [API] Obteniendo premios públicos con Prisma');

    // Obtener premios activos ordenados por puntos usando Prisma
    const premios = await prisma.premio.findMany({
      where: {
        activo: true
      },
      orderBy: {
        puntosRequeridos: 'asc'
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        puntosRequeridos: true,
        activo: true,
        nivelLealtadRequeridoId: true
      }
    });

    console.log(`✅ [API] ${premios.length} premios encontrados`);

    // Mapear a formato snake_case para compatibilidad
    const premiosFormateados = premios.map(premio => ({
      id: premio.id,
      nombre: premio.nombre,
      descripcion: premio.descripcion,
      puntos_requeridos: premio.puntosRequeridos,
      activo: premio.activo,
      nivel_lealtad_requerido_id: premio.nivelLealtadRequeridoId
    }));

    return NextResponse.json({
      success: true,
      premios: premiosFormateados,
      total: premiosFormateados.length
    });

  } catch (error: any) {
    console.error('❌ [API] Error al obtener premios:', error);
    
    // Si hay error, devolver array vacío en lugar de error 500
    return NextResponse.json({
      success: true,
      premios: [],
      total: 0,
      warning: 'No se pudieron cargar los premios'
    });
  }
}
