/**
 * 📝 Componente Input - Laboratorio 3D
 * 
 * Componente de input de formulario reutilizable con múltiples variantes,
 * estados de validación, accesibilidad y diseño consistente.
 * 
 * Características:
 * - Múltiples variantes (text, email, password, tel, number)
 * - Estados de validación (error, success, warning)
 * - Iconos integrados
 * - Labels flotantes
 * - Mensajes de ayuda y error
 * - Totalmente accesible
 * - Integración con React Hook Form
 */

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Iconos simples inline (reemplaza lucide-react)
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
);

// ============================================================================
// 🔧 TIPOS Y PROPS
// ============================================================================

/**
 * 📝 Tipos de input disponibles
 */
type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'number'
  | 'url'
  | 'search';

/**
 * 🎭 Estados de validación del input
 */
type InputState = 'default' | 'error' | 'success' | 'warning';

/**
 * 📏 Tamaños disponibles para el input
 */
type InputSize = 'sm' | 'md' | 'lg';

/**
 * 📝 Props del componente Input
 */
interface InputProps extends Omit<React.HTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * 📝 Tipo de input
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * 📝 Valor del input
   */
  value?: string | number;
  
  /**
   * 🔄 Función onChange
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * 🎯 Función onFocus
   */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * 🎯 Función onBlur
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * 📝 Nombre del input
   */
  name?: string;
  
  /**
   * 📝 ID del input
   */
  id?: string;
  
  /**
   * 📝 Valor por defecto
   */
  defaultValue?: string | number;
  
  /**
   * 📏 Tamaño del input
   * @default 'md'
   */
  size?: InputSize;
  
  /**
   * 🎭 Estado de validación
   * @default 'default'
   */
  state?: InputState;
  
  /**
   * 🏷️ Etiqueta del input
   */
  label?: string;
  
  /**
   * 💬 Mensaje de ayuda o descripción
   */
  helperText?: string;
  
  /**
   * ❌ Mensaje de error
   */
  errorMessage?: string;
  
  /**
   * 🎭 Icono a mostrar en el input
   */
  icon?: React.ReactNode;
  
  /**
   * 📍 Posición del icono
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * 🎯 Si el label debe flotar (Material Design style)
   * @default false
   */
  floatingLabel?: boolean;
  
  /**
   * 🎯 Si el input ocupa todo el ancho disponible
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * 🔤 Placeholder del input
   */
  placeholder?: string;
  
  /**
   * 🚫 Si el input es requerido
   * @default false
   */
  required?: boolean;
  
  /**
   * 🔒 Si el input está deshabilitado
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 📖 Solo lectura
   * @default false
   */
  readOnly?: boolean;
}

// ============================================================================
// 🎨 CONFIGURACIÓN DE ESTILOS
// ============================================================================

/**
 * 🎭 Clases CSS según el estado del input
 */
const stateClasses: Record<InputState, string> = {
  default: `
    border-gray-300 focus:border-lab-purple-500 focus:ring-lab-purple-500
    bg-white text-gray-900 placeholder-gray-500
  `,
  error: `
    border-red-500 focus:border-red-500 focus:ring-red-500
    bg-red-50 text-red-900 placeholder-red-500
  `,
  success: `
    border-green-500 focus:border-green-500 focus:ring-green-500
    bg-green-50 text-green-900 placeholder-green-500
  `,
  warning: `
    border-lab-amber-500 focus:border-lab-amber-500 focus:ring-lab-amber-500
    bg-amber-50 text-amber-900 placeholder-amber-500
  `,
};

/**
 * 📏 Clases CSS según el tamaño del input
 */
const sizeClasses: Record<InputSize, string> = {
  sm: `
    px-3 py-1.5 text-sm
    rounded-md
  `,
  md: `
    px-4 py-2 text-base
    rounded-lg
  `,
  lg: `
    px-5 py-3 text-lg
    rounded-lg
  `,
};

/**
 * 🎭 Clases CSS para el icono según el tamaño
 */
const iconSizeClasses: Record<InputSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

/**
 * 🎭 Iconos según el estado
 */
const stateIcons: Record<InputState, React.ReactNode> = {
  default: null,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <Info className="h-5 w-5 text-amber-500" />,
};

// ============================================================================
// 📝 COMPONENTE INPUT
// ============================================================================

/**
 * 📝 Componente Input principal
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorMessage,
      icon,
      iconPosition = 'left',
      floatingLabel = false,
      fullWidth = true,
      placeholder,
      required = false,
      disabled = false,
      readOnly = false,
      className,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // ========================================================================
    // 🔄 ESTADO INTERNO
    // ========================================================================
    
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    // Determinar si el input tiene valor
    React.useEffect(() => {
      setHasValue(!!value || !!props.defaultValue);
    }, [value, props.defaultValue]);

    // ========================================================================
    // 🎭 MANEJADORES DE EVENTOS
    // ========================================================================
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // ========================================================================
    // 🎨 CLASES CSS DINÁMICAS
    // ========================================================================
    
    const baseClasses = `
      block w-full border-2 transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      read-only:bg-gray-50 read-only:cursor-default
    `;

    const inputClasses = cn(
      baseClasses,
      stateClasses[state],
      sizeClasses[size],
      icon && iconPosition === 'left' && 'pl-12',
      icon && iconPosition === 'right' && 'pr-12',
      (type === 'password' || state !== 'default') && 'pr-12',
      fullWidth && 'w-full',
      !fullWidth && 'w-auto',
      className
    );

    // ========================================================================
    // 🎨 CLASES PARA LABEL FLOTANTE
    // ========================================================================
    
    const shouldFloat = floatingLabel && (isFocused || hasValue);
    const labelClasses = cn(
      'absolute left-4 transition-all duration-200 pointer-events-none',
      'bg-white px-1',
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      size === 'lg' && 'text-base',
      shouldFloat
        ? '-top-2 left-3 text-lab-purple-600'
        : 'top-1/2 -translate-y-1/2 text-gray-500',
      state === 'error' && 'text-red-500',
      state === 'success' && 'text-green-500',
      state === 'warning' && 'text-amber-500',
      disabled && 'text-gray-400',
      icon && iconPosition === 'left' && 'left-12'
    );

    const containerClasses = cn(
      'relative',
      !fullWidth && 'inline-block',
      className
    );

    // ========================================================================
    // 🎭 RENDERIZADO DE ICONOS
    // ========================================================================
    
    const renderLeftIcon = () => {
      if (!icon || iconPosition !== 'left') return null;
      
      return (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className={cn(iconSizeClasses[size], 'text-gray-400')}>
            {icon}
          </div>
        </div>
      );
    };

    const renderRightIcon = () => {
      if (type === 'password') {
        return (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={iconSizeClasses[size]} />
            ) : (
              <Eye className={iconSizeClasses[size]} />
            )}
          </button>
        );
      }

      if (icon && iconPosition === 'right') {
        return (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className={cn(iconSizeClasses[size], 'text-gray-400')}>
              {icon}
            </div>
          </div>
        );
      }

      if (state !== 'default') {
        return (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {stateIcons[state]}
          </div>
        );
      }

      return null;
    };

    // ========================================================================
    // 📝 RENDERIZADO DEL INPUT
    // ========================================================================
    
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const displayPlaceholder = floatingLabel && !shouldFloat ? ' ' : placeholder;

    return (
      <div className={containerClasses}>
        {/* Label flotante */}
        {label && floatingLabel && (
          <label className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Label normal */}
        {label && !floatingLabel && (
          <label className={cn(
            'block text-sm font-medium mb-1',
            state === 'error' && 'text-red-700',
            state === 'success' && 'text-green-700',
            state === 'warning' && 'text-amber-700',
            disabled && 'text-gray-500'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Contenedor del input */}
        <div className="relative">
          {renderLeftIcon()}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            placeholder={displayPlaceholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={state === 'error'}
            aria-describedby={
              helperText ? `${props.id || 'input'}-helper` : 
              errorMessage ? `${props.id || 'input'}-error` : 
              undefined
            }
            {...props}
          />
          
          {renderRightIcon()}
        </div>

        {/* Mensajes de ayuda y error */}
        {helperText && !errorMessage && (
          <p className={cn(
            'mt-1 text-sm',
            state === 'error' && 'text-red-600',
            state === 'success' && 'text-green-600',
            state === 'warning' && 'text-amber-600',
            state === 'default' && 'text-gray-500'
          )}>
            {helperText}
          </p>
        )}

        {errorMessage && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

// ============================================================================
// 📝 NOMBRE DEL COMPONENTE PARA DEBUGGING
// ============================================================================

Input.displayName = 'Input';

// ============================================================================
// 🎯 COMPONENTES ESPECIALIZADOS (CONVENIENCIA)
// ============================================================================

/**
 * 📧 Input de email con configuración por defecto
 */
export const EmailInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="email" {...props} />
);

/**
 * 🔐 Input de contraseña con configuración por defecto
 */
export const PasswordInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="password" {...props} />
);

/**
 * 📱 Input de teléfono con configuración por defecto
 */
export const PhoneInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="tel" {...props} />
);

/**
 * 🔢 Input numérico con configuración por defecto
 */
export const NumberInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="number" {...props} />
);

/**
 * 🔍 Input de búsqueda con configuración por defecto
 */
export const SearchInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="search" {...props} />
);

// ============================================================================
// 📤 EXPORTACIONES
// ============================================================================

export default Input;
export type { InputProps, InputType, InputState, InputSize };
