'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ConfigReferidos {
  porcentaje_comision_referido: number;
  puntos_fijos_primera_compra: number;
  sistema_comision_activo: boolean;
}

export default function ConfigReferidos() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigReferidos>({
    porcentaje_comision_referido: 0,
    puntos_fijos_primera_compra: 0,
    sistema_comision_activo: true
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Asegurar modo dark
    document.documentElement.classList.remove('light-mode');
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const response = await fetch('/api/admin/referidos');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.configuracion);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const response = await fetch('/api/admin/referidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ texto: 'Configuración actualizada correctamente', tipo: 'success' });
      } else {
        setMensaje({ texto: data.error || 'Error al guardar', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setGuardando(false);
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
          <p className="text-white font-medium">Cargando configuración...</p>
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
          --card-light-bg: rgba(255, 255, 255, 0.08);
          --accent-purple: #a855f7;
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

      <div className="min-h-screen relative overflow-hidden transition-colors duration-300 p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
        {/* Aurora Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main Container */}
        <main className="glassmorphism w-full max-w-2xl mx-auto rounded-3xl shadow-2xl relative transition-all duration-300">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>Configuración de Referidos</h1>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>Define cómo se recompensará a los clientes que refieran a otros</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="glassmorphism-light hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                ← Volver al Panel
              </button>
            </div>

            {/* Mensaje de feedback */}
            {mensaje && (
              <div className={`px-4 py-3 rounded-xl mb-6 ${mensaje.tipo === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-300' : 'bg-red-500/10 border border-red-500/50 text-red-300'}`}>
                {mensaje.texto}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={guardarConfig} className="space-y-6 glassmorphism-light p-6 rounded-xl">
              {/* Sistema activo */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sistema_comision_activo}
                    onChange={(e) => setConfig({...config, sistema_comision_activo: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-white font-medium">Sistema de comisiones activo</span>
                </label>
                <p className="text-xs mt-2" style={{color: 'var(--muted-text)'}}>
                  Activa o desactiva el sistema de recompensas por referidos
                </p>
              </div>

              {/* Porcentaje de comisión */}
              <div>
                <label className="block mb-2 font-medium" style={{color: 'var(--main-text)'}}>
                  Porcentaje de comisión (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={config.porcentaje_comision_referido}
                  onChange={(e) => setConfig({...config, porcentaje_comision_referido: parseFloat(e.target.value) || 0})}
                  className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-xs mt-2" style={{color: 'var(--muted-text)'}}>
                  Porcentaje de puntos que recibe el referente por compras de sus referidos
                </p>
              </div>

              {/* Puntos fijos */}
              <div>
                <label className="block mb-2 font-medium" style={{color: 'var(--main-text)'}}>
                  Puntos fijos por primera compra
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={config.puntos_fijos_primera_compra}
                  onChange={(e) => setConfig({...config, puntos_fijos_primera_compra: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-xs mt-2" style={{color: 'var(--muted-text)'}}>
                  Puntos que recibe el referente cuando su referido realiza su primera compra
                </p>
              </div>

              {/* Botón guardar */}
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                {guardando ? '⏳ Guardando...' : '💾 Guardar Configuración'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
