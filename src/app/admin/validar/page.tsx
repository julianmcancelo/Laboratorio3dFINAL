'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Comprobante {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  monto: number;
  descripcion: string;
  comprobante_base64: string;
  tipo_archivo: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_carga: string;
}

export default function ValidarComprobantes() {
  const router = useRouter();
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [puntosEditar, setPuntosEditar] = useState<{[key: number]: number}>({});

  useEffect(() => {
    // Asegurar modo dark por defecto
    document.documentElement.classList.remove('light-mode');
    cargarComprobantes();
  }, []);

  const cargarComprobantes = async () => {
    try {
      const response = await fetch('/api/admin/comprobantes');
      if (response.ok) {
        const data = await response.json();
        const comps = data.comprobantes || [];
        setComprobantes(comps);
        
        // Inicializar puntos sugeridos según documento: 1 punto = $1.000
        const puntosIniciales: {[key: number]: number} = {};
        comps.forEach((comp: Comprobante) => {
          if (comp.estado === 'pendiente') {
            puntosIniciales[comp.id] = Math.floor(Number(comp.monto) / 1000);
          }
        });
        setPuntosEditar(puntosIniciales);
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarComprobante = async (id: number, aprobar: boolean) => {
    setProcesando(id);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/comprobantes', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          comprobante_id: id,
          accion: aprobar ? 'aprobar' : 'rechazar',
          observaciones: aprobar ? `Aprobado - ${puntosEditar[id] || 0} puntos otorgados` : 'Rechazado por el administrador'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(aprobar 
            ? `✅ Comprobante aprobado!\n\nPuntos otorgados: ${data.puntos_otorgados}\nNivel: ${data.nuevo_nivel}`
            : '❌ Comprobante rechazado'
          );
        }
        await cargarComprobantes();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo procesar'}`);
      }
    } catch (error) {
      console.error('Error al validar:', error);
    } finally {
      setProcesando(null);
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
          <p className="text-white font-medium">Cargando comprobantes...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando validación</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estilos específicos */}
      <style jsx global>{`
        :root {
          --main-bg: #0a0a0f;
          --main-text: #ffffff;
          --heading-text: #ffffff;
          --muted-text: #9ca3af;
          --card-bg: rgba(255, 255, 255, 0.05);
          --card-light-bg: rgba(255, 255, 255, 0.08);
          --card-border: rgba(255, 255, 255, 0.1);
          --accent-green: #10b981;
          --accent-red: #ef4444;
          --accent-yellow: #f59e0b;
        }
        
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glassmorphism-light {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden transition-colors duration-300 p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
        {/* Aurora Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main Container */}
        <main className="glassmorphism w-full max-w-7xl mx-auto rounded-3xl shadow-2xl relative transition-all duration-300">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>Validar Comprobantes</h1>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>Revisa y aprueba comprobantes pendientes</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="glassmorphism-light hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                ← Volver al Panel
              </button>
            </div>

            {/* Comprobantes Pendientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {comprobantes.filter(c => c.estado === 'pendiente').length === 0 ? (
                <div className="col-span-full glassmorphism-light rounded-2xl p-6 sm:p-8 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                  <p className="text-lg sm:text-xl font-semibold" style={{color: 'var(--main-text)'}}>¡No hay comprobantes pendientes!</p>
                  <p className="text-sm sm:text-base mt-2" style={{color: 'var(--muted-text)'}}>Todos los comprobantes han sido procesados</p>
                </div>
              ) : (
                comprobantes
                  .filter(c => c.estado === 'pendiente')
                  .map((comp) => (
                    <div
                      key={comp.id}
                      className="glassmorphism-light rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-all"
                    >
                      {/* Usuario */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {comp.usuario_nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{comp.usuario_nombre}</p>
                          <p className="text-gray-300 text-sm">ID: {comp.usuario_id}</p>
                        </div>
                      </div>

                      {/* Monto */}
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm">Monto</p>
                        <p className="text-2xl font-bold text-green-400">${Number(comp.monto).toFixed(2)}</p>
                      </div>

                      {/* Descripción */}
                      {comp.descripcion && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm">Descripción</p>
                          <p className="text-white">{comp.descripcion}</p>
                        </div>
                      )}

                      {/* Imagen del comprobante */}
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm mb-2">Comprobante</p>
                        <img
                          src={comp.comprobante_base64}
                          alt="Comprobante"
                          className="w-full h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(comp.comprobante_base64, '_blank')}
                        />
                      </div>

                      {/* Fecha */}
                      <p className="text-gray-400 text-xs mb-4">
                        Subido: {new Date(comp.fecha_carga).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* Puntos a otorgar (calculado automáticamente) */}
                      <div className="mb-4">
                        <label className="text-gray-300 text-sm block mb-2">
                          Puntos a otorgar (automático)
                        </label>
                        <div className="w-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500 text-white text-2xl font-bold px-4 py-4 rounded-xl text-center">
                          ⭐ {Math.floor(Number(comp.monto) / 1000)} pts
                        </div>
                        <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-xs">
                            📐 Cálculo: ${Number(comp.monto).toLocaleString()} ÷ 1.000 = {Math.floor(Number(comp.monto) / 1000)} puntos
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            📋 Según documento oficial: 1 punto = $1.000
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => validarComprobante(comp.id, true)}
                          disabled={procesando === comp.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {procesando === comp.id ? '⏳' : '✅'} Aprobar
                        </button>
                        <button
                          onClick={() => validarComprobante(comp.id, false)}
                          disabled={procesando === comp.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {procesando === comp.id ? '⏳' : '❌'} Rechazar
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Comprobantes Procesados */}
            {comprobantes.filter(c => c.estado !== 'pendiente').length > 0 && (
              <div className="mt-8 sm:mt-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{color: 'var(--heading-text)'}}>Historial Procesados</h2>
                <div className="glassmorphism-light rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-semibold">Usuario</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Monto</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Estado</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comprobantes
                          .filter(c => c.estado !== 'pendiente')
                          .map((comp) => (
                            <tr key={comp.id} className="border-t border-white/10 hover:bg-white/5">
                              <td className="p-4 text-white">{comp.usuario_nombre}</td>
                              <td className="p-4 text-white">${Number(comp.monto).toFixed(2)}</td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    comp.estado === 'aprobado'
                                      ? 'bg-green-600/20 text-green-400'
                                      : 'bg-red-600/20 text-red-400'
                                  }`}
                                >
                                  {comp.estado === 'aprobado' ? '✅ Aprobado' : '❌ Rechazado'}
                                </span>
                              </td>
                              <td className="p-4 text-gray-300 text-sm">
                                {new Date(comp.fecha_carga).toLocaleDateString('es-AR')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
