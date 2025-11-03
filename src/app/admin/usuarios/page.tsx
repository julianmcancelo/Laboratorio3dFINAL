'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  dni: string | null;
  instagram: string | null;
  rol: string;
  puntos: number;
  nivel: string;
  validado: boolean;
  fecha_validacion: string | null;
  validado_por: string | null;
  motivo_rechazo: string | null;
  apto_para_canje: boolean;
  creado_en: string;
  codigo_referido: string | null;
}

interface Paginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export default function GestionUsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminActual, setAdminActual] = useState<any>(null);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'validados' | 'rechazados'>('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [mostrarModalValidar, setMostrarModalValidar] = useState(false);
  const [mostrarModalRechazar, setMostrarModalRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Verificar admin y cargar datos
  useEffect(() => {
    verificarAdminYcargarDatos();
  }, [filtro, busqueda, paginaActual]);

  const verificarAdminYcargarDatos = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        router.push('/login');
        return;
      }

      // Verificar admin
      const verifyResponse = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (!verifyResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await verifyResponse.json();
      if (userData.usuario.rol !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      setAdminActual(userData.usuario);

      // Cargar usuarios
      await cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const cargarUsuarios = async () => {
    try {
      const params = new URLSearchParams({
        estado: filtro,
        pagina: paginaActual.toString(),
        limite: '10',
        busqueda
      });

      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`/api/admin/usuarios?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios);
        setPaginacion(data.paginacion);
      } else {
        console.error('Error cargando usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async () => {
    if (!usuarioSeleccionado || !adminActual) return;

    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/usuarios/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.id,
          admin_id: adminActual.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Usuario validado exitosamente');
        setMostrarModalValidar(false);
        setUsuarioSeleccionado(null);
        await cargarUsuarios();
      } else {
        alert(data.error || 'Error al validar usuario');
      }
    } catch (error) {
      console.error('Error validando usuario:', error);
      alert('Error de conexión al validar usuario');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!usuarioSeleccionado || !adminActual || !motivoRechazo.trim()) {
      alert('Por favor, ingresa un motivo de rechazo');
      return;
    }

    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/usuarios/rechazar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.id,
          admin_id: adminActual.id,
          motivo: motivoRechazo.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('❌ Usuario rechazado');
        setMostrarModalRechazar(false);
        setUsuarioSeleccionado(null);
        setMotivoRechazo('');
        await cargarUsuarios();
      } else {
        alert(data.error || 'Error al rechazar usuario');
      }
    } catch (error) {
      console.error('Error rechazando usuario:', error);
      alert('Error de conexión al rechazar usuario');
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (usuario: Usuario) => {
    if (usuario.validado) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          ✅ Validado
        </span>
      );
    } else if (usuario.motivo_rechazo) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
          ❌ Rechazado
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          ⏳ Pendiente
        </span>
      );
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra las validaciones de usuarios del sistema
            </p>
          </div>
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar usuario
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Nombre, email o DNI..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Estado de validación
              </label>
              <select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as any);
                  setPaginaActual(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendientes">⏳ Pendientes de validación</option>
                <option value="validados">✅ Validados</option>
                <option value="rechazados">❌ Rechazados</option>
                <option value="todos">📋 Todos</option>
              </select>
            </div>

            {/* Estadísticas */}
            <div className="flex items-end">
              <div className="bg-blue-50 rounded-lg p-4 w-full">
                <div className="text-sm text-blue-600 font-medium">
                  Total de usuarios
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {paginacion?.total || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {usuarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600">
                No hay usuarios con el estado seleccionado
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nombre_completo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {usuario.rol}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {usuario.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {usuario.dni || 'Sin DNI'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEstadoBadge(usuario)}
                          {usuario.validado && usuario.fecha_validacion && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatearFecha(usuario.fecha_validacion)}
                            </div>
                          )}
                          {usuario.validado_por && (
                            <div className="text-xs text-gray-500">
                              Por: {usuario.validado_por}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.puntos.toLocaleString()} pts
                          </div>
                          <div className="text-xs text-gray-500">
                            {usuario.nivel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(usuario.creado_en)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!usuario.validado && !usuario.motivo_rechazo && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setUsuarioSeleccionado(usuario);
                                  setMostrarModalValidar(true);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                              >
                                ✅ Validar
                              </button>
                              <button
                                onClick={() => {
                                  setUsuarioSeleccionado(usuario);
                                  setMostrarModalRechazar(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                              >
                                ❌ Rechazar
                              </button>
                            </div>
                          )}
                          {usuario.motivo_rechazo && (
                            <button
                              onClick={() => {
                                alert(`Motivo de rechazo: ${usuario.motivo_rechazo}`);
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
                            >
                              📄 Ver motivo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {paginacion && paginacion.totalPaginas > 1 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Mostrando {((paginaActual - 1) * paginacion.limite) + 1} a{' '}
                    {Math.min(paginaActual * paginacion.limite, paginacion.total)} de{' '}
                    {paginacion.total} usuarios
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
                      {paginaActual}
                    </span>
                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === paginacion.totalPaginas}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Validar */}
      {mostrarModalValidar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ✅ Validar Usuario
            </h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                ¿Estás seguro que deseas validar a este usuario?
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-500">
                  {usuarioSeleccionado.email}
                </div>
                <div className="text-sm text-gray-500">
                  {usuarioSeleccionado.dni || 'Sin DNI'}
                </div>
              </div>
              <p className="text-sm text-green-600 mt-3">
                Al validar, el usuario quedará apto para canjear premios.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalValidar(false);
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidar}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {procesando ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {mostrarModalRechazar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ❌ Rechazar Usuario
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                ¿Estás seguro que deseas rechazar a este usuario?
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-500">
                  {usuarioSeleccionado.email}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Describe el motivo por el cual se rechaza la validación..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalRechazar(false);
                  setUsuarioSeleccionado(null);
                  setMotivoRechazo('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {procesando ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
