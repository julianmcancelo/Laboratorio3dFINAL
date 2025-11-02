'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MovimientoPuntos {
  historial_id: number;
  fecha_transaccion: string;
  tipo_transaccion: string;
  puntos_movimiento: number;
  descripcion_detalle: string;
  nombre_usuario_afectado: string;
  email_usuario_afectado: string;
}

export default function HistorialPuntos() {
  const router = useRouter();
  const [movimientos, setMovimientos] = useState<MovimientoPuntos[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    document.documentElement.classList.remove('light-mode');
    cargarHistorial();
  }, [paginaActual]);

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`/api/admin/historial?pagina=${paginaActual}`);
      if (response.ok) {
        const data = await response.json();
        setMovimientos(data.movimientos);
        setTotalPaginas(data.totalPaginas);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'compra':
      case 'referido':
      case 'manual_admin':
        return 'text-green-400';
      case 'canje':
      case 'ajuste_negativo':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'compra':
        return '🛒';
      case 'canje':
        return '🎁';
      case 'referido':
        return '👥';
      case 'manual_admin':
        return '⚙️';
      default:
        return '📝';
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
          <p className="text-white font-medium">Cargando historial...</p>
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

        <main className="glassmorphism w-full max-w-7xl mx-auto rounded-3xl shadow-2xl relative">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>Historial de Movimientos de Puntos</h1>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>Auditoría completa de todas las transacciones del sistema</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="glassmorphism-light hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                ← Volver al Panel
              </button>
            </div>

            {/* Tabla de historial */}
            <div className="glassmorphism-light rounded-xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-semibold">Fecha</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Usuario</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Tipo</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Puntos</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No hay movimientos registrados
                        </td>
                      </tr>
                    ) : (
                      movimientos.map((mov) => (
                        <tr key={mov.historial_id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4 text-gray-300 text-sm">
                            {new Date(mov.fecha_transaccion).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{mov.nombre_usuario_afectado}</div>
                            <div className="text-xs text-gray-400">{mov.email_usuario_afectado}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getTipoIcon(mov.tipo_transaccion)}</span>
                              <span className="text-sm text-gray-300 capitalize">{mov.tipo_transaccion.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className={`p-4 font-mono font-bold ${getTipoColor(mov.tipo_transaccion)}`}>
                            {mov.puntos_movimiento > 0 ? '+' : ''}{mov.puntos_movimiento.toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-gray-300">
                            {mov.descripcion_detalle || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                  className="glassmorphism-light hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all"
                >
                  ← Anterior
                </button>
                <span className="text-white px-4">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="glassmorphism-light hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
