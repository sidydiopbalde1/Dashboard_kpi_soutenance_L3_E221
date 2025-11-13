// app/(dashboard)/energie/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingDown, TrendingUp, Leaf, DollarSign, Clock, BarChart3, Filter, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { formatPieLabel } from '@/types/recharts';

interface EnergyMetrics {
  currentConsumption: number; // kW
  dailyConsumption: number; // kWh
  monthlyCost: number; // €
  efficiency: number; // %
  carbonFootprint: number; // kg CO2
  peakDemand: number; // kW
  offPeakRatio: number; // %
  renewableRatio: number; // %
}

interface EnergyAlert {
  id: string;
  type: 'peak_demand' | 'efficiency_drop' | 'high_cost' | 'maintenance';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  equipment: string;
  value: number;
  threshold: number;
}

export default function EnergiePage() {
  const [metrics, setMetrics] = useState<EnergyMetrics | null>(null);
  const [alerts, setAlerts] = useState<EnergyAlert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // État pour les données dynamiques des graphiques
  const [consumptionByEquipment, setConsumptionByEquipment] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [tariffDistribution, setTariffDistribution] = useState<any[]>([]);

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/energy?period=${selectedPeriod}`);
      const data = await res.json();

      setMetrics(data.metrics || null);
      setConsumptionByEquipment(data.consumptionByEquipment || []);
      setTrend(data.trend || []);
      setTariffDistribution(data.tariffDistribution || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'peak_demand': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'efficiency_drop': return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'high_cost': return <DollarSign className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="h-12 w-12 animate-spin text-yellow-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données énergétiques...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion Énergétique</h1>
            <p className="text-gray-600 mt-1">Monitoring et optimisation de la consommation énergétique</p>
            <p className="text-xs text-gray-500 mt-1">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consommation actuelle</p>
              <p className="text-3xl font-bold text-yellow-600">{metrics?.currentConsumption} kW</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">-5.2% vs hier</span>
              </div>
            </div>
            <Zap className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consommation journalière</p>
              <p className="text-3xl font-bold text-blue-600">{metrics?.dailyConsumption.toLocaleString()} kWh</p>
              <p className="text-xs text-gray-500 mt-1">Objectif: 6000 kWh</p>
            </div>
            <BarChart3 className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coût mensuel</p>
              <p className="text-3xl font-bold text-green-600">{metrics?.monthlyCost.toLocaleString()} FCFA</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">-8.1% vs mois dernier</span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Efficacité énergétique</p>
              <p className="text-3xl font-bold text-emerald-600">{metrics?.efficiency}%</p>
              <p className="text-xs text-gray-500 mt-1">Objectif: 90%</p>
            </div>
            <Leaf className="h-12 w-12 text-emerald-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Indicateurs environnementaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Empreinte carbone</p>
              <p className="text-2xl font-bold text-green-800">{metrics?.carbonFootprint} kg CO₂</p>
            </div>
            <Leaf className="h-8 w-8 text-green-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Pic de demande</p>
              <p className="text-2xl font-bold text-blue-800">{metrics?.peakDemand} kW</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Heures creuses</p>
              <p className="text-2xl font-bold text-purple-800">{metrics?.offPeakRatio}%</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700">Énergies renouvelables</p>
              <p className="text-2xl font-bold text-amber-800">{metrics?.renewableRatio}%</p>
            </div>
            <Zap className="h-8 w-8 text-amber-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Consommation horaire */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Consommation et Coût Horaire</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="consumption" fill="#3B82F6" name="Consommation (kW)" />
              <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={3} name="Coût (€)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Consommation par équipement */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Consommation par Équipement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={equipmentConsumption}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="consumption"
                label={formatPieLabel}
              >
                {equipmentConsumption.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kW`, 'Consommation']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendances et empreinte carbone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tendances mensuelles */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tendances Mensuelles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="target" stroke="#94A3B8" fill="#F1F5F9" name="Objectif (kWh)" />
              <Area type="monotone" dataKey="consumption" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Consommation (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mix énergétique */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Mix Énergétique</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={carbonFootprint}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={formatPieLabel}
              >
                {carbonFootprint.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertes énergétiques */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Alertes Énergétiques ({alerts.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{alert.message}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity === 'high' ? 'Élevée' :
                       alert.severity === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Équipement: </span>
                      <span className="font-medium">{alert.equipment}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Valeur actuelle: </span>
                      <span className="font-bold text-red-600">{alert.value}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Seuil: </span>
                      <span className="font-medium">{alert.threshold}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
                
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                  Analyser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau détaillé des équipements */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Détails par Équipement</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Équipement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consommation (kW)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût journalier (€)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficacité (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipmentConsumption.map((equipment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-3" style={{ backgroundColor: equipment.color }}></div>
                      <span className="font-medium">{equipment.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{equipment.consumption}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${
                      equipment.efficiency >= 90 ? 'text-green-600' :
                      equipment.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {equipment.efficiency}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      equipment.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                      equipment.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {equipment.efficiency >= 90 ? 'Optimal' :
                       equipment.efficiency >= 80 ? 'Correct' : 'Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}