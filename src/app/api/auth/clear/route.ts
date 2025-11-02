import { NextRequest, NextResponse } from 'next/server';

// Base de datos simulada inline
interface Usuario {
  id: number;
  nombre_completo: string;
  dni: string;
  email: string;
  password: string;
  telefono?: string;
  instagram?: string;
  puntos: number;
  nivel: string;
  codigo_referido?: string;
  referido_por?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

// Base de datos en memoria - Solo usuarios de prueba
let usuarios: Usuario[] = [
  {
    id: 1,
    nombre_completo: 'Administrador',
    dni: '00000000',
    email: 'admin@lab3d.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'admin123'
    puntos: 50000,
    nivel: 'Platino',
    codigo_referido: 'ADMIN123',
    activo: true,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString()
  },
  {
    id: 2,
    nombre_completo: 'Usuario Test',
    dni: '12345678',
    email: 'test@lab3d.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'test123'
    puntos: 1500,
    nivel: 'Bronce',
    codigo_referido: 'TEST1234',
    activo: true,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString()
  }
];

// POST - Limpiar usuarios no administradores
export async function POST(request: NextRequest) {
  try {
    // Mantener solo usuarios de prueba
    usuarios = usuarios.filter(u => u.email === 'admin@lab3d.com' || u.email === 'test@lab3d.com');

    return NextResponse.json({
      success: true,
      message: 'Base de datos limpiada. Solo usuarios de prueba conservados.',
      usuarios: usuarios.map(u => ({
        id: u.id,
        nombre_completo: u.nombre_completo,
        email: u.email,
        nivel: u.nivel,
        puntos: u.puntos
      }))
    });

  } catch (error) {
    console.error('Error limpiando base de datos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Ver usuarios actuales
export async function GET() {
  try {
    return NextResponse.json({
      usuarios: usuarios.map(u => ({
        id: u.id,
        nombre_completo: u.nombre_completo,
        email: u.email,
        nivel: u.nivel,
        puntos: u.puntos,
        creado_en: u.creado_en
      }))
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
