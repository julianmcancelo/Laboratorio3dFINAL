/**
 * 🔐 Store de Autenticación - Zustand
 * 
 * Este store maneja el estado global de autenticación de la aplicación.
 * Incluye login, logout, verificación de token y manejo de errores.
 * 
 * Características:
 * - Persistencia en localStorage
 * - Verificación automática de token
 * - Manejo de loading states
 * - Estado del usuario y permisos
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UsuarioCompleto, RolUsuario } from '@/types';

// ============================================================================
// 🔧 INTERFACES DEL STORE
// ============================================================================

/**
 * 🔐 Estado de autenticación
 */
interface AuthState {
  // Estado básico
  autenticado: boolean;
  cargando: boolean;
  error: string | null;
  
  // Datos del usuario
  usuario: UsuarioCompleto | null;
  token: string | null;
  tokenRefresco: string | null;
  
  // Estado de la sesión
  ultimoAcceso: Date | null;
  expiraEn: Date | null;
  recordarme: boolean;
}

/**
 * 🔄 Acciones del store de autenticación
 */
interface AuthActions {
  // Acciones principales
  login: (email: string, password: string, recordarme?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  registrar: (datosRegistro: any) => Promise<void>;
  
  // Verificación y refresco
  verificarToken: () => Promise<boolean>;
  refrescarToken: () => Promise<void>;
  verificarSesionActiva: () => boolean;
  
  // Actualización de datos
  actualizarUsuario: (datosActualizados: Partial<UsuarioCompleto>) => void;
  
  // Manejo de estado
  limpiarError: () => void;
  setCargando: (cargando: boolean) => void;
  setError: (error: string) => void;
  
  // Utilidades
  tieneRol: (rol: RolUsuario | RolUsuario[]) => boolean;
  esAdmin: () => boolean;
  esCliente: () => boolean;
}

/**
 * 🏪 Store completo de autenticación
 */
type AuthStore = AuthState & AuthActions;

// ============================================================================
// 🏪 CREACIÓN DEL STORE
// ============================================================================

/**
 * 🔐 Store principal de autenticación con Zustand
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // 📊 ESTADO INICIAL
      // ========================================================================
      autenticado: false,
      cargando: false,
      error: null,
      usuario: null,
      token: null,
      tokenRefresco: null,
      ultimoAcceso: null,
      expiraEn: null,
      recordarme: false,

      // ========================================================================
      // 🔐 ACCIONES PRINCIPALES
      // ========================================================================

      /**
       * 🔑 Inicia sesión del usuario
       * 
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @param recordarme - Si se debe recordar la sesión
       */
      login: async (email: string, password: string, recordarme = false) => {
        try {
          set({ cargando: true, error: null });

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, recordar: recordarme }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Error al iniciar sesión');
          }

          // Calcular fecha de expiración
          const expiraEn = new Date();
          expiraEn.setHours(expiraEn.getHours() + (recordarme ? 24 * 7 : 24)); // 7 días o 24 horas

          set({
            autenticado: true,
            usuario: data.usuario,
            token: data.token,
            tokenRefresco: data.refresh_token,
            cargando: false,
            error: null,
            ultimoAcceso: new Date(),
            expiraEn,
            recordarme,
          });

          console.log('✅ Sesión iniciada exitosamente');
        } catch (error) {
          const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
          console.error('❌ Error en login:', mensajeError);
          
          set({
            autenticado: false,
            usuario: null,
            token: null,
            tokenRefresco: null,
            cargando: false,
            error: mensajeError,
            ultimoAcceso: null,
            expiraEn: null,
            recordarme: false,
          });

          throw error;
        }
      },

      /**
       * 🚪 Cierra la sesión del usuario
       */
      logout: async () => {
        try {
          set({ cargando: true });

          // Llamar al endpoint de logout para limpiar cookies en el servidor
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          // Limpiar estado local
          set({
            autenticado: false,
            usuario: null,
            token: null,
            tokenRefresco: null,
            cargando: false,
            error: null,
            ultimoAcceso: null,
            expiraEn: null,
            recordarme: false,
          });

          console.log('✅ Sesión cerrada exitosamente');
        } catch (error) {
          console.error('❌ Error en logout:', error);
          
          // Even if there's an error, clear local state
          set({
            autenticado: false,
            usuario: null,
            token: null,
            tokenRefresco: null,
            cargando: false,
            error: null,
            ultimoAcceso: null,
            expiraEn: null,
            recordarme: false,
          });
        }
      },

      /**
       * 📝 Registra un nuevo usuario
       * 
       * @param datosRegistro - Datos del nuevo usuario
       */
      registrar: async (datosRegistro: any) => {
        try {
          set({ cargando: true, error: null });

          const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosRegistro),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Error al registrar usuario');
          }

          // Calcular fecha de expiración (24 horas por defecto en registro)
          const expiraEn = new Date();
          expiraEn.setHours(expiraEn.getHours() + 24);

          set({
            autenticado: true,
            usuario: data.usuario,
            token: data.token,
            tokenRefresco: data.refresh_token,
            cargando: false,
            error: null,
            ultimoAcceso: new Date(),
            expiraEn,
            recordarme: false,
          });

          console.log('✅ Usuario registrado exitosamente');
        } catch (error) {
          const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
          console.error('❌ Error en registro:', mensajeError);
          
          set({
            autenticado: false,
            usuario: null,
            token: null,
            tokenRefresco: null,
            cargando: false,
            error: mensajeError,
            ultimoAcceso: null,
            expiraEn: null,
            recordarme: false,
          });

          throw error;
        }
      },

      // ========================================================================
      // 🔍 VERIFICACIÓN Y REFRESCO
      // ========================================================================

      /**
       * ✅ Verifica si el token actual es válido
       * 
       * @returns true si el token es válido, false si no
       */
      verificarToken: async (): Promise<boolean> => {
        try {
          const { token } = get();
          
          if (!token) {
            return false;
          }

          const response = await fetch('/api/auth/verificar', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
              // Actualizar último acceso
              set({ ultimoAcceso: new Date() });
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('❌ Error al verificar token:', error);
          return false;
        }
      },

      /**
       * 🔄 Refresca el token de autenticación
       */
      refrescarToken: async () => {
        try {
          const { tokenRefresco } = get();
          
          if (!tokenRefresco) {
            throw new Error('No hay token de refresco disponible');
          }

          const response = await fetch('/api/auth/refrescar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: tokenRefresco }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Error al refrescar token');
          }

          // Actualizar token y fecha de expiración
          const expiraEn = new Date();
          expiraEn.setHours(expiraEn.getHours() + 24);

          set({
            token: data.token,
            ultimoAcceso: new Date(),
            expiraEn,
          });

          console.log('✅ Token refrescado exitosamente');
        } catch (error) {
          console.error('❌ Error al refrescar token:', error);
          
          // Si hay error al refrescar, hacer logout
          get().logout();
          throw error;
        }
      },

      /**
       * 🔍 Verifica si la sesión está activa
       * 
       * @returns true si la sesión está activa, false si no
       */
      verificarSesionActiva: (): boolean => {
        const { autenticado, expiraEn, token } = get();
        
        if (!autenticado || !token || !expiraEn) {
          return false;
        }

        // Verificar si el token ha expirado
        if (new Date() >= expiraEn) {
          console.log('⏰ Token expirado, cerrando sesión');
          get().logout();
          return false;
        }

        return true;
      },

      // ========================================================================
      // 📝 ACTUALIZACIÓN DE DATOS
      // ========================================================================

      /**
       * ✏️ Actualiza los datos del usuario en el store
       * 
       * @param datosActualizados - Datos a actualizar
       */
      actualizarUsuario: (datosActualizados: Partial<UsuarioCompleto>) => {
        const { usuario } = get();
        
        if (usuario) {
          set({
            usuario: { ...usuario, ...datosActualizados },
          });
        }
      },

      // ========================================================================
      // 🛠️ MANEJO DE ESTADO
      // ========================================================================

      /**
       * 🧹 Limpia el error actual
       */
      limpiarError: () => {
        set({ error: null });
      },

      /**
       * ⏳ Establece el estado de carga
       * 
       * @param cargando - Estado de carga
       */
      setCargando: (cargando: boolean) => {
        set({ cargando });
      },

      /**
       * ❌ Establece un error
       * 
       * @param error - Mensaje de error
       */
      setError: (error: string) => {
        set({ error, cargando: false });
      },

      // ========================================================================
      // 🔧 UTILIDADES
      // ========================================================================

      /**
       * 🎭 Verifica si el usuario tiene un rol específico
       * 
       * @param rol - Rol o roles a verificar
       * @returns true si tiene el rol, false si no
       */
      tieneRol: (rol: RolUsuario | RolUsuario[]): boolean => {
        const { usuario } = get();
        
        if (!usuario) {
          return false;
        }

        if (Array.isArray(rol)) {
          return rol.includes(usuario.rol);
        }

        return usuario.rol === rol;
      },

      /**
       * 👑 Verifica si el usuario es administrador
       * 
       * @returns true si es admin, false si no
       */
      esAdmin: (): boolean => {
        return get().tieneRol(RolUsuario.ADMIN);
      },

      /**
       * 👤 Verifica si el usuario es cliente
       * 
       * @returns true si es cliente, false si no
       */
      esCliente: (): boolean => {
        return get().tieneRol(RolUsuario.CLIENTE);
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir campos necesarios
      partialize: (state) => ({
        autenticado: state.autenticado,
        usuario: state.usuario,
        token: state.token,
        tokenRefresco: state.tokenRefresco,
        ultimoAcceso: state.ultimoAcceso,
        expiraEn: state.expiraEn,
        recordarme: state.recordarme,
      }),
      // No persistir estados de carga o errores
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store de autenticación rehidratado');
        
        // Verificar si la sesión sigue activa al rehidratar
        if (state?.autenticado && state.verificarSesionActiva) {
          const estaActiva = state.verificarSesionActiva();
          if (!estaActiva) {
            console.log('⚠️ Sesión expirada durante rehidratación');
          }
        }
      },
    }
  )
);

// ============================================================================
// 🎯 HOOKS PERSONALIZADOS
// ============================================================================

/**
 * 🔐 Hook para verificar autenticación en componentes
 * 
 * @returns Estado de autenticación y utilidades
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  
  return {
    ...authStore,
    // Alias comunes para mejor legibilidad
    isLoggedIn: authStore.autenticado,
    isLoading: authStore.cargando,
    user: authStore.usuario,
    hasError: !!authStore.error,
    errorMessage: authStore.error,
  };
};

/**
 * 🛡️ Hook para proteger rutas que requieren autenticación
 * 
 * @param rolesPermitidos - Roles permitidos para acceder
 * @returns Estado de autenticación y permisos
 */
export const useRequireAuth = (rolesPermitidos?: RolUsuario | RolUsuario[]) => {
  const authStore = useAuthStore();
  
  const tienePermiso = rolesPermitidos 
    ? authStore.tieneRol(rolesPermitidos)
    : authStore.autenticado;

  return {
    ...authStore,
    tienePermiso,
    estaAutorizado: authStore.autenticado && tienePermiso,
  };
};
