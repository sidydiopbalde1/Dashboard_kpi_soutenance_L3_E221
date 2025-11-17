// app/(dashboard)/production/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Factory, TrendingUp, Clock, Target, Users, Package, Play, Pause, Square, Calendar, Filter, Search, BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { formatPieLabel } from '@/types/recharts';
import { ProductionOrder, ProductionMetrics } from '@/types/production';

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [productionByLine, setProductionByLine] = useState<any[]>([]);
  const [productionMix, setProductionMix] = useState<any[]>([]);
  const [oeeComponents, setOeeComponents] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLine, setFilterLine] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/production/orders?status=${filterStatus}&line=${filterLine}`);
      const data = await res.json();
      console.log('Production data:', data);

      setOrders(data.orders || []);
      setMetrics(data.metrics || null);
      setProductionByLine(data.productionByLine || []);
      setProductionMix(data.productionMix || []);
      setOeeComponents(data.oeeComponents || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données de production:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [filterStatus, filterLine]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <Square className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Factory className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données de production...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Production</h1>
            <p className="text-gray-600 mt-1">Suivi des ordres de fabrication et performances de production</p>
            <p className="text-xs text-gray-500 mt-1">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('orders')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedView === 'orders' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Ordres
              </button>
              <button
                onClick={() => setSelectedView('analytics')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedView === 'analytics' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Production totale</p>
              <p className="text-3xl font-bold text-blue-600">{metrics?.totalProduced.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                Objectif: {metrics?.targetProduction.toLocaleString()} ({metrics?.efficiency.toFixed(1)}%)
              </p>
            </div>
            <Factory className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">OEE Global</p>
              <p className="text-3xl font-bold text-green-600">{metrics?.oee.toFixed(1)}%</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-gray-500">D:{metrics?.availability.toFixed(0)}%</span>
                <span className="text-gray-500">P:{metrics?.performance.toFixed(0)}%</span>
                <span className="text-gray-500">Q:{metrics?.quality.toFixed(0)}%</span>
              </div>
            </div>
            <Target className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cadence moyenne</p>
              <p className="text-3xl font-bold text-orange-600">{metrics?.averageRate.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">pièces/min</p>
            </div>
            <BarChart3 className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ordres actifs</p>
              <p className="text-3xl font-bold text-purple-600">{metrics?.activeOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics?.completedOrders} terminés
              </p>
            </div>
            <Package className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {selectedView === 'orders' && (
        <>
          {/* Filtres pour les ordres */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par numéro d'ordre, produit ou client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="waiting">En attente</option>
                  <option value="running">En cours</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminés</option>
                </select>

                <select
                  value={filterLine}
                  onChange={(e) => setFilterLine(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les lignes</option>
                  <option value="Ligne 1">Ligne 1</option>
                  <option value="Ligne 2">Ligne 2</option>
                  <option value="Ligne 3">Ligne 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des ordres */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Ordres de Fabrication ({filteredOrders.length})</h2>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Aucun ordre de production trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status === 'waiting' ? 'En attente' :
                             order.status === 'running' ? 'En cours' :
                             order.status === 'paused' ? 'En pause' :
                             order.status === 'completed' ? 'Terminé' : 'Annulé'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(order.priority)}`}>
                            {order.priority === 'urgent' ? 'Urgent' :
                             order.priority === 'high' ? 'Élevée' :
                             order.priority === 'medium' ? 'Moyenne' : 'Faible'}
                          </span>
                        </div>

                        <p className="text-gray-700 font-medium mb-3">{order.product}</p>

                        {/* Barre de progression */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression: {order.produced.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                            <span className="font-medium">{order.progress.toFixed(1)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'running' ? 'bg-blue-500' :
                                order.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${Math.min(order.progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Client: </span>
                            <span className="font-medium">{order.customer || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ligne: </span>
                            <span className="font-medium">{order.line}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cadence: </span>
                            <span className="font-medium">
                              {order.actualRate || 0} / {order.targetRate} pcs/min
                            </span>
                            {order.status === 'running' && order.actualRate && (
                              <span className={`ml-2 ${order.actualRate >= order.targetRate ? 'text-green-600' : 'text-red-600'}`}>
                                ({order.actualRate >= order.targetRate ? '+' : ''}{((order.actualRate / order.targetRate - 1) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-600">Équipe: </span>
                            <span className="font-medium">{order.operator || 'Non assigné'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                          {order.startTime && (
                            <div>
                              <span className="text-gray-600">Début: </span>
                              <span className="font-medium">
                                {new Date(order.startTime).toLocaleDateString('fr-FR')} {new Date(order.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Fin estimée: </span>
                            <span className="font-medium">
                              {new Date(order.estimatedEndTime).toLocaleDateString('fr-FR')} {new Date(order.estimatedEndTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {order.endTime && (
                            <div>
                              <span className="text-gray-600">Fin réelle: </span>
                              <span className="font-medium text-green-600">
                                {new Date(order.endTime).toLocaleDateString('fr-FR')} {new Date(order.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {(order.setupTime || order.downtime > 0) && (
                          <div className="flex gap-6 mt-3 text-sm">
                            {order.setupTime && (
                              <div>
                                <span className="text-gray-600">Temps de setup: </span>
                                <span className="font-medium">{order.setupTime}min</span>
                              </div>
                            )}
                            {order.downtime > 0 && (
                              <div>
                                <span className="text-gray-600">Temps d'arrêt: </span>
                                <span className="font-medium text-red-600">{order.downtime}min</span>
                              </div>
                            )}
                          </div>
                        )}

                        {order.comments && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600">Commentaires: </span>
                            <span className="font-medium text-orange-600">{order.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {selectedView === 'analytics' && (
        <div className="space-y-6">
          {/* Graphiques de production */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production par ligne */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Production par Ligne</h3>
              {productionByLine.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productionByLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="line" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="produced" fill="#3B82F6" name="Produit" />
                    <Bar dataKey="target" fill="#94A3B8" name="Objectif" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>

            {/* Mix produits */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Mix Produits (Volume)</h3>
              {productionMix.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={productionMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                      label={formatPieLabel}
                    >
                      {productionMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Composants OEE */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Composants OEE</h3>
            {oeeComponents.length > 0 ? (
              <div className="space-y-4">
                {oeeComponents.map((component, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{component.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Objectif: {component.target}%</span>
                        <span className={`font-bold ${component.value >= component.target ? 'text-green-600' : 'text-red-600'}`}>
                          {component.value.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          component.value >= component.target ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(component.value, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>OEE Global</span>
                    <span className="text-green-600">{metrics?.oee.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    OEE = Disponibilité × Performance × Qualité
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
