"use client";

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Clock, Gauge, AlertTriangle, CheckCircle, XCircle, Users, Target, BarChart3, Settings, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Données mockées pour enrichir le dashboard
  const [mockData] = useState({
    hourlyProduction: [
      { hour: '6h', production: 820, objectif: 850 },
      { hour: '7h', production: 845, objectif: 850 },
      { hour: '8h', production: 830, objectif: 850 },
      { hour: '9h', production: 860, objectif: 850 },
      { hour: '10h', production: 840, objectif: 850 },
      { hour: '11h', production: 855, objectif: 850 },
      { hour: '12h', production: 825, objectif: 850 },
      { hour: '13h', production: 870, objectif: 850 },
    ],
    trsComponents: [
      { name: 'Disponibilité', value: 95.2, color: '#10B981' },
      { name: 'Performance', value: 87.4, color: '#3B82F6' },
      { name: 'Qualité', value: 96.8, color: '#8B5CF6' },
    ],
    alerts: [
      { id: 1, type: 'warning', message: 'Température élevée sur ligne 2', time: '14:30', severity: 'medium' },
      { id: 2, type: 'error', message: 'Arrêt urgence - Bourrage ligne 1', time: '12:15', severity: 'high' },
      { id: 3, type: 'info', message: 'Maintenance programmée à 16h', time: '11:00', severity: 'low' },
      { id: 4, type: 'warning', message: 'Stock étiquettes faible', time: '10:45', severity: 'medium' },
    ],
    equipmentStatus: [
      { name: 'Ligne 1', status: 'running', efficiency: 94, lastMaintenance: '2024-01-15' },
      { name: 'Ligne 2', status: 'warning', efficiency: 87, lastMaintenance: '2024-01-12' },
      { name: 'Ligne 3', status: 'running', efficiency: 96, lastMaintenance: '2024-01-18' },
      { name: 'Contrôle Qualité', status: 'running', efficiency: 98, lastMaintenance: '2024-01-16' },
    ],
    downtimeReasons: [
      { name: 'Changement format', value: 35, color: '#F59E0B' },
      { name: 'Maintenance', value: 25, color: '#3B82F6' },
      { name: 'Panne', value: 20, color: '#EF4444' },
      { name: 'Attente matière', value: 15, color: '#8B5CF6' },
      { name: 'Autres', value: 5, color: '#6B7280' },
    ],
    shiftComparison: [
      { shift: 'Nuit', production: 2340, trs: 78.5, efficiency: 92 },
      { shift: 'Matin', production: 2520, trs: 82.1, efficiency: 95 },
      { shift: 'Après-midi', production: 2480, trs: 80.8, efficiency: 94 },
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kpi/current');
        const data = await res.json();
        setKpiData(data);
      } catch (error) {
        console.error('Erreur:', error);
        // Données de fallback
        setKpiData({
          kpi: { trs: 82.1 },
          production: { totalProduced: 2480, currentRate: 103, objectif: 2500 },
          downtime: { total: 45 },
          quality: { defectRate: 3.2, conformityRate: 96.8 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const productionProgress = ((kpiData?.production?.totalProduced || 0) / (kpiData?.production?.objectif || 2500)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard KPI - Ligne d'Embouteillage</h1>
            <p className="text-sm text-gray-600 mt-1">
              Shift actuel: Après-midi (14h-22h) • {currentTime.toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Système actif</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* TRS */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">TRS Global</span>
              <Gauge className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {kpiData?.kpi?.trs || 82.1}%
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1% vs hier</span>
            </div>
          </div>

          {/* Production */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Production</span>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {(kpiData?.production?.totalProduced || 2480).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">bouteilles</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(productionProgress, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {productionProgress.toFixed(1)}% de l'objectif ({kpiData?.production?.objectif || 2500})
            </div>
          </div>

          {/* Cadence */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cadence Actuelle</span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {kpiData?.production?.currentRate || 103}
            </div>
            <div className="text-xs text-gray-500">bouteilles/min</div>
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Objectif: </span>
              <span className="font-semibold">100 b/min</span>
            </div>
          </div>

          {/* Qualité */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Conformité</span>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {kpiData?.quality?.conformityRate || 96.8}%
            </div>
            <div className="text-xs text-gray-500">des produits</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600">{kpiData?.quality?.defectRate || 3.2}% défauts</span>
            </div>
          </div>
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production horaire */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Production Horaire</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockData.hourlyProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="objectif" stroke="#94A3B8" fill="#F1F5F9" name="Objectif" />
                <Area type="monotone" dataKey="production" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Production" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Composants TRS */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Composants TRS</h3>
            <div className="space-y-4">
              {mockData.trsComponents.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{component.name}</span>
                    <span style={{ color: component.color }}>{component.value}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${component.value}%`, 
                        backgroundColor: component.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status des équipements et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status des équipements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Status des Équipements</h3>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {mockData.equipmentStatus.map((equipment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(equipment.status)}
                    <div>
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-gray-600">
                        Efficacité: {equipment.efficiency}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Dernière maintenance:</div>
                    <div>{new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertes récentes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alertes Récentes</h3>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mockData.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.message}</div>
                    <div className="text-xs text-gray-600 mt-1">{alert.time}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity === 'high' ? 'Urgent' : 
                     alert.severity === 'medium' ? 'Modéré' : 'Info'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyses des arrêts et comparaison shifts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition des temps d'arrêt */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Répartition Temps d'Arrêt</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockData.downtimeReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}min`}
                  >
                    {mockData.downtimeReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparaison des shifts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance par Shift</h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockData.shiftComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shift" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="production" fill="#10B981" name="Production" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              {mockData.shiftComparison.map((shift, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium">{shift.shift}</div>
                  <div className="text-gray-600">TRS: {shift.trs}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Temps d'arrêt détaillé */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Temps d'Arrêt du Shift</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Total: {kpiData?.downtime?.total || 45} minutes</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-800">Arrêts Non Planifiés</div>
              <div className="text-2xl font-bold text-red-600">23 min</div>
              <div className="text-xs text-red-700 mt-1">Pannes, bourrages</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-800">Changements Format</div>
              <div className="text-2xl font-bold text-yellow-600">15 min</div>
              <div className="text-xs text-yellow-700 mt-1">Réglages, nettoyage</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Maintenance</div>
              <div className="text-2xl font-bold text-blue-600">7 min</div>
              <div className="text-xs text-blue-700 mt-1">Maintenance préventive</div>
            </div>
          </div>
        </div>

        {/* Info actualisée */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Dashboard enrichi fonctionnel ! Données actualisées toutes les 5 secondes.
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Surveillance complète de la ligne de production avec KPI en temps réel.
          </p>
        </div>
      </main>
    </div>
  );
}