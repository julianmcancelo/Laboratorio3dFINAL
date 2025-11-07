'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Store inline para evitar problemas de importación
interface AuthState {
  usuario: any;
  autenticado: boolean;
  loading: boolean;
  error: string | null;
  registro: (datos: any) => Promise<void>;
}

function useAuthStore(): AuthState {
  const [usuario, setUsuario] = React.useState<any>(null);
  const [autenticado, setAutenticado] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const registro = async (datos: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Auto-login después del registro
      const loginResponse = await fetch('/api/auth/login-prisma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: datos.email, 
          password: datos.password, 
          recordarme: false 
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Error al iniciar sesión después del registro');
      }

      // Guardar session_id en localStorage
      if (loginData.session_id) {
        localStorage.setItem('session_id', loginData.session_id);
      }

      setUsuario(loginData.usuario);
      setAutenticado(true);

    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { usuario, autenticado, loading, error, registro };
}

export default function RegistroPage() {
  const router = useRouter();
  const { registro } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
    password_confirmation: '',
    telefono: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    telegram: '',
    codigo_referido: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarExtras, setMostrarExtras] = useState(false);

  // Auto-expande cuando los 3 campos básicos están completos
  useEffect(() => {
    const basicsOk = formData.nombre.trim().length > 0 
      && formData.apellido.trim().length > 0 
      && formData.dni.trim().length > 0;
    if (basicsOk && !mostrarExtras) setMostrarExtras(true);
  }, [formData.nombre, formData.apellido, formData.dni, mostrarExtras]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await registro({
        ...formData,
        nombre_completo: `${formData.nombre} ${formData.apellido}`.trim(),
        acepta_terminos: true,
        acepta_privacidad: true,
      });
      // Mostrar mensaje de cuenta pendiente de validación
      alert('¡Registro exitoso! 🎉\n\nTu cuenta ha sido creada y recibiste 500 puntos de bienvenida ($500.000).\n\n⚠️ Tu cuenta está pendiente de validación por un administrador.\n\nRecibi rás un email cuando tu cuenta sea activada.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#e0e0e0]">
      <main className="w-full max-w-6xl mx-auto pt-28 pb-12 px-4">
        <section className="text-center mb-12">
          {/* Logo */}
          <img 
            src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
            alt="Logo Laboratorio 3D" 
            className="h-16 mx-auto mb-8"
          />
          
          {/* Título */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              Crear Cuenta
            </span>
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto text-[#a0a0a0]">
            Únete y recibe <strong className="text-white">500 puntos de bienvenida</strong> ($500.000)
          </p>
        </section>

        {/* Card del formulario */}
        <div className="max-w-3xl mx-auto rounded-2xl p-6 backdrop-blur-sm bg-white/5 border border-white/10">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Tu nombre"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Tu apellido"
              />
            </div>

            {/* DNI */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">DNI</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="12345678"
              />
            </div>

            {/* Sección expandible animada */}
            <div
              className={`md:col-span-2 overflow-hidden transition-all duration-500 ${mostrarExtras ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
              aria-hidden={!mostrarExtras}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Contraseña */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Contraseña <span className="text-[#666666]">(mín. 8 caracteres)</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Instagram (opcional) */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Instagram <span className="text-[#666666]">(opcional)</span></label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="@tuusuario"
                  />
                </div>

                {/* Código de Referido */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-[#e0e0e0]">Código de Referido <span className="text-[#666666]">(opcional)</span></label>
                  <input
                    type="text"
                    name="codigo_referido"
                    value={formData.codigo_referido}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="AMIGO123"
                  />
                </div>

                {/* Botón de submit */}
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-5 text-lg font-bold rounded-full bg-[#3498db] text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-[#2980b9] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center pt-4 border-t border-white/10">
            <p className="text-[#a0a0a0] text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/login" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 font-semibold hover:from-indigo-300 hover:to-purple-400 transition-all"
              >
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="text-[#a0a0a0] hover:text-white transition-colors text-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
