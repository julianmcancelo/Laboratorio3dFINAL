'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: params.token,
          newPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Error al resetear contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
        <div className="w-full max-w-xs">
          <div className="rounded-xl p-5 text-center shadow-2xl border-2" style={{background: 'rgba(45, 27, 78, 0.6)', borderColor: 'rgba(34, 197, 94, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-green-500">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-400 mb-4">
              Redirigiendo al login...
            </p>
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Ir al login ahora →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
      <div className="w-full max-w-xs">
        <div className="rounded-xl p-5 shadow-2xl border-2" style={{background: 'rgba(45, 27, 78, 0.6)', borderColor: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(20px)'}}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.2)'}}>
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">
            Nueva contraseña
          </h1>
          <p className="text-gray-400 text-xs">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Nueva contraseña
            </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 text-sm rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)'}}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full px-3 py-2 text-sm rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)'}}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white'}}
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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
