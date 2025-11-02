/**
 * 🎁 API Route - Gestión de Premios (Prisma)
 * 
 * Este endpoint maneja las operaciones CRUD para el sistema de premios.
 * Incluye listado, creación, búsqueda y filtrado de premios.
 * 
 * Endpoints: 
 * - GET /api/premios - Listar y buscar premios
 * - POST /api/premios - Crear nuevo premio (solo admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  obtenerPremios,
  crearPremio,
  testConnection 
} from '@/lib/prisma-premios';

/**
 * 🎁 Maneja la solicitud GET para listar y buscar premios
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🎁 Obteniendo lista de premios');

    // Verificar conexión a Prisma
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Obtener parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url);
    
    const pagina = parseInt(searchParams.get('pagina') || '1', 10);
    const limite = parseInt(searchParams.get('limite') || '20', 10);
    const categoria = searchParams.get('categoria') || undefined;
    const tipo = searchParams.get('tipo') || undefined;
    const estado = searchParams.get('estado') || undefined;
    const puntos_minimos = searchParams.get('puntos_minimos') ? 
      parseInt(searchParams.get('puntos_minimos')!, 10) : undefined;
    const puntos_maximos = searchParams.get('puntos_maximos') ? 
      parseInt(searchParams.get('puntos_maximos')!, 10) : undefined;
    const buscar = searchParams.get('buscar') || undefined;
    const ordenar_por = searchParams.get('ordenar_por') || 'nombre';
    const orden = searchParams.get('orden') as 'asc' | 'desc' || 'asc';

    // Ejecutar consulta con Prisma
    const resultado = await obtenerPremios(pagina, limite, {
      categoria,
      tipo,
      estado,
      puntos_minimos,
      puntos_maximos,
      buscar,
      ordenar_por,
      orden
    });
    
    return NextResponse.json(
      {
        success: true,
        premios: resultado.premios,
        paginacion: {
          pagina_actual: resultado.pagina,
          total_paginas: resultado.totalPaginas,
          total_registros: resultado.total,
          registros_por_pagina: limite,
          tiene_siguiente: resultado.pagina < resultado.totalPaginas,
          tiene_anterior: resultado.pagina > 1,
        },
        filtros_aplicados: {
          categoria,
          tipo,
          estado,
          puntos_minimos,
          puntos_maximos,
          buscar,
          ordenar_por,
          orden,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error al obtener premios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        codigo: 'ERROR_INTERNO'
      },
      { status: 500 }
    );
  }
}

/**
 * 🎁 Maneja la solicitud POST para crear un nuevo premio
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🎁 Creando nuevo premio');

    // Verificar conexión a Prisma
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Validar y extraer datos del body
    const body = await request.json();
    
    const {
      nombre,
      descripcion,
      puntos_requeridos,
      categoria = 'general',
      tipo = 'producto',
      imagen_url,
      stock_disponible,
      stock_ilimitado = false,
      nivel_minimo,
      valido_desde,
      valido_hasta,
      condiciones = [],
      beneficios = [],
      restricciones = [],
      tags = [],
      valor_estimado
    } = body;

    // Validaciones básicas
    if (!nombre || !puntos_requeridos) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre y puntos requeridos son obligatorios',
          codigo: 'DATOS_INCOMPLETOS'
        },
        { status: 400 }
      );
    }

    // Crear el premio con Prisma
    const nuevoPremioId = await crearPremio({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      puntos_requeridos: parseInt(puntos_requeridos, 10),
      categoria,
      tipo,
      imagen_url: imagen_url?.trim() || undefined,
      stock_disponible: stock_disponible ? parseInt(stock_disponible, 10) : 0,
      stock_ilimitado,
      nivel_minimo: nivel_minimo ? parseInt(nivel_minimo, 10) : undefined,
      valido_desde: valido_desde ? new Date(valido_desde) : undefined,
      valido_hasta: valido_hasta ? new Date(valido_hasta) : undefined,
      condiciones,
      beneficios,
      restricciones,
      tags,
      valor_estimado: valor_estimado ? parseFloat(valor_estimado) : undefined,
      activo: true
    });

    console.log('✅ Premio creado exitosamente:', nuevoPremioId);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Premio creado exitosamente',
        premio_id: nuevoPremioId
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Error al crear premio:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un premio con ese nombre',
          codigo: 'PREMIO_EXISTENTE'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor',
        codigo: 'ERROR_INTERNO'
      },
      { status: 500 }
    );
  }
}

/**
 * 🚫 Método no permitido para otros métodos HTTP
 */
export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método no permitido',
      codigo: 'METODO_NO_PERMITIDO'
    },
    { status: 405 }
  );
}
