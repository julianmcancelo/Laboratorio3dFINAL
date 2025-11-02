import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener configuración actual
export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows]: any = await connection.execute(
      'SELECT * FROM configuracion_referidos WHERE id = 1'
    );

    // Si no existe, crear configuración por defecto
    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO configuracion_referidos (id, porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo) VALUES (1, 10.00, 100, TRUE)'
      );
      
      const [newRows]: any = await connection.execute(
        'SELECT * FROM configuracion_referidos WHERE id = 1'
      );
      
      return NextResponse.json({
        configuracion: {
          porcentaje_comision_referido: parseFloat(newRows[0].porcentaje_comision_referido),
          puntos_fijos_primera_compra: newRows[0].puntos_fijos_primera_compra,
          sistema_comision_activo: Boolean(newRows[0].sistema_comision_activo)
        }
      });
    }

    return NextResponse.json({
      configuracion: {
        porcentaje_comision_referido: parseFloat(rows[0].porcentaje_comision_referido),
        puntos_fijos_primera_compra: rows[0].puntos_fijos_primera_compra,
        sistema_comision_activo: Boolean(rows[0].sistema_comision_activo)
      }
    });

  } catch (error: any) {
    console.error('Error al obtener configuración de referidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo } = body;

    // Validaciones
    if (porcentaje_comision_referido < 0 || porcentaje_comision_referido > 100) {
      return NextResponse.json(
        { error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    if (puntos_fijos_primera_compra < 0) {
      return NextResponse.json(
        { error: 'Los puntos fijos deben ser mayor o igual a 0' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `UPDATE configuracion_referidos 
       SET porcentaje_comision_referido = ?, 
           puntos_fijos_primera_compra = ?, 
           sistema_comision_activo = ?
       WHERE id = 1`,
      [porcentaje_comision_referido, puntos_fijos_primera_compra, sistema_comision_activo ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    });

  } catch (error: any) {
    console.error('Error al actualizar configuración de referidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
