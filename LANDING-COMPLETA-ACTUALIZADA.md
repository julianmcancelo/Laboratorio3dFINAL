# 🏠 Landing Page Completa - Igual al Original PHP

## 📋 Instrucciones

Reemplaza el contenido completo de `src/app/page.tsx` con este código:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const { usuario, autenticado } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#181818] text-[#e0e0e0]">
      {/* Header con glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#2a2a2a]/80 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
              alt="Logo Laboratorio 3D" 
              className="h-10 transition-transform duration-300 group-hover:rotate-[10deg]"
            />
            <span className="font-bold text-xl text-white hidden sm:inline">Laboratorio 3D</span>
          </Link>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            {autenticado ? (
              <>
                <span className="text-[#a0a0a0] text-sm">Hola, {usuario?.nombre_completo}</span>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-[#3498db] text-white rounded-full hover:bg-[#2980b9] transition-all duration-300 hover:shadow-lg font-semibold text-sm"
                >
                  Dashboard
                </Link>
              </>
            ) : (
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

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto z-10 pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4">
        <section className="text-center mb-20">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 text-white leading-tight">
              En Laboratorio 3D: <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
                Cada Compra te Devuelve Más
              </span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl mb-12 max-w-5xl mx-auto text-[#a0a0a0] font-light leading-relaxed">
              Sumá puntos en cada compra y canjealos por{' '}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                descuentos, filamentos y beneficios exclusivos
              </span>
              . Gratis, rápido y pensado para potenciar tus proyectos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {!autenticado && (
                <>
                  <Link
                    href="/registro"
                    className="px-12 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-500 transform hover:scale-110 hover:shadow-2xl border-2 border-transparent hover:border-white/20"
                  >
                    🚀 Unirme al Programa
                  </Link>
                  <Link
                    href="#niveles"
                    className="px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 border-2 hover:shadow-lg text-[#e0e0e0] border-white/10 bg-[#2a2a2a]"
                  >
                    Ver Recompensas
                  </Link>
                </>
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
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="font-bold text-lg mb-2 text-white">1,500 Puntos</h3>
                <p className="text-sm text-[#a0a0a0] text-center">de bienvenida gratis</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-bold text-lg mb-2 text-white">Registro Rápido</h3>
                <p className="text-sm text-[#a0a0a0] text-center">en menos de 2 minutos</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="text-4xl mb-3">🏆</div>
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
                  className="inline-block px-12 py-6 text-xl font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-500 transform hover:scale-110 hover:shadow-2xl border-2 border-transparent hover:border-white/20"
                >
                  ✨ Quiero empezar a sumar puntos
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Tu Carrera de Recompensas */}
        <section id="niveles" className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              🏆 Tu Carrera de Recompensas
            </h2>
            <p className="text-xl sm:text-2xl mb-4 text-[#a0a0a0] font-light">
              Programa de Puntos Laboratorio 3D
            </p>
            <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto">
              Desbloquea cada etapa y llévate más beneficios. Mientras más compres, más grande es tu recompensa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Niveles - Funnel Visual */}
            <div className="space-y-4">
              {/* Nivel Bronce */}
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl p-6 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">🥉 Nivel Bronce</h3>
                    <p className="text-blue-100 text-sm sm:text-base">Descuento 5% en filamentos</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-xl sm:text-2xl font-bold">1,500 pts</span>
                  </div>
                </div>
              </div>

              {/* Nivel Plata */}
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl p-6 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">🥈 Nivel Plata</h3>
                    <p className="text-blue-100 text-sm sm:text-base">1kg Filamento PLA Premium</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-xl sm:text-2xl font-bold">3,000 pts</span>
                  </div>
                </div>
              </div>

              {/* Nivel Oro */}
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl p-6 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">🥇 Nivel Oro</h3>
                    <p className="text-blue-100 text-sm sm:text-base">5kg Filamento + Herramientas</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-xl sm:text-2xl font-bold">6,000 pts</span>
                  </div>
                </div>
              </div>

              {/* Nivel Platino */}
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl p-6 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">💎 Nivel Platino</h3>
                    <p className="text-blue-100 text-sm sm:text-base">Impresora 3D + Filamentos</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-xl sm:text-2xl font-bold">10,000 pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cómo Funciona */}
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">
                🔥 ¿Cómo funciona? #
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">📝 Registrate y Comprá</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Por cada peso que gastes en Laboratorio 3D, acumulás 1 punto automáticamente
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">💰 Cargá tu compra</h4>
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
                    <h4 className="font-bold text-white mb-1">🎁 Canjeá premios</h4>
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
                    <h4 className="font-bold text-white mb-1">📊 Subí de nivel</h4>
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
                    <h4 className="font-bold text-white mb-1">👥 Referí amigos</h4>
                    <p className="text-[#a0a0a0] text-sm">
                      Compartí tu código y ganá 50 puntos extras por cada amigo que se registre
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
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                ¡Tu Momento es Ahora!
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Programa de Puntos <span className="font-bold">Laboratorio 3D</span>
              </p>
              <p className="text-lg mb-10 text-white/80 max-w-3xl mx-auto">
                Registrate ahora y empezá a ganar tus primeros 1,500 puntos de bienvenida. 
                Dale más a tus proyectos, sin gastar de más.
              </p>
              {!autenticado && (
                <Link
                  href="/registro"
                  className="inline-block px-12 py-5 bg-white text-purple-600 text-xl font-bold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  🚀 Únirme ahora y obtener beneficios
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2a2a2a] border-t border-white/10 py-12">
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
              <h4 className="text-white font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-[#a0a0a0]">
                <li>📧 info@lab3d.com.ar</li>
                <li>📍 Buenos Aires, Argentina</li>
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
```

---

## ✅ Características de la Nueva Landing:

1. ✅ **Video de YouTube embedded** - Igual al original
2. ✅ **Sección de Niveles** - Bronce, Plata, Oro, Platino con puntos
3. ✅ **¿Cómo funciona?** - 5 pasos numerados
4. ✅ **CTA "¿Listo para empezar?"** - Con diseño especial
5. ✅ **CTA Final "¡Tu Momento es Ahora!"** - Con gradiente morado/rosa
6. ✅ **Indicadores de beneficios** - 1,500 puntos gratis, etc.
7. ✅ **Tema oscuro consistente** - #181818, #2a2a2a
8. ✅ **Logo original** - En header y footer
9. ✅ **Orden de secciones** - Idéntico al PHP

---

## 📋 Para Aplicar:

1. **Abre** `src/app/page.tsx`
2. **Borra** TODO el contenido actual
3. **Pega** el código de arriba
4. **Guarda** el archivo
5. **Refresca** el navegador

---

**¡Ahora tu landing será idéntica al original PHP!** 🚀
