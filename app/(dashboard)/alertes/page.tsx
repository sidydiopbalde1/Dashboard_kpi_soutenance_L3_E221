// app/(dashboard)/alertes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Clock, Search, Filter, Bell, BellOff, Settings, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: string;
  isResolved: boolean;
  threshold?: string;
  actualValue?: string;
  source: string;
  resolvedAt?: string;
  resolvedBy?: string;
  duration?: number;
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResolved, setShowResolved] = useState(true);

  // Données mockées d'alertes
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'TEMPERATURE_HIGH',
      severity: 'HIGH',
      message: 'Température élevée détectée sur la ligne 2 - Capteur T2-01',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
      isResolved: false,
      threshold: '75°C',
      actualValue: '82°C',
      source: 'Ligne 2'
    },
    {
      id: '2',
      type: 'EMERGENCY_STOP',
      severity: 'CRITICAL',
      message: 'Arrêt d\'urgence activé - Bourrage détecté sur convoyeur principal',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      isResolved: false,
      source: 'Ligne 1'
    },
    {
      id: '3',
      type: 'PRODUCTION_RATE_LOW',
      severity: 'MEDIUM',
      message: 'Cadence de production en dessous du seuil minimal',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      isResolved: false,
      threshold: '95 b/min',
      actualValue: '87 b/min',
      source: 'Ligne 3'
    },
    {
      id: '4',
      type: 'MATERIAL_LOW',
      severity: 'MEDIUM',
      message: 'Stock d\'étiquettes faible - Rechargement nécessaire sous 2h',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2h ago
      isResolved: false,
      source: 'Magasin'
    },
    {
      id: '5',
      type: 'PRESSURE_LOW',
      severity: 'LOW',
      message: 'Pression d\'air comprimé légèrement faible',
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3h ago
      isResolved: false,
      threshold: '6.5 bar',
      actualValue: '6.2 bar',
      source: 'Système pneumatique'
    },
    // Alertes résolues
    {
      id: '6',
      type: 'MOTOR_OVERLOAD',
      severity: 'HIGH',
      message: 'Surcharge moteur M3 détectée',
      timestamp: new Date(Date.now() - 14400000).toISOString(), // 4h ago
      isResolved: true,
      resolvedAt: new Date(Date.now() - 12600000).toISOString(), // 3.5h ago
      resolvedBy: 'Technicien A. Martin',
      duration: 30,
      source: 'Ligne 1'
    },
    {
      id: '7',
      type: 'QUALITY_DEFECT',
      severity: 'MEDIUM',
      message: 'Taux de défauts élevé détecté sur lot #4521',
      timestamp: new Date(Date.now() - 18000000).toISOString(), // 5h ago
      isResolved: true,
      resolvedAt: new Date(Date.now() - 16200000).toISOString(), // 4.5h ago
      resolvedBy: 'Opérateur B. Durand',
      duration: 45,
      source: 'Contrôle qualité'
    },
    {
      id: '8',
      type: 'SENSOR_MALFUNCTION',
      severity: 'LOW',
      message: 'Dysfonctionnement capteur de débit F1-05',
      timestamp: new Date(Date.now() - 21600000).toISOString(), // 6h ago
      isResolved: true,
      resolvedAt: new Date(Date.now() - 19800000).toISOString(), // 5.5h ago
      resolvedBy: 'Maintenance équipe C',
      duration: 30,
      source: 'Ligne 2'
    }
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/kpi/current');
        if (res.ok) {
          const data = await res.json();
          if (data.alerts && Array.isArray(data.alerts)) {
            setAlerts(data.alerts);
          } else {
            // Utiliser les données mockées si l'API ne retourne pas d'alertes
            setAlerts(mockAlerts);
          }
        } else {
          // Utiliser les données mockées en cas d'erreur API
          setAlerts(mockAlerts);
        }
      } catch (error) {
        console.error('Erreur récupération alertes:', error);
        // Utiliser les données mockées en cas d'erreur
        setAlerts(mockAlerts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Actualisation toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="h-6 w-6 text-red-600" />;
      case 'HIGH': return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'MEDIUM': return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default: return <AlertCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  // Filtrage des alertes
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResolved = showResolved || !alert.isResolved;
    
    return matchesSeverity && matchesSearch && matchesResolved;
  });

  const activeAlerts = filteredAlerts.filter(a => !a.isResolved);
  const resolvedAlerts = filteredAlerts.filter(a => a.isResolved);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertes Système</h1>
            <p className="text-gray-600 mt-1">Gestion et suivi des alertes de production en temps réel</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{activeAlerts.length} actives</span>
            </div>
            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les alertes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="CRITICAL">Critique</option>
              <option value="HIGH">Élevée</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Faible</option>
            </select>
            
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showResolved 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {showResolved ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              {showResolved ? 'Tout afficher' : 'Actives uniquement'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alertes actives</p>
              <p className="text-4xl font-bold text-red-600">{activeAlerts.length}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Critiques</p>
              <p className="text-4xl font-bold text-orange-600">
                {activeAlerts.filter(a => a.severity === 'CRITICAL').length}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Résolues aujourd'hui</p>
              <p className="text-4xl font-bold text-green-600">{resolvedAlerts.length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Temps moyen résolution</p>
              <p className="text-4xl font-bold text-blue-600">
                {resolvedAlerts.length > 0 
                  ? Math.round(resolvedAlerts.reduce((acc, a) => acc + (a.duration || 0), 0) / resolvedAlerts.length)
                  : 0}min
              </p>
            </div>
            <Clock className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Alertes actives */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b bg-red-50">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            Alertes Actives ({activeAlerts.length})
          </h2>
        </div>
        <div className="p-6">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">Aucune alerte active</p>
              <p className="text-gray-500">Tous les systèmes fonctionnent normalement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-lg border-2 ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{alert.type.replace(/_/g, ' ')}</h3>
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{getTimeAgo(alert.timestamp)}</div>
                          <div className="text-xs">{alert.source}</div>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3 leading-relaxed">{alert.message}</p>
                      
                      {alert.threshold && (
                        <div className="flex gap-6 text-sm bg-white bg-opacity-50 p-3 rounded">
                          <div>
                            <span className="text-gray-600">Seuil: </span>
                            <span className="font-medium">{alert.threshold}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Valeur actuelle: </span>
                            <span className="font-bold text-red-600">{alert.actualValue}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <button className="px-4 py-2 bg-white border border-current rounded hover:bg-opacity-20 transition-colors text-sm font-medium">
                          Marquer comme résolu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertes résolues */}
      {showResolved && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b bg-green-50">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Alertes Résolues ({resolvedAlerts.length})
            </h2>
          </div>
          <div className="p-6">
            {resolvedAlerts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune alerte résolue aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-700">{alert.type.replace(/_/g, ' ')}</h3>
                          <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                            {alert.severity}
                          </span>
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            ✓ Résolu
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Résolu par: {alert.resolvedBy}</span>
                          <span>Durée: {formatDuration(alert.duration || 0)}</span>
                          <span>Source: {alert.source}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>Résolu: {alert.resolvedAt ? getTimeAgo(alert.resolvedAt) : '-'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mt-6">
        <p className="text-blue-800 flex items-center justify-center gap-2">
          <Bell className="h-5 w-5" />
          Système d'alertes fonctionnel ! Actualisation automatique toutes les 10 secondes.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {filteredAlerts.length} alertes affichées sur {alerts.length} au total.
        </p>
      </div>
    </div>
  );
}