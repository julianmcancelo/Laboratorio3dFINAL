'use client';

import { useState } from 'react';
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

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  return (
    <>
      {/* Botón para abrir modal - con colores dinámicos según nivel */}
      <div className="mb-4">
        <button
          onClick={abrirModal}
          className={`btn-nexus w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-xl ${shadowClasses} bg-gradient-to-r ${gradienteBoton} text-white`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Cargar Comprobante</span>
        </button>
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
