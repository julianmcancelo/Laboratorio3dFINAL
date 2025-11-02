# 📄 Sistema de Carga de Comprobantes

## 🎯 Descripción General

Sistema completo para que los usuarios carguen comprobantes de compra que serán validados por administradores para otorgar puntos.

---

## 📁 Archivos Creados/Modificados

### **Base de Datos**
1. **`src/lib/create-tables.sql`** - Actualizado con tabla `comprobantes`
2. **`src/lib/add-comprobantes-table.sql`** - Script para agregar tabla a BD existente

### **Componentes Frontend**
3. **`src/components/CargarComprobante.tsx`** - Formulario de carga
4. **`src/components/ListaComprobantes.tsx`** - Lista de comprobantes del usuario

### **API Backend**
5. **`src/app/api/comprobantes/route.ts`** - Endpoint para CRUD de comprobantes

### **Dashboard**
6. **`src/app/dashboard/page.tsx`** - Integración de componentes

---

## 🗄️ Estructura de la Tabla `comprobantes`

```sql
CREATE TABLE comprobantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,                    -- Usuario que sube el comprobante
  monto DECIMAL(10, 2) NOT NULL,              -- Monto de la compra
  descripcion TEXT NULL,                      -- Descripción de la compra
  comprobante_base64 LONGTEXT NOT NULL,       -- Imagen/PDF en base64
  tipo_archivo VARCHAR(50) DEFAULT 'image/jpeg', -- Tipo MIME
  estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
  puntos_otorgados INT DEFAULT 0,             -- Puntos que se otorgaron
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_validacion TIMESTAMP NULL,            -- Cuándo se validó
  validado_por INT NULL,                      -- ID del admin que validó
  observaciones TEXT NULL,                    -- Notas del admin
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (validado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

---

## 🚀 Instalación

### 1. Crear/Actualizar Base de Datos

Si la BD no existe:
```bash
mysql -u root -p < Migracion/src/lib/create-tables.sql
```

Si la BD ya existe:
```bash
mysql -u root -p < Migracion/src/lib/add-comprobantes-table.sql
```

### 2. Verificar Componentes

Los componentes ya están integrados en el dashboard:
- ✅ `CargarComprobante` - Formulario de carga
- ✅ `ListaComprobantes` - Historial de comprobantes

---

## 💻 Uso para el Usuario

### **Cargar Comprobante**

1. Navegar al Dashboard
2. Buscar la sección **"Cargar Comprobante"**
3. Completar el formulario:
   - **Monto**: Valor de la compra ($)
   - **Descripción**: Detalles de la compra (500 caracteres máx)
   - **Comprobante**: Imagen o PDF (máx 5MB)
4. Click en **"Subir Comprobante"**
5. El comprobante queda en estado **"Pendiente"**

### **Ver Estado de Comprobantes**

En la sección **"Mis Comprobantes"**:
- 🟡 **Pendiente**: Esperando validación
- 🟢 **Aprobado**: Puntos otorgados
- 🔴 **Rechazado**: Con motivo del rechazo

---

## 🔧 API Endpoints

### **POST /api/comprobantes**

Subir un nuevo comprobante

**Request:**
```json
{
  "usuario_id": 1,
  "monto": 150.50,
  "descripcion": "Compra de filamento PLA 1kg",
  "comprobante_base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "tipo_archivo": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comprobante subido exitosamente",
  "comprobante_id": 123
}
```

### **GET /api/comprobantes**

Obtener comprobantes con filtros

**Query Params:**
- `usuario_id` - Filtrar por usuario
- `estado` - Filtrar por estado (pendiente/aprobado/rechazado)

**Response:**
```json
{
  "success": true,
  "comprobantes": [
    {
      "id": 1,
      "usuario_id": 1,
      "monto": 150.50,
      "descripcion": "Compra de filamento...",
      "estado": "pendiente",
      "puntos_otorgados": 0,
      "fecha_carga": "2025-01-15T12:30:00",
      "fecha_validacion": null,
      "validador_nombre": null,
      "observaciones": null,
      "tiene_comprobante": true
    }
  ]
}
```

---

## ⚙️ Características Técnicas

### **Frontend (React/Next.js)**

✅ **Validaciones:**
- Tipos permitidos: JPG, PNG, WEBP, PDF
- Tamaño máximo: 5MB
- Monto > 0
- Descripción obligatoria (máx 500 caracteres)

✅ **UX:**
- Preview de imagen antes de subir
- Estados de carga con spinner
- Mensajes de éxito/error claros
- Integración con tema Nexus
- Responsive mobile-first

✅ **Seguridad:**
- Conversión a base64 en cliente
- Validación de tipos MIME
- Sanitización de inputs

### **Backend (Next.js API Routes)**

✅ **Validaciones:**
- Verificación de usuario activo
- Validación de tamaño base64
- Validación de campos requeridos
- SQL injection protection (prepared statements)

✅ **Performance:**
- No se envía base64 en listados (solo metadata)
- Índices en campos de búsqueda
- Paginación implícita con ORDER BY

---

## 🔐 Seguridad

1. **Base64 en LONGTEXT**: Soporta archivos grandes
2. **Foreign Keys**: Integridad referencial
3. **ON DELETE CASCADE**: Limpieza automática
4. **Prepared Statements**: Protección contra SQL injection
5. **Validación Cliente + Servidor**: Doble capa de seguridad

---

## 🎨 Integración con Nexus Theme

Los componentes usan el sistema de diseño Nexus:
- Variables CSS (`var(--accent-*)`, `var(--heading-text)`, etc.)
- Clases Nexus (`.btn-nexus`, `.input-nexus`, `.glassmorphism-light`)
- Animaciones (`fade-in-item`, `hover:scale-105`)
- Colores adaptativos modo oscuro/claro

---

## 📱 Responsive Design

- **Mobile**: Vista vertical optimizada
- **Tablet**: Layout adaptativo
- **Desktop**: Vista completa con preview

---

## 🔄 Flujo de Trabajo

```
Usuario                    Sistema                    Admin
   |                          |                          |
   |-- Sube comprobante ----->|                          |
   |                          |-- Guarda en BD          |
   |                          |   (estado: pendiente)   |
   |<-- Confirmación ---------|                          |
   |                          |                          |
   |                          |<-- Revisa comprobante ---|
   |                          |                          |
   |                          |-- Valida comprobante --->|
   |                          |   (aprueba/rechaza)      |
   |                          |                          |
   |                          |-- Otorga puntos -------->|
   |<-- Notificación ---------|                          |
```

---

## 🎯 Próximos Pasos (To-Do)

### Para Administrador:
- [ ] Crear panel de validación `/admin/comprobantes`
- [ ] Vista de comprobante en modal
- [ ] Acción: Aprobar con puntos
- [ ] Acción: Rechazar con observación
- [ ] Filtros: pendiente/aprobado/rechazado
- [ ] Búsqueda por usuario/fecha

### Mejoras Futuras:
- [ ] Notificaciones push al usuario
- [ ] Historial de cambios de estado
- [ ] Exportar reportes en Excel
- [ ] Compresión de imágenes automática
- [ ] OCR para extraer monto automáticamente

---

## 🐛 Troubleshooting

### Error: "Archivo demasiado grande"
- **Solución**: Reducir calidad de imagen o comprimir

### Error: "Tipo de archivo no permitido"
- **Solución**: Solo JPG, PNG, WEBP o PDF

### Error: "Usuario no encontrado"
- **Solución**: Verificar que el usuario esté activo en BD

### Comprobante no aparece en lista
- **Solución**: Click en botón "Recargar" 🔄

---

## 📞 Contacto

Para soporte o consultas sobre el sistema de comprobantes, contactar al equipo de desarrollo.

---

**✅ Sistema de Comprobantes v1.0 - Implementado exitosamente**
