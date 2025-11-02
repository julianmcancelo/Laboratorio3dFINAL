/**
 * 🎁 API Admin - Gestión de Premios
 * 
 * CRUD completo para premios
 */

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

/**
 * POST /api/admin/premios
 * Crear nuevo premio
 */
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    connection = await mysql.createConnection(dbConfig);

    // Verificar que sea admin
    const [sesiones]: any = await connection.execute(
      `SELECT s.usuario_id, u.rol, u.email, u.nombre_completo
       FROM sesiones s
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ? AND s.expira_en > NOW()`,
      [sessionId]
    );

    console.log('🔐 [POST] Sesiones encontradas:', sesiones.length);
    if (sesiones.length > 0) {
      console.log('👤 [POST] Usuario:', sesiones[0]);
    }

    if (sesiones.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Sesión inválida' 
      }, { status: 401 });
    }

    const { rol } = sesiones[0];
    console.log('🔍 [POST] Verificando rol:', `"${rol}"`, 'tipo:', typeof rol);
    
    const rolUpper = rol ? rol.toUpperCase() : null;
    console.log('🔍 [POST] Rol en mayúsculas:', `"${rolUpper}"`);
    
    if (!rolUpper || (rolUpper !== 'ADMIN' && rolUpper !== 'SUPERADMIN')) {
      console.log('❌ [POST] Acceso denegado. Rol actual:', rol);
      return NextResponse.json({ 
        success: false,
        error: `No tienes permisos de admin (tu rol: ${rol})` 
      }, { status: 403 });
    }

    console.log('✅ [POST] Acceso autorizado como', rol);

    // Obtener datos del body
    const body = await request.json();
    const { nombre, descripcion, puntos_requeridos, stock, imagen_base64, tipo_imagen, activo } = body;

    console.log('📦 Datos recibidos:', { nombre, descripcion, puntos_requeridos, stock, tiene_imagen: !!imagen_base64, activo });

    // Validaciones
    if (!nombre || !descripcion || !puntos_requeridos || stock === undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nombre, descripción, puntos y stock son requeridos' 
        },
        { status: 400 }
      );
    }

    // Verificar qué columnas existen
    const [columns]: any = await connection.execute("SHOW COLUMNS FROM premios");
    const columnNames = columns.map((col: any) => col.Field);
    const hasImageBase64 = columnNames.includes('imagen_base64');
    const hasTipoImagen = columnNames.includes('tipo_imagen');
    
    console.log('🔍 Columnas disponibles:', columnNames);
    console.log('🖼️ Soporta imágenes:', hasImageBase64, hasTipoImagen);

    // Construir INSERT dinámicamente solo con columnas que existen
    const insertFields = ['nombre', 'descripcion', 'puntos_requeridos'];
    const insertValues = [nombre, descripcion, puntos_requeridos];
    
    // Agregar stock solo si la columna existe
    const hasStock = columnNames.includes('stock');
    if (hasStock && stock !== undefined) {
      insertFields.push('stock');
      insertValues.push(stock);
    }
    
    if (hasImageBase64 && imagen_base64) {
      insertFields.push('imagen_base64');
      insertValues.push(imagen_base64);
    }
    
    if (hasTipoImagen && tipo_imagen) {
      insertFields.push('tipo_imagen');
      insertValues.push(tipo_imagen);
    }
    
    insertFields.push('activo');
    insertValues.push(activo ? 1 : 0);
    
    console.log('✅ Tiene columna stock:', hasStock);
    
    const insertQuery = `INSERT INTO premios (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`;
    
    console.log('📝 Query INSERT:', insertQuery);
    console.log('📊 Valores:', insertValues);

    // Insertar premio
    const [result]: any = await connection.execute(insertQuery, insertValues);

    console.log(`✅ Premio creado: ID ${result.insertId}`);

    return NextResponse.json({
      success: true,
      message: 'Premio creado exitosamente',
      premio_id: result.insertId
    });

  } catch (error: any) {
    console.error('❌ Error al crear premio:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear premio', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error al cerrar conexión:', e);
      }
    }
  }
}

/**
 * PUT /api/admin/premios
 * Actualizar premio existente
 */
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    connection = await mysql.createConnection(dbConfig);

    // Verificar que sea admin
    const [sesiones]: any = await connection.execute(
      `SELECT s.usuario_id, u.rol, u.email
       FROM sesiones s
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ? AND s.expira_en > NOW()`,
      [sessionId]
    );

    console.log('🔐 [PUT] Verificando permisos...');

    if (sesiones.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Sesión inválida' 
      }, { status: 401 });
    }

    const { rol } = sesiones[0];
    console.log('🔍 [PUT] Rol:', `"${rol}"`);
    
    const rolUpper = rol ? rol.toUpperCase() : null;
    
    if (!rolUpper || (rolUpper !== 'ADMIN' && rolUpper !== 'SUPERADMIN')) {
      console.log('❌ [PUT] Acceso denegado');
      return NextResponse.json({ 
        success: false,
        error: `No tienes permisos (rol: ${rol})` 
      }, { status: 403 });
    }

    console.log('✅ [PUT] Acceso autorizado');

    // Obtener datos del body
    const body = await request.json();
    const { id, nombre, descripcion, puntos_requeridos, stock, imagen_base64, tipo_imagen, activo } = body;

    console.log('📦 Datos para actualizar:', { id, nombre, puntos_requeridos, stock, tiene_imagen: !!imagen_base64, activo });

    // Validaciones
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID del premio es requerido' 
      }, { status: 400 });
    }

    // Verificar que el premio existe
    const [premios]: any = await connection.execute(
      'SELECT id FROM premios WHERE id = ?',
      [id]
    );

    if (premios.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Premio no encontrado' 
      }, { status: 404 });
    }

    // Verificar qué columnas existen
    const [columns]: any = await connection.execute("SHOW COLUMNS FROM premios");
    const columnNames = columns.map((col: any) => col.Field);
    const hasImageBase64 = columnNames.includes('imagen_base64');
    const hasTipoImagen = columnNames.includes('tipo_imagen');
    const hasStock = columnNames.includes('stock');

    // Construir UPDATE dinámicamente
    const updateFields = [
      'nombre = ?',
      'descripcion = ?',
      'puntos_requeridos = ?'
    ];
    const updateValues = [nombre, descripcion, puntos_requeridos];
    
    if (hasStock && stock !== undefined) {
      updateFields.push('stock = ?');
      updateValues.push(stock);
    }
    
    if (hasImageBase64) {
      updateFields.push('imagen_base64 = ?');
      updateValues.push(imagen_base64 || null);
    }
    
    if (hasTipoImagen) {
      updateFields.push('tipo_imagen = ?');
      updateValues.push(tipo_imagen || null);
    }
    
    updateFields.push('activo = ?');
    updateValues.push(activo ? 1 : 0);
    
    updateValues.push(id); // Para el WHERE
    
    const updateQuery = `UPDATE premios SET ${updateFields.join(', ')} WHERE id = ?`;
    
    console.log('📝 Query UPDATE:', updateQuery);

    // Actualizar premio
    await connection.execute(updateQuery, updateValues);

    console.log(`✅ Premio actualizado: ID ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Premio actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error al actualizar premio:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar premio', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error al cerrar conexión:', e);
      }
    }
  }
}

/**
 * PATCH /api/admin/premios
 * Toggle estado activo del premio
 */
export async function PATCH(request: NextRequest) {
  let connection;
  
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
      return NextResponse.json({ 
        success: false,
        error: 'Sesión inválida' 
      }, { status: 401 });
    }

    const { rol } = sesiones[0];
    const rolUpper = rol ? rol.toUpperCase() : null;
    
    if (!rolUpper || (rolUpper !== 'ADMIN' && rolUpper !== 'SUPERADMIN')) {
      return NextResponse.json({ 
        success: false,
        error: 'No tienes permisos' 
      }, { status: 403 });
    }

    // Obtener datos del body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID del premio es requerido' 
      }, { status: 400 });
    }

    // Obtener estado actual
    const [premios]: any = await connection.execute(
      'SELECT activo FROM premios WHERE id = ?',
      [id]
    );

    if (premios.length === 0) {
      return NextResponse.json({ error: 'Premio no encontrado' }, { status: 404 });
    }

    const nuevoEstado = !premios[0].activo;

    // Toggle estado
    await connection.execute(
      'UPDATE premios SET activo = ? WHERE id = ?',
      [nuevoEstado ? 1 : 0, id]
    );

    console.log(`✅ Premio ${id} ${nuevoEstado ? 'activado' : 'desactivado'}`);

    return NextResponse.json({
      success: true,
      message: `Premio ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      activo: nuevoEstado
    });

  } catch (error: any) {
    console.error('❌ Error al cambiar estado:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al cambiar estado', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error al cerrar conexión:', e);
      }
    }
  }
}
