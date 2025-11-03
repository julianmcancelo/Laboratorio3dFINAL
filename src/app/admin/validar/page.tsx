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
  tipo_producto?: 'filamento' | 'impresora_3d' | 'otros';
  numero_serie?: string;
  marca_modelo?: string;
  referido_por_id?: number;
  referidor_nombre?: string;
  nombre_comprador?: string;
  dni_comprador?: string;
}

export default function ValidarComprobantes() {
  const router = useRouter();
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [puntosEditar, setPuntosEditar] = useState<{[key: number]: number}>({});
  const [expandido, setExpandido] = useState<number | null>(null);

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
                      className="glassmorphism-light rounded-lg p-2 hover:bg-white/20 transition-all"
                    >
                      {/* Header: Usuario + Monto + Fecha + Expandir */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {comp.usuario_nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-xs truncate">{comp.usuario_nombre}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(comp.fecha_carga).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandido(expandido === comp.id ? null : comp.id)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          title="Expandir detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {expandido === comp.id ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            )}
                          </svg>
                        </button>
                        <div className="text-right flex-shrink-0">
                          <p className="text-green-400 font-bold text-lg leading-none">${(Number(comp.monto)/1000).toFixed(0)}k</p>
                          <p className="text-yellow-400 text-xs font-bold">⭐{Math.floor(Number(comp.monto) / 1000)}</p>
                        </div>
                      </div>

                      {/* Info compacta en líneas */}
                      <div className="space-y-1 mb-2">
                        {comp.descripcion && (
                          <p className="text-white text-xs truncate" title={comp.descripcion}>
                            📝 {comp.descripcion}
                          </p>
                        )}
                        
                        {comp.tipo_producto && (
                          <p className="text-blue-400 text-xs">
                            {comp.tipo_producto === 'filamento' && '🧵 Filamento'}
                            {comp.tipo_producto === 'impresora_3d' && `🖨️ ${comp.marca_modelo || 'Impresora'} ${comp.numero_serie ? `• ${comp.numero_serie}` : ''}`}
                            {comp.tipo_producto === 'otros' && '📦 Otros'}
                          </p>
                        )}

                        {comp.referido_por_id && (
                          <p className="text-xs px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 rounded inline-block">
                            🎁 <span className="text-white">{comp.nombre_comprador || 'Sin nombre'}</span>
                            {comp.dni_comprador && <span className="text-gray-400"> ({comp.dni_comprador})</span>}
                            <span className="text-gray-400"> → </span>
                            <span className="text-purple-300 font-bold">{comp.referidor_nombre || `ID${comp.referido_por_id}`}</span>
                            {Number(comp.monto) >= 500000 && <span className="text-green-400 font-bold ml-1">+50pts</span>}
                          </p>
                        )}
                      </div>

                      {/* Imagen comprobante */}
                      <img
                        src={comp.comprobante_base64}
                        alt="Comprobante"
                        className={`w-full object-cover rounded cursor-pointer hover:opacity-80 transition-all mb-2 ${
                          expandido === comp.id ? 'h-64' : 'h-24'
                        }`}
                        onClick={() => window.open(comp.comprobante_base64, '_blank')}
                      />

                      {/* Detalles expandidos */}
                      {expandido === comp.id && (
                        <div className="mb-2 p-2 bg-black/20 rounded space-y-1">
                          <p className="text-white text-xs">
                            <span className="text-gray-400">ID Usuario:</span> {comp.usuario_id}
                          </p>
                          <p className="text-white text-xs">
                            <span className="text-gray-400">Monto completo:</span> ${Number(comp.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-white text-xs">
                            <span className="text-gray-400">Cálculo puntos:</span> ${Number(comp.monto).toLocaleString()} ÷ 1.000 = {Math.floor(Number(comp.monto) / 1000)} pts
                          </p>
                          {comp.descripcion && (
                            <p className="text-white text-xs">
                              <span className="text-gray-400">Descripción completa:</span> {comp.descripcion}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs">
                            <span className="text-gray-400">Fecha:</span> {new Date(comp.fecha_carga).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Botones */}
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => validarComprobante(comp.id, true)}
                          disabled={procesando === comp.id}
                          className="bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {procesando === comp.id ? '⏳' : '✅ Aprobar'}
                        </button>
                        <button
                          onClick={() => validarComprobante(comp.id, false)}
                          disabled={procesando === comp.id}
                          className="bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {procesando === comp.id ? '⏳' : '❌ Rechazar'}
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
