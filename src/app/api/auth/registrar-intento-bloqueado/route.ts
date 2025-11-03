import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { timestamp } = await request.json();
    
    // Obtener IP del usuario
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Obtener user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log(`🚫 Intento de acceso bloqueado desde IP: ${ip}`);
    console.log(`📱 User Agent: ${userAgent}`);
    console.log(`⏰ Timestamp: ${timestamp}`);

    // 💾 Guardar en base de datos
    try {
      // NOTA: Descomentar después de ejecutar AGREGAR-TABLA-IPS.sql
      /*
      await prisma.$executeRaw`
        INSERT INTO intentos_bloqueados (ip, user_agent, tipo, timestamp)
        VALUES (${ip}, ${userAgent}, 'bloqueado', ${new Date(timestamp)})
      `;
      console.log(`✅ Intento bloqueado guardado en BD para IP: ${ip}`);
      */
    } catch (dbError) {
      console.error('⚠️ Error guardando en BD (ejecuta AGREGAR-TABLA-IPS.sql):', dbError);
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Intento registrado',
      ip: ip
    });

  } catch (error) {
    console.error('Error registrando intento bloqueado:', error);
    return NextResponse.json(
      { error: 'Error al registrar intento' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
