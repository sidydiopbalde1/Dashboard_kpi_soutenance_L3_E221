// app/(dashboard)/rapports/page.tsx
'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer, Loader2, TrendingUp, AlertTriangle, Clock, Users } from 'lucide-react';
import { generatePDFReport, generateExcelReport } from '@/lib/export-utils';

export default function RapportsPage() {
  const [reportType, setReportType] = useState('production');
  const [period, setPeriod] = useState('daily');
  const [shift, setShift] = useState('');
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeDowntime, setIncludeDowntime] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    
    try {
      // Récupérer les données depuis l'API
      const response = await fetch('/api/dashboard/current');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();

      // Préparer les données du rapport
      const reportData = {
        kpi: data.kpi,
        production: data.production,
        downtime: data.downtime,
        alerts: includeAlerts ? data.alerts : [],
        period: getPeriodLabel(period),
        reportType,
        shift
      };

      // Générer le rapport
      if (format === 'pdf') {
        generatePDFReport(reportData);
      } else {
        generateExcelReport(reportData);
      }

      // Afficher un message de succès
      alert(`✅ Rapport ${format.toUpperCase()} généré avec succès !`);
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      alert('❌ Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPeriodLabel = (p: string): string => {
    const labels: Record<string, string> = {
      hourly: 'Dernière heure',
      daily: 'Aujourd\'hui',
      weekly: 'Cette semaine',
      monthly: 'Ce mois',
      custom: 'Période personnalisée'
    };
    return labels[p] || p;
  };

  // Données mockées pour l'aperçu
  const getMockData = () => {
    const baseData = {
      production: { total: 2450, objectif: 2500, taux: 98 },
      trs: { disponibilite: 95.2, performance: 87.4, qualite: 96.8, trs: 80.5 },
      downtime: [
        { raison: 'Maintenance programmée', duree: 45, type: 'plannifie' },
        { raison: 'Panne moteur', duree: 23, type: 'non_plannifie' },
        { raison: 'Changement d\'outil', duree: 15, type: 'plannifie' }
      ],
      quality: { defauts: 78, conformes: 2372, taux: 96.8 },
      alerts: [
        { type: 'warning', message: 'Température élevée Ligne 2', time: '14:30' },
        { type: 'error', message: 'Arrêt urgence Ligne 1', time: '12:15' }
      ]
    };

    // Adapter selon la période
    if (period === 'weekly') {
      baseData.production.total *= 7;
      baseData.production.objectif *= 7;
    } else if (period === 'monthly') {
      baseData.production.total *= 30;
      baseData.production.objectif *= 30;
    }

    return baseData;
  };

  const renderPreview = () => {
    const data = getMockData();
    const selectedType = reportTypes.find(t => t.id === reportType);

    switch (reportType) {
      case 'production':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Production totale</span>
                <span className="text-lg font-bold text-blue-600">{data.production.total.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Objectif: {data.production.objectif.toLocaleString()} ({data.production.taux}%)
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium text-green-700">Cadence</div>
                <div className="text-green-600">102 pcs/h</div>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <div className="font-medium text-orange-700">Arrêts</div>
                <div className="text-orange-600">83 min</div>
              </div>
            </div>
          </div>
        );

      case 'trs':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.trs.trs}%</div>
              <div className="text-xs text-gray-600">TRS Global</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Disponibilité</span>
                <span className="font-medium">{data.trs.disponibilite}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Performance</span>
                <span className="font-medium">{data.trs.performance}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Qualité</span>
                <span className="font-medium">{data.trs.qualite}%</span>
              </div>
            </div>
          </div>
        );

      case 'downtime':
        return (
          <div className="space-y-2">
            <div className="text-center mb-3">
              <div className="text-lg font-bold text-red-600">83 min</div>
              <div className="text-xs text-gray-600">Temps d'arrêt total</div>
            </div>
            
            {data.downtime.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium truncate">{item.raison}</div>
                <div className="flex justify-between text-gray-600">
                  <span>{item.duree} min</span>
                  <span className={item.type === 'plannifie' ? 'text-blue-600' : 'text-red-600'}>
                    {item.type === 'plannifie' ? 'Planifié' : 'Non planifié'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'quality':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.quality.taux}%</div>
              <div className="text-xs text-gray-600">Taux de conformité</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-bold text-green-600">{data.quality.conformes.toLocaleString()}</div>
                <div className="text-green-700">Conformes</div>
              </div>
              <div className="bg-red-50 p-2 rounded text-center">
                <div className="font-bold text-red-600">{data.quality.defauts}</div>
                <div className="text-red-700">Défauts</div>
              </div>
            </div>
          </div>
        );

      case 'shift':
        return (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 text-center mb-3">Comparaison par équipe</div>
            
            <div className="space-y-2">
              <div className="bg-blue-50 p-2 rounded">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Matin (6h-14h)</span>
                  <span className="text-blue-600">856 pcs</span>
                </div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Après-midi (14h-22h)</span>
                  <span className="text-green-600">823 pcs</span>
                </div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Nuit (22h-6h)</span>
                  <span className="text-purple-600">771 pcs</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Sélectionnez un type de rapport</p>
          </div>
        );
    }
  };

  const reportTypes = [
    { id: 'production', name: 'Production', description: 'Rapport complet de production' },
    { id: 'trs', name: 'TRS & OEE', description: 'Analyse des indicateurs de performance' },
    { id: 'downtime', name: 'Temps d\'arrêt', description: 'Analyse des arrêts et pannes' },
    { id: 'quality', name: 'Qualité', description: 'Rapport des défauts et non-conformités' },
    { id: 'shift', name: 'Par équipe', description: 'Comparaison des performances par shift' },
  ];

  const periods = [
    { id: 'hourly', name: 'Dernière heure' },
    { id: 'daily', name: 'Aujourd\'hui' },
    { id: 'weekly', name: 'Cette semaine' },
    { id: 'monthly', name: 'Ce mois' },
    { id: 'custom', name: 'Période personnalisée' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-600 mt-1">Génération et export de rapports de production</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration du rapport */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type de rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Type de Rapport</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    reportType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Période</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    period === p.id
                      ? 'border-blue-500 bg-blue-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filtres additionnels */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Filtres</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipe
                </label>
                <select 
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les équipes</option>
                  <option value="MATIN">Matin (6h-14h)</option>
                  <option value="APRES_MIDI">Après-midi (14h-22h)</option>
                  <option value="NUIT">Nuit (22h-6h)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAlerts"
                  checked={includeAlerts}
                  onChange={(e) => setIncludeAlerts(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeAlerts" className="text-sm text-gray-700">
                  Inclure les alertes
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeDowntime"
                  checked={includeDowntime}
                  onChange={(e) => setIncludeDowntime(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeDowntime" className="text-sm text-gray-700">
                  Inclure les temps d'arrêt
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu et actions */}
        <div className="space-y-6">
          {/* Aperçu */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[300px]">
              <div className="mb-3 pb-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {reportTypes.find(t => t.id === reportType)?.name || 'Rapport'}
                </h3>
                <p className="text-xs text-gray-600">
                  {getPeriodLabel(period)} • {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              {renderPreview()}
              
              {/* Indicateurs additionnels */}
              {includeAlerts && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium text-gray-700">Alertes</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs bg-yellow-50 p-1 rounded">⚠️ Température élevée</div>
                    <div className="text-xs bg-red-50 p-1 rounded">🛑 Arrêt urgence</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">
                  {reportTypes.find(t => t.id === reportType)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Période:</span>
                <span className="font-medium">
                  {periods.find(p => p.id === period)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('fr-FR')}
                </span>
              </div>
              {shift && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Équipe:</span>
                  <span className="font-medium">{shift}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Générer</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => generateReport('pdf')}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Télécharger PDF
                  </>
                )}
              </button>

              <button
                onClick={() => generateReport('excel')}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Télécharger Excel
                  </>
                )}
              </button>

              <button
                disabled={isGenerating}
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-5 w-5" />
                Imprimer
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Les rapports sont générés en temps réel à partir des données actuelles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}