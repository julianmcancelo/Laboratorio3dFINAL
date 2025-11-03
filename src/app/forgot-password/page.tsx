'use client';

import { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
      <div className="w-full max-w-xs">
        {/* Card principal */}
        <div className="rounded-xl p-5 shadow-2xl border-2" style={{background: 'rgba(45, 27, 78, 0.6)', borderColor: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(20px)'}}>
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.2)'}}>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-400 text-xs">
              Ingresa tu email
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 text-sm rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)'}}
                disabled={loading}
              />
            </div>

            {/* Mensajes */}
            {message && (
              <div className="p-3 rounded-xl" style={{background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                <p className="text-xs text-green-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Link de desarrollo */}
            {resetLink && (
              <div className="p-4 rounded-xl" style={{background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)'}}>
                <p className="text-xs text-orange-400 mb-2">⚠️ SOLO DESARROLLO:</p>
                <Link href={resetLink} className="text-sm text-purple-400 hover:underline break-all">
                  {resetLink}
                </Link>
              </div>
            )}

            {/* Botones */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white'}}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                ← Volver al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
