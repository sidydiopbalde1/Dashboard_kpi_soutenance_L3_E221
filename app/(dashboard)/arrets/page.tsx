// app/(dashboard)/arrets/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ArretsPage() {
  const [downtimeData, setDowntimeData] = useState<any>(null);

  useEffect(() => {
    const fetchDowntime = async () => {
      try {
        const res = await fetch('/api/downtime');
        if (res.ok) {
          const data = await res.json();
          console.log('Downtime data:', data);
          setDowntimeData(data);
        } else {
          console.error('Erreur API downtime:', res.status);
          // Données de fallback
          setDowntimeData({
            totalDowntime: 125,
            currentDowntime: 0,
            downtimeEvents: [
              { id: 1, reason: 'Changement format', duration: 45, startTime: new Date().toISOString(), equipment: 'Ligne 1', operator: 'Marie Dupont', description: 'Changement bouteille 500ml vers 1L' },
              { id: 2, reason: 'Maintenance', duration: 30, startTime: new Date().toISOString(), equipment: 'Ligne 2', operator: 'Jean Martin', description: 'Nettoyage convoyeur' }
            ],
            downtimeByReason: [
              { reason: 'Changement format', duration: 65, count: 3, percentage: 52 },
              { reason: 'Maintenance', duration: 35, count: 2, percentage: 28 },
              { reason: 'Panne', duration: 25, count: 1, percentage: 20 }
            ]
          });
        }
      } catch (error) {
        console.error('Erreur fetch downtime:', error);
        setDowntimeData({
          totalDowntime: 125,
          currentDowntime: 0,
          downtimeEvents: [
            { id: 1, reason: 'Changement format', duration: 45, startTime: new Date().toISOString(), equipment: 'Ligne 1', operator: 'Marie Dupont', description: 'Changement bouteille 500ml vers 1L' },
            { id: 2, reason: 'Maintenance', duration: 30, startTime: new Date().toISOString(), equipment: 'Ligne 2', operator: 'Jean Martin', description: 'Nettoyage convoyeur' }
          ],
          downtimeByReason: [
            { reason: 'Changement format', duration: 65, count: 3, percentage: 52 },
            { reason: 'Maintenance', duration: 35, count: 2, percentage: 28 },
            { reason: 'Panne', duration: 25, count: 1, percentage: 20 }
          ]
        });
      }
    };

    fetchDowntime();
    const interval = setInterval(fetchDowntime, 10000);
    return () => clearInterval(interval);
  }, []);

  const reasonLabels: Record<string, string> = {
    PANNE: 'Panne',
    MAINTENANCE: 'Maintenance',
    CHANGEMENT_FORMAT: 'Changement format',
    PAUSE: 'Pause',
    MANQUE_MATIERE: 'Manque matière',
    REGLAGE: 'Réglage'
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  // Préparer les données pour le graphique pie
  const pieData = downtimeData?.summary?.byReason 
    ? Object.entries(downtimeData.summary.byReason).map(([reason, duration]: [string, any]) => ({
        name: reasonLabels[reason] || reason,
        value: duration,
        duration: `${duration} min`
      }))
    : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Temps d'Arrêt</h1>
        <p className="text-gray-600 mt-1">Analyse des arrêts de production (Dernières 24h)</p>
      </div>

      {/* Stats */}
      {downtimeData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Temps total d'arrêt</span>
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {downtimeData.summary.totalDowntime}
            </p>
            <p className="text-xs text-gray-500">minutes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Nombre d'incidents</span>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {downtimeData.summary.total}
            </p>
            <p className="text-xs text-gray-500">arrêts</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">MTTR</span>
              <TrendingDown className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {downtimeData.summary.mttr}
            </p>
            <p className="text-xs text-gray-500">min (temps moyen réparation)</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Arrêts planifiés</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {downtimeData.summary.plannedCount}
            </p>
            <p className="text-xs text-gray-500">
              vs {downtimeData.summary.unplannedCount} non planifiés
            </p>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Répartition par cause */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Répartition par Cause</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} min`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Durée par type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Durée par Type d'Arrêt</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value} min`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Liste des arrêts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Historique des Arrêts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {downtimeData?.downtimes?.map((downtime: any) => (
                <tr key={downtime.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(downtime.startTime).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {downtime.duration || '-'} min
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reasonLabels[downtime.reason] || downtime.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      downtime.category === 'PLANIFIE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {downtime.category === 'PLANIFIE' ? 'Planifié' : 'Non planifié'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {downtime.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {downtime.resolved ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Résolu
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En cours
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!downtimeData?.downtimes || downtimeData.downtimes.length === 0) && (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Aucun arrêt enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}