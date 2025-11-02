/**
 * 🎁 API Route - Sistema de Canjes
 * 
 * Permite a los usuarios canjear sus puntos por premios del catálogo.
 */

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

/**
 * POST /api/canjes
 * 
 * Canjear puntos por un premio
 */
export async function POST(request: NextRequest) {
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
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    // Verificar sesión y obtener usuario
    const [sesiones] = await connection.execute(
      'SELECT usuario_id FROM sesiones WHERE id = ? AND expira_en > NOW()',
      [sessionId]
    );

    if ((sesiones as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const usuarioId = (sesiones as any[])[0].usuario_id;

    // Obtener datos del canje
    const body = await request.json();
    const { premio_id } = body;

    if (!premio_id) {
      return NextResponse.json(
        { error: 'ID de premio requerido' },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await connection.beginTransaction();

    try {
      // Obtener datos del usuario
      const [usuarios] = await connection.execute(
        'SELECT id, nombre_completo, puntos_acumulados as puntos FROM usuarios WHERE id = ?',
        [usuarioId]
      );

      if ((usuarios as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      const usuario = (usuarios as any[])[0];
      console.log(`👤 Usuario ${usuarioId} - Puntos disponibles: ${usuario.puntos}`);

      // Obtener datos del premio
      const [premios] = await connection.execute(
        'SELECT id, nombre, descripcion, puntos_requeridos, stock, activo FROM premios WHERE id = ?',
        [premio_id]
      );

      if ((premios as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Premio no encontrado' },
          { status: 404 }
        );
      }

      const premio = (premios as any[])[0];

      // Validaciones
      if (!premio.activo) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Este premio no está disponible' },
          { status: 400 }
        );
      }

      if (premio.stock <= 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Premio agotado' },
          { status: 400 }
        );
      }

      // 🎁 Validar que tenga puntos suficientes (aunque NO se descuenten)
      if (usuario.puntos < premio.puntos_requeridos) {
        await connection.rollback();
        return NextResponse.json(
          { 
            error: 'No tienes suficientes puntos para canjear este premio',
            puntos_faltantes: premio.puntos_requeridos - usuario.puntos,
            puntos_actuales: usuario.puntos,
            puntos_requeridos: premio.puntos_requeridos
          },
          { status: 400 }
        );
      }

      // 🚫 VALIDACIÓN: Verificar si el usuario ya canjeó este premio antes
      const [canjesPrevios] = await connection.execute(
        'SELECT id FROM compras WHERE cliente_id = ? AND premio_id = ?',
        [usuarioId, premio_id]
      );

      if ((canjesPrevios as any[]).length > 0) {
        await connection.rollback();
        console.log(`⚠️ Usuario ${usuarioId} intentó canjear premio ${premio_id} nuevamente`);
        return NextResponse.json(
          { 
            error: 'Ya canjeaste este premio anteriormente',
            mensaje: 'No puedes canjear el mismo premio más de una vez'
          },
          { status: 400 }
        );
      }

      // Realizar el canje
      
      // 🎁 NO descontamos puntos, solo registramos el canje
      console.log(`🎁 Registrando canje SIN descontar puntos`);
      console.log(`✅ Validación pasada: Usuario tiene ${usuario.puntos} pts >= ${premio.puntos_requeridos} pts requeridos`);
      console.log(`💎 Usuario mantendrá: ${usuario.puntos} puntos después del canje`);
      console.log(`📝 Premio: ${premio.nombre}`);

      // 1. Reducir stock del premio (solo si existe la columna)
      const [columns]: any = await connection.execute("SHOW COLUMNS FROM premios");
      const hasStock = columns.some((col: any) => col.Field === 'stock');
      
      if (hasStock) {
        await connection.execute(
          'UPDATE premios SET stock = stock - 1 WHERE id = ?',
          [premio_id]
        );
        console.log(`📦 Stock reducido para premio ${premio_id}`);
      }

      // 3. Registrar la compra/canje
      await connection.execute(
        `INSERT INTO compras (
          cliente_id, 
          premio_id, 
          puntos_gastados, 
          estado, 
          notas,
          monto,
          descripcion
        ) VALUES (?, ?, ?, 'pendiente', ?, 0, ?)`,
        [
          usuarioId,
          premio_id,
          premio.puntos_requeridos,
          `Canje realizado el ${new Date().toLocaleString('es-AR')}`,
          `Premio: ${premio.nombre}`
        ]
      );

      // Commit de la transacción
      await connection.commit();

      console.log(`✅ Canje exitoso - Usuario ${usuarioId} canjeó premio ${premio_id} - Puntos SIN descontar: ${usuario.puntos}`);

      return NextResponse.json({
        success: true,
        message: 'Canje realizado exitosamente',
        premio: {
          id: premio.id,
          nombre: premio.nombre
        },
        puntos_gastados: 0, // No se descuentan puntos
        puntos_restantes: usuario.puntos // Puntos se mantienen igual
      });

    } catch (error) {
      // Rollback en caso de error
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Error al procesar canje:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar el canje',
        message: error.message
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
 * GET /api/canjes
 * 
 * Obtener historial de canjes del usuario
 */
export async function GET(request: NextRequest) {
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
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    // Verificar sesión
    const [sesiones] = await connection.execute(
      'SELECT usuario_id FROM sesiones WHERE id = ? AND expira_en > NOW()',
      [sessionId]
    );

    if ((sesiones as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const usuarioId = (sesiones as any[])[0].usuario_id;

    // Verificar estructura de la tabla compras
    const [columns]: any = await connection.execute("SHOW COLUMNS FROM compras");
    const columnNames = columns.map((col: any) => col.Field);
    const hasPremioId = columnNames.includes('premio_id');
    
    console.log('📋 Columnas en compras:', columnNames);
    console.log('🎁 Tiene premio_id:', hasPremioId);

    // Obtener historial de canjes
    let canjes;
    
    if (hasPremioId) {
      // Si existe premio_id, hacer JOIN con premios
      const [result] = await connection.execute(
        `SELECT 
          c.id,
          c.premio_id,
          c.puntos_gastados,
          c.estado,
          c.fecha_compra,
          c.notas,
          c.descripcion,
          p.nombre as premio_nombre,
          p.descripcion as premio_descripcion
        FROM compras c
        LEFT JOIN premios p ON c.premio_id = p.id
        WHERE c.cliente_id = ?
        ORDER BY c.fecha_compra DESC
        LIMIT 50`,
        [usuarioId]
      );
      canjes = result;
    } else {
      // Si no existe premio_id, solo obtener datos de compras
      const [result] = await connection.execute(
        `SELECT 
          id,
          puntos_gastados,
          estado,
          fecha_compra,
          notas,
          descripcion
        FROM compras
        WHERE cliente_id = ?
        ORDER BY fecha_compra DESC
        LIMIT 50`,
        [usuarioId]
      );
      canjes = result;
    }

    return NextResponse.json({
      success: true,
      canjes: canjes,
      total: (canjes as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error al obtener canjes:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener historial',
        message: error.message
      },
      { status: 500 }
    );
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
