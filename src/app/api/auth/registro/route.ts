/**
 * ⚠️ ARCHIVO DEPRECADO - USAR /api/auth/register EN SU LUGAR
 * 
 * Este endpoint redirige al endpoint correcto de registro.
 * La funcionalidad de registro ahora está en /api/auth/register
 */

import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/auth/registro
 * Este endpoint está deprecado. Use /api/auth/register en su lugar.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Este endpoint está deprecado',
      message: 'Use /api/auth/register para registro de usuarios',
      redirect_to: '/api/auth/register'
    },
    { status: 410 } // 410 Gone - El recurso ya no está disponible
  );
}

/**
 * GET /api/auth/registro
 * Información sobre el endpoint deprecado
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      deprecated: true,
      message: 'Este endpoint está deprecado',
      use_instead: '/api/auth/register',
      documentation: 'Use POST /api/auth/register para crear nuevos usuarios'
    },
    { status: 200 }
  );
}
