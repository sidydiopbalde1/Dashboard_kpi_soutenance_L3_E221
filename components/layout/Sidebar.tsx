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
  Settings
} from 'lucide-react';

const navigation = [
  // Core existant
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  
  // Production & Opérations
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Qualité', href: '/qualite', icon: Target },
  { name: 'Arrêts', href: '/arrets', icon: Clock },
  
  // Maintenance & Équipement
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Appareils', href: '/appareils', icon: Wifi },
  
  // Personnel & Sécurité
  { name: 'Équipes', href: '/equipes', icon: Users },
  { name: 'Sécurité', href: '/securite', icon: Shield },
  
  // Monitoring & Alertes
  { name: 'Alertes', href: '/alertes', icon: AlertTriangle },
  { name: 'Énergie', href: '/energie', icon: Zap },
  
  // Analyse & Reporting
  { name: 'Historique', href: '/historique', icon: History },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Rapports', href: '/rapports', icon: FileText },
  
  // Configuration
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <Activity className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-xl font-bold">KPI Dashboard</h1>
          <p className="text-xs text-gray-400">Ligne d'Embouteillage</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
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
      {/* <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Système actif</span>
          </div>
          <p className="text-xs text-gray-400">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div> */}
    </div>
  );
}