'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Premio {
  id: number;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  imagen_base64?: string | null;
  tipo_imagen?: string | null;
  stock?: number;
  activo: boolean;
}

export default function GestionarPremios() {
  const router = useRouter();
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [premioEdit, setPremioEdit] = useState<Premio | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntos_requeridos: '',
    stock: '',
    imagen_base64: '',
    tipo_imagen: '',
    activo: true
  });
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  useEffect(() => {
    verificarAdmin();
    cargarPremios();
  }, []);

  const verificarAdmin = async () => {
    const sessionId = localStorage.getItem('session_id');
    
    if (!sessionId) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.usuario.rol !== 'ADMIN' && data.usuario.rol !== 'SUPERADMIN') {
        alert('No tienes permisos de administrador');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const cargarPremios = async () => {
    try {
      console.log('🎁 [ADMIN] Cargando premios...');
      const response = await fetch('/api/premios/publicos');
      console.log('📡 [ADMIN] Response status:', response.status);
      const data = await response.json();
      console.log('📦 [ADMIN] Data recibida:', data);
      console.log('✅ [ADMIN] Premios:', data.premios);
      console.log('📊 [ADMIN] Total premios:', data.premios?.length || 0);
      
      if (data.success) {
        setPremios(data.premios);
        console.log('💾 [ADMIN] Premios guardados en estado');
      }
    } catch (error) {
      console.error('❌ [ADMIN] Error al cargar premios:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (premio?: Premio) => {
    if (premio) {
      setPremioEdit(premio);
      setFormData({
        nombre: premio.nombre || '',
        descripcion: premio.descripcion || '',
        puntos_requeridos: premio.puntos_requeridos !== undefined ? premio.puntos_requeridos.toString() : '0',
        stock: (premio.stock !== undefined && premio.stock !== null) ? premio.stock.toString() : '0',
        imagen_base64: (premio as any).imagen_base64 || '',
        tipo_imagen: (premio as any).tipo_imagen || '',
        activo: premio.activo !== undefined ? premio.activo : true
      });
    } else {
      setPremioEdit(null);
      setFormData({
        nombre: '',
        descripcion: '',
        puntos_requeridos: '',
        stock: '',
        imagen_base64: '',
        tipo_imagen: '',
        activo: true
      });
    }
    setArchivoImagen(null);
    setMostrarModal(true);
  };

  const convertirABase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const guardarPremio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sessionId = localStorage.getItem('session_id');
      
      // Convertir imagen a base64 si hay un archivo nuevo
      let imagenBase64 = formData.imagen_base64;
      let tipoImagen = formData.tipo_imagen;
      
      if (archivoImagen) {
        imagenBase64 = await convertirABase64(archivoImagen);
        tipoImagen = archivoImagen.type;
      }
      
      const datos = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        puntos_requeridos: parseInt(formData.puntos_requeridos),
        stock: parseInt(formData.stock),
        imagen_base64: imagenBase64 || null,
        tipo_imagen: tipoImagen || null,
        activo: formData.activo
      };

      let response;
      
      if (premioEdit) {
        // Editar premio existente
        response = await fetch('/api/admin/premios', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({ ...datos, id: premioEdit.id })
        });
      } else {
        // Crear nuevo premio
        response = await fetch('/api/admin/premios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify(datos)
        });
      }

      const data = await response.json();

      if (data.success) {
        alert(`✅ Premio ${premioEdit ? 'actualizado' : 'creado'} exitosamente!`);
        setMostrarModal(false);
        cargarPremios(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el premio');
    }
  };

  const toggleActivo = async (premio: Premio) => {
    if (!confirm(`¿Seguro que deseas ${premio.activo ? 'desactivar' : 'activar'} este premio?`)) {
      return;
    }

    try {
      const sessionId = localStorage.getItem('session_id');
      
      const response = await fetch('/api/admin/premios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ id: premio.id })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Premio ${data.activo ? 'activado' : 'desactivado'} exitosamente!`);
        cargarPremios(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado del premio');
    }
  };

  const calcularPesos = (puntos: number) => {
    return `$${(puntos * 1000).toLocaleString('es-AR')}`;
  };

  const getColorNivel = (puntos: number) => {
    if (puntos >= 20000) return 'from-[#FFD700] to-[#D4AF37]';
    if (puntos >= 10000) return 'from-[#C0C0C0] to-[#A8A8A8]';
    return 'from-[#CD7F32] to-[#B87333]';
  };

  const getEmojiNivel = (puntos: number) => {
    if (puntos >= 20000) return '🥇';
    if (puntos >= 10000) return '🥈';
    return '🥉';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando premios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎁 Gestión de Premios</h1>
            <p className="text-gray-400">Administra el catálogo de recompensas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => abrirModal()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Premio
            </button>
            <Link 
              href="/admin"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-200 text-sm mb-1">Total Premios</p>
            <p className="text-3xl font-bold">{premios.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6">
            <p className="text-green-200 text-sm mb-1">Activos</p>
            <p className="text-3xl font-bold">{premios.filter(p => p.activo).length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-6">
            <p className="text-red-200 text-sm mb-1">Inactivos</p>
            <p className="text-3xl font-bold">{premios.filter(p => !p.activo).length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6">
            <p className="text-amber-200 text-sm mb-1">Stock Total</p>
            <p className="text-3xl font-bold">{premios.reduce((acc, p) => acc + (p.stock || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Lista de premios */}
      <div className="max-w-7xl mx-auto">
        {premios.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1f] rounded-xl border-2 border-yellow-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2 text-yellow-400">⚠️ No hay premios cargados</h3>
            <p className="text-gray-400 mb-2">Total en estado: {premios.length}</p>
            <p className="text-gray-500 text-sm mb-6">Abre la consola del navegador (F12) para ver los logs</p>
            <button
              onClick={() => abrirModal()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold"
            >
              Agregar Premio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premios.map((premio) => (
              <div
                key={premio.id}
                className="bg-[#1a1a1f] rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-all"
              >
                {/* Header con estado */}
                <div className={`p-4 bg-gradient-to-r ${getColorNivel(premio.puntos_requeridos)}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">{getEmojiNivel(premio.puntos_requeridos)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      premio.activo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {premio.activo ? '✅ Activo' : '⚠️ Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{premio.nombre}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{premio.descripcion}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Puntos:</span>
                      <span className="font-bold text-amber-400">{premio.puntos_requeridos.toLocaleString()} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Equivalente:</span>
                      <span className="font-bold text-green-400">{calcularPesos(premio.puntos_requeridos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stock:</span>
                      <span className={`font-bold ${(premio.stock || 0) > 0 ? 'text-white' : 'text-red-400'}`}>
                        {premio.stock !== undefined ? premio.stock : 0} unidades
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(premio)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(premio)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                        premio.activo 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {premio.activo ? '🚫 Desactivar' : '✅ Activar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1f] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold">{premioEdit ? 'Editar Premio' : 'Nuevo Premio'}</h2>
            </div>

            <form onSubmit={guardarPremio} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del premio *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  required
                  placeholder="Ej: 3kg Filamento Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none min-h-[100px]"
                  required
                  placeholder="Descripción del premio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Puntos requeridos *</label>
                  <input
                    type="number"
                    value={formData.puntos_requeridos}
                    onChange={(e) => setFormData({...formData, puntos_requeridos: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                    required
                    min="0"
                    placeholder="1500"
                  />
                  {formData.puntos_requeridos && (
                    <p className="text-xs text-gray-400 mt-1">
                      = {calcularPesos(parseInt(formData.puntos_requeridos))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                    required
                    min="0"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imagen del premio (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setArchivoImagen(file);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:cursor-pointer hover:file:bg-orange-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {archivoImagen ? `📸 ${archivoImagen.name}` : 'JPG, PNG, GIF - Máx 2MB'}
                </p>
                {formData.imagen_base64 && !archivoImagen && (
                  <div className="mt-2">
                    <img 
                      src={formData.imagen_base64} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Imagen actual</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="w-5 h-5"
                />
                <label htmlFor="activo" className="text-sm font-medium">Premio activo (visible en el catálogo)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold"
                >
                  {premioEdit ? 'Guardar Cambios' : 'Crear Premio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
