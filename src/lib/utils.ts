/**
 * 🛠️ Utilidades Generales - Laboratorio 3D
 * 
 * Este archivo contiene funciones utilitarias comunes utilizadas
 * en toda la aplicación. Incluye manejo de clases CSS,
 * formateo de datos, validaciones y otras utilidades.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// 🎨 UTILIDADES DE CSS Y CLASES
// ============================================================================

/**
 * 🎭 Combina clases CSS de forma inteligente
 * 
 * Esta función combina clsx y tailwind-merge para permitir:
 * - Condicionales y uniones de clases
 * - Resolución de conflictos de TailwindCSS
 * - Tipado seguro con TypeScript
 * 
 * @param inputs - Clases CSS a combinar
 * @returns String de clases combinadas
 * 
 * @example
 * ```typescript
 * const classes = cn('px-4 py-2', 'bg-blue-500', isActive && 'bg-blue-600', 'text-white');
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// 💰 UTILIDADES DE FORMATO MONETARIO
// ============================================================================

/**
 * 💰 Formatea un número como moneda (Pesos Argentinos)
 * 
 * @param monto - Monto a formatear
 * @param moneda - Símbolo de moneda (default: '$')
 * @param decimales - Cantidad de decimales (default: 2)
 * @returns String formateado como moneda
 * 
 * @example
 * ```typescript
 * formatearMoneda(1234.56) // '$1.234,56'
 * formatearMoneda(1234.56, 'USD', 2) // 'USD 1,234.56'
 * ```
 */
export function formatearMoneda(
  monto: number,
  moneda: string = '$',
  decimales: number = 2
): string {
  try {
    if (!Number.isFinite(monto)) {
      return `${moneda}0,00`;
    }

    // Formatear para español (Argentina)
    const formateado = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(monto);

    return `${moneda}${formateado}`;
  } catch (error) {
    console.error('❌ Error al formatear moneda:', error);
    return `${moneda}0,00`;
  }
}

/**
 * 🔢 Formatea un número con separadores de miles
 * 
 * @param numero - Número a formatear
 * @param decimales - Cantidad de decimales (default: 0)
 * @returns String formateado
 */
export function formatearNumero(numero: number, decimales: number = 0): string {
  try {
    if (!Number.isFinite(numero)) {
      return '0';
    }

    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(numero);
  } catch (error) {
    console.error('❌ Error al formatear número:', error);
    return '0';
  }
}

// ============================================================================
// 📅 UTILIDADES DE FECHAS
// ============================================================================

/**
 * 📅 Formatea una fecha en formato local (Argentina)
 * 
 * @param fecha - Fecha a formatear
 * @param formato - Formato deseado
 * @returns String de fecha formateada
 * 
 * @example
 * ```typescript
 * formatearFecha(new Date()) // '31/10/2025'
 * formatearFecha(new Date(), 'completo') // '31 de octubre de 2025'
 * ```
 */
export function formatearFecha(
  fecha: Date | string,
  formato: 'corto' | 'largo' | 'completo' | 'hora' | 'completo-hora' = 'corto'
): string {
  try {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha inválida';
    }

    const opciones: Intl.DateTimeFormatOptions = {};

    switch (formato) {
      case 'corto':
        opciones.day = '2-digit';
        opciones.month = '2-digit';
        opciones.year = 'numeric';
        break;
      case 'largo':
        opciones.day = 'numeric';
        opciones.month = 'long';
        opciones.year = 'numeric';
        break;
      case 'completo':
        opciones.day = 'numeric';
        opciones.month = 'long';
        opciones.year = 'numeric';
        opciones.weekday = 'long';
        break;
      case 'hora':
        opciones.hour = '2-digit';
        opciones.minute = '2-digit';
        break;
      case 'completo-hora':
        opciones.day = 'numeric';
        opciones.month = 'long';
        opciones.year = 'numeric';
        opciones.hour = '2-digit';
        opciones.minute = '2-digit';
        break;
    }

    return new Intl.DateTimeFormat('es-AR', opciones).format(fechaObj);
  } catch (error) {
    console.error('❌ Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

/**
 * ⏰ Calcula el tiempo relativo desde una fecha
 * 
 * @param fecha - Fecha de referencia
 * @returns String con tiempo relativo
 * 
 * @example
 * ```typescript
 * tiempoRelativo(new Date(Date.now() - 3600000)) // 'hace 1 hora'
 * ```
 */
export function tiempoRelativo(fecha: Date | string): string {
  try {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - fechaObj.getTime();
    const diferenciaSegundos = Math.floor(diferenciaMs / 1000);
    const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    const diferenciaDias = Math.floor(diferenciaHoras / 24);

    if (diferenciaSegundos < 60) {
      return 'hace unos segundos';
    } else if (diferenciaMinutos < 60) {
      return `hace ${diferenciaMinutos} ${diferenciaMinutos === 1 ? 'minuto' : 'minutos'}`;
    } else if (diferenciaHoras < 24) {
      return `hace ${diferenciaHoras} ${diferenciaHoras === 1 ? 'hora' : 'horas'}`;
    } else if (diferenciaDias < 30) {
      return `hace ${diferenciaDias} ${diferenciaDias === 1 ? 'día' : 'días'}`;
    } else {
      return formatearFecha(fechaObj, 'corto');
    }
  } catch (error) {
    console.error('❌ Error al calcular tiempo relativo:', error);
    return 'Fecha desconocida';
  }
}

// ============================================================================
// 📝 UTILIDADES DE TEXTO
// ============================================================================

/**
 * 📝 Trunca un texto a una longitud específica
 * 
 * @param texto - Texto a truncar
 * @param longitud - Longitud máxima
 * @param sufijo - Sufijo a agregar (default: '...')
 * @returns Texto truncado
 */
export function truncarTexto(texto: string, longitud: number, sufijo: string = '...'): string {
  try {
    if (!texto || texto.length <= longitud) {
      return texto || '';
    }

    return texto.substring(0, longitud - sufijo.length) + sufijo;
  } catch (error) {
    console.error('❌ Error al truncar texto:', error);
    return '';
  }
}

/**
 * 🏷️ Convierte un texto a slug (URL-friendly)
 * 
 * @param texto - Texto a convertir
 * @returns Slug del texto
 */
export function textoASlug(texto: string): string {
  try {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones
      .trim();
  } catch (error) {
    console.error('❌ Error al convertir texto a slug:', error);
    return '';
  }
}

/**
 * 🎭 Capitaliza la primera letra de cada palabra
 * 
 * @param texto - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalizarTexto(texto: string): string {
  try {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  } catch (error) {
    console.error('❌ Error al capitalizar texto:', error);
    return texto;
  }
}

// ============================================================================
// 🎨 UTILIDADES DE COLORES
// ============================================================================

/**
 * 🎨 Genera un color hexadecimal aleatorio
 * 
 * @returns Color hexadecimal aleatorio
 */
export function colorAleatorio(): string {
  try {
    const colores = [
      '#8b5cf6', '#a78bfa', '#7c3aed', // Púrpuras
      '#84cc16', '#bef264', '#65a30d', // Verdes lima
      '#f59e0b', '#fbbf24', '#d97706', // Ambar
      '#3b82f6', '#60a5fa', '#2563eb', // Azules
      '#10b981', '#34d399', '#059669', // Verdes
      '#ef4444', '#f87171', '#dc2626', // Rojos
    ];
    
    return colores[Math.floor(Math.random() * colores.length)];
  } catch (error) {
    console.error('❌ Error al generar color aleatorio:', error);
    return '#8b5cf6';
  }
}

/**
 * 🎨 Determina si un color es claro u oscuro
 * 
 * @param color - Color en formato hexadecimal
 * @returns true si es claro, false si es oscuro
 */
export function esColorClaro(color: string): boolean {
  try {
    // Remover el # si existe
    const hex = color.replace('#', '');
    
    // Convertir a RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminosidad (fórmula estándar)
    const luminosidad = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminosidad > 0.5;
  } catch (error) {
    console.error('❌ Error al determinar si el color es claro:', error);
    return false;
  }
}

// ============================================================================
// 🔍 UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * 📧 Valida si un email tiene formato válido
 * 
 * @param email - Email a validar
 * @returns true si es válido, false si no
 */
export function esEmailValido(email: string): boolean {
  try {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  } catch (error) {
    console.error('❌ Error al validar email:', error);
    return false;
  }
}

/**
 * 📱 Valida si un teléfono tiene formato válido (Argentina)
 * 
 * @param telefono - Teléfono a validar
 * @returns true si es válido, false si no
 */
export function esTelefonoValido(telefono: string): boolean {
  try {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    return telefonoLimpio.length >= 10 && telefonoLimpio.length <= 15;
  } catch (error) {
    console.error('❌ Error al validar teléfono:', error);
    return false;
  }
}

// ============================================================================
// 🔄 UTILIDADES DE ASYNC
// ============================================================================

/**
 * ⏳ Espera un tiempo específico
 * 
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
export function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔄 Reintenta una función asíncrona varias veces
 * 
 * @param fn - Función a reintentar
 * @param intentos - Número máximo de intentos (default: 3)
 * @param esperaMs - Tiempo de espera entre intentos (default: 1000)
 * @returns Resultado de la función
 */
export async function reintentar<T>(
  fn: () => Promise<T>,
  intentos: number = 3,
  esperaMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (intentos <= 1) {
      throw error;
    }
    
    console.warn(`⚠️ Error al ejecutar función, reintentando en ${esperaMs}ms...`);
    await esperar(esperaMs);
    return reintentar(fn, intentos - 1, esperaMs);
  }
}

// ============================================================================
// 🌐 UTILIDADES DE NAVEGACIÓN
// ============================================================================

/**
 * 🌐 Copia un texto al portapapeles
 * 
 * @param texto - Texto a copiar
 * @returns true si se copió exitosamente, false si no
 */
export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const resultado = document.execCommand('copy');
      textArea.remove();
      return resultado;
    }
  } catch (error) {
    console.error('❌ Error al copiar al portapapeles:', error);
    return false;
  }
}

/**
 * 📱 Descarga un archivo desde una URL
 * 
 * @param url - URL del archivo
 * @param nombreArchivo - Nombre del archivo a guardar
 */
export function descargarArchivo(url: string, nombreArchivo: string): void {
  try {
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  } catch (error) {
    console.error('❌ Error al descargar archivo:', error);
  }
}

// ============================================================================
// 📤 EXPORTACIONES
// ============================================================================

export {
  clsx,
};
