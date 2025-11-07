'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Animación custom para el alert
const styleSheet = typeof document !== 'undefined' ? (() => {
  if (!document.getElementById('login-alert-styles')) {
    const style = document.createElement('style');
    style.id = 'login-alert-styles';
    style.textContent = `
      @keyframes alert-bounce-in {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-bounce-once {
        animation: alert-bounce-in 0.6s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
})() : null;

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
  const [showGoogleAlert, setShowGoogleAlert] = useState(false);

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
    <div className="min-h-screen bg-[#181818]">
      {/* Header oscuro con logo */}
      <div className="bg-[#202020] py-6 border-b border-white/10">
        <div className="container mx-auto px-4">
          <img 
            src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
            alt="Logo Laboratorio 3D" 
            className="h-20"
          />
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex justify-center px-4 py-16">
        <div className="flex gap-8 max-w-5xl w-full">
          {/* Columna izquierda - Título y Beneficios */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
                Ingresá tu e-mail o teléfono
              </span>
            </h1>
            <p className="text-[#a0a0a0] text-lg mb-8">
              para iniciar sesión
            </p>

            {/* Beneficios del sistema - Estilo Grid */}
            <div className="grid grid-cols-2 gap-3 mt-10">
              {/* Beneficio 1 - Grande */}
              <div className="col-span-2 group relative p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">500 Puntos</h3>
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-full">GRATIS</span>
                      </div>
                      <p className="text-[#a0a0a0] text-sm">De bienvenida = $500.000</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-purple-500/20">01</div>
                </div>
              </div>

              {/* Beneficio 2 */}
              <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">10% Back</h3>
                  <p className="text-[#888888] text-xs flex-1">En cada compra</p>
                  <div className="text-2xl font-black text-blue-500/20 text-right">02</div>
                </div>
              </div>

              {/* Beneficio 3 */}
              <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Premios</h3>
                  <p className="text-[#888888] text-xs flex-1">Canje exclusivo</p>
                  <div className="text-2xl font-black text-amber-500/20 text-right">03</div>
                </div>
              </div>

              {/* Beneficio 4 - Ancho completo */}
              <div className="col-span-2 group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base mb-1">Invitá amigos</h3>
                      <p className="text-[#888888] text-sm">Y ganá puntos extra</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-500/20">04</div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="w-full max-w-md">
            <div className="rounded-2xl p-8 backdrop-blur-sm bg-white/5 border border-white/10">

              {/* Mensaje de éxito */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              )}

              {/* Mensaje de error */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
                    E-mail o teléfono
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-5">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Botón Continuar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Iniciando...' : 'Continuar'}
                </button>
              </form>

              {/* Link Crear cuenta */}
              <div className="text-center mt-5">
                <Link href="/registro" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-300 hover:to-purple-400 text-sm font-semibold">
                  Crear cuenta
                </Link>
              </div>

              {/* Divisor */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-sm text-[#666666]">o</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Botón Google - Deshabilitado temporalmente */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setShowGoogleAlert(true);
                  setTimeout(() => setShowGoogleAlert(false), 4000);
                }}
                className="w-full py-3 border border-white/10 rounded-xl text-white/60 bg-white/5 cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Iniciar sesión con Google
              </button>

              {/* Alert bonito para Google */}
              {showGoogleAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-2xl shadow-2xl max-w-sm mx-4 animate-bounce-once">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🚧</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg mb-1 flex items-center gap-2">
                          <span className="text-xl">🔧</span> Inicio con Google deshabilitado
                        </p>
                        <p className="text-sm opacity-90 flex items-center gap-1">
                          <span>📧</span> Por favor, usá tu email y contraseña para ingresar.
                          <span className="ml-1">🙏</span> ¡Gracias por tu paciencia!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Link problema de seguridad */}
              <div className="mt-6 text-center">
                <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Tengo un problema de seguridad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}