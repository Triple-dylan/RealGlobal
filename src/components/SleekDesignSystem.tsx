import React from 'react'
import { useAnimations, animationClasses } from './AnimationCSS'

// Modern Glass Morphism Design System
export const sleekStyles = {
  // Glass morphism effects
  glassMorphism: {
    primary: 'bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl shadow-black/10',
    secondary: 'bg-white/70 backdrop-blur-lg border border-white/40 shadow-lg shadow-black/8',
    tertiary: 'bg-white/60 backdrop-blur-md border border-white/50 shadow-md shadow-black/5',
    overlay: 'bg-white/90 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/15'
  },
  
  // Modern button styles with transparency
  buttons: {
    primary: 'bg-blue-500/90 hover:bg-blue-600/95 text-white backdrop-blur-md border border-blue-400/40 shadow-lg shadow-blue-500/25',
    secondary: 'bg-white/85 hover:bg-white/95 text-gray-700 backdrop-blur-md border border-gray-200/60 shadow-md shadow-gray-500/15',
    success: 'bg-green-500/90 hover:bg-green-600/95 text-white backdrop-blur-md border border-green-400/40 shadow-lg shadow-green-500/25',
    danger: 'bg-red-500/90 hover:bg-red-600/95 text-white backdrop-blur-md border border-red-400/40 shadow-lg shadow-red-500/25',
    ghost: 'bg-transparent hover:bg-white/70 text-gray-700 backdrop-blur-md border border-gray-200/40 shadow-sm hover:shadow-md'
  },
  
  // Card styles with glass effects
  cards: {
    primary: 'bg-white/75 backdrop-blur-lg border border-white/20 shadow-xl shadow-black/5 rounded-2xl',
    secondary: 'bg-white/65 backdrop-blur-md border border-white/30 shadow-lg shadow-black/3 rounded-xl',
    hover: 'hover:bg-white/85 hover:shadow-2xl hover:shadow-black/10 hover:scale-[1.02] hover:-translate-y-1'
  },
  
  // Input styles
  inputs: {
    primary: 'bg-white/70 backdrop-blur-md border border-white/30 shadow-inner shadow-black/5 rounded-xl placeholder-gray-400/70',
    focus: 'focus:bg-white/80 focus:border-blue-300/50 focus:shadow-lg focus:shadow-blue-500/10 focus:outline-none'
  },
  
  // Status indicators with transparency
  status: {
    success: 'bg-green-100/80 text-green-700 border border-green-200/50 backdrop-blur-sm',
    warning: 'bg-yellow-100/80 text-yellow-700 border border-yellow-200/50 backdrop-blur-sm',
    error: 'bg-red-100/80 text-red-700 border border-red-200/50 backdrop-blur-sm',
    info: 'bg-blue-100/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm'
  },
  
  // Text styles with improved contrast
  text: {
    primary: 'text-gray-900/90',
    secondary: 'text-gray-600/80',
    muted: 'text-gray-500/70',
    accent: 'text-blue-600/90'
  },
  
  // Enhanced hover effects
  hover: {
    lift: 'hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 hover:scale-[1.02]',
    glow: 'hover:shadow-2xl hover:shadow-current/20',
    scale: 'hover:scale-105 active:scale-95'
  },
  
  // Transitions for smooth interactions
  transitions: {
    smooth: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-150 ease-out',
    slow: 'transition-all duration-500 ease-out'
  }
}

// Modern Glass Button Component
export const GlassButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  icon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-xl font-medium 
    ${sleekStyles.buttons[variant]} 
    ${sleekStyles.transitions.smooth} 
    ${sleekStyles.hover.scale}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `
  
  return (
    <button
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </div>
    </button>
  )
}

// Modern Glass Card Component
export const GlassCard: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  hover = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const baseClasses = `
    ${sleekStyles.cards[variant]}
    ${paddingClasses[padding]}
    ${sleekStyles.transitions.smooth}
    ${hover ? sleekStyles.cards.hover : ''}
  `
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  )
}

// Modern Glass Input Component
export const GlassInput: React.FC<{
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
}> = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  icon,
  disabled = false
}) => {
  const baseClasses = `
    ${sleekStyles.inputs.primary}
    ${sleekStyles.inputs.focus}
    ${sleekStyles.transitions.smooth}
    px-4 py-2 w-full
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `
  
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/70">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseClasses} ${icon ? 'pl-10' : ''} ${className}`}
      />
    </div>
  )
}

// Modern Status Badge Component
export const StatusBadge: React.FC<{
  children: React.ReactNode
  variant: 'success' | 'warning' | 'error' | 'info'
  className?: string
  size?: 'sm' | 'md'
}> = ({ children, variant, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }
  
  const baseClasses = `
    ${sleekStyles.status[variant]}
    ${sizeClasses[size]}
    rounded-full font-medium
    ${sleekStyles.transitions.smooth}
  `
  
  return (
    <span className={`${baseClasses} ${className}`}>
      {children}
    </span>
  )
}

// Modern Glass Panel Component
export const GlassPanel: React.FC<{
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}> = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  actions,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  
  return (
    <div className={`${sleekStyles.glassMorphism.primary} rounded-2xl ${sleekStyles.transitions.smooth} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div>
            {title && (
              <h3 className={`font-semibold ${sleekStyles.text.primary}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm ${sleekStyles.text.secondary} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1 rounded-lg ${sleekStyles.buttons.ghost} ${sleekStyles.transitions.smooth}`}
              >
                {isCollapsed ? '↓' : '↑'}
              </button>
            )}
          </div>
        </div>
      )}
      {!isCollapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Modern Tooltip Component
export const GlassTooltip: React.FC<{
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false)
  
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  }
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`
          absolute z-50 ${positionClasses[position]}
          ${sleekStyles.glassMorphism.overlay}
          px-3 py-2 rounded-lg text-sm ${sleekStyles.text.primary}
          whitespace-nowrap
          ${animationClasses.fadeIn}
        `}>
          {content}
        </div>
      )}
    </div>
  )
}

// Add enhanced CSS for glass morphism effects
export const useGlassEffects = () => {
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Enhanced backdrop blur support */
      .backdrop-blur-2xl {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
      }
      
      .backdrop-blur-xl {
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }
      
      .backdrop-blur-lg {
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }
      
      .backdrop-blur-md {
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      
      /* Improved glass morphism shadows */
      .shadow-glass {
        box-shadow: 
          0 8px 32px 0 rgba(31, 38, 135, 0.37),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
      }
      
      /* Subtle inner glow */
      .inner-glow {
        box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
      }
      
      /* Enhanced button hover effects */
      .btn-glass-hover:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 12px 40px 0 rgba(31, 38, 135, 0.4),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
      }
      
      /* Smooth color transitions */
      .color-transition {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
      }
      
      /* Enhanced focus states */
      .focus-glass:focus {
        outline: none;
        box-shadow: 
          0 0 0 3px rgba(59, 130, 246, 0.2),
          0 8px 32px 0 rgba(31, 38, 135, 0.37);
      }
      
      /* Frosted glass effect */
      .frosted-glass {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      /* Subtle animations */
      .gentle-bounce {
        animation: gentle-bounce 0.5s ease-out;
      }
      
      @keyframes gentle-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
}

export default {
  sleekStyles,
  GlassButton,
  GlassCard,
  GlassInput,
  StatusBadge,
  GlassPanel,
  GlassTooltip,
  useGlassEffects
}