'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../dashboard-animations.css';

interface Premio {
  id: number;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  imagen_url: string | null;
  stock: number;
  activo: boolean;
}

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

export default function PremiosPage() {
  const router = useRouter();
  const [premios, setPremios] = useState<Premio[]>([]);
  const [premiosFiltrados, setPremiosFiltrados] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<'todos' | 'bronce' | 'plata' | 'oro'>('todos');
  const [ordenar, setOrdenar] = useState<'puntos_asc' | 'puntos_desc' | 'nombre'>('puntos_asc');
  const [premioSeleccionado, setPremioSeleccionado] = useState<Premio | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [canjeando, setCanjeando] = useState(false);
  const [premiosCanjeados, setPremiosCanjeados] = useState<Set<number>>(new Set());
  const [nivelesLealtad, setNivelesLealtad] = useState<NivelLealtad[]>([]);
  const [tema, setTema] = useState<'dark' | 'light'>('dark');

  // Toggle tema
  const toggleTema = () => {
    const nuevoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    localStorage.setItem('theme', nuevoTema);
    
    // Actualizar variables CSS
    const root = document.documentElement;
    if (nuevoTema === 'dark') {
      root.style.setProperty('--main-bg', '#0f172a');
      root.style.setProperty('--main-text', '#f1f5f9');
      root.style.setProperty('--muted-text', '#94a3b8');
      root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.8)');
      root.style.setProperty('--heading-text', '#f8fafc');
      root.style.setProperty('--accent-amber', '#f59e0b');
      root.style.setProperty('--accent-blue', '#3b82f6');
      root.style.setProperty('--accent-purple', '#8b5cf6');
      root.style.setProperty('--accent-green', '#10b981');
      root.style.setProperty('--accent-red', '#ef4444');
    } else {
      root.style.setProperty('--main-bg', '#f8fafc');
      root.style.setProperty('--main-text', '#1e293b');
      root.style.setProperty('--muted-text', '#64748b');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--heading-text', '#0f172a');
      root.style.setProperty('--accent-amber', '#f59e0b');
      root.style.setProperty('--accent-blue', '#3b82f6');
      root.style.setProperty('--accent-purple', '#8b5cf6');
      root.style.setProperty('--accent-green', '#10b981');
      root.style.setProperty('--accent-red', '#ef4444');
    }
  };

  // Cargar tema al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTema(savedTheme);
    toggleTema();
  }, []);

  // Cargar datos del usuario
  useEffect(() => {
    cargarDatosUsuario();
    cargarNivelesLealtad();
  }, []);

  // Cargar premios
  useEffect(() => {
    if (usuario) {
      cargarPremios();
    }
  }, [usuario]);

  // Filtrar y ordenar premios
  useEffect(() => {
    let filtrados = [...premios];

    // Filtrar por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por nivel
    if (filtroNivel !== 'todos') {
      filtrados = filtrados.filter(p => {
        if (filtroNivel === 'bronce') return p.puntos_requeridos < 10000;
        if (filtroNivel === 'plata') return p.puntos_requeridos >= 10000 && p.puntos_requeridos < 20000;
        if (filtroNivel === 'oro') return p.puntos_requeridos >= 20000;
        return true;
      });
    }

    // Ordenar
    filtrados.sort((a, b) => {
      if (ordenar === 'puntos_asc') return a.puntos_requeridos - b.puntos_requeridos;
      if (ordenar === 'puntos_desc') return b.puntos_requeridos - a.puntos_requeridos;
      if (ordenar === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });

    setPremiosFiltrados(filtrados);
  }, [premios, busqueda, filtroNivel, ordenar]);

  const cargarDatosUsuario = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // 🚫 VERIFICAR SI ESTÁ BLOQUEADO
        if (data.usuario.apto_para_canje === false) {
          localStorage.setItem('user_data', JSON.stringify(data.usuario));
          router.push('/bloqueado');
          return;
        }
        
        setUsuario(data.usuario);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      router.push('/login');
    }
  };

  const cargarPremios = async () => {
    try {
      const response = await fetch('/api/premios/publicos');
      const data = await response.json();
      
      if (data.success) {
        setPremios(data.premios);
        
        // Cargar premios ya canjeados
        await cargarPremiosCanjeados();
      }
    } catch (error) {
      console.error('Error cargando premios:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarNivelesLealtad = async () => {
    try {
      const response = await fetch('/api/niveles');
      const data = await response.json();
      
      if (data.success) {
        setNivelesLealtad(data.niveles || []);
      }
    } catch (error) {
      console.error('Error cargando niveles:', error);
    }
  };

  const cargarPremiosCanjeados = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) return;

      const response = await fetch('/api/premios/canjeados', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const canjeadosSet = new Set<number>(data.premiosCanjeados?.map((p: any) => p.premio_id) || []);
        setPremiosCanjeados(canjeadosSet);
      }
    } catch (error) {
      console.error('Error cargando premios canjeados:', error);
    }
  };

  // Determinar nivel automáticamente según puntos usando niveles de la BD
  const getNivelAutomatico = (puntos: number): string => {
    if (!nivelesLealtad || nivelesLealtad.length === 0) {
      if (puntos >= 20000) return 'Oro';
      if (puntos >= 10000) return 'Plata';
      return 'Bronce';
    }

    const nivelesOrdenados = [...nivelesLealtad].sort((a, b) => b.puntos_requeridos - a.puntos_requeridos);
    
    for (const nivel of nivelesOrdenados) {
      if (puntos >= nivel.puntos_requeridos) {
        return nivel.nombre;
      }
    }
    
    return nivelesLealtad[0]?.nombre || 'Bronce';
  };

  // Determinar color del nivel PARA EL PREMIO (no del usuario)
  const getColorNivel = (puntos: number) => {
    if (puntos >= 20000) return 'from-[#FFD700] to-[#D4AF37]'; // Oro
    if (puntos >= 10000) return 'from-[#C0C0C0] to-[#A8A8A8]'; // Plata
    return 'from-[#CD7F32] to-[#B87333]'; // Bronce
  };

  const getEmojiNivel = (puntos: number) => {
    if (puntos >= 20000) return '🥇';
    if (puntos >= 10000) return '🥈';
    return '🥉';
  };

  const getNombreNivel = (puntos: number) => {
    if (puntos >= 20000) return 'Oro';
    if (puntos >= 10000) return 'Plata';
    return 'Bronce';
  };

  // Funciones para colores según nivel del USUARIO
  const getBorderColorUsuario = () => {
    if (!usuario) return '';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') {
      return tema === 'dark' 
        ? 'border-[#FFD700]/50 bg-gradient-to-br from-yellow-900/30 via-amber-900/20 to-yellow-900/30 shadow-yellow-900/50'
        : 'border-[#FFD700]/50 bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-yellow-50/80 shadow-yellow-300/40';
    }
    if (nivelActual === 'Plata') {
      return tema === 'dark'
        ? 'border-[#C0C0C0]/50 bg-gradient-to-br from-gray-600/30 via-gray-500/20 to-gray-600/30 shadow-gray-600/50'
        : 'border-[#C0C0C0]/50 bg-gradient-to-br from-gray-100/80 via-slate-50/60 to-gray-100/80 shadow-gray-300/40';
    }
    return tema === 'dark'
      ? 'border-[#CD7F32]/50 bg-gradient-to-br from-orange-900/30 via-amber-900/20 to-orange-900/30 shadow-orange-900/50'
      : 'border-[#CD7F32]/50 bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-orange-50/80 shadow-orange-300/40';
  };

  const getIconColorUsuario = () => {
    if (!usuario) return '';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') {
      return 'from-yellow-500 to-amber-500 shadow-yellow-500/50 ring-yellow-500/30';
    }
    if (nivelActual === 'Plata') {
      return 'from-gray-400 to-gray-500 shadow-gray-500/50 ring-gray-500/30';
    }
    return 'from-orange-500 to-amber-600 shadow-orange-500/50 ring-orange-500/30';
  };

  const formatearPesos = (puntos: number) => {
    return `$${(puntos * 1000).toLocaleString('es-AR')}`;
  };

  // Verificar si el usuario puede canjear
  const puedeCanjear = (premio: Premio) => {
    return usuario && 
           usuario.puntos >= premio.puntos_requeridos &&
           premio.stock > 0 &&
           !premiosCanjeados.has(premio.id);
  };

  // Verificar si el premio ya fue canjeado
  const yaCanjeado = (premioId: number) => {
    return premiosCanjeados.has(premioId);
  };

  // Manejar canje
  const handleCanjear = async () => {
    if (!premioSeleccionado || !usuario) return;

    setCanjeando(true);

    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch('/api/premios/canjear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          premio_id: premioSeleccionado.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar UI
        setPremiosCanjeados(prev => {
          const newSet = new Set(prev);
          newSet.add(premioSeleccionado.id);
          return newSet;
        });
        setMostrarModal(false);
        
        // Recargar datos del usuario
        await cargarDatosUsuario();
        
        alert('¡Premio canjeado exitosamente!');
      } else {
        alert(data.error || 'Error al canjear el premio');
      }
    } catch (error) {
      console.error('Error canjeando premio:', error);
      alert('Error de conexión al canjear el premio');
    } finally {
      setCanjeando(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando premios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center gap-3 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm" style={{backgroundColor: 'var(--card-bg)', color: 'var(--muted-text)'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Volver</span>
          </Link>

          <button
            onClick={toggleTema}
            className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            style={{backgroundColor: 'var(--card-bg)', color: 'var(--heading-text)'}}
          >
            {tema === 'dark' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* User Info Card */}
        <div className={`rounded-3xl p-8 mb-8 shadow-2xl backdrop-blur-md transition-all duration-500 ${getBorderColorUsuario()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getIconColorUsuario()} flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-2`}>
                {usuario?.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>
                  {usuario?.nombre_completo}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    Nivel {getNivelAutomatico(usuario?.puntos || 0)}
                  </span>
                  <span style={{color: 'var(--muted-text)'}} className="text-sm">
                    {usuario?.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                {usuario?.puntos?.toLocaleString() || 0}
              </div>
              <div style={{color: 'var(--muted-text)'}} className="text-sm">
                Puntos disponibles
              </div>
              <div className="text-lg font-semibold mt-1" style={{color: 'var(--heading-text)'}}>
                {formatearPesos(usuario?.puntos || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎁 Catálogo de Premios
          </h1>
          <p style={{color: 'var(--muted-text)'}} className="text-xl">
            Canjea tus puntos por productos exclusivos
          </p>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-md rounded-2xl p-6 mb-8 shadow-xl" style={{backgroundColor: 'var(--card-bg)'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--heading-text)'}}>
                🔍 Buscar premios
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{
                  backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: tema === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: 'var(--main-text)'
                }}
              />
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--heading-text)'}}>
                🏆 Filtrar por nivel
              </label>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{
                  backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: tema === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: 'var(--main-text)'
                }}
              >
                <option value="todos">Todos los niveles</option>
                <option value="bronce">🥉 Bronce</option>
                <option value="plata">🥈 Plata</option>
                <option value="oro">🥇 Oro</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--heading-text)'}}>
                📊 Ordenar por
              </label>
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{
                  backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: tema === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: 'var(--main-text)'
                }}
              >
                <option value="puntos_asc">Menor puntos</option>
                <option value="puntos_desc">Mayor puntos</option>
                <option value="nombre">Alfabético</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p style={{color: 'var(--muted-text)'}} className="text-lg">
            Se encontraron <span className="font-bold" style={{color: 'var(--heading-text)'}}>{premiosFiltrados.length}</span> premios
          </p>
        </div>

        {/* Premios Grid */}
        {premiosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>
              No se encontraron premios
            </h3>
            <p style={{color: 'var(--muted-text)'}}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiosFiltrados.map((premio) => {
              const puedeCanjearPremio = puedeCanjear(premio);
              const yaFueCanjeado = yaCanjeado(premio.id);
              
              return (
                <div
                  key={premio.id}
                  className={`group relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                    yaFueCanjeado 
                      ? 'opacity-75' 
                      : puedeCanjearPremio 
                        ? 'ring-2 ring-green-500/50 hover:ring-green-500/70' 
                        : 'opacity-90'
                  }`}
                  style={{
                    backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    border: yaFueCanjeado ? '2px solid #ef4444' : puedeCanjearPremio ? '2px solid #10b981' : '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                >
                  {/* Level Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${getColorNivel(premio.puntos_requeridos)} z-10`}>
                    {getEmojiNivel(premio.puntos_requeridos)} {getNombreNivel(premio.puntos_requeridos)}
                  </div>

                  {/* Status Badge */}
                  {yaFueCanjeado && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold bg-red-500 z-10">
                      ✅ Ya canjeado
                    </div>
                  )}

                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {premio.imagen_url ? (
                      <img 
                        src={premio.imagen_url} 
                        alt={premio.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl opacity-50">🎁</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3" style={{color: 'var(--heading-text)'}}>
                      {premio.nombre}
                    </h3>
                    
                    <p className="mb-4 line-clamp-2" style={{color: 'var(--muted-text)'}}>
                      {premio.descripcion}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {premio.puntos_requeridos.toLocaleString()} pts
                        </div>
                        <div className="text-sm" style={{color: 'var(--muted-text)'}}>
                          {formatearPesos(premio.puntos_requeridos)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium" style={{color: 'var(--muted-text)'}}>
                          Stock
                        </div>
                        <div className={`text-lg font-bold ${premio.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {premio.stock}
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => {
                        if (yaFueCanjeado) return;
                        if (!puedeCanjearPremio) {
                          alert('No tienes puntos suficientes para este premio');
                          return;
                        }
                        setPremioSeleccionado(premio);
                        setMostrarModal(true);
                      }}
                      disabled={yaFueCanjeado || !puedeCanjearPremio}
                      className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                        yaFueCanjeado 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : puedeCanjearPremio 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {yaFueCanjeado ? 'Ya canjeado' : puedeCanjearPremio ? 'Canjear ahora' : 'Puntos insuficientes'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {mostrarModal && premioSeleccionado && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl" style={{backgroundColor: 'var(--card-bg)'}}>
              <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--heading-text)'}}>
                Confirmar Canje
              </h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--heading-text)'}}>
                  {premioSeleccionado.nombre}
                </h4>
                <p style={{color: 'var(--muted-text)'}} className="mb-4">
                  {premioSeleccionado.descripcion}
                </p>
                
                <div className="flex justify-between items-center p-4 rounded-xl" style={{backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(0, 0, 0, 0.05)'}}>
                  <span style={{color: 'var(--muted-text)'}}>Costo:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {premioSeleccionado.puntos_requeridos.toLocaleString()} pts
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl mt-2" style={{backgroundColor: tema === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(0, 0, 0, 0.05)'}}>
                  <span style={{color: 'var(--muted-text)'}}>Tus puntos:</span>
                  <span className="text-xl font-bold text-green-600">
                    {usuario?.puntos?.toLocaleString()} pts
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl mt-2" style={{backgroundColor: tema === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)'}}>
                  <span style={{color: 'var(--muted-text)'}}>Puntos restantes:</span>
                  <span className="text-xl font-bold text-green-600">
                    {(usuario?.puntos || 0) - premioSeleccionado.puntos_requeridos} pts
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-200"
                  style={{backgroundColor: tema === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)', color: 'var(--main-text)'}}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCanjear}
                  disabled={canjeando}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                >
                  {canjeando ? 'Canjeando...' : 'Confirmar Canje'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
