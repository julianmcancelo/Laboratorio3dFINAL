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

  // Cargar tema desde localStorage
  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema') as 'dark' | 'light';
    if (temaGuardado) {
      setTema(temaGuardado);
      if (temaGuardado === 'light') {
        document.documentElement.classList.add('light-mode');
      }
    }
  }, []);

  // Toggle de tema
  const toggleTema = () => {
    const nuevoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    localStorage.setItem('tema', nuevoTema);
    
    if (nuevoTema === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  // Verificar sesión y cargar datos del usuario
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

        if (response.ok) {
          const data = await response.json();
          console.log('👤 Usuario cargado:', data.usuario);
          console.log('💎 Puntos del usuario:', data.usuario.puntos);
          setUsuario(data.usuario);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        router.push('/login');
      }
    };

    verificarSesion();
  }, [router]);

  // Cargar premios y canjes previos
  useEffect(() => {
    const cargarDatos = async () => {
      const sessionId = localStorage.getItem('session_id');
      
      try {
        // Cargar niveles de lealtad
        const nivelesResponse = await fetch('/api/niveles');
        if (nivelesResponse.ok) {
          const nivelesData = await nivelesResponse.json();
          setNivelesLealtad(nivelesData.niveles || []);
          console.log('📊 Niveles cargados:', nivelesData.niveles);
        }

        // Cargar premios
        const responsePremios = await fetch('/api/premios/publicos');
        const dataPremios = await responsePremios.json();
        
        if (dataPremios.success) {
          setPremios(dataPremios.premios);
          setPremiosFiltrados(dataPremios.premios);
        }

        // Cargar historial de canjes del usuario
        if (sessionId) {
          const responseCanjes = await fetch('/api/canjes', {
            headers: {
              'Authorization': `Bearer ${sessionId}`
            }
          });
          
          if (responseCanjes.ok) {
            const dataCanjes = await responseCanjes.json();
            if (dataCanjes.success && dataCanjes.canjes) {
              // Extraer IDs de premios ya canjeados
              const idsCanjeados = new Set<number>(
                dataCanjes.canjes
                  .filter((canje: any) => canje.premio_id) // Filtrar solo canjes con premio_id válido
                  .map((canje: any) => Number(canje.premio_id))
              );
              setPremiosCanjeados(idsCanjeados);
              console.log('🎁 Premios ya canjeados:', Array.from(idsCanjeados));
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let resultado = [...premios];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por nivel
    if (filtroNivel !== 'todos') {
      resultado = resultado.filter(p => {
        if (filtroNivel === 'bronce') return p.puntos_requeridos < 10000;
        if (filtroNivel === 'plata') return p.puntos_requeridos >= 10000 && p.puntos_requeridos < 20000;
        if (filtroNivel === 'oro') return p.puntos_requeridos >= 20000;
        return true;
      });
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      if (ordenar === 'puntos_asc') return a.puntos_requeridos - b.puntos_requeridos;
      if (ordenar === 'puntos_desc') return b.puntos_requeridos - a.puntos_requeridos;
      if (ordenar === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });

    setPremiosFiltrados(resultado);
  }, [premios, busqueda, filtroNivel, ordenar]);

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
    // 🎁 Validar puntos suficientes, stock y que no esté canjeado (aunque NO se descuenten)
    return usuario && 
           usuario.puntos >= premio.puntos_requeridos &&
           premio.stock > 0 &&
           !premiosCanjeados.has(premio.id); // 🚫 No permitir duplicados
  };

  // Verificar si el premio ya fue canjeado
  const yaCanjeado = (premioId: number) => {
    return premiosCanjeados.has(premioId);
  };

  // Manejar canje
  const handleCanjear = async () => {
    if (!premioSeleccionado || !usuario) return;

    console.log('🎁 Iniciando canje...');
    console.log('💎 Puntos ANTES del canje:', usuario.puntos);
    console.log('🏷️ Premio seleccionado:', premioSeleccionado.nombre);
    console.log('💰 Puntos requeridos:', premioSeleccionado.puntos_requeridos);

    setCanjeando(true);
    
    try {
      const sessionId = localStorage.getItem('session_id');
      
      const response = await fetch('/api/canjes', {
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
      console.log('📦 Respuesta del servidor:', data);

      if (response.ok) {
        console.log('✅ Canje exitoso!');
        console.log('💎 Puntos NO se descuentan. Mantiene:', data.puntos_restantes);
        
        alert(`🎉 ¡Canje exitoso!\n\nHas canjeado: ${premioSeleccionado.nombre}\n\n✨ Los puntos NO se descuentan\nTus puntos actuales: ${data.puntos_restantes}`);
        setMostrarModal(false);
        
        // Los puntos NO cambian, pero actualizamos por si acaso
        setUsuario(prev => prev ? { ...prev, puntos: data.puntos_restantes } : null);
        
        // Marcar premio como canjeado
        setPremiosCanjeados(prev => new Set(prev).add(premioSeleccionado.id));
        
        // Recargar premios para actualizar stock
        setTimeout(() => window.location.reload(), 1500);
      } else {
        console.error('❌ Error en el canje:', data);
        alert(`❌ Error: ${data.error || data.mensaje || 'No se pudo completar el canje'}`);
      }
    } catch (error) {
      console.error('Error al canjear:', error);
      alert('Error al procesar el canje');
    } finally {
      setCanjeando(false);
    }
  };

  if (loading || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--main-bg)'}}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-orange-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-orange-600 mx-auto opacity-20"></div>
          </div>
          <p className="font-medium" style={{color: 'var(--heading-text)'}}>Cargando catálogo...</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted-text)'}}>Preparando tus premios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {tema === 'dark' ? (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl"></div>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header con Toggle de Tema y Navegación */}
        <div className="flex justify-between items-center mb-6 fade-in-item">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all" style={{color: 'var(--muted-text)'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver</span>
          </Link>

          {/* Toggle de tema */}
          <button
            onClick={toggleTema}
            className="p-3 rounded-xl transition-all duration-300 hover:scale-110"
            style={{backgroundColor: 'var(--card-bg)', color: 'var(--heading-text)'}}
            aria-label="Cambiar tema"
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

        {/* Header Principal con Info del Usuario */}
        <div className="glassmorphism-light fade-in-item relative rounded-2xl p-6 mb-6 shadow-xl transition-all duration-500 overflow-hidden group border-l-4" style={{borderLeftColor: 'var(--accent-amber)'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight" style={{color: 'var(--heading-text)'}}>
                🎁 Catálogo de Premios
              </h1>
              <p style={{color: 'var(--muted-text)'}}>Descubre qué podés obtener con tus puntos</p>
            </div>
            
            {/* Puntos del usuario */}
            <div className="glassmorphism rounded-2xl px-6 py-4 border" style={{borderColor: 'var(--card-border)'}}>
              <p className="text-sm mb-1" style={{color: 'var(--muted-text)'}}>Tus Puntos Disponibles</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{color: 'var(--accent-amber)'}} title={`Puntos: ${usuario.puntos || 0}`}>
                  {(usuario.puntos || 0).toLocaleString()}
                </span>
                <span style={{color: 'var(--muted-text)'}}>pts</span>
              </div>
              <p className="text-xs mt-1" style={{color: 'var(--muted-text)'}}>
                Nivel: {getNivelAutomatico(usuario.puntos || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="glassmorphism-light fade-in-item relative rounded-2xl p-6 mb-6 shadow-xl" style={{animationDelay: '0.1s'}}>
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar premios..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-nexus w-full pl-12"
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{color: 'var(--muted-text)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filtros y ordenamiento */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por nivel */}
              <div className="flex-1">
                <label className="label-nexus">Filtrar por nivel</label>
                <select
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value as any)}
                  className="input-nexus w-full"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="bronce"> Bronce (menos de 10k pts)</option>
                  <option value="plata"> Plata (10k - 20k pts)</option>
                  <option value="oro"> Oro (más de 20k pts)</option>
                </select>
              </div>

              {/* Ordenar */}
              <div className="flex-1">
                <label className="label-nexus">Ordenar por</label>
                <select
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value as any)}
                  className="input-nexus w-full"
                >
                  <option value="puntos_asc">Puntos (menor a mayor)</option>
                  <option value="puntos_desc">Puntos (mayor a menor)</option>
                  <option value="nombre">Nombre (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-sm" style={{color: 'var(--muted-text)'}}>
              Mostrando {premiosFiltrados.length} de {premios.length} premios
            </div>
          </div>
        </div>

        {/* Grid de premios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {premiosFiltrados.map((premio) => {
            const colorNivel = getColorNivel(premio.puntos_requeridos);
            const emojiNivel = getEmojiNivel(premio.puntos_requeridos);
            const nombreNivel = getNombreNivel(premio.puntos_requeridos);
            const canCanjear = puedeCanjear(premio);
            const esAdmin = ['ADMIN', 'SUPERADMIN'].includes(usuario.rol?.toUpperCase() || '');
            const estaDesbloqueado = canCanjear || esAdmin;

            return (
              <div
                key={premio.id}
                className={`prize-card glassmorphism-light relative border-2 rounded-xl p-4 transition-all duration-400 overflow-hidden shadow-lg fade-in-item ${
                  estaDesbloqueado 
                    ? getBorderColorUsuario()
                    : tema === 'dark'
                    ? 'border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/30 hover:border-gray-600'
                    : 'border-gray-300/50 bg-gradient-to-br from-gray-50/80 to-gray-100/60 hover:border-gray-400'
                }`}
                style={{animationDelay: `${Math.min(0.6, premio.id * 0.1)}s`}}
              >
                {/* Imagen del premio */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {premio.imagen_url ? (
                    <img 
                      src={premio.imagen_url} 
                      alt={premio.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">{emojiNivel}</div>
                  )}
                  
                  {/* Badge de nivel */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${colorNivel} text-white text-sm font-bold shadow-lg`}>
                    {emojiNivel} {nombreNivel}
                  </div>

                  {/* Badge de stock */}
                  {premio.stock === 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold shadow-lg">
                      ⚠️ Agotado
                    </div>
                  )}
                  
                  {/* Badge de ya canjeado */}
                  {yaCanjeado(premio.id) && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-bold shadow-lg">
                      ✅ Ya Canjeado
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 flex flex-col mt-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ring-2 shadow-lg ${
                      estaDesbloqueado 
                        ? `bg-gradient-to-br ${getIconColorUsuario()}`
                        : tema === 'dark' ? 'bg-gray-700 ring-gray-800' : 'bg-gray-300 ring-gray-400'
                    }`}>
                      {estaDesbloqueado ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{color: tema === 'dark' ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}}>
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="text-center font-bold text-sm mb-1 leading-tight" style={{color: estaDesbloqueado ? 'var(--heading-text)' : 'var(--muted-text)'}}>
                    {premio.nombre}
                  </h3>
                  <p className="text-center text-xs mb-2 line-clamp-2 flex-1" style={{color: 'var(--muted-text)'}}>
                    {premio.descripcion}
                  </p>

                  <div className="border-t pt-2 mt-1" style={{borderColor: 'var(--card-border)'}}></div>

                  {/* Puntos requeridos */}
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5" style={{color: estaDesbloqueado ? 'var(--accent-amber)' : 'var(--muted-text)'}}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xl font-bold">{premio.puntos_requeridos.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Estado del usuario */}
                  {yaCanjeado(premio.id) ? (
                    <div className="mb-3 text-sm text-green-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      ✅ Ya canjeaste este premio
                    </div>
                  ) : canCanjear ? (
                    <div className="mb-3 text-sm text-green-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      ¡Podés canjearlo! ✨ Los puntos NO se descuentan
                    </div>
                  ) : premio.stock === 0 ? (
                    <div className="mb-3 text-sm text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Sin stock disponible
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-orange-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Te faltan {(premio.puntos_requeridos - (usuario.puntos || 0)).toLocaleString()} pts
                    </div>
                  )}

                  {/* Mensaje de estado */}
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-center mb-2 mt-2" style={{color: estaDesbloqueado ? 'var(--accent-green)' : 'var(--muted-text)'}}>
                    {yaCanjeado(premio.id)
                      ? '✓ YA CANJEADO'
                      : estaDesbloqueado
                      ? '✓ DISPONIBLE'
                      : premio.stock === 0
                      ? '⚠ SIN STOCK'
                      : `FALTAN ${(premio.puntos_requeridos - (usuario.puntos || 0)).toLocaleString()} PTS`}
                  </p>

                  {/* Botón de canje */}
                  <button
                    onClick={() => {
                      setPremioSeleccionado(premio);
                      setMostrarModal(true);
                    }}
                    disabled={!canCanjear || yaCanjeado(premio.id)}
                    className={`btn-nexus w-full py-2.5 rounded-xl font-bold transition-all duration-300 ${
                      canCanjear && !yaCanjeado(premio.id)
                        ? 'hover:scale-105'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: canCanjear && !yaCanjeado(premio.id) ? 'var(--accent-amber)' : 'var(--input-bg)',
                      color: canCanjear && !yaCanjeado(premio.id) ? '#fff' : 'var(--muted-text)'
                    }}
                  >
                    {yaCanjeado(premio.id) 
                      ? '✅ Ya Canjeado' 
                      : canCanjear 
                      ? '🎁 Canjear Ahora' 
                      : premio.stock === 0 
                      ? '⚠️ Agotado' 
                      : '🔒 Insuficiente'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sin resultados */}
        {premiosFiltrados.length === 0 && (
          <div className="glassmorphism-light rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" style={{color: 'var(--muted-text)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{color: 'var(--heading-text)'}}>No se encontraron premios</h3>
            <p className="text-sm" style={{color: 'var(--muted-text)'}}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {mostrarModal && premioSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glassmorphism-light rounded-2xl border max-w-md w-full p-8" style={{borderColor: 'var(--card-border)'}}>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--heading-text)'}}>Confirmar Canje</h3>
            
            <div className="mb-6">
              <p className="mb-4" style={{color: 'var(--muted-text)'}}>¿Estás seguro que querés canjear:</p>
              <div className="glassmorphism rounded-xl p-4 border" style={{borderColor: 'var(--card-border)'}}>
                <p className="font-bold text-lg mb-3" style={{color: 'var(--heading-text)'}}>{premioSeleccionado.nombre}</p>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span style={{color: 'var(--muted-text)'}}>Puntos requeridos:</span>
                    <span className="font-bold" style={{color: 'var(--accent-amber)'}}>{premioSeleccionado.puntos_requeridos.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{color: 'var(--muted-text)'}}>Tus puntos actuales:</span>
                    <span className="font-bold" style={{color: 'var(--accent-green)'}}>{(usuario.puntos || 0).toLocaleString()} pts</span>
                  </div>
                </div>
                <div className="border rounded-lg p-3 mt-3" style={{
                  backgroundColor: tema === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                  borderColor: tema === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{color: 'var(--accent-purple)'}}>Los puntos NO se descuentan</p>
                      <p className="text-xs mt-1" style={{color: 'var(--muted-text)'}}>Después del canje seguirás teniendo {(usuario.puntos || 0).toLocaleString()} pts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                disabled={canjeando}
                className="btn-nexus flex-1 py-3 rounded-xl font-bold transition-colors"
                style={{backgroundColor: 'var(--input-bg)', color: 'var(--muted-text)'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleCanjear}
                disabled={canjeando}
                className="btn-nexus flex-1 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{backgroundColor: 'var(--accent-amber)', color: '#fff'}}
              >
                {canjeando ? 'Canjeando...' : 'Confirmar Canje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
