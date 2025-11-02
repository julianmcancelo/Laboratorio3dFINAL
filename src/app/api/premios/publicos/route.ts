/**
 * 🎁 API Route - Premios Públicos (para Landing Page)
 * 
 * Endpoint optimizado para mostrar premios en el landing page.
 * Solo devuelve premios activos, ordenados por puntos_requeridos.
 */

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

/**
 * GET /api/premios/publicos
 * 
 * Devuelve todos los premios activos ordenados por puntos
 */
export async function GET() {
  let connection;
  
  try {
    console.log('🎁 [API] Obteniendo premios públicos');
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    console.log('✅ [API] Conexión establecida');

    // Verificar si la tabla existe
    const [tables]: any = await connection.execute(
      "SHOW TABLES LIKE 'premios'"
    );

    if (tables.length === 0) {
      console.log('⚠️ [API] Tabla premios no existe, devolviendo array vacío');
      return NextResponse.json({
        success: true,
        premios: [],
        total: 0
      });
    }

    // Verificar qué columnas existen en la tabla
    const [columns]: any = await connection.execute(
      "SHOW COLUMNS FROM premios"
    );
    
    const columnNames = columns.map((col: any) => col.Field);
    const hasImageBase64 = columnNames.includes('imagen_base64');
    const hasTipoImagen = columnNames.includes('tipo_imagen');
    
    console.log('📋 Columnas disponibles:', columnNames);
    console.log('🖼️ Tiene imagen_base64:', hasImageBase64);
    
    // Construir lista de campos dinámicamente
    const hasStock = columnNames.includes('stock');
    
    const fields = [
      'id',
      'nombre',
      'descripcion',
      'puntos_requeridos'
    ];
    
    if (hasImageBase64) fields.push('imagen_base64');
    if (hasTipoImagen) fields.push('tipo_imagen');
    if (hasStock) fields.push('stock');
    
    fields.push('activo');
    
    console.log('✅ Tiene stock:', hasStock);
    
    const selectFields = fields.join(', ');
    
    console.log('📝 Query SELECT:', selectFields);
    
    // Obtener premios activos ordenados por puntos
    const [premios] = await connection.execute(
      `SELECT ${selectFields}
      FROM premios 
      WHERE activo = 1
      ORDER BY puntos_requeridos ASC`
    );

    console.log(`✅ [API] ${(premios as any[]).length} premios encontrados`);

    return NextResponse.json({
      success: true,
      premios: premios,
      total: (premios as any[]).length
    });

  } catch (error: any) {
    console.error('❌ [API] Error al obtener premios:', error);
    console.error('Error completo:', error);
    
    // Si hay error, devolver array vacío en lugar de error 500
    return NextResponse.json({
      success: true,
      premios: [],
      total: 0,
      warning: 'No se pudieron cargar los premios'
    });
    
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
