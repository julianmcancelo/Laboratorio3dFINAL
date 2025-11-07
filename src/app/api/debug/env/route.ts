import { NextResponse } from 'next/server';

export async function GET() {
  // Solo disponible en development o con un token secreto
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      error: 'Debug endpoint no disponible en producción'
    }, { status: 403 });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GMAIL_USER: process.env.GMAIL_USER ? '✅ Configurado' : '❌ No configurado',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅ Configurado' : '❌ No configurado',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurado' : '❌ No configurado',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ No configurado',
  };

  return NextResponse.json({
    message: 'Estado de variables de entorno',
    environment: envVars,
    timestamp: new Date().toISOString()
  });
}
