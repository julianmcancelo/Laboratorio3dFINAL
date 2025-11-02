# 🚀 Script Automatizado de Deploy a Vercel
# Verifica errores comunes antes de hacer push

Write-Host "🔍 Verificando proyecto antes de deploy..." -ForegroundColor Cyan
Write-Host ""

$errores = 0

# ============================================================================
# 1. Verificar que estamos en el directorio correcto
# ============================================================================

if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No se encuentra package.json" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde: c:\Users\Jota\Downloads\lab3d.jcancelo.dev\Migracion" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto" -ForegroundColor Green

# ============================================================================
# 2. Verificar importación de Prisma (NO debe importar Rol)
# ============================================================================

Write-Host "🔍 Verificando src/lib/prisma-client.ts..." -ForegroundColor Yellow

$prismaContent = Get-Content "src/lib/prisma-client.ts" -Raw

if ($prismaContent -match "import.*Rol.*from.*@prisma/client") {
    Write-Host "❌ ERROR: prisma-client.ts importa 'Rol' (no debe hacerlo)" -ForegroundColor Red
    Write-Host "   Línea incorrecta encontrada" -ForegroundColor Yellow
    $errores++
} else {
    Write-Host "✅ prisma-client.ts NO importa Rol (correcto)" -ForegroundColor Green
}

# ============================================================================
# 3. Verificar ESLint config simplificado
# ============================================================================

Write-Host "🔍 Verificando .eslintrc.json..." -ForegroundColor Yellow

$eslintContent = Get-Content ".eslintrc.json" -Raw

if ($eslintContent -match "@typescript-eslint/recommended") {
    Write-Host "⚠️  ADVERTENCIA: ESLint aún tiene @typescript-eslint/recommended" -ForegroundColor Yellow
    Write-Host "   Debería usar solo 'next/core-web-vitals'" -ForegroundColor Yellow
    $errores++
} else {
    Write-Host "✅ ESLint config simplificado (correcto)" -ForegroundColor Green
}

# ============================================================================
# 4. Verificar que .env no esté en el repo
# ============================================================================

Write-Host "🔍 Verificando .gitignore..." -ForegroundColor Yellow

$gitignoreContent = Get-Content ".gitignore" -Raw

if ($gitignoreContent -match "^\.env$" -or $gitignoreContent -match "`n\.env`n") {
    Write-Host "✅ .env está en .gitignore (correcto)" -ForegroundColor Green
} else {
    Write-Host "⚠️  ADVERTENCIA: .env podría no estar en .gitignore" -ForegroundColor Yellow
}

# ============================================================================
# 5. Verificar que .env.example exista
# ============================================================================

if (Test-Path ".env.example") {
    Write-Host "✅ .env.example existe" -ForegroundColor Green
} else {
    Write-Host "⚠️  ADVERTENCIA: .env.example no existe" -ForegroundColor Yellow
}

# ============================================================================
# Resumen de Verificación
# ============================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($errores -eq 0) {
    Write-Host "✅ TODAS LAS VERIFICACIONES PASARON" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Preguntar si desea hacer commit y push
    $respuesta = Read-Host "¿Deseas hacer commit y push ahora? (S/N)"
    
    if ($respuesta -eq "S" -or $respuesta -eq "s") {
        Write-Host ""
        Write-Host "🚀 Iniciando deploy..." -ForegroundColor Cyan
        
        # Git add
        Write-Host "📝 Agregando archivos..." -ForegroundColor Yellow
        git add .
        
        # Git status
        Write-Host ""
        Write-Host "📋 Archivos a commitear:" -ForegroundColor Yellow
        git status --short
        
        # Confirmar
        Write-Host ""
        $confirmar = Read-Host "¿Confirmar commit? (S/N)"
        
        if ($confirmar -eq "S" -or $confirmar -eq "s") {
            # Commit
            $mensaje = Read-Host "Mensaje de commit (Enter para usar default)"
            
            if ([string]::IsNullOrWhiteSpace($mensaje)) {
                $mensaje = "fix: Vercel build errors - ESLint config y Prisma imports"
            }
            
            Write-Host ""
            Write-Host "💾 Commiteando..." -ForegroundColor Yellow
            git commit -m $mensaje
            
            # Push
            Write-Host ""
            Write-Host "⬆️  Pusheando a GitHub..." -ForegroundColor Yellow
            git push origin main
            
            Write-Host ""
            Write-Host "✅ DEPLOY INICIADO" -ForegroundColor Green
            Write-Host "📊 Verifica el progreso en: https://vercel.com/dashboard" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Deploy cancelado" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  Deploy cancelado. Puedes ejecutarlo manualmente:" -ForegroundColor Yellow
        Write-Host "   git add ." -ForegroundColor White
        Write-Host "   git commit -m 'fix: Vercel errors'" -ForegroundColor White
        Write-Host "   git push origin main" -ForegroundColor White
    }
    
} else {
    Write-Host "❌ SE ENCONTRARON $errores ERRORES" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  CORRIGE LOS ERRORES ANTES DE HACER DEPLOY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Ver soluciones en: DEPLOY-VERCEL-FIX.md" -ForegroundColor Cyan
}

Write-Host ""
