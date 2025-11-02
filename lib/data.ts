// Base de datos simulada para desarrollo
// Funciona sin dependencias externas

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

interface Sesion {
  id: string;
  usuario_id: number;
  expira_en: string;
  creada_en: string;
}

// Base de datos en memoria
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

let sesiones: Sesion[] = [];
let nextUserId = 3;

// Funciones de usuarios
export async function crearUsuario(datos: {
  nombre_completo: string;
  dni: string;
  email: string;
  password: string;
  telefono?: string;
  instagram?: string;
  codigo_referido?: string;
  referido_por?: string;
}) {
  const nuevoUsuario: Usuario = {
    id: nextUserId++,
    nombre_completo: datos.nombre_completo,
    dni: datos.dni,
    email: datos.email,
    password: datos.password,
    telefono: datos.telefono,
    instagram: datos.instagram,
    codigo_referido: datos.codigo_referido || `USER${nextUserId}AB`,
    referido_por: datos.referido_por,
    puntos: 1500,
    nivel: 'Bronce',
    activo: true,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString()
  };
  
  usuarios.push(nuevoUsuario);
  return nuevoUsuario.id;
}

export async function obtenerUsuarioPorEmail(email: string) {
  return usuarios.find(u => u.email === email && u.activo) || null;
}

export async function obtenerUsuarioPorId(id: number) {
  return usuarios.find(u => u.id === id && u.activo) || null;
}

export async function actualizarPuntosUsuario(usuarioId: number, puntos: number) {
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario) return 'Bronce';
  
  usuario.puntos = puntos;
  usuario.actualizado_en = new Date().toISOString();
  
  // Actualizar nivel según puntos
  let nuevoNivel = 'Bronce';
  if (puntos >= 10000) nuevoNivel = 'Platino';
  else if (puntos >= 6000) nuevoNivel = 'Oro';
  else if (puntos >= 3000) nuevoNivel = 'Plata';
  
  usuario.nivel = nuevoNivel;
  return nuevoNivel;
}

// Funciones de sesiones
export async function crearSesion(datos: {
  id: string;
  usuario_id: number;
  expira_en: Date;
}) {
  const nuevaSesion: Sesion = {
    id: datos.id,
    usuario_id: datos.usuario_id,
    expira_en: datos.expira_en.toISOString(),
    creada_en: new Date().toISOString()
  };
  
  sesiones.push(nuevaSesion);
  return true;
}

export async function obtenerSesion(sesionId: string) {
  const sesion = sesiones.find(s => s.id === sesionId);
  if (!sesion) return null;
  
  // Verificar si no ha expirado
  if (new Date(sesion.expira_en) < new Date()) {
    sesiones = sesiones.filter(s => s.id !== sesionId);
    return null;
  }
  
  return sesion;
}

export async function eliminarSesion(sesionId: string) {
  sesiones = sesiones.filter(s => s.id !== sesionId);
  return true;
}

// Funciones de niveles
export async function obtenerNiveles() {
  return [
    { id: 1, nombre: 'Bronce', puntos_requeridos: 1500, beneficios: 'Descuento 5% en filamentos', orden: 1 },
    { id: 2, nombre: 'Plata', puntos_requeridos: 3000, beneficios: '1kg Filamento PLA Premium', orden: 2 },
    { id: 3, nombre: 'Oro', puntos_requeridos: 6000, beneficios: '5kg Filamento + Herramientas', orden: 3 },
    { id: 4, nombre: 'Platino', puntos_requeridos: 10000, beneficios: 'Impresora 3D + Filamentos', orden: 4 }
  ];
}

// Funciones de estadísticas
export async function obtenerEstadisticasUsuario(usuarioId: number) {
  const usuario = await obtenerUsuarioPorId(usuarioId);
  if (!usuario) return null;
  
  const niveles = await obtenerNiveles();
  const nivelActual = niveles.find(n => n.nombre === usuario.nivel);
  const siguienteNivel = niveles.find(n => n.puntos_requeridos > usuario.puntos);
  const puntosParaSiguienteNivel = siguienteNivel 
    ? siguienteNivel.puntos_requeridos - usuario.puntos 
    : 0;
  
  return {
    usuario,
    estadisticas: {
      totalCompras: 0,
      totalGastado: 0,
      totalPuntosGanados: usuario.puntos - 1500, // Puntos iniciales
      totalPuntosCanjeados: 0,
      totalCanjes: 0
    },
    progreso: {
      nivelActual: nivelActual || null,
      siguienteNivel: siguienteNivel || null,
      puntosParaSiguienteNivel,
      progresoPorcentaje: siguienteNivel 
        ? ((usuario.puntos - (nivelActual?.puntos_requeridos || 0)) / 
           (siguienteNivel.puntos_requeridos - (nivelActual?.puntos_requeridos || 0))) * 100
        : 100
    }
  };
}

// Inicialización (simulada)
export async function initializeDatabase() {
  console.log('Base de datos simulada inicializada correctamente');
  return Promise.resolve();
}
