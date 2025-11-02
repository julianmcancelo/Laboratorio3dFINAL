# 🏆 Sistema de Lealtad - Laboratorio 3D

## 📋 Descripción
Plataforma web completa para gestión de programa de fidelización de clientes. Sistema moderno con acumulación automática de puntos por compras, niveles de lealtad dinámicos (Bronce, Plata, Oro), catálogo de premios canjeables y sistema de referidos con doble beneficio.

**Conversión:** 1 punto = $1.000 en compras  
**Bono de Bienvenida:** 500 puntos al registrarse  
**Sistema de Referidos:** 50 puntos al referente + $25.000 descuento al referido

## 🏗️ Arquitectura
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes (Serverless)
- **Base de Datos**: MySQL (PlanetScale)
- **Hosting**: Vercel
- **Autenticación**: JWT
- **Estado**: Zustand
- **Validaciones**: Zod

## 📁 Estructura del Proyecto
```
Migracion/
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── admin/          # Panel de administración
│   │   ├── cliente/        # Portal de clientes
│   │   └── globals.css     # Estilos globales
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base
│   │   ├── forms/         # Formularios
│   │   └── layout/        # Layouts
│   ├── lib/               # Utilidades y configuración
│   │   ├── db.ts          # Conexión a base de datos
│   │   ├── auth.ts        # Utilidades de autenticación
│   │   ├── validations.ts # Esquemas Zod
│   │   └── utils.ts       # Funciones helper
│   ├── store/             # Estado global (Zustand)
│   ├── types/             # Tipos TypeScript
│   └── hooks/             # Hooks personalizados
├── public/                # Archivos estáticos
├── docs/                  # Documentación
└──配置/                   # Archivos de configuración
```

## ✨ Características Principales

### Para Usuarios
- 🎁 **500 puntos de bienvenida** al registrarse
- 📸 **Carga de comprobantes** con validación automática
- 🏅 **Niveles de lealtad** con colores dinámicos (Bronce, Plata, Oro)
- 🎯 **Catálogo de 4 premios** según puntos acumulados
- 👥 **Sistema de referidos** con código único
- 📊 **Dashboard personalizado** con historial y progreso
- 🌓 **Tema claro/oscuro** con preferencia guardada

### Para Administradores
- ✅ **Aprobación/rechazo** de comprobantes con observaciones
- 📈 **Estadísticas en tiempo real**
- 👤 **Gestión de usuarios** y niveles
- 🎁 **Gestión de premios** y canjes
- 📋 **Panel de referidos** pendientes de cupón
- 🔍 **Búsqueda por número de serie** (impresoras)

### Técnicas
- ✅ TypeScript con tipos estrictos
- ✅ Validaciones exhaustivas (Zod)
- ✅ Autenticación JWT + sesiones en BD
- ✅ Protección de rutas por rol
- ✅ Arquitectura serverless escalable
- ✅ Diseño responsive mobile-first
- ✅ Logging detallado para debugging

## 🛠️ Tecnologías
- Next.js 14 (App Router)
- TypeScript 5
- TailwindCSS 3
- Zustand (estado global)
- Zod (validaciones)
- MySQL (PlanetScale)
- JWT (autenticación)

## 🚀 Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/lab3d-sistema-lealtad.git
cd lab3d-sistema-lealtad

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD

# Ejecutar migraciones SQL
# Ver: EJECUTAR-SISTEMA-REFERIDOS.sql

# Iniciar servidor de desarrollo
npm run dev
```

Ver [INSTALACION.md](./INSTALACION.md) para guía detallada.

---

## 📚 Documentación

- **[DOCUMENTACION-COMPLETA.md](./DOCUMENTACION-COMPLETA.md)** - Documento principal del proyecto
- **[PROCESO-DETALLADO.md](./PROCESO-DETALLADO.md)** - Fases de desarrollo y metodología
- **[PRUEBAS-Y-CALIDAD.md](./PRUEBAS-Y-CALIDAD.md)** - Testing y QA completo
- **[INSTALACION.md](./INSTALACION.md)** - Guía de instalación paso a paso
- **[SETUP-DATABASE.md](./SETUP-DATABASE.md)** - Configuración de base de datos

---

## 🗄️ Base de Datos

### Tablas Principales
- `usuarios` - Información de clientes y admins
- `comprobantes` - Comprobantes de compra subidos
- `premios` - Catálogo de premios canjeables
- `niveles_lealtad` - Configuración de niveles (Bronce, Plata, Oro)
- `canjes_premios` - Registro de canjes realizados
- `historial_puntos` - Movimientos de puntos
- `sesiones` - Sesiones activas JWT

**Setup inicial:** Ver `EJECUTAR-SISTEMA-REFERIDOS.sql`

---

## 🎨 Sistema de Diseño

### Tema "Nexus"
- Sistema glassmorphism con efectos premium
- Colores dinámicos según nivel de usuario
- Modo dark/light con transiciones suaves
- Variables CSS para fácil personalización

### Paletas por Nivel
- **Bronce:** Naranja/Cobre (#FF8C42, #D4782C)
- **Plata:** Plateado (#C0C0C0, #A8A8A8)
- **Oro:** Dorado (#FFD700, #FFA500)

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración de 7 días
- ✅ Sesiones validadas en BD
- ✅ Rutas protegidas por middleware
- ✅ Validación de roles (ADMIN/CLIENTE)
- ✅ Sanitización de inputs SQL
- ✅ Validación de archivos subidos (tipo, tamaño)

---

## 📈 Roadmap

### Completado ✅
- [x] Sistema de autenticación
- [x] Dashboard de usuario
- [x] Carga de comprobantes con tipo de producto
- [x] Sistema de referidos automático
- [x] Niveles dinámicos
- [x] Catálogo de premios
- [x] Panel administrativo

### Por Implementar 🚧
- [ ] Página admin de referidos pendientes
- [ ] Notificaciones push
- [ ] Estadísticas avanzadas por producto
- [ ] Búsqueda de impresoras por N° serie
- [ ] Sistema de gamificación
- [ ] App móvil (React Native)

---

## 👥 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Notas Importantes

- Todo el código está en español para mejor comprensión del equipo
- Validaciones exhaustivas en frontend y backend
- Manejo de errores robusto con mensajes claros
- Código limpio siguiendo mejores prácticas
- Comentarios donde la lógica lo requiera

---

## 📄 Licencia

Este proyecto es privado y confidencial de Laboratorio 3D.

---

## 📧 Contacto

**Laboratorio 3D**  
🌐 Web: lab3d.jcancelo.dev  
📧 Email: contacto@lab3d.com

---

⭐ **¡Si este proyecto te resulta útil, dale una estrella!**
# Laboratorio3dFINAL
