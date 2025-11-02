/**
 * 📋 Tipos y Interfaces para Usuarios
 * 
 * Este archivo define todos los tipos relacionados con la gestión de usuarios
 * en el sistema Laboratorio 3D. Incluye validaciones exhaustivas y tipos
 * específicos para cada rol y operación.
 */

import { z } from 'zod';

/**
 * 🎭 Enumeración de Roles de Usuario
 * Define los diferentes roles que puede tener un usuario en el sistema
 */
export enum RolUsuario {
  ADMIN = 'admin',
  OPERADOR = 'operador',
  CLIENTE = 'cliente',
}

/**
 * 📊 Enumeración de Estados de Usuario
 * Define los posibles estados de un usuario en el sistema
 */
export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
  PENDIENTE_VERIFICACION = 'pendiente_verificacion',
}

/**
 * 🏆 Enumeración de Niveles de Lealtad
 * Define los niveles del programa de lealtad
 */
export enum NivelLealtad {
  BRONCE = 'bronce',
  PLATA = 'plata',
  ORO = 'oro',
  PLATINO = 'platino',
  DIAMANTE = 'diamante',
}

/**
 * 📝 Interface Base de Usuario
 * Contiene los campos fundamentales de un usuario
 */
export interface UsuarioBase {
  id: number;
  nombre_completo: string;
  email: string;
  dni: string;
  telefono?: string;
  instagram?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

/**
 * 💰 Interface de Cliente con Campos de Lealtad
 * Extiende UsuarioBase con campos específicos para clientes
 */
export interface Cliente extends UsuarioBase {
  puntos_acumulados: number;
  codigo_referido: string;
  referido_por_id?: number;
  nivel_lealtad_id: number;
  apto_para_canje: boolean;
  total_compras: number;
  monto_total_compras: number;
}

/**
 * 👤 Interface de Usuario con Datos Completos
 * Incluye relaciones y datos adicionales para el dashboard
 */
export interface UsuarioCompleto extends Cliente {
  nivel_lealtad: {
    id: number;
    nombre: NivelLealtad;
    puntos_minimos: number;
    beneficios: string[];
    color: string;
  };
  referidos: UsuarioBase[];
  compras: Compra[];
  premios_canjeados: PremioCanjeado[];
}

/**
 * 🛒 Interface de Compra
 * Representa una compra realizada por un cliente
 */
export interface Compra {
  id: number;
  cliente_id: number;
  monto: number;
  descripcion: string;
  medio_pago: string;
  comprobante_url?: string;
  fecha_compra: Date;
  verificado: boolean;
  puntos_ganados: number;
}

/**
 * 🎁 Interface de Premio Canjeado
 * Representa un premio que un cliente ha canjeado
 */
export interface PremioCanjeado {
  id: number;
  cliente_id: number;
  premio_id: number;
  fecha_canje: Date;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  premio: {
    id: number;
    nombre: string;
    descripcion: string;
    puntos_requeridos: number;
    categoria: string;
  };
}

// ============================================================================
// 🛡️ ESQUEMAS DE VALIDACIÓN CON ZOD
// ============================================================================

/**
 * 🔐 Schema para Registro de Nuevo Usuario
 * Valida los datos de entrada cuando un usuario se registra
 */
export const RegistroUsuarioSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z
    .string()
    .email('El email no es válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  confirmar_password: z
    .string()
    .min(1, 'Debe confirmar la contraseña'),
  
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 caracteres')
    .max(9, 'El DNI no puede exceder 9 caracteres')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
  
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10,15}$/.test(val), 
           'El teléfono debe contener entre 10 y 15 dígitos'),
  
  instagram: z
    .string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9._]+$/.test(val), 
           'El usuario de Instagram solo puede contener letras, números, puntos y guiones bajos'),
  
  codigo_referido: z
    .string()
    .max(20, 'El código de referido no puede exceder 20 caracteres')
    .optional(),
  
  // Aceptación de términos y condiciones
  acepta_terminos: z
    .boolean()
    .refine((val) => val === true, 'Debe aceptar los términos y condiciones'),
  
  // Consentimiento de privacidad
  acepta_privacidad: z
    .boolean()
    .refine((val) => val === true, 'Debe aceptar la política de privacidad'),
}).refine((data) => data.password === data.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
});

/**
 * 🔑 Schema para Inicio de Sesión
 * Valida las credenciales de acceso
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('El email no es válido')
    .min(1, 'El email es requerido'),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
  
  // Recordar sesión (opcional)
  recordar: z
    .boolean()
    .optional()
    .default(false),
});

/**
 * 📝 Schema para Actualización de Perfil
 * Valida los datos cuando un usuario actualiza su perfil
 */
export const ActualizarPerfilSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10,15}$/.test(val), 
           'El teléfono debe contener entre 10 y 15 dígitos'),
  
  instagram: z
    .string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9._]+$/.test(val), 
           'El usuario de Instagram solo puede contener letras, números, puntos y guiones bajos'),
});

/**
 * 🔐 Schema para Cambio de Contraseña
 * Valida el proceso de cambio de contraseña
 */
export const CambiarPasswordSchema = z.object({
  password_actual: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  
  password_nueva: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  confirmar_password_nueva: z
    .string()
    .min(1, 'Debe confirmar la nueva contraseña'),
}).refine((data) => data.password_nueva === data.confirmar_password_nueva, {
  message: 'Las nuevas contraseñas no coinciden',
  path: ['confirmar_password_nueva'],
});

/**
 * 🎯 Schema para Creación de Usuario por Admin
 * Valida cuando un administrador crea un nuevo usuario
 */
export const CrearUsuarioAdminSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z
    .string()
    .email('El email no es válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),
  
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 caracteres')
    .max(9, 'El DNI no puede exceder 9 caracteres')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
  
  rol: z
    .nativeEnum(RolUsuario, {
      errorMap: () => ({ message: 'El rol seleccionado no es válido' }),
    }),
  
  telefono: z.string().optional(),
  instagram: z.string().optional(),
});

// ============================================================================
// 📤 TIPOS DE INFERENCIA
// ============================================================================

/**
 * 📝 Tipo inferido para registro de usuario
 */
export type RegistroUsuarioInput = z.infer<typeof RegistroUsuarioSchema>;

/**
 * 🔑 Tipo inferido para login
 */
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * 📝 Tipo inferido para actualización de perfil
 */
export type ActualizarPerfilInput = z.infer<typeof ActualizarPerfilSchema>;

/**
 * 🔐 Tipo inferido para cambio de contraseña
 */
export type CambiarPasswordInput = z.infer<typeof CambiarPasswordSchema>;

/**
 * 🎯 Tipo inferido para creación de usuario por admin
 */
export type CrearUsuarioAdminInput = z.infer<typeof CrearUsuarioAdminSchema>;

// ============================================================================
// 🎭 TIPOS PARA RESPUESTAS API
// ============================================================================

/**
 * ✅ Respuesta exitosa de operaciones de usuario
 */
export interface UsuarioResponseSuccess {
  success: true;
  usuario: UsuarioCompleto;
  mensaje: string;
}

/**
 * ❌ Respuesta de error en operaciones de usuario
 */
export interface UsuarioResponseError {
  success: false;
  error: string;
  detalles?: Record<string, string[]>;
}

/**
 * 📋 Tipo unido para respuestas de usuario
 */
export type UsuarioResponse = UsuarioResponseSuccess | UsuarioResponseError;
