'use client';

import { motion } from 'framer-motion';
import { SmartCard, SmartLoader } from '@/components/animations/EnhancedAnimations';
import { TrendingUp, TrendingDown, Minus, Activity, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error';
  delay?: number;
  loading?: boolean;
}

export function EnhancedKPICard({
  title,
  value,
  unit = '',
  trend,
  icon,
  status = 'default',
  delay = 0,
  loading = false
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="w-4 h-4" />;
    return trend.isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.value === 0) return 'text-gray-500';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <SmartCard 
      delay={delay} 
      status={status}
      className="p-6 hover:shadow-lg transition-all duration-300"
    >
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <SmartLoader variant="pulse" size="md" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                className={`p-2 rounded-lg ${
                  status === 'success' ? 'bg-green-100 text-green-600' :
                  status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {icon}
              </motion.div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-red-500"
              >
                <AlertTriangle className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
              className="flex items-baseline space-x-1"
            >
              <span className="text-3xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
              </span>
              {unit && (
                <span className="text-sm font-medium text-gray-500">{unit}</span>
              )}
            </motion.div>
            
            {trend && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.4 }}
                className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}
              >
                {getTrendIcon()}
                <span className="font-medium">
                  {Math.abs(trend.value)}% par rapport à hier
                </span>
              </motion.div>
            )}
          </div>
        </>
      )}
    </SmartCard>
  );
}

interface ChartCardProps {
  title: string;
  children: ReactNode;
  delay?: number;
  loading?: boolean;
  actions?: ReactNode;
}

export function EnhancedChartCard({ 
  title, 
  children, 
  delay = 0, 
  loading = false,
  actions 
}: ChartCardProps) {
  return (
    <SmartCard 
      delay={delay} 
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.1 }}
          className="text-lg font-semibold text-gray-900"
        >
          {title}
        </motion.h3>
        {actions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        className="relative"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <SmartLoader variant="bars" size="lg" text="Chargement des données..." />
          </div>
        ) : (
          children
        )}
      </motion.div>
    </SmartCard>
  );
}

interface AlertCardProps {
  alerts: Array<{
    id: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    time: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  delay?: number;
}

export function EnhancedAlertCard({ alerts, delay = 0 }: AlertCardProps) {
  const getAlertColor = (type: string, severity: string) => {
    if (type === 'error' || severity === 'high') return 'border-l-red-500 bg-red-50';
    if (type === 'warning' || severity === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <SmartCard delay={delay} className="p-6">
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay + 0.1 }}
        className="text-lg font-semibold text-gray-900 mb-4"
      >
        Alertes récentes
      </motion.h3>
      
      <motion.div 
        className="space-y-3 max-h-64 overflow-y-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: delay + 0.2
            }
          }
        }}
      >
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            variants={{
              hidden: { opacity: 0, x: -20, scale: 0.95 },
              visible: { opacity: 1, x: 0, scale: 1 }
            }}
            className={`p-3 border-l-4 rounded-r-lg transition-all duration-300 hover:shadow-md cursor-pointer ${getAlertColor(alert.type, alert.severity)}`}
            whileHover={{ x: 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.time}
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-400' :
                  alert.severity === 'medium' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SmartCard>
  );
}