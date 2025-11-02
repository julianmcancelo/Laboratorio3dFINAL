# 🚀 Guía de Instalación - Laboratorio 3D

## 📋 Requisitos Previos

### 🛠️ Software Necesario
- **Node.js** v18.17.0 o superior
- **npm** v9.0.0 o superior (o yarn v1.22.0+)
- **MySQL** v8.0 o superior (o acceso a PlanetScale)
- **Git** para control de versiones

### 🌐 Servicios Externos (Opcionales pero recomendados)
- **PlanetScale** - Base de datos serverless MySQL
- **Vercel** - Hosting y despliegue
- **Cloudinary** - Almacenamiento de imágenes
- **Resend** - Servicio de email
- **WhatsApp Business API** - Notificaciones

---

## 📦 Instalación del Proyecto

### 1. 📥 Clonar el Proyecto

```bash
# Si tienes el repositorio en Git
git clone <URL_DEL_REPOSITORIO>
cd lab3d.jcancelo.dev/Migracion

# Si no, copia la carpeta Migracion a tu ubicación deseada
```

### 2. 📦 Instalar Dependencias

```bash
# Usando npm (recomendado)
npm install

# O usando yarn
yarn install
```

### 3. 🔧 Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar el archivo .env.local con tu configuración
```

### 4. ⚙️ Configuración de Variables de Entorno

Edita el archivo `.env.local` con la siguiente configuración:

#### 🗄️ Base de Datos
```env
# Configuración MySQL (local o PlanetScale)
DB_HOST=localhost                    # o tu host de PlanetScale
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql
DB_NAME=laboratorio_3d
DB_PORT=3306
DATABASE_URL=mysql://tu_usuario:mysql@localhost:3306/laboratorio_3d

# PlanetScale (si usas)
PLANETSCALE_BRANCH=main
PLANETSCALE_ORG=tu_org
PLANETSCALE_DB=lab3d
```

#### 🔐 Autenticación
```env
# JWT Secrets (¡GENERAR NUEVOS!)
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_aqui
JWT_EXPIRES_IN=24h
NEXTAUTH_SECRET=tu_secreto_nextauth_aqui
NEXTAUTH_URL=http://localhost:3000
```

#### 📧 Email y Notificaciones
```env
# Configuración Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@lab3d.jcancelo.dev
EMAIL_ADMIN=admin@lab3d.jcancelo.dev

# WhatsApp Business API
WHATSAPP_API_TOKEN=whatsapp_token_aqui
WHATSAPP_PHONE_ID=phone_id_aqui
WHATSAPP_WEBHOOK_VERIFY_TOKEN=verify_token_aqui
```

#### 🖼️ Almacenamiento y Media
```env
# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NEXT_PUBLIC_CLOUDINARY_URL=https://res.cloudinary.com/tu_cloud_name
```

#### 📊 Analíticas y Monitoreo
```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Hotjar
NEXT_PUBLIC_HOTJAR_ID=1234567

# Sentry (error tracking)
SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxxx
```

#### 🌍 Configuración General
```env
# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Configuración de la aplicación
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Laboratorio 3D
NEXT_PUBLIC_APP_DESCRIPTION=Sistema de Premios y Lealtad
```

---

## 🗄️ Configuración de la Base de Datos

### Opción 1: MySQL Local

1. **Crear la base de datos:**
```sql
CREATE DATABASE laboratorio_3d CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Importar el esquema:**
```bash
# Si tienes un archivo SQL
mysql -u tu_usuario -p laboratorio_3d < esquema.sql

# O ejecuta los scripts de migración manualmente
```

### Opción 2: PlanetScale (Recomendado)

1. **Crear cuenta en [PlanetScale](https://planetscale.com)**
2. **Crear nueva base de datos:**
   - Nombre: `lab3d`
   - Región: la más cercana a tus usuarios
3. **Obtener la URL de conexión:**
```bash
# Usando CLI de PlanetScale
pscale database create lab3d
pscale branch create lab3d main
pscale password create lab3d main
```

4. **Actualizar variables de entorno** con la URL proporcionada

---

## 🏗️ Scripts de la Base de Datos

### 📋 Estructura de Tablas

```sql
-- Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  dni VARCHAR(10) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  instagram VARCHAR(100),
  rol ENUM('admin', 'operador', 'cliente') DEFAULT 'cliente',
  estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
  puntos_acumulados INT DEFAULT 0,
  codigo_referido VARCHAR(10) UNIQUE,
  referido_por_id INT,
  nivel_lealtad_id INT DEFAULT 1,
  apto_para_canje BOOLEAN DEFAULT FALSE,
  total_compras INT DEFAULT 0,
  monto_total_compras DECIMAL(10,2) DEFAULT 0,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta DATETIME,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_ultimo_acceso DATETIME,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (referido_por_id) REFERENCES usuarios(id)
);

-- Premios
CREATE TABLE premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria ENUM('producto', 'servicio', 'consulta', 'tratamiento', 'otro') NOT NULL,
  tipo ENUM('fisico', 'digital', 'servicio', 'descuento') NOT NULL,
  estado ENUM('activo', 'inactivo', 'agotado') DEFAULT 'activo',
  puntos_requeridos INT NOT NULL,
  monto_minimo_compra DECIMAL(10,2),
  stock_disponible INT,
  stock_ilimitado BOOLEAN DEFAULT FALSE,
  nivel_minimo INT DEFAULT 1,
  imagen_url VARCHAR(500),
  valido_desde DATETIME,
  valido_hasta DATETIME,
  condiciones JSON,
  beneficios JSON,
  restricciones JSON,
  tags JSON,
  valor_estimado DECIMAL(10,2),
  requisitos_personalizados JSON,
  aprobacion_requerida BOOLEAN DEFAULT FALSE,
  descripcion_personalizada TEXT,
  creado_por INT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Compras
CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT NOT NULL,
  medio_pago ENUM('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'mercado_pago', 'billetera_virtual', 'cheque', 'otro') NOT NULL,
  categoria ENUM('producto', 'servicio', 'consulta', 'tratamiento', 'otro') NOT NULL,
  estado ENUM('pendiente', 'verificada', 'rechazada', 'cancelada', 'en_revision', 'procesada') DEFAULT 'pendiente',
  fecha_compra DATETIME NOT NULL,
  fecha_verificacion DATETIME,
  verificado_por INT,
  puntos_ganados INT NOT NULL,
  puntos_utilizados INT DEFAULT 0,
  comprobante_url VARCHAR(500),
  numero_comprobante VARCHAR(50),
  descuento_aplicado DECIMAL(5,2),
  impuestos_incluidos BOOLEAN DEFAULT TRUE,
  notas TEXT,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (verificado_por) REFERENCES usuarios(id)
);

-- Canjes de Premios
CREATE TABLE canjes_premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  premio_id INT NOT NULL,
  puntos_utilizados INT NOT NULL,
  estado ENUM('solicitado', 'aprobado', 'entregado', 'cancelado') DEFAULT 'solicitado',
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion DATETIME,
  fecha_entrega DATETIME,
  aprobado_por INT,
  notas_admin TEXT,
  notas_usuario TEXT,
  calificacion INT CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario_calificacion TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (premio_id) REFERENCES premios(id),
  FOREIGN KEY (aprobado_por) REFERENCES usuarios(id)
);

-- Niveles de Lealtad
CREATE TABLE niveles_lealtad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#8b5cf6',
  puntos_minimos INT NOT NULL,
  beneficios JSON,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría
CREATE TABLE auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  tipo_operacion ENUM('crear', 'leer', 'actualizar', 'eliminar', 'listar', 'buscar', 'estadisticas') NOT NULL,
  recurso_afectado VARCHAR(100) NOT NULL,
  recurso_id INT,
  datos_anteriores JSON,
  datos_nuevos JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha_operacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_codigo_referido ON usuarios(codigo_referido);
CREATE INDEX idx_premios_categoria ON premios(categoria);
CREATE INDEX idx_premios_estado ON premios(estado);
CREATE INDEX idx_compras_cliente_id ON compras(cliente_id);
CREATE INDEX idx_compras_estado ON compras(estado);
CREATE INDEX idx_canjes_usuario_id ON canjes_premios(usuario_id);
CREATE INDEX idx_canjes_premio_id ON canjes_premios(premio_id);
```

---

## 🚀 Ejecutar la Aplicación

### 🛠️ Modo Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm run dev

# O con yarn
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

### 🔍 Verificar Instalación

1. **Acceder a la aplicación:**
   - URL: `http://localhost:3000`
   - Login: `http://localhost:3000/login`

2. **Crear usuario administrador:**
   - Regístrate en `http://localhost:3000/registro`
   - Luego actualiza manualmente el rol a 'admin' en la base de datos:
```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';
```

3. **Probar funcionalidades:**
   - Login y registro
   - Gestión de usuarios
   - Sistema de premios
   - Registro de compras

---

## 📦 Build para Producción

### 🏗️ Compilar la Aplicación

```bash
# Build optimizado para producción
npm run build

# O con yarn
yarn build
```

### 🚀 Iniciar Servidor de Producción

```bash
# Iniciar servidor de producción
npm start

# O con yarn
yarn start
```

---

## 🐳 Docker (Opcional)

### 📋 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### 🚀 Ejecutar con Docker

```bash
# Construir imagen
docker build -t lab3d-migracion .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local lab3d-migracion
```

---

## 🔧 Configuración Adicional

### 📧 Configurar Email (Resend)

1. **Crear cuenta en [Resend](https://resend.com)**
2. **Obtener API Key**
3. **Configurar dominio de envío**
4. **Actualizar variables de entorno**

### 📱 Configurar WhatsApp

1. **Crear cuenta en [Meta for Developers](https://developers.facebook.com)**
2. **Configurar WhatsApp Business API**
3. **Obtener tokens y phone ID**
4. **Configurar webhooks**

### 🖼️ Configurar Cloudinary

1. **Crear cuenta en [Cloudinary](https://cloudinary.com)**
2. **Obtener credenciales**
3. **Configurar upload presets**
4. **Actualizar variables de entorno**

---

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint

# Formatear código
npm run format

# Type checking
npm run type-check

# Ejecutar tests
npm run test

# Ejecutar tests con coverage
npm run test:coverage

# Analizar bundle
npm run analyze
```

---

## 🔍 Solución de Problemas

### ❌ Errores Comunes

#### 1. **Error de conexión a base de datos**
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar variables de entorno
echo $DB_HOST $DB_USER $DB_PASS $DB_NAME
```

#### 2. **Error de dependencias**
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Error de permisos**
```bash
# Verificar permisos de archivos
chmod -R 755 .

# Verificar usuario de MySQL
GRANT ALL PRIVILEGES ON laboratorio_3d.* TO 'tu_usuario'@'localhost';
```

#### 4. **Error de puerto en uso**
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O cambiar puerto
PORT=3001 npm run dev
```

### 📋 Checklist de Verificación

- [ ] Node.js v18+ instalado
- [ ] MySQL corriendo y accesible
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y tablas importadas
- [ ] Dependencias instaladas
- [ ] Servidor de desarrollo inicia sin errores
- [ ] Login y registro funcionan
- [ ] API endpoints responden correctamente

---

## 📚 Documentación Adicional

- [Documentación de la API](./docs/api.md)
- [Guía de Desarrollo](./docs/desarrollo.md)
- [Deploy en Vercel](./docs/deploy-vercel.md)
- [Configuración de PlanetScale](./docs/planetscale.md)

---

## 🆘 Soporte

Si encuentras algún problema durante la instalación:

1. **Revisa los logs de la consola**
2. **Verifica la configuración de variables de entorno**
3. **Confirma la conexión a la base de datos**
4. **Consulta la documentación adicional**

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio.

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tendrás el sistema Laboratorio 3D completamente funcional en tu entorno local. Desde aquí puedes:

- Personalizar el diseño y colores
- Agregar nuevas funcionalidades
- Configurar servicios externos
- Preparar para despliegue en producción

¡Bienvenido al nuevo sistema moderno de Laboratorio 3D! 🚀
