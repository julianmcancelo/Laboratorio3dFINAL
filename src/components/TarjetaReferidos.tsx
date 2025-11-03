'use client';

import { useState } from 'react';

interface TarjetaReferidosProps {
  codigoReferido: string;
  nombreUsuario: string;
}

export default function TarjetaReferidos({ codigoReferido, nombreUsuario }: TarjetaReferidosProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoReferido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const mensajeCompartir = `¡Hola! 🎁 Te comparto mi código de referido de Laboratorio 3D: *${codigoReferido}*\n\nUsalo en tu próxima compra superior a $500.000 y obtené $25.000 de descuento. ¡Ambos ganamos! 🚀`;

  const compartirWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(mensajeCompartir)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="progress-card glassmorphism-light rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
        border: '2px solid rgba(139, 92, 246, 0.2)'
      }}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
        }}>
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{color: 'var(--heading-text)'}}>
            Tus amigos crean, vos ganás 🚀
          </h3>
          <p className="text-xs" style={{color: 'var(--muted-text)'}}>
            Compartí tu código y sumá puntos
          </p>
        </div>
      </div>

      {/* Copy motivacional */}
      <div className="mb-4 p-3 rounded-lg" style={{
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <p className="text-sm" style={{color: 'var(--body-text)'}}>
          Cada vez que recomendás un producto y cargás el comprobante de tu amigo (compra superior a <span className="font-bold text-purple-500">$500.000</span>), 
          sumás <span className="font-bold text-green-500">$50.000 = 50 pts</span> 💰
        </p>
      </div>

      {/* Código de referido */}
      <div className="mb-4">
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color: 'var(--muted-text)'}}>
          Tu código único
        </label>
        <div className="flex gap-2">
          <div className="flex-1 p-4 rounded-lg text-center" style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '2px dashed rgba(139, 92, 246, 0.3)'
          }}>
            <div className="text-3xl font-bold tracking-wider" style={{
              color: 'var(--accent-purple)',
              textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)'
            }}>
              {codigoReferido}
            </div>
          </div>
          <button
            onClick={copiarCodigo}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: copiado ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            {copiado ? (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Copiado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <span className="text-sm">Copiar</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Botón compartir WhatsApp */}
      <button
        onClick={compartirWhatsApp}
        className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
        }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartir por WhatsApp
      </button>

      {/* Footer info */}
      <div className="mt-4 p-3 rounded-lg text-center" style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)'
      }}>
        <p className="text-xs font-semibold text-green-600 mb-1">
          ✅ ¿Cómo funciona?
        </p>
        <p className="text-xs" style={{color: 'var(--muted-text)'}}>
          Comparte tu código → Amigo compra → Cargás su comprobante → Ganás 50 pts ($50.000)
        </p>
      </div>
    </div>
  );
}
