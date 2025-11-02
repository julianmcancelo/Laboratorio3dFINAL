'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Canje {
  id: number;
  usuario_id: number;
  premio_id: number;
  puntos_gastados: number;
  estado: string;
  fecha_compra: string;
  notas: string;
  descripcion: string;
  usuario_nombre: string;
  usuario_email: string;
  usuario_instagram: string;
  premio_nombre: string;
  premio_descripcion: string;
  puntos_requeridos: number;
}

export default function HistorialCanjes() {
  const router = useRouter();
  const [canjes, setCanjes] = useState<Canje[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [canjeSeleccionado, setCanjeSeleccionado] = useState<Canje | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [notasAdmin, setNotasAdmin] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Verificar sesión de administrador
  useEffect(() => {
    const verificarSesion = async () => {
      const sessionId = localStorage.getItem('session_id');
      
      if (!sessionId) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (!['ADMIN', 'SUPERADMIN'].includes(data.usuario.rol?.toUpperCase())) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        router.push('/login');
      }
    };

    verificarSesion();
  }, [router]);

  // Cargar canjes
  useEffect(() => {
    cargarCanjes();
  }, [filtroEstado]);

  const cargarCanjes = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`/api/admin/canjes?estado=${filtroEstado}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCanjes(data.canjes);
      }
    } catch (error) {
      console.error('Error al cargar canjes:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalValidacion = (canje: Canje) => {
    setCanjeSeleccionado(canje);
    setNuevoEstado(canje.estado);
    setNotasAdmin('');
    setMostrarModal(true);
  };

  const handleValidar = async () => {
    if (!canjeSeleccionado || !nuevoEstado) return;

    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      
      const response = await fetch('/api/admin/canjes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          canje_id: canjeSeleccionado.id,
          estado: nuevoEstado,
          notas_admin: notasAdmin
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Canje actualizado a: ${nuevoEstado}`);
        setMostrarModal(false);
        cargarCanjes(); // Recargar la lista
      } else {
        alert(`❌ Error: ${data.error || 'No se pudo actualizar el canje'}`);
      }
    } catch (error) {
      console.error('Error al validar canje:', error);
      alert('Error al procesar la validación');
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'aprobado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rechazado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'entregado': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEstadoEmoji = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'aprobado': return '✅';
      case 'rechazado': return '❌';
      case 'entregado': return '📦';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando canjes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🎁 Gestión de Canjes</h1>
            <p className="text-gray-300">Valida y administra los canjes de premios</p>
          </div>
          <Link href="/admin" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all">
            ← Volver al Panel
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {['todos', 'pendiente', 'aprobado', 'rechazado', 'entregado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  filtroEstado === estado
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {estado === 'todos' ? '📋 Todos' : `${getEstadoEmoji(estado)} ${estado.charAt(0).toUpperCase() + estado.slice(1)}`}
              </button>
            ))}
          </div>
          <div className="mt-4 text-gray-300 text-sm">
            Mostrando {canjes.length} canjes
          </div>
        </div>

        {/* Lista de canjes */}
        {canjes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">No hay canjes</h2>
            <p className="text-gray-300">No se encontraron canjes con el filtro seleccionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {canjes.map((canje) => (
              <div
                key={canje.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          🎁 {canje.premio_nombre || 'Premio no disponible'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Canje #{canje.id} • {new Date(canje.fecha_compra).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getEstadoColor(canje.estado)}`}>
                        {getEstadoEmoji(canje.estado)} {canje.estado.charAt(0).toUpperCase() + canje.estado.slice(1)}
                      </span>
                    </div>

                    {/* Usuario */}
                    <div className="bg-white/5 rounded-xl p-4 mb-3">
                      <p className="text-gray-400 text-sm mb-2">👤 Usuario:</p>
                      <p className="text-white font-bold">{canje.usuario_nombre}</p>
                      <p className="text-gray-300 text-sm">{canje.usuario_email}</p>
                      {canje.usuario_instagram && (
                        <p className="text-purple-400 text-sm">@{canje.usuario_instagram}</p>
                      )}
                    </div>

                    {/* Puntos */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Puntos requeridos:</span>
                        <span className="text-amber-400 font-bold ml-2">{canje.puntos_requeridos?.toLocaleString() || 0} pts</span>
                      </div>
                    </div>

                    {/* Notas */}
                    {canje.notas && (
                      <div className="mt-3 bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">📝 Notas:</p>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{canje.notas}</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => abrirModalValidacion(canje)}
                      className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
                    >
                      ✏️ Validar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de validación */}
      {mostrarModal && canjeSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-white mb-6">✏️ Validar Canje #{canjeSeleccionado.id}</h3>
            
            <div className="mb-6 bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Usuario:</p>
              <p className="text-white font-bold text-lg">{canjeSeleccionado.usuario_nombre}</p>
              <p className="text-gray-400 text-sm mt-3 mb-2">Premio:</p>
              <p className="text-white font-bold">{canjeSeleccionado.premio_nombre}</p>
            </div>

            {/* Selector de estado */}
            <div className="mb-6">
              <label className="block text-gray-300 font-bold mb-3">Estado del canje:</label>
              <div className="grid grid-cols-2 gap-3">
                {['pendiente', 'aprobado', 'rechazado', 'entregado'].map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setNuevoEstado(estado)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      nuevoEstado === estado
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {getEstadoEmoji(estado)} {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas del admin */}
            <div className="mb-6">
              <label className="block text-gray-300 font-bold mb-2">Notas adicionales (opcional):</label>
              <textarea
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
                placeholder="Añade comentarios sobre este canje..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={4}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                disabled={procesando}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidar}
                disabled={procesando || !nuevoEstado}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all disabled:opacity-50"
              >
                {procesando ? 'Actualizando...' : '✅ Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
