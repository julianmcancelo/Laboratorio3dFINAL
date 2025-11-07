'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState(''); // Solo para desarrollo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setResetLink('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Si el email existe, recibirás un enlace de recuperación');
        
        // Solo en desarrollo
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
      } else {
        setError(data.error || 'Error al procesar solicitud');
      }
    } catch (err) {
      setError('Error de conexión');
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
                ¿Olvidaste tu contraseña?
              </span>
            </h1>
            <p className="text-[#a0a0a0] text-lg mb-8">
              No te preocupes, te ayudaremos a recuperarla
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">Recuperación</h3>
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-full">RÁPIDO</span>
                      </div>
                      <p className="text-[#a0a0a0] text-sm">Recibí un enlace en tu email</p>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Email Seguro</h3>
                  <p className="text-[#888888] text-xs flex-1">Enlace único y temporal</p>
                  <div className="text-2xl font-black text-blue-500/20 text-right">02</div>
                </div>
              </div>

              {/* Beneficio 3 */}
              <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Protegido</h3>
                  <p className="text-[#888888] text-xs flex-1">Tu cuenta siempre segura</p>
                  <div className="text-2xl font-black text-amber-500/20 text-right">03</div>
                </div>
              </div>

              {/* Beneficio 4 - Ancho completo */}
              <div className="col-span-2 group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base mb-1">¿Necesitas ayuda?</h3>
                      <p className="text-[#888888] text-sm">Contacta a soporte técnico</p>
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
              {message && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">{message}</p>
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
                    Email de tu cuenta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#666666] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={loading}
                  />
                </div>

                {/* Link de desarrollo */}
                {resetLink && (
                  <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <p className="text-orange-400 text-xs mb-2">⚠️ SOLO DESARROLLO:</p>
                    <Link href={resetLink} className="text-sm text-purple-400 hover:underline break-all">
                      {resetLink}
                    </Link>
                  </div>
                )}

                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              {/* Link Volver */}
              <div className="text-center mt-5">
                <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-300 hover:to-purple-400 text-sm font-semibold">
                  ← Volver al inicio de sesión
                </Link>
              </div>

              {/* Divisor */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-sm text-[#666666]">o</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Alternativa: Crear cuenta */}
              <div className="text-center">
                <p className="text-[#a0a0a0] text-sm mb-2">
                  ¿No tenés cuenta?
                </p>
                <Link href="/registro" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-300 hover:to-purple-400 text-sm font-semibold">
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
