'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SetupChecker({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No verificar setup si ya estamos en la página de setup
    if (pathname === '/setup') {
      setLoading(false);
      return;
    }

    checkSetup();
  }, [pathname]);

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/setup/check');
      const data = await response.json();
      
      if (data.needsSetup) {
        setNeedsSetup(true);
        // Redirigir a setup después de un breve retraso
        setTimeout(() => {
          router.push('/setup');
        }, 1000);
      }
    } catch (error) {
      console.error('Error verificando setup:', error);
    } finally {
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

  return <>{children}</>;
}
