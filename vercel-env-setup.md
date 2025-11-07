# 🚨 Configuración Urgente de Variables en Vercel

## ❌ Errores detectados:
- API `/api/auth/forgot-password` devuelve 500
- Variables de entorno no configuradas
- CSP bloqueando scripts externos

## ✅ Variables que necesitas agregar en Vercel Dashboard:

### 1. Ve a: https://vercel.com/dashboard
### 2. Selecciona tu proyecto: "Laboratorio 3D"
### 3. Settings → Environment Variables
### 4. Agrega estas variables:

**Base de datos:**
```
DATABASE_URL = mysql://jcancelo_3d:feelthesky1@167.250.5.55:3306/jcancelo_laboratorio3d
```

**Autenticación:**
```
JWT_SECRET = lab3d-super-secreto-jwt-2024-production-key-very-secure-random-string
NEXTAUTH_URL = https://laboratorio3d.com
NEXTAUTH_SECRET = nextauth-laboratorio3d-secret-key-2024-production
```

**Gmail (CRÍTICO):**
```
GMAIL_USER = jcancelo.dev@gmail.com
GMAIL_APP_PASSWORD = eejs dklq txja yhjm
```

**App:**
```
NEXT_PUBLIC_APP_URL = https://laboratorio3d.com
NEXT_PUBLIC_APP_NAME = Laboratorio 3D
NODE_ENV = production
```

**Seguridad:**
```
ALLOWED_ORIGINS = https://laboratorio3d.com
CORS_ORIGINS = https://laboratorio3d.com
```

## 🔄 Después de configurar:
1. Save variables
2. Redeploy (Deployments → Redeploy)
3. Probar forgot-password

## 🧪 Para probar:
https://laboratorio3d.com/forgot-password
Email de prueba: jcancelo.dev@gmail.com
