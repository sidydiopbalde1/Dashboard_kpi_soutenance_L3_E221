// app/(dashboard)/equipes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Award, AlertCircle, CheckCircle, TrendingUp, Calendar, Search, Filter, User, Badge, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  shift: 'MATIN' | 'APRES_MIDI' | 'NUIT';
  status: 'present' | 'absent' | 'break' | 'training';
  skills: string[];
  certifications: string[];
  performance: number;
  efficiency: number;
  quality: number;
  safety: number;
  experience: number; // en années
  lastTraining?: string;
  nextTraining?: string;
  workstation: string;
}

interface ShiftMetrics {
  shift: string;
  members: number;
  present: number;
  efficiency: number;
  production: number;
  target: number;
  incidents: number;
}

export default function EquipesPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [shiftMetrics, setShiftMetrics] = useState<ShiftMetrics[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // État pour les données dynamiques
  const [metrics, setMetrics] = useState<any>(null);
  const [shiftPerformance, setShiftPerformance] = useState<any[]>([]);

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/teams?shift=${selectedShift}`);
      const data = await res.json();

      setMembers(data.employees || []);
      setMetrics(data.metrics || null);
      setShiftPerformance(data.shiftPerformance || []);
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
  }, [selectedShift]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'break': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'training': return <Award className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMembers = members.filter(member => {
    const matchesShift = selectedShift === 'all' || member.shift === selectedShift;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.workstation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesShift && matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des données équipes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Équipes</h1>
            <p className="text-gray-600 mt-1">Suivi du personnel et performance par shift</p>
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
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {members.filter(m => m.status === 'present').length} présents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques par shift */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {shiftMetrics.map((shift) => (
          <div key={shift.shift} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{shift.shift}</h3>
              <Users className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Présents:</span>
                <span className="font-bold">{shift.present}/{shift.members}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficacité:</span>
                <span className={`font-bold ${getPerformanceColor(shift.efficiency)}`}>
                  {shift.efficiency}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Production:</span>
                <span className="font-bold">{shift.production.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Objectif:</span>
                <span className="text-sm text-gray-500">{shift.target.toLocaleString()}</span>
              </div>
              {shift.incidents > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Incidents:</span>
                  <span className="font-bold text-red-600">{shift.incidents}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance par shift */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance par Shift</h3>
          {shiftPerformance.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={shiftPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="shift" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Performance" dataKey="avgPerformance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                <Radar name="Efficacité" dataKey="avgEfficiency" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Radar name="Qualité" dataKey="avgQuality" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                <Radar name="Sécurité" dataKey="avgSafety" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Métriques globales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Métriques Globales</h3>
          {metrics && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Performance moyenne:</span>
                <span className="text-2xl font-bold text-blue-600">{metrics.avgPerformance?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Efficacité moyenne:</span>
                <span className="text-2xl font-bold text-green-600">{metrics.avgEfficiency?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Meilleur performer:</span>
                <span className="text-lg font-semibold text-gray-800">{metrics.topPerformer?.name || 'N/A'}</span>
              </div>
              <div className="text-sm text-gray-500">
                Performance: {metrics.topPerformer?.performance}%
              </div>
            </div>
          )}
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
                placeholder="Rechercher par nom, rôle ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les shifts</option>
              <option value="MATIN">Matin</option>
              <option value="APRES_MIDI">Après-midi</option>
              <option value="NUIT">Nuit</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="break">Pause</option>
              <option value="training">Formation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Membres de l'Équipe ({filteredMembers.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(member.status)}
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status === 'present' ? 'Présent' :
                       member.status === 'absent' ? 'Absent' :
                       member.status === 'break' ? 'Pause' : 'Formation'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {member.shift}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-gray-600 text-sm">Rôle: </span>
                      <span className="font-medium">{member.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Poste: </span>
                      <span className="font-medium">{member.workstation}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Expérience: </span>
                      <span className="font-medium">{member.experience} ans</span>
                    </div>
                  </div>
                  
                  {/* Indicateurs de performance */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </div>
                      <div className="text-xs text-gray-600">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.efficiency)}`}>
                        {member.efficiency}%
                      </div>
                      <div className="text-xs text-gray-600">Efficacité</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.quality)}`}>
                        {member.quality}%
                      </div>
                      <div className="text-xs text-gray-600">Qualité</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.safety)}`}>
                        {member.safety}%
                      </div>
                      <div className="text-xs text-gray-600">Sécurité</div>
                    </div>
                  </div>
                  
                  {/* Compétences */}
                  <div className="mb-3">
                    <span className="text-gray-600 text-sm">Compétences: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Certifications */}
                  <div className="mb-3">
                    <span className="text-gray-600 text-sm">Certifications: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.certifications.map((cert, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                          <Badge className="h-3 w-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Formation */}
                  {(member.lastTraining || member.nextTraining) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {member.lastTraining && (
                        <div>
                          <span className="text-gray-600">Dernière formation: </span>
                          <span className="font-medium">
                            {new Date(member.lastTraining).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {member.nextTraining && (
                        <div>
                          <span className="text-gray-600">Prochaine formation: </span>
                          <span className="font-medium text-blue-600">
                            {new Date(member.nextTraining).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    Profil
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