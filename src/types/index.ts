/**
 * 📦 Índice Principal de Tipos
 * 
 * Este archivo exporta todos los tipos y validaciones del sistema
 * para facilitar su importación en otros módulos.
 */

// Exportar todos los tipos de usuario
export * from './usuario';

// Exportar todos los tipos de premios
export * from './premio';

// Exportar todos los tipos de compras
export * from './compra';

// ============================================================================
// 🎭 TIPOS COMUNES Y GENERALES
// ============================================================================

/**
 * 📊 Interface de Respuesta API Genérica
 * Define la estructura estándar para todas las respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  mensaje?: string;
  timestamp: string;
}

/**
 * 📄 Interface de Paginación
 * Define la estructura para respuestas paginadas
 */
export interface PaginacionResponse<T> {
  datos: T[];
  paginacion: {
    pagina_actual: number;
    total_paginas: number;
    total_registros: number;
    registros_por_pagina: number;
    tiene_siguiente: boolean;
    tiene_anterior: boolean;
  };
}

/**
 * 🔍 Interface de Filtros Genéricos
 * Define la estructura base para filtros de búsqueda
 */
export interface FiltrosBase {
  pagina?: number;
  limite?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  buscar?: string;
}

/**
 * 📊 Interface de Estadísticas Base
 * Define la estructura para estadísticas genéricas
 */
export interface EstadisticasBase {
  periodo: {
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  total_registros: number;
  fecha_ultima_actualizacion: Date;
}

/**
 * 🎯 Enumeración de Tipos de Operación
 * Define los tipos de operaciones que se pueden realizar
 */
export enum TipoOperacion {
  CREAR = 'crear',
  LEER = 'leer',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
  LISTAR = 'listar',
  BUSCAR = 'buscar',
  ESTADISTICAS = 'estadisticas',
}

/**
 * 🛡️ Enumeración de Niveles de Permiso
 * Define los niveles de acceso en el sistema
 */
export enum NivelPermiso {
  PUBLICO = 'publico',
  CLIENTE = 'cliente',
  OPERADOR = 'operador',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * 📝 Interface de Auditoría
 * Registra las acciones realizadas en el sistema
 */
export interface Auditoria {
  id: number;
  usuario_id: number;
  tipo_operacion: TipoOperacion;
  recurso_afectado: string;
  recurso_id: number;
  datos_anteriores?: Record<string, any>;
  datos_nuevos?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  fecha_operacion: Date;
  descripcion: string;
}

/**
 * 🔔 Interface de Notificación
 * Define la estructura para notificaciones del sistema
 */
export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: Date;
  fecha_lectura?: Date;
  datos_adicionales?: Record<string, any>;
}

/**
 * 📊 Interface de Reporte
 * Define la estructura para reportes generados
 */
export interface Reporte {
  id: number;
  nombre: string;
  tipo: string;
  parametros: Record<string, any>;
  datos: any;
  generado_por: number;
  fecha_generacion: Date;
  formato: 'pdf' | 'excel' | 'csv' | 'json';
}

/**
 * 🎨 Interface de Configuración de Tema
 * Define las preferencias de tema del usuario
 */
export interface ConfiguracionTema {
  modo: 'claro' | 'oscuro' | 'auto';
  color_primario: string;
  color_secundario: string;
  fuente: string;
  tamaño_fuente: 'pequeño' | 'mediano' | 'grande';
}

/**
 * ⚙️ Interface de Configuración de Usuario
 * Define las preferencias personalizadas del usuario
 */
export interface ConfiguracionUsuario {
  id: number;
  usuario_id: number;
  tema: ConfiguracionTema;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  idioma: 'es' | 'en';
  zona_horaria: string;
  formato_fecha: string;
  formato_moneda: string;
}

/**
 * 🔐 Interface de Intento de Login
 * Registra los intentos de inicio de sesión
 */
export interface IntentoLogin {
  id: number;
  email: string;
  ip_address: string;
  user_agent: string;
  exitoso: boolean;
  fecha_intento: Date;
  motivo_fallo?: string;
}

/**
 * 📱 Interface de Dispositivo Confiado
 * Registra los dispositivos de confianza del usuario
 */
export interface DispositivoConfiado {
  id: number;
  usuario_id: number;
  dispositivo_id: string;
  nombre_dispositivo: string;
  tipo_dispositivo: string;
  user_agent: string;
  ip_address: string;
  fecha_registro: Date;
  ultimo_acceso: Date;
  activo: boolean;
}

/**
 * 🔄 Interface de Sincronización
 * Define la estructura para sincronización de datos
 */
export interface Sincronizacion {
  id: number;
  tabla_origen: string;
  registro_id: number;
  tipo_operacion: TipoOperacion;
  fecha_sincronizacion: Date;
  exitoso: boolean;
  error_message?: string;
  datos_sincronizados: Record<string, any>;
}

// ============================================================================
// 🛡️ TIPOS PARA VALIDACIONES Y ERRORES
// ============================================================================

/**
 * ❌ Interface de Error Detallado
 * Define la estructura para errores detallados
 */
export interface ErrorDetallado {
  campo: string;
  mensaje: string;
  codigo: string;
  valor?: any;
}

/**
 * 📋 Interface de Respuesta de Validación
 * Define la estructura para respuestas de validación
 */
export interface ValidacionResponse {
  valido: boolean;
  errores: ErrorDetallado[];
  advertencias: string[];
}

/**
 * 🔍 Interface de Búsqueda Avanzada
 * Define filtros complejos para búsquedas
 */
export interface BusquedaAvanzada extends FiltrosBase {
  filtros_personalizados?: Record<string, any>;
  rango_fechas?: {
    campo: string;
    desde: Date;
    hasta: Date;
  };
  rango_valores?: {
    campo: string;
    minimo: number;
    maximo: number;
  };
  lista_valores?: {
    campo: string;
    valores: any[];
  };
}

// ============================================================================
// 🎭 TIPOS PARA ESTADO GLOBAL
// ============================================================================

/**
 * 🏪 Interface del Estado Global de la Aplicación
 * Define la estructura del estado gestionado por Zustand
 */
export interface EstadoApp {
  // Estado de autenticación
  auth: {
    autenticado: boolean;
    usuario: any;
    token: string | null;
    cargando: boolean;
    error: string | null;
  };
  
  // Estado de la aplicación
  app: {
    cargando: boolean;
    menu_abierto: boolean;
    tema: 'claro' | 'oscuro' | 'auto';
    notificaciones: Notificacion[];
  };
  
  // Estado de datos
  datos: {
    usuarios: any[];
    premios: any[];
    compras: any[];
    ultimos_clientes: any[];
    estadisticas: any;
  };
  
  // Estado de UI
  ui: {
    modal_abierto: boolean;
    modal_contenido: any;
    confirmacion_abierta: boolean;
    confirmacion_contenido: any;
    toast: {
      visible: boolean;
      mensaje: string;
      tipo: 'success' | 'error' | 'warning' | 'info';
    };
  };
}

/**
 * 🎯 Interface de Acción del Estado
 * Define las acciones que pueden modificar el estado
 */
export interface EstadoAcciones {
  // Acciones de autenticación
  login: (credenciales: any) => Promise<void>;
  logout: () => void;
  verificarToken: () => Promise<void>;
  
  // Acciones de la aplicación
  toggleMenu: () => void;
  cambiarTema: (tema: 'claro' | 'oscuro' | 'auto') => void;
  agregarNotificacion: (notificacion: Omit<Notificacion, 'id' | 'fecha_creacion'>) => void;
  
  // Acciones de datos
  cargarUsuarios: () => Promise<void>;
  cargarPremios: () => Promise<void>;
  cargarCompras: () => Promise<void>;
  
  // Acciones de UI
  abrirModal: (contenido: any) => void;
  cerrarModal: () => void;
  mostrarToast: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}
