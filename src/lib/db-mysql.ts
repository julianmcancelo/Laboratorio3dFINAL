import { query } from './mysql-connection';
import bcrypt from 'bcryptjs';

// Interfaces
export interface Usuario {
  id?: number;
  nombre_completo: string;
  dni: string;
  email: string;
  password: string;
  telefono?: string;
  instagram?: string;
  puntos: number;
  nivel: string;
  codigo_referido?: string;
  referido_por?: string;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface Sesion {
  id?: string;
  usuario_id: number;
  expira_en: string;
  creada_en?: string;
}

// Funciones de Usuarios
export async function crearUsuario(datos: Omit<Usuario, 'id' | 'creado_en' | 'actualizado_en'>): Promise<number> {
  const sql = `
    INSERT INTO usuarios (
      nombre_completo, dni, email, password, telefono, instagram,
      puntos, nivel, codigo_referido, referido_por, activo, creado_en, actualizado_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  
  const params = [
    datos.nombre_completo,
    datos.dni,
    datos.email,
    datos.password,
    datos.telefono || null,
    datos.instagram || null,
    datos.puntos,
    datos.nivel,
    datos.codigo_referido || null,
    datos.referido_por || null,
    datos.activo
  ];

  try {
    const result = await query(sql, params) as any;
    console.log(`✅ Usuario creado: ${datos.email}`);
    return result.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El email ya está registrado');
    }
    throw error;
  }
}

export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND activo = 1';
  const params = [email];

  try {
    const rows = await query(sql, params) as Usuario[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario por email:', error);
    throw error;
  }
}

export async function obtenerUsuarioPorId(id: number): Promise<Usuario | null> {
  const sql = 'SELECT * FROM usuarios WHERE id = ? AND activo = 1';
  const params = [id];

  try {
    const rows = await query(sql, params) as Usuario[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario por ID:', error);
    throw error;
  }
}

export async function actualizarPuntosUsuario(usuarioId: number, puntos: number): Promise<string> {
  const sql = `
    UPDATE usuarios 
    SET puntos = ?, actualizado_en = NOW(),
        nivel = CASE 
          WHEN ? >= 10000 THEN 'Platino'
          WHEN ? >= 6000 THEN 'Oro'
          WHEN ? >= 3000 THEN 'Plata'
          ELSE 'Bronce'
        END
    WHERE id = ?
  `;
  
  const params = [puntos, puntos, puntos, puntos, usuarioId];

  try {
    await query(sql, params);
    
    // Determinar nivel
    let nivel = 'Bronce';
    if (puntos >= 10000) nivel = 'Platino';
    else if (puntos >= 6000) nivel = 'Oro';
    else if (puntos >= 3000) nivel = 'Plata';
    
    console.log(`✅ Puntos actualizados: Usuario ${usuarioId}, ${puntos} pts, Nivel ${nivel}`);
    return nivel;
  } catch (error) {
    console.error('❌ Error actualizando puntos:', error);
    throw error;
  }
}

// Funciones de Sesiones
export async function crearSesion(datos: Omit<Sesion, 'creada_en'>): Promise<boolean> {
  const sql = `
    INSERT INTO sesiones (id, usuario_id, expira_en, creada_en)
    VALUES (?, ?, ?, NOW())
  `;
  
  const params = [datos.id!, datos.usuario_id, datos.expira_en];

  try {
    await query(sql, params);
    console.log(`✅ Sesión creada: ${datos.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando sesión:', error);
    throw error;
  }
}

export async function obtenerSesion(sesionId: string): Promise<Sesion | null> {
  const sql = `
    SELECT * FROM sesiones 
    WHERE id = ? AND expira_en > NOW()
  `;
  const params = [sesionId];

  try {
    const rows = await query(sql, params) as Sesion[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error obteniendo sesión:', error);
    throw error;
  }
}

export async function eliminarSesion(sesionId: string): Promise<boolean> {
  const sql = 'DELETE FROM sesiones WHERE id = ?';
  const params = [sesionId];

  try {
    await query(sql, params);
    console.log(`✅ Sesión eliminada: ${sesionId}`);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando sesión:', error);
    throw error;
  }
}

// Funciones de Niveles
export async function obtenerNiveles() {
  return [
    { id: 1, nombre: 'Bronce', puntos_requeridos: 1500, beneficios: 'Descuento 5% en filamentos', orden: 1 },
    { id: 2, nombre: 'Plata', puntos_requeridos: 3000, beneficios: '1kg Filamento PLA Premium', orden: 2 },
    { id: 3, nombre: 'Oro', puntos_requeridos: 6000, beneficios: '5kg Filamento + Herramientas', orden: 3 },
    { id: 4, nombre: 'Platino', puntos_requeridos: 10000, beneficios: 'Impresora 3D + Filamentos', orden: 4 }
  ];
}

// Funciones de Estadísticas
export async function obtenerEstadisticasUsuario(usuarioId: number) {
  const sql = `
    SELECT 
      id,
      nombre_completo,
      email,
      puntos,
      nivel,
      codigo_referido,
      creado_en
    FROM usuarios 
    WHERE id = ? AND activo = 1
  `;
  const params = [usuarioId];

  try {
    const rows = await query(sql, params) as any[];
    if (rows.length === 0) return null;

    const usuario = rows[0];
    const niveles = await obtenerNiveles();
    const nivelActual = niveles.find(n => n.nombre === usuario.nivel);
    const siguienteNivel = niveles.find(n => n.orden > (nivelActual?.orden || 0));

    return {
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        puntos: usuario.puntos,
        nivel: usuario.nivel,
        codigo_referido: usuario.codigo_referido,
        creado_en: usuario.creado_en
      },
      nivel_actual: nivelActual || null,
      siguiente_nivel: siguienteNivel || null,
      puntos_para_siguiente: siguienteNivel 
        ? Math.max(0, siguienteNivel.puntos_requeridos - usuario.puntos)
        : 0,
      progreso_actual: nivelActual && siguienteNivel
        ? Math.min(100, ((usuario.puntos - (niveles[nivelActual.orden - 2]?.puntos_requeridos || 0)) / 
           (siguienteNivel.puntos_requeridos - (niveles[nivelActual.orden - 2]?.puntos_requeridos || 0))) * 100)
        : 100
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
}

// Funciones de Tokens de Recuperación
export async function crearTokenRecuperacion(usuarioId: number, token: string): Promise<boolean> {
  const sql = `
    INSERT INTO tokens_recuperacion (id, usuario_id, token, expira_en, usado, creado_en)
    VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), 0, NOW())
  `;
  
  const tokenId = Math.random().toString(36).substring(2, 15);
  const params = [tokenId, usuarioId, token];

  try {
    await query(sql, params);
    console.log(`✅ Token de recuperación creado para usuario ${usuarioId}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando token de recuperación:', error);
    throw error;
  }
}

export async function obtenerTokenRecuperacion(token: string): Promise<any> {
  const sql = `
    SELECT tr.*, u.email 
    FROM tokens_recuperacion tr
    JOIN usuarios u ON tr.usuario_id = u.id
    WHERE tr.token = ? AND tr.usado = 0 AND tr.expira_en > NOW()
  `;
  const params = [token];

  try {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error obteniendo token de recuperación:', error);
    throw error;
  }
}

export async function marcarTokenComoUsado(tokenId: string): Promise<boolean> {
  const sql = 'UPDATE tokens_recuperacion SET usado = 1 WHERE id = ?';
  const params = [tokenId];

  try {
    await query(sql, params);
    return true;
  } catch (error) {
    console.error('❌ Error marcando token como usado:', error);
    throw error;
  }
}

export async function actualizarPasswordUsuario(usuarioId: number, nuevoPassword: string): Promise<boolean> {
  const sql = `
    UPDATE usuarios 
    SET password = ?, actualizado_en = NOW()
    WHERE id = ?
  `;
  
  const params = [nuevoPassword, usuarioId];

  try {
    await query(sql, params);
    console.log(`✅ Contraseña actualizada para usuario ${usuarioId}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    throw error;
  }
}
