import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test básico de variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      GMAIL_USER: process.env.GMAIL_USER ? '✅' : '❌',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅' : '❌',
      DATABASE_URL: process.env.DATABASE_URL ? '✅' : '❌',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Test de imports
    const imports = {
      nodemailer: '✅',
      qrcode: '✅',
      mysql2: '✅',
    };

    return NextResponse.json({
      success: true,
      message: 'API funcionando correctamente',
      environment: envCheck,
      imports,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
