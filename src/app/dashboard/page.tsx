/**
 * 🎯 Mi Portal de Lealtad - Laboratorio 3D
 * 
 * Dashboard con estética dark/naranja:
 * - Tema oscuro profesional
 * - Acentos en naranja (#FF8C00)
 * - Responsive mobile-first
 * - Carrera de premios
 * - Historial de puntos y compras
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../dashboard-animations.css';
import ModalCargarComprobante from '@/components/ModalCargarComprobante';
import ListaComprobantes from '@/components/ListaComprobantes';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  puntos: number;
  nivel: string;
  codigo_referido?: string;
  instagram?: string;
  rol: string;
}

interface Premio {
  id: number;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  imagen_url?: string;
  activo: boolean;
  categoria?: string;
}

interface Estadisticas {
  usuario: {
    id: number;
    nombre_completo: string;
    email: string;
    puntos: number;
    nivel: string;
    codigo_referido?: string;
    creado_en: string;
  };
  nivel_actual: {
    id: number;
    nombre: string;
    puntos_requeridos: number;
    beneficios: string;
    orden: number;
  } | null;
  siguiente_nivel: {
    id: number;
    nombre: string;
    puntos_requeridos: number;
    beneficios: string;
    orden: number;
  } | null;
  puntos_para_siguiente: number;
  progreso_actual: number;
  total_compras: number;
  puntos_gastados_totales: number;
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

interface MovimientoPuntos {
  id: number;
  fecha: string;
  tipo: 'GANANCIA' | 'GASTO';
  puntos: number;
  descripcion: string;
}

interface CompraVerificada {
  id: number;
  fecha_aprobacion: string;
  monto: number;
  descripcion: string;
  puntos_otorgados: number;
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [premios, setPremios] = useState<Premio[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificaciones, setNotificaciones] = useState<string[]>([]);
  const [tema, setTema] = useState<'dark' | 'light'>('dark');
  const [copiado, setCopiado] = useState(false);
  const [recargarComprobantes, setRecargarComprobantes] = useState(0);
  const [nivelesLealtad, setNivelesLealtad] = useState<NivelLealtad[]>([]);
  const [historialPuntos, setHistorialPuntos] = useState<MovimientoPuntos[]>([]);
  const [comprasVerificadas, setComprasVerificadas] = useState<CompraVerificada[]>([]);
  
  // Estados para colapsar secciones (por defecto cerradas si están vacías)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    premios: true,
    historial: false,
    compras: false,
    admin: true
  });

  const toggleSeccion = (seccion: keyof typeof seccionesAbiertas) => {
    setSeccionesAbiertas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Cargar tema desde localStorage
  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema') as 'dark' | 'light';
    if (temaGuardado) {
      setTema(temaGuardado);
      // Aplicar clase al HTML para Nexus Theme
      if (temaGuardado === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    }
  }, []);

  // Toggle tema con sistema Nexus
  const toggleTema = () => {
    const nuevoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    localStorage.setItem('tema', nuevoTema);
    
    // Aplicar/remover clase light-mode en HTML
    if (nuevoTema === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  // Copiar código al portapapeles
  const copiarCodigo = async () => {
    if (!usuario?.codigo_referido) return;
    
    try {
      await navigator.clipboard.writeText(usuario.codigo_referido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = usuario.codigo_referido;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      } catch (err) {
        console.error('Error en fallback:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Compartir por WhatsApp
  const compartirWhatsApp = () => {
    if (!usuario?.codigo_referido) return;
    
    const mensaje = `¡Hola! 👋\n\nÚnete a Lab3D y comienza a ganar puntos con mi código de referido: *${usuario.codigo_referido}*\n\n¡Ambos obtendremos beneficios! 🎁🚀`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Verificar si hay sesión activa y cargar datos
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          window.location.href = '/login';
          return;
        }

        // Obtener datos del usuario
        const response = await fetch(`/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (!response.ok) {
          throw new Error('Sesión inválida');
        }

        const data = await response.json();
        if (data.usuario) {
          // 🛡️ REDIRECCIÓN: Si es ADMIN, forzar ir al dashboard de admin
          if (data.usuario.rol === 'ADMIN') {
            window.location.href = '/admin';
            return;
          }
          
          setUsuario(data.usuario);
          
          // Generar notificaciones personalizadas
          const notifs = generarNotificaciones(data.usuario);
          setNotificaciones(notifs);
        }

        // Obtener niveles de lealtad
        const nivelesResponse = await fetch('/api/niveles');
        if (nivelesResponse.ok) {
          const nivelesData = await nivelesResponse.json();
          setNivelesLealtad(nivelesData.niveles || []);
          console.log('📊 Niveles cargados:', nivelesData.niveles);
        }

        // Obtener premios disponibles
        const premiosResponse = await fetch('/api/premios');
        if (premiosResponse.ok) {
          const premiosData = await premiosResponse.json();
          setPremios(premiosData.premios?.slice(0, 6) || []); // Mostrar primeros 6
        }

        // Obtener estadísticas detalladas
        try {
          const statsResponse = await fetch(`/api/usuarios/estadisticas/${data.usuario.id}`, {
            headers: {
              'Authorization': `Bearer ${sessionId}`
            }
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setEstadisticas(statsData);
          }
        } catch (statsError) {
          console.log('No se pudieron cargar estadísticas detalladas');
        }

        // Obtener historial de puntos
        try {
          const historialResponse = await fetch(`/api/usuarios/${data.usuario.id}/historial-puntos`, {
            headers: {
              'Authorization': `Bearer ${sessionId}`
            }
          });
          
          if (historialResponse.ok) {
            const historialData = await historialResponse.json();
            const movimientos = historialData.movimientos || [];
            setHistorialPuntos(movimientos);
            console.log('📈 Historial de puntos cargado:', movimientos);
            
            // Abrir sección si tiene datos
            if (movimientos.length > 0) {
              setSeccionesAbiertas(prev => ({ ...prev, historial: true }));
            }
          }
        } catch (historialError) {
          console.log('No se pudo cargar el historial de puntos');
        }

        // Obtener compras verificadas
        try {
          const comprasResponse = await fetch(`/api/usuarios/${data.usuario.id}/compras-verificadas`, {
            headers: {
              'Authorization': `Bearer ${sessionId}`
            }
          });
          
          if (comprasResponse.ok) {
            const comprasData = await comprasResponse.json();
            const compras = comprasData.compras || [];
            setComprasVerificadas(compras);
            console.log('🛒 Compras verificadas cargadas:', compras);
            
            // Abrir secciones si tienen datos
            if (compras.length > 0) {
              setSeccionesAbiertas(prev => ({ ...prev, compras: true }));
            }
          }
        } catch (comprasError) {
          console.log('No se pudieron cargar las compras verificadas');
        }

      } catch (err) {
        console.error('Error verificando sesión:', err);
        setError('Error al cargar el dashboard');
        if (err instanceof Error && err.message.includes('Sesión')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, [recargarComprobantes]); // Recargar cuando cambie este valor

  // Generar notificaciones personalizadas
  const generarNotificaciones = (user: Usuario): string[] => {
    const notifs: string[] = [];
    
    if (user.puntos >= 10000) {
      notifs.push('🎉 ¡Felicidades! Has alcanzado el nivel Platino');
    } else if (user.puntos >= 6000) {
      notifs.push('🏆 ¡Excelente! Eres nivel Oro');
    } else if (user.puntos >= 3000) {
      notifs.push('⭐ ¡Buen trabajo! Has alcanzado nivel Plata');
    }
    
    if (user.puntos >= 1500 && user.puntos < 2000) {
      notifs.push('🎁 Estás a punto de canjear tu primer premio');
    }
    
    if (user.rol === 'ADMIN') {
      notifs.push('🛡️ Tienes permisos de administrador');
    }
    
    return notifs;
  };

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
      window.location.href = '/login';
    } catch (err) {
      console.error('Error en logout:', err);
      localStorage.removeItem('session_id');
      window.location.href = '/login';
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

  // Obtener siguiente nivel
  const getSiguienteNivel = (nivelActual: string): NivelLealtad | null => {
    if (!nivelesLealtad || nivelesLealtad.length === 0) return null;
    
    const nivelActualObj = nivelesLealtad.find(n => n.nombre === nivelActual);
    if (!nivelActualObj) return null;
    
    const nivelesOrdenados = [...nivelesLealtad].sort((a, b) => a.puntos_requeridos - b.puntos_requeridos);
    const indexActual = nivelesOrdenados.findIndex(n => n.nombre === nivelActual);
    
    return nivelesOrdenados[indexActual + 1] || null;
  };

  // Funciones helper para determinar colores según PUNTOS (nivel automático)
  const getBorderColorUsuario = () => {
    if (!usuario) return '';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') {
      // Oro
      return tema === 'dark' 
        ? 'border-[#FFD700]/50 bg-gradient-to-br from-yellow-900/30 via-amber-900/20 to-yellow-900/30 shadow-yellow-900/50'
        : 'border-[#FFD700]/50 bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-yellow-50/80 shadow-yellow-300/40';
    }
    if (nivelActual === 'Plata') {
      // Plata
      return tema === 'dark'
        ? 'border-[#C0C0C0]/50 bg-gradient-to-br from-gray-600/30 via-gray-500/20 to-gray-600/30 shadow-gray-600/50'
        : 'border-[#C0C0C0]/50 bg-gradient-to-br from-gray-100/80 via-slate-50/60 to-gray-100/80 shadow-gray-300/40';
    }
    // Bronce (default)
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

  // Color del borde según nivel del usuario
  const getBorderColorByNivel = () => {
    if (!usuario) return '#CD7F32'; // Bronce por defecto
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') return '#FFD700'; // Dorado
    if (nivelActual === 'Plata') return '#C0C0C0'; // Plateado
    return '#CD7F32'; // Bronce
  };

  // Color del número de puntos según nivel
  const getColorPuntosByNivel = () => {
    if (!usuario) return '#CD7F32';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') return '#FFD700'; // Dorado
    if (nivelActual === 'Plata') return '#C0C0C0'; // Plateado
    return '#CD7F32'; // Bronce (Naranja cobre)
  };

  // Gradiente para botones según nivel
  const getGradienteBotonByNivel = () => {
    if (!usuario) return 'from-orange-600 to-amber-600';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') return 'from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600';
    if (nivelActual === 'Plata') return 'from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600';
    return 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700';
  };

  // Shadow según nivel
  const getShadowByNivel = () => {
    if (!usuario) return 'shadow-orange-500/50';
    
    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    
    if (nivelActual === 'Oro') return 'shadow-yellow-500/50';
    if (nivelActual === 'Plata') return 'shadow-gray-500/50';
    return 'shadow-orange-500/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-orange-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-orange-600 mx-auto opacity-20"></div>
          </div>
          <p className="text-white font-medium">Cargando tu portal...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando tu experiencia de lealtad</p>
        </div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-6 py-4 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error || 'No se pudo cargar la información del usuario'}</span>
            </div>
          </div>
          <Link href="/login" className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  // Calcular progreso de nivel usando niveles dinámicos
  const calcularProgreso = () => {
    if (!usuario || !nivelesLealtad || nivelesLealtad.length === 0) {
      return { progreso: 0, puntosFaltantes: 0, siguienteNivel: null };
    }

    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
    const siguienteNivel = getSiguienteNivel(nivelActual);
    
    if (!siguienteNivel) {
      // Ya está en el nivel máximo
      return { progreso: 100, puntosFaltantes: 0, siguienteNivel: null };
    }

    const nivelActualObj = nivelesLealtad.find(n => n.nombre === nivelActual);
    const puntosActuales = usuario.puntos || 0;
    const puntosMinimos = nivelActualObj?.puntos_requeridos || 0;
    const puntosRequeridos = siguienteNivel.puntos_requeridos;
    
    const progreso = Math.min(100, ((puntosActuales - puntosMinimos) / (puntosRequeridos - puntosMinimos)) * 100);
    const puntosFaltantes = Math.max(0, puntosRequeridos - puntosActuales);
    
    return { progreso, puntosFaltantes, siguienteNivel };
  };

  const { progreso: progresoNivel, puntosFaltantes: puntosParaSiguiente, siguienteNivel } = calcularProgreso();

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 p-4 md:p-8" style={{backgroundColor: 'var(--main-bg)', color: 'var(--main-text)'}}>
      {/* Aurora Background Effects - Estilo mis_premios.php */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {tema === 'dark' ? (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        )}
      </div>
      {/* Main Container con Glassmorphism Nexus */}
      <main className="glassmorphism w-full max-w-6xl mx-auto rounded-3xl shadow-2xl relative transition-all duration-300">
      {/* Header con Glassmorphism Mejorado */}
      <header className="backdrop-blur-xl border-b sticky top-0 z-50 rounded-t-3xl overflow-hidden" style={{borderColor: 'var(--card-border)'}}>
        {/* Shimmer effect en header */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" style={{animation: 'shimmer 3s infinite'}}></div>
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Logo sin fondo - transparente */}
              <div className="w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <img 
                  src={`/niveles/${getNivelAutomatico(usuario.puntos || 0).toLowerCase()}.png`}
                  alt={`Logo ${getNivelAutomatico(usuario.puntos || 0)}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback a ícono por defecto si no carga
                    e.currentTarget.src = '/logo-default.png';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{color: 'var(--heading-text)'}}>
                  Mi Portal de Lealtad
                </h1>
                <p className="text-xs hidden sm:block" style={{color: 'var(--muted-text)'}}>Tu espacio de puntos y recompensas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Toggle Tema con estilo Nexus */}
              <button
                onClick={toggleTema}
                className="btn-nexus p-2.5 rounded-xl hover:scale-110 active:scale-95"
                style={{backgroundColor: 'var(--input-bg)', color: tema === 'dark' ? 'var(--accent-amber)' : 'var(--accent-purple)'}}
                title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {tema === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="btn-nexus px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 group hover:scale-105 active:scale-95"
                style={{backgroundColor: 'var(--input-bg)', color: 'var(--accent-red)'}}
                title="Cerrar sesión"
              >
                <span className="hidden sm:inline">Salir</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Welcome Section con efectos premium */}
        <div className="glassmorphism-light fade-in-item relative rounded-2xl p-4 sm:p-6 mb-6 shadow-xl transition-all duration-500 overflow-hidden group border-l-4" style={{borderLeftColor: 'var(--accent-amber)'}}>
          {/* Welcome Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Info del Usuario */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar con Badge de Nivel */}
                <div className="relative">
                  {(() => {
                    const nivelNormalizado = getNivelAutomatico(usuario.puntos || 0).toLowerCase();
                    const gradientes: Record<string, string> = {
                      'bronce': 'linear-gradient(135deg, #CD7F32 0%, #E8A87C 50%, #B87333 100%)',
                      'plata': 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%)',
                      'oro': 'linear-gradient(135deg, #FFD700 0%, #FFF4A3 50%, #D4AF37 100%)',
                      'diamante': 'linear-gradient(135deg, #B9F2FF 0%, #E8F9FF 50%, #8CD4E8 100%)',
                      'esmeralda': 'linear-gradient(135deg, #50C878 0%, #A8E6B8 50%, #3FA564 100%)',
                      'fundador': 'linear-gradient(135deg, #FF6B6B 0%, #FFB366 50%, #FF8C42 100%)',
                    };
                    
                    return (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-xl hover:scale-110 transition-all duration-300 relative overflow-hidden group" 
                        style={{
                          background: gradientes[nivelNormalizado] || gradientes['bronce'],
                          borderColor: 'rgba(255,255,255,0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                          src={`/niveles/${nivelNormalizado}.png`}
                          alt={`Nivel ${getNivelAutomatico(usuario.puntos || 0)}`}
                          className="w-full h-full object-contain p-2 relative z-10"
                          onError={(e) => {
                            // Fallback a ícono si la imagen no carga
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden');
                          }}
                        />
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 hidden" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight" style={{color: 'var(--heading-text)'}}>
                    {usuario.nombre_completo}
                  </h2>
                  {(() => {
                    const nivelActual = getNivelAutomatico(usuario.puntos || 0);
                    const nivelNormalizado = nivelActual.toLowerCase();
                    const gradientes: Record<string, string> = {
                      'bronce': 'linear-gradient(135deg, #CD7F32 0%, #E8A87C 50%, #B87333 100%)',
                      'plata': 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%)',
                      'oro': 'linear-gradient(135deg, #FFD700 0%, #FFF4A3 50%, #D4AF37 100%)',
                      'diamante': 'linear-gradient(135deg, #B9F2FF 0%, #E8F9FF 50%, #8CD4E8 100%)',
                      'esmeralda': 'linear-gradient(135deg, #50C878 0%, #A8E6B8 50%, #3FA564 100%)',
                      'fundador': 'linear-gradient(135deg, #FF6B6B 0%, #FFB366 50%, #FF8C42 100%)',
                    };
                    
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105" style={{background: gradientes[nivelNormalizado] || gradientes['bronce']}}>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <img 
                            src={`/niveles/${nivelNormalizado}.png`}
                            alt={nivelActual}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-bold text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{nivelActual}</p>
                      </div>
                    );
                  })()}
                  <p className="text-sm flex items-center gap-2" style={{color: 'var(--muted-text)'}}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="truncate">{usuario.email}</span>
                  </p>
                </div>
              </div>

              {/* Points Display con efecto pulse */}
              <div className="glassmorphism-light relative rounded-xl p-4 sm:p-5 mb-4 shadow-lg transition-all duration-300 overflow-hidden group border-2" style={{borderColor: getColorPuntosByNivel()}}>
                {/* Points Pulse Animation - color dinámico */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[pointsPulse_2s_ease-in-out_infinite] pointer-events-none" 
                  style={{
                    background: `radial-gradient(circle, ${getColorPuntosByNivel()}20 0%, transparent 70%)`
                  }}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight" style={{
                      color: getColorPuntosByNivel(), 
                      filter: `drop-shadow(0 0 20px ${getColorPuntosByNivel()}66)`
                    }}>
                      {usuario.puntos.toLocaleString()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium" style={{color: 'var(--muted-text)'}}>puntos</span>
                      <span className="text-xs" style={{color: 'var(--muted-text)'}}>totales</span>
                    </div>
                  </div>
                  
                  {/* Botón al catálogo de premios - color dinámico según nivel */}
                  <Link 
                    href="/premios"
                    className={`flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${getGradienteBotonByNivel()} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl ${getShadowByNivel()}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <span>Ver Catálogo de Premios</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Referral Section con glow effect */}
              <div className="glassmorphism-light relative border-2 border-dashed rounded-xl p-4 sm:p-5 transition-all duration-300 group overflow-hidden" style={{borderColor: 'var(--accent-green)'}}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{color: 'var(--accent-green)'}}>Programa de Referidos</h3>
                      <p className="text-xs" style={{color: 'var(--muted-text)'}}>Invita amigos y gana beneficios</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="label-nexus">Tu código de referido:</label>
                      <div className="relative border-2 rounded-lg px-4 py-3 font-mono font-black text-center text-lg overflow-hidden group/code hover:scale-105 transition-all duration-300 cursor-pointer" 
                        style={{borderColor: 'var(--accent-green)', backgroundColor: 'var(--input-bg)', color: 'var(--accent-green)'}}
                        onClick={copiarCodigo}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 -translate-x-full group-hover/code:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 tracking-wider">{usuario.codigo_referido}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={copiarCodigo}
                        className="btn-nexus relative text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: copiado ? 'var(--accent-green)' : 'var(--accent-blue)'}}
                        disabled={copiado}
                      >
                        {copiado ? (
                          <>
                            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="relative z-10">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span className="relative z-10">Copiar</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={compartirWhatsApp}
                        className="btn-nexus relative text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 overflow-hidden"
                        style={{backgroundColor: '#25D366'}}
                      >
                        <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="relative z-10">Compartir</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t" style={{borderColor: 'var(--card-border)'}}>
                    <button className="btn-nexus w-full text-sm flex items-center justify-center gap-2 py-2.5 rounded-lg" style={{backgroundColor: 'var(--input-bg)', color: 'var(--muted-text)'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>¿Cómo funciona el programa?</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card - Estilo Premium con colores dinámicos */}
            <div className="lg:w-56 flex flex-col items-center justify-center relative">
              <div className="text-center">
                <p className="text-xs mb-4 font-semibold uppercase tracking-wider" style={{color: 'var(--muted-text)'}}>Progreso General</p>
                <div className="w-36 h-36 mx-auto relative group">
                  {/* Glow Ring - color dinámico según nivel */}
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"
                    style={{
                      background: `linear-gradient(to right, ${getColorPuntosByNivel()}33, ${getColorPuntosByNivel()}22)`
                    }}
                  ></div>
                  
                  <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      fill="none" 
                      stroke="var(--card-border)"
                      strokeWidth="6"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      fill="none" 
                      stroke={getColorPuntosByNivel()}
                      strokeWidth="6" 
                      strokeDasharray={`${progresoNivel * 2.64} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                      style={{
                        filter: `drop-shadow(0 0 8px ${getColorPuntosByNivel()}99)`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span 
                      className="text-3xl font-black tracking-tight transition-transform group-hover:scale-110 duration-300" 
                      style={{
                        color: getColorPuntosByNivel(), 
                        filter: `drop-shadow(0 0 10px ${getColorPuntosByNivel()}66)`
                      }}
                    >
                      {Math.round(progresoNivel)}%
                    </span>
                  </div>
                </div>
              </div>
              {siguienteNivel && (
                <div className="text-center mt-4 pt-4 border-t" style={{borderColor: 'var(--card-border)'}}>
                  <p className="text-xs mb-1" style={{color: 'var(--muted-text)'}}>Próximo nivel:</p>
                  <p className="font-bold text-base mb-1" style={{color: 'var(--heading-text)'}}>{siguienteNivel.nombre}</p>
                  <p className="text-sm font-semibold" style={{color: getColorPuntosByNivel()}}>{puntosParaSiguiente.toLocaleString()} pts restantes</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Botón Modal Cargar Comprobante - con colores dinámicos */}
        <ModalCargarComprobante 
          usuarioId={usuario.id}
          onComprobanteSubido={() => setRecargarComprobantes(prev => prev + 1)}
          gradienteBoton={getGradienteBotonByNivel()}
          shadowClasses={getShadowByNivel()}
        />

        {/* Lista de Comprobantes */}
        <ListaComprobantes 
          usuarioId={usuario.id}
          recargar={recargarComprobantes > 0}
          borderColor={getBorderColorByNivel()}
        />

        {/* Historial de Puntos */}
        <div className="progress-card glassmorphism-light fade-in-item relative rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{animationDelay: '0.3s', borderTopColor: getBorderColorByNivel()}}>
          <div 
            className="flex items-center gap-3 pb-4 cursor-pointer"
            style={{borderBottom: seccionesAbiertas.historial ? '1px solid var(--card-border)' : 'none'}}
            onClick={() => toggleSeccion('historial')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold" style={{color: 'var(--heading-text)'}}>Historial de Puntos</h2>
              <p className="text-xs" style={{color: 'var(--muted-text)'}}>Últimos 10 movimientos</p>
            </div>
            <button className="btn-nexus p-2 rounded-lg">
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${seccionesAbiertas.historial ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{color: 'var(--muted-text)'}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {seccionesAbiertas.historial && (
          <div className="history-table overflow-x-auto rounded-xl relative z-10" style={{backgroundColor: tema === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'}}>
            <table className="table-nexus">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Puntos</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {historialPuntos.length > 0 ? (
                  historialPuntos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td className="text-xs" style={{color: 'var(--muted-text)'}}>
                        {new Date(movimiento.fecha).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          movimiento.tipo === 'GANANCIA'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {movimiento.tipo === 'GANANCIA' ? '+ Ingreso' : '- Gasto'}
                        </span>
                      </td>
                      <td className="font-bold" style={{color: movimiento.tipo === 'GANANCIA' ? 'var(--accent-green)' : 'var(--accent-red)'}}>
                        {movimiento.tipo === 'GANANCIA' ? '+' : '-'}{movimiento.puntos.toLocaleString()}
                      </td>
                      <td className="text-sm" style={{color: 'var(--main-text)'}}>
                        {movimiento.descripcion}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <p className="text-sm" style={{color: 'var(--muted-text)'}}>No hay movimientos de puntos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Mis Compras Verificadas */}
        <div className="progress-card glassmorphism-light fade-in-item relative rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{animationDelay: '0.4s', borderTopColor: getBorderColorByNivel()}}>
          <div 
            className="flex items-center gap-3 pb-4 cursor-pointer"
            style={{borderBottom: seccionesAbiertas.compras ? '1px solid var(--card-border)' : 'none'}}
            onClick={() => toggleSeccion('compras')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold" style={{color: 'var(--heading-text)'}}>Mis Compras Verificadas</h2>
              <p className="text-xs" style={{color: 'var(--muted-text)'}}>Últimas 5 compras confirmadas</p>
            </div>
            <button className="btn-nexus p-2 rounded-lg">
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${seccionesAbiertas.compras ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{color: 'var(--muted-text)'}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {seccionesAbiertas.compras && (
          <div className="history-table overflow-x-auto rounded-xl relative z-10" style={{backgroundColor: tema === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'}}>
            <table className="table-nexus">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Puntos</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {comprasVerificadas.length > 0 ? (
                  comprasVerificadas.map((compra) => (
                    <tr key={compra.id}>
                      <td className="text-xs" style={{color: 'var(--muted-text)'}}>
                        {new Date(compra.fecha_aprobacion).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="font-bold" style={{color: 'var(--accent-amber)'}}>
                        ${compra.monto.toLocaleString('es-AR')}
                      </td>
                      <td className="font-semibold" style={{color: 'var(--accent-green)'}}>
                        +{compra.puntos_otorgados.toLocaleString()}
                      </td>
                      <td className="text-sm" style={{color: 'var(--main-text)'}}>
                        {compra.descripcion}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <p className="text-sm" style={{color: 'var(--muted-text)'}}>No tienes compras verificadas</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        {usuario.rol === 'ADMIN' && (
          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-600/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl shadow-orange-900/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <h2 className="text-xl font-bold text-white">Panel de Administrador</h2>
              </div>
              <Link
                href="/admin"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <span>📊</span>
                <span>Ir al Panel Completo</span>
                <span>→</span>
              </Link>
            </div>
            <p className="text-gray-300 text-sm mb-4">Accesos rápidos o ve al panel completo para más opciones</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                href="/admin/usuarios"
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl text-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95"
              >
                <div className="text-2xl mb-2">👥</div>
                <div>Gestionar Usuarios</div>
              </Link>
              <Link 
                href="/admin/premios"
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl text-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95"
              >
                <div className="text-2xl mb-2">🎁</div>
                <div>Gestionar Premios</div>
              </Link>
              <Link 
                href="/admin/validar"
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl text-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95"
              >
                <div className="text-2xl mb-2">✓</div>
                <div>Validar Usuarios</div>
              </Link>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
