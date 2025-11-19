'use client';

import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Animation de page avec transition contextuelle
interface SmartPageTransitionProps {
  children: ReactNode;
  pageKey: string;
  className?: string;
}

export function SmartPageTransition({ children, pageKey, className = '' }: SmartPageTransitionProps) {
  const pathname = usePathname();
  
  // Différentes animations selon le type de page
  const getPageVariants = (path: string) => {
    if (path.includes('dashboard')) {
      return {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        in: { opacity: 1, scale: 1, y: 0 },
        out: { opacity: 0, scale: 1.05, y: -20 }
      };
    }
    
    if (path.includes('production') || path.includes('qualite')) {
      return {
        initial: { opacity: 0, x: 50, rotateY: -10 },
        in: { opacity: 1, x: 0, rotateY: 0 },
        out: { opacity: 0, x: -50, rotateY: 10 }
      };
    }
    
    if (path.includes('maintenance') || path.includes('securite')) {
      return {
        initial: { opacity: 0, y: 30, scale: 0.9 },
        in: { opacity: 1, y: 0, scale: 1 },
        out: { opacity: 0, y: -30, scale: 0.9 }
      };
    }
    
    // Animation par défaut
    return {
      initial: { opacity: 0, y: 20 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -20 }
    };
  };

  const variants = getPageVariants(pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 20,
          mass: 1,
          duration: 0.6
        }}
        className={className}
        style={{ transformPerspective: 1000 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Bouton interactif avancé avec feedback visuel
interface InteractiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const handleClick = async () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Animation de succès
    await controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3 }
    });
    
    onClick?.();
    setIsPressed(false);
  };

  return (
    <motion.button
      animate={controls}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.span
        animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
      
      {/* Effet de ripple */}
      <motion.div
        className="absolute inset-0 bg-white bg-opacity-20 rounded-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPressed ? { scale: 1, opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}

// Carte avec animations avancées
interface SmartCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  clickable?: boolean;
  onHover?: (isHovered: boolean) => void;
  status?: 'default' | 'success' | 'warning' | 'error';
}

export function SmartCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  clickable = false,
  onHover,
  status = 'default'
}: SmartCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColors = {
    default: 'border-gray-200',
    success: 'border-green-200 shadow-green-100',
    warning: 'border-yellow-200 shadow-yellow-100',
    error: 'border-red-200 shadow-red-100'
  };

  const handleHover = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover?.(hovered);
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 40, 
        scale: 0.9,
        rotateX: 15
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay,
        mass: 0.8
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        rotateX: -3,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20
        }
      } : undefined}
      onHoverStart={() => handleHover(true)}
      onHoverEnd={() => handleHover(false)}
      className={`
        relative bg-white rounded-xl border shadow-sm transition-shadow duration-300
        ${statusColors[status]}
        ${clickable ? 'cursor-pointer' : ''}
        ${isHovered && hover ? 'shadow-xl' : 'shadow-sm'}
        ${className}
      `}
      style={{ transformPerspective: 1000 }}
    >
      {/* Effet de brillance au survol */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 rounded-xl"
        animate={isHovered ? {
          x: ['-100%', '100%'],
          opacity: [0, 0.1, 0]
        } : {}}
        transition={{ duration: 0.6 }}
        style={{ 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'skew(-20deg)'
        }}
      />
      
      {children}
      
      {/* Indicateur de statut */}
      {status !== 'default' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring' }}
          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
            status === 'success' ? 'bg-green-400' :
            status === 'warning' ? 'bg-yellow-400' :
            status === 'error' ? 'bg-red-400' : ''
          }`}
        />
      )}
    </motion.div>
  );
}

// Indicateur de chargement intelligent
interface SmartLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: string;
  text?: string;
}

export function SmartLoader({ 
  size = 'md', 
  variant = 'spinner', 
  color = '#3B82F6',
  text
}: SmartLoaderProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${sizes[size]} border-2 rounded-full`}
            style={{ 
              borderColor: `${color}20`,
              borderTopColor: color 
            }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: 'easeInOut' 
            }}
            className={`${sizes[size]} rounded-full`}
            style={{ backgroundColor: color }}
          />
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className={`${size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1.5 h-6' : 'w-2 h-8'} rounded-sm`}
                style={{ 
                  backgroundColor: color,
                  transformOrigin: 'bottom'
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-3"
    >
      {renderLoader()}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

// Hook pour les animations d'entrée en vue
export function useInViewAnimation() {
  const controls = useAnimation();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, controls]);

  return { ref: setRef, controls };
}