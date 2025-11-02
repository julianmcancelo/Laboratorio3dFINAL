import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Ruta a la base de datos
const dbPath = path.join(process.cwd(), 'data', 'laboratorio3d.db');

// Conexión a la base de datos
export async function getDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Inicializar base de datos
export async function initializeDatabase() {
  const db = await getDB();
  
  // Crear tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_completo TEXT NOT NULL,
      dni TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      telefono TEXT,
      instagram TEXT,
      puntos INTEGER DEFAULT 1500,
      nivel TEXT DEFAULT 'Bronce',
      codigo_referido TEXT UNIQUE,
      referido_por TEXT,
      activo BOOLEAN DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de compras
  await db.exec(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      monto REAL NOT NULL,
      puntos_ganados INTEGER NOT NULL,
      comprobante_url TEXT,
      estado TEXT DEFAULT 'pendiente',
      verificado_en DATETIME,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);

  // Crear tabla de canjes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS canjes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      premio TEXT NOT NULL,
      puntos_costo INTEGER NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      entregado_en DATETIME,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);

  // Crear tabla de niveles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS niveles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      puntos_requeridos INTEGER NOT NULL,
      beneficios TEXT NOT NULL,
      orden INTEGER NOT NULL
    )
  `);

  // Insertar niveles si no existen
  await db.exec(`
    INSERT OR IGNORE INTO niveles (nombre, puntos_requeridos, beneficios, orden) VALUES
    ('Bronce', 1500, 'Descuento 5% en filamentos', 1),
    ('Plata', 3000, '1kg Filamento PLA Premium', 2),
    ('Oro', 6000, '5kg Filamento + Herramientas', 3),
    ('Platino', 10000, 'Impresora 3D + Filamentos', 4)
  `);

  // Crear tabla de sesiones
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sesiones (
      id TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL,
      expira_en DATETIME NOT NULL,
      creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);

  console.log('Base de datos inicializada correctamente');
  return db;
}

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
  const db = await getDB();
  
  const result = await db.run(
    `INSERT INTO usuarios (nombre_completo, dni, email, password, telefono, instagram, codigo_referido, referido_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.nombre_completo,
      datos.dni,
      datos.email,
      datos.password,
      datos.telefono || null,
      datos.instagram || null,
      datos.codigo_referido || null,
      datos.referido_por || null
    ]
  );
  
  return result.lastID;
}

export async function obtenerUsuarioPorEmail(email: string) {
  const db = await getDB();
  return await db.get(
    'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
    [email]
  );
}

export async function obtenerUsuarioPorId(id: number) {
  const db = await getDB();
  return await db.get(
    'SELECT * FROM usuarios WHERE id = ? AND activo = 1',
    [id]
  );
}

export async function actualizarPuntosUsuario(usuarioId: number, puntos: number) {
  const db = await getDB();
  
  // Actualizar puntos
  await db.run(
    'UPDATE usuarios SET puntos = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
    [puntos, usuarioId]
  );
  
  // Actualizar nivel según puntos
  const niveles = await db.all('SELECT * FROM niveles ORDER BY puntos_requeridos DESC');
  let nuevoNivel = 'Bronce';
  
  for (const nivel of niveles) {
    if (puntos >= nivel.puntos_requeridos) {
      nuevoNivel = nivel.nombre;
      break;
    }
  }
  
  await db.run(
    'UPDATE usuarios SET nivel = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
    [nuevoNivel, usuarioId]
  );
  
  return nuevoNivel;
}

// Funciones de compras
export async function registrarCompra(datos: {
  usuario_id: number;
  monto: number;
  comprobante_url?: string;
}) {
  const db = await getDB();
  
  const puntosGanados = Math.floor(datos.monto); // 1 punto por cada peso
  
  const result = await db.run(
    `INSERT INTO compras (usuario_id, monto, puntos_ganados, comprobante_url)
     VALUES (?, ?, ?, ?)`,
    [datos.usuario_id, datos.monto, puntosGanados, datos.comprobante_url || null]
  );
  
  return result.lastID;
}

export async function verificarCompra(compraId: number) {
  const db = await getDB();
  
  // Obtener compra
  const compra = await db.get('SELECT * FROM compras WHERE id = ?', [compraId]);
  if (!compra) throw new Error('Compra no encontrada');
  
  // Actualizar estado
  await db.run(
    'UPDATE compras SET estado = "verificado", verificado_en = CURRENT_TIMESTAMP WHERE id = ?',
    [compraId]
  );
  
  // Sumar puntos al usuario
  const usuario = await obtenerUsuarioPorId(compra.usuario_id);
  if (usuario) {
    const nuevosPuntos = usuario.puntos + compra.puntos_ganados;
    await actualizarPuntosUsuario(compra.usuario_id, nuevosPuntos);
  }
  
  return true;
}

export async function obtenerComprasUsuario(usuarioId: number) {
  const db = await getDB();
  return await db.all(
    'SELECT * FROM compras WHERE usuario_id = ? ORDER BY creado_en DESC',
    [usuarioId]
  );
}

// Funciones de canjes
export async function registrarCanje(datos: {
  usuario_id: number;
  premio: string;
  puntos_costo: number;
}) {
  const db = await getDB();
  
  // Verificar que el usuario tiene suficientes puntos
  const usuario = await obtenerUsuarioPorId(datos.usuario_id);
  if (!usuario || usuario.puntos < datos.puntos_costo) {
    throw new Error('Puntos insuficientes');
  }
  
  // Registrar canje
  const result = await db.run(
    `INSERT INTO canjes (usuario_id, premio, puntos_costo)
     VALUES (?, ?, ?)`,
    [datos.usuario_id, datos.premio, datos.puntos_costo]
  );
  
  // Restar puntos
  const nuevosPuntos = usuario.puntos - datos.puntos_costo;
  await actualizarPuntosUsuario(datos.usuario_id, nuevosPuntos);
  
  return result.lastID;
}

export async function obtenerCanjesUsuario(usuarioId: number) {
  const db = await getDB();
  return await db.all(
    'SELECT * FROM canjes WHERE usuario_id = ? ORDER BY creado_en DESC',
    [usuarioId]
  );
}

// Funciones de sesiones
export async function crearSesion(datos: {
  id: string;
  usuario_id: number;
  expira_en: Date;
}) {
  const db = await getDB();
  
  await db.run(
    `INSERT INTO sesiones (id, usuario_id, expira_en)
     VALUES (?, ?, ?)`,
    [datos.id, datos.usuario_id, datos.expira_en.toISOString()]
  );
  
  return true;
}

export async function obtenerSesion(sesionId: string) {
  const db = await getDB();
  return await db.get(
    'SELECT * FROM sesiones WHERE id = ? AND expira_en > CURRENT_TIMESTAMP',
    [sesionId]
  );
}

export async function eliminarSesion(sesionId: string) {
  const db = await getDB();
  await db.run('DELETE FROM sesiones WHERE id = ?', [sesionId]);
  return true;
}

// Funciones de niveles
export async function obtenerNiveles() {
  const db = await getDB();
  return await db.all('SELECT * FROM niveles ORDER BY orden ASC');
}

// Funciones de estadísticas
export async function obtenerEstadisticasUsuario(usuarioId: number) {
  const db = await getDB();
  
  const usuario = await obtenerUsuarioPorId(usuarioId);
  if (!usuario) return null;
  
  const compras = await obtenerComprasUsuario(usuarioId);
  const canjes = await obtenerCanjesUsuario(usuarioId);
  const niveles = await obtenerNiveles();
  
  const comprasVerificadas = compras.filter(c => c.estado === 'verificado');
  const totalGastado = comprasVerificadas.reduce((sum, c) => sum + c.monto, 0);
  const totalPuntosGanados = comprasVerificadas.reduce((sum, c) => sum + c.puntos_ganados, 0);
  const totalPuntosCanjeados = canjes.reduce((sum, c) => sum + c.puntos_costo, 0);
  
  const nivelActual = niveles.find(n => n.nombre === usuario.nivel);
  const siguienteNivel = niveles.find(n => n.puntos_requeridos > usuario.puntos);
  const puntosParaSiguienteNivel = siguienteNivel 
    ? siguienteNivel.puntos_requeridos - usuario.puntos 
    : 0;
  
  return {
    usuario,
    estadisticas: {
      totalCompras: comprasVerificadas.length,
      totalGastado,
      totalPuntosGanados,
      totalPuntosCanjeados,
      totalCanjes: canjes.length
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
