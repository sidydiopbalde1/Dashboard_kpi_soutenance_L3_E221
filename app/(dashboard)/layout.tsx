// app/(dashboard)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SmartPageTransition } from '@/components/animations/EnhancedAnimations';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Fond animé subtil pour toute l'app */}
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(59, 130, 246, 0.01) 0%, transparent 50%, rgba(147, 51, 234, 0.01) 100%)',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%, rgba(147, 51, 234, 0.03) 100%)',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.01) 0%, transparent 50%, rgba(147, 51, 234, 0.01) 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <Sidebar />
        
        <main className="flex-1 relative">
          <motion.div 
            className="p-6 min-h-screen relative z-10"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.4,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {/* Conteneur avec effet de profondeur */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <SmartPageTransition pageKey={pathname}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/20 shadow-xl shadow-gray-900/5 p-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)'
                  }}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] p-6">
                    {children}
                  </div>
                </motion.div>
              </SmartPageTransition>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}