// app/(dashboard)/maintenance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wrench, Calendar, Clock, CheckCircle, AlertTriangle, Plus, Filter, Search, Package, User, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PieCallbackProps, formatPieLabel } from '@/types/recharts';
interface MaintenanceTask {
  id: string;
  equipment: string;
  type: 'preventive' | 'corrective' | 'emergency';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: number;
  actualDuration?: number;
  completedDate?: string;
  spareParts: string[];
  cost?: number;
}

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // État pour les données dynamiques
  const [metrics, setMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [tasksByType, setTasksByType] = useState<any[]>([]);

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/maintenance?status=${filterStatus}&type=${filterType}`);
      const data = await res.json();

      setTasks(data.tasks || []);
      setMetrics(data.metrics || null);
      setTrends(data.trends || []);
      setTasksByType(data.tasksByType || []);
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
  }, [filterStatus, filterType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Calendar className="h-4 w-4" />;
      case 'corrective': return <Wrench className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesSearch = task.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Wrench className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données de maintenance...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-gray-600 mt-1">Gestion préventive et corrective des équipements</p>
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
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              Nouvelle intervention
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MTBF</p>
              <p className="text-2xl font-bold text-blue-600">{metrics?.mtbf?.toFixed(1) || 0}h</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MTTR</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.mttr?.toFixed(1) || 0}min</p>
            </div>
            <Clock className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibilité</p>
              <p className="text-2xl font-bold text-purple-600">{metrics?.availability?.toFixed(1) || 0}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coût mensuel</p>
              <p className="text-2xl font-bold text-orange-600">{metrics?.totalCost?.toLocaleString('fr-FR') || 0}€</p>
            </div>
            <Package className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conformité planning</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics?.plannedCompliance?.toFixed(1) || 0}%</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Historique des maintenances */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Historique des Maintenances</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="preventive" stackId="a" fill="#3B82F6" name="Préventive" />
              <Bar dataKey="corrective" stackId="a" fill="#F59E0B" name="Corrective" />
              <Bar dataKey="emergency" stackId="a" fill="#EF4444" name="Urgence" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition par Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
            <Pie
  data={tasksByType}
  cx="50%"
  cy="50%"
  innerRadius={40}
  outerRadius={80}
  dataKey="count"
  label={formatPieLabel}
>
                {tasksByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
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
                placeholder="Rechercher par équipement, description ou technicien..."
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
              <option value="planned">Planifiées</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="overdue">En retard</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="preventive">Préventive</option>
              <option value="corrective">Corrective</option>
              <option value="emergency">Urgence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Interventions de Maintenance ({filteredTasks.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(task.type)}
                      <h3 className="font-semibold text-lg">{task.equipment}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === 'planned' ? 'Planifiée' :
                       task.status === 'in_progress' ? 'En cours' :
                       task.status === 'completed' ? 'Terminée' : 'En retard'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'critical' ? 'Critique' :
                       task.priority === 'high' ? 'Élevée' :
                       task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Assigné à: </span>
                      <span className="font-medium">{task.assignedTo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Planifié: </span>
                      <span className="font-medium">
                        {new Date(task.scheduledDate).toLocaleDateString('fr-FR')} à {new Date(task.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Durée estimée: </span>
                      <span className="font-medium">{task.estimatedDuration}min</span>
                      {task.actualDuration && (
                        <span className={`ml-2 ${task.actualDuration > task.estimatedDuration ? 'text-red-600' : 'text-green-600'}`}>
                          (réel: {task.actualDuration}min)
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Coût estimé: </span>
                      <span className="font-medium">{task.cost}€</span>
                    </div>
                  </div>
                  
                  {task.spareParts.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Pièces nécessaires: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.spareParts.map((part, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
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