'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Nivel {
  id: number;
  nombre_nivel: string;
  puntos_minimos_requeridos: number;
  multiplicador_puntos: number;
  descripcion: string;
  orden: number;
  icono_nivel: string;
  activo: boolean;
}

export default function GestionarNiveles() {
  const router = useRouter();
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Nivel | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    nombre_nivel: '',
    puntos_minimos_requeridos: 0,
    multiplicador_puntos: 1.0,
    descripcion: '',
    orden: 0,
    icono_nivel: '🏅'
  });

  useEffect(() => {
    document.documentElement.classList.remove('light-mode');
    cargarNiveles();
  }, []);

  const cargarNiveles = async () => {
    try {
      const response = await fetch('/api/admin/niveles');
      if (response.ok) {
        const data = await response.json();
        setNiveles(data.niveles);
      }
    } catch (error) {
      console.error('Error al cargar niveles:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (nivel?: Nivel) => {
    if (nivel) {
      setEditando(nivel);
      setFormData({
        nombre_nivel: nivel.nombre_nivel,
        puntos_minimos_requeridos: nivel.puntos_minimos_requeridos,
        multiplicador_puntos: nivel.multiplicador_puntos,
        descripcion: nivel.descripcion,
        orden: nivel.orden,
        icono_nivel: nivel.icono_nivel
      });
    } else {
      setEditando(null);
      setFormData({
        nombre_nivel: '',
        puntos_minimos_requeridos: 0,
        multiplicador_puntos: 1.0,
        descripcion: '',
        orden: niveles.length,
        icono_nivel: '🏅'
      });
    }
    setMostrarModal(true);
  };

  const guardarNivel = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const url = editando ? `/api/admin/niveles/${editando.id}` : '/api/admin/niveles';
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ 
          texto: editando ? 'Nivel actualizado correctamente' : 'Nivel creado correctamente', 
          tipo: 'success' 
        });
        setMostrarModal(false);
        cargarNiveles();
      } else {
        setMensaje({ texto: data.error || 'Error al guardar', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (id: number, activoActual: boolean) => {
    try {
      const response = await fetch(`/api/admin/niveles/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activoActual })
      });

      if (response.ok) {
        cargarNiveles();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
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
          <p className="text-white font-medium">Cargando niveles...</p>
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
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>Niveles de Lealtad</h1>
                <p className="text-sm sm:text-base" style={{color: 'var(--muted-text)'}}>Gestiona los niveles y sus beneficios</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
                >
                  + Añadir Nivel
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="glassmorphism-light hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
                >
                  ← Volver
                </button>
              </div>
            </div>

            {mensaje && (
              <div className={`px-4 py-3 rounded-xl mb-6 ${mensaje.tipo === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-300' : 'bg-red-500/10 border border-red-500/50 text-red-300'}`}>
                {mensaje.texto}
              </div>
            )}

            {/* Tabla de niveles */}
            <div className="glassmorphism-light rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-semibold">Icono</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Nombre</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Puntos Mín.</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Multiplicador</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Orden</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Estado</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {niveles.sort((a, b) => a.orden - b.orden).map((nivel) => (
                      <tr key={nivel.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4 text-2xl">{nivel.icono_nivel}</td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{nivel.nombre_nivel}</div>
                          <div className="text-xs text-gray-400">{nivel.descripcion}</div>
                        </td>
                        <td className="p-4 text-yellow-400 font-mono">{nivel.puntos_minimos_requeridos.toLocaleString()}</td>
                        <td className="p-4 text-purple-400 font-mono">x{nivel.multiplicador_puntos}</td>
                        <td className="p-4 text-gray-300">{nivel.orden}</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleActivo(nivel.id, nivel.activo)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${nivel.activo ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}
                          >
                            {nivel.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => abrirModal(nivel)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Modal */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glassmorphism w-full max-w-md rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">
                {editando ? 'Editar Nivel' : 'Nuevo Nivel'}
              </h2>
              <form onSubmit={guardarNivel} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Nombre del Nivel</label>
                  <input
                    type="text"
                    value={formData.nombre_nivel}
                    onChange={(e) => setFormData({...formData, nombre_nivel: e.target.value})}
                    className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Puntos Mínimos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.puntos_minimos_requeridos}
                    onChange={(e) => setFormData({...formData, puntos_minimos_requeridos: parseInt(e.target.value) || 0})}
                    className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Multiplicador</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.multiplicador_puntos}
                    onChange={(e) => setFormData({...formData, multiplicador_puntos: parseFloat(e.target.value) || 1})}
                    className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Orden</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orden}
                      onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Icono</label>
                    <input
                      type="text"
                      value={formData.icono_nivel}
                      onChange={(e) => setFormData({...formData, icono_nivel: e.target.value})}
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none text-center text-2xl"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-xl transition-all"
                  >
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
