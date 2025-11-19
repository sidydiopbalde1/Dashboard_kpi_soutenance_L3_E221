// components/animations/PageTransition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'slide' | 'fade' | 'scale' | 'slideUp';
}

// Variants d'animation pour les pages - Version améliorée
const pageVariants = {
  slide: {
    initial: { opacity: 0, x: 30, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -30, scale: 1.02 }
  },
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.1 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -30, scale: 1.02 }
  }
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.5
};

export function PageTransition({ children, className = '', variant = 'slideUp' }: PageTransitionProps) {
  const variants = pageVariants[variant];
  
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Composant wrapper pour les pages avec AnimatePresence
export function AnimatedPage({ children, className = '', variant = 'slideUp' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition className={className} variant={variant}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}

// Animation spécifique pour les cartes
export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: 0.1
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

// Animation pour les listes d'éléments
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};