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

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header avec logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">KPI Dashboard</h1>
              <p className="text-xs text-gray-400">Ligne d'Embouteillage</p>
            </div>
          </div>
        </div>
        
        {/* Profil utilisateur */}
        <div className="flex justify-center">
          <UserProfile />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          // Vérification des permissions
          if (item.permission) {
            return (
              <RoleGuard
                key={item.name}
                requiredPermission={item.permission}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
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
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </RoleGuard>
            );
          }
          
          // Éléments sans restriction
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {/* Bouton de déconnexion */}
        <div className="mb-3">
          <button
            onClick={logoutDialog.showNormalLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Système actif</span>
          </div>
          <p className="text-xs text-gray-400">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
      
      {/* Dialog de confirmation de déconnexion */}
      <LogoutDialog
        open={logoutDialog.isOpen}
        onOpenChange={logoutDialog.hideDialog}
        variant={logoutDialog.variant}
      />
    </div>
  );
}