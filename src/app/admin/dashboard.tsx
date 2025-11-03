'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalUsuarios: number;
  totalComprobantes: number;
  comprobantesPendientes: number;
  comprobantesAprobados: number;
  puntosOtorgadosHoy: number;
}

interface Usuario {
  nombre: string;
  nivel: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [usuario, setUsuario] = useState<Usuario>({ nombre: 'Admin', nivel: 'Fundador' });
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState(false);
  
  // Cargar hojas de estilo del tema
  useEffect(() => {
    const linkNexus = document.createElement('link');
    linkNexus.rel = 'stylesheet';
    linkNexus.href = '/css/nexus-theme.css';
    document.head.appendChild(linkNexus);

    const linkLab = document.createElement('link');
    linkLab.rel = 'stylesheet';
    linkLab.href = '/css/laboratorio-theme.css';
    document.head.appendChild(linkLab);

    return () => {
      document.head.removeChild(linkNexus);
      document.head.removeChild(linkLab);
    };
  }, []);
  
  const fechaActual = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    // Asegurar modo dark por defecto
    document.documentElement.classList.remove('light-mode');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Verificar sesión y rol de usuario
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        window.location.href = '/login';
        return;
      }

      // Cargar info del usuario y verificar rol
      const responseUser = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (!responseUser.ok) {
        window.location.href = '/login';
        return;
      }

      const userData = await responseUser.json();
      
      // 🛡️ PROTECCIÓN: Si NO es ADMIN, redirigir al dashboard normal
      if (userData.usuario.rol !== 'ADMIN') {
        window.location.href = '/dashboard';
        return;
      }

      setUsuario({
        nombre: userData.usuario.nombre_completo || 'Admin',
        nivel: userData.usuario.nivel || 'Administrador'
      });

      // Cargar stats
      const responseStats = await fetch('/api/admin/stats');
      if (responseStats.ok) {
        const data = await responseStats.json();
        setStats({
          ...data,
          totalComprobantes: data.comprobantesAprobados + data.comprobantesPendientes
        });
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      
      // Llamar al endpoint de logout (si existe)
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        }).catch(() => {
          // Si falla, continuar igual
        });
      }
      
      // Limpiar localStorage
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_data');
      
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar logout local aunque falle el servidor
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
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
          <p className="text-white font-medium">Cargando Panel de Administración...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando tu panel de control</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estilos específicos del admin */}
      <style jsx global>{`
        /* Asegurar modo dark por defecto */
        :root {
          --main-bg: #0a0a0f;
          --main-text: #ffffff;
          --heading-text: #ffffff;
          --muted-text: #9ca3af;
          --subtle-text: #6b7280;
          --card-bg: rgba(255, 255, 255, 0.05);
          --card-light-bg: rgba(255, 255, 255, 0.08);
          --card-border: rgba(255, 255, 255, 0.1);
          --input-bg: rgba(255, 255, 255, 0.05);
          --accent-purple: #a855f7;
          --accent-blue: #3b82f6;
          --accent-green: #10b981;
          --accent-yellow: #f59e0b;
          --accent-amber: #f59e0b;
          --accent-orange: #f97316;
          --accent-red: #ef4444;
          --accent-teal: #14b8a6;
          --accent-lime: #84cc16;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .kpi-card-icon-bg {
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--card-light-bg) 85%, var(--main-text) 12%), 
            color-mix(in srgb, var(--card-light-bg) 65%, var(--main-text) 8%));
          box-shadow: inset 0 1px 3px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.1);
        }
        html.light-mode .kpi-card-icon-bg {
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--card-light-bg) 90%, var(--main-text) 10%), 
            color-mix(in srgb, var(--card-light-bg) 75%, var(--main-text) 6%));
        }
        
        .kpi-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, 
            var(--card-light-bg), 
            color-mix(in srgb, var(--card-light-bg) 96%, var(--main-text) 2%));
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            var(--accent-blue), var(--accent-purple), var(--accent-amber), var(--accent-green));
          opacity: 0.7;
        }
        .kpi-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          border-color: color-mix(in srgb, var(--card-border) 60%, var(--accent-blue) 40%);
        }
        
        .action-card { 
          background-color: var(--card-light-bg); 
          border: 1px solid var(--card-border); 
          transition: all 0.2s ease-out;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.08);
        }
        .action-card .action-icon-bg {
          transition: background-color 0.3s ease;
        }
        .action-card:hover .action-icon-bg {
          background-color: color-mix(in srgb, var(--main-bg) 80%, currentColor 50%) !important;
        }
        .action-card:hover .action-text {
          color: currentColor !important;
        }
        
        /* Glassmorphism base */
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glassmorphism-light {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>

      
      <div className="min-h-screen relative overflow-hidden transition-colors duration-300 p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
        {/* Aurora Background Effects - Igual al dashboard usuario */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

      {/* Main Container con Glassmorphism */}
      <main className="glassmorphism w-full max-w-7xl mx-auto rounded-3xl shadow-2xl relative transition-all duration-300">
      {/* Header con Glassmorphism */}
      <header className="backdrop-blur-xl border-b sticky top-0 z-50 rounded-t-3xl overflow-hidden" style={{borderColor: 'var(--card-border)'}}>
        {/* Shimmer effect en header */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full" style={{animation: 'shimmer 3s infinite'}}></div>
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <a href="/admin">
                <img 
                  src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
                  alt="Logo Laboratorio 3D" 
                  className="h-8 sm:h-10"
                />
              </a>
              <h1 className="text-md sm:text-lg font-bold hidden lg:block" style={{color: 'var(--heading-text)'}}>
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setModalConfig(true)}
              type="button"
              title="Configuración"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{color: 'var(--muted-text)'}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-full hover:bg-red-500/20 transition-all duration-200"
              style={{color: 'var(--accent-red)'}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 md:p-8 rounded-b-3xl">
        
        {/* Bienvenida */}
        <section className="mb-8 md:mb-10 p-6 md:p-8 rounded-2xl shadow-xl glassmorphism-light" style={{borderLeftWidth: '4px', borderLeftColor: 'var(--accent-purple)'}}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 shadow-lg" style={{backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)'}}>
              <svg className="h-10 w-10 sm:h-12 sm:w-12" style={{color: 'var(--accent-purple)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{color: 'var(--heading-text)'}}>
                Bienvenido, <span style={{color: 'var(--accent-purple)'}}>{usuario.nombre.split(' ')[0]}</span>
              </h2>
              <p className="text-md font-medium mt-1" style={{color: 'var(--accent-purple)'}}>
                {usuario.nivel}
              </p>
              <p className="text-sm mt-1" style={{color: 'var(--muted-text)'}}>
                Panel de Control de Laboratorio 3D
              </p>
              <p className="text-xs mt-2 font-light" style={{color: 'var(--subtle-text)'}}>{fechaActual}</p>
            </div>
            {stats && stats.comprobantesPendientes > 0 && (
              <div className="mt-4 sm:mt-0 sm:ml-auto flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 items-center">
                <Link
                  href="/admin/validar"
                  className="btn-nexus inline-flex items-center text-white font-semibold py-2 px-4 text-xs sm:text-sm w-full sm:w-auto justify-center"
                  style={{backgroundColor: 'var(--accent-yellow)', color: 'var(--dark-text-on-light-bg)'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verificar ({stats.comprobantesPendientes})
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* KPIs */}
        <section className="mb-8 md:mb-10">
          <h3 className="text-xl sm:text-2xl font-semibold mb-5 fade-in-item" style={{animationDelay: '0.4s', color: 'var(--heading-text)'}}>Indicadores Clave</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            
            {/* Total Usuarios */}
            <div className="kpi-card glassmorphism rounded-xl p-4 sm:p-5 fade-in-item flex flex-col justify-between text-center sm:text-left" style={{animationDelay: '0.5s'}}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'var(--muted-text)'}}>Usuarios</p>
                  <div className="w-8 h-8 rounded-full kpi-card-icon-bg flex items-center justify-center">
                    <svg className="w-4 h-4" style={{color: 'var(--accent-blue)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl kpi-value font-bold" style={{color: 'var(--accent-blue)'}}>
                  {stats?.totalUsuarios || 0}
                </p>
              </div>
            </div>

            {/* Total Comprobantes */}
            <div className="kpi-card glassmorphism rounded-xl p-4 sm:p-5 fade-in-item flex flex-col justify-between text-center sm:text-left" style={{animationDelay: '0.6s'}}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'var(--muted-text)'}}>Comprobantes</p>
                  <div className="w-8 h-8 rounded-full kpi-card-icon-bg flex items-center justify-center">
                    <svg className="w-4 h-4" style={{color: 'var(--accent-green)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl kpi-value font-bold" style={{color: 'var(--accent-green)'}}>
                  {stats?.totalComprobantes || 0}
                </p>
              </div>
            </div>

            {/* Pendientes */}
            <Link
              href="/admin/validar"
              className="kpi-card glassmorphism rounded-xl p-4 sm:p-5 fade-in-item border-2 border-transparent hover:border-yellow-500/80 transition-all flex flex-col justify-between text-center sm:text-left"
              style={{animationDelay: '0.7s'}}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'var(--accent-yellow)'}}>Por Verificar</p>
                  <div className="w-8 h-8 rounded-full kpi-card-icon-bg flex items-center justify-center">
                    <svg className="w-4 h-4" style={{color: 'var(--accent-yellow)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl kpi-value font-bold" style={{color: 'var(--accent-yellow)'}}>
                  {stats?.comprobantesPendientes || 0}
                </p>
              </div>
            </Link>

            {/* Aprobados */}
            <div className="kpi-card glassmorphism rounded-xl p-4 sm:p-5 fade-in-item flex flex-col justify-between text-center sm:text-left" style={{animationDelay: '0.8s'}}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'var(--muted-text)'}}>Aprobados</p>
                  <div className="w-8 h-8 rounded-full kpi-card-icon-bg flex items-center justify-center">
                    <svg className="w-4 h-4" style={{color: 'var(--accent-teal)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl kpi-value font-bold" style={{color: 'var(--accent-teal)'}}>
                  {stats?.comprobantesAprobados || 0}
                </p>
              </div>
            </div>

            {/* Puntos Hoy */}
            <div className="kpi-card glassmorphism rounded-xl p-4 sm:p-5 fade-in-item flex flex-col justify-between text-center sm:text-left xs:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1" style={{animationDelay: '0.9s'}}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'var(--muted-text)'}}>Puntos Hoy</p>
                  <div className="w-8 h-8 rounded-full kpi-card-icon-bg flex items-center justify-center">
                    <svg className="w-4 h-4" style={{color: 'var(--accent-lime)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl kpi-value font-bold" style={{color: 'var(--accent-lime)'}}>
                  {stats?.puntosOtorgadosHoy || 0}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Acciones de Gestión */}
        <section className="mb-8 md:mb-10 fade-in-item" style={{animationDelay: '1s'}}>
          <h3 className="text-xl sm:text-2xl font-semibold mb-5" style={{color: 'var(--heading-text)'}}>Acciones de Gestión</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            <Link
              href="/admin/validar"
              className="action-card group rounded-xl p-5 flex items-start space-x-4 hover:border-yellow-400/70"
              style={{borderColor: 'var(--card-border)', ['--action-color' as any]: 'var(--accent-yellow)'}}
            >
              <div className="flex-shrink-0 p-3 rounded-lg action-icon-bg" style={{backgroundColor: 'color-mix(in srgb, var(--action-color) 15%, transparent)'}}>
                <svg className="h-7 w-7" style={{color: 'var(--action-color)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-md sm:text-lg font-semibold action-text" style={{color: 'var(--main-text)'}}>Validar Comprobantes</h4>
                <p className="text-xs sm:text-sm" style={{color: 'var(--muted-text)'}}>Aprobar y asignar puntos</p>
              </div>
            </Link>

            <Link
              href="/admin/usuarios"
              className="action-card group rounded-xl p-5 flex items-start space-x-4 hover:border-blue-400/70"
              style={{borderColor: 'var(--card-border)', ['--action-color' as any]: 'var(--accent-blue)'}}
            >
              <div className="flex-shrink-0 p-3 rounded-lg action-icon-bg" style={{backgroundColor: 'color-mix(in srgb, var(--action-color) 15%, transparent)'}}>
                <svg className="h-7 w-7" style={{color: 'var(--action-color)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-md sm:text-lg font-semibold action-text" style={{color: 'var(--main-text)'}}>Gestionar Usuarios</h4>
                <p className="text-xs sm:text-sm" style={{color: 'var(--muted-text)'}}>Ver y administrar usuarios</p>
              </div>
            </Link>

            <Link
              href="/admin/premios"
              className="action-card group rounded-xl p-5 flex items-start space-x-4 hover:border-amber-400/70"
              style={{borderColor: 'var(--card-border)', ['--action-color' as any]: 'var(--accent-amber)'}}
            >
              <div className="flex-shrink-0 p-3 rounded-lg action-icon-bg" style={{backgroundColor: 'color-mix(in srgb, var(--action-color) 15%, transparent)'}}>
                <svg className="h-7 w-7" style={{color: 'var(--action-color)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h4 className="text-md sm:text-lg font-semibold action-text" style={{color: 'var(--main-text)'}}>Gestionar Premios</h4>
                <p className="text-xs sm:text-sm" style={{color: 'var(--muted-text)'}}>Crear y editar premios</p>
              </div>
            </Link>

          </div>
        </section>

      </div>
      </main>

      {/* Modal Configuración */}
      {modalConfig && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setModalConfig(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md rounded-2xl shadow-2xl z-50 p-8" style={{backgroundColor: 'var(--card-light-bg)', border: '1px solid var(--card-border)'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{color: 'var(--heading-text)'}}>Configuración</h2>
              <button
                onClick={() => setModalConfig(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                style={{color: 'var(--muted-text)'}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-3">
              <Link 
                href="/admin/usuarios" 
                className="action-card group block w-full text-left p-3 rounded-lg hover:border-blue-400/70" 
                style={{color: 'var(--accent-blue)'}}
                onClick={() => setModalConfig(false)}
              >
                <span className="font-semibold">👥 Gestión de Usuarios</span>
              </Link>
              <Link 
                href="/admin/premios" 
                className="action-card group block w-full text-left p-3 rounded-lg hover:border-amber-400/70" 
                style={{color: 'var(--accent-amber)'}}
                onClick={() => setModalConfig(false)}
              >
                <span className="font-semibold">🎁 Premios</span>
              </Link>
              <Link 
                href="/admin/niveles" 
                className="action-card group block w-full text-left p-3 rounded-lg hover:border-orange-400/70" 
                style={{color: 'var(--accent-orange)'}}
                onClick={() => setModalConfig(false)}
              >
                <span className="font-semibold">🏆 Niveles de Lealtad</span>
              </Link>
              <Link 
                href="/admin/referidos" 
                className="action-card group block w-full text-left p-3 rounded-lg hover:border-lime-400/70" 
                style={{color: 'var(--accent-lime)'}}
                onClick={() => setModalConfig(false)}
              >
                <span className="font-semibold">🔗 Sistema de Referidos</span>
              </Link>
              <Link 
                href="/admin/historial-puntos" 
                className="action-card group block w-full text-left p-3 rounded-lg hover:border-purple-400/70" 
                style={{color: 'var(--accent-purple)'}}
                onClick={() => setModalConfig(false)}
              >
                <span className="font-semibold">📊 Historial de Puntos</span>
              </Link>
            </nav>
          </div>
        </>
      )}
      </div>
    </>
  );
}
