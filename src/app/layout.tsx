/**
 * 🏗️ Layout Principal de la Aplicación - Laboratorio 3D
 * 
 * Este layout define la estructura base de toda la aplicación.
 * Incluye configuración de metadatos, fuentes, y proveedores
 * globales como el store de Zustand y el tema.
 * 
 * Características:
 * - Metadatos SEO optimizados
 * - Fuentes personalizadas (Inter)
 * - Tema oscuro/claro
 * - Analytics y tracking
 * - Configuración de viewport
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import SetupChecker from '@/components/SetupChecker';

// ============================================================================
// 🔧 CONFIGURACIÓN DE FUENTES
// ============================================================================

/**
 * 📝 Fuente principal de la aplicación
 * Inter es una fuente moderna, legible y optimizada para UI
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// ============================================================================
// 📋 METADATOS DE LA APLICACIÓN
// ============================================================================

export const metadata: Metadata = {
  // Base URL para resolver rutas relativas en metadatos
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  
  // Metadatos básicos
  title: {
    default: 'Laboratorio 3D - Sistema de Premios y Lealtad',
    template: '%s | Laboratorio 3D'
  },
  description: 'Sistema moderno de gestión de premios y programa de lealtad para Laboratorio 3D. Canjea puntos por productos y servicios exclusivos.',
  
  // Metadatos para motores de búsqueda
  keywords: [
    'laboratorio 3d',
    'premios',
    'lealtad',
    'puntos',
    'canje',
    'recompensas',
    'sistema de fidelización',
    'argentina',
    'laboratorio clínico'
  ],
  authors: [{ name: 'Laboratorio 3D' }],
  creator: 'Laboratorio 3D',
  publisher: 'Laboratorio 3D',
  
  // Metadatos para Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://lab3d.jcancelo.dev',
    siteName: 'Laboratorio 3D',
    title: 'Laboratorio 3D - Sistema de Premios y Lealtad',
    description: 'Sistema moderno de gestión de premios y programa de lealtad para Laboratorio 3D.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Laboratorio 3D - Sistema de Premios'
      }
    ]
  },
  
  // Metadatos para Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@lab3d',
    creator: '@lab3d',
    title: 'Laboratorio 3D - Sistema de Premios y Lealtad',
    description: 'Sistema moderno de gestión de premios y programa de lealtad.',
    images: ['/images/twitter-image.jpg']
  },
  
  // Metadatos técnicos
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Metadatos de verificación
  verification: {
    google: 'tu-google-verification-code',
    yandex: 'tu-yandex-verification-code',
  },
  
  // Metadatos adicionales
  category: 'Salud y Bienestar',
  classification: 'Sistema de Gestión',
  referrer: 'origin-when-cross-origin',
  
  // Iconos y manifest
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

// ============================================================================
// 🖥️ CONFIGURACIÓN DE VIEWPORT
// ============================================================================

/**
 * Configuración del viewport y tema
 * En Next.js 14+, viewport y themeColor se exportan por separado
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#7c3aed' }
  ],
};

// ============================================================================
// 🏗️ COMPONENTE ROOT LAYOUT
// ============================================================================

/**
 * 🏗️ Layout principal de la aplicación
 * 
 * Este componente envuelve todas las páginas y proporciona:
 * - Estructura HTML semántica
 * - Configuración de idioma
 * - Fuentes y estilos globales
 * - Metadatos y SEO
 * - Scripts de analytics
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="es-AR" 
      className={`${inter.variable} font-sans`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-screen bg-gray-50 antialiased"
        suppressHydrationWarning
      >
        {/* Script para manejar tema antes de hidratación */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Obtener tema del localStorage o preferencia del sistema
                  const theme = localStorage.getItem('theme') || 
                               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  
                  // Aplicar tema inmediatamente
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Prevenir parpadeo del tema
                  document.documentElement.style.visibility = 'visible';
                } catch (e) {
                  console.error('Error setting theme:', e);
                  document.documentElement.style.visibility = 'visible';
                }
              })();
            `,
          }}
        />
        
        {/* Contenedor principal de la aplicación */}
        <div id="app-root" className="relative min-h-screen">
          {/* Navbar global */}
          <Navbar />
          
          {/* Overlay para modales globales */}
          <div id="modal-overlay" className="fixed inset-0 z-50 pointer-events-none" />
          
          {/* Contenido de la página */}
          <main className="relative">
            <SetupChecker>
              {children}
            </SetupChecker>
          </main>
          
          {/* Portal para notificaciones y toasts */}
          <div id="toast-portal" className="fixed top-4 right-4 z-50 pointer-events-none" />
          
          {/* Portal para modales */}
          <div id="modal-portal" className="fixed inset-0 z-50 pointer-events-none" />
        </div>
        
        {/* Scripts de analytics (solo en producción) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GA_ID}');
                  `,
                }}
              />
            )}
            
            {/* Hotjar */}
            {process.env.NEXT_PUBLIC_HOTJAR_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
        
        {/* Script para manejar errores globales */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
                // Aquí podrías enviar errores a un servicio de logging
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
                // Aquí podrías enviar errores a un servicio de logging
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
