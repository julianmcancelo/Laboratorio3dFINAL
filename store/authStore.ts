// ARCHIVO VACÍO - REEMPLAZADO POR STORES INLINE
// Las funcionalidades están ahora en las páginas individuales
// para evitar problemas de importación y dependencias

export {};

interface AuthState {
  // Estado
  usuario: Usuario | null;
  autenticado: boolean;
  loading: boolean;
  error: string | null;
  
  // Acciones
  login: (email: string, password: string, recordarme?: boolean) => Promise<void>;
  registro: (datos: {
    nombre_completo: string;
    dni: string;
    email: string;
    password: string;
    password_confirmation: string;
    telefono?: string;
    instagram?: string;
    codigo_referido?: string;
    acepta_terminos: boolean;
    acepta_privacidad: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  limpiarError: () => void;
  refreshUserData: () => Promise<void>;
}

// Generar código de referido único
function generarCodigoReferido(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      usuario: null,
      autenticado: false,
      loading: false,
      error: null,

      // Login
      login: async (email: string, password: string, recordarme = false) => {
        set({ loading: true, error: null });
        
        try {
          // Obtener usuario de la base de datos
          const usuarioBD = await obtenerUsuarioPorEmail(email);
          
          if (!usuarioBD) {
            throw new Error('Credenciales incorrectas');
          }

          // Verificar contraseña
          const passwordValida = await bcrypt.compare(password, usuarioBD.password);
          
          if (!passwordValida) {
            throw new Error('Credenciales incorrectas');
          }

          // Crear sesión
          const sesionId = uuidv4();
          const expiraEn = new Date();
          expiraEn.setDate(expiraEn.getDate() + (recordarme ? 30 : 7)); // 30 días si recordarme, 7 por defecto
          
          await crearSesion({
            id: sesionId,
            usuario_id: usuarioBD.id,
            expira_en: expiraEn
          });

          // Guardar sesión en localStorage
          localStorage.setItem('sesion_id', sesionId);

          // Actualizar estado
          const usuario: Usuario = {
            id: usuarioBD.id,
            nombre_completo: usuarioBD.nombre_completo,
            dni: usuarioBD.dni,
            email: usuarioBD.email,
            telefono: usuarioBD.telefono,
            instagram: usuarioBD.instagram,
            puntos: usuarioBD.puntos,
            nivel: usuarioBD.nivel,
            codigo_referido: usuarioBD.codigo_referido,
            referido_por: usuarioBD.referido_por
          };

          set({
            usuario,
            autenticado: true,
            loading: false,
            error: null
          });

        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Error al iniciar sesión'
          });
          throw error;
        }
      },

      // Registro
      registro: async (datos) => {
        set({ loading: true, error: null });
        
        try {
          // Validar que las contraseñas coincidan
          if (datos.password !== datos.password_confirmation) {
            throw new Error('Las contraseñas no coinciden');
          }

          // Validar longitud de contraseña
          if (datos.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
          }

          // Validar términos y privacidad
          if (!datos.acepta_terminos || !datos.acepta_privacidad) {
            throw new Error('Debes aceptar los términos y condiciones y la política de privacidad');
          }

          // Verificar si el email ya existe
          const usuarioExistente = await obtenerUsuarioPorEmail(datos.email);
          if (usuarioExistente) {
            throw new Error('El email ya está registrado');
          }

          // Hashear contraseña
          const passwordHash = await bcrypt.hash(datos.password, 10);

          // Generar código de referido
          const codigoReferido = generarCodigoReferido();

          // Verificar código de referido si se proporcionó
          let referidoPor = null;
          if (datos.codigo_referido) {
            // Aquí podrías verificar si el código existe en la base de datos
            // Por ahora, lo guardamos como referencia
            referidoPor = datos.codigo_referido;
          }

          // Crear usuario en la base de datos
          const usuarioId = await crearUsuario({
            nombre_completo: datos.nombre_completo,
            dni: datos.dni,
            email: datos.email,
            password: passwordHash,
            telefono: datos.telefono,
            instagram: datos.instagram,
            codigo_referido: codigoReferido,
            referido_por: referidoPor
          });

          // Obtener usuario creado
          const usuarioBD = await obtenerUsuarioPorId(usuarioId);
          
          if (!usuarioBD) {
            throw new Error('Error al crear el usuario');
          }

          // Auto-login después del registro
          await get().login(datos.email, datos.password);

        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Error al registrarse'
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          // Eliminar sesión de la base de datos
          const sesionId = localStorage.getItem('sesion_id');
          if (sesionId) {
            await eliminarSesion(sesionId);
            localStorage.removeItem('sesion_id');
          }

          // Limpiar estado
          set({
            usuario: null,
            autenticado: false,
            loading: false,
            error: null
          });

        } catch (error: any) {
          console.error('Error al cerrar sesión:', error);
          // Forzar logout aunque haya error
          set({
            usuario: null,
            autenticado: false,
            loading: false,
            error: null
          });
        }
      },

      // Verificar autenticación
      checkAuth: async () => {
        set({ loading: true });
        
        try {
          const sesionId = localStorage.getItem('sesion_id');
          
          if (!sesionId) {
            set({
              usuario: null,
              autenticado: false,
              loading: false
            });
            return;
          }

          // Verificar sesión en base de datos
          const sesion = await obtenerSesion(sesionId);
          
          if (!sesion) {
            // Sesión inválida o expirada
            localStorage.removeItem('sesion_id');
            set({
              usuario: null,
              autenticado: false,
              loading: false
            });
            return;
          }

          // Obtener datos del usuario
          const usuarioBD = await obtenerUsuarioPorId(sesion.usuario_id);
          
          if (!usuarioBD) {
            localStorage.removeItem('sesion_id');
            set({
              usuario: null,
              autenticado: false,
              loading: false
            });
            return;
          }

          const usuario: Usuario = {
            id: usuarioBD.id,
            nombre_completo: usuarioBD.nombre_completo,
            dni: usuarioBD.dni,
            email: usuarioBD.email,
            telefono: usuarioBD.telefono,
            instagram: usuarioBD.instagram,
            puntos: usuarioBD.puntos,
            nivel: usuarioBD.nivel,
            codigo_referido: usuarioBD.codigo_referido,
            referido_por: usuarioBD.referido_por
          };

          set({
            usuario,
            autenticado: true,
            loading: false,
            error: null
          });

        } catch (error: any) {
          console.error('Error verificando autenticación:', error);
          localStorage.removeItem('sesion_id');
          set({
            usuario: null,
            autenticado: false,
            loading: false,
            error: null
          });
        }
      },

      // Limpiar error
      limpiarError: () => {
        set({ error: null });
      },

      // Refrescar datos del usuario
      refreshUserData: async () => {
        const { usuario, autenticado } = get();
        
        if (!autenticado || !usuario) {
          return;
        }

        try {
          const usuarioBD = await obtenerUsuarioPorId(usuario.id);
          
          if (usuarioBD) {
            const usuarioActualizado: Usuario = {
              id: usuarioBD.id,
              nombre_completo: usuarioBD.nombre_completo,
              dni: usuarioBD.dni,
              email: usuarioBD.email,
              telefono: usuarioBD.telefono,
              instagram: usuarioBD.instagram,
              puntos: usuarioBD.puntos,
              nivel: usuarioBD.nivel,
              codigo_referido: usuarioBD.codigo_referido,
              referido_por: usuarioBD.referido_por
            };

            set({ usuario: usuarioActualizado });
          }
        } catch (error: any) {
          console.error('Error refrescando datos:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Solo persistir datos básicos, no el loading o error
        autenticado: state.autenticado,
        usuario: state.usuario ? {
          id: state.usuario.id,
          nombre_completo: state.usuario.nombre_completo,
          email: state.usuario.email,
          puntos: state.usuario.puntos,
          nivel: state.usuario.nivel
        } : null
      })
    }
  )
);

// Hook para obtener estadísticas del usuario
export function useEstadisticasUsuario() {
  const { usuario } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cargarEstadisticas = async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      const stats = await obtenerEstadisticasUsuario(usuario.id);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, [usuario?.id]);

  return { estadisticas, loading, refrescar: cargarEstadisticas };
}
