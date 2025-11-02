# 🚀 Solución de Errores de Deploy en Vercel

## ✅ Correcciones Aplicadas

### 1. **ESLint Config Simplificado**
- ❌ **Antes:** Config complejo con múltiples plugins
- ✅ **Ahora:** Config minimalista usando solo `next/core-web-vitals`

### 2. **Verificar Prisma Client**
- ✅ El archivo `src/lib/prisma-client.ts` **NO debe** importar `Rol`
- ✅ Línea 6 debe ser: `import { PrismaClient } from '@prisma/client';`
- ❌ NO debe ser: `import { PrismaClient, Rol } from '@prisma/client';`

---

## 📝 Pasos para Deployar Correctamente

### **Paso 1: Verificar Cambios Locales**

```bash
cd c:\Users\Jota\Downloads\lab3d.jcancelo.dev\Migracion

# Ver archivos modificados
git status
```

### **Paso 2: Agregar TODOS los Cambios**

```bash
# Agregar todos los archivos
git add .

# Verificar qué se va a commitear
git status
```

### **Paso 3: Commit con Mensaje Descriptivo**

```bash
git commit -m "fix: simplificar ESLint config y verificar Prisma imports para Vercel"
```

### **Paso 4: Push a GitHub**

```bash
git push origin main
```

### **Paso 5: Vercel Re-Deploy Automático**

- Vercel detectará el push automáticamente
- Iniciará un nuevo build
- Verifica los logs en: https://vercel.com/dashboard

---

## 🔍 Verificación Pre-Deploy

### **Checklist Obligatorio:**

- [ ] `.eslintrc.json` simplificado (solo `next/core-web-vitals`)
- [ ] `src/lib/prisma-client.ts` línea 6: `import { PrismaClient } from '@prisma/client';`
- [ ] `package.json` tiene todas las dependencias
- [ ] `.env.example` existe (sin datos sensibles)
- [ ] `.env` está en `.gitignore`

---

## ⚠️ Si Persisten Errores

### **Error: `Module has no exported member 'Rol'`**

**Causa:** GitHub tiene código viejo

**Solución:**
```bash
# 1. Verificar línea 6 del archivo local
cat src/lib/prisma-client.ts | head -10

# 2. Si está correcto localmente, forzar push
git add src/lib/prisma-client.ts
git commit -m "fix: remove Rol import from Prisma client"
git push --force origin main
```

### **Error: ESLint Config**

**Causa:** Config demasiado complejo

**Solución:**
```bash
# Ya aplicada - .eslintrc.json simplificado
# Solo hacer commit y push
git add .eslintrc.json
git commit -m "fix: simplify ESLint config for Vercel"
git push origin main
```

---

## 🎯 Comandos Rápidos (Copiar y Pegar)

```bash
# Todo en uno (ejecutar desde: c:\Users\Jota\Downloads\lab3d.jcancelo.dev\Migracion)
git add . && git commit -m "fix: Vercel build errors - ESLint y Prisma" && git push origin main
```

---

## 📊 Monitoreo del Deploy

### **Ver Logs en Tiempo Real:**

1. Ir a: https://vercel.com/tu-usuario/tu-proyecto
2. Click en "Deployments"
3. Click en el deployment más reciente
4. Ver logs en tiempo real

### **Logs Exitosos Esperados:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## ✅ Post-Deploy

Una vez que el deploy sea exitoso:

```bash
# Visitar tu app
https://tu-proyecto.vercel.app

# Probar endpoints críticos
https://tu-proyecto.vercel.app/api/auth/register
https://tu-proyecto.vercel.app/api/premios/publicos
```

---

## 🆘 Si Nada Funciona

1. **Borrar caché de Vercel:**
   - Dashboard → Settings → Clear Build Cache

2. **Re-deploy manual:**
   - Dashboard → Deployments → Click "..." → Redeploy

3. **Verificar variables de entorno:**
   - Dashboard → Settings → Environment Variables
   - Verificar que existan todas las de `.env.example`

---

**Última actualización:** 2025-11-02 20:45 UTC-03
