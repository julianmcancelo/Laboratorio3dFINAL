/**
 * 🎟️ Utilidades para sistema de referidos
 * 
 * NOTA IMPORTANTE:
 * Los cupones de $25.000 se gestionan manualmente desde TIENDA NUBE
 * Este archivo solo maneja la lógica de puntos para referentes
 */

import { ejecutarConsulta, ejecutarInsercion, ejecutarConsultaUnica } from '@/lib/db';
import type { RowDataPacket } from '@/lib/db';

interface Cupon extends RowDataPacket {
  id: number;
  codigo: string;
  usuario_id: number;
  tipo: string;
  monto_descuento: number;
  descripcion: string | null;
  usado: boolean;
  fecha_uso: string | null;
  compra_id: number | null;
  valido_desde: string;
  valido_hasta: string;
  activo: boolean;
}

/**
 * ⚠️ FUNCIÓN NO USADA - Los cupones se crean en TIENDA NUBE
 * 
 * Esta función queda para referencia o uso futuro interno
 * El flujo actual es:
 * 1. Usuario se registra con código
 * 2. Admin ve /admin/referidos-pendientes
 * 3. Admin crea cupón en Tienda Nube
 * 4. Admin marca como entregado
 */
export async function crearCuponReferido(usuarioId: number): Promise<string> {
  try {
    // Generar código único para el cupón
    const codigoCupon = `BIENVENIDA${Date.now().toString().slice(-6)}`;
    
    // El cupón es válido por 90 días
    const validoHasta = new Date();
    validoHasta.setDate(validoHasta.getDate() + 90);
    
    await ejecutarInsercion(
      `INSERT INTO cupones (
        codigo,
        usuario_id,
        tipo,
        monto_descuento,
        descripcion,
        usado,
        valido_hasta,
        activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoCupon,
        usuarioId,
        'referido',
        25000, // $25.000 de descuento
        '¡Bienvenido! Cupón de descuento por registro con código de referido',
        false,
        validoHasta.toISOString().slice(0, 19).replace('T', ' '),
        true
      ]
    );
    
    console.log(`✅ Cupón creado: ${codigoCupon} para usuario ${usuarioId}`);
    return codigoCupon;
    
  } catch (error) {
    console.error('❌ Error al crear cupón de referido:', error);
    throw new Error('No se pudo crear el cupón de bienvenida');
  }
}

/**
 * 🎯 Otorgar puntos al referente cuando el referido hace su primera compra
 */
export async function otorgarPuntosReferente(referidoId: number): Promise<boolean> {
  try {
    console.log(`🔍 Verificando referidos para usuario ID: ${referidoId}`);
    
    // 1. Obtener datos del referido
    const referido = await ejecutarConsultaUnica<RowDataPacket>(
      'SELECT referido_por_id FROM usuarios WHERE id = ?',
      [referidoId]
    );
    
    if (!referido || !referido.referido_por_id) {
      console.log('ℹ️ Usuario no tiene referente');
      return false;
    }
    
    const referenteId = referido.referido_por_id;
    console.log(`✅ Referente encontrado: ID ${referenteId}`);
    
    // 2. Verificar si es la primera compra APROBADA del referido
    const comprobantesAprobados = await ejecutarConsulta<RowDataPacket>(
      'SELECT COUNT(*) as total FROM comprobantes WHERE usuario_id = ? AND estado = ?',
      [referidoId, 'aprobado']
    );
    
    const totalAprobados = comprobantesAprobados[0].total;
    console.log(`📊 Total de comprobantes aprobados: ${totalAprobados}`);
    
    const esPrimeraCompra = totalAprobados === 1; // Debe ser exactamente 1 (la que acaban de aprobar)
    
    if (!esPrimeraCompra) {
      console.log(`ℹ️ No es la primera compra del referido (tiene ${totalAprobados} comprobantes aprobados)`);
      return false;
    }
    
    console.log('✅ Es la primera compra aprobada del referido');
    
    // 3. Verificar configuración del sistema de referidos
    const config = await ejecutarConsultaUnica<RowDataPacket>(
      'SELECT puntos_fijos_primera_compra, sistema_comision_activo FROM configuracion_referidos WHERE id = 1'
    );
    
    if (!config) {
      console.log('⚠️ No existe configuración de referidos');
      return false;
    }
    
    if (!config.sistema_comision_activo) {
      console.log('ℹ️ Sistema de comisiones desactivado');
      return false;
    }
    
    const puntosAOtorgar = config.puntos_fijos_primera_compra || 50;
    console.log(`💰 Puntos a otorgar al referente: ${puntosAOtorgar}`);
    
    // 4. Otorgar puntos al referente
    await ejecutarConsulta(
      'UPDATE usuarios SET puntos_acumulados = puntos_acumulados + ? WHERE id = ?',
      [puntosAOtorgar, referenteId]
    );
    
    // 5. Registrar en historial de puntos
    await ejecutarInsercion(
      `INSERT INTO historial_puntos (
        usuario_id,
        tipo_transaccion,
        puntos_movimiento,
        descripcion_detalle,
        referido_que_genero_id,
        fecha_transaccion
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        referenteId,
        'GANANCIA_REFERIDO',
        puntosAOtorgar,
        `Bonificación por primera compra de referido`,
        referidoId
      ]
    );
    
    console.log(`✅ ${puntosAOtorgar} puntos otorgados al referente ${referenteId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error al otorgar puntos al referente:', error);
    return false;
  }
}

/**
 * 📋 Obtener cupones de un usuario
 */
export async function obtenerCuponesUsuario(usuarioId: number): Promise<Cupon[]> {
  try {
    const cupones = await ejecutarConsulta<Cupon>(
      `SELECT * FROM cupones 
       WHERE usuario_id = ? 
         AND activo = TRUE 
         AND usado = FALSE 
         AND valido_hasta > NOW()
       ORDER BY created_at DESC`,
      [usuarioId]
    );
    
    return cupones;
  } catch (error) {
    console.error('❌ Error al obtener cupones del usuario:', error);
    return [];
  }
}

/**
 * 🎟️ Validar y usar cupón
 */
export async function usarCupon(codigoCupon: string, usuarioId: number, compraId: number): Promise<number> {
  try {
    // 1. Validar el cupón
    const cupon = await ejecutarConsultaUnica<Cupon>(
      `SELECT * FROM cupones 
       WHERE codigo = ? 
         AND usuario_id = ? 
         AND activo = TRUE 
         AND usado = FALSE 
         AND valido_hasta > NOW()`,
      [codigoCupon, usuarioId]
    );
    
    if (!cupon) {
      throw new Error('Cupón inválido o ya usado');
    }
    
    // 2. Marcar como usado
    await ejecutarConsulta(
      `UPDATE cupones 
       SET usado = TRUE, 
           fecha_uso = NOW(), 
           compra_id = ? 
       WHERE id = ?`,
      [compraId, cupon.id]
    );
    
    console.log(`✅ Cupón ${codigoCupon} usado correctamente`);
    return cupon.monto_descuento;
    
  } catch (error) {
    console.error('❌ Error al usar cupón:', error);
    throw error;
  }
}
