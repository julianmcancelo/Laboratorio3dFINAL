/**
 * 🎁 Cliente Prisma para Gestión de Premios
 * Funciones adaptadas a la estructura REAL de la base de datos existente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces basadas en la estructura REAL
export interface Premio {
  id?: number;
  nombre: string;
  descripcion?: string;
  puntos_requeridos: number;
  nivel_lealtad_requerido_id?: number;
  activo?: boolean;
  imagen_url?: string;
  categoria?: string;
  tipo?: string;
  stock_disponible?: number;
  stock_ilimitado?: boolean;
  nivel_minimo?: number;
  valido_desde?: Date;
  valido_hasta?: Date;
  condiciones?: any;
  beneficios?: any;
  restricciones?: any;
  tags?: any;
  valor_estimado?: number;
  creado_en?: Date;
  actualizado_en?: Date;
}

// Funciones de Premios adaptadas a la estructura REAL
export async function obtenerPremios(
  pagina: number = 1,
  limite: number = 20,
  filtros: {
    categoria?: string;
    tipo?: string;
    estado?: string;
    puntos_minimos?: number;
    puntos_maximos?: number;
    buscar?: string;
    ordenar_por?: string;
    orden?: 'asc' | 'desc';
  } = {}
): Promise<{ premios: Premio[], total: number, pagina: number, totalPaginas: number }> {
  try {
    const {
      categoria,
      tipo,
      estado,
      puntos_minimos,
      puntos_maximos,
      buscar,
      ordenar_por = 'nombre',
      orden = 'asc'
    } = filtros;

    // Construir where clause
    const where: any = {};
    
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (puntos_minimos !== undefined) where.puntos_requeridos = { gte: puntos_minimos };
    if (puntos_maximos !== undefined) where.puntos_requeridos = { lte: puntos_maximos };
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { descripcion: { contains: buscar } }
      ];
    }

    // Validar ordenamiento
    const camposOrdenValidos = ['nombre', 'puntos_requeridos', 'creado_en'];
    const campoOrden = camposOrdenValidos.includes(ordenar_por) ? ordenar_por : 'nombre';

    // Calcular offset
    const offset = (pagina - 1) * limite;

    // Ejecutar consulta principal
    const [premios, total] = await Promise.all([
      prisma.premio.findMany({
        where,
        orderBy: { [campoOrden]: orden },
        skip: offset,
        take: limite,
        include: {
          nivelLealtadRequerido: true
        }
      }),
      prisma.premio.count({ where })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    // Formatear resultados
    const premiosFormateados = premios.map(premio => ({
      id: premio.id,
      nombre: premio.nombre,
      descripcion: premio.descripcion,
      puntos_requeridos: premio.puntosRequeridos,
      nivel_lealtad_requerido_id: premio.nivelLealtadRequeridoId,
      activo: premio.activo,
      imagen_url: premio.imagenUrl,
      categoria: premio.categoria,
      tipo: premio.tipo,
      stock_disponible: premio.stockDisponible,
      stock_ilimitado: premio.stockIlimitado,
      nivel_minimo: premio.nivelMinimo,
      valido_desde: premio.validoDesde,
      valido_hasta: premio.validoHasta,
      condiciones: premio.condiciones,
      beneficios: premio.beneficios,
      restricciones: premio.restricciones,
      tags: premio.tags,
      valor_estimado: premio.valorEstimado,
      creado_en: premio.createdAt,
      actualizado_en: premio.updatedAt,
      disponible: premio.activo && 
                  (premio.stockIlimitado || (premio.stockDisponible && premio.stockDisponible > 0)) &&
                  (!premio.validoDesde || new Date(premio.validoDesde) <= new Date()) &&
                  (!premio.validoHasta || new Date(premio.validoHasta) >= new Date())
    }));

    console.log(`✅ Premios obtenidos: ${premiosFormateados.length} de ${total} totales`);
    
    return {
      premios: premiosFormateados,
      total,
      pagina,
      totalPaginas
    };

  } catch (error) {
    console.error('❌ Error obteniendo premios:', error);
    throw error;
  }
}

export async function obtenerPremioPorId(id: number): Promise<Premio | null> {
  try {
    const premio = await prisma.premio.findUnique({
      where: { id },
      include: {
        nivelLealtadRequerido: true
      }
    });
    
    if (!premio) return null;
    
    return {
      id: premio.id,
      nombre: premio.nombre,
      descripcion: premio.descripcion,
      puntos_requeridos: premio.puntosRequeridos,
      nivel_lealtad_requerido_id: premio.nivelLealtadRequeridoId,
      activo: premio.activo,
      imagen_url: premio.imagenUrl,
      categoria: premio.categoria,
      tipo: premio.tipo,
      stock_disponible: premio.stockDisponible,
      stock_ilimitado: premio.stockIlimitado,
      nivel_minimo: premio.nivelMinimo,
      valido_desde: premio.validoDesde,
      valido_hasta: premio.validoHasta,
      condiciones: premio.condiciones,
      beneficios: premio.beneficios,
      restricciones: premio.restricciones,
      tags: premio.tags,
      valor_estimado: premio.valorEstimado,
      creado_en: premio.createdAt,
      actualizado_en: premio.updatedAt
    };
  } catch (error) {
    console.error('❌ Error obteniendo premio por ID:', error);
    throw error;
  }
}

export async function crearPremio(datos: Omit<Premio, 'id' | 'creado_en' | 'actualizado_en'>): Promise<number> {
  try {
    const premio = await prisma.premio.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        puntosRequeridos: datos.puntos_requeridos,
        nivelLealtadRequeridoId: datos.nivel_lealtad_requerido_id,
        activo: datos.activo ?? true,
        imagenUrl: datos.imagen_url,
        categoria: datos.categoria,
        tipo: datos.tipo,
        stockDisponible: datos.stock_disponible,
        stockIlimitado: datos.stock_ilimitado ?? false,
        nivelMinimo: datos.nivel_minimo,
        validoDesde: datos.valido_desde,
        validoHasta: datos.valido_hasta,
        condiciones: datos.condiciones,
        beneficios: datos.beneficios,
        restricciones: datos.restricciones,
        tags: datos.tags,
        valorEstimado: datos.valor_estimado
      }
    });
    
    console.log(`✅ Premio creado: ${datos.nombre}`);
    return premio.id;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Ya existe un premio con ese nombre');
    }
    throw error;
  }
}

export async function actualizarPremio(id: number, datos: Partial<Omit<Premio, 'id' | 'creado_en' | 'actualizado_en'>>): Promise<boolean> {
  try {
    await prisma.premio.update({
      where: { id },
      data: {
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.puntos_requeridos !== undefined && { puntosRequeridos: datos.puntos_requeridos }),
        ...(datos.nivel_lealtad_requerido_id !== undefined && { nivelLealtadRequeridoId: datos.nivel_lealtad_requerido_id }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        ...(datos.imagen_url !== undefined && { imagenUrl: datos.imagen_url }),
        ...(datos.categoria && { categoria: datos.categoria }),
        ...(datos.tipo && { tipo: datos.tipo }),
        ...(datos.stock_disponible !== undefined && { stockDisponible: datos.stock_disponible }),
        ...(datos.stock_ilimitado !== undefined && { stockIlimitado: datos.stock_ilimitado }),
        ...(datos.nivel_minimo !== undefined && { nivelMinimo: datos.nivel_minimo }),
        ...(datos.valido_desde !== undefined && { validoDesde: datos.valido_desde }),
        ...(datos.valido_hasta !== undefined && { validoHasta: datos.valido_hasta }),
        ...(datos.condiciones !== undefined && { condiciones: datos.condiciones }),
        ...(datos.beneficios !== undefined && { beneficios: datos.beneficios }),
        ...(datos.restricciones !== undefined && { restricciones: datos.restricciones }),
        ...(datos.tags !== undefined && { tags: datos.tags }),
        ...(datos.valor_estimado !== undefined && { valorEstimado: datos.valor_estimado })
      }
    });
    
    console.log(`✅ Premio actualizado: ID ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando premio:', error);
    throw error;
  }
}

export async function eliminarPremio(id: number): Promise<boolean> {
  try {
    await prisma.premio.delete({
      where: { id }
    });
    
    console.log(`✅ Premio eliminado: ID ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando premio:', error);
    throw error;
  }
}

// Verificar conexión
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión Prisma verificada');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión Prisma:', error);
    return false;
  }
}

// Exportar cliente Prisma
export { prisma };

// Cerrar conexión
export async function closeConnection(): Promise<void> {
  await prisma.$disconnect();
  console.log('✅ Conexión Prisma cerrada');
}
