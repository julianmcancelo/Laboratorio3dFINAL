'use client';

import React, { useState } from 'react';
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
    nombre_completo: '',
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
    <div className="min-h-screen flex items-center justify-center px-4 py-6" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    }}>
      <div className="w-full max-w-xs">
        {/* Logo compacto */}
        <div className="text-center mb-4">
          <img 
            src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
            alt="Logo Laboratorio 3D" 
            className="h-10 mx-auto mb-3"
          />
          <h1 className="text-xl font-bold text-white mb-1">
            Crear Cuenta
          </h1>
          <p className="text-gray-400 text-xs">
            Recibe 500 puntos de regalo 🎁
          </p>
        </div>

        {/* Card del formulario compacto */}
        <div className="rounded-xl p-5 shadow-2xl" style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Mensaje de error */}
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-3">
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Nombre Completo*
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: 'rgba(15, 25, 35, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* DNI */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  DNI*
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: 'rgba(15, 25, 35, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  placeholder="12345678"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  background: 'rgba(15, 25, 35, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-3">
              {/* Contraseña */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Contraseña* <span className="text-gray-500 text-xs">(mín. 8)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: 'rgba(15, 25, 35, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  placeholder="••••••••"
                />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirmar*
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: 'rgba(15, 25, 35, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Instagram (simplificado) */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                📷 Instagram <span className="text-gray-500">(Opcional)</span>
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  background: 'rgba(15, 25, 35, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="@tuusuario"
              />
            </div>

            {/* Código de Referido compacto */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                🎁 Código Referido <span className="text-gray-500">(Opcional)</span>
              </label>
              <input
                type="text"
                name="codigo_referido"
                value={formData.codigo_referido}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  background: 'rgba(15, 25, 35, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="AMIGO123"
              />
            </div>

            {/* Botón de submit compacto */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
              }}
            >
              {loading ? 'Creando...' : '✨ Crear Cuenta'}
            </button>
          </form>

          {/* Link a login compacto */}
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Link volver al inicio compacto */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-xs flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}
