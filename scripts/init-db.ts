#!/usr/bin/env node

import { initializeDatabase } from '../lib/database';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

async function setupDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Crear directorio data si no existe
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Directorio data creado');
    }
    
    // Inicializar base de datos
    const db = await initializeDatabase();
    
    // Crear usuario administrador si no existe
    const adminEmail = 'admin@lab3d.com';
    const adminExists = await db.get('SELECT id FROM usuarios WHERE email = ?', [adminEmail]);
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        `INSERT INTO usuarios (nombre_completo, dni, email, password, puntos, nivel, codigo_referido)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Administrador', '00000000', adminEmail, adminPassword, 50000, 'Platino', 'ADMIN123']
      );
      console.log('👤 Usuario administrador creado');
    }
    
    // Crear usuario de prueba si no existe
    const testEmail = 'test@lab3d.com';
    const testExists = await db.get('SELECT id FROM usuarios WHERE email = ?', [testEmail]);
    
    if (!testExists) {
      const testPassword = await bcrypt.hash('test123', 10);
      await db.run(
        `INSERT INTO usuarios (nombre_completo, dni, email, password, puntos, nivel, codigo_referido)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Usuario Test', '12345678', testEmail, testPassword, 1500, 'Bronce', 'TEST1234']
      );
      console.log('🧪 Usuario de prueba creado');
    }
    
    // Verificar tablas
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    console.log('\n📊 Tablas creadas:');
    tables.forEach((table: any) => {
      console.log(`  ✅ ${table.name}`);
    });
    
    // Mostrar usuarios creados
    const usuarios = await db.all('SELECT email, nivel, puntos FROM usuarios');
    console.log('\n👥 Usuarios en la base de datos:');
    usuarios.forEach((user: any) => {
      console.log(`  📧 ${user.email} | Nivel: ${user.nivel} | Puntos: ${user.puntos}`);
    });
    
    console.log('\n✅ Base de datos configurada exitosamente!');
    console.log('\n🔑 Credenciales de prueba:');
    console.log('  Admin: admin@lab3d.com / admin123');
    console.log('  Test:  test@lab3d.com / test123');
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
