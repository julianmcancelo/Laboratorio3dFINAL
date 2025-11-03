'use client';

import { useState, useEffect } from 'react';

interface CargarComprobanteProps {
  usuarioId: number;
  onComprobanteSubido?: () => void;
  onClose?: () => void; // Para cerrar el modal
}

export default function CargarComprobante({ usuarioId, onComprobanteSubido, onClose }: CargarComprobanteProps) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoProducto, setTipoProducto] = useState<'filamento' | 'impresora_3d' | 'otros'>('otros');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [verificandoPendientes, setVerificandoPendientes] = useState(true);
  const [tienePendientes, setTienePendientes] = useState(false);
  const [comprobantesPendientes, setComprobantesPendientes] = useState<any[]>([]);

  // Verificar si tiene comprobantes pendientes al cargar
  useEffect(() => {
    verificarComprobantesPendientes();
  }, [usuarioId]);

  const verificarComprobantesPendientes = async () => {
    try {
      setVerificandoPendientes(true);
      const response = await fetch(`/api/comprobantes?usuario_id=${usuarioId}`);
      
      if (!response.ok) {
        console.error('Error al verificar comprobantes pendientes');
        setVerificandoPendientes(false);
        return;
      }

      const data = await response.json();
      const comprobantes = data.comprobantes || [];
      
      // Filtrar solo los comprobantes pendientes (no verificados)
      const pendientes = comprobantes.filter((c: any) => 
        c.estado === 'pendiente' || c.estado === 'en_revision'
      );
      
      setComprobantesPendientes(pendientes);
      setTienePendientes(pendientes.length > 0);
      
      if (pendientes.length > 0) {
        setMensaje({
          tipo: 'error',
          texto: `Tienes ${pendientes.length} comprobante${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''} de verificación. Debes esperar a que ${pendientes.length > 1 ? 'sean revisados' : 'sea revisado'} antes de subir otro.`
        });
      }
    } catch (error) {
      console.error('Error al verificar comprobantes pendientes:', error);
    } finally {
      setVerificandoPendientes(false);
    }
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      setMensaje({ tipo: 'error', texto: 'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF' });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ tipo: 'error', texto: 'El archivo no debe superar los 5MB' });
      return;
    }

    setArchivo(file);
    setMensaje(null);

    // Crear preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(''); // PDF no tiene preview
    }
  };

  const convertirABase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si tiene comprobantes pendientes
    if (tienePendientes) {
      setMensaje({
        tipo: 'error',
        texto: 'No puedes subir un nuevo comprobante mientras tengas comprobantes pendientes de verificación.'
      });
      return;
    }

    // Validaciones
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Debe seleccionar un comprobante' });
      return;
    }

    if (!monto || parseFloat(monto) <= 0) {
      setMensaje({ tipo: 'error', texto: 'El monto debe ser mayor a 0' });
      return;
    }

    if (!descripcion.trim()) {
      setMensaje({ tipo: 'error', texto: 'La descripción es obligatoria' });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      // Convertir archivo a base64
      const base64 = await convertirABase64(archivo);

      // Enviar al servidor
      const response = await fetch('/api/comprobantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          monto: parseFloat(monto),
          descripcion: descripcion.trim(),
          tipo_producto: tipoProducto,
          numero_serie: tipoProducto === 'impresora_3d' ? numeroSerie.trim() : null,
          marca_modelo: marcaModelo.trim() || null,
          comprobante_base64: base64,
          tipo_archivo: archivo.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir comprobante');
      }

      setMensaje({ tipo: 'success', texto: '¡Comprobante subido exitosamente! Será revisado por el administrador.' });
      
      // Limpiar formulario
      setMonto('');
      setDescripcion('');
      setArchivo(null);
      setPreview('');
      
      // Resetear input file
      const fileInput = document.getElementById('archivo-comprobante') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Callback
      if (onComprobanteSubido) {
        onComprobanteSubido();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al subir comprobante:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al subir comprobante' 
      });
    } finally {
      setCargando(false);
    }
  };

  // Si está verificando, mostrar loader
  if (verificandoPendientes) {
    return (
      <div className="progress-card glassmorphism-light fade-in-item relative rounded-xl p-5 mb-4 shadow-lg" style={{animationDelay: '0.5s'}}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin w-12 h-12 mx-auto mb-4" style={{color: 'var(--accent-purple)'}} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm" style={{color: 'var(--muted-text)'}}>Verificando comprobantes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-card glassmorphism-light fade-in-item relative rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{animationDelay: '0.5s'}}>
      <div className="flex items-center gap-3 mb-4 pb-4" style={{borderBottom: '1px solid var(--card-border)'}}>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold" style={{color: 'var(--heading-text)'}}>Cargar Comprobante</h2>
          <p className="text-xs" style={{color: 'var(--muted-text)'}}>Sube tu comprobante de compra para ganar puntos</p>
        </div>
      </div>

      {/* Alerta de comprobantes pendientes */}
      {tienePendientes && (
        <div className="mb-4 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{color: 'var(--accent-amber)'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold mb-1" style={{color: 'var(--accent-amber)'}}>Comprobantes Pendientes de Verificación</h4>
              <p className="text-sm mb-3" style={{color: 'var(--muted-text)'}}>
                No puedes subir nuevos comprobantes hasta que los siguientes sean revisados:
              </p>
              <ul className="space-y-2">
                {comprobantesPendientes.map((comprobante, index) => (
                  <li key={comprobante.id || index} className="text-sm flex items-center gap-2 p-2 rounded-lg" style={{backgroundColor: 'var(--input-bg)'}}>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                    <span style={{color: 'var(--body-text)'}}>
                      <strong>${comprobante.monto?.toLocaleString()}</strong> - {comprobante.descripcion?.substring(0, 50)}{comprobante.descripcion?.length > 50 ? '...' : ''}
                    </span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full" style={{backgroundColor: 'var(--accent-amber)', color: 'white'}}>
                      {comprobante.estado === 'en_revision' ? 'En Revisión' : 'Pendiente'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-3" style={{color: 'var(--muted-text)'}}>
                💡 El administrador revisará tu{comprobantesPendientes.length > 1 ? 's' : ''} comprobante{comprobantesPendientes.length > 1 ? 's' : ''} pronto. Te notificaremos cuando {comprobantesPendientes.length > 1 ? 'sean aprobados o rechazados' : 'sea aprobado o rechazado'}.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
        <div>
          <label className="label-nexus">Monto de la compra *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{color: 'var(--muted-text)'}}>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="input-nexus pl-8"
              placeholder="0.00"
              required
              disabled={cargando || tienePendientes}
            />
          </div>
          
          {/* Indicador de puntos */}
          {monto && parseFloat(monto) > 0 && (
            <div className="mt-2 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'var(--muted-text)'}}>
                  Puntos a recibir (1 pt = $1.000):
                </span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{color: 'var(--accent-green)'}} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-lg" style={{color: 'var(--accent-green)'}}>
                    {Math.floor(parseFloat(monto) / 1000)} pts
                  </span>
                </div>
              </div>
              <p className="text-xs mt-1" style={{color: 'var(--muted-text)'}}>
                * Puntos se otorgarán después de validación del administrador
              </p>
            </div>
          )}
        </div>

        {/* Tipo de Producto */}
        <div>
          <label className="label-nexus">Tipo de producto *</label>
          <select
            value={tipoProducto}
            onChange={(e) => {
              setTipoProducto(e.target.value as 'filamento' | 'impresora_3d' | 'otros');
              // Limpiar número de serie si no es impresora
              if (e.target.value !== 'impresora_3d') {
                setNumeroSerie('');
              }
            }}
            className="input-nexus"
            required
            disabled={cargando || tienePendientes}
          >
            <option value="otros">Otros</option>
            <option value="filamento">Filamento</option>
            <option value="impresora_3d">Impresora 3D</option>
          </select>
        </div>

        {/* Número de Serie (solo si es Impresora 3D) */}
        {tipoProducto === 'impresora_3d' && (
          <div className="space-y-4 p-4 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--accent-blue)'}}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" style={{color: 'var(--accent-blue)'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold" style={{color: 'var(--accent-blue)'}}>
                Información de Impresora 3D
              </span>
            </div>
            
            <div>
              <label className="label-nexus">Número de Serie *</label>
              <input
                type="text"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                className="input-nexus"
                placeholder="Ej: A1M0001234567"
                required
                disabled={cargando || tienePendientes}
                maxLength={100}
              />
              <p className="text-xs mt-1" style={{color: 'var(--muted-text)'}}>
                Ingrese el número de serie de la impresora 3D
              </p>
            </div>

            <div>
              <label className="label-nexus">Marca y Modelo (Opcional)</label>
              <input
                type="text"
                value={marcaModelo}
                onChange={(e) => setMarcaModelo(e.target.value)}
                className="input-nexus"
                placeholder="Ej: Bambu Lab A1 Mini"
                disabled={cargando || tienePendientes}
                maxLength={200}
              />
            </div>
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="label-nexus">Descripción de la compra *</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="input-nexus min-h-[80px] resize-none"
            placeholder="Ej: Compra de filamento PLA 1kg en tienda..."
            required
            disabled={cargando || tienePendientes}
            maxLength={500}
          />
          <p className="text-xs mt-1" style={{color: 'var(--muted-text)'}}>
            {descripcion.length}/500 caracteres
          </p>
        </div>

        {/* Archivo */}
        <div>
          <label className="label-nexus">Comprobante (Imagen o PDF) *</label>
          <div className="relative">
            <input
              id="archivo-comprobante"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleArchivoChange}
              className="hidden"
              disabled={cargando || tienePendientes}
            />
            <label
              htmlFor="archivo-comprobante"
              className="btn-nexus flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed py-8 rounded-xl hover:scale-102 transition-all"
              style={{borderColor: 'var(--card-border)', backgroundColor: 'var(--input-bg)'}}
            >
              <svg className="w-8 h-8" style={{color: 'var(--muted-text)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-center">
                <p className="font-semibold" style={{color: 'var(--heading-text)'}}>
                  {archivo ? archivo.name : 'Click para seleccionar archivo'}
                </p>
                <p className="text-xs" style={{color: 'var(--muted-text)'}}>
                  JPG, PNG, WEBP o PDF (máx. 5MB)
                </p>
              </div>
            </label>
          </div>

          {/* Preview de imagen */}
          {preview && (
            <div className="mt-4 relative rounded-xl overflow-hidden" style={{backgroundColor: 'var(--input-bg)'}}>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full max-h-64 object-contain p-4"
              />
              <button
                type="button"
                onClick={() => {
                  setArchivo(null);
                  setPreview('');
                  const fileInput = document.getElementById('archivo-comprobante') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute top-2 right-2 btn-nexus p-2 rounded-lg"
                style={{backgroundColor: 'var(--accent-red)', color: 'white'}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div 
            className={`p-4 rounded-xl flex items-start gap-3 ${
              mensaje.tipo === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
            style={{
              borderLeft: `4px solid ${mensaje.tipo === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`
            }}
          >
            {mensaje.tipo === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: 'var(--accent-green)'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: 'var(--accent-red)'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm" style={{color: mensaje.tipo === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}}>
              {mensaje.texto}
            </p>
          </div>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={cargando || !archivo || !monto || !descripcion || tienePendientes}
          className="btn-nexus w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{backgroundColor: 'var(--accent-purple)', color: 'white'}}
        >
          {cargando ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Subir Comprobante</span>
            </>
          )}
        </button>

        <p className="text-xs text-center" style={{color: 'var(--muted-text)'}}>
          * El comprobante será revisado por un administrador antes de otorgar los puntos
        </p>
      </form>
    </div>
  );
}
