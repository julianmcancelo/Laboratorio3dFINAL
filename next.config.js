/** @type {import('next').NextConfig} */

/**
 * Configuración de Next.js para el proyecto Laboratorio 3D
 * 
 * Características principales:
 * - Configuración optimizada para producción
 * - Variables de entorno seguras
 * - Soporte para imágenes optimizadas
 * - Configuración de headers de seguridad
 */
const nextConfig = {
  // Deshabilitar source maps en producción
  productionBrowserSourceMaps: false,

  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_APP_NAME: 'Laboratorio 3D',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Configuración experimental desactivada para evitar errores
  // experimental: {
  //   optimizeCss: true,
  // },

  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Previene ataques XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Previene clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Previene MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // HSTS - Fuerza HTTPS (solo habilitar en producción con HTTPS)
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=31536000; includeSubDomains'
          // },
          // Content Security Policy básico
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
