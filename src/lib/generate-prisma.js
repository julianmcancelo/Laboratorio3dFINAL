/**
 * 🔧 Script para generar cliente Prisma
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔧 Generando cliente Prisma...');
  
  // Cambiar al directorio del proyecto
  const projectDir = path.join(__dirname, '../..');
  process.chdir(projectDir);
  
  // Generar cliente Prisma
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Cliente Prisma generado exitosamente');
  
} catch (error) {
  console.error('❌ Error generando cliente Prisma:', error.message);
  process.exit(1);
}
