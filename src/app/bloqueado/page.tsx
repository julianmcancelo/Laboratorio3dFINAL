'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BloqueadoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Registrar intento de acceso con IP
    registrarIntentoBloqueo();
    
    // Obtener datos del usuario desde localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUsuario(JSON.parse(userData));
      } catch (error) {
        console.error('Error parseando datos de usuario:', error);
      }
    }
  }, []);

  const registrarIntentoBloqueo = async () => {
    try {
      await fetch('/api/auth/registrar-intento-bloqueado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error registrando intento:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Card principal compacto */}
        <div className="rounded-xl p-8 shadow-2xl" style={{
          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
          border: '2px solid rgba(52, 152, 219, 0.3)'
        }}>
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="https://acdn-us.mitiendanube.com/stores/005/528/607/themes/common/logo-309059401-1733509141-c82e57a103c23bb99e23f909d3dbc85a1733509142.png?0" 
              alt="Logo Laboratorio 3D" 
              className="h-16"
            />
          </div>

          {/* Icono de bloqueo */}
          <div className="text-center mb-4">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              boxShadow: '0 8px 30px rgba(231, 76, 60, 0.4)'
            }}>
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Cuenta Bloqueada
            </h1>
            <p className="text-red-400 text-xs font-semibold">
              Acceso suspendido
            </p>
          </div>

          {/* Mensaje principal compacto */}
          <div className="mb-4 p-3 rounded-lg" style={{
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid rgba(231, 76, 60, 0.4)'
          }}>
            <p className="text-gray-200 text-center text-sm leading-relaxed">
              Tu cuenta está <span className="font-bold text-red-400">bloqueada</span>. No puedes acceder a la plataforma.
            </p>
          </div>

          {/* Usuario info compacto */}
          {usuario && (
            <div className="mb-4 p-3 rounded-lg" style={{
              background: 'rgba(52, 152, 219, 0.1)',
              border: '1px solid rgba(52, 152, 219, 0.3)'
            }}>
              <p className="text-gray-400 text-xs mb-0.5">Usuario bloqueado:</p>
              <p className="text-white font-semibold text-sm">{usuario.nombre_completo || usuario.email}</p>
            </div>
          )}

          {/* Contacto compacto */}
          <div className="mb-4 p-3 rounded-lg" style={{
            background: 'rgba(52, 152, 219, 0.1)',
            border: '1px solid rgba(52, 152, 219, 0.3)'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <p className="text-white text-sm font-semibold">Contacto</p>
            </div>
            <p className="text-gray-400 text-xs">
              <a href="mailto:info@lab3d.com.ar" className="text-cyan-400 hover:text-cyan-300 underline">info@lab3d.com.ar</a>
            </p>
          </div>

          {/* Mensaje de advertencia */}
          <div className="p-3 rounded-lg text-center" style={{
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid rgba(231, 76, 60, 0.4)'
          }}>
            <p className="text-red-400 text-xs font-semibold mb-1">⚠️ Acceso Restringido</p>
            <p className="text-gray-300 text-xs">
              Contacta con un administrador para recuperar el acceso a tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
