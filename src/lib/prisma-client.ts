/**
 * 🔧 Cliente Prisma para Laboratorio 3D
 * Adaptado a la estructura EXACTA de la base de datos existente
 */

import { PrismaClient, Rol } from '@prisma/client';

// Crear instancia de Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Interfaces basadas en la estructura REAL
export interface Usuario {
  id?: number;
  nombre_completo: string;
  dni?: string;
  instagram?: string;
  email: string;
  password?: string; // Nueva columna agregada
  password_hash: string; // Columna existente
  rol: 'CLIENTE' | 'ADMIN'; // Valores del enum mapeado
  puntos_acumulados: number;
  codigo_referido?: string;
  referido_por_id?: number;
  apto_para_canje: boolean;
  nivel_lealtad_id?: number;
  nivel?: string; // Nombre del nivel de lealtad
  activo?: boolean; // Campo para activar/desactivar usuario
  created_at?: Date;
  updated_at?: Date;
}

export interface Sesion {
  id?: string;
  usuario_id: number;
  expira_en: Date;
  creada_en?: Date;
}

// Funciones de Usuarios adaptadas a la estructura REAL
export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email.toLowerCase()
      },
      include: {
        nivelLealtad: true
      }
    });
    
    if (!usuario) return null;
    
    return {
      id: usuario.id,
      nombre_completo: usuario.nombreCompleto,
      dni: usuario.dni || undefined,
      instagram: usuario.instagram || undefined,
      email: usuario.email,
      password: usuario.password || undefined, // Nueva columna si existe
      password_hash: usuario.passwordHash, // Columna existente
      rol: usuario.rol,
      puntos_acumulados: usuario.puntosAcumulados,
      codigo_referido: usuario.codigoReferido || undefined,
      referido_por_id: usuario.referidoPorId || undefined,
      apto_para_canje: usuario.aptoParaCanje,
      nivel_lealtad_id: usuario.nivelLealtadId || undefined,
      created_at: usuario.createdAt,
      updated_at: usuario.updatedAt
    };
  } catch (error) {
    console.error('❌ Error obteniendo usuario por email:', error);
    throw error;
  }
}

export async function obtenerUsuarioPorId(id: number): Promise<Usuario | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: id },
      include: {
        nivelLealtad: true
      }
    });
    
    if (!usuario) return null;
    
    return {
      id: usuario.id,
      nombre_completo: usuario.nombreCompleto,
      dni: usuario.dni || undefined,
      instagram: usuario.instagram || undefined,
      email: usuario.email,
      password: usuario.password || undefined,
      password_hash: usuario.passwordHash,
      rol: usuario.rol,
      puntos_acumulados: usuario.puntosAcumulados,
      codigo_referido: usuario.codigoReferido || undefined,
      referido_por_id: usuario.referidoPorId || undefined,
      apto_para_canje: usuario.aptoParaCanje,
      nivel_lealtad_id: usuario.nivelLealtadId || undefined,
      nivel: usuario.nivelLealtad?.nombreNivel || 'Bronce', // Nombre del nivel
      created_at: usuario.createdAt,
      updated_at: usuario.updatedAt
    };
  } catch (error) {
    console.error('❌ Error obteniendo usuario por ID:', error);
    throw error;
  }
}

export async function crearUsuario(datos: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  try {
    const usuario = await prisma.usuario.create({
      data: {
        nombreCompleto: datos.nombre_completo,
        dni: datos.dni || null,
        email: datos.email.toLowerCase(),
        password: datos.password || null, // Nueva columna
        passwordHash: datos.password_hash, // Columna existente
        rol: datos.rol,
        puntosAcumulados: datos.puntos_acumulados,
        codigoReferido: datos.codigo_referido || null,
        referidoPorId: datos.referido_por_id || null,
        aptoParaCanje: datos.apto_para_canje,
        nivelLealtadId: datos.nivel_lealtad_id || null
      }
    });
    
    console.log(`✅ Usuario creado: ${datos.email}`);
    return usuario.id;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('El email o DNI ya está registrado');
    }
    throw error;
  }
}

export async function actualizarUsuario(
  usuarioId: number, 
  datos: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    // Mapear nombres de campos de la interfaz a los nombres de Prisma
    const datosActualizacion: any = {};
    
    if (datos.nombre_completo !== undefined) datosActualizacion.nombreCompleto = datos.nombre_completo;
    if (datos.email !== undefined) datosActualizacion.email = datos.email;
    if (datos.password !== undefined) datosActualizacion.password = datos.password;
    if (datos.password_hash !== undefined) datosActualizacion.passwordHash = datos.password_hash;
    if (datos.dni !== undefined) datosActualizacion.dni = datos.dni;
    if (datos.instagram !== undefined) datosActualizacion.instagram = datos.instagram;
    if (datos.rol !== undefined) datosActualizacion.rol = datos.rol;
    if (datos.puntos_acumulados !== undefined) datosActualizacion.puntosAcumulados = datos.puntos_acumulados;
    if (datos.codigo_referido !== undefined) datosActualizacion.codigoReferido = datos.codigo_referido;
    if (datos.referido_por_id !== undefined) datosActualizacion.referidoPorId = datos.referido_por_id;
    if (datos.apto_para_canje !== undefined) datosActualizacion.aptoParaCanje = datos.apto_para_canje;
    if (datos.nivel_lealtad_id !== undefined) datosActualizacion.nivelLealtadId = datos.nivel_lealtad_id;
    if (datos.activo !== undefined) datosActualizacion.activo = datos.activo;

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: datosActualizacion
    });
    
    console.log(`✅ Usuario ${usuarioId} actualizado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    throw error;
  }
}

export async function actualizarPuntosUsuario(usuarioId: number, puntos: number): Promise<string> {
  try {
    // Determinar nivel según puntos
    let nivelId = 1; // Bronce por defecto
    if (puntos >= 10000) nivelId = 4; // Platino
    else if (puntos >= 6000) nivelId = 3; // Oro
    else if (puntos >= 3000) nivelId = 2; // Plata
    
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        puntosAcumulados: puntos,
        nivelLealtadId: nivelId
      }
    });
    
    console.log(`✅ Puntos actualizados: Usuario ${usuarioId}, ${puntos} pts, Nivel ID ${nivelId}`);
    return nivelId.toString();
  } catch (error) {
    console.error('❌ Error actualizando puntos:', error);
    throw error;
  }
}

// Funciones de Sesiones con Prisma
export async function crearSesion(datos: { id: string; usuario_id: number; expira_en: Date }): Promise<boolean> {
  try {
    await prisma.sesion.create({
      data: {
        id: datos.id,
        usuarioId: datos.usuario_id,
        expiraEn: datos.expira_en
      }
    });
    
    console.log(`✅ Sesión creada: ${datos.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando sesión:', error);
    throw error;
  }
}

export async function obtenerSesion(sesionId: string): Promise<Sesion | null> {
  try {
    const sesion = await prisma.sesion.findUnique({
      where: { 
        id: sesionId,
        expiraEn: { gt: new Date() }
      }
    });
    
    if (!sesion) return null;
    
    return {
      id: sesion.id,
      usuario_id: sesion.usuarioId,
      expira_en: sesion.expiraEn,
      creada_en: sesion.creadaEn ?? undefined
    };
  } catch (error) {
    console.error('❌ Error obteniendo sesión:', error);
    throw error;
  }
}

export async function eliminarSesion(sesionId: string): Promise<boolean> {
  try {
    await prisma.sesion.delete({
      where: { id: sesionId }
    });
    
    console.log(`✅ Sesión eliminada: ${sesionId}`);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando sesión:', error);
    throw error;
  }
}

// Funciones de Tokens de Recuperación con Prisma
export async function crearTokenRecuperacion(usuarioId: number, token: string): Promise<boolean> {
  try {
    await prisma.tokenRecuperacion.create({
      data: {
        id: Math.random().toString(36).substring(2, 15),
        usuarioId: usuarioId,
        token: token,
        expiraEn: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        usado: false
      }
    });
    
    console.log(`✅ Token de recuperación creado para usuario ${usuarioId}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando token de recuperación:', error);
    throw error;
  }
}

export async function obtenerTokenRecuperacion(token: string): Promise<any> {
  try {
    const tokenData = await prisma.tokenRecuperacion.findFirst({
      where: {
        token: token,
        usado: false,
        expiraEn: { gt: new Date() }
      }
    });
    
    return tokenData;
  } catch (error) {
    console.error('❌ Error obteniendo token de recuperación:', error);
    throw error;
  }
}

export async function marcarTokenComoUsado(tokenId: string): Promise<boolean> {
  try {
    await prisma.tokenRecuperacion.update({
      where: { id: tokenId },
      data: { usado: true }
    });
    return true;
  } catch (error) {
    console.error('❌ Error marcando token como usado:', error);
    throw error;
  }
}

export async function actualizarPasswordUsuario(usuarioId: number, nuevoPassword: string): Promise<boolean> {
  try {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: nuevoPassword }
    });
    
    console.log(`✅ Contraseña actualizada para usuario ${usuarioId}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    throw error;
  }
}

// Funciones de Estadísticas con Prisma
export async function obtenerEstadisticasUsuario(usuarioId: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        nivelLealtad: true
      }
    });
    
    if (!usuario) return null;
    
    const niveles = [
      { id: 1, nombre: 'Bronce', puntos_requeridos: 1500, beneficios: 'Descuento 5% en filamentos', orden: 1 },
      { id: 2, nombre: 'Plata', puntos_requeridos: 3000, beneficios: '1kg Filamento PLA Premium', orden: 2 },
      { id: 3, nombre: 'Oro', puntos_requeridos: 6000, beneficios: '5kg Filamento + Herramientas', orden: 3 },
      { id: 4, nombre: 'Platino', puntos_requeridos: 10000, beneficios: 'Impresora 3D + Filamentos', orden: 4 }
    ];
    
    const nivelActual = niveles.find(n => n.id === usuario.nivelLealtadId) || niveles[0];
    const siguienteNivel = niveles.find(n => n.orden > nivelActual.orden);
    
    // Obtener compras del usuario (simulado por ahora)
    const totalCompras = 0; // TODO: Implementar cuando tengamos la tabla de compras
    const puntosGastadosTotales = 0; // TODO: Implementar cuando tengamos la tabla de compras
    
    return {
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombreCompleto,
        email: usuario.email,
        puntos: usuario.puntosAcumulados,
        nivel: nivelActual.nombre,
        codigo_referido: usuario.codigoReferido,
        creado_en: usuario.createdAt
      },
      nivel_actual: nivelActual || null,
      siguiente_nivel: siguienteNivel || null,
      puntos_para_siguiente: siguienteNivel 
        ? Math.max(0, siguienteNivel.puntos_requeridos - usuario.puntosAcumulados)
        : 0,
      progreso_actual: nivelActual && siguienteNivel
        ? Math.min(100, ((usuario.puntosAcumulados - (niveles[nivelActual.orden - 2]?.puntos_requeridos || 0)) / 
           (siguienteNivel.puntos_requeridos - (niveles[nivelActual.orden - 2]?.puntos_requeridos || 0))) * 100)
        : 100,
      total_compras: totalCompras,
      puntos_gastados_totales: puntosGastadosTotales
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
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
