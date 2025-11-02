/**
 * 🛡️ Utilidades de Validación - Laboratorio 3D
 * 
 * Este archivo contiene funciones de validación comunes y middleware
 * para validar datos de entrada, parámetros de URL y otros datos.
 * Utiliza Zod para validaciones estructuradas y validaciones personalizadas.
 */

import { z } from 'zod';
import { NextRequest } from 'next/server';

// ============================================================================
// 🔍 VALIDACIONES DE CADENAS (STRINGS)
// ============================================================================

/**
 * 🔤 Valida si una cadena es un nombre válido
 * 
 * @param nombre - Cadena a validar
 * @returns true si es válido, false si no
 */
export function esNombreValido(nombre: string): boolean {
  try {
    // Debe tener entre 2 y 100 caracteres
    if (nombre.length < 2 || nombre.length > 100) {
      return false;
    }

    // Solo permite letras, espacios, acentos y ñ
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/;
    return regex.test(nombre.trim());
  } catch (error) {
    console.error('❌ Error al validar nombre:', error);
    return false;
  }
}

/**
 * 📧 Valida si una cadena es un email válido
 * 
 * @param email - Cadena a validar
 * @returns true si es válido, false si no
 */
export function esEmailValido(email: string): boolean {
  try {
    // Regex más estricta para emails
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(email)) {
      return false;
    }

    // Validaciones adicionales
    const partes = email.split('@');
    if (partes.length !== 2) {
      return false;
    }

    const [local, dominio] = partes;
    
    // El dominio debe tener al menos un punto
    if (!dominio.includes('.')) {
      return false;
    }

    // No puede empezar ni terminar con punto o guión
    if (local.startsWith('.') || local.endsWith('.') || 
        local.startsWith('-') || local.endsWith('-')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar email:', error);
    return false;
  }
}

/**
 * 📱 Valida si una cadena es un teléfono válido (Argentina)
 * 
 * @param telefono - Cadena a validar
 * @returns true si es válido, false si no
 */
export function esTelefonoValido(telefono: string): boolean {
  try {
    // Eliminar caracteres no numéricos
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    // Debe tener entre 10 y 15 dígitos
    if (telefonoLimpio.length < 10 || telefonoLimpio.length > 15) {
      return false;
    }

    // Para Argentina, debe empezar con 54 o 11 (para CABA)
    if (!telefonoLimpio.startsWith('54') && !telefonoLimpio.startsWith('11')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar teléfono:', error);
    return false;
  }
}

/**
 * 🆔 Valida si una cadena es un DNI válido (Argentina)
 * 
 * @param dni - Cadena a validar
 * @returns true si es válido, false si no
 */
export function esDNIValido(dni: string): boolean {
  try {
    // Eliminar caracteres no numéricos
    const dniLimpio = dni.replace(/\D/g, '');
    
    // El DNI argentino tiene entre 7 y 8 dígitos
    if (dniLimpio.length < 7 || dniLimpio.length > 8) {
      return false;
    }

    // No puede ser todos ceros
    if (/^0+$/.test(dniLimpio)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar DNI:', error);
    return false;
  }
}

/**
 * 🔐 Valida si una contraseña es segura
 * 
 * @param password - Contraseña a validar
 * @returns Objeto con resultado y mensaje de error
 */
export function validarPassword(password: string): { valido: boolean; error?: string } {
  try {
    if (password.length < 8) {
      return { valido: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    if (password.length > 128) {
      return { valido: false, error: 'La contraseña no puede exceder 128 caracteres' };
    }

    // Debe contener al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      return { valido: false, error: 'La contraseña debe contener al menos una mayúscula' };
    }

    // Debe contener al menos una minúscula
    if (!/[a-z]/.test(password)) {
      return { valido: false, error: 'La contraseña debe contener al menos una minúscula' };
    }

    // Debe contener al menos un número
    if (!/\d/.test(password)) {
      return { valido: false, error: 'La contraseña debe contener al menos un número' };
    }

    // Debe contener al menos un carácter especial
    if (!/[@$!%*?&]/.test(password)) {
      return { valido: false, error: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)' };
    }

    return { valido: true };
  } catch (error) {
    console.error('❌ Error al validar contraseña:', error);
    return { valido: false, error: 'Error al validar la contraseña' };
  }
}

// ============================================================================
// 💰 VALIDACIONES DE NÚMEROS Y MONEDAS
// ============================================================================

/**
 * 💰 Valida si un valor es un monto monetario válido
 * 
 * @param monto - Valor a validar
 * @returns true si es válido, false si no
 */
export function esMontoValido(monto: number): boolean {
  try {
    // Debe ser un número finito
    if (!Number.isFinite(monto)) {
      return false;
    }

    // No puede ser negativo
    if (monto < 0) {
      return false;
    }

    // No puede tener más de 2 decimales
    const decimales = monto.toString().split('.')[1];
    if (decimales && decimales.length > 2) {
      return false;
    }

    // Límite máximo (999,999.99)
    if (monto > 999999.99) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar monto:', error);
    return false;
  }
}

/**
 * 🔢 Valida si un valor es un número de puntos válido
 * 
 * @param puntos - Valor a validar
 * @returns true si es válido, false si no
 */
export function esPuntosValidos(puntos: number): boolean {
  try {
    // Debe ser un número entero finito
    if (!Number.isInteger(puntos) || !Number.isFinite(puntos)) {
      return false;
    }

    // No puede ser negativo
    if (puntos < 0) {
      return false;
    }

    // Límite máximo (99,999 puntos)
    if (puntos > 99999) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar puntos:', error);
    return false;
  }
}

// ============================================================================
// 📅 VALIDACIONES DE FECHAS
// ============================================================================

/**
 * 📅 Valida si una fecha es válida y no es futura
 * 
 * @param fecha - Fecha a validar (string o Date)
 * @param permitirFutura - Si permite fechas futuras (default: false)
 * @returns true si es válida, false si no
 */
export function esFechaValida(fecha: string | Date, permitirFutura: boolean = false): boolean {
  try {
    let fechaObj: Date;

    if (typeof fecha === 'string') {
      // Validar formato de fecha ISO
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (!isoRegex.test(fecha)) {
        return false;
      }
      
      fechaObj = new Date(fecha);
    } else {
      fechaObj = fecha;
    }

    // Verificar que sea una fecha válida
    if (isNaN(fechaObj.getTime())) {
      return false;
    }

    // Verificar que no sea una fecha muy antigua (antes de 1900)
    if (fechaObj.getFullYear() < 1900) {
      return false;
    }

    // Verificar que no sea futura (si no se permite)
    if (!permitirFutura && fechaObj > new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar fecha:', error);
    return false;
  }
}

/**
 * 📊 Valida un rango de fechas
 * 
 * @param fechaDesde - Fecha de inicio
 * @param fechaHasta - Fecha de fin
 * @returns Objeto con resultado y mensaje de error
 */
export function validarRangoFechas(
  fechaDesde: string | Date,
  fechaHasta: string | Date
): { valido: boolean; error?: string } {
  try {
    const desde = typeof fechaDesde === 'string' ? new Date(fechaDesde) : fechaDesde;
    const hasta = typeof fechaHasta === 'string' ? new Date(fechaHasta) : fechaHasta;

    // Validar que ambas fechas sean válidas
    if (!esFechaValida(desde) || !esFechaValida(hasta)) {
      return { valido: false, error: 'Una o ambas fechas no son válidas' };
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (hasta <= desde) {
      return { valido: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
    }

    // Validar que el rango no exceda 1 año
    const diasDiferencia = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
    if (diasDiferencia > 365) {
      return { valido: false, error: 'El rango de fechas no puede exceder 1 año' };
    }

    return { valido: true };
  } catch (error) {
    console.error('❌ Error al validar rango de fechas:', error);
    return { valido: false, error: 'Error al validar el rango de fechas' };
  }
}

// ============================================================================
// 🌐 VALIDACIONES DE URL Y ARCHIVOS
// ============================================================================

/**
 * 🌐 Valida si una URL es válida
 * 
 * @param url - URL a validar
 * @returns true si es válida, false si no
 */
export function esURLValida(url: string): boolean {
  try {
    // Intentar crear un objeto URL
    new URL(url);
    
    // Validar que use protocolos seguros
    const protocolosSeguros = ['http:', 'https:'];
    const urlObj = new URL(url);
    
    return protocolosSeguros.includes(urlObj.protocol);
  } catch (error) {
    console.error('❌ Error al validar URL:', error);
    return false;
  }
}

/**
 * 📁 Valida si un nombre de archivo es seguro
 * 
 * @param nombreArchivo - Nombre del archivo a validar
 * @returns true si es seguro, false si no
 */
export function esNombreArchivoSeguro(nombreArchivo: string): boolean {
  try {
    // No debe estar vacío
    if (!nombreArchivo || nombreArchivo.trim() === '') {
      return false;
    }

    // No debe contener caracteres peligrosos
    const caracteresPeligrosos = /[<>:"|?*\\]/;
    if (caracteresPeligrosos.test(nombreArchivo)) {
      return false;
    }

    // No debe empezar con punto ni guión
    if (nombreArchivo.startsWith('.') || nombreArchivo.startsWith('-')) {
      return false;
    }

    // Extensiones peligrosas
    const extensionesPeligrosas = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com',
      '.js', '.vbs', '.jar', '.php', '.asp', '.jsp'
    ];
    
    const extension = nombreArchivo.toLowerCase().slice(nombreArchivo.lastIndexOf('.'));
    if (extensionesPeligrosas.includes(extension)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al validar nombre de archivo:', error);
    return false;
  }
}

// ============================================================================
// 🔍 ESQUEMAS DE VALIDACIÓN ZOD COMUNES
// ============================================================================

/**
 * 🔤 Schema Zod para validar nombres
 */
export const NombreSchema = z.string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/, 'El nombre solo puede contener letras, espacios, acentos y guiones');

/**
 * 📧 Schema Zod para validar emails
 */
export const EmailSchema = z.string()
  .email('El email no es válido')
  .max(255, 'El email no puede exceder 255 caracteres')
  .refine((email) => esEmailValido(email), 'El formato del email no es válido');

/**
 * 📱 Schema Zod para validar teléfonos
 */
export const TelefonoSchema = z.string()
  .regex(/^\d{10,15}$/, 'El teléfono debe contener entre 10 y 15 dígitos')
  .refine((telefono) => esTelefonoValido(telefono), 'El formato del teléfono no es válido');

/**
 * 🆔 Schema Zod para validar DNIs
 */
export const DNISchema = z.string()
  .regex(/^\d{7,8}$/, 'El DNI debe contener entre 7 y 8 dígitos')
  .refine((dni) => esDNIValido(dni), 'El formato del DNI no es válido');

/**
 * 🔐 Schema Zod para validar contraseñas
 */
export const PasswordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
         'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial');

/**
 * 💰 Schema Zod para validar montos
 */
export const MontoSchema = z.number()
  .positive('El monto debe ser positivo')
  .max(999999.99, 'El monto no puede exceder 999,999.99')
  .refine((monto) => esMontoValido(monto), 'El monto no es válido');

/**
 * 🔢 Schema Zod para validar puntos
 */
export const PuntosSchema = z.number()
  .int('Los puntos deben ser un número entero')
  .min(0, 'Los puntos no pueden ser negativos')
  .max(99999, 'Los puntos no pueden exceder 99,999')
  .refine((puntos) => esPuntosValidos(puntos), 'Los puntos no son válidos');

/**
 * 📅 Schema Zod para validar fechas
 */
export const FechaSchema = z.string()
  .datetime('La fecha no es válida')
  .refine((fecha) => esFechaValida(fecha), 'La fecha no es válida');

/**
 * 🌐 Schema Zod para validar URLs
 */
export const URLSchema = z.string()
  .url('La URL no es válida')
  .refine((url) => esURLValida(url), 'La URL no es válida');

// ============================================================================
// 🔍 MIDDLEWARE DE VALIDACIÓN PARA API ROUTES
// ============================================================================

/**
 * 🔍 Valida y extrae parámetros de búsqueda de una URL
 * 
 * @param request - Request de Next.js
 * @param schema - Schema Zod para validar los parámetros
 * @returns Parámetros validados
 */
export async function validarParametrosBusqueda<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const { searchParams } = new URL(request.url);
    const parametros: Record<string, string> = {};
    
    // Convertir todos los parámetros a strings
    searchParams.forEach((valor, clave) => {
      parametros[clave] = valor;
    });

    return await schema.parseAsync(parametros);
  } catch (error) {
    console.error('❌ Error al validar parámetros de búsqueda:', error);
    throw new Error('Parámetros de búsqueda inválidos');
  }
}

/**
 * 📄 Valida el body de una request
 * 
 * @param request - Request de Next.js
 * @param schema - Schema Zod para validar el body
 * @returns Body validado
 */
export async function validarBodyRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return await schema.parseAsync(body);
  } catch (error) {
    console.error('❌ Error al validar body de request:', error);
    
    if (error instanceof z.ZodError) {
      const errores = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Datos inválidos: ${errores.join(', ')}`);
    }
    
    throw new Error('El formato de los datos es inválido');
  }
}

/**
 * 🔍 Valida parámetros de ruta (ej: /api/usuarios/[id])
 * 
 * @param params - Parámetros de ruta
 * @param schema - Schema Zod para validar
 * @returns Parámetros validados
 */
export function validarParametrosRuta<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): z.infer<T> {
  try {
    return schema.parse(params);
  } catch (error) {
    console.error('❌ Error al validar parámetros de ruta:', error);
    
    if (error instanceof z.ZodError) {
      const errores = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Parámetros inválidos: ${errores.join(', ')}`);
    }
    
    throw new Error('Los parámetros de ruta son inválidos');
  }
}

// ============================================================================
// 📝 EXPORTACIONES
// ============================================================================

export {
  z,
};
