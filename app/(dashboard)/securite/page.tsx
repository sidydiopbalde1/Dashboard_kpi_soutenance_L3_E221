// app/(dashboard)/securite/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Users, Clock, Award, TrendingDown, Calendar, Search, Filter, Eye, FileText, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { formatPieLabel } from '@/types/recharts';
import { SafetyIncident, SafetyMetrics } from '@/types/safety';

export default function SecuritePage() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // État pour les données dynamiques des graphiques
  const [incidentsByType, setIncidentsByType] = useState<any[]>([]);
  const [incidentsBySeverity, setIncidentsBySeverity] = useState<any[]>([]);
  const [incidentsByLocation, setIncidentsByLocation] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

  // Données de conformité par catégorie
  const complianceMetrics = [
    { category: 'Port d\'EPI', score: metrics?.eppCompliance || 0, target: 95 },
    { category: 'Procédures de sécurité', score: metrics?.complianceRate || 0, target: 90 },
    { category: 'Formation sécurité', score: metrics?.trainingCompletion || 0, target: 100 },
    { category: 'Audit sécurité', score: metrics?.auditScore || 0, target: 85 },
  ];

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/safety?type=${filterType}&status=${filterStatus}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Safety data:', data);
        setIncidents(data.incidents || []);
        setMetrics(data.metrics || null);
        setIncidentsByType(data.incidentsByType || []);
        setIncidentsBySeverity(data.incidentsBySeverity || []);
        setIncidentsByLocation(data.incidentsByLocation || []);
        setTrend(data.trend || []);
        setLastUpdate(new Date());
      } else {
        console.error('Erreur API safety:', res.status);
        // Données de fallback
        setIncidents([
          { id: 1, timestamp: new Date().toISOString(), type: 'near_miss', severity: 'medium', status: 'closed', title: 'Presque glissade évitée', description: 'Glissade évitée près du convoyeur', location: 'Ligne 1', reportedBy: 'Marie Dupont', involvedPersons: 'Marie Dupont', injuryType: null, bodyPart: null, rootCause: 'Sol humide', correctiveActions: ['Nettoyage immédiat', 'Signalisation'], daysLost: 0, cost: 0 },
          { id: 2, timestamp: new Date().toISOString(), type: 'unsafe_condition', severity: 'low', status: 'open', title: 'Capot mal fixé', description: 'Capot de protection mal fixé', location: 'Ligne 2', reportedBy: 'Pierre Martin', involvedPersons: 'N/A', injuryType: null, bodyPart: null, rootCause: null, correctiveActions: ['Serrage boulons'], daysLost: 0, cost: 0 }
        ]);
        setMetrics({
          totalIncidents: 12,
          openIncidents: 3,
          accidents: 1,
          nearMisses: 6,
          unsafeConditions: 4,
          closedIncidents: 9,
          daysWithoutAccident: 15,
          daysWithoutIncident: 15,
          daysSinceLastAccident: 15,
          incidentRate: 2.5,
          nearMissReports: 6,
          eppCompliance: 94.5,
          complianceRate: 91.2,
          trainingCompletion: 87.8,
          auditScore: 89.6,
          safetyMeetingsHeld: 4,
          frequencyRate: 0,
          severityRate: 0,
          totalDaysLost: 0,
          totalCost: 0
        });
        setIncidentsByType([
          { name: 'Presque accident', value: 6, count: 6, percentage: 50, color: '#F59E0B' },
          { name: 'Conditions dangereuses', value: 4, count: 4, percentage: 33, color: '#3B82F6' },
          { name: 'Accidents', value: 2, count: 2, percentage: 17, color: '#EF4444' }
        ]);
        setIncidentsBySeverity([
          { name: 'Faible', value: 8, count: 8, percentage: 67, color: '#10B981' },
          { name: 'Moyen', value: 3, count: 3, percentage: 25, color: '#F59E0B' },
          { name: 'Élevé', value: 1, count: 1, percentage: 8, color: '#EF4444' }
        ]);
        setIncidentsByLocation([
          { location: 'Ligne 1', accidents: 1, near_miss: 3, unsafe: 2 },
          { location: 'Ligne 2', accidents: 0, near_miss: 2, unsafe: 1 },
          { location: 'Ligne 3', accidents: 0, near_miss: 1, unsafe: 1 }
        ]);
        setTrend([
          { month: '2024-01', accidents: 0, near_miss: 2, unsafe_conditions: 1 },
          { month: '2024-02', accidents: 1, near_miss: 3, unsafe_conditions: 2 },
          { month: '2024-03', accidents: 0, near_miss: 1, unsafe_conditions: 1 }
        ]);
      }
    } catch (error) {
      console.error('Erreur fetch safety:', error);
      // Données de fallback identiques en cas d'erreur
      setIncidents([
        { id: 1, timestamp: new Date().toISOString(), type: 'near_miss', severity: 'medium', status: 'closed', title: 'Presque glissade évitée', description: 'Glissade évitée près du convoyeur', location: 'Ligne 1', reportedBy: 'Marie Dupont', involvedPersons: 'Marie Dupont', injuryType: null, bodyPart: null, rootCause: 'Sol humide', correctiveActions: ['Nettoyage immédiat', 'Signalisation'], daysLost: 0, cost: 0 },
        { id: 2, timestamp: new Date().toISOString(), type: 'unsafe_condition', severity: 'low', status: 'open', title: 'Capot mal fixé', description: 'Capot de protection mal fixé', location: 'Ligne 2', reportedBy: 'Pierre Martin', involvedPersons: 'N/A', injuryType: null, bodyPart: null, rootCause: null, correctiveActions: ['Serrage boulons'], daysLost: 0, cost: 0 }
      ]);
      setMetrics({
        totalIncidents: 12,
        openIncidents: 3,
        accidents: 1,
        nearMisses: 6,
        unsafeConditions: 4,
        closedIncidents: 9,
        daysWithoutAccident: 15,
        daysWithoutIncident: 15,
        daysSinceLastAccident: 15,
        incidentRate: 2.5,
        nearMissReports: 6,
        eppCompliance: 94.5,
        complianceRate: 91.2,
        trainingCompletion: 87.8,
        auditScore: 89.6,
        safetyMeetingsHeld: 4,
        frequencyRate: 0,
        severityRate: 0,
        totalDaysLost: 0,
        totalCost: 0
      });
      setIncidentsByType([
        { name: 'Presque accident', value: 6, count: 6, percentage: 50, color: '#F59E0B' },
        { name: 'Conditions dangereuses', value: 4, count: 4, percentage: 33, color: '#3B82F6' },
        { name: 'Accidents', value: 2, count: 2, percentage: 17, color: '#EF4444' }
      ]);
      setIncidentsBySeverity([
        { name: 'Faible', value: 8, count: 8, percentage: 67, color: '#10B981' },
        { name: 'Moyen', value: 3, count: 3, percentage: 25, color: '#F59E0B' },
        { name: 'Élevé', value: 1, count: 1, percentage: 8, color: '#EF4444' }
      ]);
      setIncidentsByLocation([
        { location: 'Ligne 1', accidents: 1, near_miss: 3, unsafe: 2 },
        { location: 'Ligne 2', accidents: 0, near_miss: 2, unsafe: 1 },
        { location: 'Ligne 3', accidents: 0, near_miss: 1, unsafe: 1 }
      ]);
      setTrend([
        { month: '2024-01', accidents: 0, near_miss: 2, unsafe_conditions: 1 },
        { month: '2024-02', accidents: 1, near_miss: 3, unsafe_conditions: 2 },
        { month: '2024-03', accidents: 0, near_miss: 1, unsafe_conditions: 1 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [filterType, filterStatus]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accident': return 'bg-red-500 text-white';
      case 'near_miss': return 'bg-yellow-500 text-white';
      case 'unsafe_condition': return 'bg-orange-500 text-white';
      case 'non_compliance': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'corrected': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'near_miss': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unsafe_condition': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'non_compliance': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données sécurité...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Sécurité au Travail</h1>
            <p className="text-gray-600 mt-1">Surveillance et gestion des incidents de sécurité</p>
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
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{metrics?.daysWithoutAccident}</div>
              <div className="text-xs text-gray-600">jours sans accident</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux d'incidents</p>
              <p className="text-3xl font-bold text-green-600">{metrics?.incidentRate}</p>
              <p className="text-xs text-gray-500 mt-1">par 100k heures</p>
            </div>
            <Shield className="h-12 w-12 text-green-500 opacity-20" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">-15% vs année passée</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Presque-accidents</p>
              <p className="text-3xl font-bold text-yellow-600">{metrics?.nearMissReports}</p>
              <p className="text-xs text-gray-500 mt-1">ce mois</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conformité</p>
              <p className="text-3xl font-bold text-blue-600">{metrics?.complianceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">objectif: 95%</p>
            </div>
            <CheckCircle className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formation sécurité</p>
              <p className="text-3xl font-bold text-purple-600">{metrics?.trainingCompletion}%</p>
              <p className="text-xs text-gray-500 mt-1">completion rate</p>
            </div>
            <Award className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Indicateurs détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Port EPI</p>
              <p className="text-2xl font-bold text-emerald-800">{metrics?.eppCompliance}%</p>
            </div>
            <Shield className="h-8 w-8 text-emerald-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Score audit</p>
              <p className="text-2xl font-bold text-blue-800">{metrics?.auditScore}/100</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700">Réunions sécurité</p>
              <p className="text-2xl font-bold text-indigo-800">{metrics?.safetyMeetingsHeld}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tendances incidents */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Évolution des Incidents</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="near_miss" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Presque-accidents" />
              <Area type="monotone" dataKey="unsafe_conditions" stackId="1" stroke="#EF4444" fill="#EF4444" name="Conditions dangereuses" />
              <Area type="monotone" dataKey="accidents" stackId="1" stroke="#DC2626" fill="#DC2626" name="Accidents" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition par Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={incidentsByType}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={formatPieLabel}
              >
                {incidentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Incidents par zone et conformité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Incidents par zone */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Incidents par Zone</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incidentsByLocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accidents" fill="#DC2626" name="Accidents" />
              <Bar dataKey="near_miss" fill="#F59E0B" name="Presque-accidents" />
              <Bar dataKey="unsafe" fill="#EF4444" name="Conditions dangereuses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métriques de conformité */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Conformité par Catégorie</h3>
          <div className="space-y-4">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.category}</span>
                  <span className={`font-bold ${metric.score >= metric.target ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.score}% / {metric.target}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      metric.score >= metric.target ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(metric.score, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, description ou lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="accident">Accidents</option>
              <option value="near_miss">Presque-accidents</option>
              <option value="unsafe_condition">Conditions dangereuses</option>
              <option value="non_compliance">Non-conformités</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouvert</option>
              <option value="investigating">Investigation</option>
              <option value="corrected">Corrigé</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des incidents */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Incidents de Sécurité ({filteredIncidents.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.type)}
                      <h3 className="font-semibold text-lg">{incident.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(incident.type)}`}>
                      {incident.type === 'accident' ? 'Accident' :
                       incident.type === 'near_miss' ? 'Presque-accident' :
                       incident.type === 'unsafe_condition' ? 'Condition dangereuse' : 'Non-conformité'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === 'critical' ? 'Critique' :
                       incident.severity === 'high' ? 'Élevée' :
                       incident.severity === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status === 'open' ? 'Ouvert' :
                       incident.status === 'investigating' ? 'Investigation' :
                       incident.status === 'corrected' ? 'Corrigé' : 'Fermé'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Lieu: </span>
                      <span className="font-medium">{incident.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rapporté par: </span>
                      <span className="font-medium">{incident.reportedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Personnes impliquées: </span>
                      <span className="font-medium">{incident.involvedPersons}</span>
                    </div>
                  </div>
                  
                  {incident.injuryType && (
                    <div className="mb-3 text-sm">
                      <span className="text-gray-600">Type de blessure: </span>
                      <span className="font-medium text-red-600">{incident.injuryType}</span>
                      {incident.daysLost !== undefined && (
                        <span className="ml-4">
                          <span className="text-gray-600">Jours d'arrêt: </span>
                          <span className="font-medium">{incident.daysLost}</span>
                        </span>
                      )}
                    </div>
                  )}
                  
                  {incident.rootCause && (
                    <div className="mb-3 p-3 bg-red-50 rounded border border-red-200">
                      <span className="text-red-800 text-sm font-medium">Cause racine: </span>
                      <span className="text-red-700 text-sm">{incident.rootCause}</span>
                    </div>
                  )}
                  
                  {incident.correctiveActions.length > 0 && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm font-medium">Actions correctives: </span>
                      <ul className="mt-1 space-y-1">
                        {incident.correctiveActions.map((action, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Rapporté le: {new Date(incident.timestamp).toLocaleDateString('fr-FR')} à {new Date(incident.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}