'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Store inline para evitar problemas de importación
interface AuthState {
  usuario: any;
  autenticado: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, recordarme?: boolean) => Promise<void>;
}

function useAuthStore(): AuthState {
  const [usuario, setUsuario] = React.useState<any>(null);
  const [autenticado, setAutenticado] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = async (email: string, password: string, recordarme = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login-prisma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, recordarme }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar session_id en localStorage
      if (data.session_id) {
        localStorage.setItem('session_id', data.session_id);
      }

      setUsuario(data.usuario);
      setAutenticado(true);

    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { usuario, autenticado, loading, error, login };
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('admin') === 'created') {
      setSuccessMessage('¡Administrador creado exitosamente! Ahora puedes iniciar sesión.');
      // Limpiar URL
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, false);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1923 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="rounded-3xl p-8 shadow-2xl" style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
                alt="Logo Laboratorio 3D" 
                className="h-16"
              />
            </div>
            
            {/* Título con badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-white">
                Iniciar Sesión
              </h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                Laboratorio 3D
              </span>
            </div>
            
            <p className="text-gray-400">
              Accede a tu cuenta premium y disfruta tus beneficios
            </p>
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email*
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  background: 'rgba(15, 25, 35, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="tu@email.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña*
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  background: 'rgba(15, 25, 35, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-white text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <Link href="/recuperar" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <p className="text-gray-300">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
              Regístrate
            </Link>
          </p>
        </div>

          {/* Footer con iconos */}
          <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Seguro</span>
            </div>
            <span className="text-gray-600">·</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Rápido</span>
            </div>
            <span className="text-gray-600">·</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Confiable</span>
            </div>
          </div>
        </div>

        {/* Link volver al inicio */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}