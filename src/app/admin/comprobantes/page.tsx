'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comprobante {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  monto: number;
  descripcion: string;
  comprobante_base64: string;
  tipo_archivo: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  puntos_otorgados: number;
  fecha_carga: string;
  fecha_validacion: string | null;
}

export default function AdminComprobantesPage() {
  const router = useRouter();
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<Comprobante | null>(null);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    verificarAdmin();
  }, []);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImagenAmpliada(null);
        if (comprobanteSeleccionado) {
          setComprobanteSeleccionado(null);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [comprobanteSeleccionado]);

  const verificarAdmin = async () => {
    const sessionId = localStorage.getItem('session_id');
    
    if (!sessionId) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      
      // Verificar si es admin
      if (data.usuario.rol !== 'ADMIN' && data.usuario.rol !== 'SUPERADMIN') {
        alert('No tienes permisos de administrador');
        router.push('/dashboard');
        return;
      }

      // Cargar comprobantes
      cargarComprobantes();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const cargarComprobantes = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/comprobantes', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComprobantes(data.comprobantes);
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarComprobante = async (accion: 'aprobar' | 'rechazar') => {
    if (!comprobanteSeleccionado) return;

    setProcesando(true);

    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/comprobantes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          comprobante_id: comprobanteSeleccionado.id,
          accion,
          observaciones
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(accion === 'aprobar' 
          ? `✅ Comprobante aprobado!\n\nPuntos otorgados: ${data.puntos_otorgados}\nNuevo nivel: ${data.nuevo_nivel}`
          : '❌ Comprobante rechazado'
        );
        
        setComprobanteSeleccionado(null);
        setObservaciones('');
        cargarComprobantes();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la validación');
    } finally {
      setProcesando(false);
    }
  };

  const comprobantesFiltrados = filtro === 'todos' 
    ? comprobantes 
    : comprobantes.filter(c => c.estado === filtro);

  const calcularPuntos = (monto: number) => Math.floor(monto / 1000);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando comprobantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              🔍 Verificación de Comprobantes
            </h1>
            <p className="text-gray-400">Sistema de validación de compras</p>
          </div>
          <Link 
            href="/admin"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel Admin
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-200 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold">{comprobantes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6">
            <p className="text-yellow-200 text-sm mb-1">Pendientes</p>
            <p className="text-3xl font-bold">{comprobantes.filter(c => c.estado === 'pendiente').length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6">
            <p className="text-green-200 text-sm mb-1">Aprobados</p>
            <p className="text-3xl font-bold">{comprobantes.filter(c => c.estado === 'aprobado').length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-6">
            <p className="text-red-200 text-sm mb-1">Rechazados</p>
            <p className="text-3xl font-bold">{comprobantes.filter(c => c.estado === 'rechazado').length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#1a1a1f] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos ({comprobantes.length})
            </button>
            <button
              onClick={() => setFiltro('pendiente')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'pendiente' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pendientes ({comprobantes.filter(c => c.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setFiltro('aprobado')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'aprobado' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Aprobados ({comprobantes.filter(c => c.estado === 'aprobado').length})
            </button>
            <button
              onClick={() => setFiltro('rechazado')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'rechazado' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Rechazados ({comprobantes.filter(c => c.estado === 'rechazado').length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de comprobantes */}
      <div className="max-w-7xl mx-auto">
        {comprobantesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1f] rounded-xl">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">No hay comprobantes</h3>
            <p className="text-gray-400">No se encontraron comprobantes con el filtro seleccionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {comprobantesFiltrados.map((comprobante) => (
              <div
                key={comprobante.id}
                className="bg-[#1a1a1f] rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg">{comprobante.usuario_nombre}</p>
                      <p className="text-sm text-gray-400">ID: #{comprobante.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      comprobante.estado === 'pendiente' ? 'bg-orange-500/20 text-orange-400' :
                      comprobante.estado === 'aprobado' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {comprobante.estado === 'pendiente' ? '⏳ Pendiente' :
                       comprobante.estado === 'aprobado' ? '✅ Aprobado' :
                       '❌ Rechazado'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monto:</span>
                      <span className="font-bold text-amber-400">
                        ${comprobante.monto.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Puntos equivalentes:</span>
                      <span className="font-bold text-green-400">
                        {calcularPuntos(comprobante.monto)} pts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha:</span>
                      <span>{new Date(comprobante.fecha_carga).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                {/* Imagen del comprobante */}
                <div className="relative h-48 bg-gray-900 group">
                  <img
                    src={comprobante.comprobante_base64}
                    alt="Comprobante"
                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setImagenAmpliada(comprobante.comprobante_base64)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-white font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Click para ampliar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {comprobante.descripcion && (
                  <div className="p-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      <strong>Descripción:</strong> {comprobante.descripcion}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="p-4 border-t border-gray-800">
                  {comprobante.estado === 'pendiente' ? (
                    <button
                      onClick={() => setComprobanteSeleccionado(comprobante)}
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg font-bold transition-all hover:scale-105"
                    >
                      🔍 Revisar Comprobante
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">
                        {comprobante.estado === 'aprobado' ? 'Validado el' : 'Rechazado el'}
                      </p>
                      <p className="text-sm font-medium">
                        {comprobante.fecha_validacion ? 
                          new Date(comprobante.fecha_validacion).toLocaleString('es-AR') : 
                          'N/A'}
                      </p>
                      {comprobante.estado === 'aprobado' && (
                        <p className="text-green-400 font-bold mt-2">
                          +{comprobante.puntos_otorgados} puntos otorgados
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de validación */}
      {comprobanteSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1f] rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold mb-2">Validar Comprobante #{comprobanteSeleccionado.id}</h2>
              <p className="text-gray-400">Cliente: {comprobanteSeleccionado.usuario_nombre}</p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Imagen grande */}
              <div className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-colors group relative">
                <img
                  src={comprobanteSeleccionado.comprobante_base64}
                  alt="Comprobante"
                  className="w-full max-h-96 object-contain"
                  onClick={() => setImagenAmpliada(comprobanteSeleccionado.comprobante_base64)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white font-bold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Click para ver en grande
                    </p>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Monto de la compra</p>
                  <p className="text-2xl font-bold text-amber-400">
                    ${comprobanteSeleccionado.monto.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Puntos a otorgar (1pt = $1.000)</p>
                  <p className="text-2xl font-bold text-green-400">
                    {calcularPuntos(comprobanteSeleccionado.monto)} pts
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {comprobanteSeleccionado.descripcion && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Descripción del usuario:</label>
                  <p className="bg-gray-900 rounded-xl p-4">{comprobanteSeleccionado.descripcion}</p>
                </div>
              )}

              {/* Observaciones del admin */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Observaciones (opcional):</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agrega alguna nota sobre esta validación..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none min-h-[100px]"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  setComprobanteSeleccionado(null);
                  setObservaciones('');
                }}
                disabled={procesando}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => validarComprobante('rechazar')}
                disabled={procesando}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : '❌ Rechazar'}
              </button>
              <button
                onClick={() => validarComprobante('aprobar')}
                disabled={procesando}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : '✅ Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen ampliada */}
      {imagenAmpliada && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">Comprobante ampliado</h3>
              <button
                onClick={() => setImagenAmpliada(null)}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagen */}
            <div 
              className="relative flex-1 flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imagenAmpliada}
                alt="Comprobante ampliado"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Controles */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imagenAmpliada;
                  link.download = `comprobante-${Date.now()}.jpg`;
                  link.click();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </button>
              <button
                onClick={() => window.open(imagenAmpliada, '_blank')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir en pestaña nueva
              </button>
            </div>

            {/* Instrucciones */}
            <p className="text-center text-gray-400 text-sm mt-3">
              Click fuera de la imagen para cerrar • ESC para cerrar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
