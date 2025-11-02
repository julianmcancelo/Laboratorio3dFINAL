# 🗄️ Configuración Base de Datos SQLite

## 📋 Pasos para Configurar

### 1. Instalar Dependencias

```bash
npm install sqlite sqlite3 uuid @types/uuid
```

### 2. Crear Directorio de Datos

```bash
mkdir data
```

### 3. Inicializar Base de Datos

```bash
npx ts-node scripts/init-db.ts
```

### 4. Actualizar Componentes

Los archivos ya están actualizados para usar SQLite:

- ✅ `lib/database.ts` - Funciones de base de datos SQLite
- ✅ `store/authStore.ts` - Store con SQLite
- ✅ `src/app/api/auth/login/route.ts` - API Login SQLite
- ✅ `src/app/api/auth/register/route.ts` - API Registro SQLite

## 🔑 Usuarios de Prueba

Una vez inicializada la base de datos, tendrás:

- **Admin**: `admin@lab3d.com` / `admin123`
- **Test**: `test@lab3d.com` / `test123`

## 🚀 Iniciar Aplicación

```bash
npm run dev
```

La aplicación estará funcionando con base de datos SQLite local en `data/laboratorio3d.db`

## 📊 Estructura de la Base de Datos

### Tablas creadas:
- `usuarios` - Datos de usuarios
- `compras` - Registro de compras
- `canjes` - Historial de canjes
- `niveles` - Niveles del programa
- `sesiones` - Sesiones activas

### Funcionalidades:
- ✅ Registro de usuarios
- ✅ Login/Logout
- ✅ Sistema de puntos
- ✅ Niveles (Bronce, Plata, Oro, Platino)
- ✅ Códigos de referido
- ✅ Gestión de compras y canjes
