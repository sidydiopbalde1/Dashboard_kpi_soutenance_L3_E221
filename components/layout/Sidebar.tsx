// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  History, 
  AlertTriangle, 
  Clock, 
  FileText,
  Activity,
  Wifi,
  Factory,
  Target,
  Wrench,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { LogoutDialog, useLogoutDialog } from '@/components/auth/LogoutDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navigation = [
  // Core existant
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    permission: { resource: 'dashboard', action: 'read' }
  },
  
  // Production & Opérations
  { 
    name: 'Production', 
    href: '/production', 
    icon: Factory,
    permission: { resource: 'production', action: 'read' }
  },
  { 
    name: 'Qualité', 
    href: '/qualite', 
    icon: Target,
    permission: { resource: 'quality', action: 'read' }
  },
  { 
    name: 'Arrêts', 
    href: '/arrets', 
    icon: Clock,
    permission: { resource: 'production', action: 'read' }
  },
  
  // Maintenance & Équipement
  { 
    name: 'Maintenance', 
    href: '/maintenance', 
    icon: Wrench,
    permission: { resource: 'maintenance', action: 'read' }
  },
  { 
    name: 'Appareils', 
    href: '/appareils', 
    icon: Wifi,
    permission: { resource: 'maintenance', action: 'read' }
  },
  
  // Personnel & Sécurité
  { 
    name: 'Équipes', 
    href: '/equipes', 
    icon: Users,
    permission: { resource: 'teams', action: 'read' }
  },
  { 
    name: 'Sécurité', 
    href: '/securite', 
    icon: Shield,
    permission: { resource: 'safety', action: 'read' }
  },
  
  // Monitoring & Alertes
  { 
    name: 'Alertes', 
    href: '/alertes', 
    icon: AlertTriangle,
    permission: { resource: 'dashboard', action: 'read' }
  },
  { 
    name: 'Énergie', 
    href: '/energie', 
    icon: Zap,
    permission: { resource: 'energy', action: 'read' }
  },
  
  // Analyse & Reporting
  { 
    name: 'Historique', 
    href: '/historique', 
    icon: History,
    permission: { resource: 'dashboard', action: 'read' }
  },
  { 
    name: 'Rapports', 
    href: '/rapports', 
    icon: FileText,
    permission: { resource: 'reports', action: 'read' }
  },
  
  // Configuration - Admin seulement
  { 
    name: 'Paramètres', 
    href: '/parametres', 
    icon: Settings,
    requiredRole: 'ADMIN' as const
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logoutDialog = useLogoutDialog();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col relative overflow-hidden shadow-2xl"
    >
      {/* Fond animé subtil */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header avec logo */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="p-4 border-b border-gray-700/50 backdrop-blur-sm relative z-10"
      >
        <motion.div 
          className="flex items-center justify-between mb-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              whileHover={{ 
                rotate: 360,
                scale: 1.1
              }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <Activity className="h-8 w-8 text-blue-400" />
              <motion.div
                className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                KPI Dashboard
              </h1>
              <p className="text-xs text-gray-400">Ligne d'Embouteillage</p>
            </div>
          </div>
        </motion.div>
        
        {/* Profil utilisateur */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <UserProfile />
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3
              }
            }
          }}
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isHovered = hoveredItem === item.name;
            
            const NavigationItem = (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, x: -20, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: index * 0.05
                    }
                  }
                }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer group
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }
                    `}
                    onHoverStart={() => setHoveredItem(item.name)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ 
                      x: isActive ? 0 : 8,
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Indicateur actif animé */}
                    <AnimatePresence>
                      {isActive && (
                        <>
                          <motion.div
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"
                            style={{ originY: 0.5 }}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl"
                          />
                        </>
                      )}
                    </AnimatePresence>

                    {/* Effet de survol */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-xl"
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="relative z-10 flex items-center gap-3 w-full"
                      animate={isHovered ? { x: 2 } : { x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        animate={isHovered || isActive ? {
                          rotate: [0, -10, 10, 0],
                          scale: 1.1
                        } : {
                          rotate: 0,
                          scale: 1
                        }}
                        transition={{
                          rotate: {
                            duration: 0.5,
                            ease: "easeInOut"
                          },
                          scale: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        }}
                      >
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`} />
                      </motion.div>
                      
                      <span className={`relative z-10 ${
                        isActive ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                      
                      {/* Notification badge pour alertes */}
                      {item.name === 'Alertes' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto relative z-10"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 6px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                          >
                            3
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Indicateur de nouveauté */}
                      {(item.name === 'Énergie' || item.name === 'Rapports') && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="ml-auto w-2 h-2 bg-green-400 rounded-full relative z-10"
                          transition={{ delay: 0.5 }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            );

            // Vérification des permissions
            if (item.permission) {
              return (
                <RoleGuard
                  key={item.name}
                  requiredPermission={item.permission}
                >
                  {NavigationItem}
                </RoleGuard>
              );
            }
            
            // Vérification des rôles
            if (item.requiredRole) {
              return (
                <RoleGuard
                  key={item.name}
                  requiredRole={item.requiredRole}
                >
                  {NavigationItem}
                </RoleGuard>
              );
            }
            
            return NavigationItem;
          })}
        </motion.div>
      </nav>

      {/* Footer */}
      <motion.div 
        className="p-4 border-t border-gray-700/50 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {/* Bouton de déconnexion */}
        <motion.div 
          className="mb-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.button
            onClick={logoutDialog.showNormalLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all duration-300 group"
            whileHover={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              transition: { duration: 0.2 }
            }}
          >
            <motion.div
              animate={{ rotate: hoveredItem === 'logout' ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              onHoverStart={() => setHoveredItem('logout')}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
            </motion.div>
            <span className="group-hover:text-red-400 transition-colors">Se déconnecter</span>
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <span className="text-sm text-green-300 font-medium">Système actif</span>
          </div>
          <motion.p 
            className="text-xs text-gray-400"
            key={new Date().getSeconds()} // Force re-render every second
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </motion.p>
        </motion.div>
      </motion.div>
      
      {/* Dialog de confirmation de déconnexion */}
      <LogoutDialog
        open={logoutDialog.isOpen}
        onOpenChange={logoutDialog.hideDialog}
        variant={logoutDialog.variant}
      />
    </motion.div>
  );
}