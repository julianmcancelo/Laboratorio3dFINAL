import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface Usuario {
  id: number;
  nombre_completo: string;
  dni: string;
  email: string;
  telefono?: string;
  instagram?: string;
  puntos: number;
  nivel: string;
  codigo_referido?: string;
  referido_por?: string;
}

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
          // Llamar a la API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, recordarme }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
          }

          // Actualizar estado
          const usuario: Usuario = {
            id: data.usuario.id,
            nombre_completo: data.usuario.nombre_completo,
            dni: '',
            email: data.usuario.email,
            puntos: data.usuario.puntos,
            nivel: data.usuario.nivel,
            codigo_referido: undefined,
            referido_por: undefined
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

          // Llamar a la API de registro
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al registrarse');
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
          // Por ahora, verificamos solo el estado persistido
          const { autenticado, usuario } = get();
          
          if (!autenticado || !usuario) {
            set({
              usuario: null,
              autenticado: false,
              loading: false
            });
            return;
          }

          set({
            loading: false,
            error: null
          });

        } catch (error: any) {
          console.error('Error verificando autenticación:', error);
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
          // Por ahora, mantenemos los datos actuales
          console.log('Refrescando datos del usuario...');
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
