import React, { useState, useEffect } from 'react'

// Enhanced CSS Animation utility classes
export const animationClasses = {
  // Entrance animations
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  
  // New premium entrance animations
  slideUpFade: 'animate-slide-up-fade',
  zoomIn: 'animate-zoom-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  
  // Enhanced hover effects
  hoverScale: 'hover:scale-105 transform transition-transform duration-200 ease-out',
  hoverLift: 'hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out',
  hoverGlow: 'hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300',
  hoverFloat: 'hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out',
  
  // Button animations
  buttonPress: 'active:scale-95 transform transition-transform duration-100 ease-out',
  buttonRipple: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:scale-0 before:rounded-full before:transition-transform before:duration-300 active:before:scale-100',
  
  // Loading animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  shimmer: 'animate-shimmer',
  breathe: 'animate-breathe',
  
  // Smooth transitions
  smooth: 'transition-all duration-300 ease-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-out',
  ultraSmooth: 'transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Stagger animations for lists
  staggerDelay1: 'animation-delay-100',
  staggerDelay2: 'animation-delay-200',
  staggerDelay3: 'animation-delay-300',
  staggerDelay4: 'animation-delay-400',
  staggerDelay5: 'animation-delay-500',
  
  // Interactive micro-animations
  clickFeedback: 'active:scale-[0.98] transition-transform duration-75',
  tapHighlight: 'active:bg-black/5 transition-colors duration-75',
  focusRing: 'focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200'
}

// Add CSS keyframes to the document
const addAnimationStyles = () => {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slide-left {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slide-right {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes glow-pulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      }
      50% {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
      }
    }
    
    @keyframes value-count {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes slide-up-fade {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes zoom-in {
      from {
        opacity: 0;
        transform: scale(0.8) rotate(-5deg);
      }
      to {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }
    
    @keyframes slide-in-left {
      from {
        opacity: 0;
        transform: translateX(-50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    
    @keyframes slide-in-right {
      from {
        opacity: 0;
        transform: translateX(50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    @keyframes breathe {
      0%, 100% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.05);
        opacity: 1;
      }
    }
    
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
    
    .animate-slide-down {
      animation: slide-down 0.3s ease-out;
    }
    
    .animate-slide-left {
      animation: slide-left 0.3s ease-out;
    }
    
    .animate-slide-right {
      animation: slide-right 0.3s ease-out;
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
    
    .animate-glow-pulse {
      animation: glow-pulse 2s ease-in-out infinite;
    }
    
    .animate-value-count {
      animation: value-count 0.5s ease-out;
    }
    
    .animate-stagger-1 {
      animation: slide-up 0.3s ease-out 0.1s both;
    }
    
    .animate-stagger-2 {
      animation: slide-up 0.3s ease-out 0.2s both;
    }
    
    .animate-stagger-3 {
      animation: slide-up 0.3s ease-out 0.3s both;
    }
    
    .animate-stagger-4 {
      animation: slide-up 0.3s ease-out 0.4s both;
    }
    
    .animate-stagger-5 {
      animation: slide-up 0.3s ease-out 0.5s both;
    }
    
    .animate-slide-up-fade {
      animation: slide-up-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-zoom-in {
      animation: zoom-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-slide-in-left {
      animation: slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-slide-in-right {
      animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
    
    .animate-breathe {
      animation: breathe 3s ease-in-out infinite;
    }
    
    .animation-delay-100 {
      animation-delay: 100ms;
    }
    
    .animation-delay-200 {
      animation-delay: 200ms;
    }
    
    .animation-delay-300 {
      animation-delay: 300ms;
    }
    
    .animation-delay-400 {
      animation-delay: 400ms;
    }
    
    .animation-delay-500 {
      animation-delay: 500ms;
    }
    
    /* Smooth scrolling for containers */
    .smooth-scroll {
      scroll-behavior: smooth;
    }
    
    /* Enhanced focus styles */
    .focus-ring {
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
    }
    
    /* Loading skeleton shimmer */
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
    }
    
    @keyframes skeleton-shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    
    /* Property status indicators */
    .status-pulse {
      animation: pulse 2s infinite;
    }
    
    .status-glow-green {
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    }
    
    .status-glow-blue {
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
    }
    
    .status-glow-yellow {
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
    }
    
    .status-glow-red {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    }
  `
  document.head.appendChild(style)
}

// Initialize animations on component mount
export const useAnimations = () => {
  useEffect(() => {
    addAnimationStyles()
  }, [])
}

// Animated Button component
export const AnimatedButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
}> = ({ children, onClick, className = '', disabled = false, variant = 'primary' }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium focus-ring"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700"
  }
  
  const animationClassNames = `${animationClasses.smooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress}`
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${animationClassNames} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Animated Card component
export const AnimatedCard: React.FC<{
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
}> = ({ children, className = '', hover = true, delay = 0 }) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200 shadow-sm"
  const hoverClasses = hover ? animationClasses.hoverLift : ''
  const delayClass = delay > 0 ? `animate-stagger-${Math.min(delay, 5)}` : animationClasses.slideUp
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${delayClass} ${className}`}>
      {children}
    </div>
  )
}

// Loading skeleton component
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-4 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
      <div className="h-4 bg-gray-200 rounded flex-1 skeleton-shimmer"></div>
    </div>
    <div className="h-3 bg-gray-200 rounded mb-2 skeleton-shimmer"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3 skeleton-shimmer"></div>
  </div>
)

// Animated Value Counter
export const AnimatedValue: React.FC<{
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}> = ({ value, duration = 1000, formatter = (v) => v.toLocaleString(), className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    setIsAnimating(true)
    let startTime: number
    let startValue = displayValue
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Ease out animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = startValue + (value - startValue) * easeOutQuart
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration, displayValue])
  
  return (
    <span className={`${className} ${isAnimating ? 'animate-value-count' : ''}`}>
      {formatter(displayValue)}
    </span>
  )
}

// Property Status Indicator
export const PropertyStatusIndicator: React.FC<{
  status: 'owned' | 'watching' | 'analyzing' | 'target' | 'avoided'
  animated?: boolean
}> = ({ status, animated = true }) => {
  const statusConfig = {
    owned: { color: 'bg-green-500', label: 'Owned', glow: 'status-glow-green' },
    watching: { color: 'bg-blue-500', label: 'Watching', glow: 'status-glow-blue' },
    analyzing: { color: 'bg-yellow-500', label: 'Analyzing', glow: 'status-glow-yellow' },
    target: { color: 'bg-purple-500', label: 'Target', glow: 'status-glow-purple' },
    avoided: { color: 'bg-red-500', label: 'Avoided', glow: 'status-glow-red' }
  }
  
  const config = statusConfig[status]
  const pulseClass = animated ? 'status-pulse' : ''
  const glowClass = animated ? config.glow : ''
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color} ${pulseClass} ${glowClass}`}></div>
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </div>
  )
}

// Notification Toast
export const NotificationToast: React.FC<{
  message: string
  type: 'success' | 'error' | 'info'
  visible: boolean
  onClose: () => void
}> = ({ message, type, visible, onClose }) => {
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }
  
  if (!visible) return null
  
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg ${typeStyles[type]} ${animationClasses.slideDown}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`text-current hover:opacity-70 ${animationClasses.smooth}`}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default {
  animationClasses,
  useAnimations,
  AnimatedButton,
  AnimatedCard,
  SkeletonCard,
  AnimatedValue,
  PropertyStatusIndicator,
  NotificationToast
}