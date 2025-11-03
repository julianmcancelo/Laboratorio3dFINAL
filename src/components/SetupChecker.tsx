'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SetupChecker({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSetup();
  }, [pathname]);

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/setup/check');
      const data = await response.json();
      
      if (data.needsSetup) {
        // No hay usuarios, necesita setup
        if (pathname !== '/setup') {
          setNeedsSetup(true);
          // Redirigir a setup después de un breve retraso
          setTimeout(() => {
            router.push('/setup');
          }, 1000);
        } else {
          // Ya está en setup, no hacer nada
          setLoading(false);
        }
      } else {
        // Ya hay usuarios
        if (pathname === '/setup') {
          // Está en setup pero ya hay usuarios, redirigir al landing
          setRedirecting(true);
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          // Ruta normal, continuar
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error verificando setup:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Verificando sistema...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (needsSetup && pathname !== '/setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Redirigiendo a configuración inicial...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">El sistema ya está configurado. Redirigiendo al inicio...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
