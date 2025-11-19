// components/animations/AnimatedComponents.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

// Animation pour cartes avec effet hover amélioré
export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 30, 
        scale: 0.95,
        rotateX: 10
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
        delay
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.03,
        rotateX: -2,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20
        }
      } : undefined}
      className={className}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Animation pour listes avec stagger effect
export function AnimatedList({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animation pour éléments de liste
export function AnimatedListItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          x: -30,
          scale: 0.9
        },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
          }
        }
      }}
      whileHover={{
        x: 5,
        transition: { type: 'spring', stiffness: 300 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animation pour boutons avec effet de pulsation
export function AnimatedButton({ 
  children, 
  className = '',
  variant = 'default'
}: { 
  children: ReactNode; 
  className?: string;
  variant?: 'default' | 'pulse' | 'bounce';
}) {
  const variants = {
    default: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    },
    pulse: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      animate: {
        scale: [1, 1.02, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    bounce: {
      whileHover: { 
        scale: 1.1,
        rotate: [0, -3, 3, 0],
        transition: { duration: 0.3 }
      },
      whileTap: { scale: 0.9 }
    }
  };

  return (
    <motion.div
      {...variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animation pour les métriques/KPIs avec compteur
export function AnimatedMetric({ 
  value, 
  prefix = '', 
  suffix = '', 
  className = '' 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.3,
            type: 'spring',
            stiffness: 100 
          }}
        >
          {value}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.div>
  );
}

// Animation pour les graphiques (loader)
export function ChartLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center ${className}`}
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
      />
    </motion.div>
  );
}