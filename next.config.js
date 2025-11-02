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
};

module.exports = nextConfig;
