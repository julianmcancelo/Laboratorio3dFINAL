# ============================================================================
# Script PowerShell para Regenerar la Base de Datos
# Laboratorio 3D
# ============================================================================

Write-Host "🔄 Iniciando regeneración de base de datos..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo SQL
$sqlFile = "$PSScriptRoot\REGENERAR-BASE-DATOS-COMPLETA.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: No se encuentra el archivo SQL" -ForegroundColor Red
    exit 1
}

# Configuración de la base de datos
$dbHost = "167.250.5.55"
$dbUser = "jcancelo_3d"
$dbPass = "feelthesky1"
$dbName = "jcancelo_laboratorio3d"

Write-Host "📊 Configuración:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost"
Write-Host "   Base de datos: $dbName"
Write-Host "   Usuario: $dbUser"
Write-Host ""

# Preguntar confirmación
Write-Host "⚠️  ADVERTENCIA: Este proceso eliminará TODOS los datos existentes" -ForegroundColor Red
$confirmacion = Read-Host "¿Estás seguro de continuar? (escribe 'SI' para confirmar)"

if ($confirmacion -ne "SI") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔍 Buscando cliente MySQL..." -ForegroundColor Cyan

# Intentar encontrar mysql.exe
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.30\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "✅ MySQL encontrado en: $path" -ForegroundColor Green
        break
    }
}

if ($null -eq $mysqlExe) {
    # Intentar con comando mysql directamente
    try {
        $null = Get-Command mysql -ErrorAction Stop
        $mysqlExe = "mysql"
        Write-Host "✅ MySQL encontrado en PATH del sistema" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se encontró MySQL instalado" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 OPCIONES ALTERNATIVAS:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1️⃣  Instalar MySQL Client:"
        Write-Host "   https://dev.mysql.com/downloads/mysql/"
        Write-Host ""
        Write-Host "2️⃣  Usar phpMyAdmin o cliente web de tu hosting"
        Write-Host "   - Accede a tu panel de control"
        Write-Host "   - Abre phpMyAdmin"
        Write-Host "   - Selecciona la base de datos: $dbName"
        Write-Host "   - Ve a la pestaña 'SQL'"
        Write-Host "   - Copia y pega el contenido de:"
        Write-Host "     $sqlFile"
        Write-Host ""
        Write-Host "3️⃣  Usar MySQL Workbench:"
        Write-Host "   https://dev.mysql.com/downloads/workbench/"
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando script de regeneración..." -ForegroundColor Cyan
Write-Host ""

try {
    # Ejecutar el script SQL
    Get-Content $sqlFile | & $mysqlExe -h $dbHost -u $dbUser -p$dbPass $dbName 2>&1 | ForEach-Object {
        Write-Host $_ -ForegroundColor Gray
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Base de datos regenerada exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Datos iniciales creados:" -ForegroundColor Cyan
        Write-Host "   ✓ Niveles de lealtad (Bronce, Plata, Oro)"
        Write-Host "   ✓ Métodos de pago"
        Write-Host "   ✓ Premios predeterminados"
        Write-Host "   ✓ Configuración de referidos"
        Write-Host "   ✓ Usuario administrador"
        Write-Host ""
        Write-Host "🔐 Credenciales de administrador:" -ForegroundColor Yellow
        Write-Host "   Email: admin@laboratorio3d.com"
        Write-Host "   Contraseña: admin123"
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar el script" -ForegroundColor Red
        Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
