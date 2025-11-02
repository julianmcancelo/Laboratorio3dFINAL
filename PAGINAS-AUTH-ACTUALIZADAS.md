# 🔐 Páginas de Autenticación con Tema Oscuro

## Instrucciones

Reemplaza el contenido de los siguientes archivos con el código proporcionado:

---

## 📄 **1. LOGIN - `src/app/login/page.tsx`**

```tsx
/**
 * 🔐 Página de Login - Laboratorio 3D (Tema Oscuro)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, recordarme);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4">
      {/* Header con logo */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#2a2a2a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
              alt="Logo Laboratorio 3D" 
              className="h-10"
            />
            <span className="font-bold text-xl text-white hidden sm:inline">Laboratorio 3D</span>
          </Link>
        </div>
      </div>

      {/* Formulario de login */}
      <div className="w-full max-w-md mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-[#a0a0a0]">
            Ingresá a tu cuenta para acceder a tus premios
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-white/10">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Recordarme y Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="w-4 h-4 rounded border-[#444444] bg-[#303030] text-[#3498db] focus:ring-[#3498db] focus:ring-offset-0"
                />
                <span className="text-sm text-[#a0a0a0]">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-[#3498db] hover:text-[#2980b9] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#3498db] text-white rounded-lg font-semibold hover:bg-[#2980b9] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-[#a0a0a0]">
              ¿No tenés cuenta?{' '}
              <Link href="/registro" className="text-[#3498db] hover:text-[#2980b9] font-semibold transition-colors">
                Registrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#a0a0a0] hover:text-white transition-colors text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 📄 **2. REGISTRO - `src/app/registro/page.tsx`**

Crear el archivo: `src/app/registro/page.tsx`

```tsx
/**
 * 📝 Página de Registro - Laboratorio 3D (Tema Oscuro)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RegistroPage() {
  const router = useRouter();
  const { registrar } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    password_confirmation: '',
    dni: '',
    telefono: '',
    instagram: '',
    codigo_referido: '',
    acepta_terminos: false,
    acepta_privacidad: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acepta_terminos || !formData.acepta_privacidad) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      await registrar(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 py-12">
      {/* Header con logo */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#2a2a2a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
              alt="Logo Laboratorio 3D" 
              className="h-10"
            />
            <span className="font-bold text-xl text-white hidden sm:inline">Laboratorio 3D</span>
          </Link>
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="w-full max-w-2xl mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Creá tu cuenta
          </h2>
          <p className="text-[#a0a0a0]">
            Unite al programa de premios y empezá a acumular puntos
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-white/10">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nombre completo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              {/* DNI */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="12345678"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Confirmar contraseña *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Instagram (opcional)
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="@tu_usuario"
                />
              </div>

              {/* Código de referido */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                  Código de referido (opcional)
                </label>
                <input
                  type="text"
                  name="codigo_referido"
                  value={formData.codigo_referido}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#303030] border border-[#444444] rounded-lg text-[#e0e0e0] placeholder-[#888888] focus:outline-none focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all"
                  placeholder="Ingresá el código si te invitaron"
                />
                <p className="mt-1 text-sm text-[#a0a0a0]">
                  💡 Si alguien te recomendó, ambos ganarán puntos extra
                </p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acepta_terminos"
                  checked={formData.acepta_terminos}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-[#444444] bg-[#303030] text-[#3498db] focus:ring-[#3498db]"
                  required
                />
                <span className="text-sm text-[#a0a0a0]">
                  Acepto los{' '}
                  <a href="#" className="text-[#3498db] hover:text-[#2980b9]">
                    Términos y Condiciones
                  </a>
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acepta_privacidad"
                  checked={formData.acepta_privacidad}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-[#444444] bg-[#303030] text-[#3498db] focus:ring-[#3498db]"
                  required
                />
                <span className="text-sm text-[#a0a0a0]">
                  Acepto la{' '}
                  <a href="#" className="text-[#3498db] hover:text-[#2980b9]">
                    Política de Privacidad
                  </a>
                </span>
              </label>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#3498db] text-white rounded-lg font-semibold hover:bg-[#2980b9] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-[#a0a0a0]">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-[#3498db] hover:text-[#2980b9] font-semibold transition-colors">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#a0a0a0] hover:text-white transition-colors text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ **Cómo Aplicar los Cambios:**

1. **Copia el código del Login** y reemplaza todo el contenido de `src/app/login/page.tsx`

2. **Crea la carpeta de registro:**
   - Crea la carpeta: `src/app/registro`
   - Dentro crea el archivo: `page.tsx`
   - Pega el código del Registro

3. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

---

## 🎨 **Características del Nuevo Diseño:**

✅ **Tema oscuro consistente** (#181818, #2a2a2a)  
✅ **Navbar con logo** en ambas páginas  
✅ **Inputs con estilo** oscuro (#303030)  
✅ **Botones azules** (#3498db) consistentes  
✅ **Validaciones visuales**  
✅ **Links entre páginas**  
✅ **Responsive design**  
✅ **Sin dependencias problemáticas** (no usa lucide-react)  

---

**🚀 ¡Listo para aplicar!**
