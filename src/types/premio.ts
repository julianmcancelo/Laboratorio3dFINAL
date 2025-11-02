/**
 * 🎁 Tipos y Interfaces para Sistema de Premios
 * 
 * Este archivo define todos los tipos relacionados con la gestión de premios
 * y recompensas en el sistema Laboratorio 3D. Incluye validaciones exhaustivas
 * y tipos específicos para cada operación del sistema de lealtad.
 */

import { z } from 'zod';

/**
 * 🏆 Enumeración de Categorías de Premios
 * Define las diferentes categorías disponibles para clasificar los premios
 */
export enum CategoriaPremio {
  PRODUCTOS = 'productos',
  DESCUENTOS = 'descuentos',
  SERVICIOS = 'servicios',
  EXPERIENCIAS = 'experiencias',
  DIGITAL = 'digital',
  PERSONALIZADO = 'personalizado',
}

/**
 * 📊 Enumeración de Estados de Premio
 * Define los posibles estados de un premio en el sistema
 */
export enum EstadoPremio {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  AGOTADO = 'agotado',
  TEMPORALMENTE_INDISPONIBLE = 'temporalmente_indisponible',
  PROGRAMADO = 'programado',
}

/**
 * 🎯 Enumeración de Tipos de Premio
 * Define cómo se puede obtener un premio
 */
export enum TipoPremio {
  POR_PUNTOS = 'por_puntos',
  POR_MONTO = 'por_monto',
  GRATIS = 'gratis',
  PERSONALIZADO = 'personalizado',
}

/**
 * 📝 Interface Base de Premio
 * Contiene los campos fundamentales de un premio
 */
export interface PremioBase {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: CategoriaPremio;
  tipo: TipoPremio;
  estado: EstadoPremio;
  imagen_url?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

/**
 * 🎁 Interface de Premio por Puntos
 * Extiende PremioBase con campos específicos para premios por puntos
 */
export interface PremioPorPuntos extends PremioBase {
  puntos_requeridos: number;
  stock_disponible?: number;
  stock_ilimitado: boolean;
  nivel_minimo: number;
}

/**
 * 💰 Interface de Premio por Monto
 * Extiende PremioBase con campos específicos para premios por monto de compra
 */
export interface PremioPorMonto extends PremioBase {
  monto_minimo_compra: number;
  valido_desde?: Date;
  valido_hasta?: Date;
  compras_minimas?: number;
}

/**
 * 🎨 Interface de Premio Personalizado
 * Extiende PremioBase con campos para premios personalizados
 */
export interface PremioPersonalizado extends PremioBase {
  requisitos_personalizados: string[];
  aprobacion_requerida: boolean;
  descripcion_personalizada: string;
}

/**
 * 🎊 Interface de Premio Completo
 * Incluye todas las variantes posibles y relaciones
 */
export interface PremioCompleto extends PremioPorPuntos, PremioPorMonto, PremioPersonalizado {
  condiciones: string[];
  beneficios: string[];
  restricciones: string[];
  tags: string[];
  popularidad: number;
  veces_canjeado: number;
  valor_estimado: number;
}

/**
 * 📋 Interface de Canje de Premio
 * Representa un canje realizado por un cliente
 */
export interface CanjePremio {
  id: number;
  cliente_id: number;
  premio_id: number;
  tipo_canje: 'automatico' | 'manual' | 'personalizado';
  puntos_utilizados: number;
  estado_canje: EstadoCanje;
  fecha_solicitud: Date;
  fecha_aprobacion?: Date;
  fecha_entrega?: Date;
  codigo_seguimiento?: string;
  notas_admin?: string;
  notas_cliente?: string;
  premio: PremioCompleto;
  cliente: {
    id: number;
    nombre_completo: string;
    email: string;
    puntos_acumulados: number;
  };
}

/**
 * 📊 Enumeración de Estados de Canje
 */
export enum EstadoCanje {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  EN_PROCESO = 'en_proceso',
}

/**
 * 📈 Interface de Estadísticas de Premio
 * Contiene métricas y estadísticas de un premio
 */
export interface EstadisticasPremio {
  premio_id: number;
  total_canjes: number;
  canjes_ultimo_mes: number;
  canjes_ultimo_trimestre: number;
  tasa_conversion: number;
  popularidad_ranking: number;
  satisfaccion_promedio: number;
  ingresos_generados: number;
  costos_asociados: number;
}

// ============================================================================
// 🛡️ ESQUEMAS DE VALIDACIÓN CON ZOD
// ============================================================================

/**
 * 🎁 Schema para Creación de Premio
 * Valida los datos de entrada cuando se crea un nuevo premio
 */
export const CrearPremioSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre del premio debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/, 
           'El nombre solo puede contener letras, números, espacios y guiones'),
  
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  categoria: z
    .nativeEnum(CategoriaPremio, {
      errorMap: () => ({ message: 'La categoría seleccionada no es válida' }),
    }),
  
  tipo: z
    .nativeEnum(TipoPremio, {
      errorMap: () => ({ message: 'El tipo de premio seleccionado no es válido' }),
    }),
  
  imagen_url: z
    .string()
    .url('La URL de la imagen no es válida')
    .optional()
    .or(z.literal('')),
  
  // Campos específicos según el tipo
  puntos_requeridos: z
    .number()
    .min(0, 'Los puntos requeridos deben ser un número positivo')
    .optional(),
  
  monto_minimo_compra: z
    .number()
    .min(0, 'El monto mínimo debe ser un número positivo')
    .optional(),
  
  stock_disponible: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .optional(),
  
  stock_ilimitado: z
    .boolean()
    .default(false),
  
  nivel_minimo: z
    .number()
    .int('El nivel mínimo debe ser un número entero')
    .min(1, 'El nivel mínimo debe ser al menos 1')
    .default(1),
  
  // Fechas de validez
  valido_desde: z
    .string()
    .datetime('La fecha de inicio no es válida')
    .optional()
    .or(z.literal('')),
  
  valido_hasta: z
    .string()
    .datetime('La fecha de fin no es válida')
    .optional()
    .or(z.literal('')),
  
  // Campos adicionales
  condiciones: z
    .array(z.string().min(1, 'La condición no puede estar vacía'))
    .max(10, 'No puede especificar más de 10 condiciones')
    .default([]),
  
  beneficios: z
    .array(z.string().min(1, 'El beneficio no puede estar vacío'))
    .max(10, 'No puede especificar más de 10 beneficios')
    .default([]),
  
  restricciones: z
    .array(z.string().min(1, 'La restricción no puede estar vacía'))
    .max(10, 'No puede especificar más de 10 restricciones')
    .default([]),
  
  tags: z
    .array(z.string().min(1, 'El tag no puede estar vacío'))
    .max(15, 'No puede especificar más de 15 tags')
    .default([]),
  
  valor_estimado: z
    .number()
    .min(0, 'El valor estimado debe ser un número positivo')
    .optional(),
  
  // Campos para premios personalizados
  requisitos_personalizados: z
    .array(z.string().min(1, 'El requisito no puede estar vacío'))
    .max(20, 'No puede especificar más de 20 requisitos personalizados')
    .default([]),
  
  aprobacion_requerida: z
    .boolean()
    .default(false),
  
  descripcion_personalizada: z
    .string()
    .max(2000, 'La descripción personalizada no puede exceder 2000 caracteres')
    .optional(),
}).refine((data) => {
  // Validaciones condicionales según el tipo de premio
  if (data.tipo === TipoPremio.POR_PUNTOS && !data.puntos_requeridos) {
    return false;
  }
  if (data.tipo === TipoPremio.POR_MONTO && !data.monto_minimo_compra) {
    return false;
  }
  if (data.tipo === TipoPremio.PERSONALIZADO && !data.descripcion_personalizada) {
    return false;
  }
  return true;
}, {
  message: 'Faltan campos requeridos según el tipo de premio seleccionado',
  path: ['tipo'],
}).refine((data) => {
  // Validar que la fecha de fin sea posterior a la de inicio
  if (data.valido_desde && data.valido_hasta) {
    return new Date(data.valido_desde) < new Date(data.valido_hasta);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['valido_hasta'],
});

/**
 * ✏️ Schema para Actualización de Premio
 * Valida los datos cuando se actualiza un premio existente
 */
export const ActualizarPremioSchema = z.object({
  id: z
    .number()
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo'),
  
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .optional(),
  
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  
  categoria: z.nativeEnum(CategoriaPremio).optional(),
  tipo: z.nativeEnum(TipoPremio).optional(),
  estado: z.nativeEnum(EstadoPremio).optional(),
  
  puntos_requeridos: z
    .number()
    .min(0, 'Los puntos requeridos deben ser un número positivo')
    .optional(),
  
  monto_minimo_compra: z
    .number()
    .min(0, 'El monto mínimo debe ser un número positivo')
    .optional(),
  
  stock_disponible: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .optional(),
  
  stock_ilimitado: z.boolean().optional(),
  nivel_minimo: z.number().int().min(1).optional(),
  imagen_url: z.string().url('La URL de la imagen no es válida').max(500).optional(),
  valido_desde: z.string().datetime().optional().or(z.literal('')),
  valido_hasta: z.string().datetime().optional().or(z.literal('')),
  
  condiciones: z.array(z.string().min(1)).max(10).optional(),
  beneficios: z.array(z.string().min(1)).max(10).optional(),
  restricciones: z.array(z.string().min(1)).max(10).optional(),
  tags: z.array(z.string().min(1)).max(15).optional(),
  
  valor_estimado: z.number().min(0).optional(),
  requisitos_personalizados: z.array(z.string().min(1)).max(20).optional(),
  aprobacion_requerida: z.boolean().optional(),
  descripcion_personalizada: z.string().max(2000).optional(),
});

/**
 * 🎯 Schema para Canje de Premio
 * Valida los datos cuando un cliente canjea un premio
 */
export const CanjearPremioSchema = z.object({
  premio_id: z
    .number()
    .int('El ID del premio debe ser un número entero')
    .positive('El ID del premio debe ser un número positivo'),
  
  tipo_canje: z
    .enum(['automatico', 'manual'], {
      errorMap: () => ({ message: 'El tipo de canje no es válido' }),
    })
    .default('automatico'),
  
  notas_cliente: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
  
  // Para premios personalizados
  datos_personalizados: z
    .record(z.string(), z.any())
    .optional(),
});

/**
 * 🔍 Schema para Búsqueda de Premios
 * Valida los parámetros de búsqueda y filtrado
 */
export const BuscarPremiosSchema = z.object({
  pagina: z
    .number()
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser al menos 1')
    .default(1),
  
  limite: z
    .number()
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser al menos 1')
    .max(100, 'El límite no puede exceder 100')
    .default(20),
  
  categoria: z
    .nativeEnum(CategoriaPremio)
    .optional(),
  
  tipo: z
    .nativeEnum(TipoPremio)
    .optional(),
  
  estado: z
    .nativeEnum(EstadoPremio)
    .optional(),
  
  puntos_minimos: z
    .number()
    .min(0, 'Los puntos mínimos deben ser un número positivo')
    .optional(),
  
  puntos_maximos: z
    .number()
    .min(0, 'Los puntos máximos deben ser un número positivo')
    .optional(),
  
  buscar: z
    .string()
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .optional(),
  
  ordenar_por: z
    .enum(['nombre', 'puntos_requeridos', 'popularidad', 'fecha_creacion'])
    .default('nombre'),
  
  orden: z
    .enum(['asc', 'desc'])
    .default('asc'),
});

// ============================================================================
// 📤 TIPOS DE INFERENCIA
// ============================================================================

/**
 * 🎁 Tipo inferido para creación de premio
 */
export type CrearPremioInput = z.infer<typeof CrearPremioSchema>;

/**
 * ✏️ Tipo inferido para actualización de premio
 */
export type ActualizarPremioInput = z.infer<typeof ActualizarPremioSchema>;

/**
 * 🎯 Tipo inferido para canje de premio
 */
export type CanjearPremioInput = z.infer<typeof CanjearPremioSchema>;

/**
 * 🔍 Tipo inferido para búsqueda de premios
 */
export type BuscarPremiosInput = z.infer<typeof BuscarPremiosSchema>;

// ============================================================================
// 🎭 TIPOS PARA RESPUESTAS API
// ============================================================================

/**
 * ✅ Respuesta exitosa de operaciones de premios
 */
export interface PremioResponseSuccess {
  success: true;
  premio?: PremioCompleto;
  premios?: PremioCompleto[];
  total?: number;
  pagina?: number;
  total_paginas?: number;
  mensaje: string;
}

/**
 * ❌ Respuesta de error en operaciones de premios
 */
export interface PremioResponseError {
  success: false;
  error: string;
  detalles?: Record<string, string[]>;
}

/**
 * 📋 Tipo unido para respuestas de premios
 */
export type PremioResponse = PremioResponseSuccess | PremioResponseError;

/**
 * 📊 Interface para respuesta de estadísticas
 */
export interface EstadisticasPremiosResponse {
  success: true;
  estadisticas: {
    total_premios: number;
    premios_activos: number;
    total_canjes: number;
    canjes_mes: number;
    premio_mas_popular: PremioCompleto;
    categorias_mas_populares: Array<{
      categoria: CategoriaPremio;
      cantidad: number;
    }>;
  };
}
