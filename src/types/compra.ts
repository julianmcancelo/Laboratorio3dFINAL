/**
 * 🛒 Tipos y Interfaces para Sistema de Compras
 * 
 * Este archivo define todos los tipos relacionados con la gestión de compras
 * y transacciones en el sistema Laboratorio 3D. Incluye validaciones exhaustivas
 * y tipos específicos para cada operación del sistema de compras.
 */

import { z } from 'zod';

/**
 * 💳 Enumeración de Medios de Pago
 * Define los diferentes métodos de pago aceptados en el sistema
 */
export enum MedioPago {
  EFECTIVO = 'efectivo',
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  TRANSFERENCIA = 'transferencia',
  MERCADO_PAGO = 'mercado_pago',
  BILLETERA_VIRTUAL = 'billetera_virtual',
  CHEQUE = 'cheque',
  OTRO = 'otro',
}

/**
 * 📊 Enumeración de Estados de Compra
 * Define los posibles estados de una compra en el sistema
 */
export enum EstadoCompra {
  PENDIENTE = 'pendiente',
  VERIFICADA = 'verificada',
  RECHAZADA = 'rechazada',
  CANCELADA = 'cancelada',
  EN_REVISION = 'en_revision',
  PROCESADA = 'procesada',
}

/**
 * 🏷️ Enumeración de Categorías de Compra
 * Define las categorías para clasificar las compras
 */
export enum CategoriaCompra {
  PRODUCTO = 'producto',
  SERVICIO = 'servicio',
  CONSULTA = 'consulta',
  TRATAMIENTO = 'tratamiento',
  OTRO = 'otro',
}

/**
 * 📝 Interface Base de Compra
 * Contiene los campos fundamentales de una compra
 */
export interface CompraBase {
  id: number;
  cliente_id: number;
  monto: number;
  descripcion: string;
  medio_pago: MedioPago;
  categoria: CategoriaCompra;
  estado: EstadoCompra;
  fecha_compra: Date;
  fecha_verificacion?: Date;
  verificado_por?: number;
  notas?: string;
}

/**
 * 🧾 Interface de Compra con Detalles
 * Extiende CompraBase con información adicional y relaciones
 */
export interface CompraCompleta extends CompraBase {
  puntos_ganados: number;
  puntos_utilizados?: number;
  comprobante_url?: string;
  numero_comprobante?: string;
  descuento_aplicado?: number;
  impuestos_incluidos: boolean;
  cliente: {
    id: number;
    nombre_completo: string;
    email: string;
    dni: string;
    puntos_acumulados: number;
  };
  verificador?: {
    id: number;
    nombre_completo: string;
    rol: string;
  };
  items: ItemCompra[];
  historial_estados: HistorialEstadoCompra[];
}

/**
 * 📦 Interface de Item de Compra
 * Representa un producto o servicio específico dentro de una compra
 */
export interface ItemCompra {
  id: number;
  compra_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  categoria_item: string;
  descripcion_item?: string;
}

/**
 * 📈 Interface de Historial de Estados
 * Registra los cambios de estado de una compra
 */
export interface HistorialEstadoCompra {
  id: number;
  compra_id: number;
  estado_anterior: EstadoCompra;
  estado_nuevo: EstadoCompra;
  fecha_cambio: Date;
  cambiado_por: number;
  motivo_cambio?: string;
  notas?: string;
}

/**
 * 📊 Interface de Estadísticas de Compra
 * Contiene métricas y estadísticas de compras
 */
export interface EstadisticasCompra {
  cliente_id: number;
  periodo: {
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  total_compras: number;
  monto_total: number;
  monto_promedio: number;
  puntos_totales_ganados: number;
  compras_por_mes: Array<{
    mes: string;
    cantidad: number;
    monto: number;
  }>;
  compras_por_categoria: Array<{
    categoria: CategoriaCompra;
    cantidad: number;
    monto_total: number;
  }>;
  compras_por_medio_pago: Array<{
    medio_pago: MedioPago;
    cantidad: number;
    monto_total: number;
  }>;
}

/**
 * 🔍 Interface de Filtros de Búsqueda
 * Define los filtros disponibles para buscar compras
 */
export interface FiltrosBusquedaCompras {
  cliente_id?: number;
  estado?: EstadoCompra;
  medio_pago?: MedioPago;
  categoria?: CategoriaCompra;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  monto_minimo?: number;
  monto_maximo?: number;
  verificado?: boolean;
  pagina?: number;
  limite?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
}

// ============================================================================
// 🛡️ ESQUEMAS DE VALIDACIÓN CON ZOD
// ============================================================================

/**
 * 🛒 Schema para Registro de Nueva Compra
 * Valida los datos de entrada cuando se registra una nueva compra
 */
export const RegistrarCompraSchema = z.object({
  cliente_id: z
    .number()
    .int('El ID del cliente debe ser un número entero')
    .positive('El ID del cliente debe ser un número positivo'),
  
  monto: z
    .number()
    .positive('El monto debe ser un número positivo')
    .max(999999.99, 'El monto no puede exceder 999,999.99')
    .refine((val) => Number.isFinite(val), 'El monto debe ser un número válido'),
  
  descripcion: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,]+$/, 
           'La descripción contiene caracteres no válidos'),
  
  medio_pago: z
    .nativeEnum(MedioPago, {
      errorMap: () => ({ message: 'El medio de pago seleccionado no es válido' }),
    }),
  
  categoria: z
    .nativeEnum(CategoriaCompra, {
      errorMap: () => ({ message: 'La categoría seleccionada no es válida' }),
    }),
  
  numero_comprobante: z
    .string()
    .min(1, 'El número de comprobante es requerido')
    .max(50, 'El número de comprobante no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9\-]+$/, 'El número de comprobante solo puede contener letras, números y guiones'),
  
  fecha_compra: z
    .string()
    .datetime('La fecha de compra no es válida')
    .refine((fecha) => new Date(fecha) <= new Date(), {
      message: 'La fecha de compra no puede ser futura',
    }),
  
  // Items de la compra
  items: z
    .array(z.object({
      nombre_producto: z
        .string()
        .min(2, 'El nombre del producto debe tener al menos 2 caracteres')
        .max(100, 'El nombre del producto no puede exceder 100 caracteres'),
      
      cantidad: z
        .number()
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser un número positivo')
        .max(9999, 'La cantidad no puede exceder 9999'),
      
      precio_unitario: z
        .number()
        .positive('El precio unitario debe ser un número positivo')
        .max(999999.99, 'El precio unitario no puede exceder 999,999.99'),
      
      categoria_item: z
        .string()
        .min(1, 'La categoría del item es requerida')
        .max(50, 'La categoría del item no puede exceder 50 caracteres'),
      
      descripcion_item: z
        .string()
        .max(200, 'La descripción del item no puede exceder 200 caracteres')
        .optional(),
    }))
    .min(1, 'Debe especificar al menos un item')
    .max(50, 'No puede especificar más de 50 items'),
  
  // Campos opcionales
  descuento_aplicado: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional(),
  
  impuestos_incluidos: z
    .boolean()
    .default(true),
  
  notas: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  
  // Archivo de comprobante
  comprobante_file: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true; // Opcional
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      return tiposPermitidos.includes(file.type);
    }, 'El comprobante debe ser una imagen (JPG, PNG, WebP) o PDF')
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB
    }, 'El comprobante no puede exceder 5MB'),
}).refine((data) => {
  // Validar que el subtotal de los items coincida con el monto total
  const subtotalItems = data.items.reduce((total, item) => {
    return total + (item.cantidad * item.precio_unitario);
  }, 0);
  
  const descuento = data.descuento_aplicado || 0;
  const montoEsperado = subtotalItems * (1 - descuento / 100);
  
  // Permitir una pequeña diferencia por redondeo
  return Math.abs(montoEsperado - data.monto) < 0.01;
}, {
  message: 'El monto total no coincide con la suma de los items',
  path: ['monto'],
});

/**
 * ✅ Schema para Verificación de Compra
 * Valida los datos cuando un administrador verifica una compra
 */
export const VerificarCompraSchema = z.object({
  compra_id: z
    .number()
    .int('El ID de la compra debe ser un número entero')
    .positive('El ID de la compra debe ser un número positivo'),
  
  estado: z
    .nativeEnum(EstadoCompra, {
      errorMap: () => ({ message: 'El estado seleccionado no es válido' }),
    }),
  
  puntos_asignados: z
    .number()
    .int('Los puntos deben ser un número entero')
    .min(0, 'Los puntos no pueden ser negativos')
    .max(99999, 'Los puntos no pueden exceder 99,999'),
  
  motivo_cambio: z
    .string()
    .min(1, 'El motivo del cambio es requerido')
    .max(500, 'El motivo no puede exceder 500 caracteres')
    .optional(),
  
  notas_verificacion: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
});

/**
 * 🔍 Schema para Búsqueda de Compras
 * Valida los parámetros de búsqueda y filtrado
 */
export const BuscarComprasSchema = z.object({
  cliente_id: z
    .number()
    .int('El ID del cliente debe ser un número entero')
    .positive('El ID del cliente debe ser un número positivo')
    .optional(),
  
  estado: z
    .nativeEnum(EstadoCompra)
    .optional(),
  
  medio_pago: z
    .nativeEnum(MedioPago)
    .optional(),
  
  categoria: z
    .nativeEnum(CategoriaCompra)
    .optional(),
  
  fecha_desde: z
    .string()
    .datetime('La fecha desde no es válida')
    .optional(),
  
  fecha_hasta: z
    .string()
    .datetime('La fecha hasta no es válida')
    .optional(),
  
  monto_minimo: z
    .number()
    .positive('El monto mínimo debe ser positivo')
    .optional(),
  
  monto_maximo: z
    .number()
    .positive('El monto máximo debe ser positivo')
    .optional(),
  
  verificado: z
    .boolean()
    .optional(),
  
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
  
  ordenar_por: z
    .enum(['fecha_compra', 'monto', 'cliente', 'estado'])
    .default('fecha_compra'),
  
  orden: z
    .enum(['asc', 'desc'])
    .default('desc'),
  
  buscar: z
    .string()
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .optional(),
}).refine((data) => {
  // Validar que la fecha hasta sea posterior a la fecha desde
  if (data.fecha_desde && data.fecha_hasta) {
    return new Date(data.fecha_desde) <= new Date(data.fecha_hasta);
  }
  return true;
}, {
  message: 'La fecha hasta debe ser posterior o igual a la fecha desde',
  path: ['fecha_hasta'],
}).refine((data) => {
  // Validar que el monto máximo sea mayor al mínimo
  if (data.monto_minimo && data.monto_maximo) {
    return data.monto_minimo <= data.monto_maximo;
  }
  return true;
}, {
  message: 'El monto máximo debe ser mayor o igual al monto mínimo',
  path: ['monto_maximo'],
});

/**
 * 📊 Schema para Estadísticas de Compras
 * Valida los parámetros para generar estadísticas
 */
export const EstadisticasComprasSchema = z.object({
  cliente_id: z
    .number()
    .int('El ID del cliente debe ser un número entero')
    .positive('El ID del cliente debe ser un número positivo')
    .optional(),
  
  fecha_desde: z
    .string()
    .datetime('La fecha desde no es válida'),
  
  fecha_hasta: z
    .string()
    .datetime('La fecha hasta no es válida'),
  
  tipo_estadistica: z
    .enum(['general', 'por_cliente', 'por_categoria', 'por_medio_pago', 'mensual'])
    .default('general'),
}).refine((data) => {
  // Validar que el período no exceda 1 año
  const diasDiferencia = Math.ceil(
    (new Date(data.fecha_hasta).getTime() - new Date(data.fecha_desde).getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  return diasDiferencia <= 365;
}, {
  message: 'El período de estadísticas no puede exceder 1 año',
  path: ['fecha_hasta'],
});

// ============================================================================
// 📤 TIPOS DE INFERENCIA
// ============================================================================

/**
 * 🛒 Tipo inferido para registro de compra
 */
export type RegistrarCompraInput = z.infer<typeof RegistrarCompraSchema>;

/**
 * ✅ Tipo inferido para verificación de compra
 */
export type VerificarCompraInput = z.infer<typeof VerificarCompraSchema>;

/**
 * 🔍 Tipo inferido para búsqueda de compras
 */
export type BuscarComprasInput = z.infer<typeof BuscarComprasSchema>;

/**
 * 📊 Tipo inferido para estadísticas de compras
 */
export type EstadisticasComprasInput = z.infer<typeof EstadisticasComprasSchema>;

// ============================================================================
// 🎭 TIPOS PARA RESPUESTAS API
// ============================================================================

/**
 * ✅ Respuesta exitosa de operaciones de compras
 */
export interface CompraResponseSuccess {
  success: true;
  compra?: CompraCompleta;
  compras?: CompraCompleta[];
  total?: number;
  pagina?: number;
  total_paginas?: number;
  mensaje: string;
}

/**
 * ❌ Respuesta de error en operaciones de compras
 */
export interface CompraResponseError {
  success: false;
  error: string;
  detalles?: Record<string, string[]>;
}

/**
 * 📋 Tipo unido para respuestas de compras
 */
export type CompraResponse = CompraResponseSuccess | CompraResponseError;

/**
 * 📊 Interface para respuesta de estadísticas
 */
export interface EstadisticasComprasResponse {
  success: true;
  estadisticas: EstadisticasCompra;
  resumen: {
    total_compras: number;
    monto_total: number;
    puntos_totales: number;
    compra_mas_alta: CompraCompleta;
    compra_mas_baja: CompraCompleta;
  };
}
