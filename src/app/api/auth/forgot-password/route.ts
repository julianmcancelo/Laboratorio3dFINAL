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

async function getLogoBase64(usuarioId: number): Promise<string> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Conectar a BD para obtener el nivel del usuario
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '167.250.5.55',
      user: process.env.DB_USER || 'jcancelo_3d',
      password: process.env.DB_PASSWORD || 'feelthesky1',
      database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
    });

    // Obtener el nivel del usuario
    const [usuarios]: any = await connection.execute(
      'SELECT nivel_lealtad_id FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    await connection.end();

    if (usuarios.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const nivelId = usuarios[0].nivel_lealtad_id || 1; // Default bronce

    // Mapear nivel a archivo de imagen
    const nivelImagenes: { [key: number]: string } = {
      1: 'bronce.png',
      2: 'plata.png', 
      3: 'oro.png',
      4: 'esmeralda.png',
      5: 'diamante.png',
      6: 'fundador.png'
    };

    const imagenNivel = nivelImagenes[nivelId] || 'bronce.png';
    const logoPath = path.join(process.cwd(), `public/niveles/${imagenNivel}`);
    
    const imageBytes = fs.readFileSync(logoPath);
    const base64 = Buffer.from(imageBytes).toString('base64');
    return `data:image/png;base64,${base64}`;
    
  } catch (error) {
    console.error('Error al obtener logo de nivel:', error);
    // Logo fallback - bronce por defecto
    try {
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.join(process.cwd(), 'public/niveles/bronce.png');
      const imageBytes = fs.readFileSync(logoPath);
      const base64 = Buffer.from(imageBytes).toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }
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
    // Verificar variables críticas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Variables de Gmail no configuradas');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuración de email no disponible. Contacte al administrador.',
          debug: process.env.NODE_ENV === 'development' ? 'GMAIL_USER o GMAIL_APP_PASSWORD faltantes' : undefined
        },
        { status: 500 }
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL no configurada');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de configuración de base de datos',
          debug: process.env.NODE_ENV === 'development' ? 'DATABASE_URL faltante' : undefined
        },
        { status: 500 }
      );
    }

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
      'SELECT id, nombre_completo, email FROM usuarios WHERE email = ?',
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

    // Generar logo en base64 según el nivel del usuario
    const logoBase64 = await getLogoBase64(usuario.id);

    // Generar QR code en base64
    const qrCodeDataURL = await generateQRCodeDataURL(templateVars.resetLink);

    // Reemplazar QR placeholder con QR real en base64
    template = template.replace(
      /<svg width="100" height="100" viewBox="0 0 100 100" fill="none">[\s\S]*?<\/svg>/,
      `<img src="${qrCodeDataURL}" alt="QR Code" width="100" height="100" style="display: block;" />`
    );

    // Reemplazar variables en el template (incluyendo logo base64)
    const htmlContent = replaceTemplateVariables(template, {
      ...templateVars,
      logoBase64
    });

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
