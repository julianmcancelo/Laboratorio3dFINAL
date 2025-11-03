import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jcancelo_laboratorio3d',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    // Soportar tanto 'estado' como 'accion' para compatibilidad
    const { comprobante_id, estado: estadoParam, accion, puntos_otorgados } = body;
    
    // Convertir accion a estado si es necesario
    let estado = estadoParam;
    if (!estado && accion) {
      estado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
    }

    console.log('🎯 REQUEST DE VALIDACIÓN:', { comprobante_id, estado, accion, puntos_otorgados });

    // Validaciones
    if (!comprobante_id || !estado) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Obtener información del comprobante incluyendo datos de referido
    const [comprobantes]: any = await connection.execute(
      'SELECT usuario_id, monto, estado, codigo_referido, referido_por_id FROM comprobantes WHERE id = ?',
      [comprobante_id]
    );

    if (comprobantes.length === 0) {
      return NextResponse.json(
        { error: 'Comprobante no encontrado' },
        { status: 404 }
      );
    }

    const comprobante = comprobantes[0];

    // 🔍 DEBUG - Ver datos del comprobante
    console.log('📋 Comprobante a validar:', {
      id: comprobante_id,
      usuario_id: comprobante.usuario_id,
      monto: comprobante.monto,
      referido_por_id: comprobante.referido_por_id,
      tiene_referido: !!comprobante.referido_por_id,
      cumple_monto: comprobante.monto >= 500000
    });

    if (comprobante.estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'El comprobante ya fue procesado' },
        { status: 400 }
      );
    }

    // Usar los puntos que vienen del frontend (editados por el admin)
    const puntosAOtorgar = estado === 'aprobado' ? (puntos_otorgados || 0) : 0;

    // Actualizar estado del comprobante
    await connection.execute(
      `UPDATE comprobantes 
       SET estado = ?, 
           puntos_otorgados = ?,
           fecha_validacion = NOW()
       WHERE id = ?`,
      [estado, puntosAOtorgar, comprobante_id]
    );

    // Si fue aprobado, otorgar puntos al usuario
    if (estado === 'aprobado' && puntosAOtorgar > 0) {
      await connection.execute(
        'UPDATE usuarios SET puntos_acumulados = puntos_acumulados + ? WHERE id = ?',
        [puntosAOtorgar, comprobante.usuario_id]
      );

      // 🎁 SISTEMA DE REFERIDOS SIMPLIFICADO - Aplicar bonificaciones
      // Si el comprobante fue marcado como "mi recomendación" y la compra es >= $500k
      console.log('🔍 Verificando si aplica bonus de referido:', {
        tiene_referido: !!comprobante.referido_por_id,
        referido_por_id: comprobante.referido_por_id,
        monto: comprobante.monto,
        cumple_monto: comprobante.monto >= 500000
      });
      
      if (comprobante.referido_por_id && comprobante.monto >= 500000) {
        // Solo bonus de $50,000 para el que refirió (50 puntos)
        // Ya que el comprador NO tiene cuenta y el usuario está cargando el comprobante de su amigo
        const bonusReferidor = 50; // 50 puntos = $50,000
        
        console.log('💰 APLICANDO BONUS DE REFERIDO - 50 PUNTOS');
        
        await connection.execute(
          'UPDATE usuarios SET puntos_acumulados = puntos_acumulados + ? WHERE id = ?',
          [bonusReferidor, comprobante.referido_por_id]
        );

        console.log(`✅ ✅ ✅ BONUS DE 50 PUNTOS APLICADO EXITOSAMENTE ✅ ✅ ✅
          Usuario ID ${comprobante.referido_por_id} recibió +50 pts por referido
          Compra: $${comprobante.monto.toLocaleString()}`
        );
      } else {
        console.log('❌ NO se aplicó bonus de referido - No cumple condiciones');
      }
    }

    return NextResponse.json({
      success: true,
      message: `Comprobante ${estado} exitosamente`,
      puntos_otorgados: puntosAOtorgar,
      bono_referido: (estado === 'aprobado' && comprobante.referido_por_id && comprobante.monto >= 500000) ? {
        referidor: 50
      } : null
    });

  } catch (error: any) {
    console.error('Error al validar comprobante:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
