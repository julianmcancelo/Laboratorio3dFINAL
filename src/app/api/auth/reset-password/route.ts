import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    // Verificar token
    const [tokens]: any = await connection.execute(
      `SELECT prt.*, u.email, u.nombre_completo
       FROM password_reset_tokens prt
       INNER JOIN usuarios u ON prt.usuario_id = u.id
       WHERE prt.token = ? AND prt.usado = FALSE AND prt.expira_en > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const resetToken = tokens[0];

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    await connection.execute(
      'UPDATE usuarios SET password_hash = ?, password = NULL WHERE id = ?',
      [passwordHash, resetToken.usuario_id]
    );

    // Marcar token como usado
    await connection.execute(
      'UPDATE password_reset_tokens SET usado = TRUE WHERE id = ?',
      [resetToken.id]
    );

    console.log('✅ Contraseña restablecida para:', resetToken.email);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error al resetear contraseña:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al resetear contraseña',
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
