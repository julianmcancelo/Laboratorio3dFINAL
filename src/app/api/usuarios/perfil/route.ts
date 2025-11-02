/**
 * 👤 API Route - Gestión de Perfil de Usuario
 * 
 * Este endpoint maneja las operaciones de lectura y actualización
 * del perfil del usuario autenticado.
 * 
 * Endpoints: 
 * - GET /api/usuarios/perfil - Obtener perfil del usuario
 * - PUT /api/usuarios/perfil - Actualizar perfil del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { verificarAutenticacionRequest } from '@/lib/auth';
import { ejecutarConsultaUnica, ejecutarActualizacion, ejecutarTransaccion } from '@/lib/db';
import { ActualizarPerfilSchema, ActualizarPerfilInput } from '@/types/usuario';
import { validarBodyRequest } from '@/lib/validaciones';
import bcrypt from 'bcryptjs';

/**
 * 👤 Maneja la solicitud GET para obtener el perfil del usuario
 * 
 * @param request - Request de Next.js
 * @returns Response con datos del perfil del usuario
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('👤 Obteniendo perfil de usuario');

    // 1. Verificar autenticación
    const payload = await verificarAutenticacionRequest(request);
    const usuarioId = parseInt(payload.sub, 10);

    // 2. Obtener datos completos del usuario
    const usuario = await ejecutarConsultaUnica(
      `SELECT 
        u.id,
        u.nombre_completo,
        u.email,
        u.dni,
        u.telefono,
        u.instagram,
        u.rol,
        u.estado,
        u.puntos_acumulados,
        u.codigo_referido,
        u.referido_por_id,
        u.nivel_lealtad_id,
        u.apto_para_canje,
        u.fecha_creacion,
        u.fecha_ultimo_acceso,
        u.total_compras,
        u.monto_total_compras,
        nl.nombre as nivel_lealtad_nombre,
        nl.color as nivel_lealtad_color,
        nl.puntos_minimos as nivel_lealtad_puntos_minimos,
        (SELECT COUNT(*) FROM usuarios WHERE referido_por_id = u.id) as referidos_count,
        (SELECT COUNT(*) FROM compras WHERE cliente_id = u.id AND verificado = 1) as compras_verificadas_count
      FROM usuarios u
      LEFT JOIN niveles_lealtad nl ON u.nivel_lealtad_id = nl.id
      WHERE u.id = ? AND u.activo = 1`,
      [usuarioId]
    );

    if (!usuario) {
      console.log('❌ Usuario no encontrado:', usuarioId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado',
          codigo: 'USUARIO_NO_ENCONTRADO'
        },
        { status: 404 }
      );
    }

    // 3. Preparar respuesta sin datos sensibles
    const perfilResponse = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      dni: usuario.dni,
      telefono: usuario.telefono,
      instagram: usuario.instagram,
      rol: usuario.rol,
      estado: usuario.estado,
      puntos_acumulados: usuario.puntos_acumulados || 0,
      codigo_referido: usuario.codigo_referido,
      nivel_lealtad: {
        id: usuario.nivel_lealtad_id,
        nombre: usuario.nivel_lealtad_nombre || 'Bronce',
        color: usuario.nivel_lealtad_color || '#CD7F32',
        puntos_minimos: usuario.nivel_lealtad_puntos_minimos || 0,
      },
      apto_para_canje: usuario.apto_para_canje || false,
      estadisticas: {
        total_compras: usuario.total_compras || 0,
        monto_total_compras: usuario.monto_total_compras || 0,
        compras_verificadas: usuario.compras_verificadas_count || 0,
        referidos_count: usuario.referidos_count || 0,
      },
      fechas: {
        fecha_creacion: usuario.fecha_creacion,
        fecha_ultimo_acceso: usuario.fecha_ultimo_acceso,
      },
    };

    console.log('✅ Perfil obtenido exitosamente para usuario:', usuarioId);
    return NextResponse.json(
      {
        success: true,
        usuario: perfilResponse,
        mensaje: 'Perfil obtenido exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error al obtener perfil de usuario:', error);
    
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
 * ✏️ Maneja la solicitud PUT para actualizar el perfil del usuario
 * 
 * @param request - Request de Next.js con datos de actualización
 * @returns Response con resultado de la actualización
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('✏️ Actualizando perfil de usuario');

    // 1. Verificar autenticación
    const payload = await verificarAutenticacionRequest(request);
    const usuarioId = parseInt(payload.sub, 10);

    // 2. Validar y extraer datos del body
    const body = await validarBodyRequest(request, ActualizarPerfilSchema) as ActualizarPerfilInput;
    const { nombre_completo, telefono, instagram } = body;

    // 3. Verificar si hay cambios reales
    const usuarioActual = await ejecutarConsultaUnica(
      'SELECT nombre_completo, telefono, instagram FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuarioActual) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado',
          codigo: 'USUARIO_NO_ENCONTRADO'
        },
        { status: 404 }
      );
    }

    // 4. Verificar si hay cambios para evitar actualizaciones innecesarias
    const hayCambios = 
      (nombre_completo && nombre_completo !== usuarioActual.nombre_completo) ||
      (telefono !== undefined && telefono !== usuarioActual.telefono) ||
      (instagram !== undefined && instagram !== usuarioActual.instagram);

    if (!hayCambios) {
      return NextResponse.json(
        {
          success: true,
          mensaje: 'No hay cambios para actualizar',
          cambios_realizados: false
        },
        { status: 200 }
      );
    }

    // 5. Actualizar el perfil en la base de datos
    console.log('💾 Actualizando perfil en la base de datos');
    
    const filasActualizadas = await ejecutarTransaccion(async (conexion) => {
      // Construir consulta dinámica según los campos a actualizar
      const camposActualizacion: string[] = [];
      const valoresActualizacion: any[] = [];

      if (nombre_completo && nombre_completo !== usuarioActual.nombre_completo) {
        camposActualizacion.push('nombre_completo = ?');
        valoresActualizacion.push(nombre_completo.trim());
      }

      if (telefono !== undefined) {
        camposActualizacion.push('telefono = ?');
        valoresActualizacion.push(telefono || null);
      }

      if (instagram !== undefined) {
        camposActualizacion.push('instagram = ?');
        valoresActualizacion.push(instagram || null);
      }

      // Agregar fecha de actualización
      camposActualizacion.push('fecha_actualizacion = NOW()');
      valoresActualizacion.push(usuarioId);

      const sql = `UPDATE usuarios SET ${camposActualizacion.join(', ')} WHERE id = ?`;
      const [resultado] = await conexion.execute(sql, valoresActualizacion);

      // Registrar en auditoría
      await conexion.execute(
        `INSERT INTO auditoria (
          usuario_id,
          tipo_operacion,
          recurso_afectado,
          recurso_id,
          descripcion,
          ip_address,
          user_agent,
          fecha_operacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          usuarioId,
          'actualizar',
          'usuario_perfil',
          usuarioId,
          `Actualización de perfil: ${camposActualizacion.join(', ')}`,
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
        ]
      );

      return (resultado as any).affectedRows;
    });

    if (filasActualizadas === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo actualizar el perfil',
          codigo: 'ERROR_ACTUALIZACION'
        },
        { status: 400 }
      );
    }

    // 6. Obtener datos actualizados para la respuesta
    const usuarioActualizado = await ejecutarConsultaUnica(
      `SELECT 
        id,
        nombre_completo,
        email,
        dni,
        telefono,
        instagram,
        rol,
        puntos_acumulados,
        codigo_referido,
        fecha_actualizacion
      FROM usuarios WHERE id = ?`,
      [usuarioId]
    );

    console.log('✅ Perfil actualizado exitosamente para usuario:', usuarioId);
    return NextResponse.json(
      {
        success: true,
        mensaje: 'Perfil actualizado exitosamente',
        usuario: usuarioActualizado,
        cambios_realizados: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error al actualizar perfil de usuario:', error);
    
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
