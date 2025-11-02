import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { otorgarPuntosReferente } from '@/lib/cupones';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // Obtener todos los comprobantes con información del usuario
    const [comprobantes]: any = await connection.execute(
      `SELECT 
        c.id,
        c.usuario_id,
        u.nombre_completo as usuario_nombre,
        c.monto,
        c.descripcion,
        c.comprobante_base64,
        c.tipo_archivo,
        c.estado,
        c.puntos_otorgados,
        c.fecha_carga,
        c.fecha_validacion
      FROM comprobantes c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY 
        CASE 
          WHEN c.estado = 'pendiente' THEN 1
          WHEN c.estado = 'aprobado' THEN 2
          WHEN c.estado = 'rechazado' THEN 3
        END,
        c.fecha_carga DESC`
    );

    return NextResponse.json({
      success: true,
      comprobantes
    });

  } catch (error: any) {
    console.error('Error al obtener comprobantes:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * PUT /api/admin/comprobantes
 * 
 * Validar (aprobar o rechazar) un comprobante
 */
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);
    
    connection = await mysql.createConnection(dbConfig);

    // Verificar que sea admin
    const [sesiones]: any = await connection.execute(
      `SELECT s.usuario_id, u.rol 
       FROM sesiones s
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ? AND s.expira_en > NOW()`,
      [sessionId]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const { usuario_id: adminId, rol } = sesiones[0];

    // Verificar permisos de admin
    const rolUpper = rol ? rol.toUpperCase() : null;
    if (!rolUpper || (rolUpper !== 'ADMIN' && rolUpper !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    // Obtener datos de la validación
    const body = await request.json();
    const { comprobante_id, accion, observaciones } = body;

    if (!comprobante_id || !accion) {
      return NextResponse.json(
        { error: 'ID de comprobante y acción son requeridos' },
        { status: 400 }
      );
    }

    if (accion !== 'aprobar' && accion !== 'rechazar') {
      return NextResponse.json(
        { error: 'Acción inválida. Use "aprobar" o "rechazar"' },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await connection.beginTransaction();

    try {
      // Obtener datos del comprobante
      const [comprobantes]: any = await connection.execute(
        'SELECT * FROM comprobantes WHERE id = ?',
        [comprobante_id]
      );

      if (comprobantes.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Comprobante no encontrado' },
          { status: 404 }
        );
      }

      const comprobante = comprobantes[0];

      // Verificar que esté pendiente
      if (comprobante.estado !== 'pendiente') {
        await connection.rollback();
        return NextResponse.json(
          { error: `Este comprobante ya fue ${comprobante.estado}` },
          { status: 400 }
        );
      }

      if (accion === 'aprobar') {
        // CÁLCULO SEGÚN DOCUMENTO: 1 punto = $1.000
        const puntosAOtorgar = Math.floor(comprobante.monto / 1000);

        console.log(`💰 Monto: $${comprobante.monto} → ${puntosAOtorgar} puntos`);
        console.log(`👤 Usuario ID: ${comprobante.usuario_id}`);

        // Verificar puntos ANTES de sumar
        const [usuariosAntes]: any = await connection.execute(
          'SELECT puntos_acumulados FROM usuarios WHERE id = ?',
          [comprobante.usuario_id]
        );
        const puntosAntes = usuariosAntes[0]?.puntos_acumulados || 0;
        console.log(`📊 Puntos ANTES: ${puntosAntes}`);

        // Actualizar comprobante
        console.log('📝 Actualizando comprobante...');
        await connection.execute(
          `UPDATE comprobantes 
           SET estado = 'aprobado',
               puntos_otorgados = ?,
               fecha_validacion = NOW(),
               validado_por = ?,
               observaciones = ?
           WHERE id = ?`,
          [puntosAOtorgar, adminId, observaciones || 'Comprobante aprobado', comprobante_id]
        );
        console.log('✅ Comprobante actualizado');

        // Otorgar puntos al usuario
        console.log(`💎 Sumando ${puntosAOtorgar} puntos al usuario ${comprobante.usuario_id}...`);
        const [result]: any = await connection.execute(
          'UPDATE usuarios SET puntos_acumulados = puntos_acumulados + ? WHERE id = ?',
          [puntosAOtorgar, comprobante.usuario_id]
        );
        console.log(`✅ UPDATE ejecutado. Filas afectadas: ${result.affectedRows}`);

        // Verificar puntos DESPUÉS de sumar
        const [usuariosDespues]: any = await connection.execute(
          'SELECT puntos_acumulados FROM usuarios WHERE id = ?',
          [comprobante.usuario_id]
        );

        const puntosNuevos = usuariosDespues[0]?.puntos_acumulados || 0;
        console.log(`📊 Puntos DESPUÉS: ${puntosNuevos}`);
        console.log(`📈 Diferencia: +${puntosNuevos - puntosAntes} puntos`);

        await connection.commit();
        console.log('✅ COMMIT exitoso');

        console.log(`✅ Comprobante ${comprobante_id} aprobado - ${puntosAOtorgar} puntos otorgados`);

        // 🎁 SISTEMA DE REFERIDOS: Otorgar puntos al referente si es primera compra
        try {
          const puntosReferenteOtorgados = await otorgarPuntosReferente(comprobante.usuario_id);
          if (puntosReferenteOtorgados) {
            console.log('🎉 Puntos de referido otorgados exitosamente');
          }
        } catch (errorReferido) {
          console.error('⚠️ Error al otorgar puntos de referido (no crítico):', errorReferido);
          // No fallar la aprobación si hay error en referidos
        }

        return NextResponse.json({
          success: true,
          message: 'Comprobante aprobado exitosamente',
          puntos_otorgados: puntosAOtorgar,
          puntos_totales: puntosNuevos
        });

      } else {
        // Rechazar comprobante
        await connection.execute(
          `UPDATE comprobantes 
           SET estado = 'rechazado',
               fecha_validacion = NOW(),
               validado_por = ?,
               observaciones = ?
           WHERE id = ?`,
          [adminId, observaciones || 'Comprobante rechazado', comprobante_id]
        );

        await connection.commit();

        console.log(`❌ Comprobante ${comprobante_id} rechazado`);

        return NextResponse.json({
          success: true,
          message: 'Comprobante rechazado'
        });
      }

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Error al validar comprobante:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la validación',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
