/**
 * 🔐 Sistema de Autenticación JWT - Laboratorio 3D
 * 
 * Este archivo contiene todas las utilidades relacionadas con la autenticación
 * de usuarios mediante tokens JWT. Incluye generación, verificación y manejo
 * de tokens con las mejores prácticas de seguridad.
 */

import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { NextRequest } from 'next/server';
import { RolUsuario, UsuarioBase } from '@/types';

// ============================================================================
// 🔑 CONFIGURACIÓN DE JWT
// ============================================================================

/**
 * 🔐 Clave secreta para JWT
 * Se obtiene de las variables de entorno para mayor seguridad
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-cambiar-en-produccion'
);

/**
 * ⏰ Tiempo de expiración del token (por defecto 24 horas)
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 🎭 Tipo de payload del token JWT personalizado
 */
interface CustomJWTPayload extends JoseJWTPayload {
  sub: string; // ID del usuario
  email: string;
  rol: RolUsuario;
  nombre: string;
}

// Exportar el tipo para uso externo
export type JWTPayload = CustomJWTPayload;

// ============================================================================
// 🔐 GENERACIÓN DE TOKENS
// ============================================================================

/**
 * 🔑 Genera un token JWT para un usuario
 * 
 * @param usuario - Datos del usuario para incluir en el token
 * @param expiresIn - Tiempo de expiración personalizado (opcional)
 * @returns Token JWT firmado
 * 
 * @example
 * ```typescript
 * const token = await generarTokenJWT({
 *   id: 1,
 *   email: 'usuario@ejemplo.com',
 *   rol: RolUsuario.CLIENTE,
 *   nombre_completo: 'Juan Pérez'
 * });
 * ```
 */
export async function generarTokenJWT(
  usuario: Pick<UsuarioBase, 'id' | 'email' | 'rol' | 'nombre_completo'>,
  expiresIn: string = JWT_EXPIRES_IN
): Promise<string> {
  try {
    // Validar que los datos requeridos estén presentes
    if (!usuario.id || !usuario.email || !usuario.rol || !usuario.nombre_completo) {
      throw new Error('Faltan datos requeridos para generar el token JWT');
    }

    // Crear el payload del token
    const payload: JWTPayload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre_completo,
    };

    // Generar y firmar el token
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setSubject(usuario.id.toString())
      .setIssuer('laboratorio-3d')
      .setAudience('laboratorio-3d-users')
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('❌ Error al generar token JWT:', error);
    throw new Error('No se pudo generar el token de autenticación');
  }
}

/**
 * 🔄 Genera un token de refresco (refresh token)
 * 
 * @param usuarioId - ID del usuario
 * @returns Token de refresco firmado
 */
export async function generarTokenRefresco(usuarioId: number): Promise<string> {
  try {
    const payload = {
      sub: usuarioId.toString(),
      type: 'refresh',
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Los refresh tokens duran 7 días
      .setSubject(usuarioId.toString())
      .setIssuer('laboratorio-3d')
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('❌ Error al generar token de refresco:', error);
    throw new Error('No se pudo generar el token de refresco');
  }
}

// ============================================================================
// 🔍 VERIFICACIÓN DE TOKENS
// ============================================================================

/**
 * ✅ Verifica y decodifica un token JWT
 * 
 * @param token - Token JWT a verificar
 * @returns Payload decodificado del token
 * 
 * @example
 * ```typescript
 * try {
 *   const payload = await verificarTokenJWT(token);
 *   console.log('Usuario:', payload.nombre);
 * } catch (error) {
 *   console.error('Token inválido:', error.message);
 * }
 * ```
 */
export async function verificarTokenJWT(token: string): Promise<JWTPayload> {
  try {
    // Validar que el token no esté vacío
    if (!token || token.trim() === '') {
      throw new Error('El token está vacío');
    }

    // Verificar y decodificar el token
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'laboratorio-3d',
      audience: 'laboratorio-3d-users',
    });

    // Validar que el payload tenga los campos requeridos
    if (!payload.sub || !payload.email || !payload.rol || !payload.nombre) {
      throw new Error('El token no contiene los campos requeridos');
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('❌ Error al verificar token JWT:', error);
    
    if (error instanceof Error) {
      // Manejar errores específicos de JWT
      if (error.message.includes('expired')) {
        throw new Error('El token ha expirado');
      }
      if (error.message.includes('invalid signature')) {
        throw new Error('La firma del token es inválida');
      }
      if (error.message.includes('malformed')) {
        throw new Error('El formato del token es inválido');
      }
    }
    
    throw new Error('Token de autenticación inválido');
  }
}

/**
 * 🔄 Verifica un token de refresco
 * 
 * @param token - Token de refresco a verificar
 * @returns ID del usuario si el token es válido
 */
export async function verificarTokenRefresco(token: string): Promise<number> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'laboratorio-3d',
    });

    if (payload.type !== 'refresh' || !payload.sub) {
      throw new Error('Token de refresco inválido');
    }

    return parseInt(payload.sub as string, 10);
  } catch (error) {
    console.error('❌ Error al verificar token de refresco:', error);
    throw new Error('Token de refresco inválido o expirado');
  }
}

// ============================================================================
// 🍪 EXTRACCIÓN DE TOKENS DE REQUESTS
// ============================================================================

/**
 * 🍪 Extrae el token JWT de una request HTTP
 * 
 * @param request - Request de Next.js
 * @returns Token JWT si se encuentra, null si no
 * 
 * @example
 * ```typescript
 * const token = extraerTokenDeRequest(request);
 * if (token) {
 *   const payload = await verificarTokenJWT(token);
 * }
 * ```
 */
export function extraerTokenDeRequest(request: NextRequest): string | null {
  try {
    // 1. Intentar obtener del header Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Intentar obtener de las cookies
    const tokenCookie = request.cookies.get('auth_token');
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }

    // 3. Intentar obtener del query string (no recomendado para producción)
    const { searchParams } = new URL(request.url);
    const tokenQuery = searchParams.get('token');
    if (tokenQuery) {
      return tokenQuery;
    }

    return null;
  } catch (error) {
    console.error('❌ Error al extraer token de la request:', error);
    return null;
  }
}

/**
 * 🔍 Verifica la autenticación desde una request
 * 
 * @param request - Request de Next.js
 * @returns Payload del usuario si está autenticado
 * @throws Error si no está autenticado o el token es inválido
 */
export async function verificarAutenticacionRequest(request: NextRequest): Promise<JWTPayload> {
  try {
    const token = extraerTokenDeRequest(request);
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    return await verificarTokenJWT(token);
  } catch (error) {
    console.error('❌ Error en verificación de autenticación:', error);
    throw new Error('No autorizado: ' + (error as Error).message);
  }
}

// ============================================================================
// 🛡️ MIDDLEWARE DE AUTENTICACIÓN
// ============================================================================

/**
 * 🛡️ Verifica si un usuario tiene los roles requeridos
 * 
 * @param payload - Payload del token JWT
 * @param rolesRequeridos - Array de roles permitidos
 * @returns true si el usuario tiene permiso, false si no
 */
export function verificarRolPermitido(
  payload: JWTPayload,
  rolesRequeridos: RolUsuario[]
): boolean {
  try {
    if (!payload.rol) {
      return false;
    }

    return rolesRequeridos.includes(payload.rol);
  } catch (error) {
    console.error('❌ Error al verificar rol:', error);
    return false;
  }
}

/**
 * 🛡️ Middleware para verificar roles específicos
 * 
 * @param request - Request de Next.js
 * @param rolesRequeridos - Roles permitidos para acceder al recurso
 * @returns Payload del usuario si tiene permiso
 * @throws Error si no tiene permiso
 */
export async function verificarRolesMiddleware(
  request: NextRequest,
  rolesRequeridos: RolUsuario[]
): Promise<JWTPayload> {
  try {
    const payload = await verificarAutenticacionRequest(request);
    
    if (!verificarRolPermitido(payload, rolesRequeridos)) {
      throw new Error(`Acceso denegado. Se requieren roles: ${rolesRequeridos.join(', ')}`);
    }

    return payload;
  } catch (error) {
    console.error('❌ Error en middleware de roles:', error);
    throw error;
  }
}

// ============================================================================
// 🔧 UTILIDADES ADICIONALES
// ============================================================================

/**
 * ⏰ Calcula el tiempo de expiración de un token
 * 
 * @param expiresIn - Tiempo de expiración (ej: '24h', '7d', '30m')
 * @returns Timestamp de expiración en milisegundos
 */
export function calcularExpiracionToken(expiresIn: string): number {
  try {
    const now = Date.now();
    const match = expiresIn.match(/^(\d+)([hdwmy])$/);
    
    if (!match) {
      throw new Error('Formato de tiempo de expiración inválido');
    }

    const [, cantidad, unidad] = match;
    const cantidadNum = parseInt(cantidad, 10);
    
    let multiplicador = 0;
    switch (unidad) {
      case 'm': multiplicador = 60 * 1000; break; // minutos
      case 'h': multiplicador = 60 * 60 * 1000; break; // horas
      case 'd': multiplicador = 24 * 60 * 60 * 1000; break; // días
      case 'w': multiplicador = 7 * 24 * 60 * 60 * 1000; break; // semanas
      case 'M': multiplicador = 30 * 24 * 60 * 60 * 1000; break; // meses
      case 'y': multiplicador = 365 * 24 * 60 * 60 * 1000; break; // años
      default:
        throw new Error('Unidad de tiempo no válida');
    }

    return now + (cantidadNum * multiplicador);
  } catch (error) {
    console.error('❌ Error al calcular expiración del token:', error);
    // Por defecto, retornar 24 horas
    return Date.now() + (24 * 60 * 60 * 1000);
  }
}

/**
 * 🔄 Refresca un token JWT existente
 * 
 * @param tokenActual - Token actual a refrescar
 * @param usuario - Datos actualizados del usuario (opcional)
 * @returns Nuevo token JWT
 */
export async function refrescarTokenJWT(
  tokenActual: string,
  usuario?: Pick<UsuarioBase, 'id' | 'email' | 'rol' | 'nombre_completo'>
): Promise<string> {
  try {
    // Verificar el token actual
    const payloadActual = await verificarTokenJWT(tokenActual);
    
    // Usar los datos proporcionados o mantener los actuales
    const datosUsuario = usuario || {
      id: parseInt(payloadActual.sub, 10),
      email: payloadActual.email,
      rol: payloadActual.rol,
      nombre_completo: payloadActual.nombre,
    };

    // Generar nuevo token
    return await generarTokenJWT(datosUsuario);
  } catch (error) {
    console.error('❌ Error al refrescar token JWT:', error);
    throw new Error('No se pudo refrescar el token de autenticación');
  }
}

/**
 * 🚨 Verifica si un token está próximo a expirar
 * 
 * @param token - Token JWT a verificar
 * @param minutosAntes - Minutos antes de la expiración para considerar como próximo (default: 30)
 * @returns true si el token está próximo a expirar
 */
export async function tokenProximoAExpirar(token: string, minutosAntes: number = 30): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload.exp) {
      return false;
    }

    const ahora = Math.floor(Date.now() / 1000);
    const umbral = payload.exp - (minutosAntes * 60);
    
    return ahora >= umbral;
  } catch (error) {
    console.error('❌ Error al verificar expiración del token:', error);
    return true; // Si hay error, asumimos que está próx. a expirar
  }
}

// ============================================================================
// 📝 EXPORTACIONES
// ============================================================================

export { JWT_SECRET, JWT_EXPIRES_IN };
