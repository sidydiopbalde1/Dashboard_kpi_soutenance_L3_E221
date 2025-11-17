// app/(dashboard)/qualite/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp, AlertCircle, CheckCircle, XCircle, BarChart3, Filter, Search, Eye, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { formatPieLabel } from '@/types/recharts';
import { QualityDefect, QualityMetrics } from '@/types/quality';

export default function QualitePage() {
  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // État pour les données dynamiques des graphiques
  const [defectsByType, setDefectsByType] = useState<any[]>([]);
  const [lineQuality, setLineQuality] = useState<any[]>([]);
  const [spcChart, setSpcChart] = useState<any>(null);

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/quality?severity=${filterSeverity}&status=${filterStatus}&period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Quality data:', data);
        setDefects(data.defects || []);
        setMetrics(data.metrics || null);
        setDefectsByType(data.defectsByType || []);
        setLineQuality(data.lineQuality || []);
        setSpcChart(data.spcChart || null);
        setLastUpdate(new Date());
      } else {
        console.error('Erreur API quality:', res.status);
        // Données de fallback
        setDefects([
          { id: 1, timestamp: new Date().toISOString(), lotNumber: 'LOT-2024-001', productType: 'Bouteille 1L', defectType: 'Dimensionnel', severity: 'medium', status: 'open', quantity: 15, totalProduced: 500, operator: 'Marie Dupont', line: 'Ligne 1', shift: 'MATIN', inspector: 'Jean Contrôle', correctedAction: 'Réglage moule', comments: 'Diamètre hors tolérance' },
          { id: 2, timestamp: new Date().toISOString(), lotNumber: 'LOT-2024-002', productType: 'Bouteille 0.5L', defectType: 'Visuel', severity: 'minor', status: 'corrected', quantity: 8, totalProduced: 600, operator: 'Pierre Martin', line: 'Ligne 2', shift: 'APRES_MIDI', inspector: 'Sophie Quality', correctedAction: 'Nettoyage applicateur', comments: 'Rayure légère sur étiquette' }
        ]);
        setMetrics({
          totalDefects: 28,
          defectRate: 3.2,
          conformityRate: 96.8,
          firstPassYield: 94.5,
          openIssues: 5,
          closedIssues: 23,
          criticalIssues: 1,
          customerComplaints: 3,
          scrapCost: 145,
          rework: 2.1
        });
        setDefectsByType([
          { name: 'Visuel', value: 12, count: 12, percentage: 43, color: '#EF4444' },
          { name: 'Dimensionnel', value: 8, count: 8, percentage: 29, color: '#F59E0B' },
          { name: 'Fonctionnel', value: 5, count: 5, percentage: 18, color: '#10B981' },
          { name: 'Autres', value: 3, count: 3, percentage: 10, color: '#6B7280' }
        ]);
        setLineQuality([
          { line: 'Ligne 1', minor: 5, major: 3, critical: 1 },
          { line: 'Ligne 2', minor: 8, major: 2, critical: 0 },
          { line: 'Ligne 3', minor: 6, major: 1, critical: 0 }
        ]);
        setSpcChart({
          trend: [
            { hour: '6h', conformity: 96.8, fpy: 95.2 },
            { hour: '8h', conformity: 97.1, fpy: 96.0 },
            { hour: '10h', conformity: 96.5, fpy: 94.8 },
            { hour: '12h', conformity: 97.3, fpy: 96.5 }
          ],
          samples: [
            { sample: 1, value: 2.5, ucl: 5, lcl: 0, target: 2 },
            { sample: 2, value: 3.1, ucl: 5, lcl: 0, target: 2 },
            { sample: 3, value: 2.8, ucl: 5, lcl: 0, target: 2 }
          ],
          ucl: 5,
          lcl: 0
        });
      }
    } catch (error) {
      console.error('Erreur fetch quality:', error);
      // Données de fallback en cas d'erreur
      setDefects([
        { id: 1, timestamp: new Date().toISOString(), lotNumber: 'LOT-2024-001', productType: 'Bouteille 1L', defectType: 'Dimensionnel', severity: 'medium', status: 'open', quantity: 15, totalProduced: 500, operator: 'Marie Dupont', line: 'Ligne 1', shift: 'MATIN', inspector: 'Jean Contrôle', correctedAction: 'Réglage moule', comments: 'Diamètre hors tolérance' },
        { id: 2, timestamp: new Date().toISOString(), lotNumber: 'LOT-2024-002', productType: 'Bouteille 0.5L', defectType: 'Visuel', severity: 'minor', status: 'corrected', quantity: 8, totalProduced: 600, operator: 'Pierre Martin', line: 'Ligne 2', shift: 'APRES_MIDI', inspector: 'Sophie Quality', correctedAction: 'Nettoyage applicateur', comments: 'Rayure légère sur étiquette' }
      ]);
      setMetrics({
        totalDefects: 28,
        defectRate: 3.2,
        conformityRate: 96.8,
        firstPassYield: 94.5,
        openIssues: 5,
        closedIssues: 23,
        criticalIssues: 1,
        customerComplaints: 3,
        scrapCost: 145,
        rework: 2.1
      });
      setDefectsByType([
        { name: 'Visuel', value: 12, count: 12, percentage: 43, color: '#EF4444' },
        { name: 'Dimensionnel', value: 8, count: 8, percentage: 29, color: '#F59E0B' },
        { name: 'Fonctionnel', value: 5, count: 5, percentage: 18, color: '#10B981' },
        { name: 'Autres', value: 3, count: 3, percentage: 10, color: '#6B7280' }
      ]);
      setLineQuality([
        { line: 'Ligne 1', minor: 5, major: 3, critical: 1 },
        { line: 'Ligne 2', minor: 8, major: 2, critical: 0 },
        { line: 'Ligne 3', minor: 6, major: 1, critical: 0 }
      ]);
      setSpcChart({
        trend: [
          { hour: '6h', conformity: 96.8, fpy: 95.2 },
          { hour: '8h', conformity: 97.1, fpy: 96.0 },
          { hour: '10h', conformity: 96.5, fpy: 94.8 },
          { hour: '12h', conformity: 97.3, fpy: 96.5 }
        ],
        samples: [
          { sample: 1, value: 2.5, ucl: 5, lcl: 0, target: 2 },
          { sample: 2, value: 3.1, ucl: 5, lcl: 0, target: 2 },
          { sample: 3, value: 2.8, ucl: 5, lcl: 0, target: 2 }
        ],
        ucl: 5,
        lcl: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [filterSeverity, filterStatus, selectedPeriod]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const filteredDefects = defects.filter(defect => {
    const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || defect.status === filterStatus;
    const matchesSearch = defect.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.defectType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Target className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données qualité...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Contrôle Qualité</h1>
            <p className="text-gray-600 mt-1">Surveillance et analyse de la qualité de production</p>
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
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conformité</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.conformityRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0.3%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux défauts</p>
              <p className="text-2xl font-bold text-red-600">{metrics?.defectRate}%</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">-0.1%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">FPY</p>
              <p className="text-2xl font-bold text-blue-600">{metrics?.firstPassYield}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
          <div className="text-xs text-gray-500 mt-1">First Pass Yield</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Réclamations</p>
              <p className="text-2xl font-bold text-orange-600">{metrics?.customerComplaints}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Ce mois</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coût rebuts</p>
              <p className="text-2xl font-bold text-purple-600">{metrics?.scrapCost}€</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Aujourd'hui</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retouches</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics?.rework}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500 opacity-20" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Taux retouches</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tendances qualité */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tendances Qualité</h3>
          {spcChart?.trend && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spcChart.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="conformity" stroke="#10B981" strokeWidth={2} name="Conformité %" />
                <Line type="monotone" dataKey="fpy" stroke="#3B82F6" strokeWidth={2} name="FPY %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Défauts par type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition des Défauts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={defectsByType}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                label={formatPieLabel}
              >
                {defectsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SPC et défauts par ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Carte de contrôle SPC */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Carte de Contrôle SPC</h3>
          {spcChart?.samples && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spcChart.samples}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sample" />
                <YAxis domain={[spcChart.lcl - 1, spcChart.ucl + 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="ucl" stroke="#EF4444" strokeDasharray="5 5" name="Limite sup." />
                <Line type="monotone" dataKey="lcl" stroke="#EF4444" strokeDasharray="5 5" name="Limite inf." />
                <Line type="monotone" dataKey="target" stroke="#10B981" strokeDasharray="10 5" name="Cible" />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} name="Mesure" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Défauts par ligne */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Défauts par Ligne de Production</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={lineQuality}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="line" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minor" stackId="a" fill="#F59E0B" name="Mineurs" />
              <Bar dataKey="major" stackId="a" fill="#EF4444" name="Majeurs" />
              <Bar dataKey="critical" stackId="a" fill="#7C2D12" name="Critiques" />
            </BarChart>
          </ResponsiveContainer>
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
                placeholder="Rechercher par lot, produit ou type de défaut..."
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
              <option value="all">Toutes sévérités</option>
              <option value="critical">Critique</option>
              <option value="major">Majeur</option>
              <option value="minor">Mineur</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous statuts</option>
              <option value="open">Ouvert</option>
              <option value="investigating">Investigation</option>
              <option value="corrected">Corrigé</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des défauts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Non-Conformités Détectées ({filteredDefects.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredDefects.map((defect) => (
            <div key={defect.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{defect.lotNumber}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(defect.severity)}`}>
                      {defect.severity === 'critical' ? 'Critique' :
                       defect.severity === 'major' ? 'Majeur' : 'Mineur'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(defect.status)}`}>
                      {defect.status === 'open' ? 'Ouvert' :
                       defect.status === 'investigating' ? 'Investigation' :
                       defect.status === 'corrected' ? 'Corrigé' : 'Fermé'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-gray-600 text-sm">Produit: </span>
                      <span className="font-medium">{defect.productType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Type de défaut: </span>
                      <span className="font-medium text-red-600">{defect.defectType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Ligne: </span>
                      <span className="font-medium">{defect.line}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Quantité défectueuse: </span>
                      <span className="font-bold text-red-600">{defect.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Production totale: </span>
                      <span className="font-medium">{defect.totalProduced}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux défaut: </span>
                      <span className="font-medium">{((defect.quantity / defect.totalProduced) * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Shift: </span>
                      <span className="font-medium">{defect.shift}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Opérateur: </span>
                      <span className="font-medium">{defect.operator}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Détecté: </span>
                      <span className="font-medium">
                        {new Date(defect.timestamp).toLocaleDateString('fr-FR')} à {new Date(defect.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  {defect.correctedAction && (
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-green-800 text-sm font-medium">Action corrective: </span>
                      <span className="text-green-700 text-sm">{defect.correctedAction}</span>
                    </div>
                  )}
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