# 🛡️ Guía de Testing de Seguridad

## Preparación

1. **Inicia el servidor:**
```bash
npm run dev
```

---

## Test 1: Verificar Headers Automáticamente ⚡

**Método más rápido y recomendado**

```bash
node tests/test-security-headers.js
```

Esto verificará todos los headers de seguridad automáticamente.

---

## Test 2: Verificar Headers Manualmente 🔍

### Opción A - Navegador
1. Abre http://localhost:3000
2. Presiona F12
3. Ve a la pestaña **Network**
4. Recarga la página (F5)
5. Click en el request principal
6. Ve a la pestaña **Headers**
7. Busca los headers de seguridad

### Opción B - Comando curl
```bash
curl -I http://localhost:3000
```

---

## Test 3: Protección contra XSS 🚨

### Test Manual
1. Abre `tests/xss-test.html` en tu navegador
2. Intenta los botones/links
3. **Resultado esperado:** NO deberían aparecer alertas de JavaScript

### Test en tu aplicación
Intenta inyectar código en campos de formulario:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**Resultado esperado:** El código se muestra como texto, no se ejecuta

---

## Test 4: Protección contra Clickjacking 🎯

1. Abre `tests/clickjacking-test.html` en tu navegador
2. **Resultado esperado:** 
   - El iframe debería estar VACÍO o mostrar error
   - En la consola deberías ver: `Refused to display ... in a frame`

**Si el sitio se carga en el iframe = VULNERABLE**

---

## Test 5: Content Security Policy (CSP) 📜

1. Abre http://localhost:3000
2. Abre DevTools (F12) > Console
3. Intenta ejecutar:
```javascript
eval('alert("CSP Test")')
```
4. **Resultado esperado:** Error de CSP (bloqueado)

---

## Test 6: Herramientas Online (Cuando esté en producción) 🌐

### SecurityHeaders.com
```
https://securityheaders.com/?q=tu-dominio.com
```
Califica tu sitio de F a A+

### Mozilla Observatory
```
https://observatory.mozilla.org/
```
Análisis completo de seguridad

### SSL Labs (Si usas HTTPS)
```
https://www.ssllabs.com/ssltest/
```

---

## Pruebas Adicionales Avanzadas

### 1. Test de MIME Sniffing
Intenta cargar un archivo .txt con contenido JavaScript:
- Debería mostrarse como texto, no ejecutarse

### 2. Test de Referrer Policy
```javascript
// En DevTools Console
console.log(document.referrer);
```

### 3. Permissions Policy
Intenta acceder a la cámara:
```javascript
navigator.mediaDevices.getUserMedia({video: true})
  .catch(err => console.log('Bloqueado:', err));
```

---

## 🎯 Checklist de Verificación

- [ ] Headers presentes en todas las páginas
- [ ] XSS bloqueado en formularios
- [ ] Iframe bloqueado (clickjacking)
- [ ] CSP bloquea eval() y scripts externos no autorizados
- [ ] No se puede acceder a cámara/micrófono
- [ ] Calificación A+ en securityheaders.com (en producción)

---

## 🚀 Cuando despliegues a producción

1. Descomenta HSTS en `next.config.js` (solo si usas HTTPS)
2. Ajusta CSP para tu dominio real
3. Ejecuta tests en el dominio de producción
4. Verifica con herramientas online

---

## 📚 Más Información

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://content-security-policy.com/)
