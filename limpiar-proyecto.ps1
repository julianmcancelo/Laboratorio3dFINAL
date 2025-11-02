# 🧹 Script de Limpieza para GitHub
# Elimina archivos temporales y documentación redundante

Write-Host "🧹 Iniciando limpieza del proyecto..." -ForegroundColor Cyan
Write-Host ""

$archivosEliminados = 0

# Función para eliminar archivo
function Remove-FileIfExists {
    param($filename)
    if (Test-Path $filename) {
        Remove-Item $filename -Force
        Write-Host "✅ Eliminado: $filename" -ForegroundColor Green
        return 1
    }
    return 0
}

Write-Host "📝 Eliminando documentación redundante..." -ForegroundColor Yellow
$archivosEliminados += Remove-FileIfExists "ACTIVAR-HISTORIAL-COMPRAS.md"
$archivosEliminados += Remove-FileIfExists "APLICANDO-CAMBIOS.md"
$archivosEliminados += Remove-FileIfExists "COMPROBANTES_README.md"
$archivosEliminados += Remove-FileIfExists "CONFIGURACION-TAILWIND.md"
$archivosEliminados += Remove-FileIfExists "CORREGIR-PUNTOS-REFERIDO.sql"
$archivosEliminados += Remove-FileIfExists "CORREGIR-REFERIDOS-AUTOMATICO.sql"
$archivosEliminados += Remove-FileIfExists "CORREGIR-UNA-SOLA-CONSULTA.sql"
$archivosEliminados += Remove-FileIfExists "ERRORES-CORREGIDOS.md"
$archivosEliminados += Remove-FileIfExists "ERRORES-FINALES-CORREGIDOS.md"
$archivosEliminados += Remove-FileIfExists "ESTADO-ACTUAL.md"
$archivosEliminados += Remove-FileIfExists "FLUJO-SISTEMA-REFERIDOS.md"
$archivosEliminados += Remove-FileIfExists "INICIO-RAPIDO.md"
$archivosEliminados += Remove-FileIfExists "LANDING-COMPLETA-ACTUALIZADA.md"
$archivosEliminados += Remove-FileIfExists "LOGIN-ACTUALIZADO-FINAL.md"
$archivosEliminados += Remove-FileIfExists "PAGINAS-AUTH-ACTUALIZADAS.md"
$archivosEliminados += Remove-FileIfExists "REGISTRO-ACTUALIZADO-FINAL.md"
$archivosEliminados += Remove-FileIfExists "RESUMEN-MIGRACION.md"
$archivosEliminados += Remove-FileIfExists "TIPO-PRODUCTO-IMPLEMENTADO.md"
$archivosEliminados += Remove-FileIfExists "setup-db.md"

Write-Host ""
Write-Host "🔧 Eliminando scripts temporales..." -ForegroundColor Yellow
$archivosEliminados += Remove-FileIfExists "fix-authstore.js"
$archivosEliminados += Remove-FileIfExists "fix-prisma-permissions.bat"
$archivosEliminados += Remove-FileIfExists "generate-prisma-absolute.bat"
$archivosEliminados += Remove-FileIfExists "generate-prisma.bat"
$archivosEliminados += Remove-FileIfExists "init.js"
$archivosEliminados += Remove-FileIfExists "start.js"
$archivosEliminados += Remove-FileIfExists "start-dev-server.bat"
$archivosEliminados += Remove-FileIfExists "test-db-connection.js"
$archivosEliminados += Remove-FileIfExists "test-prisma-path.bat"

Write-Host ""
Write-Host "📄 Eliminando documentos Word/PDF..." -ForegroundColor Yellow
$archivosEliminados += Remove-FileIfExists "FINAL INGE 2.docx"
$archivosEliminados += Remove-FileIfExists "Landing Inicial – Ajuste (1).pdf"
$archivosEliminados += Remove-FileIfExists "📑 Programa de Puntos y Referidos – Laboratorio 3D (1).pdf"

Write-Host ""
Write-Host "🔒 Eliminando archivos de entorno..." -ForegroundColor Yellow
$archivosEliminados += Remove-FileIfExists ".env"
$archivosEliminados += Remove-FileIfExists ".env.local"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Limpieza completada exitosamente!" -ForegroundColor Green
Write-Host "📊 Total de archivos eliminados: $archivosEliminados" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Archivos conservados importantes:" -ForegroundColor White
Write-Host "  ✅ README.md" -ForegroundColor Gray
Write-Host "  ✅ DOCUMENTACION-COMPLETA.md" -ForegroundColor Gray
Write-Host "  ✅ PROCESO-DETALLADO.md" -ForegroundColor Gray
Write-Host "  ✅ PRUEBAS-Y-CALIDAD.md" -ForegroundColor Gray
Write-Host "  ✅ .gitignore" -ForegroundColor Gray
Write-Host "  ✅ .env.example" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. git init" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor White
Write-Host "  3. git commit -m 'Initial commit'" -ForegroundColor White
Write-Host "  4. Crear repo en GitHub" -ForegroundColor White
Write-Host "  5. git push -u origin main" -ForegroundColor White
Write-Host ""
