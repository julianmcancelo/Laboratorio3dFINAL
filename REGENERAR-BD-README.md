# 🔄 Guía para Regenerar la Base de Datos

Esta guía explica cómo regenerar completamente la base de datos del sistema Laboratorio 3D desde cero.

## ⚠️ ADVERTENCIA IMPORTANTE

**Este proceso eliminará TODOS los datos existentes en la base de datos.**

Asegúrate de hacer un respaldo antes de continuar si tienes datos que necesitas conservar.

---

## 🚀 Métodos de Regeneración

### Método 1: Usando Node.js (RECOMENDADO)

Este es el método más simple y no requiere tener MySQL instalado en tu sistema.

```bash
npm run db:regenerar
```

Este comando:
- ✅ Se conecta directamente a la base de datos
- ✅ Elimina todas las tablas existentes
- ✅ Crea todas las tablas desde cero
- ✅ Inserta datos iniciales
- ✅ Muestra un resumen de la operación

---

### Método 2: Usando Prisma Push

Otra alternativa es usar Prisma para sincronizar el schema:

```bash
npm run db:push
```

Este comando:
- Usa el archivo `schema.prisma` como fuente
- Sincroniza la estructura de la base de datos
- ⚠️ Puede eliminar datos existentes

**Nota:** Después de usar este método, necesitarás insertar los datos iniciales manualmente.

---

### Método 3: Usando PowerShell (Windows)

Si tienes MySQL Client instalado en tu sistema:

```powershell
.\regenerar-bd.ps1
```

Este script:
- Busca automáticamente la instalación de MySQL
- Ejecuta el archivo SQL completo
- Muestra el progreso en tiempo real

---

### Método 4: Usando phpMyAdmin u otro cliente web

Si prefieres usar una interfaz gráfica:

1. **Accede a phpMyAdmin** desde tu panel de hosting
2. **Selecciona la base de datos:** `jcancelo_laboratorio3d`
3. **Ve a la pestaña "SQL"**
4. **Copia y pega** el contenido completo del archivo:
   ```
   REGENERAR-BASE-DATOS-COMPLETA.sql
   ```
5. **Haz clic en "Ejecutar"**

---

## 📊 ¿Qué se Crea?

Al regenerar la base de datos se crean:

### Tablas Principales

1. **usuarios** - Usuarios del sistema (clientes y administradores)
2. **niveles_lealtad** - Niveles: Bronce, Plata, Oro
3. **premios** - Catálogo de premios canjeables
4. **compras** - Registro de compras de los clientes
5. **canjes_premios** - Historial de canjes realizados
6. **historial_puntos** - Movimientos de puntos de cada usuario
7. **metodos_pago** - Métodos de pago disponibles
8. **configuracion_referidos** - Configuración del sistema de referidos
9. **configuracion_sitio** - Configuración general del sitio
10. **sesiones** - Sesiones activas de usuarios
11. **tokens_recuperacion** - Tokens para recuperación de contraseña

### Datos Iniciales

#### Niveles de Lealtad
- 🥉 **Bronce** - 0 puntos (1.00x multiplicador)
- 🥈 **Plata** - 10,000 puntos (1.10x multiplicador)
- 🥇 **Oro** - 20,000 puntos (1.20x multiplicador)

#### Premios Predeterminados
1. **3kg Filamento Premium** - 1,500 puntos
2. **Cupón $90,000** - 3,000 puntos
3. **Cupón $180,000** - 10,000 puntos (requiere nivel Plata)
4. **Impresora Bambu Lab A1 Mini** - 20,000 puntos (requiere nivel Oro)
5. **Set de Herramientas 3D** - 5,000 puntos
6. **Resina 1L Estándar** - 8,000 puntos (requiere nivel Plata)

#### Métodos de Pago
- Efectivo
- Transferencia Bancaria
- MercadoPago
- Tarjeta de Crédito
- Tarjeta de Débito

#### Usuario Administrador
```
Email: admin@laboratorio3d.com
Contraseña: admin123
Rol: admin
Puntos: 50,000
Nivel: Oro
Código Referido: ADMIN123
```

#### Configuración de Referidos
- Comisión por referido: 10%
- Puntos fijos primera compra: 500
- Sistema activo: Sí

---

## 🔧 Solución de Problemas

### Error: "mysql: command not found" o "no se reconoce como comando"

**Solución:** Usa el Método 1 (Node.js) que no requiere MySQL Client:
```bash
npm run db:regenerar
```

### Error: "Can't connect to MySQL server"

**Verifica:**
1. ✅ Las credenciales en `.env` son correctas
2. ✅ El servidor de base de datos está accesible
3. ✅ El firewall permite conexiones al puerto 3306

### Error: "Access denied for user"

**Solución:**
- Verifica el usuario y contraseña en `.env`
- Asegúrate de que el usuario tiene permisos suficientes

### Error: "Unknown database"

**Solución:**
- Verifica que la base de datos `jcancelo_laboratorio3d` existe
- Si no existe, créala desde tu panel de hosting

---

## 📝 Después de Regenerar

Después de regenerar la base de datos:

1. ✅ **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. ✅ **Verifica que Prisma está sincronizado:**
   ```bash
   npm run prisma:generate
   ```

3. ✅ **Prueba el login de administrador:**
   - Email: `admin@laboratorio3d.com`
   - Contraseña: `admin123`

4. ✅ **Cambia la contraseña del administrador** desde el panel de administración

---

## 🔒 Seguridad

**⚠️ IMPORTANTE:**

1. **Cambia la contraseña del administrador** inmediatamente después de regenerar
2. **No compartas las credenciales** del usuario admin
3. **Haz respaldos regulares** de tu base de datos
4. **No ejecutes este script en producción** sin un respaldo

---

## 🆘 Soporte

Si tienes problemas al regenerar la base de datos:

1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Revisa el archivo `.env` con las credenciales correctas
3. Intenta con diferentes métodos de regeneración
4. Contacta al equipo de soporte técnico

---

## 📄 Archivos Relacionados

- `REGENERAR-BASE-DATOS-COMPLETA.sql` - Script SQL completo
- `regenerar-bd.ps1` - Script de PowerShell para Windows
- `scripts/regenerar-base-datos.js` - Script de Node.js
- `src/lib/prisma/schema.prisma` - Schema de Prisma (fuente de verdad)
- `.env` - Variables de entorno (credenciales de BD)

---

**Última actualización:** 2024
