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
  estado: string;
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
  const [error, setError] = useState<string | null>(null);
  
  // Estados para nuevos modales
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [nuevoRol, setNuevoRol] = useState<'cliente' | 'operador' | 'admin'>('cliente');
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
  const [mostrarModalPuntos, setMostrarModalPuntos] = useState(false);
  const [nuevosPuntos, setNuevosPuntos] = useState('');

  // Verificar admin y cargar datos
  useEffect(() => {
    verificarAdminYcargarDatos();
  }, [filtro, busqueda, paginaActual]);

  const verificarAdminYcargarDatos = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        setError('No hay sesión activa');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Verificar admin
      const verifyResponse = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (!verifyResponse.ok) {
        setError('Sesión inválida o expirada');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const userData = await verifyResponse.json();
      if (!userData.usuario) {
        setError('No se pudo cargar la información del usuario');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (userData.usuario.rol !== 'ADMIN') {
        setError('Acceso denegado: Solo administradores');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      setAdminActual(userData.usuario);

      // Cargar usuarios
      await cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
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

  // Cambiar rol de usuario
  const handleCambiarRol = async () => {
    if (!usuarioSeleccionado || !adminActual) return;

    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/usuarios/cambiar-rol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.id,
          nuevo_rol: nuevoRol.toUpperCase(),
          admin_id: adminActual.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Rol cambiado a ${nuevoRol.toUpperCase()}`);
        setMostrarModalRol(false);
        setUsuarioSeleccionado(null);
        await cargarUsuarios();
      } else {
        alert(data.error || 'Error al cambiar rol');
      }
    } catch (error) {
      console.error('Error cambiando rol:', error);
      alert('Error de conexión al cambiar rol');
    } finally {
      setProcesando(false);
    }
  };

  // Bloquear/Desbloquear usuario
  const handleToggleBloqueo = async () => {
    if (!usuarioSeleccionado || !adminActual) return;

    const accion = usuarioSeleccionado.estado === 'ACTIVO' ? 'bloquear' : 'desbloquear';
    
    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/usuarios/toggle-bloqueo', {
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
        alert(`✅ Usuario ${accion === 'bloquear' ? 'bloqueado' : 'desbloqueado'} exitosamente`);
        
        // Actualizar estado local inmediatamente
        setUsuarios(prevUsuarios => 
          prevUsuarios.map(u => 
            u.id === usuarioSeleccionado.id 
              ? { ...u, estado: data.usuario.estado, apto_para_canje: accion !== 'bloquear' }
              : u
          )
        );
        
        setMostrarModalBloqueo(false);
        setUsuarioSeleccionado(null);
        
        // Recargar para asegurar consistencia
        await cargarUsuarios();
      } else {
        alert(data.error || `Error al ${accion} usuario`);
      }
    } catch (error) {
      console.error(`Error ${accion}ndo usuario:`, error);
      alert(`Error de conexión al ${accion} usuario`);
    } finally {
      setProcesando(false);
    }
  };

  // Ajustar puntos manualmente
  const handleAjustarPuntos = async () => {
    if (!usuarioSeleccionado || !adminActual || !nuevosPuntos.trim()) {
      alert('Por favor, ingresa la cantidad de puntos');
      return;
    }

    const puntos = parseInt(nuevosPuntos);
    if (isNaN(puntos)) {
      alert('Por favor, ingresa un número válido');
      return;
    }

    setProcesando(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/admin/usuarios/ajustar-puntos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.id,
          puntos: puntos,
          admin_id: adminActual.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Puntos ajustados: ${puntos > 0 ? '+' : ''}${puntos}`);
        setMostrarModalPuntos(false);
        setUsuarioSeleccionado(null);
        setNuevosPuntos('');
        await cargarUsuarios();
      } else {
        alert(data.error || 'Error al ajustar puntos');
      }
    } catch (error) {
      console.error('Error ajustando puntos:', error);
      alert('Error de conexión al ajustar puntos');
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

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        }).catch(() => {});
      }
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_data');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_data');
      router.push('/login');
    }
  };

  const getEstadoBadge = (usuario: Usuario) => {
    if (usuario.validado) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Validado
        </span>
      );
    } else if (usuario.motivo_rechazo) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Rechazado
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 animate-pulse">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pendiente
        </span>
      );
    }
  };

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
        <div className="text-center max-w-md mx-auto p-8 fade-in-item">
          <div className="rounded-2xl p-8 mb-6 border-2" style={{background: 'rgba(30, 20, 50, 0.8)', borderColor: 'rgba(239, 68, 68, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative text-6xl">⚠️</div>
            </div>
            <p className="text-xl font-semibold text-white mb-2">{error}</p>
            <p className="text-sm text-gray-400">Se requiere autenticación</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
            style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white'}}
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
        <div className="text-center fade-in-item">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 mx-auto mb-6" style={{border: '4px solid rgba(139, 92, 246, 0.2)', borderTop: '4px solid #8b5cf6'}}></div>
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
          </div>
          <p className="text-xl font-semibold text-white mb-2">Cargando usuarios...</p>
          <p className="text-sm text-gray-400">Por favor espera</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
      {/* Estilos específicos para animación shimmer */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
      
      {/* Aurora Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main Container */}
        <div className="relative min-h-screen p-4 md:p-8">
          <main className="w-full max-w-7xl mx-auto rounded-3xl shadow-2xl overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
            
            {/* Header / Navbar */}
            <header className="backdrop-blur-xl border-b sticky top-0 z-50" style={{borderColor: 'rgba(255, 255, 255, 0.1)'}}>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full" style={{animation: 'shimmer 3s infinite'}}></div>
              
              <div className="relative px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo y título */}
                  <div className="flex items-center space-x-3">
                    <Link href="/admin">
                      <img 
                        src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
                        alt="Logo Laboratorio 3D" 
                        className="h-8 sm:h-10 cursor-pointer hover:scale-105 transition-transform"
                      />
                    </Link>
                    <h1 className="text-md sm:text-lg font-bold hidden lg:block text-white">
                      Panel de Administración
                    </h1>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Link
                      href="/admin"
                      className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      title="Volver al Dashboard"
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </Link>
                    <button
                      onClick={handleLogout}
                      title="Cerrar Sesión"
                      className="p-2 rounded-full hover:bg-red-500/20 transition-all duration-200 text-red-400 hover:text-red-300"
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header Section */}
              <section className="mb-8 p-6 md:p-8 rounded-2xl shadow-xl border-l-4" style={{background: 'rgba(255, 255, 255, 0.08)', borderLeftColor: '#8b5cf6'}}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg" style={{background: 'rgba(139, 92, 246, 0.2)', border: '2px solid rgba(139, 92, 246, 0.5)'}}>
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                      Gestión de Usuarios
                    </h2>
                    <p className="text-md font-medium text-purple-400">
                      Panel de Control de Laboratorio 3D
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Administra las validaciones de usuarios del sistema
                    </p>
                  </div>
                </div>
              </section>

        {/* Indicadores Clave */}
        <div className="mb-8 fade-in-item" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-bold text-white mb-4">Indicadores Clave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Usuarios */}
            <div className="rounded-2xl p-6 border-2" style={{background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(20px)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Usuarios</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.2)'}}>
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-purple-400">{paginacion?.total || 0}</div>
            </div>

            {/* Pendientes */}
            <div className="rounded-2xl p-6 border-2" style={{background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(251, 146, 60, 0.3)', backdropFilter: 'blur(20px)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Por Verificar</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(251, 146, 60, 0.2)'}}>
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-orange-400">{usuarios.filter(u => !u.validado && !u.motivo_rechazo).length}</div>
            </div>

            {/* Validados */}
            <div className="rounded-2xl p-6 border-2" style={{background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(20px)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Aprobados</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(34, 197, 94, 0.2)'}}>
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-green-400">{usuarios.filter(u => u.validado).length}</div>
            </div>

            {/* Rechazados */}
            <div className="rounded-2xl p-6 border-2" style={{background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(20px)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Rechazados</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.2)'}}>
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-red-400">{usuarios.filter(u => u.motivo_rechazo).length}</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl p-4 sm:p-6 mb-6 fade-in-item border-2" style={{animationDelay: '0.15s', background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(20px)'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)'}}
              />
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📊 Estado de validación
              </label>
              <select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as any);
                  setPaginaActual(1);
                }}
                className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)'}}
              >
                <option value="pendientes">⏳ Pendientes de validación</option>
                <option value="validados">✅ Validados</option>
                <option value="rechazados">❌ Rechazados</option>
                <option value="todos">📋 Todos</option>
              </select>
            </div>

            {/* Info filtrado */}
            <div className="flex items-end">
              <div className="rounded-xl p-4 w-full" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="text-sm text-gray-400 mb-1">
                  Mostrando
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {usuarios.length} de {paginacion?.total || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="rounded-2xl shadow-2xl overflow-hidden fade-in-item border-2" style={{animationDelay: '0.2s', background: 'rgba(45, 27, 78, 0.4)', borderColor: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(20px)'}}>
          {usuarios.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                <div className="relative text-8xl">👥</div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                No se encontraron usuarios
              </h3>
              <p className="text-lg text-gray-400">
                No hay usuarios con el estado seleccionado
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{background: 'rgba(30, 20, 50, 0.6)', borderBottom: '2px solid rgba(139, 92, 246, 0.3)'}}>
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Usuario
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Contacto
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Estado
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Puntos
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Registrado
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{borderColor: 'rgba(139, 92, 246, 0.2)'}}>
                    {usuarios.map((usuario, index) => (
                      <tr key={usuario.id} className="transition-all duration-300 fade-in-item" style={{backgroundColor: 'transparent', animationDelay: `${0.3 + (index * 0.05)}s`}} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';}} onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'transparent';}}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                              {usuario.nombre_completo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {usuario.nombre_completo}
                              </div>
                              <div className="text-xs px-2 py-0.5 rounded-full inline-block" style={{background: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd'}}>
                                {usuario.rol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {usuario.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                              </svg>
                              {usuario.dni || 'Sin DNI'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEstadoBadge(usuario)}
                          {usuario.validado && usuario.fecha_validacion && (
                            <div className="text-xs mt-1 text-gray-500">
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
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" style={{color: 'var(--accent-amber)'}} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <div>
                              <div className="text-sm font-bold text-purple-400">
                                {usuario.puntos.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {usuario.nivel}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
                                className="btn-nexus px-4 py-2 rounded-xl transition-all text-xs font-semibold shadow-lg hover:shadow-2xl hover:scale-110 flex items-center gap-1.5"
                                style={{backgroundColor: 'var(--accent-green)', color: 'white'}}
                                title="Validar usuario"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Validar
                              </button>
                              <button
                                onClick={() => {
                                  setUsuarioSeleccionado(usuario);
                                  setMostrarModalRechazar(true);
                                }}
                                className="btn-nexus px-4 py-2 rounded-xl transition-all text-xs font-semibold shadow-lg hover:shadow-2xl hover:scale-110 flex items-center gap-1.5"
                                style={{backgroundColor: 'var(--accent-red)', color: 'white'}}
                                title="Rechazar usuario"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L9.586 10 5.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Rechazar
                              </button>
                            </div>
                          )}
                          {usuario.motivo_rechazo && (
                            <button
                              onClick={() => {
                                alert(`Motivo de rechazo: ${usuario.motivo_rechazo}`);
                              }}
                              className="btn-nexus px-4 py-2 rounded-xl transition-all text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-1.5"
                              style={{backgroundColor: 'var(--input-bg)', color: 'var(--body-text)', border: '1px solid var(--card-border)'}}
                              title="Ver motivo de rechazo"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                              </svg>
                              Ver motivo
                            </button>
                          )}
                          
                          {/* Botones de gestión para usuarios validados */}
                          {usuario.validado && (
                            <div className="flex flex-col gap-2 mt-2">
                              <div className="flex gap-2">
                                {/* Cambiar Rol */}
                                <button
                                  onClick={() => {
                                    setUsuarioSeleccionado(usuario);
                                    setNuevoRol(usuario.rol.toLowerCase() as 'cliente' | 'operador' | 'admin');
                                    setMostrarModalRol(true);
                                  }}
                                  className="btn-nexus px-3 py-1.5 rounded-lg transition-all text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-1.5"
                                  style={{backgroundColor: 'var(--accent-purple)', color: 'white'}}
                                  title="Cambiar rol"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                  </svg>
                                  Rol
                                </button>

                                {/* Bloquear/Desbloquear */}
                                <button
                                  onClick={() => {
                                    setUsuarioSeleccionado(usuario);
                                    setMostrarModalBloqueo(true);
                                  }}
                                  className="btn-nexus px-3 py-1.5 rounded-lg transition-all text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-1.5"
                                  style={{backgroundColor: usuario.estado === 'ACTIVO' ? 'var(--accent-amber)' : 'var(--accent-green)', color: 'white'}}
                                  title={usuario.estado === 'ACTIVO' ? 'Bloquear usuario' : 'Desbloquear usuario'}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    {usuario.estado === 'ACTIVO' ? (
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    ) : (
                                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                    )}
                                  </svg>
                                  {usuario.estado === 'ACTIVO' ? 'Bloquear' : 'Activar'}
                                </button>

                                {/* Ajustar Puntos */}
                                <button
                                  onClick={() => {
                                    setUsuarioSeleccionado(usuario);
                                    setNuevosPuntos('');
                                    setMostrarModalPuntos(true);
                                  }}
                                  className="btn-nexus px-3 py-1.5 rounded-lg transition-all text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-1.5"
                                  style={{backgroundColor: 'var(--accent-cyan)', color: 'white'}}
                                  title="Ajustar puntos"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Puntos
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {paginacion && paginacion.totalPaginas > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t" style={{background: 'rgba(30, 20, 50, 0.6)', borderColor: 'rgba(139, 92, 246, 0.3)'}}>
                  <div className="text-sm text-gray-300">
                    Mostrando {((paginaActual - 1) * paginacion.limite) + 1} a{' '}
                    {Math.min(paginaActual * paginacion.limite, paginacion.total)} de{' '}
                    {paginacion.total} usuarios
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                      style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background: 'rgba(139, 92, 246, 0.8)', color: 'white'}}>
                      {paginaActual}
                    </span>
                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === paginacion.totalPaginas}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                      style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
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
    </main>
  </div>

  {/* Modal Validar */}
  {mostrarModalValidar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-6 fade-in-item">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl border-2" style={{background: 'rgba(30, 20, 50, 0.95)', borderColor: 'rgba(34, 197, 94, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Validar Usuario
                </h3>
                <p className="text-sm text-gray-400">Confirmar validación</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="mb-3 text-gray-300">
                ¿Estás seguro que deseas validar a este usuario?
              </p>
              <div className="rounded-xl p-4" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="font-semibold text-white mb-1">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-300">
                  {usuarioSeleccionado.email}
                </div>
                <div className="text-sm text-gray-500">
                  {usuarioSeleccionado.dni || 'Sin DNI'}
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                <p className="text-sm text-green-400">
                  ✓ Al validar, el usuario quedará apto para canjear premios.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalValidar(false);
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
                style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleValidar}
                disabled={procesando}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 font-semibold shadow-lg"
                style={{background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: 'white', border: 'none'}}
              >
                {procesando ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {mostrarModalRechazar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-6 fade-in-item">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl border-2" style={{background: 'rgba(30, 20, 50, 0.95)', borderColor: 'rgba(239, 68, 68, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L9.586 10 5.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Rechazar Usuario
                </h3>
                <p className="text-sm text-gray-400">Confirmar rechazo</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="mb-3 text-gray-300">
                ¿Estás seguro que deseas rechazar a este usuario?
              </p>
              <div className="rounded-xl p-4" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="font-semibold text-white mb-1">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-300">
                  {usuarioSeleccionado.email}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Describe el motivo por el cual se rechaza la validación..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 min-h-[120px] resize-none transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(239, 68, 68, 0.3)'}}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalRechazar(false);
                  setUsuarioSeleccionado(null);
                  setMotivoRechazo('');
                }}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
                style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 font-semibold shadow-lg"
                style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none'}}
              >
                {procesando ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {mostrarModalRol && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-6 fade-in-item">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl border-2" style={{background: 'rgba(30, 20, 50, 0.95)', borderColor: 'rgba(168, 85, 247, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Cambiar Rol
                </h3>
                <p className="text-sm text-gray-400">Modificar permisos</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="rounded-xl p-4 mb-4" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="font-semibold text-white mb-1">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-300">
                  Rol actual: <span className="font-bold text-purple-400">{usuarioSeleccionado.rol}</span>
                </div>
              </div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nuevo rol *
              </label>
              <select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value as 'cliente' | 'operador' | 'admin')}
                className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)'}}
              >
                <option value="cliente">CLIENTE</option>
                <option value="operador">OPERADOR</option>
                <option value="admin">ADMIN</option>
              </select>
              <p className="mt-2 text-xs text-gray-400">
                Cliente: Usuario estándar | Operador: Puede gestionar comprobantes | Admin: Control total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalRol(false);
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
                style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarRol}
                disabled={procesando}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 font-semibold shadow-lg"
                style={{background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: 'white', border: 'none'}}
              >
                {procesando ? 'Cambiando...' : 'Cambiar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bloquear/Desbloquear */}
      {mostrarModalBloqueo && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-6 fade-in-item">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl border-2" style={{background: 'rgba(30, 20, 50, 0.95)', borderColor: usuarioSeleccionado.estado === 'ACTIVO' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(34, 197, 94, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: usuarioSeleccionado.estado === 'ACTIVO' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'}}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {usuarioSeleccionado.estado === 'ACTIVO' ? (
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {usuarioSeleccionado.estado === 'ACTIVO' ? 'Bloquear Usuario' : 'Desbloquear Usuario'}
                </h3>
                <p className="text-sm text-gray-400">
                  {usuarioSeleccionado.estado === 'ACTIVO' ? 'Suspender acceso' : 'Restaurar acceso'}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="mb-3 text-gray-300">
                {usuarioSeleccionado.estado === 'ACTIVO' 
                  ? '¿Estás seguro que deseas bloquear a este usuario? No podrá acceder al sistema.' 
                  : '¿Estás seguro que deseas desbloquear a este usuario? Recuperará el acceso al sistema.'}
              </p>
              <div className="rounded-xl p-4" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="font-semibold text-white mb-1">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-300">
                  {usuarioSeleccionado.email}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Estado actual: <span className="font-bold">{usuarioSeleccionado.estado}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalBloqueo(false);
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
                style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleBloqueo}
                disabled={procesando}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 font-semibold shadow-lg"
                style={{background: usuarioSeleccionado.estado === 'ACTIVO' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: 'white', border: 'none'}}
              >
                {procesando ? (usuarioSeleccionado.estado === 'ACTIVO' ? 'Bloqueando...' : 'Desbloqueando...') : (usuarioSeleccionado.estado === 'ACTIVO' ? 'Bloquear' : 'Desbloquear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajustar Puntos */}
      {mostrarModalPuntos && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-6 fade-in-item">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl border-2" style={{background: 'rgba(30, 20, 50, 0.95)', borderColor: 'rgba(6, 182, 212, 0.5)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Ajustar Puntos
                </h3>
                <p className="text-sm text-gray-400">Modificar saldo manualmente</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="rounded-xl p-4 mb-4" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                <div className="font-semibold text-white mb-1">
                  {usuarioSeleccionado.nombre_completo}
                </div>
                <div className="text-sm text-gray-300">
                  Puntos actuales: <span className="font-bold text-cyan-400">{usuarioSeleccionado.puntos.toLocaleString()}</span>
                </div>
              </div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Cantidad de puntos *
              </label>
              <input
                type="number"
                value={nuevosPuntos}
                onChange={(e) => setNuevosPuntos(e.target.value)}
                placeholder="Ej: 100 para sumar, -50 para restar"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                style={{background: 'rgba(30, 20, 50, 0.6)', border: '1px solid rgba(6, 182, 212, 0.3)'}}
              />
              <p className="mt-2 text-xs text-gray-400">
                Usa números positivos para sumar (+) o negativos para restar (-) puntos
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalPuntos(false);
                  setUsuarioSeleccionado(null);
                  setNuevosPuntos('');
                }}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
                style={{background: 'rgba(139, 92, 246, 0.2)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleAjustarPuntos}
                disabled={procesando}
                className="flex-1 px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 font-semibold shadow-lg"
                style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: 'white', border: 'none'}}
              >
                {procesando ? 'Ajustando...' : 'Ajustar Puntos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
