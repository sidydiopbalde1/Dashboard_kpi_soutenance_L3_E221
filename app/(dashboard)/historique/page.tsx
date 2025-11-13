// app/(dashboard)/historique/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

export default function HistoriquePage() {
  const [historyData, setHistoryData] = useState<any>(null);
  const [period, setPeriod] = useState('60');

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`/api/production/history?period=${period}&limit=100`);
      const data = await res.json();
      setHistoryData(data);
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique de Production</h1>
          <p className="text-gray-600 mt-1">Analyse des performances dans le temps</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 heure</option>
            <option value="120">2 heures</option>
            <option value="240">4 heures</option>
            <option value="480">8 heures</option>
          </select>
        </div>
      </div>

      {/* Stats résumé */}
      {historyData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Production totale</p>
            <p className="text-3xl font-bold text-gray-900">
              {historyData.summary.totalProduced.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">bouteilles</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Cadence moyenne</p>
            <p className="text-3xl font-bold text-gray-900">
              {historyData.summary.avgRate}
            </p>
            <p className="text-xs text-gray-500">b/min</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Taux de défauts</p>
            <p className="text-3xl font-bold text-red-600">
              {historyData.summary.defectRate}%
            </p>
            <p className="text-xs text-gray-500">{historyData.summary.totalDefects} défauts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Points de données</p>
            <p className="text-3xl font-bold text-gray-900">
              {historyData.summary.dataPoints}
            </p>
            <p className="text-xs text-gray-500">mesures</p>
          </div>
        </div>
      )}

      {/* Graphique principal */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Évolution de la Cadence</h2>
        {historyData?.data && historyData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
                label={{ value: 'Cadence (b/min)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Cadence réelle"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#22c55e" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Objectif"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>Chargement des données...</p>
          </div>
        )}
      </div>

      {/* Graphique défauts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Défauts Détectés</h2>
        {historyData?.data && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="defectCount" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Défauts"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}