# 🔄 PROCESO DETALLADO DEL PROYECTO

## Fases de Desarrollo - Sistema de Lealtad Lab3D

---

## FASE 1: Análisis y Planificación (20 hrs)

### Reuniones Iniciales
- Análisis del documento "Programa de Puntos y Referidos"
- Identificación de stakeholders
- Definición de alcance del proyecto

### Requerimientos Identificados
1. **Bono de Bienvenida:** 500 pts al registrarse
2. **Escala de Puntos:** 1 punto = $1.000 gastados
3. **Niveles de Lealtad:**
   - Bronce: 0-9.999 pts
   - Plata: 10.000-19.999 pts
   - Oro: 20.000+ pts
4. **Premios:**
   - 1.500 pts: 3kg filamento
   - 3.000 pts: $90.000 regalo
   - 10.000 pts: $180.000 regalo
   - 20.000 pts: Impresora Bambu Lab A1 Mini
5. **Sistema de Referidos:**
   - Referido: $25.000 descuento (Tienda Nube)
   - Referente: 50 pts tras validación compra

---

## FASE 2: Diseño (45 hrs)

### Diseño de Base de Datos (15 hrs)
**Tablas Principales:**
- `usuarios` (16 campos)
- `comprobantes` (14 campos)
- `premios` (8 campos)
- `niveles_lealtad` (10 campos)
- `canjes_premios` (8 campos)
- `sesiones` (4 campos)
- `historial_puntos` (9 campos)

**Relaciones Clave:**
- Usuario → Comprobantes (1:N)
- Usuario → Canjes (1:N)
- Usuario → Referidos (1:N)
- Premio → Nivel (N:1)

### Diseño UI/UX (30 hrs)
**Sistema de Diseño "Nexus":**
- Tema dark por defecto
- Glassmorphism effects
- Colores dinámicos por nivel
- Responsive design

**Pantallas Diseñadas:**
1. Login/Registro
2. Dashboard Usuario
3. Carga Comprobantes
4. Catálogo Premios
5. Panel Admin
6. Gestión Usuarios

---

## FASE 3: Desarrollo Frontend (150 hrs)

### Autenticación (20 hrs)
- Formulario login con validación
- Registro con código de referido
- Sistema de sesiones JWT
- Middleware de rutas protegidas

### Dashboard Usuario (35 hrs)
- Visualización de puntos con animaciones
- Nivel de lealtad con colores dinámicos
- Progreso al siguiente nivel
- Historial de puntos (tabla)
- Compras verificadas (tabla)

### Carga de Comprobantes (25 hrs)
- Formulario multi-step
- Upload de archivos (imagen/PDF)
- Preview de archivo
- Selector de tipo producto
- Campos dinámicos (N° serie para impresoras)
- Validación client-side

### Catálogo de Premios (30 hrs)
- Cards con gradientes según nivel
- Badges de nivel requerido
- Modal de confirmación de canje
- Filtros por nivel
- Sistema de desbloqueo visual

### Panel Administrativo (40 hrs)
- Dashboard con estadísticas
- Tabla de comprobantes pendientes
- Sistema de aprobación/rechazo
- Vista de usuario individual
- Gestión de premios
- Logs de actividad

---

## FASE 4: Desarrollo Backend (90 hrs)

### APIs Core (45 hrs)
**Auth:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/verify`

**Usuarios:**
- GET `/api/usuarios/[id]`
- GET `/api/usuarios/[id]/historial-puntos`
- GET `/api/usuarios/[id]/compras-verificadas`

**Comprobantes:**
- POST `/api/comprobantes`
- GET `/api/admin/comprobantes`
- PUT `/api/admin/comprobantes` (aprobar/rechazar)

**Premios:**
- GET `/api/premios/publicos`
- POST `/api/premios/canjear`

### Sistema de Referidos (15 hrs)
- Función `otorgarPuntosReferente()`
- Validación de primera compra
- Registro en historial automático
- API `/api/admin/referidos-pendientes`

### Niveles Dinámicos (12 hrs)
- Función `getNivelAutomatico(puntos)`
- Consulta a niveles desde BD
- Caché en memoria para rendimiento
- Helper functions para colores

### Gestión de Archivos (18 hrs)
- Conversión a Base64
- Validación de tipo y tamaño
- Almacenamiento en BD
- Compresión de imágenes

---

## FASE 5: Pruebas (35 hrs)

### Pruebas Unitarias (10 hrs)
- Cálculo de puntos
- Determinación de niveles
- Validación de referidos

### Pruebas de Integración (15 hrs)
- Flujo completo de registro
- Carga y aprobación de comprobantes
- Sistema de referidos end-to-end
- Canje de premios

### Pruebas de Usabilidad (5 hrs)
- Testing con usuarios reales
- Ajustes de UI según feedback

### Pruebas de Seguridad (5 hrs)
- Penetration testing básico
- Validación de JWT
- SQL injection prevention
- XSS protection

---

## FASE 6: Deploy y Documentación (30 hrs)

### Deploy (18 hrs)
- Configuración de servidor
- Setup de BD en producción
- Migración de datos
- Configuración de dominio y SSL

### Documentación (12 hrs)
- Documentación técnica
- Manual de usuario
- Manual de administrador
- Guías de troubleshooting

---

## METODOLOGÍA DE TRABAJO

### Sprints Ejecutados

| Sprint | Duración | Entregables |
|--------|----------|-------------|
| Sprint 0 | 1 sem | Setup, BD, arquitectura |
| Sprint 1 | 2 sem | Login, registro |
| Sprint 2 | 2 sem | Dashboard usuario |
| Sprint 3 | 2 sem | Carga comprobantes |
| Sprint 4 | 2 sem | Panel admin |
| Sprint 5 | 2 sem | Catálogo premios |
| Sprint 6 | 2 sem | Sistema referidos |
| Sprint 7 | 2 sem | Niveles dinámicos |
| Sprint 8 | 1 sem | Testing y bugs |
| Sprint 9 | 1 sem | Deploy y docs |

### Herramientas Utilizadas
- **Control de Versiones:** Git + GitHub
- **Gestión de Proyecto:** Trello / Notion
- **Comunicación:** Slack / WhatsApp
- **Testing:** Postman, Jest
- **Deploy:** Vercel / VPS

---

**Total Horas Fase de Desarrollo:** 370 horas
**Total Horas Proyecto Completo:** 418 horas
