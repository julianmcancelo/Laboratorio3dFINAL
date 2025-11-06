'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Premio {
  id: number;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  imagen_base64?: string | null;
  tipo_imagen?: string | null;
  stock: number;
  activo: boolean;
}

export default function Home() {
  const [autenticado, setAutenticado] = useState(false);
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loadingPremios, setLoadingPremios] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      setAutenticado(true);
    }
  }, []);

  // Cargar premios desde la API
  useEffect(() => {
    const cargarPremios = async () => {
      try {
        console.log('Cargando premios...');
        const response = await fetch('/api/premios/publicos');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Data recibida:', data);
        console.log('Premios:', data.premios);
        console.log('Total premios:', data.premios?.length || 0);
        
        if (data.success) {
          setPremios(data.premios);
        }
      } catch (error) {
        console.error('Error al cargar premios:', error);
      } finally {
        setLoadingPremios(false);
      }
    };

    cargarPremios();
  }, []);

  // Determinar el color del nivel según los puntos
  const getColorNivel = (puntos: number) => {
    if (puntos >= 20000) return 'from-[#FFD700] to-[#D4AF37]'; // Oro
    if (puntos >= 10000) return 'from-[#C0C0C0] to-[#A8A8A8]'; // Plata
    return 'from-[#CD7F32] to-[#B87333]'; // Bronce
  };

  // Determinar el nombre del nivel
  const getNombreNivel = (puntos: number) => {
    if (puntos >= 20000) return 'Oro';
    if (puntos >= 10000) return 'Plata';
    return 'Bronce';
  };

  // Formatear puntos a pesos
  const formatearPesos = (puntos: number) => {
    return `$${(puntos * 1000).toLocaleString('es-AR')}`;
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#e0e0e0]">

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto z-10 pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4">
        <section className="text-center mb-20">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 text-white leading-tight">
              <span className="text-white">En Laboratorio 3D:</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
                Cada Compra te Devuelve Más
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto text-[#a0a0a0] leading-relaxed">
              Sumá puntos en cada compra y canjealos por descuentos, filamentos y beneficios exclusivos. <strong className="text-white">Gratis, rápido y pensado para potenciar tus proyectos.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {!autenticado && (
                <Link
                  href="/registro"
                  className="inline-block px-12 py-6 text-xl font-bold rounded-full bg-[#3498db] text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-[#2980b9]"
                >
                  Unirme al Programa
                </Link>
              )}
              {autenticado && (
                <Link
                  href="/dashboard"
                  className="px-12 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-500 transform hover:scale-110 hover:shadow-2xl"
                >
                  Ir al Dashboard
                </Link>
              )}
            </div>

            {/* Indicadores de beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">500 Puntos</h3>
                <p className="text-sm text-[#a0a0a0] text-center">de bienvenida = $500.000</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Registro Rápido</h3>
                <p className="text-sm text-[#a0a0a0] text-center">en menos de 2 minutos</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Premios Exclusivos</h3>
                <p className="text-sm text-[#a0a0a0] text-center">hasta impresoras 3D</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video del dueño */}
        <section className="mb-16">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
            <iframe
              src="https://www.youtube.com/embed/7oBnL_P8IUU?si=F7yE4vXPewTedXDp"
              title="Video del Dueño - Programa de Referidos Laboratorio 3D"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <p className="text-center text-sm mt-4 text-[#a0a0a0]">
            Conocé de primera mano cómo funciona nuestro programa de puntos y referidos
          </p>
        </section>

        {/* CTA ¿Listo para empezar? */}
        <section className="text-center mb-20">
          <div className="relative overflow-hidden rounded-3xl p-12 border backdrop-blur-sm bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border-white/10">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                ¿Listo para empezar?
              </h2>
              <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-[#a0a0a0]">
                Únete a cientos de makers que ya están aprovechando nuestro programa de puntos
              </p>
              {!autenticado && (
                <Link
                  href="/registro"
                  className="inline-block px-12 py-6 text-xl font-bold rounded-full bg-[#3498db] text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-[#2980b9]"
                >
                  Quiero empezar a sumar puntos
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Tu Carrera de Recompensas */}
        <section id="niveles" className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Tu Carrera de Recompensas
            </h2>
            <p className="text-xl sm:text-2xl mb-4 text-white font-bold">
              Programa de Puntos Laboratorio 3D
            </p>
            <p className="text-lg text-[#a0a0a0] max-w-3xl mx-auto">
              Registrate gratis y empezá a ganar recompensas exclusivas con cada compra. <strong className="text-white">Más impresiones, más beneficios, más para vos.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Niveles - Funnel Visual (DINÁMICO) */}
            <div className="space-y-4">
              {loadingPremios ? (
                // Loading state
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Cargando premios...</p>
                </div>
              ) : premios.length === 0 ? (
                // Sin premios
                <div className="text-center py-12 bg-red-500/10 border border-red-500 rounded-xl p-6">
                  <p className="text-red-400 text-xl font-bold mb-2">No hay premios disponibles</p>
                  <p className="text-gray-400 text-sm">Total premios cargados: {premios.length}</p>
                  <p className="text-gray-500 text-xs mt-2">Abre la consola (F12) para ver los logs</p>
                </div>
              ) : (
                // Renderizar premios dinámicamente
                premios.map((premio) => {
                  const colorNivel = getColorNivel(premio.puntos_requeridos);
                  const nombreNivel = getNombreNivel(premio.puntos_requeridos);
                  const colorTexto = premio.puntos_requeridos >= 20000 ? 'yellow' : 
                                     premio.puntos_requeridos >= 10000 ? 'gray' : 'orange';

                  return (
                    <div 
                      key={premio.id}
                      className={`bg-gradient-to-br ${colorNivel} rounded-2xl p-6 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold mb-1">
                            Nivel {nombreNivel}
                          </h3>
                          <p className={`text-${colorTexto}-100 text-sm sm:text-base`}>
                            {premio.nombre}
                          </p>
                          {premio.descripcion && (
                            <p className={`text-${colorTexto}-200 text-xs mt-1 line-clamp-2`}>
                              {premio.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="text-center sm:text-right">
                          <span className="text-xl sm:text-2xl font-bold">
                            {premio.puntos_requeridos.toLocaleString()} pts
                          </span>
                          <p className={`text-xs text-${colorTexto}-200 mt-1`}>
                            {formatearPesos(premio.puntos_requeridos)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cómo Funciona */}
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">
                ¿Cómo funciona?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Registrate y Comprá</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Por cada $1.000 que gastes en Laboratorio 3D, sumás 1 punto automáticamente
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Cargá tu compra</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Subí foto de tu comprobante y nosotros verificamos y acreditamos tus puntos en 48 hs
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Canjeá premios</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Elegí tu premio del catálogo y retiralo en nuestro local o pedí envío
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Subí de nivel</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Mientras más comprás, más subís de nivel y desbloqueás mejores premios
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Referí amigos</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Compartí tu código y ganá 50 pts ($50.000) por cada compra {'>'}$500k. Tu amigo recibe $25.000 de descuento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final - ¡Tu Momento es Ahora! */}
        <section className="text-center mb-20">
          <div className="relative overflow-hidden rounded-3xl p-16 bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                ¡Tu Momento es Ahora!
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Programa de Puntos <span className="font-bold">Laboratorio 3D</span>
              </p>
              <p className="text-lg mb-10 text-white/80 max-w-3xl mx-auto">
                Registrate ahora y recibí 500 puntos de bienvenida ($500.000). 
                Empezá tu camino hacia las recompensas exclusivas.
              </p>
              {!autenticado && (
                <Link
                  href="/registro"
                  className="inline-block px-12 py-5 bg-white text-[#3498db] text-xl font-bold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Únirme ahora y obtener beneficios
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
                  alt="Logo Laboratorio 3D" 
                  className="h-8"
                />
              </div>
              <p className="text-[#a0a0a0]">
                Programa de puntos y recompensas. Transformá tus compras en beneficios.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Acceso Rápido</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-[#a0a0a0] hover:text-white transition-colors">Ingresar</Link></li>
                <li><Link href="/registro" className="text-[#a0a0a0] hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Información</h4>
              <ul className="space-y-2">
                <li><a href="#niveles" className="text-[#a0a0a0] hover:text-white transition-colors">Niveles</a></li>
                <li><a href="#" className="text-[#a0a0a0] hover:text-white transition-colors">Términos y Condiciones</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Síguenos</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://www.instagram.com/laboratorio.3d/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#a0a0a0] hover:text-pink-400 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @laboratorio.3d
                  </a>
                </li>
                <li className="text-[#a0a0a0] text-sm">Ver nuestros trabajos</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-[#a0a0a0]">
            <p>&copy; {new Date().getFullYear()} Laboratorio 3D. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}