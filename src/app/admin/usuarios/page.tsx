'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nombre_completo: string;
  dni: string;
  puntos_acumulados: number;
  created_at: string;
  email: string;
}

export default function GestionarUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [aprobando, setAprobando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'error'} | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('light-mode');
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios/pendientes');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (usuarioId: number) => {
    setAprobando(usuarioId);
    setMensaje(null);

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/aprobar`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ texto: 'Usuario aprobado para realizar canjes', tipo: 'success' });
        cargarUsuarios();
      } else {
        setMensaje({ texto: data.error || 'Error al aprobar', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setAprobando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-orange-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-orange-600 mx-auto opacity-20"></div>
          </div>
          <p className="text-white font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --main-bg: #0a0a0f;
          --main-text: #ffffff;
          --heading-text: #ffffff;
          --muted-text: #9ca3af;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glassmorphism-light {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
        {/* Aurora Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <main className="glassmorphism w-full max-w-6xl mx-auto rounded-3xl shadow-2xl relative">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>Aprobar Clientes para Canje</h1>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>Autoriza a los clientes para realizar su primer canje de premios</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="glassmorphism-light hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                ← Volver al Panel
              </button>
            </div>

            {mensaje && (
              <div className={`px-4 py-3 rounded-xl mb-6 ${mensaje.tipo === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-300' : 'bg-red-500/10 border border-red-500/50 text-red-300'}`}>
                {mensaje.texto}
              </div>
            )}

            {/* Lista de usuarios pendientes */}
            {usuarios.length === 0 ? (
              <div className="glassmorphism-light rounded-2xl p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">¡No hay clientes pendientes!</h2>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>
                  Todos los clientes han sido aprobados para realizar canjes
                </p>
              </div>
            ) : (
              <div className="glassmorphism-light rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-semibold">Nombre Completo</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">DNI</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Email</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Puntos</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Registro</th>
                        <th className="text-center p-4 text-gray-300 font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4 text-white font-semibold">{usuario.nombre_completo}</td>
                          <td className="p-4 text-gray-300 font-mono">{usuario.dni}</td>
                          <td className="p-4 text-gray-300 text-sm">{usuario.email}</td>
                          <td className="p-4 text-yellow-400 font-mono">{usuario.puntos_acumulados.toLocaleString()}</td>
                          <td className="p-4 text-gray-400 text-sm">
                            {new Date(usuario.created_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => aprobarUsuario(usuario.id)}
                              disabled={aprobando === usuario.id}
                              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                            >
                              {aprobando === usuario.id ? '⏳ Aprobando...' : '✅ Aprobar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
