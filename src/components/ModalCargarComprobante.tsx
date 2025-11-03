'use client';

import { useState, useEffect } from 'react';
import CargarComprobante from './CargarComprobante';

interface ModalCargarComprobanteProps {
  usuarioId: number;
  onComprobanteSubido?: () => void;
  gradienteBoton?: string;
  shadowClasses?: string;
}

export default function ModalCargarComprobante({ 
  usuarioId, 
  onComprobanteSubido, 
  gradienteBoton = 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
  shadowClasses = 'shadow-purple-500/50'
}: ModalCargarComprobanteProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tienePendientes, setTienePendientes] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // Verificar comprobantes pendientes al cargar
  useEffect(() => {
    verificarPendientes();
  }, [usuarioId]);

  const verificarPendientes = async () => {
    try {
      setVerificando(true);
      const response = await fetch(`/api/comprobantes?usuario_id=${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        const pendientes = (data.comprobantes || []).filter((c: any) => 
          c.estado === 'pendiente' || c.estado === 'en_revision'
        );
        setTienePendientes(pendientes.length > 0);
      }
    } catch (error) {
      console.error('Error verificando pendientes:', error);
    } finally {
      setVerificando(false);
    }
  };

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => {
    setModalAbierto(false);
    // Reverificar pendientes cuando se cierra
    verificarPendientes();
  };

  return (
    <>
      {/* Botón para abrir modal - con colores dinámicos según nivel */}
      <div className="mb-4">
        <button
          onClick={abrirModal}
          disabled={verificando}
          className={`btn-nexus w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-xl ${shadowClasses} bg-gradient-to-r ${gradienteBoton} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          title={tienePendientes ? 'Tienes comprobantes pendientes de verificación' : 'Cargar nuevo comprobante'}
        >
          {verificando ? (
            <>
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </>
          ) : (
            <>
              {tienePendientes ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              <span>{tienePendientes ? 'Ver Comprobantes Pendientes' : 'Cargar Comprobante'}</span>
            </>
          )}
        </button>
        {tienePendientes && !verificando && (
          <p className="text-xs text-center mt-2" style={{color: 'var(--accent-amber)'}}>
            ⚠️ Tienes comprobantes pendientes de verificación
          </p>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}}
          onClick={cerrarModal}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              backgroundColor: 'var(--main-bg)',
              border: '1px solid var(--card-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div 
              className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
              style={{
                backgroundColor: 'var(--main-bg)',
                borderColor: 'var(--card-border)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{color: 'var(--heading-text)'}}>
                    Cargar Comprobante
                  </h2>
                  <p className="text-sm" style={{color: 'var(--muted-text)'}}>
                    Sube tu comprobante de compra
                  </p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                className="btn-nexus p-2 rounded-lg hover:scale-110 transition-transform"
                style={{backgroundColor: 'var(--input-bg)', color: 'var(--muted-text)'}}
                title="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              <CargarComprobante
                usuarioId={usuarioId}
                onComprobanteSubido={() => {
                  if (onComprobanteSubido) onComprobanteSubido();
                }}
                onClose={cerrarModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
