'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  puntos: number;
  nivel: string;
  rol: string;
}

interface NivelLealtad {
  id: number;
  nombre: string;
  icono: string | null;
  puntos_requeridos: number;
  multiplicador: number;
  descripcion: string | null;
  orden: number;
}

export default function Navbar() {
  const pathname = usePathname();
  
  // Hooks deben ir ANTES de cualquier return
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [nivelesLealtad, setNivelesLealtad] = useState<NivelLealtad[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Verificar sesión - usando useCallback para estabilizar la referencia
  const verificarSesion = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      
      if (!sessionId) {
        setLoading(false);
        return;
      }

      // Cargar niveles de lealtad
      try {
        const nivelesResponse = await fetch('/api/niveles');
        if (nivelesResponse.ok) {
          const nivelesData = await nivelesResponse.json();
          setNivelesLealtad(nivelesData.niveles || []);
        }
      } catch (err) {
        console.error('Error cargando niveles:', err);
      }

      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.usuario) {
          setUsuario(data.usuario);
        }
      } else {
        // Sesión inválida, limpiar localStorage
        localStorage.removeItem('session_id');
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          }
        });
      }
      localStorage.removeItem('session_id');
      setUsuario(null);
      setMenuAbierto(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Determinar nivel automáticamente según puntos usando niveles de la BD
  const getNivelAutomatico = (puntos: number): string => {
    if (!nivelesLealtad || nivelesLealtad.length === 0) {
      // Fallback si no hay niveles cargados
      if (puntos >= 20000) return 'Oro';
      if (puntos >= 10000) return 'Plata';
      return 'Bronce';
    }

    // Buscar el nivel más alto que cumpla con los puntos requeridos
    const nivelesOrdenados = [...nivelesLealtad].sort((a, b) => b.puntos_requeridos - a.puntos_requeridos);
    
    for (const nivel of nivelesOrdenados) {
      if (puntos >= nivel.puntos_requeridos) {
        return nivel.nombre;
      }
    }
    
    // Si no alcanza ningún nivel, devolver el primero (menor)
    return nivelesLealtad[0]?.nombre || 'Bronce';
  };

  // Obtener color de nivel
  const getColorNivel = (nivel: string) => {
    const nivelNormalizado = nivel.toLowerCase();
    const colores: Record<string, string> = {
      'bronce': 'from-[#CD7F32] to-[#B87333]',
      'plata': 'from-[#C0C0C0] to-[#A8A8A8]',
      'oro': 'from-[#FFD700] to-[#D4AF37]',
      'diamante': 'from-[#B9F2FF] to-[#8CD4E8]',
      'esmeralda': 'from-[#50C878] to-[#3FA564]',
      'fundador': 'from-[#FF6B6B] to-[#FF8C42]',
    };
    return colores[nivelNormalizado] || colores['bronce'];
  };

  // Obtener emoji de nivel
  const getEmojiNivel = (nivel: string) => {
    const nivelNormalizado = nivel.toLowerCase();
    const emojis: Record<string, string> = {
      'bronce': '🥉',
      'plata': '🥈',
      'oro': '🥇',
      'diamante': '💎',
      'esmeralda': '💚',
      'fundador': '👑',
    };
    return emojis[nivelNormalizado] || '🥉';
  };

  // Verificar sesión al montar el componente
  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  // Rutas donde NO se debe mostrar el navbar
  const rutasOcultas = ['/login', '/registro', '/recuperar', '/dashboard', '/admin', '/bloqueado'];
  const ocultarNavbar = rutasOcultas.some(ruta => pathname.startsWith(ruta)) || pathname?.startsWith('/reset-password') || pathname === '/forgot-password';

  // Si el navbar debe estar oculto, no renderizar nada
  if (ocultarNavbar) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#2a2a2a]/80 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <img 
            src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
            alt="Logo Laboratorio 3D" 
            className="h-10 transition-transform duration-300 group-hover:rotate-[10deg]"
          />
          <span className="font-bold text-xl text-white hidden sm:inline">Laboratorio 3D</span>
        </Link>
        
        {/* Menu de usuario o botones de login */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : usuario ? (
            // Usuario autenticado
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Puntos - Visible en pantallas medianas y grandes */}
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-amber-400">{usuario.puntos.toLocaleString()}</span>
                <span className="text-xs text-amber-300/70">pts</span>
              </div>

              {/* Nivel Badge */}
              {(() => {
                const nivelActual = getNivelAutomatico(usuario.puntos || 0);
                return (
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r ${getColorNivel(nivelActual)} rounded-full shadow-lg`}>
                    <span className="text-lg">{getEmojiNivel(nivelActual)}</span>
                    <span className="font-bold text-sm text-white">{nivelActual}</span>
                  </div>
                );
              })()}

              {/* Menú desplegable de usuario */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 group"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColorNivel(getNivelAutomatico(usuario.puntos || 0))} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Nombre - Oculto en móvil */}
                  <span className="hidden lg:block text-white font-medium text-sm max-w-[150px] truncate">
                    {usuario.nombre_completo.split(' ')[0]}
                  </span>
                  
                  {/* Icono flecha */}
                  <svg 
                    className={`w-4 h-4 text-white transition-transform duration-300 ${menuAbierto ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {menuAbierto && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header del menú */}
                    <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-b border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getColorNivel(getNivelAutomatico(usuario.puntos || 0))} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {usuario.nombre_completo.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{usuario.nombre_completo}</p>
                          <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                        </div>
                      </div>
                      
                      {/* Stats rápidos */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">Puntos</p>
                          <p className="font-bold text-amber-400">{usuario.puntos.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">Nivel</p>
                          <p className="font-bold text-white">{getEmojiNivel(getNivelAutomatico(usuario.puntos || 0))} {getNivelAutomatico(usuario.puntos || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú */}
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuAbierto(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group"
                      >
                        <svg className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-white font-medium">Mi Dashboard</p>
                          <p className="text-xs text-gray-400">Ver mi progreso y premios</p>
                        </div>
                      </Link>

                      {/* Opción admin si es admin */}
                      {usuario.rol === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group"
                        >
                          <svg className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-white font-medium">Panel Admin</p>
                            <p className="text-xs text-gray-400">Administración del sistema</p>
                          </div>
                        </Link>
                      )}

                      <div className="border-t border-white/10 my-2"></div>

                      <Link
                        href="/"
                        onClick={() => setMenuAbierto(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group"
                      >
                        <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-white font-medium">Cómo funciona</p>
                          <p className="text-xs text-gray-400">Ver niveles y beneficios</p>
                        </div>
                      </Link>

                      <div className="border-t border-white/10 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors group"
                      >
                        <svg className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <div className="flex-1 text-left">
                          <p className="text-red-400 font-medium">Cerrar Sesión</p>
                          <p className="text-xs text-gray-400">Salir de mi cuenta</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Usuario no autenticado
            <>
              <Link
                href="/login"
                className="text-[#a0a0a0] hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="px-6 py-2.5 bg-[#3498db] text-white rounded-full hover:bg-[#2980b9] transition-all duration-300 hover:shadow-lg font-semibold text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
