"use client";

import { useEffect, useState } from 'react';
import { Activity, Clock, Gauge, AlertTriangle, CheckCircle, XCircle, Users, BarChart3, Settings, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnimatedList, AnimatedListItem } from '@/components/animations/AnimatedComponents';
import { SmartCard, InteractiveButton, SmartLoader } from '@/components/animations/EnhancedAnimations';
import { EnhancedKPICard, EnhancedChartCard, EnhancedAlertCard } from '@/components/dashboard/EnhancedDashboardCards';
import { motion } from 'framer-motion';

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
      { id: 1, type: 'warning' as const, message: 'Température élevée sur ligne 2', time: '14:30', severity: 'medium' as const },
      { id: 2, type: 'error' as const, message: 'Arrêt urgence - Bourrage ligne 1', time: '12:15', severity: 'high' as const },
      { id: 3, type: 'info' as const, message: 'Maintenance programmée à 16h', time: '11:00', severity: 'low' as const },
      { id: 4, type: 'warning' as const, message: 'Stock étiquettes faible', time: '10:45', severity: 'medium' as const },
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
        const res = await fetch('/api/dashboard/current');
        const data = await res.json();
        console.log('KPI data:', data);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SmartLoader 
          variant="spinner" 
          size="lg" 
          text="Chargement du dashboard..." 
        />
      </div>
    );
  }

  const productionProgress = ((kpiData?.production?.totalProduced || 0) / (kpiData?.production?.objectif || 2500)) * 100;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header amélioré avec animations */}
      <motion.div 
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Fond animé subtil */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="relative z-10 flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
              >
                <Activity className="h-6 w-6" />
              </motion.div>
              <h1 className="text-3xl font-bold">Dashboard KPI Production</h1>
            </div>
            <p className="text-blue-100">
              Shift actuel: Après-midi (14h-22h) • Ligne d'Embouteillage
            </p>
          </motion.div>
          
          <motion.div 
            className="text-right"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <span className="text-sm text-blue-100">Système actif</span>
              </div>
              <motion.div 
                key={currentTime.getSeconds()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-semibold"
              >
                {currentTime.toLocaleString('fr-FR')}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <main className="space-y-8">
        {/* KPI Cards avec animations améliorées */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
          >
            <EnhancedKPICard
              title="TRS Global"
              value={kpiData?.kpi?.trs || 82.1}
              unit="%"
              trend={{ value: 2.1, isPositive: true }}
              icon={<Gauge className="w-6 h-6" />}
              status="success"
              loading={isLoading}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
          >
            <EnhancedKPICard
              title="Production"
              value={kpiData?.production?.totalProduced || 2480}
              unit=" unités"
              trend={{ value: 5.2, isPositive: true }}
              icon={<BarChart3 className="w-6 h-6" />}
              status={productionProgress >= 95 ? "success" : "warning"}
              loading={isLoading}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
          >
            <EnhancedKPICard
              title="Cadence Actuelle"
              value={kpiData?.production?.currentRate || 103}
              unit=" unités/min"
              trend={{ value: 1.8, isPositive: true }}
              icon={<Clock className="w-6 h-6" />}
              status="success"
              loading={isLoading}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
          >
            <EnhancedKPICard
              title="Temps d'Arrêt"
              value={kpiData?.downtime?.total || 45}
              unit=" min"
              trend={{ value: -12.3, isPositive: true }}
              icon={<AlertTriangle className="w-6 h-6" />}
              status={kpiData?.downtime?.total > 60 ? "error" : "warning"}
              loading={isLoading}
            />
          </motion.div>
        </motion.div>

        {/* Section Graphiques et Alertes avec composants améliorés */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.5
              }
            }
          }}
        >
          {/* Production horaire avec EnhancedChartCard */}
          <motion.div
            className="lg:col-span-2"
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 }
            }}
          >
            <EnhancedChartCard
              title="Production Horaire"
              delay={0}
              loading={isLoading}
              actions={
                <InteractiveButton size="sm" variant="secondary">
                  Actualiser
                </InteractiveButton>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockData.hourlyProduction}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="objectif" 
                    stroke="#94A3B8" 
                    fill="#F1F5F9" 
                    name="Objectif" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="production" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6} 
                    name="Production" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </motion.div>

          {/* Section TRS avec nouveau design */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 }
            }}
          >
            <SmartCard delay={0.1} className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Composants TRS</h3>
            <AnimatedList className="space-y-4" staggerDelay={0.15}>
              {mockData.trsComponents.map((component, index) => (
                <AnimatedListItem key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{component.name}</span>
                    <motion.span 
                      style={{ color: component.color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.2, type: "spring" }}
                    >
                      {component.value}%
                    </motion.span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: component.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${component.value}%` }}
                      transition={{ 
                        delay: 1.5 + index * 0.2, 
                        duration: 1.2, 
                        ease: "easeOut" 
                      }}
                    />
                  </div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
            </SmartCard>
          </motion.div>
        </motion.div>

        {/* Section supplémentaire avec équipements */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.8
              }
            }
          }}
        >
          {/* Status des équipements avec nouveau design */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 }
            }}
          >
            <EnhancedChartCard
              title="Status des Équipements"
              delay={0}
              actions={
                <motion.div
                  animate={{ rotate: [0, 45, -45, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                </motion.div>
              }
            >
            <AnimatedList className="space-y-3" staggerDelay={0.1}>
              {mockData.equipmentStatus.map((equipment, index) => (
                <AnimatedListItem 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={equipment.status === 'running' ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      } : equipment.status === 'warning' ? {
                        scale: [1, 1.1, 1],
                        x: [-2, 2, -2, 0]
                      } : {}}
                      transition={{
                        duration: equipment.status === 'running' ? 2 : 
                                equipment.status === 'warning' ? 0.5 : 0,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {getStatusIcon(equipment.status)}
                    </motion.div>
                    <div>
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-gray-600">
                        Efficacité: 
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.5 + index * 0.1 }}
                          className="font-semibold ml-1"
                        >
                          {equipment.efficiency}%
                        </motion.span>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    className="text-right text-sm text-gray-600"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                  >
                    <div>Dernière maintenance:</div>
                    <div>{new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR')}</div>
                  </motion.div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
            </EnhancedChartCard>
          </motion.div>

          {/* Alertes récentes avec EnhancedAlertCard */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 }
            }}
          >
            <EnhancedAlertCard
              alerts={mockData.alerts}
              delay={0}
            />
          </motion.div>
        </motion.div>

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

        {/* Section finale avec animations améliorées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Zap className="h-8 w-8 text-blue-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-800">Dashboard Modernisé !</h3>
            </div>
            
            <motion.p 
              className="text-blue-700 text-lg mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Interface repensée avec animations fluides et micro-interactions intuitives
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ✨ Animations fluides
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🎯 Micro-interactions
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                📊 Visualisation améliorée
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                ⚡ Temps réel
              </span>
            </motion.div>
            
            <motion.p 
              className="text-sm text-blue-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              Données actualisées automatiquement • Surveillance complète • Expérience utilisateur optimisée
            </motion.p>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}