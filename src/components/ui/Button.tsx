/**
 * 🔘 Componente Button - Laboratorio 3D
 * 
 * Componente de botón reutilizable con múltiples variantes,
 * tamaños, estados y accesibilidad. Diseñado con TailwindCSS
 * y TypeScript para máxima flexibilidad y seguridad de tipos.
 * 
 * Características:
 * - Múltiples variantes (primary, secondary, outline, ghost, danger)
 * - Diferentes tamaños (sm, md, lg, xl)
 * - Estados de carga y deshabilitado
 * - Iconos integrados
 * - Totalmente accesible
 * - Animaciones suaves
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Icono de loading simple (reemplaza lucide-react si no está instalado)
const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ============================================================================
// 🔧 TIPOS Y PROPS
// ============================================================================

/**
 * 🎨 Variantes disponibles para el botón
 */
type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning';

/**
 * 📏 Tamaños disponibles para el botón
 */
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * 🔘 Props del componente Button
 */
interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * 🎨 Variante visual del botón
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * 📏 Tamaño del botón
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * ⏳ Estado de carga del botón
   * @default false
   */
  loading?: boolean;
  
  /**
   * 🚫 Si el botón está deshabilitado
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 🎭 Icono a mostrar en el botón
   */
  icon?: React.ReactNode;
  
  /**
   * 📍 Posición del icono
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * 🔤 Texto del botón (opcional si se usan children)
   */
  text?: string;
  
  /**
   * 🎯 Si el botón ocupa todo el ancho disponible
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 🔄 Función a ejecutar al hacer clic
   */
  onClick?: () => void | Promise<void>;
  
  /**
   * 📦 Contenido del botón
   */
  children?: React.ReactNode;
  
  /**
   * 🔖 Tipo de botón HTML
   */
  type?: 'button' | 'submit' | 'reset';
}

// ============================================================================
// 🎨 CONFIGURACIÓN DE ESTILOS
// ============================================================================

/**
 * 🎭 Clases CSS según la variante del botón
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-lab-purple-600 hover:bg-lab-purple-700 
    text-white shadow-lg hover:shadow-xl
    border-lab-purple-600
    focus:ring-lab-purple-500
  `,
  secondary: `
    bg-lab-lime-600 hover:bg-lab-lime-700 
    text-white shadow-lg hover:shadow-xl
    border-lab-lime-600
    focus:ring-lab-lime-500
  `,
  outline: `
    bg-transparent hover:bg-lab-purple-50 
    text-lab-purple-600 border-lab-purple-600
    hover:border-lab-purple-700 hover:text-lab-purple-700
    focus:ring-lab-purple-500
  `,
  ghost: `
    bg-transparent hover:bg-gray-100 
    text-gray-700 border-transparent
    hover:text-gray-900
    focus:ring-gray-500
  `,
  danger: `
    bg-red-600 hover:bg-red-700 
    text-white shadow-lg hover:shadow-xl
    border-red-600
    focus:ring-red-500
  `,
  success: `
    bg-green-600 hover:bg-green-700 
    text-white shadow-lg hover:shadow-xl
    border-green-600
    focus:ring-green-500
  `,
  warning: `
    bg-lab-amber-600 hover:bg-lab-amber-700 
    text-white shadow-lg hover:shadow-xl
    border-lab-amber-600
    focus:ring-lab-amber-500
  `,
};

/**
 * 📏 Clases CSS según el tamaño del botón
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: `
    px-3 py-1.5 text-sm font-medium
    rounded-md
  `,
  md: `
    px-4 py-2 text-base font-medium
    rounded-lg
  `,
  lg: `
    px-6 py-3 text-lg font-medium
    rounded-lg
  `,
  xl: `
    px-8 py-4 text-xl font-medium
    rounded-xl
  `,
};

/**
 * 🎭 Clases CSS para el icono según el tamaño
 */
const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

// ============================================================================
// 🔘 COMPONENTE BUTTON
// ============================================================================

/**
 * 🔘 Componente Button principal
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      text,
      children,
      fullWidth = false,
      onClick,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // ========================================================================
    // 🔄 MANEJO DE CLICK CON ASYNC SUPPORT
    // ========================================================================
    
    const handleClick = async () => {
      if (loading || disabled) return;
      
      try {
        await onClick?.();
      } catch (error) {
        console.error('❌ Error en el manejador de click del botón:', error);
      }
    };

    // ========================================================================
    // 🎨 CLASES CSS DINÁMICAS
    // ========================================================================
    
    const baseClasses = `
      inline-flex items-center justify-center
      border-2 font-medium
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:hover:shadow-md disabled:hover:transform-none
      active:scale-95
    `;

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    // ========================================================================
    // 🎭 RENDERIZADO DEL CONTENIDO
    // ========================================================================
    
    const renderContent = () => {
      // Si está cargando, mostrar spinner
      if (loading) {
        return (
          <>
            <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
            {text && <span className="ml-2">{text}</span>}
            {children && <span className="ml-2">{children}</span>}
          </>
        );
      }

      // Si hay icono a la izquierda
      if (icon && iconPosition === 'left') {
        return (
          <>
            {icon}
            {(text || children) && <span className="ml-2">{text || children}</span>}
          </>
        );
      }

      // Si hay icono a la derecha
      if (icon && iconPosition === 'right') {
        return (
          <>
            {(text || children) && <span className="mr-2">{text || children}</span>}
            {icon}
          </>
        );
      }

      // Solo texto o children
      return text || children;
    };

    // ========================================================================
    // 🔘 RENDERIZADO DEL BOTÓN
    // ========================================================================
    
    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

// ============================================================================
// 📝 NOMBRE DEL COMPONENTE PARA DEBUGGING
// ============================================================================

Button.displayName = 'Button';

// ============================================================================
// 🎯 COMPONENTES ESPECIALIZADOS (CONVENIENCIA)
// ============================================================================

/**
 * 🔘 Botón primario con configuración por defecto
 */
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

/**
 * 🔘 Botón secundario con configuración por defecto
 */
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

/**
 * 🔘 Botón de peligro con configuración por defecto
 */
export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

/**
 * 🔘 Botón de éxito con configuración por defecto
 */
export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);

/**
 * 🔘 Botón de advertencia con configuración por defecto
 */
export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="warning" {...props} />
);

// ============================================================================
// 📤 EXPORTACIONES
// ============================================================================

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };
