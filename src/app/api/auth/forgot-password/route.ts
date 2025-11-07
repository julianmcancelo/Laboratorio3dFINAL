import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Helper functions
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateResetLink(token: string, email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const encodedEmail = encodeURIComponent(email);
  return `${baseUrl}/reset-password?token=${token}&email=${encodedEmail}`;
}

async function generateQRCodeDataURL(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    width: 100,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

function prepareEmailTemplate(email: string, nombre?: string, requestInfo?: {
  ip?: string;
  userAgent?: string;
  date?: string;
}) {
  const token = generateResetToken();
  const resetLink = generateResetLink(token, email);
  
  return {
    token,
    resetLink,
    nombre: nombre || email.split('@')[0],
    email,
    requestIp: requestInfo?.ip || '192.168.1.100',
    userAgent: requestInfo?.userAgent || 'Chrome 119.0.0.0',
    requestDate: requestInfo?.date || new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };
}

function replaceTemplateVariables(template: string, variables: {
  nombre: string;
  resetLink: string;
  email: string;
  logoBase64?: string;
  requestIp?: string;
  userAgent?: string;
  requestDate?: string;
}): string {
  let result = template;
  
  result = result.replace(/\{\{nombre\}\}/g, variables.nombre);
  result = result.replace(/\{\{resetLink\}\}/g, variables.resetLink);
  result = result.replace(/\{\{email\}\}/g, variables.email);
  result = result.replace(/\{\{requestIp\}\}/g, variables.requestIp || '192.168.1.100');
  result = result.replace(/\{\{userAgent\}\}/g, variables.userAgent || 'Chrome 119.0.0.0');
  result = result.replace(/\{\{requestDate\}\}/g, variables.requestDate || new Date().toLocaleString('es-AR'));
  
  if (variables.logoBase64) {
    result = result.replace(/\{\{logoBase64\}\}/g, variables.logoBase64);
  }
  
  return result;
}

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

    // Preparar variables del template
    const requestInfo = {
      ip: request.headers.get('x-forwarded-for') || request.ip || '192.168.1.100',
      userAgent: request.headers.get('user-agent') || 'Chrome 119.0.0.0',
      date: new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    const templateVars = prepareEmailTemplate(email, usuario.nombre_completo, requestInfo);

    // Generar token y guardar en BD
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + 1);

    await connection.execute(
      'INSERT INTO password_reset_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)',
      [usuario.id, templateVars.token, expiraEn]
    );

    // Cargar template HTML
    const templatePath = path.join(process.cwd(), 'src/templates/recovery-email-premium-minimal.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Generar QR code
    const qrCodeDataURL = await generateQRCodeDataURL(templateVars.resetLink);
    template = template.replace(
      /<svg width="100" height="100" viewBox="0 0 100 100" fill="none">[\s\S]*?<\/svg>/,
      `<img src="${qrCodeDataURL}" alt="QR Code" width="100" height="100" style="display: block;" />`
    );

    // Reemplazar variables en el template
    const htmlContent = replaceTemplateVariables(template, templateVars);

    // Configurar transporter de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Enviar email con template premium
    const mailOptions = {
      from: `"Laboratorio 3D" <${process.env.GMAIL_USER}>`,
      to: usuario.email,
      subject: '🔐 Recuperación de Contraseña - Laboratorio 3D',
      html: htmlContent,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email premium enviado a:', usuario.email);

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
