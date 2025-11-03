'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const [datos, setDatos] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmar_password: '',
    dni: '',
    instagram: ''
  });
  const router = useRouter();

  useEffect(() => {
    verificarSetup();
  }, []);

  const verificarSetup = async () => {
    try {
      const response = await fetch('/api/setup/check');
      const data = await response.json();
      
      if (!data.needsSetup) {
        // Ya hay usuarios, redirigir al login
        router.push('/login');
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error verificando setup:', error);
      setError('Error al verificar el estado del sistema');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreando(true);

    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (response.ok) {
        // Administrador creado, redirigir al login
        router.push('/login?admin=created');
      } else {
        setError(data.error || 'Error al crear el administrador');
      }
    } catch (error) {
      console.error('Error creando administrador:', error);
      setError('Error de conexión al crear el administrador');
    } finally {
      setCreando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Verificando sistema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Laboratorio 3D
          </h1>
          <p className="text-gray-400">
            Configuración Inicial
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Crear Primer Administrador
            </h2>
            <p className="text-gray-400 text-sm">
              No se detectaron usuarios en el sistema. 
              Crea la cuenta de administrador para comenzar.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={datos.nombre_completo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={datos.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@laboratorio3d.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={datos.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirmar contraseña *
              </label>
              <input
                type="password"
                name="confirmar_password"
                value={datos.confirmar_password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repite la contraseña"
              />
            </div>

            {/* DNI */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                DNI (opcional)
              </label>
              <input
                type="text"
                name="dni"
                value={datos.dni}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Instagram (opcional)
              </label>
              <input
                type="text"
                name="instagram"
                value={datos.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="@usuario"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={creando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creando ? 'Creando administrador...' : 'Crear Administrador'}
            </button>
          </form>

          {/* Nota */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Nota:</strong> Este usuario tendrá privilegios de administrador 
              y podrá gestionar todo el sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            ¿Ya tienes usuarios?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Ir al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
