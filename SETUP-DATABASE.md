# 🗄️ Configuración de Base de Datos

## Pasos para configurar la base de datos

### 1️⃣ Crear la estructura de tablas

Ejecuta el script principal que crea todas las tablas:

```bash
mysql -u root -p jcancelo_laboratorio3d < src/lib/create-tables.sql
```

O desde el cliente MySQL:

```sql
USE jcancelo_laboratorio3d;
SOURCE src/lib/create-tables.sql;
```

### 2️⃣ Insertar datos de ejemplo (Premios)

Ejecuta el script de seed para agregar premios de ejemplo:

```bash
mysql -u root -p jcancelo_laboratorio3d < src/lib/seed-premios.sql
```

O desde el cliente MySQL:

```sql
USE jcancelo_laboratorio3d;
SOURCE src/lib/seed-premios.sql;
```

---

## 🎁 Premios de Ejemplo Incluidos

El seed incluye 6 premios de ejemplo:

| Nivel | Premio | Puntos | Stock |
|-------|--------|--------|-------|
| 🥉 Bronce | 1 Kg Filamento PLA Básico | 1,500 | 50 |
| 🥉 Bronce | 3 Kg Filamento Premium | 5,000 | 30 |
| 🥉 Bronce | Set de Herramientas 3D | 8,000 | 25 |
| 🥈 Plata | Resina 1L Estándar | 12,000 | 15 |
| 🥈 Plata | Hotend de Alta Temperatura | 18,000 | 10 |
| 🥇 Oro | Placa de Impresión Magnética | 22,000 | 20 |

---

## ✅ Verificación

Para verificar que todo se instaló correctamente:

```sql
-- Ver todas las tablas
SHOW TABLES;

-- Ver premios
SELECT * FROM premios;

-- Ver estructura de tabla premios
DESCRIBE premios;
```

---

## 🔧 Troubleshooting

### Error: "Table 'premios' doesn't exist"

1. Verifica que estás en la base de datos correcta:
```sql
USE jcancelo_laboratorio3d;
```

2. Ejecuta el script de creación de tablas:
```sql
SOURCE src/lib/create-tables.sql;
```

### Error: "Access denied"

Verifica tus credenciales en `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=jcancelo_laboratorio3d
```

### Error de conexión en las APIs

1. Verifica que el servidor MySQL esté corriendo
2. Verifica que el archivo `.env` tenga las credenciales correctas
3. Verifica que la base de datos existe:
```sql
SHOW DATABASES LIKE 'jcancelo%';
```

---

## 📝 Notas

- Los premios tienen imágenes placeholder en `/images/premios/`
- Puedes modificar los premios desde el panel admin: `/admin/premios`
- Los premios con `activo = 0` no aparecen en el catálogo público
