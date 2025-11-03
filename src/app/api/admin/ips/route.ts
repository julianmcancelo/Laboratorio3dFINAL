import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/ips
 * Obtener estadísticas de IPs registradas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'todos'; // todos, sospechosos, bloqueados

    // Verificar que es admin
    const sessionId = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!sessionId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // NOTA: Descomentar después de ejecutar AGREGAR-TABLA-IPS.sql
    /*
    // Consultar vista de usuarios por IP (detecta IPs sospechosas)
    const usuariosPorIP = await prisma.$queryRaw`
      SELECT * FROM usuarios_por_ip 
      ORDER BY total_usuarios DESC 
      LIMIT 50
    `;

    // Últimos intentos bloqueados
    const intentosBloqueados = await prisma.$queryRaw`
      SELECT 
        ip,
        COUNT(*) as total_intentos,
        MAX(timestamp) as ultimo_intento,
        user_agent
      FROM intentos_bloqueados
      WHERE tipo = 'bloqueado'
      GROUP BY ip, user_agent
      ORDER BY MAX(timestamp) DESC
      LIMIT 50
    `;

    // Estadísticas generales
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT ip_registro) as ips_unicas,
        COUNT(*) as total_usuarios,
        COUNT(DISTINCT CASE WHEN ultima_conexion > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN ip_registro END) as ips_activas_7d
      FROM usuarios
      WHERE ip_registro IS NOT NULL
    `;

    return NextResponse.json({
      success: true,
      usuarios_por_ip: usuariosPorIP,
      intentos_bloqueados: intentosBloqueados,
      estadisticas: stats[0]
    });
    */

    // Respuesta temporal hasta ejecutar migración
    return NextResponse.json({
      success: false,
      mensaje: 'Ejecuta AGREGAR-TABLA-IPS.sql primero',
      instrucciones: 'Abre el archivo AGREGAR-TABLA-IPS.sql y ejecútalo en MySQL'
    });

  } catch (error) {
    console.error('Error obteniendo IPs:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de IPs' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
