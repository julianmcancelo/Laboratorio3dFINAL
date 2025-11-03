import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
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

    // Verificar si el usuario existe
    const [usuarios]: any = await connection.execute(
      'SELECT id, nombre_completo, email FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (usuarios.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      });
    }

    const usuario = usuarios[0];

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + 1); // Token válido por 1 hora

    // Guardar token en la base de datos
    await connection.execute(
      'INSERT INTO password_reset_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)',
      [usuario.id, token, expiraEn]
    );

    // Crear enlace de recuperación
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Configurar transporter de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Plantilla del email
    const mailOptions = {
      from: `"Laboratorio 3D" <${process.env.GMAIL_USER}>`,
      to: usuario.email,
      subject: '🔐 Recuperación de Contraseña - Laboratorio 3D',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              background: #f8f8f8;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${usuario.nombre_completo}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Laboratorio 3D.</p>
              
              <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este enlace expira en <strong>1 hora</strong></li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                  <li>Tu contraseña actual seguirá funcionando</li>
                </ul>
              </div>
              
              <p>Si tienes alguna pregunta, contáctanos.</p>
              
              <p>Saludos,<br><strong>Equipo de Laboratorio 3D</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Laboratorio 3D. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Enviar email
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de recuperación enviado a:', usuario.email);
    } catch (emailError: any) {
      console.error('❌ Error al enviar email:', emailError);
      // En desarrollo, mostrar el enlace si falla el email
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Enlace de recuperación (desarrollo):', resetLink);
        return NextResponse.json({
          success: true,
          message: 'Email no enviado (desarrollo)',
          resetLink,
        });
      }
      throw new Error('Error al enviar email');
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación'
    });

  } catch (error: any) {
    console.error('❌ Error al procesar recuperación de contraseña:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar solicitud',
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
