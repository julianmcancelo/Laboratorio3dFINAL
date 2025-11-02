import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { 
      usuario_id, 
      monto, 
      descripcion, 
      tipo_producto = 'otros',
      numero_serie = null,
      marca_modelo = null,
      comprobante_base64, 
      tipo_archivo 
    } = body;

    // Validaciones
    if (!usuario_id || !monto || !descripcion || !comprobante_base64) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que si es impresora_3d, el número de serie sea requerido
    if (tipo_producto === 'impresora_3d' && (!numero_serie || numero_serie.trim() === '')) {
      return NextResponse.json(
        { error: 'El número de serie es obligatorio para impresoras 3D' },
        { status: 400 }
      );
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (descripcion.length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede superar los 500 caracteres' },
        { status: 400 }
      );
    }

    // Validar que el base64 no sea demasiado grande (ejemplo: 10MB)
    const base64Size = (comprobante_base64.length * 3) / 4 / (1024 * 1024); // MB
    if (base64Size > 10) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Verificar que el usuario existe
    const [usuarios]: any = await connection.execute(
      'SELECT id FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Insertar comprobante con nuevos campos
    const [result]: any = await connection.execute(
      `INSERT INTO comprobantes 
        (usuario_id, monto, tipo_producto, numero_serie, marca_modelo, descripcion, comprobante_base64, tipo_archivo, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [usuario_id, monto, tipo_producto, numero_serie, marca_modelo, descripcion, comprobante_base64, tipo_archivo]
    );

    return NextResponse.json({
      success: true,
      message: 'Comprobante subido exitosamente',
      comprobante_id: result.insertId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al guardar comprobante:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const estado = searchParams.get('estado');

    connection = await mysql.createConnection(dbConfig);

    let query = `
      SELECT 
        c.*,
        u.nombre_completo as usuario_nombre,
        v.nombre_completo as validador_nombre
      FROM comprobantes c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN usuarios v ON c.validado_por = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (usuario_id) {
      query += ' AND c.usuario_id = ?';
      params.push(usuario_id);
    }

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY c.fecha_carga DESC';

    const [comprobantes]: any = await connection.execute(query, params);

    // No enviar el base64 completo en la lista, solo metadata
    const comprobantesLimpios = comprobantes.map((c: any) => ({
      ...c,
      comprobante_base64: undefined, // Remover el base64 de la lista
      tiene_comprobante: true,
    }));

    return NextResponse.json({
      success: true,
      comprobantes: comprobantesLimpios,
    });

  } catch (error: any) {
    console.error('Error al obtener comprobantes:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
