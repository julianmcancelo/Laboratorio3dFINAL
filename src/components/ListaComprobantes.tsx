'use client';

import { useState, useEffect } from 'react';

interface Comprobante {
  id: number;
  monto: number;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  puntos_otorgados: number;
  fecha_carga: string;
  fecha_validacion: string | null;
  validador_nombre: string | null;
  observaciones: string | null;
}

interface ListaComprobantesProps {
  usuarioId: number;
  recargar?: boolean;
  borderColor?: string;
}

export default function ListaComprobantes({ usuarioId, recargar, borderColor = '#CD7F32' }: ListaComprobantesProps) {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(false);

  const cargarComprobantes = async () => {
    setCargando(true);

    try {
      const response = await fetch(`/api/comprobantes?usuario_id=${usuarioId}`);
      
      if (!response.ok) {
        // Si hay error, simplemente mostrar lista vacía en lugar de error
        console.warn('No se pudieron cargar comprobantes, mostrando lista vacía');
        setComprobantes([]);
        setCargando(false);
        return;
      }

      const data = await response.json();
      setComprobantes(data.comprobantes || []);
    } catch (err) {
      console.error('Error:', err);
      // En caso de error, mostrar lista vacía en lugar de mensaje de error
      setComprobantes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComprobantes();
  }, [usuarioId, recargar]);

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      pendiente: {
        bg: 'rgba(245, 158, 11, 0.1)',
        color: 'var(--accent-amber)',
        texto: 'Pendiente',
        icono: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
      },
      aprobado: {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--accent-green)',
        texto: 'Aprobado',
        icono: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      },
      rechazado: {
        bg: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--accent-red)',
        texto: 'Rechazado',
        icono: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ),
      },
    };

    return estilos[estado as keyof typeof estilos] || estilos.pendiente;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <div className="progress-card glassmorphism-light relative rounded-xl p-5 mb-4">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin w-8 h-8" style={{color: 'var(--accent-purple)'}} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }


  return (
    <div className="progress-card glassmorphism-light fade-in-item relative rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{animationDelay: '0.6s', borderTopColor: borderColor}}>
      <div 
        className="flex items-center gap-3 pb-4 cursor-pointer"
        style={{borderBottom: abierto ? '1px solid var(--card-border)' : 'none'}}
        onClick={() => setAbierto(!abierto)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold" style={{color: 'var(--heading-text)'}}>Mis Comprobantes</h2>
          <p className="text-xs" style={{color: 'var(--muted-text)'}}>Historial de comprobantes cargados</p>
        </div>
        <button className="btn-nexus p-2 rounded-lg">
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{color: 'var(--muted-text)'}}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {abierto && (comprobantes.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm" style={{color: 'var(--muted-text)'}}>No has cargado comprobantes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comprobantes.map((comp) => {
            const estadoBadge = getEstadoBadge(comp.estado);
            
            return (
              <div 
                key={comp.id}
                className="glassmorphism-light rounded-xl p-4 hover:scale-102 transition-all duration-300"
                style={{border: '1px solid var(--card-border)'}}
              >
                <div className="flex items-start gap-4">
                  {/* Ícono/Estado */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{backgroundColor: estadoBadge.bg, color: estadoBadge.color}}
                  >
                    {estadoBadge.icono}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-base truncate" style={{color: 'var(--heading-text)'}}>
                          ${parseFloat(comp.monto.toString()).toFixed(2)}
                        </h3>
                        <p className="text-xs" style={{color: 'var(--muted-text)'}}>
                          {formatearFecha(comp.fecha_carga)}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{backgroundColor: estadoBadge.bg, color: estadoBadge.color}}
                      >
                        {estadoBadge.texto}
                      </span>
                    </div>

                    <p className="text-sm mb-2 line-clamp-2" style={{color: 'var(--main-text)'}}>
                      {comp.descripcion}
                    </p>

                    {comp.estado === 'aprobado' && comp.puntos_otorgados > 0 && (
                      <div className="flex items-center gap-2 text-sm" style={{color: 'var(--accent-green)'}}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">+{comp.puntos_otorgados} puntos otorgados</span>
                      </div>
                    )}

                    {comp.estado === 'rechazado' && comp.observaciones && (
                      <div className="mt-2 p-2 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                        <p className="text-xs font-semibold mb-1" style={{color: 'var(--accent-red)'}}>
                          Motivo del rechazo:
                        </p>
                        <p className="text-xs" style={{color: 'var(--muted-text)'}}>
                          {comp.observaciones}
                        </p>
                      </div>
                    )}

                    {comp.fecha_validacion && (
                      <p className="text-xs mt-2" style={{color: 'var(--muted-text)'}}>
                        Validado {comp.validador_nombre ? `por ${comp.validador_nombre}` : ''} el {formatearFecha(comp.fecha_validacion)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
