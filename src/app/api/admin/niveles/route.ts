import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener todos los niveles
export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows]: any = await connection.execute(
      'SELECT * FROM niveles_lealtad ORDER BY orden ASC'
    );

    const niveles = rows.map((nivel: any) => ({
      id: nivel.id,
      nombre_nivel: nivel.nombre_nivel,
      puntos_minimos_requeridos: nivel.puntos_minimos_requeridos,
      multiplicador_puntos: parseFloat(nivel.multiplicador_puntos),
      descripcion: nivel.descripcion || '',
      orden: nivel.orden,
      icono_nivel: nivel.icono_nivel || '🏅',
      activo: Boolean(nivel.activo)
    }));

    return NextResponse.json({ niveles });

  } catch (error: any) {
    console.error('Error al obtener niveles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST - Crear nuevo nivel
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { nombre_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion, orden, icono_nivel } = body;

    if (!nombre_nivel || puntos_minimos_requeridos < 0 || multiplicador_puntos < 1) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [result]: any = await connection.execute(
      `INSERT INTO niveles_lealtad 
       (nombre_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion, orden, icono_nivel, activo) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [nombre_nivel, puntos_minimos_requeridos, multiplicador_puntos, descripcion || '', orden || 0, icono_nivel || '🏅']
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Nivel creado correctamente'
    });

  } catch (error: any) {
    console.error('Error al crear nivel:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un nivel con ese nombre' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
