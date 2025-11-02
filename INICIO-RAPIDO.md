# 🚀 Inicio Rápido - Laboratorio 3D

## ✅ Configuración Completada

Las credenciales de la base de datos ya están configuradas en `.env.local`:

```
🗄️ Base de Datos MySQL
├─ Host: 167.250.5.55
├─ Database: jcancelo_laboratorio3d
├─ User: jcancelo_3d
└─ Puerto: 3306
```

---

## 📋 Pasos para Iniciar

### 1️⃣ **Verificar Conexión a la Base de Datos**

```bash
node test-db-connection.js
```

**Resultado esperado:**
- ✅ Conexión exitosa
- 📊 Lista de tablas (si existen)
- 🔐 Permisos del usuario

**Si hay error:**
- Verifica que el servidor MySQL esté accesible
- Confirma que el firewall permita conexiones al puerto 3306
- Revisa las credenciales en `.env.local`

---

### 2️⃣ **Importar Esquema de Base de Datos** (Si las tablas no existen)

Si el test muestra que no hay tablas, necesitas importar el esquema:

**Opción A: Usar MySQL Workbench o similar**
```sql
-- Ejecutar el script SQL del archivo docs/base-de-datos.md
-- O crear las tablas manualmente
```

**Opción B: Desde línea de comandos**
```bash
mysql -h 167.250.5.55 -u jcancelo_3d -p jcancelo_laboratorio3d < esquema.sql
# Cuando pida contraseña: feelthesky1
```

**Tablas principales necesarias:**
- ✅ `usuarios` - Gestión de usuarios y clientes
- ✅ `premios` - Catálogo de premios disponibles
- ✅ `compras` - Registro de transacciones
- ✅ `canjes_premios` - Historial de canjes
- ✅ `niveles_lealtad` - Configuración de niveles
- ✅ `auditoria` - Log de operaciones

**Ver estructura completa:** `docs/base-de-datos.md` o `INSTALACION.md`

---

### 3️⃣ **Generar Secretos JWT Seguros** (Recomendado)

Genera secretos únicos para mayor seguridad:

```bash
# En Node.js o navegador:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Actualiza en `.env.local`:
```env
JWT_SECRET="<el-secreto-generado-aqui>"
NEXTAUTH_SECRET="<otro-secreto-generado-aqui>"
```

---

### 4️⃣ **Iniciar el Servidor de Desarrollo**

```bash
npm run dev
```

**El servidor iniciará en:** `http://localhost:3000`

---

## 🧪 Pruebas Iniciales

### 1. **Verificar que la aplicación carga**
```
🌐 Abrir: http://localhost:3000
✅ Debe mostrar la página de inicio
```

### 2. **Probar Login**
```
🌐 Ir a: http://localhost:3000/login
📝 Intenta iniciar sesión (si ya tienes usuarios)
```

### 3. **Crear primer usuario administrador**

**Opción A: Registro desde la UI**
```
🌐 Ir a: http://localhost:3000/registro
📝 Completa el formulario
```

**Opción B: Crear directamente en la BD**
```sql
-- Conectar a MySQL
mysql -h 167.250.5.55 -u jcancelo_3d -p jcancelo_laboratorio3d

-- Crear usuario admin
INSERT INTO usuarios (
  nombre_completo,
  email,
  password_hash,
  dni,
  rol,
  estado,
  codigo_referido,
  activo,
  fecha_creacion
) VALUES (
  'Administrador',
  'admin@lab3d.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIwNoOtj/y', -- password: admin123
  '12345678',
  'admin',
  'activo',
  'ADMIN001',
  1,
  NOW()
);
```

**Credenciales para login:**
- Email: `admin@lab3d.com`
- Password: `admin123`

**⚠️ IMPORTANTE:** Cambiar la contraseña después del primer login.

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Verificación
npm run lint             # Verificar código con ESLint
npm run type-check       # Verificar tipos de TypeScript
node test-db-connection.js  # Test conexión a BD

# Mantenimiento
npm install              # Reinstalar dependencias
npm cache clean --force  # Limpiar caché de npm
```

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Cannot connect to database"
**Solución:**
1. Verifica que el servidor MySQL en `167.250.5.55` esté accesible
2. Confirma que el firewall permita conexiones al puerto 3306
3. Prueba hacer ping: `ping 167.250.5.55`

### ❌ Error: "Access denied for user"
**Solución:**
1. Verifica las credenciales en `.env.local`
2. Confirma que el usuario tenga permisos:
```sql
GRANT ALL PRIVILEGES ON jcancelo_laboratorio3d.* TO 'jcancelo_3d'@'%';
FLUSH PRIVILEGES;
```

### ❌ Error: "Table doesn't exist"
**Solución:**
1. Importa el esquema de la base de datos (ver paso 2️⃣)
2. Verifica que estés usando la base de datos correcta

### ❌ Error: "JWT malformed" o "Invalid token"
**Solución:**
1. Genera nuevos secretos JWT (ver paso 3️⃣)
2. Limpia las cookies del navegador
3. Intenta login nuevamente

### ❌ Puerto 3000 en uso
**Solución:**
```bash
# Cambiar puerto
PORT=3001 npm run dev

# O matar el proceso
# Windows:
netstat -ano | findstr :3000
taskkill /PID <numero_pid> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Documentación Adicional

- 📖 **README.md** - Visión general del proyecto
- 🔧 **INSTALACION.md** - Guía completa de instalación
- 🗄️ **docs/base-de-datos.md** - Estructura de la BD
- 📊 **RESUMEN-MIGRACION.md** - Detalles de la migración
- ✅ **ESTADO-ACTUAL.md** - Estado del proyecto

---

## 🎯 Próximos Pasos Recomendados

1. ✅ **Verificar conexión a BD** → `node test-db-connection.js`
2. 📊 **Importar esquema** → Si las tablas no existen
3. 🔑 **Crear usuario admin** → Desde SQL o registro
4. 🚀 **Iniciar servidor** → `npm run dev`
5. 🧪 **Probar login** → `http://localhost:3000/login`
6. 🎨 **Personalizar branding** → Colores y logos
7. 📱 **Configurar servicios** → Email, WhatsApp (opcional)
8. 🚀 **Desplegar a producción** → Vercel/Netlify

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. 🔍 Revisa los logs de la consola
2. 📋 Consulta esta documentación
3. 🐛 Verifica el archivo `ESTADO-ACTUAL.md`
4. 📧 Contacta al equipo de desarrollo

---

## 🎉 ¡Todo Listo!

El sistema está configurado y listo para usar. 

**Ejecuta:** `node test-db-connection.js` para verificar todo está bien.

**¡Bienvenido al futuro de Laboratorio 3D! 🚀**
