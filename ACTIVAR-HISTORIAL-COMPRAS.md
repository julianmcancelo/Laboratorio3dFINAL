# ✅ Activar Historial de Puntos y Compras Verificadas

## 🐛 **Problema Actual:**
Las secciones muestran:
- "No hay movimientos de puntos"
- "No tienes compras verificadas"

---

## 🔧 **Solución:**

### **1. Reiniciar el Servidor** 🔄
Los archivos ya fueron corregidos pero el servidor necesita reiniciarse:

```bash
# Detener el servidor (Ctrl + C)
# Luego reiniciar:
npm run dev
```

---

### **2. Verificar que haya datos en la BD** 📊

Ejecuta este SQL para verificar:

```sql
-- Ver si hay comprobantes aprobados
SELECT 
  id,
  usuario_id,
  monto,
  estado,
  fecha_validacion,
  puntos_otorgados
FROM comprobantes
WHERE estado = 'aprobado'
ORDER BY fecha_validacion DESC
LIMIT 5;

-- Ver si hay historial de puntos
SELECT 
  id,
  usuario_id,
  tipo_transaccion,
  puntos_movimiento,
  fecha_transaccion
FROM historial_puntos
ORDER BY fecha_transaccion DESC
LIMIT 5;

-- Ver usuarios con puntos
SELECT 
  id,
  nombre_completo,
  puntos_acumulados
FROM usuarios
WHERE puntos_acumulados > 0
ORDER BY puntos_acumulados DESC;
```

---

### **3. Si NO hay datos, crear datos de prueba** 🧪

```sql
-- Aprobar un comprobante existente (reemplaza el ID)
UPDATE comprobantes 
SET estado = 'aprobado',
    fecha_validacion = NOW(),
    puntos_otorgados = FLOOR(monto / 1000)
WHERE id = 1; -- ← Cambiar por un ID real

-- Actualizar puntos del usuario
UPDATE usuarios u
SET u.puntos_acumulados = (
  SELECT COALESCE(SUM(puntos_otorgados), 0)
  FROM comprobantes
  WHERE usuario_id = u.id AND estado = 'aprobado'
)
WHERE u.id = 29; -- ← Cambiar por tu usuario

-- Crear entrada en historial
INSERT INTO historial_puntos (
  usuario_id,
  tipo_transaccion,
  puntos_movimiento,
  descripcion_detalle
) VALUES (
  29, -- ← Tu usuario ID
  'GANANCIA',
  FLOOR((SELECT monto FROM comprobantes WHERE id = 1) / 1000),
  'Comprobante aprobado'
);
```

---

### **4. Abrir las secciones en el Dashboard** 👆

Las secciones están **colapsadas por defecto**. Haz click en:
- "Historial de Puntos" → Se abre
- "Mis Compras Verificadas" → Se abre

---

## ✅ **Cambios que YA Apliqué:**

### **Archivo:** `src/app/api/usuarios/[id]/historial-puntos/route.ts`
```typescript
// ✅ CORREGIDO: tabla canjes_premios (antes canjes_confirmados)
// ✅ CORREGIDO: campo fecha_validacion (antes fecha_aprobacion)
// ✅ CORREGIDO: campo cliente_id en canjes
```

### **Archivo:** `src/app/api/usuarios/[id]/compras-verificadas/route.ts`
```typescript
// ✅ CORREGIDO: campo fecha_validacion (antes fecha_aprobacion)
```

---

## 🧪 **Prueba Completa:**

### **Paso 1:** Reiniciar servidor
```bash
npm run dev
```

### **Paso 2:** Login como usuario
```
http://localhost:3000/login
```

### **Paso 3:** Ir al dashboard
```
http://localhost:3000/dashboard
```

### **Paso 4:** Hacer scroll hasta ver las secciones

### **Paso 5:** Click en cada sección para expandirlas

### **Paso 6:** Si aparecen vacías, verificar datos en BD

---

## 📊 **Estructura de Datos:**

### **Historial de Puntos:**
```typescript
{
  id: number,
  fecha: string,          // fecha_validacion de comprobante
  tipo: 'GANANCIA' | 'GASTO',
  puntos: number,
  descripcion: string
}
```

### **Compras Verificadas:**
```typescript
{
  id: number,
  fecha_aprobacion: string,
  monto: number,
  descripcion: string,
  puntos_otorgados: number
}
```

---

## 🎯 **Checklist:**

- [ ] Servidor reiniciado
- [ ] Usuario tiene comprobantes aprobados
- [ ] Usuario tiene puntos > 0
- [ ] Secciones expandidas (click en ellas)
- [ ] Ver datos en las tablas

---

## 🆘 **Si Sigue Sin Funcionar:**

Verifica los logs del servidor:
```bash
# Busca errores en la consola cuando cargas el dashboard
# Deberías ver:
📈 Historial de puntos cargado: [array de datos]
🛒 Compras verificadas cargadas: [array de datos]
```

Si ves errores, compártelos para ayudarte.

---

**✅ Todo ya está corregido en el código. Solo falta reiniciar el servidor.**
