/**
 * 🎁 API Route - Gestión de Canjes (Admin)
 * Endpoint para que el administrador vea y valide canjes
 */

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laboratorio3d',
  port: parseInt(process.env.DB_PORT || '3306')
};

/**
 * 📋 GET - Obtener todos los canjes (Admin)
 */
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    // Obtener session_id del header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No se proporcionó token de sesión' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);

    // Crear conexión
    connection = await mysql.createConnection(dbConfig);

    // Verificar sesión del administrador
    const [sesiones]: any = await connection.execute(
      'SELECT * FROM sesiones WHERE id = ? AND expira_en > NOW()',
      [sessionId]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const adminId = sesiones[0].usuario_id;

    // Verificar que es administrador
    const [admins]: any = await connection.execute(
      'SELECT rol FROM usuarios WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0 || !['ADMIN', 'SUPERADMIN'].includes(admins[0].rol?.toUpperCase())) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    // Obtener filtros de la URL
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado') || 'todos'; // todos, pendiente, aprobado, rechazado
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir query con filtros
    let whereClause = '';
    let queryParams: any[] = [];

    if (estado !== 'todos') {
      whereClause = 'WHERE c.estado = ?';
      queryParams.push(estado);
    }

    // Obtener canjes con información del usuario y premio
    const [canjes]: any = await connection.execute(
      `SELECT 
        c.id,
        c.cliente_id as usuario_id,
        c.premio_id,
        c.puntos_gastados,
        c.estado,
        c.fecha_compra,
        c.notas,
        c.descripcion,
        u.nombre_completo as usuario_nombre,
        u.email as usuario_email,
        u.instagram as usuario_instagram,
        p.nombre as premio_nombre,
        p.descripcion as premio_descripcion,
        p.puntos_requeridos
      FROM compras c
      LEFT JOIN usuarios u ON c.cliente_id = u.id
      LEFT JOIN premios p ON c.premio_id = p.id
      ${whereClause}
      ORDER BY c.fecha_compra DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Obtener total de canjes
    const [total]: any = await connection.execute(
      `SELECT COUNT(*) as total FROM compras c ${whereClause}`,
      queryParams
    );

    console.log(`📋 Admin consultó ${canjes.length} canjes (estado: ${estado})`);

    return NextResponse.json({
      success: true,
      canjes: canjes,
      total: total[0].total,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('❌ Error al obtener canjes (admin):', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * ✅ PATCH - Validar/actualizar estado de canje (Admin)
 */
export async function PATCH(request: NextRequest) {
  let connection;
  
  try {
    // Obtener session_id del header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No se proporcionó token de sesión' },
        { status: 401 }
      );
    }

    const sessionId = authHeader.substring(7);
    const body = await request.json();
    const { canje_id, estado, notas_admin } = body;

    // Validar datos requeridos
    if (!canje_id || !estado) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: canje_id, estado' },
        { status: 400 }
      );
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'entregado'];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear conexión
    connection = await mysql.createConnection(dbConfig);

    // Verificar sesión del administrador
    const [sesiones]: any = await connection.execute(
      'SELECT * FROM sesiones WHERE id = ? AND expira_en > NOW()',
      [sessionId]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const adminId = sesiones[0].usuario_id;

    // Verificar que es administrador
    const [admins]: any = await connection.execute(
      'SELECT nombre_completo, rol FROM usuarios WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0 || !['ADMIN', 'SUPERADMIN'].includes(admins[0].rol?.toUpperCase())) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    const adminNombre = admins[0].nombre_completo;

    // Obtener información del canje
    const [canjes]: any = await connection.execute(
      `SELECT c.*, u.nombre_completo as usuario_nombre, p.nombre as premio_nombre
       FROM compras c
       LEFT JOIN usuarios u ON c.cliente_id = u.id
       LEFT JOIN premios p ON c.premio_id = p.id
       WHERE c.id = ?`,
      [canje_id]
    );

    if (canjes.length === 0) {
      return NextResponse.json(
        { error: 'Canje no encontrado' },
        { status: 404 }
      );
    }

    const canje = canjes[0];

    // Actualizar estado del canje
    const notaCompleta = notas_admin 
      ? `${canje.notas || ''}\n\n[${new Date().toLocaleString('es-AR')}] Admin ${adminNombre}: ${notas_admin}`
      : canje.notas;

    await connection.execute(
      'UPDATE compras SET estado = ?, notas = ? WHERE id = ?',
      [estado, notaCompleta, canje_id]
    );

    console.log(`✅ Admin ${adminNombre} cambió estado de canje #${canje_id} a: ${estado}`);

    return NextResponse.json({
      success: true,
      message: `Canje actualizado a estado: ${estado}`,
      canje: {
        id: canje_id,
        estado: estado,
        usuario: canje.usuario_nombre,
        premio: canje.premio_nombre
      }
    });

  } catch (error: any) {
    console.error('❌ Error al validar canje:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
